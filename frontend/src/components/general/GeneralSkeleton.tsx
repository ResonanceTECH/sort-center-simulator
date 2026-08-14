import { Box, Skeleton } from '@mui/material';

export function GeneralSkeleton() {
  return (
    <Box>
      <Skeleton variant="rounded" height={80} sx={{ mb: 3 }} />
      <Skeleton variant="rounded" height={200} />
    </Box>
  );
}
