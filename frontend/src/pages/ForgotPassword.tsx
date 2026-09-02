import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
} from '@mui/material';
import { AuthLayout } from '@/components/AuthLayout';
import { AuthForm } from '@/components/AuthForm';
import { AuthTextField } from '@/components/AuthTextField';
import { forgotPassword } from '@/services/authService';
import { AUTH_COLORS, pillButtonSx } from '@/styles/authStyles';
import { LANDING } from '@/landing/styles/tokens';

interface ForgotPasswordForm {
  email: string;
}

const schema = yup.object({
  email: yup
    .string()
    .required('Email обязателен')
    .email('Введите корректный email'),
});

export function ForgotPassword() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: yupResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setError(null);
    setSuccess(false);

    try {
      await forgotPassword(data.email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки');
    }
  };

  return (
    <AuthLayout
      title="Восстановление пароля"
      subtitle="Введите email, и мы отправим ссылку для сброса пароля"
      footer={null}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: LANDING.radiusButton, width: '100%' }}>
          {error}
        </Alert>
      )}

      {success ? (
        <Alert severity="success" sx={{ mb: 2, borderRadius: LANDING.radiusButton, width: '100%' }}>
          Ссылка для восстановления пароля отправлена на указанный email.
          Проверьте почту.
        </Alert>
      ) : (
        <AuthForm onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <AuthTextField
                {...field}
                placeholder="Email"
                type="email"
                autoComplete="email"
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                disabled={isSubmitting}
              />
            )}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isSubmitting}
            sx={pillButtonSx}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Отправить ссылку'
            )}
          </Button>
        </AuthForm>
      )}

      <Box sx={{ textAlign: 'center', mt: 3, width: '100%' }}>
        <Link
          component={RouterLink}
          to="/login"
          sx={{ fontSize: '0.8125rem', color: AUTH_COLORS.subtitle }}
        >
          Вернуться ко входу
        </Link>
      </Box>
    </AuthLayout>
  );
}
