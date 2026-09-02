import { useEffect, useMemo, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Box } from '@mui/material';
import type { LiveMapData, MapLayerType, MapMarker } from '@/types/scm/map';
import { kit } from '@/ui-kit/tokens';

import { MAP_LAYERS } from '@/constants/platformRu';

const STATUS_COLORS: Record<string, string> = {
  CRITICAL: '#dc2626',
  HIGH: '#ea580c',
  WARNING: '#f59e0b',
  NORMAL: '#09090b',
  INFO: '#3b82f6',
  SUCCESS: '#3f7d4e',
};

interface LiveMapPanelProps {
  data: LiveMapData;
  activeLayers: MapLayerType[];
  onMarkerSelect?: (marker: MapMarker) => void;
  height?: number;
}

export function LiveMapPanel({
  data,
  activeLayers,
  onMarkerSelect,
  height = 520,
}: LiveMapPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [ready, setReady] = useState(false);

  const visibleMarkers = useMemo(
    () => data.markers.filter((m) => activeLayers.includes(m.type)),
    [data.markers, activeLayers],
  );

  const visibleRoutes = useMemo(
    () => (activeLayers.includes('routes') ? data.routes : []),
    [data.routes, activeLayers],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [45, 55.5],
      zoom: 4.2,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.on('load', () => setReady(true));
    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    visibleMarkers.forEach((marker) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.title = marker.label;
      el.style.cssText = `
        width: 14px; height: 14px; border-radius: 50%; border: 2px solid #fff;
        background: ${STATUS_COLORS[marker.status] ?? kit.color.obsidian};
        cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      `;
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onMarkerSelect?.(marker);
      });

      const m = new maplibregl.Marker({ element: el })
        .setLngLat([marker.lng, marker.lat])
        .setPopup(new maplibregl.Popup({ offset: 12 }).setText(`${marker.label} · ${MAP_LAYERS[marker.type] ?? marker.type}`))
        .addTo(map);
      markersRef.current.push(m);
    });
  }, [visibleMarkers, ready, onMarkerSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const sourceId = 'routes';
    const layerId = 'routes-line';

    if (map.getLayer(layerId)) map.removeLayer(layerId);
    if (map.getSource(sourceId)) map.removeSource(sourceId);

    if (visibleRoutes.length === 0) return;

    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: visibleRoutes.map((route) => ({
          type: 'Feature',
          properties: { label: route.label, status: route.status },
          geometry: { type: 'LineString', coordinates: route.coordinates },
        })),
      },
    });

    map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': kit.color.ember,
        'line-width': 3,
        'line-opacity': 0.85,
      },
    });
  }, [visibleRoutes, ready]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height,
        borderRadius: kit.radius.panel,
        overflow: 'hidden',
        border: kit.border.hairline,
        '& .maplibregl-popup-content': { fontSize: '0.8125rem', borderRadius: kit.radius.button },
      }}
    />
  );
}

export { MAP_LAYERS as LAYER_LABELS };
