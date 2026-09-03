import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';
import { KitBadge, KitButton, KitCard, KitContainer, KitPageHeader, kit, pageShellSx } from '@/ui-kit';

type PhaseStatus = 'done' | 'now' | 'next';

interface RoadmapItem {
  title: string;
  detail: string;
}

interface RoadmapPhase {
  id: string;
  label: string;
  status: PhaseStatus;
  items: RoadmapItem[];
}

const STATUS_META: Record<PhaseStatus, { label: string; variant: 'success' | 'accent' | 'muted' }> = {
  done: { label: 'Сделано', variant: 'success' },
  now: { label: 'Сейчас', variant: 'accent' },
  next: { label: 'Далее', variant: 'muted' },
};

const PHASES: RoadmapPhase[] = [
  {
    id: 'foundation',
    label: 'Foundation',
    status: 'done',
    items: [
      { title: 'Control Tower + Execution', detail: 'Поставки, отклонения, инциденты, live map' },
      { title: 'Planning workflow', detail: 'Demand / Supply / Inventory / Transport + plan-fact' },
      { title: 'Portals', detail: 'Кабинеты поставщика и перевозчика' },
      { title: 'Scenarios', detail: 'Builder, compare, recommendations' },
      { title: 'RBAC + RU UI', detail: '7 ролей, role actions, русский интерфейс' },
    ],
  },
  {
    id: 'hardening',
    label: 'Hardening',
    status: 'now',
    items: [
      { title: 'API-backed flows', detail: 'Сценарии, комментарии к инцидентам, plan actions' },
      { title: 'Acceptance + smoke', detail: 'Vitest SCM smoke и checklist приёмки' },
      { title: 'Realtime quality', detail: 'SSE / map updates без лишних refetch' },
    ],
  },
  {
    id: 'depth',
    label: 'Depth',
    status: 'next',
    items: [
      { title: 'Integrations hub', detail: 'ERP / TMS / WMS connectors вместо placeholder' },
      { title: 'E2E decision loop', detail: 'Exception → scenario → apply → updated plan в одном wizard' },
      { title: 'Playwright E2E', detail: 'Критические user flows на CI' },
      { title: 'A11y / responsive audit', detail: 'Полная проверка доступности и mobile shell' },
    ],
  },
];

export function RoadmapPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ ...pageShellSx, minHeight: '100vh', bgcolor: kit.color.canvas }}>
      <KitContainer>
        <Box sx={{ py: { xs: 4, md: 6 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
            <Typography
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: 'none',
                color: kit.color.ink,
                fontWeight: 700,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              }}
            >
              SupplyTwin
            </Typography>
            <Stack direction="row" spacing={1}>
              <KitButton variant="ghost" onClick={() => navigate('/ui-kit')}>
                UI Kit
              </KitButton>
              <KitButton variant="primary" onClick={() => navigate('/login')}>
                Войти
              </KitButton>
            </Stack>
          </Stack>

          <KitPageHeader
            title="Roadmap"
            subtitle="Публичный план развития SupplyTwin: что уже в продукте, что в работе и что дальше."
          />

          <Stack spacing={3} sx={{ mt: 4, maxWidth: 760 }}>
            {PHASES.map((phase) => {
              const meta = STATUS_META[phase.status];
              return (
                <KitCard key={phase.id}>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight={700}>
                      {phase.label}
                    </Typography>
                    <KitBadge variant={meta.variant}>{meta.label}</KitBadge>
                  </Stack>
                  <Stack spacing={1.5}>
                    {phase.items.map((item) => (
                      <Box
                        key={item.title}
                        sx={{
                          py: 1.25,
                          borderBottom: `1px solid ${kit.color.border}`,
                          '&:last-child': { borderBottom: 'none', pb: 0 },
                        }}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: kit.color.muted }}>
                          {item.detail}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </KitCard>
              );
            })}
          </Stack>

          <Typography variant="body2" sx={{ color: kit.color.faint, mt: 4 }}>
            Детальный чеклист приёмки — в репозитории: <code>docs/scm-acceptance-checklist.md</code>
          </Typography>
        </Box>
      </KitContainer>
    </Box>
  );
}
