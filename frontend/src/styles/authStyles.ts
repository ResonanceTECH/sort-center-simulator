import { OZON } from '@/theme';

export const AUTH_COLORS = {
  primary: OZON.blue,
  primaryHover: OZON.blue,
  secondary: OZON.morningBlue,
  text: OZON.darkSpace,
  subtitle: 'rgba(0, 26, 52, 0.64)',
  border: 'rgba(0, 26, 52, 0.20)',
  footer: 'rgba(0, 26, 52, 0.44)',
  overlay: 'rgba(0, 26, 52, 0.40)',
  soft: 'rgba(0, 91, 255, 0.08)',
} as const;

export const PILL_RADIUS = '999px';

export const AUTH_FIELD_HEIGHT = 52;

export const pillFieldSx = {
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: PILL_RADIUS,
    backgroundColor: OZON.white,
    fontSize: '0.9375rem',
    minHeight: AUTH_FIELD_HEIGHT,
    width: '100%',
    '& fieldset': {
      borderColor: AUTH_COLORS.border,
    },
    '&:hover fieldset': {
      borderColor: 'rgba(0, 91, 255, 0.56)',
    },
    '&.Mui-focused fieldset': {
      borderColor: AUTH_COLORS.primary,
      borderWidth: 1,
    },
    '&.Mui-error fieldset': {
      borderColor: OZON.darkSpace,
      borderWidth: 2,
    },
    '&.Mui-error': {
      backgroundColor: 'rgba(0, 26, 52, 0.04)',
    },
    '& input, & .MuiOutlinedInput-input': {
      py: 1.75,
      px: 2.5,
      boxSizing: 'border-box',
      color: OZON.darkSpace,
      '&::placeholder': {
        color: 'rgba(0, 26, 52, 0.44)',
        opacity: 1,
      },
    },
  },
  '& .MuiFormHelperText-root': {
    mx: 2.5,
    mt: 0.75,
    color: 'rgba(0, 26, 52, 0.64)',
    '&.Mui-error': {
      color: OZON.darkSpace,
    },
  },
};

export const pillButtonSx = {
  borderRadius: PILL_RADIUS,
  py: 1.75,
  minHeight: AUTH_FIELD_HEIGHT,
  width: '100%',
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none' as const,
  boxShadow: 'none',
  backgroundColor: AUTH_COLORS.primary,
  color: OZON.white,
  border: `1px solid ${AUTH_COLORS.primary}`,
  '&:hover': {
    background: `linear-gradient(135deg, ${OZON.blue}, ${OZON.morningBlue})`,
    boxShadow: 'none',
  },
  '&:focus-visible': {
    boxShadow: '0 0 0 4px rgba(0, 162, 255, 0.24)',
  },
  '&.Mui-disabled': {
    backgroundColor: 'rgba(0, 91, 255, 0.32)',
    color: 'rgba(255, 255, 255, 0.72)',
  },
};

export const authTitleSx = {
  textAlign: 'center',
  fontWeight: 700,
  fontSize: { xs: '1.125rem', sm: '1.25rem' },
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: AUTH_COLORS.primary,
  lineHeight: 1.35,
  mb: 1.5,
  px: 3,
};

export const authSubtitleSx = {
  textAlign: 'center',
  fontSize: '0.875rem',
  lineHeight: 1.55,
  color: AUTH_COLORS.subtitle,
  mb: 3.5,
  px: 1,
};

export const authCardSx = {
  position: 'relative',
  zIndex: 1,
  width: 'calc(100% - 32px)',
  maxWidth: 440,
  minWidth: 320,
  boxSizing: 'border-box',
  px: { xs: 3, sm: 4.5 },
  py: { xs: 4, sm: 5 },
  borderRadius: '24px',
  backgroundColor: OZON.white,
  boxShadow: '0 20px 60px rgba(0, 26, 52, 0.16), 0 8px 24px rgba(0, 26, 52, 0.08)',
  border: '1px solid rgba(0, 26, 52, 0.12)',
};

export const authCardWideSx = {
  ...authCardSx,
  maxWidth: 720,
};

export const authFormGap = 2;

export const registerFieldsGridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
  gap: authFormGap,
  width: '100%',
  '& > *': {
    minWidth: 0,
    width: '100%',
  },
};

export const authFormSx = {
  display: 'flex',
  flexDirection: 'column',
  gap: authFormGap,
  width: '100%',
};
