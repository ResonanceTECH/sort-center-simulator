import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import PlayArrowOutlined from '@mui/icons-material/PlayArrowOutlined';
import ScienceOutlined from '@mui/icons-material/ScienceOutlined';
import { PermissionGate } from '@/components/project/PermissionGate';
import { PROJECTS_PAGE } from '@/constants/projects';
import { useProjectContext } from '@/context/projectContext';
import { startProjectRun } from '@/services/projectWorkspaceService';
import { useUiStore } from '@/store/uiStore';
import { getErrorMessage } from '@/utils/error';
import { WorkspacePageHeader } from '@/components/project/WorkspacePageHeader';

export function ProjectSimulationPage() {
  const { project } = useProjectContext();
  const navigate = useNavigate();
  const showSnackbar = useUiStore((s) => s.showSnackbar);
  const [scenarioId, setScenarioId] = useState(
    project.defaultScenarioId ?? project.scenarios[0]?.id ?? '',
  );
  const [starting, setStarting] = useState<'analytical' | 'simulation' | null>(null);

  const handleRun = async (type: 'analytical' | 'simulation') => {
    if (!scenarioId) {
      showSnackbar('Выберите сценарий', 'info');
      return;
    }
    setStarting(type);
    try {
      const run = await startProjectRun(project.id, { scenarioId, type });
      showSnackbar(
        type === 'analytical' ? 'Аналитический расчёт запущен' : 'Имитация запущена',
        'success',
      );
      navigate(`/projects/${project.id}/runs/${run.id}`);
    } catch (err: unknown) {
      showSnackbar(getErrorMessage(err, 'Не удалось запустить расчёт'), 'error');
    } finally {
      setStarting(null);
    }
  };

  return (
    <Box sx={{ maxWidth: 640 }}>
      <WorkspacePageHeader
        title="Запуск расчёта"
        subtitle="Выберите сценарий и тип прогона: аналитический (быстрый) или имитация (MuJoCo)."
      />

      <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${PROJECTS_PAGE.border}` }}>
        <Stack spacing={2.5}>
          <FormControl fullWidth size="small">
            <InputLabel>Сценарий</InputLabel>
            <Select
              label="Сценарий"
              value={scenarioId}
              onChange={(e) => setScenarioId(e.target.value)}
            >
              {project.scenarios.map((scenario) => (
                <MenuItem key={scenario.id} value={scenario.id}>
                  {scenario.name}
                  {scenario.isDefault ? ' (базовый)' : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <PermissionGate resource="simulation_run" action="create">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                variant="contained"
                startIcon={<PlayArrowOutlined />}
                disabled={starting !== null}
                onClick={() => void handleRun('analytical')}
              >
                {starting === 'analytical' ? 'Запуск…' : 'Аналитический расчёт'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<ScienceOutlined />}
                disabled={starting !== null}
                onClick={() => void handleRun('simulation')}
              >
                {starting === 'simulation' ? 'Запуск…' : 'Имитация (MuJoCo)'}
              </Button>
            </Stack>
          </PermissionGate>

          <Alert severity="info" sx={{ mt: 1 }}>
            Аналитический режим — дискретная модель (MVP). Имитация использует MuJoCo backend
            (пока stub: прогон завершится с ошибкой, если backend не подключён).
          </Alert>

          <Button component={RouterLink} to={`/projects/${project.id}/runs`} size="small">
            Все прогоны →
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
