import { Box, type BoxProps } from '@mui/material';
import { kit } from '@/ui-kit/tokens';

export type KitBadgeVariant = 'accent' | 'filled' | 'outline' | 'success' | 'muted';

export interface KitBadgeProps extends BoxProps {
  variant?: KitBadgeVariant;
}

const variantSx: Record<KitBadgeVariant, object> = {
  accent: {
    color: kit.color.snow,
    bgcolor: kit.color.ember,
    border: '1px solid transparent',
    fontWeight: 500,
  },
  filled: {
    color: kit.color.subtle,
    bgcolor: kit.color.iron,
    border: '1px solid transparent',
    fontWeight: 400,
  },
  outline: {
    color: kit.color.body,
    bgcolor: 'transparent',
    border: `1px solid ${kit.color.border}`,
    fontWeight: 400,
  },
  success: {
    color: kit.color.success,
    bgcolor: kit.color.successBg,
    border: `1px solid ${kit.color.successBorder}`,
    fontWeight: 500,
  },
  muted: {
    color: kit.color.muted,
    bgcolor: kit.color.paper,
    border: `1px solid ${kit.color.border}`,
    fontWeight: 400,
  },
};

export function KitBadge({ variant = 'outline', sx, children, ...props }: KitBadgeProps) {
  return (
    <Box
      component="span"
      sx={[
        {
          display: 'inline-flex',
          alignItems: 'center',
          px: 1,
          py: 0.5,
          borderRadius: kit.radius.badge,
          fontSize: '0.75rem',
          lineHeight: 1.2,
          fontFamily: kit.font.sans,
        },
        variantSx[variant],
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...props}
    >
      {children}
    </Box>
  );
}

/** Alias for landing-style tags */
export function KitTag(props: KitBadgeProps) {
  return <KitBadge {...props} sx={{ fontSize: '0.8125rem', ...((props.sx as object) ?? {}) }} />;
}
