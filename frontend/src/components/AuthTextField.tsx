import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material/TextField';
import { pillFieldSx } from '@/styles/authStyles';

export function AuthTextField(props: TextFieldProps) {
  return (
    <TextField
      variant="outlined"
      fullWidth
      sx={pillFieldSx}
      {...props}
    />
  );
}
