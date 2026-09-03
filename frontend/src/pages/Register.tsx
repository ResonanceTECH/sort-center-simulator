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
import { COMMON, NAV_LABELS } from '@/constants/platformRu';
import { AuthLayout } from '@/components/AuthLayout';
import { AuthForm } from '@/components/AuthForm';
import { AuthTextField } from '@/components/AuthTextField';
import { PasswordField } from '@/components/PasswordField';
import { useAuth } from '@/hooks/useAuth';
import { AUTH_COLORS, pillButtonSx, registerFieldsGridSx } from '@/styles/authStyles';
import { LANDING } from '@/landing/styles/tokens';
import { resolveLandingPath } from '@/workspace/workspaceResolver';

const schema = yup.object({
  name: yup
    .string()
    .required('Имя обязательно')
    .min(2, 'Минимум 2 символа')
    .trim(),
  email: yup
    .string()
    .required('Email обязателен')
    .email('Введите корректный email'),
  password: yup
    .string()
    .required('Пароль обязателен')
    .min(8, 'Минимум 8 символов')
    .matches(/\d/, 'Пароль должен содержать хотя бы одну цифру')
    .matches(/[a-zA-Zа-яА-Я]/, 'Пароль должен содержать хотя бы одну букву'),
  confirmPassword: yup
    .string()
    .required('Подтвердите пароль')
    .oneOf([yup.ref('password')], 'Пароли не совпадают'),
  team: yup.string().default('').defined(),
  agreeToTerms: yup
    .boolean()
    .oneOf([true], 'Необходимо принять условия использования')
    .required(),
});

type RegisterFormValues = yup.InferType<typeof schema>;

export function Register() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      team: '',
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);

    try {
      const user = await registerUser({
        ...data,
        team: data.team || undefined,
      });
      setSuccessOpen(true);
      setTimeout(() => {
        navigate(resolveLandingPath(user));
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    }
  };

  return (
    <AuthLayout
      wide
      title="Создать аккаунт"
      subtitle={`Создайте аккаунт для работы с ${NAV_LABELS.controlTower}, планированием и исполнением`}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: LANDING.radiusButton, width: '100%' }}>
          {error}
        </Alert>
      )}

      <AuthForm onSubmit={handleSubmit(onSubmit)}>
        <Box sx={registerFieldsGridSx}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <AuthTextField
                {...field}
                placeholder="Имя"
                autoComplete="name"
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
                disabled={isSubmitting}
              />
            )}
          />

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
                autoComplete="new-password"
                showStrength
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
                disabled={isSubmitting}
              />
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <PasswordField
                {...field}
                placeholder="Подтверждение пароля"
                autoComplete="new-password"
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword?.message}
                disabled={isSubmitting}
              />
            )}
          />

          <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
            <Controller
              name="team"
              control={control}
              render={({ field }) => (
                <AuthTextField
                  {...field}
                  placeholder="Команда или организация"
                  autoComplete="organization"
                  disabled={isSubmitting}
                />
              )}
            />
          </Box>
        </Box>

        <Controller
          name="agreeToTerms"
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
              label={
                <Box component="span" sx={{ fontSize: '0.8125rem', color: AUTH_COLORS.subtitle }}>
                  Я принимаю{' '}
                  <Link href="#" onClick={(e) => e.preventDefault()} sx={{ fontSize: 'inherit' }}>
                    условия использования
                  </Link>
                </Box>
              }
              sx={{
                alignItems: 'flex-start',
                width: '100%',
                m: 0,
                '& .MuiCheckbox-root': { pt: 0.25 },
              }}
            />
          )}
        />
        {errors.agreeToTerms && (
          <Alert severity="error" sx={{ py: 0, borderRadius: LANDING.radiusButton, width: '100%' }}>
            {errors.agreeToTerms.message}
          </Alert>
        )}

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
            'Зарегистрироваться'
          )}
        </Button>

        <Box sx={{ textAlign: 'center', width: '100%' }}>
          <Box
            component="span"
            sx={{ color: AUTH_COLORS.subtitle, fontSize: '0.8125rem' }}
          >
            Уже есть аккаунт?{' '}
            <Link component={RouterLink} to="/login" sx={{ fontSize: 'inherit' }}>
              Войти
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
          Регистрация прошла успешно
        </Alert>
      </Snackbar>
    </AuthLayout>
  );
}
