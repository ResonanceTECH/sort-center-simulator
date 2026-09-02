import { Link as RouterLink } from 'react-router-dom';
import { ArrowForwardOutlined } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';
import { DARK_FEATURES } from '@/landing/constants/content';
import {
  landingButtonWhiteGhostSx,
  sectionInnerSx,
  sectionSx,
} from '@/landing/styles/landingStyles';
import { LANDING } from '@/landing/styles/tokens';

export function DarkFeaturesSection() {
  return (
    <Box component="section" sx={sectionSx}>
      <Box
        sx={{
          ...sectionInnerSx,
          borderRadius: LANDING.radiusCard,
          bgcolor: LANDING.darkCard,
          p: { xs: 3, md: `${LANDING.cardPadding}px` },
        }}
      >
        <Typography
          component="h2"
          sx={{
            fontSize: { xs: '1.75rem', md: '2rem' },
            fontWeight: 700,
            color: LANDING.snow,
            mb: 3,
            letterSpacing: '-0.02em',
          }}
        >
          {DARK_FEATURES.title}
        </Typography>

        <Stack spacing={2} sx={{ mb: 4 }}>
          {DARK_FEATURES.items.map((item) => (
            <Stack key={item} direction="row" spacing={1.5} alignItems="flex-start">
              <ArrowForwardOutlined sx={{ fontSize: 20, color: LANDING.snow, mt: 0.25, opacity: 0.85 }} />
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 500, color: LANDING.snow, lineHeight: 1.45 }}>
                {item}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Button component={RouterLink} to="/register" variant="contained" sx={landingButtonWhiteGhostSx}>
          {DARK_FEATURES.cta}
        </Button>
      </Box>
    </Box>
  );
}
