import { useState } from 'react';
import { Box, Grid, MenuItem, Select, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ActivityTimeline } from '@/components/common/ActivityTimeline';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusChip } from '@/components/status/StatusChip';
import { resolveShipmentActions, type ShipmentAction } from '@/constants/businessActions';
import { NAV_LABELS, KPI, COMMON, SECTION_LABELS, SHIPMENT_ACTION_LABELS } from '@/constants/platformRu';
import {
  useCancelShipmentMutation,
  useChangeCarrierMutation,
} from '@/hooks/scm/useScmMutations';
import { usePermissions } from '@/hooks/usePermissions';
import { useShipmentQuery } from '@/hooks/scm/useScmQueries';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitButton } from '@/ui-kit/Button';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';
import { SHIPMENT_STATUS_LABELS } from '@/types/stateMachines';

export function ShipmentDetailPage() {
  const { shipmentId = '' } = useParams();
  const navigate = useNavigate();
  const { role } = usePermissions();
  const { data, isLoading, error, refetch } = useShipmentQuery(shipmentId);
  const changeCarrier = useChangeCarrierMutation();
  const cancelShipment = useCancelShipmentMutation();

  const allowedActions = data
    ? resolveShipmentActions(role, data.status, data.availableActions)
    : [];

  const canAction = (action: ShipmentAction) => allowedActions.includes(action);

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState('car-0');

  const handleChangeCarrier = () => {
    changeCarrier.mutate({ shipmentId, carrierId: selectedCarrier });
  };

  return (
    <InternalLayout>
      <EntityStates
        loading={isLoading}
        error={error?.message}
        onRetry={() => void refetch()}
        empty={!data && !isLoading && !error}
        emptyTitle="Поставка не найдена"
      >
        {data && (
          <>
            <PageHeader
              title={data.id}
              subtitle={`${data.origin} → ${data.destination}`}
              breadcrumbs={[
                { label: NAV_LABELS.controlTower, to: '/control-tower' },
                { label: 'Поставки', to: '/shipments' },
                { label: data.id },
              ]}
              actions={
                <>
                  {canAction('CREATE_SCENARIO') && (
                    <KitButton variant="ghost" onClick={() => navigate('/scenarios/new')}>
                      {SHIPMENT_ACTION_LABELS.CREATE_SCENARIO}
                    </KitButton>
                  )}
                  {canAction('CHANGE_CARRIER') && (
                    <KitButton
                      variant="primary"
                      loading={changeCarrier.isPending}
                      onClick={handleChangeCarrier}
                    >
                      {SHIPMENT_ACTION_LABELS.CHANGE_CARRIER}
                    </KitButton>
                  )}
                  {canAction('CANCEL') && (
                    <KitButton variant="danger" onClick={() => setConfirmCancel(true)}>
                      {SHIPMENT_ACTION_LABELS.CANCEL}
                    </KitButton>
                  )}
                </>
              }
            />

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <KitCard>
                  <Typography variant="caption" sx={{ color: kit.color.muted }}>{COMMON.status}</Typography>
                  <Typography variant="h6">{SHIPMENT_STATUS_LABELS[data.status]}</Typography>
                </KitCard>
              </Grid>
              <Grid item xs={12} md={4}>
                <KitCard>
                  <Typography variant="caption" sx={{ color: kit.color.muted }}>{KPI.forecastEta}</Typography>
                  <Typography variant="h6">{new Date(data.forecastEta).toLocaleString('ru-RU')}</Typography>
                </KitCard>
              </Grid>
              <Grid item xs={12} md={4}>
                <KitCard>
                  <Typography variant="caption" sx={{ color: kit.color.muted }}>{KPI.slaRisk}</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <StatusChip
                      status={data.slaRisk.status}
                      label={`${data.slaRisk.value}${data.slaRisk.unit ?? ''}`}
                    />
                  </Box>
                </KitCard>
              </Grid>
            </Grid>

            {canAction('CHANGE_CARRIER') && (
              <KitCard sx={{ mb: 3, maxWidth: 360 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>{SHIPMENT_ACTION_LABELS.CHANGE_CARRIER}</Typography>
                <Select
                  size="small"
                  fullWidth
                  value={selectedCarrier}
                  onChange={(e) => setSelectedCarrier(e.target.value)}
                >
                  <MenuItem value="car-0">Перевозчик A</MenuItem>
                  <MenuItem value="car-1">Перевозчик B</MenuItem>
                  <MenuItem value="car-2">Перевозчик C</MenuItem>
                </Select>
              </KitCard>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <KitCard sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{SECTION_LABELS.timeline}</Typography>
                  <ActivityTimeline
                    items={data.timeline.map((e) => ({
                      id: e.id,
                      timestamp: e.timestamp,
                      actor: e.type,
                      action: e.title,
                    }))}
                  />
                </KitCard>
              </Grid>
              <Grid item xs={12} md={5}>
                <KitCard>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{SECTION_LABELS.cargoSku}</Typography>
                  {data.skus.map((sku) => (
                    <Box key={sku.sku} sx={{ py: 1, borderBottom: kit.border.hairline }}>
                      <Typography variant="body2" fontWeight={600}>{sku.sku}</Typography>
                      <Typography variant="caption" sx={{ color: kit.color.muted }}>
                        {sku.name} · {sku.quantity} шт.
                      </Typography>
                    </Box>
                  ))}
                </KitCard>
              </Grid>
            </Grid>

            <ConfirmDialog
              open={confirmCancel}
              title={SHIPMENT_ACTION_LABELS.CANCEL}
              message={`Отменить поставку ${data.id}? Это действие нельзя отменить.`}
              confirmLabel={SHIPMENT_ACTION_LABELS.CANCEL}
              destructive
              loading={cancelShipment.isPending}
              onConfirm={() => {
                cancelShipment.mutate(shipmentId, {
                  onSuccess: () => setConfirmCancel(false),
                });
              }}
              onCancel={() => setConfirmCancel(false)}
            />
          </>
        )}
      </EntityStates>
    </InternalLayout>
  );
}
