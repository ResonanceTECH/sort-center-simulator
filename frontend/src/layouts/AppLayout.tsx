import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { Sidebar } from '@/components/general/Sidebar';
import { LANDING } from '@/landing/styles/tokens';
import { PAGE_MAX_WIDTH, SIDEBAR_WIDTH } from '@/theme';

interface AppLayoutProps {
  children: ReactNode;
  topBar: ReactNode;
}

export function AppLayout({ children, topBar }: AppLayoutProps) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: LANDING.canvas }}>
      <Sidebar />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          ml: { md: `${SIDEBAR_WIDTH}px` },
        }}
      >
        {topBar}
        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: PAGE_MAX_WIDTH,
            mx: 'auto',
            px: { xs: 2.5, sm: 4, md: 5 },
            py: { xs: 3, md: 4 },
            overflow: 'auto',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
