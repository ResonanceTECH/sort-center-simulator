import { createTheme } from '@mui/material/styles';

/** Only the four Ozon brand colors + allowed alpha variants. */
export const OZON = {
  blue: '#005BFF',
  darkSpace: '#001A34',
  morningBlue: '#00A2FF',
  white: '#FFFFFF',
} as const;

export const SIDEBAR_WIDTH = 240;

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: OZON.blue,
      light: 'rgba(0, 91, 255, 0.08)',
      dark: OZON.blue,
      contrastText: OZON.white,
    },
    secondary: {
      main: OZON.morningBlue,
      light: 'rgba(0, 162, 255, 0.10)',
      dark: OZON.morningBlue,
      contrastText: OZON.white,
    },
    background: {
      default: '#F5F7FA',
      paper: OZON.white,
    },
    text: {
      primary: OZON.darkSpace,
      secondary: 'rgba(0, 26, 52, 0.64)',
      disabled: 'rgba(0, 26, 52, 0.32)',
    },
    divider: 'rgba(0, 26, 52, 0.12)',
    action: {
      hover: 'rgba(0, 162, 255, 0.08)',
      selected: 'rgba(0, 91, 255, 0.10)',
      disabled: 'rgba(0, 26, 52, 0.32)',
      disabledBackground: 'rgba(0, 91, 255, 0.32)',
      focus: 'rgba(0, 91, 255, 0.14)',
    },
    // Remapped to palette — never red/green/yellow
    info: {
      main: OZON.blue,
      contrastText: OZON.white,
    },
    success: {
      main: OZON.morningBlue,
      contrastText: OZON.white,
    },
    warning: {
      main: OZON.darkSpace,
      contrastText: OZON.white,
    },
    error: {
      main: OZON.darkSpace,
      contrastText: OZON.white,
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Manrope", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, fontSize: '1.75rem', letterSpacing: '-0.02em', color: OZON.darkSpace },
    h5: { fontWeight: 700, fontSize: '1.125rem', color: OZON.darkSpace },
    h6: { fontWeight: 600, fontSize: '0.9375rem', color: OZON.darkSpace },
    body1: { color: OZON.darkSpace },
    body2: { fontSize: '0.8125rem', color: OZON.darkSpace },
    caption: { fontSize: '0.75rem', color: 'rgba(0, 26, 52, 0.64)' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F5F7FA',
          color: OZON.darkSpace,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        containedPrimary: {
          backgroundColor: OZON.blue,
          color: OZON.white,
          border: `1px solid ${OZON.blue}`,
          '&:hover': {
            background: `linear-gradient(135deg, ${OZON.blue}, ${OZON.morningBlue})`,
            borderColor: OZON.blue,
          },
          '&:focus-visible': {
            boxShadow: '0 0 0 4px rgba(0, 162, 255, 0.24)',
          },
          '&.Mui-disabled': {
            backgroundColor: 'rgba(0, 91, 255, 0.32)',
            color: 'rgba(255, 255, 255, 0.72)',
            borderColor: 'transparent',
          },
        },
        outlinedPrimary: {
          backgroundColor: OZON.white,
          color: OZON.blue,
          border: `1px solid ${OZON.blue}`,
          '&:hover': {
            backgroundColor: 'rgba(0, 91, 255, 0.08)',
            borderColor: OZON.blue,
          },
        },
        text: {
          color: OZON.darkSpace,
          '&:hover': {
            backgroundColor: 'rgba(0, 162, 255, 0.08)',
            color: OZON.blue,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid rgba(0, 26, 52, 0.12)',
          boxShadow: 'none',
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid rgba(0, 26, 52, 0.12)',
          boxShadow: 'none',
          '&:hover': {
            borderColor: 'rgba(0, 91, 255, 0.32)',
            boxShadow: 'none',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: OZON.white,
          color: OZON.darkSpace,
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0, 26, 52, 0.12)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: OZON.white,
          color: OZON.darkSpace,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0, 26, 52, 0.20)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0, 91, 255, 0.56)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: OZON.blue,
            borderWidth: 1,
          },
          '&.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(0, 91, 255, 0.14)',
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: OZON.darkSpace,
            borderWidth: 2,
          },
          '&.Mui-error': {
            backgroundColor: 'rgba(0, 26, 52, 0.04)',
          },
        },
        input: {
          '&::placeholder': {
            color: 'rgba(0, 26, 52, 0.44)',
            opacity: 1,
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: 'rgba(0, 26, 52, 0.64)',
          '&.Mui-error': {
            color: OZON.darkSpace,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(0, 26, 52, 0.10)',
          fontSize: '0.8125rem',
          color: OZON.darkSpace,
          py: 1.25,
        },
        head: {
          fontWeight: 600,
          color: OZON.darkSpace,
          fontSize: '0.75rem',
          backgroundColor: 'rgba(0, 91, 255, 0.06)',
          borderBottom: '1px solid rgba(0, 26, 52, 0.12)',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 162, 255, 0.06)',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: 'rgba(0, 26, 52, 0.44)',
          '&.Mui-checked': { color: OZON.blue },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: 'rgba(0, 26, 52, 0.44)',
          '&.Mui-checked': { color: OZON.blue },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': { color: OZON.blue },
          '&.Mui-checked + .MuiSwitch-track': { backgroundColor: OZON.blue },
        },
        track: { backgroundColor: 'rgba(0, 91, 255, 0.12)' },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 91, 255, 0.12)',
        },
        bar: {
          backgroundColor: OZON.blue,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: OZON.blue,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: OZON.darkSpace,
          '&:hover': {
            backgroundColor: 'rgba(0, 91, 255, 0.08)',
            color: OZON.blue,
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          border: '1px solid rgba(0, 26, 52, 0.12)',
          boxShadow: '0 8px 24px rgba(0, 26, 52, 0.12)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: OZON.white,
          border: '1px solid rgba(0, 26, 52, 0.12)',
          boxShadow: '0 16px 40px rgba(0, 26, 52, 0.16)',
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 26, 52, 0.56)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        filledInfo: {
          backgroundColor: OZON.blue,
          color: OZON.white,
        },
        filledSuccess: {
          backgroundColor: OZON.morningBlue,
          color: OZON.white,
        },
        filledWarning: {
          backgroundColor: OZON.darkSpace,
          color: OZON.white,
        },
        filledError: {
          backgroundColor: OZON.darkSpace,
          color: OZON.white,
        },
        standardError: {
          backgroundColor: 'rgba(0, 26, 52, 0.10)',
          color: OZON.darkSpace,
          border: `1px solid ${OZON.darkSpace}`,
          '& .MuiAlert-icon': { color: OZON.darkSpace },
        },
        standardSuccess: {
          backgroundColor: 'rgba(0, 162, 255, 0.10)',
          color: OZON.darkSpace,
          border: `1px solid ${OZON.morningBlue}`,
          '& .MuiAlert-icon': { color: OZON.morningBlue },
        },
        standardInfo: {
          backgroundColor: 'rgba(0, 91, 255, 0.10)',
          color: OZON.darkSpace,
          border: `1px solid ${OZON.blue}`,
          '& .MuiAlert-icon': { color: OZON.blue },
        },
        standardWarning: {
          backgroundColor: 'rgba(0, 26, 52, 0.10)',
          color: OZON.darkSpace,
          border: `1px solid ${OZON.darkSpace}`,
          '& .MuiAlert-icon': { color: OZON.darkSpace },
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        colorError: {
          backgroundColor: OZON.blue,
          color: OZON.white,
        },
        colorPrimary: {
          backgroundColor: OZON.blue,
          color: OZON.white,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          color: OZON.darkSpace,
        },
        colorPrimary: {
          backgroundColor: 'rgba(0, 91, 255, 0.10)',
          color: OZON.blue,
        },
        outlined: {
          borderColor: 'rgba(0, 26, 52, 0.24)',
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 91, 255, 0.08)',
        },
      },
    },
  },
});
