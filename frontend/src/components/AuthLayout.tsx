import type { ReactNode } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
import { LANDING, landingFont } from '@/landing/styles/tokens';
import { PAGE_MAX_WIDTH } from '@/theme';

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
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: LANDING.canvas,
        fontFamily: landingFont,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255, 90, 0, 0.08), transparent 55%),
            linear-gradient(180deg, ${LANDING.snow} 0%, ${LANDING.canvas} 45%, ${LANDING.paper} 100%)
          `,
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.45,
          backgroundImage: `
            linear-gradient(${LANDING.cloud} 1px, transparent 1px),
            linear-gradient(90deg, ${LANDING.cloud} 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 75%)',
        }}
      />

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: PAGE_MAX_WIDTH,
          mx: 'auto',
          px: { xs: 2.5, sm: 4, md: 5 },
          py: { xs: 3, md: 4 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          component={RouterLink}
          to="/"
          sx={{
            fontFamily: landingFont,
            fontWeight: 600,
            fontSize: '1rem',
            color: LANDING.ink,
            textDecoration: 'none',
            letterSpacing: '-0.02em',
            '&:hover': { color: LANDING.ember },
          }}
        >
          SupplyTwin
        </Typography>
        <IconButton
          aria-label="Закрыть"
          onClick={() => navigate('/')}
          sx={{
            color: LANDING.steel,
            border: `1px solid ${LANDING.border}`,
            borderRadius: LANDING.radiusButton,
            bgcolor: LANDING.snow,
            '&:hover': {
              backgroundColor: LANDING.subtle,
              color: LANDING.ink,
            },
          }}
        >
          <Close sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: PAGE_MAX_WIDTH,
          mx: 'auto',
          px: { xs: 2.5, sm: 4, md: 5 },
          pb: { xs: 6, md: 10 },
        }}
      >
        <Paper elevation={0} sx={wide ? authCardWideSx : authCardSx}>
          <Typography component="h1" sx={authTitleSx}>
            {title}
          </Typography>
          <Typography sx={authSubtitleSx}>{subtitle}</Typography>

          <Box sx={{ width: '100%' }}>{children}</Box>

          {footer === null ? null : (footer ?? <DefaultFooter />)}
        </Paper>
      </Box>
    </Box>
  );
}
