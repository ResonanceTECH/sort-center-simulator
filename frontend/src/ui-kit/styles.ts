import type { SxProps, Theme } from '@mui/material';
import { kit } from '@/ui-kit/tokens';

export const pageShellSx: SxProps<Theme> = {
  minHeight: '100vh',
  bgcolor: kit.color.canvas,
  color: kit.color.ink,
  fontFamily: kit.font.sans,
};

export const containerSx: SxProps<Theme> = {
  width: '100%',
  maxWidth: kit.layout.maxWidth,
  mx: 'auto',
  px: kit.space.pageX,
};

export const cardSx: SxProps<Theme> = {
  borderRadius: kit.radius.card,
  bgcolor: kit.color.card,
  border: `1px solid ${kit.color.border}`,
  boxShadow: 'none',
  overflow: 'hidden',
};

export const panelSx: SxProps<Theme> = {
  borderRadius: kit.radius.panel,
  bgcolor: kit.color.card,
  border: `1px solid ${kit.color.border}`,
  boxShadow: 'none',
};

export const displayTitleSx: SxProps<Theme> = {
  ...kit.typography.display,
  color: kit.color.ink,
  fontFamily: kit.font.display,
};

export const sectionTitleSx: SxProps<Theme> = {
  ...kit.typography.sectionTitle,
  color: kit.color.ink,
  mb: 2,
};

export const pageTitleSx: SxProps<Theme> = {
  ...kit.typography.pageTitle,
  color: kit.color.ink,
};

export const bodySx: SxProps<Theme> = {
  ...kit.typography.body,
  color: kit.color.body,
};

export const mutedSx: SxProps<Theme> = {
  ...kit.typography.body,
  color: kit.color.muted,
};
