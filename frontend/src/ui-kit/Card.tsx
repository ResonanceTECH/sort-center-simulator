import { Paper, type PaperProps } from '@mui/material';
import { kit } from '@/ui-kit/tokens';

export type KitCardVariant = 'marketing' | 'panel' | 'flat';

export interface KitCardProps extends Omit<PaperProps, 'variant'> {
  variant?: KitCardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const radiusByVariant: Record<KitCardVariant, string> = {
  marketing: kit.radius.card,
  panel: kit.radius.panel,
  flat: kit.radius.button,
};

const paddingBySize = {
  none: 0,
  sm: 2,
  md: 2.5,
  lg: `${kit.space.cardPadding}px`,
} as const;

export function KitCard({
  variant = 'panel',
  padding = 'md',
  sx,
  children,
  ...props
}: KitCardProps) {
  return (
    <Paper
      elevation={0}
      sx={[
        {
          borderRadius: radiusByVariant[variant],
          bgcolor: kit.color.card,
          border: `1px solid ${kit.color.border}`,
          boxShadow: 'none',
          overflow: 'hidden',
          p: paddingBySize[padding],
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...props}
    >
      {children}
    </Paper>
  );
}
