import { Box, Grid, LinearProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusChip } from '@/components/status/StatusChip';
import { COMMON } from '@/constants/platformRu';
import { useScenariosQuery } from '@/hooks/scm/useScmQueries';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitButton } from '@/ui-kit/Button';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';
import { SCENARIO_STATUS_LABELS } from '@/types/stateMachines';

export function ScenariosPage() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useScenariosQuery();

  return (
    <InternalLayout>
      <PageHeader
        title="Сценарии"
        subtitle="What-if анализ и сравнение сценариев"
        actions={
          <>
            <KitButton variant="ghost" onClick={() => navigate('/scenarios/compare')}>
              {COMMON.compare}
            </KitButton>
            <KitButton variant="primary" onClick={() => navigate('/scenarios/new')}>
              {COMMON.new} сценарий
            </KitButton>
          </>
        }
      />

      <EntityStates
        loading={isLoading}
        error={error?.message}
        onRetry={() => void refetch()}
        empty={data?.items.length === 0}
        emptyTitle="Сценарии пока не созданы"
        emptyDescription="Создайте what-if сценарий для оценки влияния"
      >
        {data && (
          <Grid container spacing={2}>
            {data.items.map((s) => (
              <Grid item xs={12} md={6} key={s.id}>
                <KitCard
                  sx={{ cursor: 'pointer', '&:hover': { borderColor: kit.color.iron } }}
                  onClick={() => navigate(`/scenarios/${s.id}`)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" fontWeight={700}>{s.name}</Typography>
                    <StatusChip status={s.status === 'COMPLETED' ? 'SUCCESS' : s.status === 'RUNNING' ? 'INFO' : 'NORMAL'} label={SCENARIO_STATUS_LABELS[s.status]} />
                  </Box>
                  <Typography variant="body2" sx={{ color: kit.color.muted, mb: 1 }}>
                    {s.createdBy} · База: {s.basePlan}
                  </Typography>
                  {s.status === 'RUNNING' && s.progress != null && (
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress variant="determinate" value={s.progress} sx={{ mb: 0.5 }} />
                      <Typography variant="caption">{s.progressMessage}</Typography>
                    </Box>
                  )}
                  {s.recommendationStatus && (
                    <StatusChip status="WARNING" label={s.recommendationStatus} />
                  )}
                </KitCard>
              </Grid>
            ))}
          </Grid>
        )}
      </EntityStates>
    </InternalLayout>
  );
}
