import { Box, Typography } from '@mui/material';
import { AppLayout } from '@/layouts/AppLayout';
import { TopBar } from '@/components/general/TopBar';

interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <AppLayout topBar={<TopBar notifications={[]} />}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" fontWeight={700} mb={1}>{title}</Typography>
        <Typography color="text.secondary">Раздел в разработке</Typography>
      </Box>
    </AppLayout>
  );
}
