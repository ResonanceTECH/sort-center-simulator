import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Paper, Skeleton, Typography } from '@mui/material';
import { ArrowBack, SearchOffOutlined } from '@mui/icons-material';
import { AppLayout } from '@/layouts/AppLayout';
import { TopBar } from '@/components/general/TopBar';
import { RetryAlert } from '@/components/shared/RetryAlert';
import { LANDING } from '@/landing/styles/tokens';
import { PROJECTS_PAGE } from '@/constants/projects';
import type { Notification } from '@/types/general';

interface WorkspaceShellProps {
  children: ReactNode;
  notifications?: Notification[];
}

export function WorkspaceShell({ children, notifications = [] }: WorkspaceShellProps) {
  return (
    <AppLayout topBar={<TopBar notifications={notifications} />}>
      {children}
    </AppLayout>
  );
}

interface ResourceMissingContentProps {
  title: string;
  description: string;
  backTo?: string;
  backLabel?: string;
}

export function ResourceMissingContent({
  title,
  description,
  backTo = '/projects',
  backLabel = 'К списку проектов',
}: ResourceMissingContentProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 4 },
        maxWidth: 520,
        mx: 'auto',
        mt: 4,
        textAlign: 'center',
        border: `1px solid ${PROJECTS_PAGE.border}`,
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '14px',
          bgcolor: 'primary.light',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2.5,
        }}
      >
        <SearchOffOutlined sx={{ fontSize: 32, color: LANDING.ink }} />
      </Box>
      <Typography
        sx={{
          fontSize: '1.25rem',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: LANDING.ink,
          mb: 1,
        }}
      >
        {title}
      </Typography>
      <Typography sx={{ fontSize: '0.9375rem', color: LANDING.muted, mb: 3, lineHeight: 1.5 }}>
        {description}
      </Typography>
      <Button
        component={RouterLink}
        to={backTo}
        variant="contained"
        startIcon={<ArrowBack />}
      >
        {backLabel}
      </Button>
    </Paper>
  );
}

interface ResourceMissingProps extends ResourceMissingContentProps {
  notifications?: Notification[];
  /** When false, render only content (parent already provides AppLayout). */
  withShell?: boolean;
}

export function ResourceMissing({
  notifications = [],
  withShell = true,
  ...contentProps
}: ResourceMissingProps) {
  const content = <ResourceMissingContent {...contentProps} />;
  if (!withShell) return content;
  return <WorkspaceShell notifications={notifications}>{content}</WorkspaceShell>;
}

export function WorkspaceLoadingContent() {
  return (
    <Box sx={{ maxWidth: 720 }}>
      <Skeleton variant="text" width="40%" height={40} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="70%" height={24} sx={{ mb: 3 }} />
      <Skeleton variant="rounded" height={180} sx={{ borderRadius: 2 }} />
    </Box>
  );
}

interface WorkspaceLoadingProps {
  notifications?: Notification[];
  withShell?: boolean;
}

export function WorkspaceLoading({
  notifications = [],
  withShell = true,
}: WorkspaceLoadingProps) {
  const content = <WorkspaceLoadingContent />;
  if (!withShell) return content;
  return <WorkspaceShell notifications={notifications}>{content}</WorkspaceShell>;
}

interface WorkspaceErrorContentProps {
  message: string;
  onRetry: () => void;
}

export function WorkspaceErrorContent({ message, onRetry }: WorkspaceErrorContentProps) {
  return <RetryAlert message={message} onRetry={onRetry} />;
}

interface WorkspaceErrorProps extends WorkspaceErrorContentProps {
  notifications?: Notification[];
  withShell?: boolean;
}

export function WorkspaceError({
  message,
  onRetry,
  notifications = [],
  withShell = true,
}: WorkspaceErrorProps) {
  const content = <WorkspaceErrorContent message={message} onRetry={onRetry} />;
  if (!withShell) return content;
  return <WorkspaceShell notifications={notifications}>{content}</WorkspaceShell>;
}
