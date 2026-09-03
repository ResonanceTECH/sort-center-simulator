import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Link,
  Snackbar,
} from '@mui/material';
import { COMMON } from '@/constants/platformRu';
import { AuthLayout } from '@/components/AuthLayout';
import { AuthForm } from '@/components/AuthForm';
import { AuthTextField } from '@/components/AuthTextField';
import { PasswordField } from '@/components/PasswordField';
import { useAuth } from '@/hooks/useAuth';
import { AUTH_COLORS, pillButtonSx } from '@/styles/authStyles';
import { LANDING } from '@/landing/styles/tokens';
import { resolveLandingPath } from '@/workspace/workspaceResolver';

const schema = yup.object({
  email: yup
    .string()
    .required('Email обязателен')
    .email('Введите корректный email'),
  password: yup
    .string()
    .required('Пароль обязателен')
    .min(6, 'Минимум 6 символов'),
  rememberMe: yup.boolean().default(false).required(),
});

type LoginFormValues = yup.InferType<typeof schema>;

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);

    try {
      const user = await login(data);
      setSuccessOpen(true);
      setTimeout(() => {
        navigate(resolveLandingPath(user));
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    }
  };

  return (
    <AuthLayout
      title="Войти"
      subtitle="Войдите в платформу управления цепочками поставок"
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: LANDING.radiusButton, width: '100%' }}>
          {error}
        </Alert>
      )}

      <AuthForm onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <AuthTextField
              {...field}
              placeholder={COMMON.email}
              type="email"
              autoComplete="email"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              disabled={isSubmitting}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <PasswordField
              {...field}
              placeholder="Пароль"
              autoComplete="current-password"
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              disabled={isSubmitting}
            />
          )}
        />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            width: '100%',
          }}
        >
          <Controller
            name="rememberMe"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    {...field}
                    checked={field.value}
                    disabled={isSubmitting}
                    size="small"
                  />
                }
                label="Запомнить меня"
                sx={{
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.8125rem',
                    color: AUTH_COLORS.subtitle,
                  },
                }}
              />
            )}
          />
          <Link
            component={RouterLink}
            to="/forgot-password"
            variant="body2"
            sx={{ fontSize: '0.8125rem' }}
          >
            Забыли пароль?
          </Link>
        </Box>

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
            'Войти'
          )}
        </Button>

        <Box sx={{ textAlign: 'center', width: '100%' }}>
          <Box
            component="span"
            sx={{ color: AUTH_COLORS.subtitle, fontSize: '0.8125rem' }}
          >
            Нет аккаунта?{' '}
            <Link component={RouterLink} to="/register" sx={{ fontSize: 'inherit' }}>
              Зарегистрироваться
            </Link>
          </Box>
        </Box>
      </AuthForm>

      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
          Вход выполнен успешно
        </Alert>
      </Snackbar>
    </AuthLayout>
  );
}
