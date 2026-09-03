import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Box } from '@mui/material';
import { MAP_LAYERS } from '@/constants/platformRu';
import type { LiveMapData, MapGeofence, MapLayerType, MapMarker } from '@/types/scm/map';
import { kit } from '@/ui-kit/tokens';

const STATUS_COLORS: Record<string, string> = {
  CRITICAL: '#dc2626',
  HIGH: '#ea580c',
  WARNING: '#f59e0b',
  NORMAL: '#09090b',
  INFO: '#3b82f6',
  SUCCESS: '#3f7d4e',
};

const CLUSTERABLE_TYPES: MapLayerType[] = ['vehicles', 'shipments'];
const STATIC_POINT_TYPES: MapLayerType[] = ['warehouses', 'hubs'];

const SOURCE_MARKERS = 'markers-cluster';
const SOURCE_STATIC = 'markers-static';
const SOURCE_GEOFENCES = 'geofences';
const SOURCE_ROUTES = 'routes';

interface LiveMapPanelProps {
  data: LiveMapData;
  activeLayers: MapLayerType[];
  onMarkerSelect?: (marker: MapMarker) => void;
  onGeofenceSelect?: (geofence: MapGeofence) => void;
  height?: number;
  fitToData?: boolean;
  /** MapLibre cluster for vehicles/shipments when marker count is high */
  clustering?: boolean;
}

function markersToGeoJson(markers: MapMarker[]) {
  return {
    type: 'FeatureCollection' as const,
    features: markers.map((m) => ({
      type: 'Feature' as const,
      properties: {
        id: m.id,
        label: m.label,
        type: m.type,
        status: m.status,
        shipmentId: m.shipmentId ?? '',
        link: m.link ?? '',
      },
      geometry: { type: 'Point' as const, coordinates: [m.lng, m.lat] as [number, number] },
    })),
  };
}

function geofencesToGeoJson(geofences: MapGeofence[]) {
  return {
    type: 'FeatureCollection' as const,
    features: geofences.map((g) => ({
      type: 'Feature' as const,
      properties: { id: g.id, label: g.label, status: g.status },
      geometry: { type: 'Polygon' as const, coordinates: [g.coordinates] },
    })),
  };
}

export function LiveMapPanel({
  data,
  activeLayers,
  onMarkerSelect,
  onGeofenceSelect,
  height = 520,
  fitToData = false,
  clustering = true,
}: LiveMapPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const htmlMarkersRef = useRef<maplibregl.Marker[]>([]);
  const [ready, setReady] = useState(false);
  const markersIndexRef = useRef<Map<string, MapMarker>>(new Map());

  const clusterableMarkers = useMemo(
    () => data.markers.filter((m) => CLUSTERABLE_TYPES.includes(m.type) && activeLayers.includes(m.type)),
    [data.markers, activeLayers],
  );

  const staticMarkers = useMemo(
    () => data.markers.filter((m) => STATIC_POINT_TYPES.includes(m.type) && activeLayers.includes(m.type)),
    [data.markers, activeLayers],
  );

  const visibleRoutes = useMemo(
    () => (activeLayers.includes('routes') ? data.routes : []),
    [data.routes, activeLayers],
  );

  const visibleGeofences = useMemo(
    () => (activeLayers.includes('riskZones') ? data.geofences : []),
    [data.geofences, activeLayers],
  );

  const useClusterLayer = clustering && clusterableMarkers.length > 0;

  useEffect(() => {
    const index = new Map<string, MapMarker>();
    data.markers.forEach((m) => index.set(m.id, m));
    markersIndexRef.current = index;
  }, [data.markers]);

  const handleMarkerPick = useCallback(
    (markerId: string, lng: number, lat: number) => {
      const base = markersIndexRef.current.get(markerId);
      if (!base) return;
      onMarkerSelect?.({ ...base, lng, lat });
    },
    [onMarkerSelect],
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
      htmlMarkersRef.current.forEach((m) => m.remove());
      htmlMarkersRef.current = [];
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const onClusterClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      const clusterId = features[0]?.properties?.cluster_id as number | undefined;
      const source = map.getSource(SOURCE_MARKERS) as maplibregl.GeoJSONSource | undefined;
      if (!source || clusterId === undefined) return;
      void source.getClusterExpansionZoom(clusterId).then((zoom) => {
        const geometry = features[0]?.geometry;
        if (geometry?.type !== 'Point') return;
        map.easeTo({ center: geometry.coordinates as [number, number], zoom });
      });
    };

    const onPointClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      const props = e.features?.[0]?.properties;
      if (!props?.id) return;
      const geometry = e.features![0]!.geometry;
      if (geometry.type !== 'Point') return;
      const [lng, lat] = geometry.coordinates as [number, number];
      handleMarkerPick(String(props.id), lng, lat);
    };

    const onGeofenceClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      const props = e.features?.[0]?.properties;
      if (!props?.id) return;
      const geofence = data.geofences.find((g) => g.id === props.id);
      if (geofence) onGeofenceSelect?.(geofence);
    };

    if (useClusterLayer) {
      map.on('click', 'clusters', onClusterClick);
      map.on('click', 'unclustered-point', onPointClick);
      map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
      map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = ''; });
    }

    map.on('click', 'geofences-fill', onGeofenceClick);
    map.on('mouseenter', 'geofences-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'geofences-fill', () => { map.getCanvas().style.cursor = ''; });

    return () => {
      if (useClusterLayer) {
        map.off('click', 'clusters', onClusterClick);
        map.off('click', 'unclustered-point', onPointClick);
      }
      map.off('click', 'geofences-fill', onGeofenceClick);
    };
  }, [ready, useClusterLayer, handleMarkerPick, onGeofenceSelect, data.geofences]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    htmlMarkersRef.current.forEach((m) => m.remove());
    htmlMarkersRef.current = [];

    if (useClusterLayer) {
      const geoJson = markersToGeoJson(clusterableMarkers);
      if (!map.getSource(SOURCE_MARKERS)) {
        map.addSource(SOURCE_MARKERS, {
          type: 'geojson',
          data: geoJson,
          cluster: true,
          clusterMaxZoom: 12,
          clusterRadius: 52,
        });

        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: SOURCE_MARKERS,
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': kit.color.ember,
            'circle-radius': ['step', ['get', 'point_count'], 16, 10, 22, 30, 28],
            'circle-opacity': 0.85,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff',
          },
        });

        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: SOURCE_MARKERS,
          filter: ['has', 'point_count'],
          layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-size': 11,
            'text-font': ['Open Sans Bold'],
          },
          paint: { 'text-color': '#fff' },
        });

        map.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: SOURCE_MARKERS,
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-radius': 7,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff',
            'circle-color': [
              'match',
              ['get', 'status'],
              'CRITICAL', STATUS_COLORS.CRITICAL,
              'HIGH', STATUS_COLORS.HIGH,
              'WARNING', STATUS_COLORS.WARNING,
              STATUS_COLORS.NORMAL,
            ],
          },
        });
      } else {
        (map.getSource(SOURCE_MARKERS) as maplibregl.GeoJSONSource).setData(geoJson);
      }
    } else {
      clusterableMarkers.forEach((marker) => {
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
          .setPopup(
            new maplibregl.Popup({ offset: 12 }).setText(
              `${marker.label} · ${MAP_LAYERS[marker.type] ?? marker.type}`,
            ),
          )
          .addTo(map);
        htmlMarkersRef.current.push(m);
      });
    }

    const staticGeoJson = markersToGeoJson(staticMarkers);
    if (!map.getSource(SOURCE_STATIC)) {
      map.addSource(SOURCE_STATIC, { type: 'geojson', data: staticGeoJson });
      map.addLayer({
        id: 'static-points',
        type: 'circle',
        source: SOURCE_STATIC,
        paint: {
          'circle-radius': 8,
          'circle-color': kit.color.obsidian,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });
    } else {
      (map.getSource(SOURCE_STATIC) as maplibregl.GeoJSONSource).setData(staticGeoJson);
    }

    const geofenceGeoJson = geofencesToGeoJson(visibleGeofences);
    if (!map.getSource(SOURCE_GEOFENCES)) {
      map.addSource(SOURCE_GEOFENCES, { type: 'geojson', data: geofenceGeoJson });
      map.addLayer({
        id: 'geofences-fill',
        type: 'fill',
        source: SOURCE_GEOFENCES,
        paint: {
          'fill-color': [
            'match',
            ['get', 'status'],
            'CRITICAL', STATUS_COLORS.CRITICAL,
            'HIGH', STATUS_COLORS.HIGH,
            'WARNING', STATUS_COLORS.WARNING,
            STATUS_COLORS.INFO,
          ],
          'fill-opacity': 0.18,
        },
      });
      map.addLayer({
        id: 'geofences-outline',
        type: 'line',
        source: SOURCE_GEOFENCES,
        paint: {
          'line-color': [
            'match',
            ['get', 'status'],
            'CRITICAL', STATUS_COLORS.CRITICAL,
            'HIGH', STATUS_COLORS.HIGH,
            'WARNING', STATUS_COLORS.WARNING,
            STATUS_COLORS.INFO,
          ],
          'line-width': 2,
          'line-opacity': 0.75,
        },
      });
    } else {
      (map.getSource(SOURCE_GEOFENCES) as maplibregl.GeoJSONSource).setData(geofenceGeoJson);
    }

    if (!map.getSource(SOURCE_ROUTES)) {
      map.addSource(SOURCE_ROUTES, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'routes-line',
        type: 'line',
        source: SOURCE_ROUTES,
        paint: {
          'line-color': kit.color.ember,
          'line-width': 3,
          'line-opacity': 0.85,
        },
      });
    }

    (map.getSource(SOURCE_ROUTES) as maplibregl.GeoJSONSource).setData({
      type: 'FeatureCollection',
      features: visibleRoutes.map((route) => ({
        type: 'Feature',
        properties: { label: route.label, status: route.status },
        geometry: { type: 'LineString', coordinates: route.coordinates },
      })),
    });
  }, [
    clusterableMarkers,
    staticMarkers,
    visibleGeofences,
    visibleRoutes,
    ready,
    useClusterLayer,
    onMarkerSelect,
  ]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !fitToData) return;

    const coords: [number, number][] = [];
    clusterableMarkers.forEach((m) => coords.push([m.lng, m.lat]));
    staticMarkers.forEach((m) => coords.push([m.lng, m.lat]));
    visibleRoutes.forEach((r) => r.coordinates.forEach((c) => coords.push(c)));
    visibleGeofences.forEach((g) => g.coordinates.forEach((c) => coords.push(c)));
    if (coords.length === 0) return;

    const lngs = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 48, maxZoom: useClusterLayer ? 6 : 8 },
    );
  }, [clusterableMarkers, staticMarkers, visibleRoutes, visibleGeofences, ready, fitToData, useClusterLayer]);

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
