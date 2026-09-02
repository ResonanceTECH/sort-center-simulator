import { useMemo } from 'react';
import { Grid, Typography } from '@mui/material';
import { MetricBarChart } from '@/components/charts/MetricBarChart';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/tables/DataTable';
import { KpiCard } from '@/components/status/KpiCard';
import { COMMON, KPI, SECTION_LABELS, TAB_LABELS } from '@/constants/platformRu';
import { PortalLayout } from '@/layouts/PortalLayout';
import { KitButton } from '@/ui-kit/Button';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';
import type { AppShell } from '@/types/scm/roles';

type PortalShell = Extract<AppShell, 'supplier' | 'carrier'>;

interface DocumentRow {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
}

const DOCUMENTS: DocumentRow[] = [
  { id: 'doc-1', name: 'Упаковочный лист SH-0184.pdf', type: 'Упаковочный лист', uploadedAt: '2026-09-02' },
  { id: 'doc-2', name: 'Счёт ORD-SH-0156.pdf', type: 'Счёт', uploadedAt: '2026-09-01' },
  { id: 'doc-3', name: 'CMR SH-0201.pdf', type: 'CMR', uploadedAt: '2026-08-30' },
];

interface PortalDocumentsPageProps {
  shell: PortalShell;
  title?: string;
}

export function PortalDocumentsPage({ shell, title = TAB_LABELS.documents }: PortalDocumentsPageProps) {
  const columns = useMemo<DataTableColumn<DocumentRow>[]>(
    () => [
      { id: 'name', header: COMMON.document, cell: (row) => row.name },
      { id: 'type', header: COMMON.type, cell: (row) => row.type },
      { id: 'date', header: COMMON.uploaded, cell: (row) => row.uploadedAt },
      {
        id: 'action',
        header: '',
        cell: () => <KitButton variant="ghost" size="small">{COMMON.download}</KitButton>,
      },
    ],
    [],
  );

  return (
    <PortalLayout shell={shell}>
      <PageHeader title={title} subtitle="Загрузка и скачивание документов по поставкам" />
      <KitCard variant="flat" padding="none">
        <DataTable
          data={DOCUMENTS}
          columns={columns}
          total={DOCUMENTS.length}
          page={0}
          pageSize={25}
          onPageChange={() => {}}
          getRowId={(row) => row.id}
        />
      </KitCard>
      <KitButton variant="primary" sx={{ mt: 2 }}>{COMMON.upload} документ</KitButton>
    </PortalLayout>
  );
}

interface PortalPerformancePageProps {
  shell: PortalShell;
  title?: string;
}

export function PortalPerformancePage({ shell, title = TAB_LABELS.performance }: PortalPerformancePageProps) {
  const chart = [
    { label: 'Н1', value: 92 },
    { label: 'Н2', value: 89 },
    { label: 'Н3', value: 91 },
    { label: 'Н4', value: 88 },
  ];

  return (
    <PortalLayout shell={shell}>
      <PageHeader title={title} subtitle="OTIF, SLA и операционные KPI" />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}><KpiCard metric={{ label: KPI.otif, value: 88, unit: '%', status: 'WARNING' }} /></Grid>
        <Grid item xs={6} sm={3}><KpiCard metric={{ label: KPI.onTimePickup, value: 91, unit: '%', status: 'NORMAL' }} /></Grid>
        <Grid item xs={6} sm={3}><KpiCard metric={{ label: KPI.incidents, value: 2, status: 'WARNING' }} /></Grid>
        <Grid item xs={6} sm={3}><KpiCard metric={{ label: KPI.quality, value: 98, unit: '%', status: 'SUCCESS' }} /></Grid>
      </Grid>
      <KitCard>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{SECTION_LABELS.otifTrend}</Typography>
        <MetricBarChart data={chart} />
        <Typography variant="caption" sx={{ color: kit.color.muted }}>Семантические метрики с бэкенда — фронтенд только отображает</Typography>
      </KitCard>
    </PortalLayout>
  );
}

export function SupplierForecastPage() {
  const chart = [
    { label: 'Сен Н1', value: 1200 },
    { label: 'Сен Н2', value: 1350 },
    { label: 'Сен Н3', value: 1280 },
    { label: 'Сен Н4', value: 1420 },
  ];

  return (
    <PortalLayout shell="supplier">
      <PageHeader title="Прогноз" subtitle="Прогноз спроса от заказчика — только для чтения" />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}><KpiCard metric={{ label: 'Спрос на 30 дней', value: '5 250', status: 'NORMAL' }} /></Grid>
        <Grid item xs={12} sm={4}><KpiCard metric={{ label: KPI.confidence, value: 87, unit: '%', status: 'INFO' }} /></Grid>
        <Grid item xs={12} sm={4}><KpiCard metric={{ label: KPI.trend, value: 'UP', status: 'WARNING' }} /></Grid>
      </Grid>
      <KitCard>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Прогноз по неделям</Typography>
        <MetricBarChart data={chart} />
      </KitCard>
    </PortalLayout>
  );
}
