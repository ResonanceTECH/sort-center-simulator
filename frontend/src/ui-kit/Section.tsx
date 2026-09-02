import { Box, type BoxProps } from '@mui/material';
import { kit } from '@/ui-kit/tokens';

export type KitDividerProps = BoxProps;

export function KitDivider({ sx, ...props }: KitDividerProps) {
  return (
    <Box
      component="hr"
      sx={[
        {
          border: 'none',
          borderTop: `1px solid ${kit.color.border}`,
          m: 0,
          width: '100%',
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...props}
    />
  );
}

export interface KitSectionProps extends BoxProps {
  dark?: boolean;
}

export function KitSection({ dark = false, sx, children, ...props }: KitSectionProps) {
  return (
    <Box
      component="section"
      sx={[
        {
          py: { xs: 7, md: `${kit.space.sectionGap}px` },
          px: kit.space.pageX,
          bgcolor: dark ? kit.color.darkSurface : 'transparent',
          color: dark ? kit.color.snow : kit.color.ink,
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...props}
    >
      {children}
    </Box>
  );
}
