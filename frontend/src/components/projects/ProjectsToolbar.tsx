import {
  Box,
  FormControl,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  GridViewOutlined,
  TableRowsOutlined,
} from '@mui/icons-material';
import { PROJECTS_PAGE, SORT_OPTIONS, STATUS_FILTER_OPTIONS } from '@/constants/projects';
import { OZON } from '@/theme';
import type { ProjectListStatus, ProjectSortOption, ProjectViewMode } from '@/types/projects';

interface ProjectsToolbarProps {
  status: ProjectListStatus | 'all';
  sort: ProjectSortOption;
  view: ProjectViewMode;
  foundCount: number;
  onStatusChange: (value: ProjectListStatus | 'all') => void;
  onSortChange: (value: ProjectSortOption) => void;
  onViewChange: (value: ProjectViewMode) => void;
}

export function ProjectsToolbar({
  status,
  sort,
  view,
  foundCount,
  onStatusChange,
  onSortChange,
  onViewChange,
}: ProjectsToolbarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: { xs: 'wrap', lg: 'nowrap' },
        alignItems: 'center',
        gap: 1.5,
        mb: 3,
      }}
    >
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <Select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as ProjectListStatus | 'all')}
          displayEmpty
          sx={{ bgcolor: OZON.white, borderRadius: '14px' }}
          inputProps={{ 'aria-label': 'Фильтр по статусу' }}
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 240, flex: { lg: '0 1 260px' } }}>
        <Select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as ProjectSortOption)}
          sx={{ bgcolor: OZON.white, borderRadius: '14px' }}
          inputProps={{ 'aria-label': 'Сортировка проектов' }}
        >
          {SORT_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <ToggleButtonGroup
        exclusive
        size="small"
        value={view}
        onChange={(_, next) => {
          if (next) onViewChange(next);
        }}
        aria-label="Режим отображения"
        sx={{
          bgcolor: OZON.white,
          '& .MuiToggleButton-root': {
            borderColor: PROJECTS_PAGE.border,
            color: PROJECTS_PAGE.textSecondary,
            px: 1.25,
            '&.Mui-selected': {
              bgcolor: 'rgba(9, 9, 11, 0.08)',
              color: OZON.blue,
              borderColor: 'rgba(9, 9, 11, 0.20)',
            },
          },
        }}
      >
        <ToggleButton value="cards" aria-label="Карточки">
          <GridViewOutlined sx={{ fontSize: 18, mr: 0.75 }} />
          Карточки
        </ToggleButton>
        <ToggleButton value="table" aria-label="Таблица">
          <TableRowsOutlined sx={{ fontSize: 18, mr: 0.75 }} />
          Таблица
        </ToggleButton>
      </ToggleButtonGroup>

      <Typography
        sx={{
          ml: { lg: 'auto' },
          fontSize: '0.8125rem',
          color: PROJECTS_PAGE.textSecondary,
          whiteSpace: 'nowrap',
        }}
      >
        Найдено {foundCount}{' '}
        {foundCount === 1 ? 'проект' : foundCount >= 2 && foundCount <= 4 ? 'проекта' : 'проектов'}
      </Typography>
    </Box>
  );
}
