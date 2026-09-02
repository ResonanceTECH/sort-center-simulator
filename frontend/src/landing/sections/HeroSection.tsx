import { Box } from '@mui/material';
import { HalftoneBackground } from '@/landing/components/HalftoneBackground';
import { HERO } from '@/landing/constants/content';

export function HeroSection() {
  return (
    <Box component="section" id={HERO.id} className="landing-hero-openserv">
      <Box className="landing-hero-openserv__bg" aria-hidden>
        <HalftoneBackground />
        <Box className="landing-hero-openserv__bg-fade" />
      </Box>

      <Box className="landing-hero-openserv__content">
        <h1 className="landing-hero-openserv__title">
          <span className="landing-hero-openserv__title-line">{HERO.headlineLine1}</span>
          <span className="landing-hero-openserv__title-line">{HERO.headlineLine2}</span>
        </h1>

        <p className="landing-hero-openserv__subtitle">{HERO.subtitle}</p>
      </Box>
    </Box>
  );
}
