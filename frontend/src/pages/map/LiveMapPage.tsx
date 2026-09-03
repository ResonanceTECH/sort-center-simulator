import { useMemo, useState } from 'react';
import { Box, Chip, Drawer, Grid, Typography } from '@mui/material';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { LiveMapPanel, LAYER_LABELS } from '@/components/maps/LiveMapPanel';
import { StatusChip } from '@/components/status/StatusChip';
import { labelSemantic, NAV_LABELS } from '@/constants/platformRu';
import { useLiveMapData } from '@/hooks/scm/useLiveMapData';
import { InternalLayout } from '@/layouts/InternalLayout';
import type { MapGeofence, MapLayerType, MapMarker } from '@/types/scm/map';
import { kit } from '@/ui-kit/tokens';

const LAYER_KEYS = Object.keys(LAYER_LABELS) as MapLayerType[];

export function LiveMapPage() {
  const { data, isLoading, error, refetch, dataUpdatedAt } = useLiveMapData();
  const [activeLayers, setActiveLayers] = useState<MapLayerType[]>([
    'shipments',
    'routes',
    'vehicles',
    'riskZones',
    'warehouses',
    'hubs',
  ]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [selectedGeofence, setSelectedGeofence] = useState<MapGeofence | null>(null);

  const toggleLayer = (layer: MapLayerType) => {
    setActiveLayers((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer],
    );
  };

  const drawerMarker = useMemo(() => {
    if (!selectedMarker || !data) return selectedMarker;
    return data.markers.find((m) => m.id === selectedMarker.id) ?? selectedMarker;
  }, [selectedMarker, data]);

  const lastUpdate = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <InternalLayout>
      <PageHeader
        title={NAV_LABELS.liveMap}
        subtitle="MapLibre — кластеризация, geofence-полигоны, live GPS (mock SSE)"
        actions={
          lastUpdate ? (
            <Chip
              size="small"
              label={`Live · ${lastUpdate}`}
              color="success"
              variant="outlined"
              sx={{ borderRadius: kit.radius.button }}
            />
          ) : undefined
        }
      />

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        {LAYER_KEYS.map((layer) => (
          <Chip
            key={layer}
            label={LAYER_LABELS[layer]}
            onClick={() => toggleLayer(layer)}
            color={activeLayers.includes(layer) ? 'primary' : 'default'}
            variant={activeLayers.includes(layer) ? 'filled' : 'outlined'}
            sx={{ borderRadius: kit.radius.button }}
          />
        ))}
      </Box>

      <EntityStates loading={isLoading} error={error?.message} onRetry={() => void refetch()}>
        {data && (
          <LiveMapPanel
            data={data}
            activeLayers={activeLayers}
            clustering
            onMarkerSelect={(marker) => {
              setSelectedGeofence(null);
              setSelectedMarker(marker);
            }}
            onGeofenceSelect={(geofence) => {
              setSelectedMarker(null);
              setSelectedGeofence(geofence);
            }}
          />
        )}
      </EntityStates>

      <Drawer
        anchor="right"
        open={Boolean(drawerMarker || selectedGeofence)}
        onClose={() => {
          setSelectedMarker(null);
          setSelectedGeofence(null);
        }}
      >
        {drawerMarker && (
          <Box sx={{ width: 320, p: 3 }}>
            <Typography variant="h6" fontWeight={700}>{drawerMarker.label}</Typography>
            <StatusChip status={drawerMarker.status} label={LAYER_LABELS[drawerMarker.type]} />
            <Grid container spacing={1} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <Typography variant="caption">Lat</Typography>
                <Typography variant="body2">{drawerMarker.lat.toFixed(4)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption">Lng</Typography>
                <Typography variant="body2">{drawerMarker.lng.toFixed(4)}</Typography>
              </Grid>
            </Grid>
            {drawerMarker.link && (
              <Typography
                component="a"
                href={drawerMarker.link}
                variant="body2"
                sx={{ display: 'inline-block', mt: 2, color: kit.color.ember }}
              >
                Открыть поставку →
              </Typography>
            )}
          </Box>
        )}

        {selectedGeofence && (
          <Box sx={{ width: 320, p: 3 }}>
            <Typography variant="h6" fontWeight={700}>{selectedGeofence.label}</Typography>
            <StatusChip status={selectedGeofence.status} label={labelSemantic(selectedGeofence.status)} />
            <Typography variant="body2" sx={{ mt: 2, color: kit.color.muted }}>
              Geofence-полигон · зона риска на маршруте
            </Typography>
          </Box>
        )}
      </Drawer>
    </InternalLayout>
  );
}
