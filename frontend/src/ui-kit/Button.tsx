import { Button as MuiButton, CircularProgress, type ButtonProps as MuiButtonProps } from '@mui/material';
import { kit } from '@/ui-kit/tokens';

export type KitButtonVariant = 'primary' | 'secondary' | 'ghost' | 'ghostPill' | 'navCta' | 'danger';

export interface KitButtonProps extends Omit<MuiButtonProps, 'variant' | 'color'> {
  variant?: KitButtonVariant;
  loading?: boolean;
}

const variantSx: Record<KitButtonVariant, object> = {
  primary: {
    minHeight: 44,
    px: 2,
    py: 1.5,
    fontSize: '0.875rem',
    fontWeight: 400,
    borderRadius: kit.radius.button,
    textTransform: 'none',
    bgcolor: kit.color.obsidian,
    color: kit.color.snow,
    border: '1.5px solid #2c2e34',
    boxShadow: kit.shadow.primary,
    '&:hover': {
      bgcolor: kit.color.graphite,
      boxShadow: kit.shadow.primary,
    },
    '&.Mui-disabled': {
      bgcolor: kit.color.mist,
      color: kit.color.fog,
      borderColor: 'transparent',
      boxShadow: 'none',
    },
  },
  secondary: {
    minHeight: 44,
    px: 2,
    py: 1.5,
    fontSize: '0.875rem',
    fontWeight: 400,
    borderRadius: kit.radius.button,
    textTransform: 'none',
    bgcolor: kit.color.subtle,
    color: kit.color.body,
    border: 'none',
    boxShadow: 'none',
    '&:hover': { bgcolor: kit.color.cloud },
  },
  ghost: {
    minHeight: 44,
    px: 2.5,
    py: 1.25,
    fontSize: '0.875rem',
    fontWeight: 400,
    borderRadius: kit.radius.button,
    textTransform: 'none',
    bgcolor: kit.color.snow,
    color: kit.color.iron,
    border: `1px solid ${kit.color.iron}`,
    boxShadow: 'none',
    '&:hover': {
      bgcolor: kit.color.subtle,
      borderColor: kit.color.iron,
    },
  },
  ghostPill: {
    minHeight: 44,
    px: 2.5,
    py: 1.25,
    fontSize: '0.875rem',
    fontWeight: 400,
    borderRadius: kit.radius.pill,
    textTransform: 'none',
    bgcolor: kit.color.snow,
    color: kit.color.iron,
    border: `1px solid ${kit.color.iron}`,
    boxShadow: 'none',
    '&:hover': {
      bgcolor: kit.color.subtle,
      borderColor: kit.color.iron,
    },
  },
  navCta: {
    minHeight: 44,
    px: 2.5,
    py: 1.5,
    fontSize: '0.875rem',
    fontWeight: 400,
    borderRadius: kit.radius.pill,
    textTransform: 'none',
    bgcolor: kit.color.obsidian,
    color: kit.color.snow,
    border: '1.5px solid #2c2e34',
    boxShadow: kit.shadow.primary,
    '&:hover': {
      bgcolor: kit.color.graphite,
      boxShadow: kit.shadow.primary,
    },
  },
  danger: {
    minHeight: 44,
    px: 2,
    py: 1.5,
    fontSize: '0.875rem',
    fontWeight: 400,
    borderRadius: kit.radius.button,
    textTransform: 'none',
    bgcolor: kit.color.ink,
    color: kit.color.snow,
    border: `1px solid ${kit.color.ink}`,
    boxShadow: 'none',
    '&:hover': { bgcolor: kit.color.graphite },
  },
};

export function KitButton({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  sx,
  ...props
}: KitButtonProps) {
  return (
    <MuiButton
      disableElevation
      disabled={disabled || loading}
      sx={[variantSx[variant], ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      {...props}
    >
      {loading ? <CircularProgress size={20} color="inherit" /> : children}
    </MuiButton>
  );
}
