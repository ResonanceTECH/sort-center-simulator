import { useMemo, useState } from 'react';
import { Box, Chip, Drawer, Grid, Typography } from '@mui/material';
import { PageHeader } from '@/components/common/PageHeader';
import { LiveMapPanel, LAYER_LABELS } from '@/components/maps/LiveMapPanel';
import { StatusChip } from '@/components/status/StatusChip';
import { NAV_LABELS } from '@/constants/platformRu';
import { InternalLayout } from '@/layouts/InternalLayout';
import { LIVE_MAP_MOCK } from '@/mocks/scm/mapData';
import type { MapLayerType, MapMarker } from '@/types/scm/map';
import { kit } from '@/ui-kit/tokens';

const LAYER_KEYS = Object.keys(LAYER_LABELS) as MapLayerType[];

export function LiveMapPage() {
  const [activeLayers, setActiveLayers] = useState<MapLayerType[]>(['shipments', 'routes', 'vehicles']);
  const [selected, setSelected] = useState<MapMarker | null>(null);

  const toggleLayer = (layer: MapLayerType) => {
    setActiveLayers((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer],
    );
  };

  const drawerData = useMemo(() => {
    if (!selected) return null;
    return LIVE_MAP_MOCK.markers.find((m) => m.id === selected.id) ?? selected;
  }, [selected]);

  return (
    <InternalLayout>
      <PageHeader title={NAV_LABELS.liveMap} subtitle="MapLibre — транспорт, поставки, маршруты, зоны риска" />

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

      <LiveMapPanel
        data={LIVE_MAP_MOCK}
        activeLayers={activeLayers}
        onMarkerSelect={setSelected}
      />

      <Drawer anchor="right" open={Boolean(selected)} onClose={() => setSelected(null)}>
        {drawerData && (
          <Box sx={{ width: 320, p: 3 }}>
            <Typography variant="h6" fontWeight={700}>{drawerData.label}</Typography>
            <StatusChip status={drawerData.status} label={LAYER_LABELS[drawerData.type]} />
            <Grid container spacing={1} sx={{ mt: 2 }}>
              <Grid item xs={6}><Typography variant="caption">Lat</Typography><Typography variant="body2">{drawerData.lat.toFixed(2)}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption">Lng</Typography><Typography variant="body2">{drawerData.lng.toFixed(2)}</Typography></Grid>
            </Grid>
          </Box>
        )}
      </Drawer>
    </InternalLayout>
  );
}
