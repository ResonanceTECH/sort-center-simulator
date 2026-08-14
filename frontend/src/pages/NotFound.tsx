import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
} from '@mui/material';
import { HomeOutlined, LoginOutlined, SearchOffOutlined } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';

export function NotFound() {
  const { isAuthenticated } = useAuth();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 5 },
            textAlign: 'center',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '16px',
              bgcolor: 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <SearchOffOutlined sx={{ fontSize: 36, color: 'primary.main' }} />
          </Box>

          <Typography
            variant="h4"
            component="p"
            sx={{
              fontSize: { xs: '4rem', sm: '5rem' },
              fontWeight: 800,
              color: 'primary.main',
              lineHeight: 1,
              mb: 1,
            }}
          >
            404
          </Typography>

          <Typography variant="h5" fontWeight={700} gutterBottom>
            Страница не найдена
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 360, mx: 'auto' }}>
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
                На главную
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
            <Button
              variant="outlined"
              onClick={() => window.history.back()}
            >
              Назад
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
