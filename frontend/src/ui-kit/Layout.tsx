import type { ReactNode } from 'react';
import { Box, type BoxProps } from '@mui/material';
import { kit } from '@/ui-kit/tokens';
import { containerSx } from '@/ui-kit/styles';

export interface KitContainerProps extends BoxProps {
  /** Constrain to kit max width (1200) with landing page gutters */
  gutters?: boolean;
}

export function KitContainer({ gutters = true, sx, children, ...props }: KitContainerProps) {
  return (
    <Box
      sx={[
        gutters
          ? containerSx
          : {
              width: '100%',
              maxWidth: kit.layout.maxWidth,
              mx: 'auto',
            },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...props}
    >
      {children}
    </Box>
  );
}

export interface KitPageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  mb?: number;
}

export function KitPageHeader({ title, subtitle, action, mb = 3 }: KitPageHeaderProps) {
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
        <Box
          component="h1"
          sx={{
            ...kit.typography.pageTitle,
            color: kit.color.ink,
            fontFamily: kit.font.sans,
            m: 0,
            mb: subtitle ? 1 : 0,
          }}
        >
          {title}
        </Box>
        {subtitle != null && subtitle !== false && (
          <Box
            component="p"
            sx={{
              ...kit.typography.body,
              color: kit.color.muted,
              m: 0,
            }}
          >
            {subtitle}
          </Box>
        )}
      </Box>
      {action != null && (
        <Box sx={{ flexShrink: 0, alignSelf: { sm: 'center' } }}>{action}</Box>
      )}
    </Box>
  );
}
