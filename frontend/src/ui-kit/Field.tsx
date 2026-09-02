import { TextField, type TextFieldProps } from '@mui/material';
import { kit } from '@/ui-kit/tokens';

export type KitFieldProps = TextFieldProps;

export function KitField(props: KitFieldProps) {
  return (
    <TextField
      variant="outlined"
      fullWidth
      {...props}
      sx={[
        {
          '& .MuiOutlinedInput-root': {
            borderRadius: kit.radius.input,
            bgcolor: kit.color.snow,
            fontSize: '0.9375rem',
            minHeight: 52,
            fontFamily: kit.font.sans,
            '& fieldset': { borderColor: kit.color.border },
            '&:hover fieldset': { borderColor: kit.color.ash },
            '&.Mui-focused fieldset': {
              borderColor: kit.color.obsidian,
              borderWidth: 1,
            },
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(9, 9, 11, 0.08)',
            },
            '&.Mui-error fieldset': {
              borderColor: kit.color.ink,
              borderWidth: 1.5,
            },
          },
          '& .MuiFormHelperText-root': {
            mx: 1.5,
            mt: 0.75,
            color: kit.color.muted,
            '&.Mui-error': { color: kit.color.ink },
          },
        },
        ...(Array.isArray(props.sx) ? props.sx : props.sx ? [props.sx] : []),
      ]}
    />
  );
}
