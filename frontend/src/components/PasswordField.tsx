import { useState } from 'react';
import {
  IconButton,
  InputAdornment,
  LinearProgress,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import type { TextFieldProps } from '@mui/material/TextField';
import type { PasswordStrength } from '@/types/auth';
import { pillFieldSx } from '@/styles/authStyles';
import { LANDING } from '@/landing/styles/tokens';

function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return 'weak';

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-zA-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
}

const strengthConfig: Record<
  PasswordStrength,
  { label: string; value: number; color: string; track: string }
> = {
  weak: {
    label: 'Слабый',
    value: 33,
    color: LANDING.fog,
    track: LANDING.cloud,
  },
  medium: {
    label: 'Средний',
    value: 66,
    color: LANDING.ember,
    track: 'rgba(255, 90, 0, 0.12)',
  },
  strong: {
    label: 'Надёжный',
    value: 100,
    color: '#3f7d4e',
    track: '#e8f2ea',
  },
};

interface PasswordFieldProps extends Omit<TextFieldProps, 'type'> {
  showStrength?: boolean;
}

export function PasswordField({
  showStrength = false,
  value,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const password = typeof value === 'string' ? value : '';
  const strength = getPasswordStrength(password);
  const config = strengthConfig[strength];

  return (
    <Box sx={{ width: '100%' }}>
      <TextField
        {...props}
        value={value}
        variant="outlined"
        fullWidth
        type={visible ? 'text' : 'password'}
        sx={pillFieldSx}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
                onClick={() => setVisible((prev) => !prev)}
                edge="end"
                size="small"
                sx={{ mr: 0.5, color: LANDING.fog }}
              >
                {visible ? (
                  <VisibilityOff fontSize="small" />
                ) : (
                  <Visibility fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {showStrength && password.length > 0 && (
        <Box sx={{ mt: 1, px: 2.5 }}>
          <LinearProgress
            variant="determinate"
            value={config.value}
            sx={{
              height: 4,
              borderRadius: 2,
              backgroundColor: config.track,
              '& .MuiLinearProgress-bar': {
                backgroundColor: config.color,
                borderRadius: 2,
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{ color: config.color, mt: 0.5, display: 'block' }}
          >
            {config.label}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
