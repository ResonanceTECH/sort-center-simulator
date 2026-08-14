import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  Link,
  Paper,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import {
  AUTH_COLORS,
  authCardSx,
  authCardWideSx,
  authSubtitleSx,
  authTitleSx,
} from '@/styles/authStyles';
import { OZON } from '@/theme';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  footer?: ReactNode | null;
  wide?: boolean;
}

function DefaultFooter() {
  return (
    <Typography
      variant="caption"
      sx={{
        display: 'block',
        textAlign: 'center',
        color: AUTH_COLORS.footer,
        fontSize: '0.6875rem',
        lineHeight: 1.6,
        mt: 4,
        px: 1,
      }}
    >
      Используя сервис, вы соглашаетесь с{' '}
      <Link
        href="#"
        underline="always"
        onClick={(e) => e.preventDefault()}
        sx={{ color: AUTH_COLORS.primary, fontSize: 'inherit' }}
      >
        Политикой конфиденциальности
      </Link>{' '}
      и{' '}
      <Link
        href="#"
        underline="always"
        onClick={(e) => e.preventDefault()}
        sx={{ color: AUTH_COLORS.primary, fontSize: 'inherit' }}
      >
        Условиями использования
      </Link>
    </Typography>
  );
}

export function AuthLayout({
  children,
  title,
  subtitle,
  footer,
  wide = false,
}: AuthLayoutProps) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: OZON.white,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: '-10%',
          background: `
            linear-gradient(
              160deg,
              rgba(0, 91, 255, 0.12) 0%,
              rgba(0, 162, 255, 0.08) 50%,
              rgba(0, 26, 52, 0.04) 100%
            )
          `,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '8%',
            left: '5%',
            width: '28%',
            height: '70%',
            borderRadius: '16px',
            background: `linear-gradient(180deg, ${OZON.white} 0%, rgba(0, 91, 255, 0.08) 100%)`,
            boxShadow: '0 8px 32px rgba(0, 26, 52, 0.12)',
            opacity: 0.9,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '12%',
            right: '8%',
            width: '55%',
            height: '18%',
            borderRadius: '12px',
            background: OZON.white,
            boxShadow: '0 4px 20px rgba(0, 26, 52, 0.10)',
            opacity: 0.85,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '34%',
            right: '8%',
            width: '55%',
            height: '42%',
            borderRadius: '12px',
            background: OZON.white,
            boxShadow: '0 4px 20px rgba(0, 26, 52, 0.10)',
            opacity: 0.85,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '10%',
            left: '20%',
            width: '60%',
            height: '12%',
            borderRadius: '12px',
            background: OZON.white,
            opacity: 0.7,
          }}
        />
        <Typography
          sx={{
            position: 'absolute',
            top: '22%',
            left: '38%',
            fontSize: '3.5rem',
            fontWeight: 800,
            color: 'rgba(0, 91, 255, 0.08)',
            letterSpacing: '0.05em',
            userSelect: 'none',
          }}
        >
          СОРТИРОВОЧНЫЙ ЦЕНТР
        </Typography>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          backgroundColor: AUTH_COLORS.overlay,
        }}
      />

      <Paper elevation={0} sx={wide ? authCardWideSx : authCardSx}>
        <IconButton
          aria-label="Закрыть"
          onClick={() => navigate('/login')}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: OZON.morningBlue,
            '&:hover': {
              backgroundColor: 'rgba(0, 91, 255, 0.08)',
              color: OZON.blue,
            },
          }}
        >
          <Close sx={{ fontSize: 22 }} />
        </IconButton>

        <Typography component="h1" sx={authTitleSx}>
          {title}
        </Typography>
        <Typography sx={authSubtitleSx}>{subtitle}</Typography>

        <Box sx={{ width: '100%' }}>{children}</Box>

        {footer === null ? null : (footer ?? <DefaultFooter />)}
      </Paper>
    </Box>
  );
}
