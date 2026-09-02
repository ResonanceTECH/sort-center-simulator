import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';

interface RevealProps {
  children: ReactNode;
  delayMs?: number;
}

export function Reveal({ children, delayMs = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.14, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={ref}
      className={visible ? 'landing-reveal-visible' : undefined}
      sx={{
        opacity: visible ? undefined : 0,
        animationDelay: visible ? `${delayMs}ms` : undefined,
      }}
    >
      {children}
    </Box>
  );
}
