import { useMemo, useState } from 'react';
import {
  Box,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ActivityTimeline } from '@/components/common/ActivityTimeline';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { LiveMapPanel } from '@/components/maps/LiveMapPanel';
import { ExceptionCard } from '@/components/scenarios/ExceptionCard';
import { StatusChip } from '@/components/status/StatusChip';
import { resolveShipmentActions, type ShipmentAction } from '@/constants/businessActions';
import {
  NAV_LABELS,
  KPI,
  COMMON,
  SECTION_LABELS,
  SHIPMENT_ACTION_LABELS,
  labelSeverity,
} from '@/constants/platformRu';
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
import type { MapLayerType } from '@/types/scm/map';
import { INCIDENT_STATUS_LABELS, SHIPMENT_STATUS_LABELS } from '@/types/stateMachines';

const SHIPMENT_MAP_LAYERS: MapLayerType[] = ['shipments', 'routes', 'hubs', 'warehouses'];

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

  const mapLayers = useMemo(() => SHIPMENT_MAP_LAYERS, []);

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
              subtitle={`${data.origin} → ${data.destination}${data.orderId ? ` · ${data.orderId}` : ''}`}
              breadcrumbs={[
                { label: NAV_LABELS.controlTower, to: '/control-tower' },
                { label: 'Поставки', to: '/shipments' },
                { label: data.id },
              ]}
              actions={
                <>
                  {canAction('CREATE_INCIDENT') && (
                    <KitButton variant="ghost" onClick={() => navigate('/incidents')}>
                      {SHIPMENT_ACTION_LABELS.CREATE_INCIDENT}
                    </KitButton>
                  )}
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
              <Grid item xs={6} sm={4} md={2.4}>
                <KitCard>
                  <Typography variant="caption" sx={{ color: kit.color.muted }}>{COMMON.status}</Typography>
                  <Typography variant="h6" fontSize="1rem">{SHIPMENT_STATUS_LABELS[data.status]}</Typography>
                </KitCard>
              </Grid>
              <Grid item xs={6} sm={4} md={2.4}>
                <KitCard>
                  <Typography variant="caption" sx={{ color: kit.color.muted }}>{SECTION_LABELS.pickup}</Typography>
                  <Typography variant="h6" fontSize="1rem">
                    {new Date(data.pickupAt).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })}
                  </Typography>
                </KitCard>
              </Grid>
              <Grid item xs={6} sm={4} md={2.4}>
                <KitCard>
                  <Typography variant="caption" sx={{ color: kit.color.muted }}>{SECTION_LABELS.plannedEta}</Typography>
                  <Typography variant="h6" fontSize="1rem">
                    {new Date(data.plannedEta).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })}
                  </Typography>
                </KitCard>
              </Grid>
              <Grid item xs={6} sm={4} md={2.4}>
                <KitCard>
                  <Typography variant="caption" sx={{ color: kit.color.muted }}>{KPI.forecastEta}</Typography>
                  <Typography variant="h6" fontSize="1rem">
                    {new Date(data.forecastEta).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })}
                  </Typography>
                </KitCard>
              </Grid>
              <Grid item xs={6} sm={4} md={2.4}>
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

            <KitCard sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{SECTION_LABELS.map}</Typography>
              <LiveMapPanel
                data={data.mapView}
                activeLayers={mapLayers}
                fitToData
                clustering={false}
                height={300}
              />
            </KitCard>

            {canAction('CHANGE_CARRIER') && (
              <KitCard sx={{ mb: 3, maxWidth: 360 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  {SHIPMENT_ACTION_LABELS.CHANGE_CARRIER}
                </Typography>
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

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={8}>
                <KitCard sx={{ mb: { xs: 3, md: 0 } }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{SECTION_LABELS.timeline}</Typography>
                  <ActivityTimeline
                    items={data.timeline.map((e) => ({
                      id: e.id,
                      timestamp: e.timestamp,
                      actor: e.type,
                      action: e.title,
                      detail: e.relatedEntityId
                        ? `${e.relatedEntityType ?? 'entity'}: ${e.relatedEntityId}`
                        : e.description,
                    }))}
                  />
                </KitCard>
              </Grid>
              <Grid item xs={12} md={4}>
                <KitCard sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{SECTION_LABELS.partners}</Typography>
                  <Box
                    sx={{
                      p: 1.5,
                      mb: 1.5,
                      borderRadius: kit.radius.button,
                      border: kit.border.hairline,
                      cursor: 'pointer',
                      '&:hover': { borderColor: kit.color.ember },
                    }}
                    onClick={() => navigate(`/suppliers/${data.supplierId}`)}
                  >
                    <Typography variant="caption" sx={{ color: kit.color.muted }}>{COMMON.supplier}</Typography>
                    <Typography variant="body2" fontWeight={600}>{data.supplierName}</Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: kit.radius.button,
                      border: kit.border.hairline,
                      cursor: 'pointer',
                      '&:hover': { borderColor: kit.color.ember },
                    }}
                    onClick={() => navigate(`/carriers/${data.carrierId}`)}
                  >
                    <Typography variant="caption" sx={{ color: kit.color.muted }}>{COMMON.carrier}</Typography>
                    <Typography variant="body2" fontWeight={600}>{data.carrierName}</Typography>
                  </Box>
                </KitCard>
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

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <KitCard>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{SECTION_LABELS.exceptions}</Typography>
                  {data.exceptions.length === 0 ? (
                    <Typography variant="body2" sx={{ color: kit.color.muted }}>{SECTION_LABELS.noExceptions}</Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {data.exceptions.map((exc) => (
                        <ExceptionCard
                          key={exc.id}
                          exception={exc}
                          onClick={() => navigate(`/exceptions/${exc.id}`)}
                        />
                      ))}
                    </Box>
                  )}
                </KitCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <KitCard>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{SECTION_LABELS.incidents}</Typography>
                  {data.incidents.length === 0 ? (
                    <Typography variant="body2" sx={{ color: kit.color.muted }}>{SECTION_LABELS.noIncidents}</Typography>
                  ) : (
                    <List disablePadding>
                      {data.incidents.map((inc) => (
                        <ListItem key={inc.id} disablePadding sx={{ mb: 1 }}>
                          <ListItemButton
                            onClick={() => navigate(`/incidents/${inc.id}`)}
                            sx={{
                              borderRadius: kit.radius.button,
                              border: kit.border.hairline,
                              '&:hover': { borderColor: kit.color.ember },
                            }}
                          >
                            <ListItemText
                              primary={inc.title}
                              secondary={
                                <Box component="span" sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
                                  <StatusChip status={inc.severity} label={labelSeverity(inc.severity)} />
                                  <Typography component="span" variant="caption" sx={{ color: kit.color.muted }}>
                                    {INCIDENT_STATUS_LABELS[inc.status]}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </KitCard>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <KitCard>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{SECTION_LABELS.documents}</Typography>
                  {data.documents.length === 0 ? (
                    <Typography variant="body2" sx={{ color: kit.color.muted }}>{SECTION_LABELS.noDocuments}</Typography>
                  ) : (
                    <List disablePadding>
                      {data.documents.map((doc) => (
                        <ListItem
                          key={doc.id}
                          disablePadding
                          sx={{
                            py: 1,
                            borderBottom: kit.border.hairline,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{doc.name}</Typography>
                            <Typography variant="caption" sx={{ color: kit.color.muted }}>
                              {doc.type} · {doc.uploadedAt}
                            </Typography>
                          </Box>
                          <KitButton variant="ghost" size="small">{COMMON.download}</KitButton>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </KitCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <KitCard>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{SECTION_LABELS.activity}</Typography>
                  <ActivityTimeline items={data.activity} />
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
