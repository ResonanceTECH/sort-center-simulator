import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Typography,
} from '@mui/material';
import { HomeOutlined, LoginOutlined, SearchOffOutlined } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { LANDING, landingFont } from '@/landing/styles/tokens';
import { PAGE_MAX_WIDTH } from '@/theme';

export function NotFound() {
  const { isAuthenticated } = useAuth();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: LANDING.canvas,
        fontFamily: landingFont,
        p: { xs: 2.5, sm: 4 },
      }}
    >
      <Box sx={{ width: '100%', maxWidth: PAGE_MAX_WIDTH, mx: 'auto', display: 'flex', justifyContent: 'center' }}>
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 480,
            p: { xs: 4, sm: 5 },
            textAlign: 'center',
            borderRadius: LANDING.radiusCard,
            border: `1px solid ${LANDING.border}`,
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: LANDING.radiusButton,
              bgcolor: LANDING.paper,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <SearchOffOutlined sx={{ fontSize: 36, color: LANDING.ink }} />
          </Box>

          <Typography
            component="p"
            sx={{
              fontSize: { xs: '3.5rem', sm: '4.5rem' },
              fontWeight: 600,
              letterSpacing: '-0.04em',
              color: LANDING.ink,
              lineHeight: 1,
              mb: 1,
            }}
          >
            404
          </Typography>

          <Typography
            sx={{
              fontSize: '1.25rem',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: LANDING.ink,
              mb: 1,
            }}
          >
            Страница не найдена
          </Typography>

          <Typography
            sx={{
              mb: 4,
              maxWidth: 360,
              mx: 'auto',
              color: LANDING.muted,
              fontSize: '0.9375rem',
              lineHeight: 1.5,
            }}
          >
            Запрашиваемая страница не существует, была перемещена или временно недоступна.
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
            {isAuthenticated ? (
              <Button
                component={RouterLink}
                to="/projects"
                variant="contained"
                startIcon={<HomeOutlined />}
              >
                К проектам
              </Button>
            ) : (
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                startIcon={<LoginOutlined />}
              >
                Войти
              </Button>
            )}
            <Button variant="outlined" onClick={() => window.history.back()}>
              Назад
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
