import type { SxProps, Theme } from '@mui/material';
import { LANDING, landingFont } from '@/landing/styles/tokens';

export const landingPageSx: SxProps<Theme> = {
  minHeight: '100vh',
  bgcolor: LANDING.canvas,
  color: LANDING.ink,
  fontFamily: landingFont,
};

export const sectionSx: SxProps<Theme> = {
  py: { xs: 7, md: `${LANDING.sectionGap}px` },
  px: { xs: 2.5, sm: 4, md: 5 },
};

export const sectionInnerSx: SxProps<Theme> = {
  maxWidth: LANDING.maxWidth,
  mx: 'auto',
};

export const displayTitleSx: SxProps<Theme> = {
  fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem', lg: '4rem' },
  fontWeight: 600,
  letterSpacing: '-0.02em',
  lineHeight: 1.12,
  color: LANDING.ink,
};

export const sectionTitleSx: SxProps<Theme> = {
  fontSize: { xs: '2rem', md: '2.5rem' },
  fontWeight: 600,
  letterSpacing: '-0.02em',
  lineHeight: 1.28,
  color: LANDING.ink,
  mb: 2,
};

export const sectionSubtitleSx: SxProps<Theme> = {
  fontSize: { xs: '0.9375rem', md: '1rem' },
  lineHeight: 1.45,
  color: LANDING.muted,
  maxWidth: 560,
  mb: 4,
};

export const bodyTextSx: SxProps<Theme> = {
  fontSize: '0.9375rem',
  lineHeight: 1.45,
  color: LANDING.body,
};

export const cardSx: SxProps<Theme> = {
  borderRadius: LANDING.radiusCard,
  bgcolor: LANDING.card,
  border: `1px solid ${LANDING.border}`,
  boxShadow: 'none',
  overflow: 'hidden',
};

export const tagPillSx: SxProps<Theme> = {
  display: 'inline-flex',
  alignItems: 'center',
  px: 1,
  py: 0.5,
  borderRadius: LANDING.radiusBadge,
  fontSize: '0.8125rem',
  fontWeight: 400,
  color: LANDING.body,
  border: `1px solid ${LANDING.border}`,
  bgcolor: 'transparent',
};

export const filledTagSx: SxProps<Theme> = {
  display: 'inline-flex',
  alignItems: 'center',
  px: 1,
  py: 0.5,
  borderRadius: LANDING.radiusBadge,
  fontSize: '0.8125rem',
  fontWeight: 400,
  color: LANDING.subtle,
  bgcolor: LANDING.iron,
};

export const accentBadgeSx: SxProps<Theme> = {
  display: 'inline-flex',
  alignItems: 'center',
  px: 1,
  py: 0.5,
  borderRadius: LANDING.radiusBadge,
  fontSize: '0.75rem',
  fontWeight: 500,
  color: LANDING.snow,
  bgcolor: LANDING.ember,
};

export const landingButtonPrimarySx: SxProps<Theme> = {
  minHeight: 44,
  px: 2,
  py: 1.5,
  fontSize: '0.875rem',
  fontWeight: 400,
  borderRadius: LANDING.radiusButton,
  textTransform: 'none',
  bgcolor: LANDING.obsidian,
  color: LANDING.snow,
  border: '1.5px solid #2c2e34',
  boxShadow: LANDING.shadowPrimary,
  '&:hover': {
    bgcolor: LANDING.graphite,
    boxShadow: LANDING.shadowPrimary,
  },
};

export const landingButtonSecondarySx: SxProps<Theme> = {
  minHeight: 44,
  px: 2,
  py: 1.5,
  fontSize: '0.875rem',
  fontWeight: 400,
  borderRadius: LANDING.radiusButton,
  textTransform: 'none',
  bgcolor: LANDING.subtle,
  color: LANDING.body,
  border: 'none',
  boxShadow: 'none',
  '&:hover': {
    bgcolor: LANDING.cloud,
  },
};

export const landingButtonGhostPillSx: SxProps<Theme> = {
  minHeight: 44,
  px: 2.5,
  py: 1.25,
  fontSize: '0.875rem',
  fontWeight: 400,
  borderRadius: LANDING.radiusPill,
  textTransform: 'none',
  bgcolor: LANDING.snow,
  color: LANDING.iron,
  border: `1px solid ${LANDING.iron}`,
  boxShadow: 'none',
  '&:hover': {
    bgcolor: LANDING.subtle,
    borderColor: LANDING.iron,
  },
};

export const landingButtonNavCtaSx: SxProps<Theme> = {
  ...landingButtonPrimarySx,
  borderRadius: LANDING.radiusPill,
  px: 2.5,
};

export const landingButtonWhiteGhostSx: SxProps<Theme> = {
  minHeight: 44,
  px: 2.5,
  py: 1.25,
  fontSize: '0.875rem',
  fontWeight: 400,
  borderRadius: LANDING.radiusPill,
  textTransform: 'none',
  bgcolor: LANDING.snow,
  color: LANDING.iron,
  border: `1px solid ${LANDING.snow}`,
  boxShadow: 'none',
  '&:hover': {
    bgcolor: LANDING.subtle,
  },
};

export const headerSx: SxProps<Theme> = {
  position: 'sticky',
  top: 0,
  zIndex: 1100,
  bgcolor: LANDING.snow,
};

export const footerSx: SxProps<Theme> = {
  py: 4,
  px: { xs: 2.5, sm: 4, md: 5 },
  borderTop: `1px solid ${LANDING.border}`,
  bgcolor: LANDING.canvas,
};
