import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { Sidebar } from '@/components/general/Sidebar';
import { SIDEBAR_WIDTH } from '@/theme';

interface AppLayoutProps {
  children: ReactNode;
  topBar: ReactNode;
}

export function AppLayout({ children, topBar }: AppLayoutProps) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
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
            p: { xs: 2, sm: 2.5, lg: 3.5 },
            overflow: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
