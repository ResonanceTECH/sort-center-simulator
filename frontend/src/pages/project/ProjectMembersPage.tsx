import { useCallback, useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  WorkspaceError,
  WorkspaceLoading,
} from '@/components/project/WorkspaceStates';
import { INVITABLE_ROLES, ROLE_LABELS } from '@/constants/permissions';
import { PROJECTS_PAGE } from '@/constants/projects';
import { useProjectContext } from '@/context/projectContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import {
  createProjectInvitation,
  fetchProjectInvitations,
  fetchProjectMembers,
  removeProjectMember,
  revokeProjectInvitation,
  updateMemberRole,
} from '@/services/membershipService';
import { useUiStore } from '@/store/uiStore';
import type { ProjectRole } from '@/types/rbac';
import { getErrorMessage } from '@/utils/error';
import { PermissionGate } from '@/components/project/PermissionGate';
import { WorkspacePageHeader } from '@/components/project/WorkspacePageHeader';

export function ProjectMembersPage() {
  const { project, access, refresh } = useProjectContext();
  const showSnackbar = useUiStore((s) => s.showSnackbar);
  const [inviteRole, setInviteRole] = useState<ProjectRole>('editor');
  const [busy, setBusy] = useState(false);

  const membersFetcher = useCallback(
    () => fetchProjectMembers(project.id),
    [project.id],
  );
  const invitesFetcher = useCallback(
    () => (access?.capabilities.manageMembers ? fetchProjectInvitations(project.id) : Promise.resolve([])),
    [project.id, access?.capabilities.manageMembers],
  );

  const {
    data: members,
    error: membersError,
    loading: membersLoading,
    retry: retryMembers,
  } = useAsyncData(membersFetcher);
  const {
    data: invitations,
    loading: invitesLoading,
    retry: retryInvites,
  } = useAsyncData(invitesFetcher);

  const handleCreateInvite = async () => {
    setBusy(true);
    try {
      const invite = await createProjectInvitation(project.id, inviteRole);
      showSnackbar('Приглашение создано', 'success');
      retryInvites();
      const fullLink = `${window.location.origin}${invite.linkPath}`;
      await navigator.clipboard.writeText(`${invite.code}\n${fullLink}`);
      showSnackbar('Код и ссылка скопированы', 'info');
    } catch (err: unknown) {
      showSnackbar(getErrorMessage(err, 'Не удалось создать приглашение'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleRoleChange = async (userId: string, role: ProjectRole) => {
    try {
      await updateMemberRole(project.id, userId, role);
      retryMembers();
      showSnackbar('Роль обновлена', 'success');
    } catch (err: unknown) {
      showSnackbar(getErrorMessage(err, 'Не удалось обновить роль'), 'error');
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      await removeProjectMember(project.id, userId);
      retryMembers();
      refresh();
      showSnackbar('Участник удалён', 'success');
    } catch (err: unknown) {
      showSnackbar(getErrorMessage(err, 'Не удалось удалить участника'), 'error');
    }
  };

  const handleRevokeInvite = async (invitationId: string) => {
    try {
      await revokeProjectInvitation(project.id, invitationId);
      retryInvites();
      showSnackbar('Приглашение отозвано', 'success');
    } catch (err: unknown) {
      showSnackbar(getErrorMessage(err, 'Не удалось отозвать приглашение'), 'error');
    }
  };

  if (membersLoading && !members) {
    return <WorkspaceLoading withShell={false} />;
  }

  if (membersError) {
    return <WorkspaceError withShell={false} message={membersError} onRetry={retryMembers} />;
  }

  return (
    <Box>
      <WorkspacePageHeader
        title="Участники"
        subtitle={access ? `Ваша роль: ${access.roleLabel}` : undefined}
        mb={2}
      />

      <PermissionGate
        capability="manageMembers"
        fallback={
          <Alert severity="info" sx={{ mb: 2 }}>
            Управление участниками доступно только владельцу проекта.
          </Alert>
        }
      >
        <Paper elevation={0} sx={{ p: 2, mb: 3, border: `1px solid ${PROJECTS_PAGE.border}` }}>
          <Typography fontWeight={600} mb={1.5}>
            Пригласить по коду / ссылке
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Роль</InputLabel>
              <Select
                label="Роль"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as ProjectRole)}
              >
                {INVITABLE_ROLES.map((role) => (
                  <MenuItem key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" disabled={busy} onClick={() => void handleCreateInvite()}>
              Создать приглашение
            </Button>
          </Stack>
        </Paper>
      </PermissionGate>

      <Paper elevation={0} sx={{ mb: 3, border: `1px solid ${PROJECTS_PAGE.border}` }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Участник</TableCell>
              <TableCell>Роль</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(members ?? []).map((member) => (
              <TableRow key={member.userId}>
                <TableCell>
                  <Typography fontWeight={600}>{member.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {member.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  {access?.capabilities.manageMembers && member.role !== 'owner' ? (
                    <Select
                      size="small"
                      value={member.role}
                      onChange={(e) =>
                        void handleRoleChange(member.userId, e.target.value as ProjectRole)
                      }
                    >
                      {INVITABLE_ROLES.map((role) => (
                        <MenuItem key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </MenuItem>
                      ))}
                      <MenuItem value="owner">{ROLE_LABELS.owner}</MenuItem>
                    </Select>
                  ) : (
                    member.roleLabel
                  )}
                </TableCell>
                <TableCell align="right">
                  <PermissionGate capability="manageMembers">
                    {member.role !== 'owner' && (
                      <Button size="small" color="error" onClick={() => void handleRemove(member.userId)}>
                        Удалить
                      </Button>
                    )}
                  </PermissionGate>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <PermissionGate capability="manageMembers">
        <Typography variant="h6" fontWeight={600} mb={1}>
          Активные приглашения
        </Typography>
        {invitesLoading && <Typography color="text.secondary">Загрузка…</Typography>}
        <Stack spacing={1}>
          {(invitations ?? []).map((invite) => (
            <Paper
              key={invite.id}
              elevation={0}
              sx={{ p: 1.5, border: `1px solid ${PROJECTS_PAGE.border}` }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography fontWeight={600}>
                    {invite.code} · {invite.roleLabel}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {invite.linkPath} · использований: {invite.useCount}
                    {invite.maxUses != null ? ` / ${invite.maxUses}` : ''}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => {
                      void navigator.clipboard.writeText(
                        `${invite.code}\n${window.location.origin}${invite.linkPath}`,
                      );
                      showSnackbar('Скопировано', 'info');
                    }}
                  >
                    Копировать
                  </Button>
                  {invite.isActive && (
                    <Button size="small" onClick={() => void handleRevokeInvite(invite.id)}>
                      Отозвать
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </PermissionGate>
    </Box>
  );
}
