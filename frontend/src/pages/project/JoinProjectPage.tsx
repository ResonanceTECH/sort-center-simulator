import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { previewInvitation, acceptInvitation } from '@/services/membershipService';
import { LANDING, landingFont } from '@/landing/styles/tokens';
import { PAGE_MAX_WIDTH } from '@/theme';
import { useUiStore } from '@/store/uiStore';
import { getErrorMessage } from '@/utils/error';

export function JoinProjectPage() {
  const [searchParams] = useSearchParams();
  const code = (searchParams.get('code') ?? '').trim().toUpperCase();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const showSnackbar = useUiStore((s) => s.showSnackbar);
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof previewInvitation>> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreview = useCallback(async () => {
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const data = await previewInvitation(code);
      setPreview(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Не удалось проверить приглашение'));
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  const handleAccept = async () => {
    if (!code) return;
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/projects/join?code=${code}`)}`);
      return;
    }
    setLoading(true);
    try {
      const access = await acceptInvitation(code);
      showSnackbar(`Вы присоединились как ${access.roleLabel}`, 'success');
      if (preview?.projectId) {
        navigate(`/projects/${preview.projectId}`);
      } else {
        navigate('/projects');
      }
    } catch (err: unknown) {
      showSnackbar(getErrorMessage(err, 'Не удалось принять приглашение'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: LANDING.canvas,
        fontFamily: landingFont,
        position: 'relative',
        overflow: 'hidden',
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
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: PAGE_MAX_WIDTH,
          mx: 'auto',
          px: { xs: 2.5, sm: 4, md: 5 },
          py: { xs: 3, md: 4 },
        }}
      >
        <Typography
          component={RouterLink}
          to={isAuthenticated ? '/projects' : '/'}
          sx={{
            fontWeight: 600,
            fontSize: '1rem',
            color: LANDING.ink,
            textDecoration: 'none',
            letterSpacing: '-0.02em',
            '&:hover': { color: LANDING.ember },
          }}
        >
          Конструктор СЦ
        </Typography>
      </Box>

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: PAGE_MAX_WIDTH,
          mx: 'auto',
          px: { xs: 2.5, sm: 4, md: 5 },
          pb: 8,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {!code ? (
          <Alert severity="warning" sx={{ maxWidth: 520, width: '100%', borderRadius: LANDING.radiusButton }}>
            Укажите код приглашения в ссылке: /projects/join?code=XXXXXXXX
          </Alert>
        ) : (
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: 520,
              p: { xs: 3, sm: 4.5 },
              borderRadius: LANDING.radiusCard,
              border: `1px solid ${LANDING.border}`,
            }}
          >
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2rem' },
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: LANDING.ink,
                mb: 1,
              }}
            >
              Приглашение в проект
            </Typography>
            <Typography sx={{ color: LANDING.muted, mb: 3, fontSize: '0.9375rem' }}>
              Код: <Box component="strong" sx={{ color: LANDING.ink }}>{code}</Box>
            </Typography>

            {loading && !preview && (
              <Typography sx={{ color: LANDING.muted }}>Проверка…</Typography>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: LANDING.radiusButton }}>
                {error}
              </Alert>
            )}

            {preview && (
              <Stack spacing={2}>
                <Typography sx={{ color: LANDING.body }}>
                  Проект:{' '}
                  <Box component="strong" sx={{ color: LANDING.ink }}>
                    {preview.projectName || '—'}
                  </Box>
                </Typography>
                <Typography sx={{ color: LANDING.body }}>
                  Роль:{' '}
                  <Box component="strong" sx={{ color: LANDING.ink }}>
                    {preview.roleLabel}
                  </Box>
                </Typography>
                {!preview.isValid && preview.message && (
                  <Alert severity="warning" sx={{ borderRadius: LANDING.radiusButton }}>
                    {preview.message}
                  </Alert>
                )}
                <Button
                  variant="contained"
                  size="large"
                  disabled={!preview.isValid || loading}
                  onClick={() => void handleAccept()}
                  sx={{ minHeight: 48 }}
                >
                  {isAuthenticated ? 'Присоединиться' : 'Войти и присоединиться'}
                </Button>
              </Stack>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Link
                component="button"
                type="button"
                onClick={() => void loadPreview()}
                sx={{ fontSize: '0.8125rem', color: LANDING.muted }}
              >
                Обновить
              </Link>
              <Link
                component={RouterLink}
                to={isAuthenticated ? '/projects' : '/login'}
                sx={{ fontSize: '0.8125rem', color: LANDING.muted }}
              >
                {isAuthenticated ? 'К проектам' : 'Войти'}
              </Link>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
