import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { PermissionGate } from '@/components/project/PermissionGate';
import {
  WorkspaceError,
  WorkspaceLoading,
} from '@/components/project/WorkspaceStates';
import { PROJECTS_PAGE } from '@/constants/projects';
import { useProjectContext } from '@/context/projectContext';
import { useScenarioContext } from '@/context/scenarioContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { WorkspacePageHeader } from '@/components/project/WorkspacePageHeader';
import {
  fetchScenarioConfig,
  updateScenarioConfig,
} from '@/services/projectWorkspaceService';

type ConfigForm = {
  seed: string;
  dtSec: string;
  itemsPerRun: string;
  beltSpeed: string;
  kThreshold: string;
  successRateMin: string;
};

function configToForm(config: Record<string, unknown>): ConfigForm {
  const simulation = (config.simulation ?? {}) as Record<string, unknown>;
  const catalog = (config.catalog ?? {}) as Record<string, unknown>;
  const layout = (config.layout ?? {}) as Record<string, unknown>;
  const classification = (config.classification ?? {}) as Record<string, unknown>;
  const expect = (config.expect ?? {}) as Record<string, unknown>;

  return {
    seed: String(simulation.seed ?? 42),
    dtSec: String(simulation.dt_sec ?? 0.05),
    itemsPerRun: String(catalog.items_per_run ?? 50),
    beltSpeed: String(layout.belt_speed_mps ?? 1),
    kThreshold: String(classification.circularity_k_threshold ?? 0.8),
    successRateMin: String(expect.success_rate_min ?? 0.5),
  };
}

function formToConfig(
  base: Record<string, unknown>,
  form: ConfigForm,
): Record<string, unknown> {
  const next = structuredClone(base);
  const simulation = (next.simulation ?? {}) as Record<string, unknown>;
  const catalog = (next.catalog ?? {}) as Record<string, unknown>;
  const layout = (next.layout ?? {}) as Record<string, unknown>;
  const classification = (next.classification ?? {}) as Record<string, unknown>;
  const expect = (next.expect ?? {}) as Record<string, unknown>;

  simulation.seed = Number(form.seed);
  simulation.dt_sec = Number(form.dtSec);
  catalog.items_per_run = Number(form.itemsPerRun);
  layout.belt_speed_mps = Number(form.beltSpeed);
  classification.circularity_k_threshold = Number(form.kThreshold);
  expect.success_rate_min = Number(form.successRateMin);

  next.simulation = simulation;
  next.catalog = catalog;
  next.layout = layout;
  next.classification = classification;
  next.expect = expect;
  return next;
}

export function ScenarioParametersPage() {
  const { project } = useProjectContext();
  const { scenario } = useScenarioContext();

  const fetcher = useCallback(
    () => fetchScenarioConfig(project.id, scenario.id),
    [project.id, scenario.id],
  );
  const { data: config, error, loading, retry } = useAsyncData(fetcher);

  const [form, setForm] = useState<ConfigForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (config) {
      setForm(configToForm(config));
    }
  }, [config]);

  const handleSave = async () => {
    if (!config || !form) return;
    setSaving(true);
    setSaveError(null);
    setSaveMessage(null);
    try {
      await updateScenarioConfig(project.id, scenario.id, formToConfig(config, form));
      setSaveMessage('Параметры сохранены');
      retry();
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Не удалось сохранить');
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

  if (!form) {
    return <Typography color="text.secondary">Конфигурация недоступна.</Typography>;
  }

  return (
    <Box>
      <WorkspacePageHeader
        title="Параметры"
        subtitle={`Сценарий «${scenario.name}»`}
        mb={2}
      />

      <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${PROJECTS_PAGE.border}`, maxWidth: 520 }}>
        <PermissionGate
          resource="equipment_params"
          action="update"
          fallback={
            <Alert severity="info">Просмотр параметров. Редактирование недоступно для вашей роли.</Alert>
          }
        >
          <Stack spacing={2}>
          <TextField
            label="Seed"
            type="number"
            size="small"
            value={form.seed}
            onChange={(event) => setForm({ ...form, seed: event.target.value })}
          />
          <TextField
            label="dt (сек)"
            type="number"
            size="small"
            value={form.dtSec}
            onChange={(event) => setForm({ ...form, dtSec: event.target.value })}
          />
          <TextField
            label="Изделий за прогон"
            type="number"
            size="small"
            value={form.itemsPerRun}
            onChange={(event) => setForm({ ...form, itemsPerRun: event.target.value })}
          />
          <TextField
            label="Скорость ленты (м/с)"
            type="number"
            size="small"
            value={form.beltSpeed}
            onChange={(event) => setForm({ ...form, beltSpeed: event.target.value })}
          />
          <TextField
            label="K-factor порог"
            type="number"
            size="small"
            value={form.kThreshold}
            onChange={(event) => setForm({ ...form, kThreshold: event.target.value })}
          />
          <TextField
            label="Мин. success rate (expect)"
            type="number"
            size="small"
            value={form.successRateMin}
            onChange={(event) => setForm({ ...form, successRateMin: event.target.value })}
          />

          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Сохранение…' : 'Сохранить'}
          </Button>

          {saveMessage && <Alert severity="success">{saveMessage}</Alert>}
          {saveError && <Alert severity="error">{saveError}</Alert>}
          </Stack>
        </PermissionGate>
      </Paper>
    </Box>
  );
}
