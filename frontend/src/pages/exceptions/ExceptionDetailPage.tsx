import { useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusChip } from '@/components/status/StatusChip';
import { labelExceptionType, COMMON, NAV_LABELS, SECTION_LABELS, SHIPMENT_ACTION_LABELS } from '@/constants/platformRu';
import { useCreateIncidentMutation } from '@/hooks/scm/useScmMutations';
import { useExceptionQuery } from '@/hooks/scm/useScmQueries';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitButton } from '@/ui-kit/Button';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';

export function ExceptionDetailPage() {
  const { exceptionId = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useExceptionQuery(exceptionId);
  const createIncident = useCreateIncidentMutation();
  const [confirmIncident, setConfirmIncident] = useState(false);

  return (
    <InternalLayout>
      <EntityStates loading={isLoading} error={error?.message} onRetry={() => void refetch()}>
        {data && (
          <>
            <PageHeader
              title={labelExceptionType(data.type)}
              subtitle={data.shipmentId}
              breadcrumbs={[
                { label: NAV_LABELS.controlTower, to: '/control-tower' },
                { label: 'Отклонения', to: '/exceptions' },
                { label: data.id },
              ]}
              actions={
                <>
                  <KitButton variant="ghost" onClick={() => navigate(`/shipments/${data.shipmentId}`)}>
                    {COMMON.openShipment}
                  </KitButton>
                  <KitButton variant="ghost" onClick={() => setConfirmIncident(true)}>
                    {SHIPMENT_ACTION_LABELS.CREATE_INCIDENT}
                  </KitButton>
                  <KitButton variant="primary" onClick={() => navigate('/scenarios/new')}>
                    {SHIPMENT_ACTION_LABELS.CREATE_SCENARIO}
                  </KitButton>
                </>
              }
            />

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <KitCard sx={{ mb: 2 }}>
                  <Typography variant="overline" sx={{ color: kit.color.muted }}>Что произошло</Typography>
                  <Typography variant="h6" sx={{ mb: 2 }}>{data.description}</Typography>
                  <StatusChip status={data.severityStatus} label={data.severity} />
                </KitCard>

                <KitCard sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>Почему</Typography>
                  {data.causes.map((cause) => (
                    <Typography key={cause} variant="body2" sx={{ py: 0.5 }}>• {cause}</Typography>
                  ))}
                </KitCard>

                <KitCard>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>{SECTION_LABELS.impact}</Typography>
                  <Typography variant="body2">Запасы: {data.inventoryImpact}</Typography>
                  <Typography variant="body2">Заказы: {data.orderImpact}</Typography>
                  <Typography variant="body2">SLA: {data.slaImpact}</Typography>
                </KitCard>
              </Grid>
              <Grid item xs={12} md={4}>
                <KitCard>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>{SECTION_LABELS.details}</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2"><strong>{COMMON.routeCol}:</strong> {data.route}</Typography>
                    <Typography variant="body2"><strong>Отклонение:</strong> {data.deviation}</Typography>
                    <Typography variant="body2"><strong>{COMMON.owner}:</strong> {data.owner}</Typography>
                    <Typography variant="body2"><strong>Вероятность:</strong> {Math.round(data.probability * 100)}%</Typography>
                  </Box>
                </KitCard>
              </Grid>
            </Grid>

            <ConfirmDialog
              open={confirmIncident}
              title={SHIPMENT_ACTION_LABELS.CREATE_INCIDENT}
              message="Создать инцидент на основе этого отклонения?"
              confirmLabel={COMMON.confirm}
              loading={createIncident.isPending}
              onConfirm={() => {
                createIncident.mutate(exceptionId, {
                  onSuccess: (result) => {
                    setConfirmIncident(false);
                    navigate(`/incidents/${result.incidentId}`);
                  },
                });
              }}
              onCancel={() => setConfirmIncident(false)}
            />
          </>
        )}
      </EntityStates>
    </InternalLayout>
  );
}
