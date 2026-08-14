import { useDeferredValue, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { AppLayout } from '@/layouts/AppLayout';
import { AppSnackbar } from '@/components/shared/AppSnackbar';
import { TopBar } from '@/components/general/TopBar';
import { ReportsHeader } from '@/components/reports/ReportsHeader';
import { ReportsToolbar } from '@/components/reports/ReportsToolbar';
import { ReportsTable } from '@/components/reports/ReportsTable';
import {
  ReportsEmpty,
  ReportsError,
  ReportsSkeleton,
} from '@/components/reports/ReportsStates';
import { useReportsData } from '@/hooks/useReportsData';
import { useUiStore } from '@/store/uiStore';
import { deleteReport, downloadReport } from '@/services/reportsService';
import { getErrorMessage } from '@/utils/error';
import type { ReportFormat, ReportListItem, ReportStatus, ReportType } from '@/types/reports';

export function Reports() {
  const { searchQuery, showSnackbar } = useUiStore();
  const deferredSearch = useDeferredValue(searchQuery);

  const [type, setType] = useState<ReportType | 'all'>('all');
  const [status, setStatus] = useState<ReportStatus | 'all'>('all');
  const [format, setFormat] = useState<ReportFormat | 'all'>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data, error, loading, retry } = useReportsData({
    search: deferredSearch,
    type,
    status,
    format,
  });

  const reports = data?.reports ?? [];
  const totalCount = data?.totalCount ?? 0;
  const hasFilters =
    deferredSearch.trim().length > 0 || type !== 'all' || status !== 'all' || format !== 'all';

  const handleDownload = async (report: ReportListItem) => {
    setBusyId(report.id);
    try {
      await downloadReport(report.id);
      showSnackbar('Загрузка отчёта началась', 'success');
    } catch (err) {
      showSnackbar(getErrorMessage(err, 'Не удалось скачать отчёт'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (report: ReportListItem) => {
    setBusyId(report.id);
    try {
      await deleteReport(report.id);
      await retry();
      showSnackbar('Отчёт удалён', 'success');
    } catch (err) {
      showSnackbar(getErrorMessage(err, 'Не удалось удалить отчёт'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const showInitialLoading = loading && !data && !error;
  const showError = Boolean(error) && !data && !loading;

  return (
    <AppLayout topBar={<TopBar notifications={[]} />}>
      <ReportsHeader />

      {showInitialLoading && <ReportsSkeleton />}

      {showError && <ReportsError onRetry={retry} />}

      {!showInitialLoading && !showError && (
        <Box sx={{ position: 'relative' }}>
          <ReportsToolbar
            type={type}
            status={status}
            format={format}
            foundCount={totalCount}
            onTypeChange={setType}
            onStatusChange={setStatus}
            onFormatChange={setFormat}
          />

          {loading && data && (
            <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
              <CircularProgress size={18} />
            </Box>
          )}

          {totalCount === 0 ? (
            <ReportsEmpty filtered={hasFilters} />
          ) : (
            <ReportsTable
              reports={reports}
              busyId={busyId}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />
          )}
        </Box>
      )}

      <AppSnackbar />
    </AppLayout>
  );
}
