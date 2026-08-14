import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import {
  AccessTime,
  AccountTreeOutlined,
  ArchiveOutlined,
  ContentCopy,
  DeleteOutline,
  DriveFileRenameOutline,
  FlagOutlined,
  MoreVert,
  OpenInNew,
} from '@mui/icons-material';
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge';
import { PROJECTS_PAGE } from '@/constants/projects';
import { OZON } from '@/theme';
import { formatProjectDate } from '@/utils/projects';
import type { ProjectListItem } from '@/types/projects';

interface ProjectListCardProps {
  project: ProjectListItem;
  onOpen?: (id: string) => void;
  onRename?: (id: string, name: string) => void | Promise<void>;
  onArchive?: (id: string) => void | Promise<void>;
  onDuplicate?: (id: string) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
}

export function ProjectListCard({
  project,
  onOpen,
  onRename,
  onArchive,
  onDuplicate,
  onDelete,
}: ProjectListCardProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState(project.name);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isError = project.status === 'error';
  const isDraft = project.status === 'draft';
  const isArchived = project.status === 'archived';

  useEffect(() => {
    setDraftName(project.name);
  }, [project.name]);

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isRenaming]);

  const openProject = () => {
    if (isRenaming) return;
    onOpen?.(project.id);
  };

  const startRename = () => {
    setDraftName(project.name);
    setIsRenaming(true);
    closeMenu();
  };

  const cancelRename = () => {
    setDraftName(project.name);
    setIsRenaming(false);
  };

  const commitRename = () => {
    const next = draftName.trim();
    if (!next) {
      cancelRename();
      return;
    }
    if (next !== project.name) {
      void onRename?.(project.id, next);
    }
    setIsRenaming(false);
  };

  const runMenuAction = async (action?: () => void | Promise<void>) => {
    if (!action || actionLoading) return;
    closeMenu();
    setActionLoading(true);
    try {
      await action();
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await onDelete?.(project.id);
      setDeleteOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCardKeyDown = (e: KeyboardEvent) => {
    if (isRenaming) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openProject();
    }
  };

  const openMenu = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  const closeMenu = () => setMenuAnchor(null);

  const borderColor = isError ? PROJECTS_PAGE.errorBorder : PROJECTS_PAGE.border;
  const borderWidth = isError ? 2 : 1;

  return (
    <Paper
      component="article"
      role="button"
      tabIndex={isRenaming ? -1 : 0}
      aria-label={`Проект ${project.name}, статус ${project.status}`}
      onClick={openProject}
      onKeyDown={handleCardKeyDown}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 300,
        overflow: 'hidden',
        cursor: isRenaming ? 'default' : 'pointer',
        border: `${borderWidth}px solid ${borderColor}`,
        boxShadow: 'none',
        bgcolor: OZON.white,
        outline: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        '&:hover': {
          borderColor: 'rgba(0, 91, 255, 0.45)',
          boxShadow: 'none',
          '& .project-thumb': { filter: 'none', opacity: 1 },
          '& .card-open-hint': { opacity: isRenaming ? 0 : 1 },
        },
        '&:focus-visible': {
          borderColor: OZON.blue,
          boxShadow: '0 0 0 3px rgba(0, 91, 255, 0.28)',
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Box
          className="project-thumb"
          component="img"
          src={project.thumbnail}
          alt={project.thumbnailAlt}
          sx={{
            width: '100%',
            aspectRatio: '16 / 7',
            objectFit: 'cover',
            display: 'block',
            bgcolor: PROJECTS_PAGE.bg,
            opacity: isDraft ? 0.85 : 1,
            transition: 'opacity 0.15s',
          }}
        />
        <IconButton
          size="small"
          aria-label="Действия с проектом"
          aria-haspopup="menu"
          aria-expanded={Boolean(menuAnchor)}
          onClick={openMenu}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(255, 255, 255, 0.92)',
            border: `1px solid ${PROJECTS_PAGE.border}`,
            '&:hover': { bgcolor: OZON.white },
          }}
        >
          <MoreVert fontSize="small" />
        </IconButton>
        <Typography
          className="card-open-hint"
          sx={{
            position: 'absolute',
            left: 12,
            bottom: 10,
            px: 1,
            py: 0.25,
            borderRadius: '6px',
            bgcolor: 'rgba(0, 26, 52, 0.72)',
            color: OZON.white,
            fontSize: '0.6875rem',
            fontWeight: 600,
            opacity: 0,
            transition: 'opacity 0.15s',
          }}
        >
          Открыть
        </Typography>
      </Box>

      <Box sx={{ p: '16px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {isRenaming ? (
          <TextField
            inputRef={inputRef}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            onBlur={commitRename}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') {
                e.preventDefault();
                commitRename();
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                cancelRename();
              }
            }}
            size="small"
            fullWidth
            aria-label="Новое название проекта"
            sx={{
              mb: 1,
              '& .MuiOutlinedInput-root': {
                fontSize: '1.125rem',
                fontWeight: 600,
                color: OZON.darkSpace,
              },
            }}
          />
        ) : (
          <Typography
            onDoubleClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              startRename();
            }}
            title="Дважды нажмите, чтобы переименовать"
            sx={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: OZON.darkSpace,
              lineHeight: 1.35,
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              cursor: 'text',
              borderRadius: '4px',
              '&:hover': { bgcolor: 'rgba(0, 91, 255, 0.04)' },
            }}
          >
            {project.name}
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
          <AccessTime sx={{ fontSize: 16, color: PROJECTS_PAGE.textMuted }} />
          <Typography sx={{ fontSize: '0.875rem', color: PROJECTS_PAGE.textMuted }}>
            {formatProjectDate(project.updatedAt)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
          <AccountTreeOutlined sx={{ fontSize: 16, color: PROJECTS_PAGE.textMuted }} />
          <Typography sx={{ fontSize: '0.8125rem', color: PROJECTS_PAGE.textMuted }}>
            {project.scenariosCount}{' '}
            {project.scenariosCount === 1
              ? 'сценарий'
              : project.scenariosCount >= 2 && project.scenariosCount <= 4
                ? 'сценария'
                : 'сценариев'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
          <FlagOutlined sx={{ fontSize: 16, color: PROJECTS_PAGE.textMuted }} />
          <Typography sx={{ fontSize: '0.8125rem', color: PROJECTS_PAGE.textMuted }}>
            {project.lastResult.label}
          </Typography>
        </Box>

        {project.activeRun && (
          <Box sx={{ mb: 1.5 }} onClick={(e) => e.stopPropagation()}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.75rem', color: PROJECTS_PAGE.textSecondary }}>
                {project.activeRun.label}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: PROJECTS_PAGE.textSecondary }}>
                {project.activeRun.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={project.activeRun.progress}
              sx={{ height: 6, borderRadius: 999 }}
            />
          </Box>
        )}

        <Box sx={{ mt: 'auto' }}>
          <ProjectStatusBadge status={project.status} />
        </Box>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          disabled={actionLoading}
          onClick={() => {
            closeMenu();
            onOpen?.(project.id);
          }}
        >
          <ListItemIcon><OpenInNew fontSize="small" /></ListItemIcon>
          <ListItemText>Открыть</ListItemText>
        </MenuItem>
        <MenuItem disabled={actionLoading} onClick={startRename}>
          <ListItemIcon><DriveFileRenameOutline fontSize="small" /></ListItemIcon>
          <ListItemText>Переименовать</ListItemText>
        </MenuItem>
        <MenuItem
          disabled={actionLoading}
          onClick={() => {
            void runMenuAction(() => onDuplicate?.(project.id));
          }}
        >
          <ListItemIcon><ContentCopy fontSize="small" /></ListItemIcon>
          <ListItemText>Создать копию</ListItemText>
        </MenuItem>
        {!isArchived && (
          <MenuItem
            disabled={actionLoading}
            onClick={() => {
              void runMenuAction(() => onArchive?.(project.id));
            }}
          >
            <ListItemIcon><ArchiveOutlined fontSize="small" /></ListItemIcon>
            <ListItemText>Архивировать</ListItemText>
          </MenuItem>
        )}
        <Divider />
        <MenuItem
          disabled={actionLoading}
          onClick={() => {
            closeMenu();
            setDeleteOpen(true);
          }}
          sx={{ color: PROJECTS_PAGE.error }}
        >
          <ListItemIcon><DeleteOutline fontSize="small" sx={{ color: PROJECTS_PAGE.error }} /></ListItemIcon>
          <ListItemText>Удалить</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog
        open={deleteOpen}
        onClose={actionLoading ? undefined : () => setDeleteOpen(false)}
        onClick={(e) => e.stopPropagation()}
        aria-labelledby="delete-project-title"
      >
        <DialogTitle id="delete-project-title">Удалить проект?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Проект «{project.name}» будет удалён без возможности восстановления.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} color="inherit" disabled={actionLoading}>
            Отмена
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={actionLoading}
            onClick={() => {
              void confirmDelete();
            }}
            startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {actionLoading ? 'Удаление…' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
