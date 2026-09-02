/**
 * Pryzm Studio export params:
 * https://pryzm.design/studio#s=0&c=124ba5:0,054599:25,124ba5:50,a3a3a3:75,f5f5f5:100&a=220&dc=18&da=0.55&d=1
 */
export const PRYZM_STUDIO = {
  gradient: {
    angle: 220,
    stops: [
      { color: '#124ba5', at: '0%' },
      { color: '#054599', at: '25%' },
      { color: '#124ba5', at: '50%' },
      { color: '#a3a3a3', at: '75%' },
      { color: '#f5f5f5', at: '100%' },
    ],
  },
  dots: {
    cell: 18,
    alpha: 0.55,
    shadow: 0.3,
    highlight: 0.12,
    blur: 0.5,
  },
  surface: '#f5f5f5',
} as const;

export function pryzmGradientCss(): string {
  const { angle, stops } = PRYZM_STUDIO.gradient;
  const line = stops.map((s) => `${s.color} ${s.at}`).join(', ');
  return `linear-gradient(${angle}deg, ${line})`;
}
