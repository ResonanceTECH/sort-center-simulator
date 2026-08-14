import { Box, Typography } from '@mui/material';
import { ArchiveOutlined, EditOutlined, ErrorOutline } from '@mui/icons-material';
import { STATUS_CONFIG } from '@/constants/projects';
import type { ProjectListStatus } from '@/types/projects';

const ICONS = {
  ErrorOutline,
  EditOutlined,
  ArchiveOutlined,
} as const;

interface ProjectStatusBadgeProps {
  status: ProjectListStatus;
}

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon ? ICONS[config.icon as keyof typeof ICONS] : null;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.25,
        py: 0.5,
        borderRadius: '999px',
        bgcolor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
        maxWidth: '100%',
      }}
      role="status"
      aria-label={`Статус: ${config.label}`}
    >
      {Icon && <Icon sx={{ fontSize: 16 }} />}
      <Typography
        component="span"
        sx={{ fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap' }}
      >
        {config.label}
      </Typography>
    </Box>
  );
}
