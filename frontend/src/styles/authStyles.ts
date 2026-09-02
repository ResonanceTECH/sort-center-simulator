import { LANDING, landingFont } from '@/landing/styles/tokens';

export const AUTH_COLORS = {
  primary: LANDING.obsidian,
  primaryHover: LANDING.graphite,
  secondary: LANDING.ember,
  text: LANDING.ink,
  subtitle: LANDING.muted,
  border: LANDING.border,
  footer: LANDING.faint,
  overlay: 'rgba(244, 244, 245, 0.72)',
  soft: LANDING.paper,
} as const;

export const PILL_RADIUS = LANDING.radiusPill;

export const AUTH_FIELD_HEIGHT = 52;

export const pillFieldSx = {
  width: '100%',
  fontFamily: landingFont,
  '& .MuiOutlinedInput-root': {
    borderRadius: LANDING.radiusButton,
    backgroundColor: LANDING.snow,
    fontSize: '0.9375rem',
    minHeight: AUTH_FIELD_HEIGHT,
    width: '100%',
    '& fieldset': {
      borderColor: AUTH_COLORS.border,
    },
    '&:hover fieldset': {
      borderColor: LANDING.ash,
    },
    '&.Mui-focused fieldset': {
      borderColor: AUTH_COLORS.primary,
      borderWidth: 1,
    },
    '&.Mui-error fieldset': {
      borderColor: LANDING.ink,
      borderWidth: 1.5,
    },
    '&.Mui-error': {
      backgroundColor: LANDING.subtle,
    },
    '& input, & .MuiOutlinedInput-input': {
      py: 1.75,
      px: 2.25,
      boxSizing: 'border-box',
      color: LANDING.ink,
      '&::placeholder': {
        color: LANDING.fog,
        opacity: 1,
      },
    },
  },
  '& .MuiFormHelperText-root': {
    mx: 1.5,
    mt: 0.75,
    color: LANDING.muted,
    '&.Mui-error': {
      color: LANDING.ink,
    },
  },
};

export const pillButtonSx = {
  borderRadius: LANDING.radiusButton,
  py: 1.75,
  minHeight: AUTH_FIELD_HEIGHT,
  width: '100%',
  fontSize: '0.9375rem',
  fontWeight: 400,
  textTransform: 'none' as const,
  backgroundColor: LANDING.obsidian,
  color: LANDING.snow,
  border: '1.5px solid #2c2e34',
  boxShadow: LANDING.shadowPrimary,
  '&:hover': {
    backgroundColor: LANDING.graphite,
    boxShadow: LANDING.shadowPrimary,
  },
  '&:focus-visible': {
    boxShadow: '0 0 0 4px rgba(9, 9, 11, 0.16)',
  },
  '&.Mui-disabled': {
    backgroundColor: LANDING.mist,
    color: LANDING.fog,
    borderColor: 'transparent',
    boxShadow: 'none',
  },
};

export const authTitleSx = {
  textAlign: 'center' as const,
  fontFamily: landingFont,
  fontWeight: 600,
  fontSize: { xs: '1.75rem', sm: '2rem' },
  letterSpacing: '-0.02em',
  textTransform: 'none' as const,
  color: LANDING.ink,
  lineHeight: 1.2,
  mb: 1.25,
  px: 1,
};

export const authSubtitleSx = {
  textAlign: 'center' as const,
  fontSize: '0.9375rem',
  lineHeight: 1.5,
  color: AUTH_COLORS.subtitle,
  mb: 3.5,
  px: 1,
  maxWidth: 420,
  mx: 'auto',
};

export const authCardSx = {
  position: 'relative' as const,
  zIndex: 1,
  width: '100%',
  maxWidth: 440,
  minWidth: 0,
  boxSizing: 'border-box' as const,
  px: { xs: 3, sm: 4.5 },
  py: { xs: 4, sm: 5 },
  borderRadius: LANDING.radiusCard,
  backgroundColor: LANDING.snow,
  boxShadow: 'none',
  border: `1px solid ${LANDING.border}`,
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
  flexDirection: 'column' as const,
  gap: authFormGap,
  width: '100%',
};
