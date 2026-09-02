import { memo, useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Box, IconButton, Menu, MenuItem, Paper, Typography } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { PROJECT_STATUS_LABELS } from '@/constants/general';
import { StatusDot } from '@/components/general/StatusDot';
import { useUiStore } from '@/store/uiStore';
import { LANDING } from '@/landing/styles/tokens';
import type { Project } from '@/types/general';

interface ProjectCardProps {
  project: Project;
}

function ProjectCardComponent({ project }: ProjectCardProps) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const { showSnackbar } = useUiStore();

  const handleMenuAction = (message: string) => {
    setAnchor(null);
    showSnackbar(message, 'info');
  };

  const updatedLabel = format(new Date(project.updatedAt), 'd MMM yyyy', { locale: ru });

  return (
    <Paper
      sx={{
        overflow: 'hidden',
        transition: 'border-color 0.2s',
        border: `1px solid ${LANDING.border}`,
        boxShadow: 'none',
        borderRadius: 2.5,
        '&:hover': {
          borderColor: LANDING.mist,
        },
      }}
    >
      <Box
        component="img"
        src={project.thumbnail}
        alt={project.name}
        sx={{
          width: '100%',
          height: 100,
          objectFit: 'cover',
          bgcolor: 'rgba(9, 9, 11, 0.04)',
        }}
      />
      <Box sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="body2" fontWeight={600} mb={0.75} fontSize="0.8125rem">
            {project.name}
          </Typography>
          <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
            <MoreVert fontSize="small" />
          </IconButton>
          <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
            <MenuItem onClick={() => handleMenuAction('Открытие проекта...')}>Открыть</MenuItem>
            <MenuItem onClick={() => handleMenuAction('Редактирование...')}>Редактировать</MenuItem>
            <MenuItem onClick={() => handleMenuAction('Дублирование...')}>Дублировать</MenuItem>
          </Menu>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
          <StatusDot status={project.status} />
          <Typography variant="caption" color="text.secondary">
            {PROJECT_STATUS_LABELS[project.status]}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" display="block">
          {project.throughput} · {project.area}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
          Обновлён {updatedLabel}
        </Typography>
      </Box>
    </Paper>
  );
}

export const ProjectCard = memo(ProjectCardComponent);
