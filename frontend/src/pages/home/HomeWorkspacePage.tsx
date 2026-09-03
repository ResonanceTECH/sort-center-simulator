import { Box, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { usePermissions } from '@/hooks/usePermissions';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';
import { ROLE_LABELS, type AppRole } from '@/types/scm/roles';

interface WorkspaceLink {
  title: string;
  description: string;
  path: string;
}

const WORKSPACES: Record<
  Extract<AppRole, 'SUPPLY_CHAIN_MANAGER' | 'SUPPLY_PLANNER' | 'LOGISTICS_MANAGER' | 'ANALYST'>,
  { title: string; subtitle: string; links: WorkspaceLink[] }
> = {
  SUPPLY_CHAIN_MANAGER: {
    title: 'Supply Chain Executive Overview',
    subtitle: 'Стратегия → план → исполнение → решение',
    links: [
      { title: 'Control Tower', description: 'KPI, риски, требует внимания', path: '/control-tower' },
      { title: 'План поставок', description: 'Утверждение и активация планов', path: '/planning/supply' },
      { title: 'Отклонения', description: 'Critical exceptions и impact', path: '/exceptions' },
      { title: 'Сценарии', description: 'What-if и рекомендации', path: '/scenarios' },
      { title: 'Аналитика', description: 'Обзор сети и сервиса', path: '/analytics' },
      { title: 'Устойчивость', description: 'Concentration / SPOF', path: '/strategy/resilience' },
    ],
  },
  SUPPLY_PLANNER: {
    title: 'Planning Workspace',
    subtitle: 'Прогноз → allocation → submit на согласование',
    links: [
      { title: 'Обзор планирования', description: 'Текущий цикл и риски', path: '/planning' },
      { title: 'Прогноз спроса', description: 'Forecast и допущения', path: '/planning/demand' },
      { title: 'Supply Plan', description: 'Allocation и gaps', path: '/planning/supply' },
      { title: 'Inventory Plan', description: 'Safety stock / stockout', path: '/planning/inventory' },
      { title: 'Сценарии', description: 'Создать и рассчитать', path: '/scenarios' },
      { title: 'План / Факт', description: 'Отклонения от плана', path: '/planning/plan-fact' },
    ],
  },
  LOGISTICS_MANAGER: {
    title: 'Logistics Control Tower',
    subtitle: 'Активные поставки, риск, перевозчики, карта',
    links: [
      { title: 'Control Tower', description: 'At Risk / Delayed / Exceptions', path: '/control-tower' },
      { title: 'Поставки', description: 'Назначение и статусы', path: '/shipments' },
      { title: 'Live Map', description: 'Tracking и geofences', path: '/map' },
      { title: 'Транспортный план', description: 'Capacity и carriers', path: '/planning/transport' },
      { title: 'Отклонения', description: 'Операционный контроль', path: '/exceptions' },
      { title: 'Маршруты', description: 'Lanes и производительность', path: '/lanes' },
    ],
  },
  ANALYST: {
    title: 'Analytics Workspace',
    subtitle: 'Моделирование копии состояния — без изменения SoT',
    links: [
      { title: 'Аналитика', description: 'Service / suppliers / risks', path: '/analytics' },
      { title: 'Сценарии', description: 'Run + compare', path: '/scenarios' },
      { title: 'Сравнение', description: 'KPI vs baseline', path: '/scenarios/compare' },
      { title: 'План / Факт', description: 'Root causes', path: '/planning/plan-fact' },
      { title: 'Поставки', description: 'Drill-down (read)', path: '/shipments' },
      { title: 'Отчёты', description: 'Экспорт и история', path: '/reports' },
    ],
  },
};

export function HomeWorkspacePage() {
  const navigate = useNavigate();
  const { role } = usePermissions();
  const config =
    role && role in WORKSPACES
      ? WORKSPACES[role as keyof typeof WORKSPACES]
      : null;

  if (!config) {
    return (
      <InternalLayout>
        <PageHeader title="Рабочее пространство" subtitle="Нет конфигурации для роли" />
      </InternalLayout>
    );
  }

  return (
    <InternalLayout>
      <PageHeader
        title={config.title}
        subtitle={`${role ? ROLE_LABELS[role] : ''} · ${config.subtitle}`}
      />
      <Grid container spacing={2}>
        {config.links.map((link) => (
          <Grid item xs={12} sm={6} md={4} key={link.path}>
            <KitCard
              sx={{ cursor: 'pointer', height: '100%', '&:hover': { borderColor: kit.color.iron } }}
              onClick={() => navigate(link.path)}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                {link.title}
              </Typography>
              <Typography variant="body2" sx={{ color: kit.color.muted, mt: 0.5 }}>
                {link.description}
              </Typography>
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" sx={{ color: kit.color.faint, fontFamily: 'ui-monospace, monospace' }}>
                  {link.path}
                </Typography>
              </Box>
            </KitCard>
          </Grid>
        ))}
      </Grid>
    </InternalLayout>
  );
}
