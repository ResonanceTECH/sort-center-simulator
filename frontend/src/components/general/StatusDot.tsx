import { Box } from '@mui/material';
import { PROJECT_STATUS_STYLES } from '@/constants/general';
import type { ProjectStatus } from '@/types/general';

interface StatusDotProps {
  status: ProjectStatus;
}

export function StatusDot({ status }: StatusDotProps) {
  return (
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        bgcolor: PROJECT_STATUS_STYLES[status].color,
        flexShrink: 0,
      }}
    />
  );
}
