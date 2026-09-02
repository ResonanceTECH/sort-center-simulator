import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import { CTA } from '@/landing/constants/content';
import {
  landingButtonPrimarySx,
  landingButtonSecondarySx,
  sectionInnerSx,
  sectionSx,
} from '@/landing/styles/landingStyles';
import { LANDING } from '@/landing/styles/tokens';

export function CtaSection() {
  return (
    <Box component="section" id={CTA.id} sx={{ ...sectionSx, pb: { xs: 8, md: 10 } }}>
      <Box sx={sectionInnerSx}>
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography
              component="h2"
              sx={{
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 600,
                letterSpacing: '-0.02em',
                lineHeight: 1.28,
                mb: 1.5,
                color: LANDING.ink,
              }}
            >
              {CTA.title}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.9375rem',
                lineHeight: 1.45,
                color: LANDING.muted,
                maxWidth: 480,
                mb: 4,
              }}
            >
              {CTA.subtitle}
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                sx={{ ...landingButtonPrimarySx, minWidth: { sm: 180 } }}
              >
                {CTA.primary}
              </Button>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                sx={{ ...landingButtonSecondarySx, minWidth: { sm: 160 } }}
              >
                {CTA.secondary}
              </Button>
            </Stack>
          </Grid>

          <Grid item xs={12} md={5}>
            <Box
              className="landing-breakthrough-grid"
              sx={{
                height: { xs: 200, md: 280 },
                borderRadius: LANDING.radiusCard,
                background: `linear-gradient(160deg, ${LANDING.slate} 0%, ${LANDING.graphite} 100%)`,
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
