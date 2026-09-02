import { Box, Grid, Typography } from '@mui/material';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { KpiCard } from '@/components/status/KpiCard';
import { KPI, NAV_LABELS, SECTION_LABELS } from '@/constants/platformRu';
import { useDemandForecastQuery } from '@/hooks/scm/useScmQueries';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitButton } from '@/ui-kit/Button';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';

export function DemandForecastPage() {
  const { data, isLoading, error, refetch } = useDemandForecastQuery();

  return (
    <InternalLayout>
      <PageHeader
        title={NAV_LABELS.demandForecast}
        subtitle="Исторический спрос · прогноз · доверительный интервал"
        actions={<KitButton variant="primary">Пересчитать</KitButton>}
      />

      <EntityStates loading={isLoading} error={error?.message} onRetry={() => void refetch()}>
        {data && (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <KpiCard metric={{ label: KPI.trend, value: data.trend, status: data.trend === 'UP' ? 'WARNING' : 'NORMAL' }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <KpiCard metric={{ label: KPI.version, value: data.version, status: 'INFO' }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <KpiCard metric={{ label: KPI.seasonality, value: data.seasonality.slice(0, 20) + '…', status: 'INFO' }} />
              </Grid>
            </Grid>

            <KitCard sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{SECTION_LABELS.forecastChart}</Typography>
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={data.series}>
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: kit.color.muted }} />
                    <YAxis tick={{ fontSize: 12, fill: kit.color.muted }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="actual" stroke={kit.color.obsidian} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="forecast" stroke={kit.color.ember} strokeWidth={2} strokeDasharray="4 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </KitCard>

            {data.anomalies.length > 0 && (
              <KitCard>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{SECTION_LABELS.anomalies}</Typography>
                {data.anomalies.map((a) => (
                  <Typography key={a.date} variant="body2">{a.date}: {a.description}</Typography>
                ))}
              </KitCard>
            )}
          </>
        )}
      </EntityStates>
    </InternalLayout>
  );
}
