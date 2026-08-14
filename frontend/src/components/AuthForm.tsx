import { Box } from '@mui/material';
import type { BoxProps } from '@mui/material/Box';
import { authFormSx } from '@/styles/authStyles';

export function AuthForm({ sx, ...props }: BoxProps<'form'>) {
  return (
    <Box
      component="form"
      noValidate
      sx={[authFormSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      {...props}
    />
  );
}
