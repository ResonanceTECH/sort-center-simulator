import { forwardRef, type ReactNode, type SyntheticEvent } from 'react';
import {
  Alert as MuiAlert,
  IconButton,
  type AlertProps as MuiAlertProps,
} from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { kit } from '@/ui-kit/tokens';

export type KitAlertSeverity = 'success' | 'info' | 'warning' | 'error';
export type KitAlertVariant = 'toast' | 'inline';

export interface KitAlertProps extends Omit<MuiAlertProps, 'variant' | 'severity' | 'color'> {
  severity?: KitAlertSeverity;
  variant?: KitAlertVariant;
}

/** Toast: floating surface — kit card language, severity only on icon */
const toastIconColor: Record<KitAlertSeverity, string> = {
  success: kit.color.success,
  info: kit.color.obsidian,
  warning: kit.color.ember,
  error: kit.color.ink,
};

const inlineSx: Record<KitAlertSeverity, object> = {
  success: {
    bgcolor: kit.color.successBg,
    color: kit.color.ink,
    border: `1px solid ${kit.color.successBorder}`,
    '& .MuiAlert-icon': { color: kit.color.success },
  },
  info: {
    bgcolor: kit.color.paper,
    color: kit.color.ink,
    border: `1px solid ${kit.color.border}`,
    '& .MuiAlert-icon': { color: kit.color.obsidian },
  },
  warning: {
    bgcolor: 'rgba(255, 90, 0, 0.08)',
    color: kit.color.ink,
    border: '1px solid rgba(255, 90, 0, 0.28)',
    '& .MuiAlert-icon': { color: kit.color.ember },
  },
  error: {
    bgcolor: kit.color.paper,
    color: kit.color.ink,
    border: `1px solid ${kit.color.mist}`,
    '& .MuiAlert-icon': { color: kit.color.ink },
  },
};

const severityIcons: Record<KitAlertSeverity, ReactNode> = {
  success: <CheckCircleOutlineRoundedIcon fontSize="inherit" />,
  info: <InfoOutlinedIcon fontSize="inherit" />,
  warning: <WarningAmberRoundedIcon fontSize="inherit" />,
  error: <ErrorOutlineRoundedIcon fontSize="inherit" />,
};

export const KitAlert = forwardRef<HTMLDivElement, KitAlertProps>(function KitAlert(
  { severity = 'info', variant = 'inline', icon, action, onClose, sx, ...props },
  ref,
) {
  const isToast = variant === 'toast';

  const closeButton =
    onClose && (isToast || !action) ? (
      <IconButton
        aria-label="Закрыть"
        size="small"
        onClick={(event: SyntheticEvent) => onClose(event)}
        sx={{
          color: kit.color.fog,
          p: 0.5,
          borderRadius: kit.radius.badge,
          '&:hover': {
            color: kit.color.ink,
            bgcolor: kit.color.paper,
          },
        }}
      >
        <CloseRoundedIcon sx={{ fontSize: 18 }} />
      </IconButton>
    ) : null;

  return (
    <MuiAlert
      ref={ref}
      severity={severity}
      variant="standard"
      icon={icon === undefined ? severityIcons[severity] : icon}
      action={action ?? closeButton}
      onClose={undefined}
      sx={[
        {
          fontFamily: kit.font.sans,
          fontSize: kit.typography.body.fontSize,
          fontWeight: 400,
          lineHeight: 1.4,
          letterSpacing: '-0.01em',
          alignItems: 'center',
          boxShadow: 'none',
          ...(isToast
            ? {
                width: 'fit-content',
                maxWidth: 'min(92vw, 420px)',
                bgcolor: kit.color.snow,
                color: kit.color.body,
                border: `1px solid ${kit.color.border}`,
                borderRadius: kit.radius.panel,
                boxShadow: kit.shadow.soft,
                px: 2,
                py: 1.25,
                '& .MuiAlert-icon': {
                  mr: 1.25,
                  p: 0,
                  opacity: 1,
                  fontSize: 22,
                  color: toastIconColor[severity],
                  alignItems: 'center',
                },
                '& .MuiAlert-message': {
                  py: 0,
                  pr: 1.5,
                  color: kit.color.body,
                },
                '& .MuiAlert-action': {
                  pt: 0,
                  pr: 0,
                  pl: 0.5,
                  mr: 0,
                  ml: 'auto',
                  alignItems: 'center',
                },
              }
            : {
                borderRadius: kit.radius.button,
                ...inlineSx[severity],
                '& .MuiAlert-icon': { opacity: 1, p: 0, mr: 1.25 },
                '& .MuiAlert-message': { py: 0.25 },
                '& .MuiAlert-action': {
                  pt: 0,
                  alignItems: 'center',
                  mr: 0,
                },
              }),
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...props}
    />
  );
});
