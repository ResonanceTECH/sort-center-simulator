import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { LANDING } from '@/landing/styles/tokens';

interface WorkspacePageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  mb?: number;
}

export function WorkspacePageHeader({
  title,
  subtitle,
  action,
  mb = 3,
}: WorkspacePageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: { xs: 'stretch', sm: 'flex-start' },
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        mb,
      }}
    >
      <Box sx={{ maxWidth: 640, minWidth: 0 }}>
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: '1.5rem', md: '1.75rem' },
            fontWeight: 600,
            color: LANDING.ink,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            mb: subtitle ? 1 : 0,
          }}
        >
          {title}
        </Typography>
        {subtitle != null && subtitle !== false && (
          <Typography
            sx={{
              fontSize: '0.9375rem',
              color: LANDING.muted,
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {action != null && (
        <Box sx={{ flexShrink: 0, alignSelf: { sm: 'center' } }}>{action}</Box>
      )}
    </Box>
  );
}
