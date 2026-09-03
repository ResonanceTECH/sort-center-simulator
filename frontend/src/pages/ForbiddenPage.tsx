import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LANDING, landingFont } from '@/landing/styles/tokens';
import { resolveLandingPath } from '@/workspace/workspaceResolver';

export function ForbiddenPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        fontFamily: landingFont,
        px: 3,
        textAlign: 'center',
      }}
    >
      <Typography variant="h3" sx={{ fontWeight: 700, color: LANDING.ink }}>
        403
      </Typography>
      <Typography sx={{ color: LANDING.body, maxWidth: 420 }}>
        Недостаточно прав для этого раздела. Обратитесь к администратору организации.
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate(resolveLandingPath(user))}
        sx={{
          mt: 1,
          bgcolor: LANDING.obsidian,
          borderRadius: LANDING.radiusButton,
          textTransform: 'none',
          '&:hover': { bgcolor: LANDING.ink },
        }}
      >
        На главную рабочего пространства
      </Button>
    </Box>
  );
}
