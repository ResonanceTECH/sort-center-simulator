import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { PermissionGate } from '@/components/project/PermissionGate';
import { WorkspacePageHeader } from '@/components/project/WorkspacePageHeader';
import { PROJECTS_PAGE } from '@/constants/projects';
import { useProjectContext } from '@/context/projectContext';
import {
  createScenario,
  setDefaultScenario,
} from '@/services/projectWorkspaceService';
import { useUiStore } from '@/store/uiStore';
import { formatProjectDate } from '@/utils/projects';
import { getErrorMessage } from '@/utils/error';

export function ProjectScenariosPage() {
  const { project, refresh } = useProjectContext();
  const showSnackbar = useUiStore((s) => s.showSnackbar);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [copyFromId, setCopyFromId] = useState(project.defaultScenarioId ?? '');
  const [busy, setBusy] = useState(false);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      await createScenario(project.id, {
        name: trimmed,
        copyFromId: copyFromId || undefined,
      });
      showSnackbar('Сценарий создан', 'success');
      setDialogOpen(false);
      setName('');
      refresh();
    } catch (err: unknown) {
      showSnackbar(getErrorMessage(err, 'Не удалось создать сценарий'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleSetDefault = async (scenarioId: string) => {
    try {
      await setDefaultScenario(project.id, scenarioId);
      showSnackbar('Базовый сценарий обновлён', 'success');
      refresh();
    } catch (err: unknown) {
      showSnackbar(getErrorMessage(err, 'Не удалось назначить базовый сценарий'), 'error');
    }
  };

  return (
    <Box>
      <WorkspacePageHeader
        title="Сценарии"
        subtitle={`Проект «${project.name}»`}
        mb={2}
        action={
          <PermissionGate resource="scenarios" action="create">
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
              Новый сценарий
            </Button>
          </PermissionGate>
        }
      />

      <Paper elevation={0} sx={{ border: `1px solid ${PROJECTS_PAGE.border}` }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Обновлён</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {project.scenarios.map((scenario) => (
              <TableRow key={scenario.id} hover>
                <TableCell>
                  <Typography fontWeight={600}>{scenario.name}</Typography>
                  {scenario.isDefault && (
                    <Typography variant="caption" color="primary">
                      базовый
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{formatProjectDate(scenario.updatedAt)}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      component={RouterLink}
                      to={`/projects/${project.id}/scenarios/${scenario.id}/editor`}
                      size="small"
                    >
                      Модель
                    </Button>
                    <Button
                      component={RouterLink}
                      to={`/projects/${project.id}/scenarios/${scenario.id}/parameters`}
                      size="small"
                    >
                      Параметры
                    </Button>
                    <PermissionGate capability="setDefaultScenario">
                      {!scenario.isDefault && (
                        <Button size="small" onClick={() => void handleSetDefault(scenario.id)}>
                          Сделать базовым
                        </Button>
                      )}
                    </PermissionGate>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Новый сценарий</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Название"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              autoFocus
            />
            <TextField
              select
              label="Скопировать из"
              value={copyFromId}
              onChange={(e) => setCopyFromId(e.target.value)}
              fullWidth
              SelectProps={{ native: true }}
            >
              <option value="">Пустой шаблон</option>
              {project.scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" disabled={busy || !name.trim()} onClick={() => void handleCreate()}>
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
