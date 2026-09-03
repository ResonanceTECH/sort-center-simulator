import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { DocsShell } from '@/docs/components/DocsShell';
import { kit } from '@/ui-kit/tokens';

const ENTRY = [
  {
    title: 'Впервые здесь?',
    links: [
      { label: 'Обзор платформы', to: '/docs/getting-started/overview' },
      { label: 'Quickstart', to: '/docs/getting-started/quickstart' },
    ],
  },
  {
    title: 'Работаете с поставками?',
    links: [
      { label: 'Shipment Workspace', to: '/docs/execution/shipments' },
      { label: 'Отклонения', to: '/docs/execution/exceptions' },
    ],
  },
  {
    title: 'Занимаетесь планированием?',
    links: [{ label: 'Обзор планирования', to: '/docs/planning/overview' }],
  },
  {
    title: 'Исследуете сценарии?',
    links: [{ label: 'Сценарии (What-if)', to: '/docs/scenarios/overview' }],
  },
  {
    title: 'Интегрируете систему?',
    links: [
      { label: 'API: начало работы', to: '/docs/developers/api-getting-started' },
      { label: 'OpenAPI (Swagger)', to: 'http://localhost:8000/docs' },
    ],
  },
];

const POPULAR = [
  { label: 'Quickstart', to: '/docs/getting-started/quickstart' },
  { label: 'Logistics Manager', to: '/docs/roles/logistics-manager' },
  { label: 'Поставки', to: '/docs/execution/shipments' },
  { label: 'Глоссарий', to: '/docs/reference/glossary' },
  { label: 'Ограничения', to: '/docs/support/known-limitations' },
];

const ROLE_LINKS = [
  { label: 'Supply Chain Manager', to: '/docs/roles/supply-chain-manager' },
  { label: 'Supply Planner', to: '/docs/roles/supply-planner' },
  { label: 'Logistics Manager', to: '/docs/roles/logistics-manager' },
  { label: 'Analyst', to: '/docs/roles/analyst' },
  { label: 'Supplier', to: '/docs/roles/supplier' },
  { label: 'Carrier', to: '/docs/roles/carrier' },
  { label: 'Administrator', to: '/docs/roles/administrator' },
];

const DEV_LINKS = [
  { label: 'API getting started', to: '/docs/developers/api-getting-started' },
  { label: 'Архитектура', to: '/docs/getting-started/architecture' },
  { label: 'Known limitations', to: '/docs/support/known-limitations' },
  { label: 'Changelog', to: '/changelog' },
];

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.5 },
        height: '100%',
        minWidth: 0,
        bgcolor: kit.color.snow,
        border: kit.border.hairline,
        borderRadius: kit.radius.panel,
      }}
    >
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.25, lineHeight: 1.3 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function DocA({ to, label }: { to: string; label: string }) {
  const external = to.startsWith('http');
  const sx = {
    display: 'block',
    color: kit.color.accent,
    mb: 0.75,
    textDecoration: 'none',
    fontSize: '0.9375rem',
    lineHeight: 1.45,
    wordBreak: 'normal' as const,
    overflowWrap: 'break-word' as const,
    '&:hover': { textDecoration: 'underline' },
  };
  if (external) {
    return (
      <Box component="a" href={to} target="_blank" rel="noreferrer" sx={sx}>
        {label}
      </Box>
    );
  }
  return (
    <Box component={RouterLink} to={to} sx={sx}>
      {label}
    </Box>
  );
}

function CardGrid({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(auto-fit, minmax(260px, 1fr))',
        },
        gap: 2,
        width: '100%',
      }}
    >
      {children}
    </Box>
  );
}

export function DocsHomePage() {
  return (
    <DocsShell>
      <Typography
        variant="h4"
        fontWeight={800}
        sx={{ mb: 1, letterSpacing: '-0.02em', fontSize: { xs: '1.5rem', sm: '2rem' } }}
      >
        Документация платформы
      </Typography>
      <Typography variant="body1" sx={{ color: kit.color.muted, mb: 3, maxWidth: 640, lineHeight: 1.7 }}>
        Руководства для ролей SCM, операционные workflows, порталы и API. Только то, что есть в
        продукте — без выдуманных интеграций.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <CardGrid>
          {ENTRY.map((block) => (
            <Card key={block.title} title={block.title}>
              {block.links.map((l) => (
                <DocA key={l.to} to={l.to} label={l.label} />
              ))}
            </Card>
          ))}
        </CardGrid>
      </Box>

      <CardGrid>
        <Card title="Popular Guides">
          {POPULAR.map((l) => (
            <DocA key={l.to} to={l.to} label={l.label} />
          ))}
        </Card>
        <Card title="Role Guides">
          {ROLE_LINKS.map((l) => (
            <DocA key={l.to} to={l.to} label={l.label} />
          ))}
        </Card>
        <Card title="Developer Documentation">
          {DEV_LINKS.map((l) => (
            <DocA key={l.to} to={l.to} label={l.label} />
          ))}
        </Card>
      </CardGrid>
    </DocsShell>
  );
}
