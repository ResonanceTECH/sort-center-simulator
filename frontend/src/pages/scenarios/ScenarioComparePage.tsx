import { Box, Typography } from '@mui/material';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusChip } from '@/components/status/StatusChip';
import { labelComparison } from '@/constants/platformRu';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';

const COMPARISON = [
  { kpi: 'OTIF', base: '92%', s1: '79%', s2: '93%', semantic: { s1: 'RISK', s2: 'BEST' } },
  { kpi: 'Стоимость', base: '12.4M', s1: '13.1M', s2: '12.9M', semantic: {} },
  { kpi: 'Lead time', base: '2.8d', s1: '4.2d', s2: '3.0d', semantic: { s1: 'RISK' } },
  { kpi: 'Риск дефицита', base: '7%', s1: '31%', s2: '9%', semantic: { s1: 'RISK', s2: 'TARGET_REACHED' } },
];

export function ScenarioComparePage() {
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

      <KitCard variant="flat" padding="none">
        <Box sx={{ overflowX: 'auto' }}>
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
            <Box component="thead">
              <Box component="tr" sx={{ borderBottom: kit.border.hairline }}>
                {['KPI', 'База', 'С1', 'С2'].map((h) => (
                  <Box component="th" key={h} sx={{ p: 2, textAlign: 'left', fontWeight: 700, fontSize: '0.8125rem' }}>
                    {h}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {COMPARISON.map((row) => (
                <Box component="tr" key={row.kpi} sx={{ borderBottom: kit.border.hairline }}>
                  <Box component="td" sx={{ p: 2 }}><Typography variant="body2" fontWeight={600}>{row.kpi}</Typography></Box>
                  <Box component="td" sx={{ p: 2 }}><Typography variant="body2">{row.base}</Typography></Box>
                  <Box component="td" sx={{ p: 2 }}>
                    <Typography variant="body2">{row.s1}</Typography>
                    {'s1' in row.semantic && row.semantic.s1 && (
                      <StatusChip status="WARNING" label={labelComparison(row.semantic.s1)} />
                    )}
                  </Box>
                  <Box component="td" sx={{ p: 2 }}>
                    <Typography variant="body2">{row.s2}</Typography>
                    {'s2' in row.semantic && row.semantic.s2 && (
                      <StatusChip status="SUCCESS" label={labelComparison(row.semantic.s2)} />
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </KitCard>
    </InternalLayout>
  );
}
