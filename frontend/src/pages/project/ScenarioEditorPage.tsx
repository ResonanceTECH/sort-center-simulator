import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import {
  WorkspaceError,
  WorkspaceLoading,
} from '@/components/project/WorkspaceStates';
import { PermissionGate } from '@/components/project/PermissionGate';
import { PROJECTS_PAGE } from '@/constants/projects';
import { useProjectContext } from '@/context/projectContext';
import { useScenarioContext } from '@/context/scenarioContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import {
  fetchScenarioConfig,
  updateScenarioConfig,
} from '@/services/projectWorkspaceService';
import { useUiStore } from '@/store/uiStore';
import { getErrorMessage } from '@/utils/error';
import { WorkspacePageHeader } from '@/components/project/WorkspacePageHeader';
import { SIM_COLORS } from '@/constants/simColors';

const ZONE_COLORS: Record<string, string> = {
  B: SIM_COLORS.zones.B,
  C: SIM_COLORS.zones.C,
  D: SIM_COLORS.zones.D,
};

type ZoneKey = 'B' | 'C' | 'D';

function LayoutSvg({
  config,
  zoneEnabled,
}: {
  config: Record<string, unknown>;
  zoneEnabled: Record<ZoneKey, boolean>;
}) {
  const layout = (config.layout ?? {}) as Record<string, unknown>;
  const accumulator = (layout.accumulator ?? {}) as Record<string, number>;
  const accW = accumulator.width_mm ?? 500;
  const accD = accumulator.depth_mm ?? 700;

  return (
    <svg width="100%" viewBox="0 0 900 360" role="img" aria-label="2D layout editor">
      <rect x={20} y={140} width={500} height={50} fill={SIM_COLORS.surface} rx={6} />
      <text x={30} y={132} fill={SIM_COLORS.muted} fontSize={13}>
        Конвейер ({String(layout.belt_speed_mps ?? 1)} м/с)
      </text>
      <rect x={20} y={40} width={accW / 2} height={accD / 4} fill={SIM_COLORS.paper} stroke={SIM_COLORS.stroke} rx={8} />
      <text x={30} y={62} fill={SIM_COLORS.body} fontSize={12}>
        Аккумулятор
      </text>
      {(['B', 'C', 'D'] as const).map((zone, index) => {
        const enabled = zoneEnabled[zone];
        return (
          <g key={zone} opacity={enabled ? 1 : 0.35}>
            <rect
              x={560 + index * 90}
              y={60}
              width={70}
              height={70}
              fill={`${ZONE_COLORS[zone]}22`}
              stroke={ZONE_COLORS[zone]}
              strokeWidth={2}
              rx={8}
            />
            <text
              x={595 + index * 90}
              y={102}
              textAnchor="middle"
              fill={ZONE_COLORS[zone]}
              fontSize={16}
              fontWeight={700}
            >
              {zone}
            </text>
          </g>
        );
      })}
      <circle cx={300} cy={30} r={22} fill={SIM_COLORS.body} />
      <text x={300} y={35} textAnchor="middle" fill="#fff" fontSize={12}>
        UR
      </text>
    </svg>
  );
}

export function ScenarioEditorPage() {
  const { project } = useProjectContext();
  const { scenario } = useScenarioContext();
  const showSnackbar = useUiStore((s) => s.showSnackbar);

  const fetcher = useCallback(
    () => fetchScenarioConfig(project.id, scenario.id),
    [project.id, scenario.id],
  );
  const { data: config, error, loading, retry } = useAsyncData(fetcher);

  const [zoneEnabled, setZoneEnabled] = useState<Record<ZoneKey, boolean>>({
    B: true,
    C: true,
    D: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!config) return;
    const layout = (config.layout ?? {}) as Record<string, unknown>;
    const zones = (layout.zones ?? {}) as Record<string, { enabled?: boolean }>;
    setZoneEnabled({
      B: zones.B?.enabled !== false,
      C: zones.C?.enabled !== false,
      D: zones.D?.enabled !== false,
    });
  }, [config]);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const next = structuredClone(config);
      const layout = (next.layout ?? {}) as Record<string, unknown>;
      const zones = (layout.zones ?? {}) as Record<string, Record<string, unknown>>;
      (['B', 'C', 'D'] as const).forEach((zone) => {
        zones[zone] = { ...(zones[zone] ?? {}), enabled: zoneEnabled[zone] };
      });
      layout.zones = zones;
      next.layout = layout;
      await updateScenarioConfig(project.id, scenario.id, next);
      showSnackbar('Модель сохранена', 'success');
      retry();
    } catch (err: unknown) {
      showSnackbar(getErrorMessage(err, 'Не удалось сохранить'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !config) {
    return <WorkspaceLoading withShell={false} />;
  }

  if (error) {
    return <WorkspaceError withShell={false} message={error} onRetry={retry} />;
  }

  if (!config) {
    return <Typography color="text.secondary">Конфигурация недоступна.</Typography>;
  }

  return (
    <Box>
      <WorkspacePageHeader
        title="Модель сортировочного центра"
        subtitle={`Сценарий «${scenario.name}» — 2D схема layout`}
        mb={2}
      />

      <Paper elevation={0} sx={{ p: 2, mb: 2, border: `1px solid ${PROJECTS_PAGE.border}` }}>
        <LayoutSvg config={config} zoneEnabled={zoneEnabled} />
      </Paper>

      <PermissionGate
        resource="model_blocks"
        action="update"
        fallback={
          <Alert severity="info">
            У вас доступ только для просмотра модели.
          </Alert>
        }
      >
        <Paper elevation={0} sx={{ p: 2, border: `1px solid ${PROJECTS_PAGE.border}`, maxWidth: 360 }}>
          <Typography fontWeight={600} mb={1}>
            Зоны сортировки
          </Typography>
          <Stack spacing={0.5}>
            {(['B', 'C', 'D'] as const).map((zone) => (
              <FormControlLabel
                key={zone}
                control={
                  <Switch
                    checked={zoneEnabled[zone]}
                    onChange={(e) =>
                      setZoneEnabled((prev) => ({ ...prev, [zone]: e.target.checked }))
                    }
                  />
                }
                label={`Зона ${zone}`}
              />
            ))}
          </Stack>
          <Button variant="contained" sx={{ mt: 2 }} disabled={saving} onClick={() => void handleSave()}>
            {saving ? 'Сохранение…' : 'Сохранить модель'}
          </Button>
        </Paper>
      </PermissionGate>
    </Box>
  );
}
