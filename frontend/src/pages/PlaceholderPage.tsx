import { Box, Typography } from '@mui/material';
import { AppLayout } from '@/layouts/AppLayout';
import { TopBar } from '@/components/general/TopBar';
import { LANDING } from '@/landing/styles/tokens';

interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <AppLayout topBar={<TopBar notifications={[]} />}>
      <Box sx={{ maxWidth: 560 }}>
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: '1.75rem', md: '2rem' },
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: LANDING.ink,
            mb: 1,
          }}
        >
          {title}
        </Typography>
        <Typography sx={{ color: LANDING.muted, fontSize: '0.9375rem', lineHeight: 1.5 }}>
          Раздел в разработке
        </Typography>
      </Box>
    </AppLayout>
  );
}
