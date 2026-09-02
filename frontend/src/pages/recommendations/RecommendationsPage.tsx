import { useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusChip } from '@/components/status/StatusChip';
import { COMMON, SHIPMENT_ACTION_LABELS, labelComparison } from '@/constants/platformRu';
import { useApplyRecommendationMutation } from '@/hooks/scm/useScmMutations';
import { useRecommendationsQuery } from '@/hooks/scm/useScmQueries';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitButton } from '@/ui-kit/Button';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';

export function RecommendationsPage() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useRecommendationsQuery();
  const applyRecommendation = useApplyRecommendationMutation();
  const [pendingApplyId, setPendingApplyId] = useState<string | null>(null);

  return (
    <InternalLayout>
      <PageHeader title="Рекомендации" subtitle="Человек в контуре — проверка → одобрение → применение" />

      <EntityStates
        loading={isLoading}
        error={error?.message}
        onRetry={() => void refetch()}
        empty={data?.length === 0}
        emptyTitle="Нет рекомендаций"
      >
        {data && (
          <Grid container spacing={2}>
            {data.map((rec) => (
              <Grid item xs={12} key={rec.id}>
                <KitCard>
                  <Typography variant="overline" sx={{ color: kit.color.muted }}>РЕКОМЕНДУЕМОЕ ДЕЙСТВИЕ</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{rec.title}</Typography>
                  <Typography variant="body2" sx={{ color: kit.color.muted, mb: 2 }}>{rec.description}</Typography>

                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>ОЖИДАЕМЫЙ ЭФФЕКТ</Typography>
                  {rec.expectedEffects.map((e) => (
                    <Box key={e.label} sx={{ display: 'flex', gap: 2, py: 0.5 }}>
                      <Typography variant="body2" sx={{ width: 120 }}>{e.label}</Typography>
                      <Typography variant="body2">
                        {e.values.current}{e.unit ?? ''} → {e.values.expected}{e.unit ?? ''}
                      </Typography>
                      {e.semantic?.expected && (
                        <StatusChip
                          status={e.semantic.expected === 'BEST' ? 'SUCCESS' : 'WARNING'}
                          label={labelComparison(e.semantic.expected)}
                        />
                      )}
                    </Box>
                  ))}

                  <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                    <KitButton variant="primary" onClick={() => setPendingApplyId(rec.id)}>
                      {COMMON.apply}
                    </KitButton>
                    <KitButton variant="ghost" onClick={() => navigate('/scenarios/new')}>
                      {SHIPMENT_ACTION_LABELS.CREATE_SCENARIO}
                    </KitButton>
                    <KitButton variant="ghost">{COMMON.modify}</KitButton>
                    <KitButton variant="ghost">{COMMON.reject}</KitButton>
                    <KitButton variant="secondary">{COMMON.save}</KitButton>
                  </Box>
                </KitCard>
              </Grid>
            ))}
          </Grid>
        )}
      </EntityStates>

      <ConfirmDialog
        open={pendingApplyId != null}
        title="Применить рекомендацию"
        message="Применить рекомендацию? Изменения повлияют на активный план."
        confirmLabel={COMMON.apply}
        loading={applyRecommendation.isPending}
        onConfirm={() => {
          if (pendingApplyId) {
            applyRecommendation.mutate(pendingApplyId, {
              onSuccess: () => setPendingApplyId(null),
            });
          }
        }}
        onCancel={() => setPendingApplyId(null)}
      />
    </InternalLayout>
  );
}
