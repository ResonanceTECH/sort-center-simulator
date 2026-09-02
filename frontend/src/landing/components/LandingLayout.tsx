import type { ReactNode } from 'react';
import { FloatingBottomNav } from '@/landing/components/FloatingBottomNav';
import { LandingFooter } from '@/landing/components/LandingFooter';
import { landingPageSx } from '@/landing/styles/landingStyles';
import '@/landing/styles/landing.css';
import { Box } from '@mui/material';

interface LandingLayoutProps {
  children: ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <Box sx={{ ...landingPageSx, bgcolor: '#ffffff' }}>
      <Box component="main" sx={{ pb: { xs: 12, md: 14 } }}>
        {children}
      </Box>
      <LandingFooter />
      <FloatingBottomNav />
    </Box>
  );
}
