import {
  Box,
  FormControl,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import {
  REPORT_FORMAT_OPTIONS,
  REPORT_STATUS_OPTIONS,
  REPORT_TYPE_OPTIONS,
} from '@/constants/reports';
import { PROJECTS_PAGE } from '@/constants/projects';
import { OZON } from '@/theme';
import type { ReportFormat, ReportStatus, ReportType } from '@/types/reports';

interface ReportsToolbarProps {
  type: ReportType | 'all';
  status: ReportStatus | 'all';
  format: ReportFormat | 'all';
  foundCount: number;
  onTypeChange: (value: ReportType | 'all') => void;
  onStatusChange: (value: ReportStatus | 'all') => void;
  onFormatChange: (value: ReportFormat | 'all') => void;
}

export function ReportsToolbar({
  type,
  status,
  format,
  foundCount,
  onTypeChange,
  onStatusChange,
  onFormatChange,
}: ReportsToolbarProps) {
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
          value={type}
          onChange={(e) => onTypeChange(e.target.value as ReportType | 'all')}
          sx={{ bgcolor: OZON.white, borderRadius: '10px' }}
          inputProps={{ 'aria-label': 'Фильтр по типу' }}
        >
          {REPORT_TYPE_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <Select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as ReportStatus | 'all')}
          sx={{ bgcolor: OZON.white, borderRadius: '10px' }}
          inputProps={{ 'aria-label': 'Фильтр по статусу' }}
        >
          {REPORT_STATUS_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <Select
          value={format}
          onChange={(e) => onFormatChange(e.target.value as ReportFormat | 'all')}
          sx={{ bgcolor: OZON.white, borderRadius: '10px' }}
          inputProps={{ 'aria-label': 'Фильтр по формату' }}
        >
          {REPORT_FORMAT_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography
        sx={{
          ml: { lg: 'auto' },
          fontSize: '0.8125rem',
          color: PROJECTS_PAGE.textSecondary,
          whiteSpace: 'nowrap',
        }}
      >
        Найдено {foundCount}{' '}
        {foundCount === 1 ? 'отчёт' : foundCount >= 2 && foundCount <= 4 ? 'отчёта' : 'отчётов'}
      </Typography>
    </Box>
  );
}
