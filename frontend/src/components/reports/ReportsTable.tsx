import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { DeleteOutline, DownloadOutlined } from '@mui/icons-material';
import {
  REPORT_STATUS_CONFIG,
  REPORT_TYPE_LABELS,
  formatFileSize,
} from '@/constants/reports';
import { PROJECTS_PAGE } from '@/constants/projects';
import { OZON } from '@/theme';
import type { ReportListItem } from '@/types/reports';

interface ReportsTableProps {
  reports: ReportListItem[];
  busyId: string | null;
  onDownload: (report: ReportListItem) => Promise<void> | void;
  onDelete: (report: ReportListItem) => Promise<void> | void;
}

function StatusBadge({ status }: { status: ReportListItem['status'] }) {
  const config = REPORT_STATUS_CONFIG[status];
  return (
    <Box
      sx={{
        display: 'inline-flex',
        px: 1.25,
        py: 0.35,
        borderRadius: '999px',
        bgcolor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
      }}
    >
      <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
        {config.label}
      </Typography>
    </Box>
  );
}

export function ReportsTable({
  reports,
  busyId,
  onDownload,
  onDelete,
}: ReportsTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<ReportListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await onDelete(deleteTarget);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{ border: `1px solid ${PROJECTS_PAGE.border}`, boxShadow: 'none' }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Проект</TableCell>
              <TableCell>Сценарий</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Формат</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell>Размер</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => {
              const rowBusy = busyId === report.id;
              const canDownload = report.status === 'ready';

              return (
                <TableRow key={report.id} hover>
                  <TableCell>
                    <Typography fontWeight={600} fontSize="0.875rem">
                      {report.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontSize="0.8125rem" color="text.secondary">
                      {report.projectName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontSize="0.8125rem" color="text.secondary">
                      {report.scenarioName ?? '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontSize="0.8125rem">
                      {REPORT_TYPE_LABELS[report.type]}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      fontSize="0.8125rem"
                      sx={{ textTransform: 'uppercase', fontWeight: 600, color: OZON.darkSpace }}
                    >
                      {report.format}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={report.status} />
                  </TableCell>
                  <TableCell>
                    <Typography fontSize="0.8125rem" color="text.secondary" whiteSpace="nowrap">
                      {format(parseISO(report.createdAt), 'd MMM yyyy, HH:mm', { locale: ru })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontSize="0.8125rem" color="text.secondary" whiteSpace="nowrap">
                      {report.fileSizeBytes > 0 ? formatFileSize(report.fileSizeBytes) : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'inline-flex', gap: 0.5 }}>
                      <Tooltip title={canDownload ? 'Скачать' : 'Отчёт недоступен для скачивания'}>
                        <span>
                          <IconButton
                            size="small"
                            aria-label={`Скачать ${report.name}`}
                            disabled={!canDownload || rowBusy}
                            onClick={() => {
                              void onDownload(report);
                            }}
                          >
                            {rowBusy ? (
                              <CircularProgress size={16} />
                            ) : (
                              <DownloadOutlined fontSize="small" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <span>
                          <IconButton
                            size="small"
                            aria-label={`Удалить ${report.name}`}
                            disabled={rowBusy}
                            onClick={() => setDeleteTarget(report)}
                            sx={{ color: PROJECTS_PAGE.error }}
                          >
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={deleting ? undefined : () => setDeleteTarget(null)}
        aria-labelledby="delete-report-title"
      >
        <DialogTitle id="delete-report-title">Удалить отчёт?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Отчёт «{deleteTarget?.name}» будет удалён без возможности восстановления.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} color="inherit" disabled={deleting}>
            Отмена
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={deleting}
            onClick={() => {
              void confirmDelete();
            }}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {deleting ? 'Удаление…' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
