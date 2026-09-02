import { useEffect, useRef } from 'react';

const DOT_SPACING = 12;
const MAX_DOT_RATIO = 0.48;
const DOT_RGB = '59, 130, 246'; // blue-500

function brightnessAt(
  x: number,
  y: number,
  width: number,
  height: number,
  time: number,
) {
  const waveX = Math.sin(x * 0.0075 + time * 0.85) * 0.5 + 0.5;
  const waveY = Math.sin(y * 0.0085 - time * 0.62) * 0.5 + 0.5;

  const centerX = width * 0.5 + Math.sin(time * 0.33) * width * 0.2;
  const centerY = height * 0.28 + Math.cos(time * 0.27) * height * 0.12;
  const distance = Math.hypot(x - centerX, y - centerY);
  const radial = Math.sin(distance * 0.016 - time * 1.6) * 0.5 + 0.5;

  return (waveX + waveY + radial) / 3;
}

function cornerBoost(x: number, y: number, width: number, height: number) {
  const topLeft = 1 - Math.min(1, Math.hypot(x, y * 1.1) / (width * 0.55));
  const topRight = 1 - Math.min(1, Math.hypot(width - x, y * 1.1) / (width * 0.55));
  const corners = Math.max(topLeft, topRight);
  const topFade = 1 - Math.min(1, y / (height * 0.92));
  return corners * 0.65 + topFade * 0.35;
}

function drawHalftone(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const maxRadius = DOT_SPACING * MAX_DOT_RATIO;

  for (let y = DOT_SPACING / 2; y < height; y += DOT_SPACING) {
    for (let x = DOT_SPACING / 2; x < width; x += DOT_SPACING) {
      const corners = cornerBoost(x, y, width, height);
      const verticalFade = 1 - Math.max(0, (y - height * 0.45) / (height * 0.55)) * 0.9;
      const density = corners * verticalFade;
      if (density <= 0.03) continue;

      const brightness = brightnessAt(x, y, width, height, time);
      const radius = brightness * maxRadius * density;
      if (radius < 0.3) continue;

      const alpha = (0.22 + brightness * 0.58) * density;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${DOT_RGB}, ${Math.min(0.85, alpha)})`;
      ctx.fill();
    }
  }
}

export function HalftoneBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const startTime = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = (now: number) => {
      const rect = canvas.getBoundingClientRect();
      const time = reducedMotion ? 0 : (now - startTime) / 1000;
      drawHalftone(ctx, rect.width, rect.height, time);

      if (!reducedMotion) {
        frameRef.current = requestAnimationFrame(render);
      }
    };

    resize();
    render(performance.now());

    const onResize = () => {
      resize();
      render(performance.now());
    };

    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="landing-halftone-bg" aria-hidden />;
}
