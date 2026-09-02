import { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { Reveal } from '@/landing/components/Reveal';
import { FLOW } from '@/landing/constants/content';
import {
  cardSx,
  sectionInnerSx,
  sectionSubtitleSx,
  sectionSx,
  sectionTitleSx,
} from '@/landing/styles/landingStyles';
import { LANDING } from '@/landing/styles/tokens';

export function HowItWorksSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStep = FLOW.steps[activeIndex];

  return (
    <Box component="section" id={FLOW.id} sx={sectionSx}>
      <Box sx={sectionInnerSx}>
        <Reveal>
          <Typography component="h2" sx={sectionTitleSx}>
            {FLOW.title}
          </Typography>
          <Typography sx={{ ...sectionSubtitleSx, mt: -1 }}>{FLOW.subtitle}</Typography>
        </Reveal>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1.1fr' },
            gap: { xs: 3, md: 4 },
            alignItems: 'start',
          }}
        >
          <Stack spacing={1}>
            {FLOW.steps.map((step, index) => {
              const isActive = index === activeIndex;
              return (
                <Box
                  key={step.title}
                  component="button"
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  sx={{
                    textAlign: 'left',
                    cursor: 'pointer',
                    border: 'none',
                    bgcolor: isActive ? LANDING.snow : 'transparent',
                    borderRadius: LANDING.radiusCard,
                    p: 2.5,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: isActive ? LANDING.border : 'transparent',
                    transition: 'background-color 0.2s ease, border-color 0.2s ease',
                    fontFamily: 'inherit',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: LANDING.muted,
                      mb: 0.5,
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: LANDING.ink,
                      mb: 0.5,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography sx={{ fontSize: '0.9375rem', lineHeight: 1.45, color: LANDING.muted }}>
                    {step.text}
                  </Typography>
                </Box>
              );
            })}
          </Stack>

          <Box sx={cardSx}>
            <Box
              component="img"
              src={activeStep.image}
              alt={activeStep.title}
              sx={{
                display: 'block',
                width: '100%',
                minHeight: { xs: 220, md: 360 },
                objectFit: 'cover',
                objectPosition: 'top center',
                bgcolor: LANDING.subtle,
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
