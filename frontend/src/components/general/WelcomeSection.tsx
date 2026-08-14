import { Box, Typography } from '@mui/material';

export function WelcomeRow() {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" sx={{ mb: 1, fontSize: { xs: '1.375rem', md: '1.75rem' } }}>
        Добро пожаловать, Дарья 👋
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 560, lineHeight: 1.6 }}
      >
        Проектируйте, моделируйте и сравнивайте сценарии сортировочных центров с точными
        данными и аналитикой.
      </Typography>
    </Box>
  );
}
