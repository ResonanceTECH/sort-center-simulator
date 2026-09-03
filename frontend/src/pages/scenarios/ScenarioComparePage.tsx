import { useEffect, useMemo, useState } from 'react';
import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusChip } from '@/components/status/StatusChip';
import { labelComparison } from '@/constants/platformRu';
import { useScenarioCompareQuery, useScenariosQuery } from '@/hooks/scm/useScmQueries';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';

export function ScenarioComparePage() {
  const { data: scenariosPage, isLoading: listLoading } = useScenariosQuery();
  const items = scenariosPage?.items ?? [];

  const defaultIds = useMemo(
    () => items.filter((s) => s.status === 'COMPLETED').slice(0, 2).map((s) => s.id),
    [items],
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (selectedIds.length === 0 && defaultIds.length >= 2) {
      setSelectedIds(defaultIds);
    }
  }, [defaultIds, selectedIds.length]);

  const { data, isLoading, error, refetch } = useScenarioCompareQuery(selectedIds);

  const toggleScenario = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  return (
    <InternalLayout>
      <PageHeader
        title="Сравнение сценариев"
        subtitle="Базовый план vs несколько сценариев"
        breadcrumbs={[
          { label: 'Сценарии', to: '/scenarios' },
          { label: 'Сравнение' },
        ]}
      />

      <KitCard sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Выберите сценарии (мин. 2)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {items.map((s) => (
            <FormControlLabel
              key={s.id}
              control={
                <Checkbox
                  size="small"
                  checked={selectedIds.includes(s.id)}
                  onChange={() => toggleScenario(s.id)}
                />
              }
              label={`${s.name} (${s.id})`}
            />
          ))}
        </Box>
        {data?.bestScenarioId && (
          <Typography variant="caption" sx={{ color: kit.color.muted, mt: 1, display: 'block' }}>
            Лучший по OTIF: {data.scenarios.find((s) => s.id === data.bestScenarioId)?.name ?? data.bestScenarioId}
          </Typography>
        )}
      </KitCard>

      <EntityStates
        loading={listLoading || isLoading}
        error={error?.message}
        onRetry={() => void refetch()}
        empty={selectedIds.length < 2}
        emptyTitle="Выберите минимум два сценария"
        emptyDescription="Отметьте сценарии выше для сравнения KPI"
      >
        {data && (
          <KitCard variant="flat" padding="none">
            <Box sx={{ overflowX: 'auto' }}>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                <Box component="thead">
                  <Box component="tr" sx={{ borderBottom: kit.border.hairline }}>
                    <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 700, fontSize: '0.8125rem' }}>
                      KPI
                    </Box>
                    <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 700, fontSize: '0.8125rem' }}>
                      База
                    </Box>
                    {data.scenarios.map((s) => (
                      <Box
                        component="th"
                        key={s.id}
                        sx={{ p: 2, textAlign: 'left', fontWeight: 700, fontSize: '0.8125rem' }}
                      >
                        {s.name}
                        {data.bestScenarioId === s.id && (
                          <StatusChip status="SUCCESS" label="Лучший" />
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {data.rows.map((row) => (
                    <Box component="tr" key={row.kpi} sx={{ borderBottom: kit.border.hairline }}>
                      <Box component="td" sx={{ p: 2 }}>
                        <Typography variant="body2" fontWeight={600}>{row.kpi}</Typography>
                      </Box>
                      <Box component="td" sx={{ p: 2 }}>
                        <Typography variant="body2">{row.baseline}</Typography>
                      </Box>
                      {data.scenarios.map((s) => (
                        <Box component="td" key={s.id} sx={{ p: 2 }}>
                          <Typography variant="body2">{row.values[s.id] ?? '—'}</Typography>
                          {row.semantic?.[s.id] && (
                            <StatusChip
                              status={row.semantic[s.id] === 'RISK' ? 'WARNING' : 'SUCCESS'}
                              label={labelComparison(row.semantic[s.id]!)}
                            />
                          )}
                        </Box>
                      ))}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </KitCard>
        )}
      </EntityStates>
    </InternalLayout>
  );
}
