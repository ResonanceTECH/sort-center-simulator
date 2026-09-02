import { createTheme } from '@mui/material/styles';
import { LANDING, landingFont } from '@/landing/styles/tokens';

/** @deprecated Use LANDING / theme palette. Kept so existing OZON.* imports keep working. */
export const OZON = {
  blue: LANDING.obsidian,
  darkSpace: LANDING.ink,
  morningBlue: LANDING.steel,
  white: LANDING.snow,
} as const;

export const SIDEBAR_WIDTH = 240;
export const PAGE_MAX_WIDTH = LANDING.maxWidth;

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: LANDING.obsidian,
      light: LANDING.paper,
      dark: LANDING.graphite,
      contrastText: LANDING.snow,
    },
    secondary: {
      main: LANDING.ember,
      light: 'rgba(255, 90, 0, 0.10)',
      dark: '#e04f00',
      contrastText: LANDING.snow,
    },
    background: {
      default: LANDING.canvas,
      paper: LANDING.snow,
    },
    text: {
      primary: LANDING.ink,
      secondary: LANDING.muted,
      disabled: LANDING.ash,
    },
    divider: LANDING.border,
    action: {
      hover: 'rgba(9, 9, 11, 0.04)',
      selected: 'rgba(9, 9, 11, 0.08)',
      disabled: LANDING.ash,
      disabledBackground: LANDING.cloud,
      focus: 'rgba(9, 9, 11, 0.12)',
    },
    info: {
      main: LANDING.obsidian,
      contrastText: LANDING.snow,
    },
    success: {
      main: '#3f7d4e',
      contrastText: LANDING.snow,
    },
    warning: {
      main: LANDING.ember,
      contrastText: LANDING.snow,
    },
    error: {
      main: LANDING.ink,
      contrastText: LANDING.snow,
    },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: landingFont,
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem',
      letterSpacing: '-0.02em',
      color: LANDING.ink,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      letterSpacing: '-0.02em',
      color: LANDING.ink,
    },
    h6: {
      fontWeight: 600,
      fontSize: '0.9375rem',
      color: LANDING.ink,
    },
    body1: { color: LANDING.body },
    body2: { fontSize: '0.8125rem', color: LANDING.body },
    caption: { fontSize: '0.75rem', color: LANDING.faint },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: LANDING.canvas,
          color: LANDING.ink,
          fontFamily: landingFont,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: LANDING.radiusButton,
          boxShadow: 'none',
          fontWeight: 400,
          '&:hover': { boxShadow: 'none' },
        },
        containedPrimary: {
          backgroundColor: LANDING.obsidian,
          color: LANDING.snow,
          border: '1.5px solid #2c2e34',
          boxShadow: LANDING.shadowPrimary,
          '&:hover': {
            backgroundColor: LANDING.graphite,
            boxShadow: LANDING.shadowPrimary,
            borderColor: '#2c2e34',
          },
          '&:focus-visible': {
            boxShadow: `0 0 0 4px rgba(9, 9, 11, 0.16)`,
          },
          '&.Mui-disabled': {
            backgroundColor: LANDING.mist,
            color: LANDING.fog,
            borderColor: 'transparent',
            boxShadow: 'none',
          },
        },
        outlinedPrimary: {
          backgroundColor: LANDING.snow,
          color: LANDING.iron,
          border: `1px solid ${LANDING.iron}`,
          '&:hover': {
            backgroundColor: LANDING.subtle,
            borderColor: LANDING.iron,
          },
        },
        text: {
          color: LANDING.body,
          '&:hover': {
            backgroundColor: LANDING.paper,
            color: LANDING.ink,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: `1px solid ${LANDING.border}`,
          boxShadow: 'none',
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: `1px solid ${LANDING.border}`,
          boxShadow: 'none',
          '&:hover': {
            borderColor: LANDING.mist,
            boxShadow: 'none',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: LANDING.snow,
          color: LANDING.ink,
          boxShadow: 'none',
          borderBottom: `1px solid ${LANDING.border}`,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: LANDING.snow,
          color: LANDING.ink,
          borderRadius: LANDING.radiusButton,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: LANDING.border,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: LANDING.ash,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: LANDING.obsidian,
            borderWidth: 1,
          },
          '&.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(9, 9, 11, 0.08)',
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: LANDING.ink,
            borderWidth: 1.5,
          },
          '&.Mui-error': {
            backgroundColor: LANDING.subtle,
          },
        },
        input: {
          '&::placeholder': {
            color: LANDING.fog,
            opacity: 1,
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: LANDING.muted,
          '&.Mui-error': {
            color: LANDING.ink,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: LANDING.border,
          fontSize: '0.8125rem',
          color: LANDING.body,
          py: 1.25,
        },
        head: {
          fontWeight: 600,
          color: LANDING.ink,
          fontSize: '0.75rem',
          backgroundColor: LANDING.subtle,
          borderBottom: `1px solid ${LANDING.border}`,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: LANDING.paper,
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: LANDING.ash,
          '&.Mui-checked': { color: LANDING.obsidian },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: LANDING.ash,
          '&.Mui-checked': { color: LANDING.obsidian },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': { color: LANDING.obsidian },
          '&.Mui-checked + .MuiSwitch-track': { backgroundColor: LANDING.obsidian },
        },
        track: { backgroundColor: LANDING.mist },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: LANDING.cloud,
        },
        bar: {
          backgroundColor: LANDING.obsidian,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: LANDING.ink,
          textDecorationColor: LANDING.mist,
          '&:hover': {
            color: LANDING.ember,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: LANDING.body,
          '&:hover': {
            backgroundColor: LANDING.paper,
            color: LANDING.ink,
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          border: `1px solid ${LANDING.border}`,
          boxShadow: '0 12px 32px rgba(9, 9, 11, 0.10)',
          borderRadius: 14,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: LANDING.snow,
          border: `1px solid ${LANDING.border}`,
          boxShadow: '0 16px 40px rgba(9, 9, 11, 0.12)',
          borderRadius: 20,
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(9, 9, 11, 0.48)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        filledInfo: {
          backgroundColor: LANDING.obsidian,
          color: LANDING.snow,
        },
        filledSuccess: {
          backgroundColor: '#3f7d4e',
          color: LANDING.snow,
        },
        filledWarning: {
          backgroundColor: LANDING.ember,
          color: LANDING.snow,
        },
        filledError: {
          backgroundColor: LANDING.ink,
          color: LANDING.snow,
        },
        standardError: {
          backgroundColor: LANDING.paper,
          color: LANDING.ink,
          border: `1px solid ${LANDING.mist}`,
          '& .MuiAlert-icon': { color: LANDING.ink },
        },
        standardSuccess: {
          backgroundColor: '#f0f7f2',
          color: LANDING.ink,
          border: '1px solid #c5dbc9',
          '& .MuiAlert-icon': { color: '#3f7d4e' },
        },
        standardInfo: {
          backgroundColor: LANDING.paper,
          color: LANDING.ink,
          border: `1px solid ${LANDING.border}`,
          '& .MuiAlert-icon': { color: LANDING.obsidian },
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 90, 0, 0.08)',
          color: LANDING.ink,
          border: '1px solid rgba(255, 90, 0, 0.28)',
          '& .MuiAlert-icon': { color: LANDING.ember },
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        colorError: {
          backgroundColor: LANDING.ember,
          color: LANDING.snow,
        },
        colorPrimary: {
          backgroundColor: LANDING.obsidian,
          color: LANDING.snow,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          color: LANDING.body,
          borderRadius: LANDING.radiusBadge,
        },
        colorPrimary: {
          backgroundColor: LANDING.paper,
          color: LANDING.ink,
        },
        outlined: {
          borderColor: LANDING.border,
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: LANDING.cloud,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: LANDING.obsidian,
          height: 2,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: LANDING.muted,
          '&.Mui-selected': {
            color: LANDING.ink,
          },
        },
      },
    },
  },
});
