import { useState } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { labelScenarioCategory } from '@/constants/platformRu';
import { useCreateScenarioMutation, useRunScenarioMutation } from '@/hooks/scm/useScmMutations';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitButton } from '@/ui-kit/Button';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';
import type { ScenarioParameter } from '@/types/scm/scenario';

const DEFAULT_PARAMS: ScenarioParameter[] = [
  { category: 'Demand', label: 'Глобальный спрос', change: '+20%' },
  { category: 'Supplier', label: 'Поставщик B', change: 'Мощность -30%' },
  { category: 'Carrier', label: 'Перевозчик C', change: 'Недоступен' },
  { category: 'Route', label: 'Москва → СПб', change: 'Закрыт' },
  { category: 'Inventory', label: 'Страховой запас', change: '+20%' },
];

export function ScenarioBuilderPage() {
  const navigate = useNavigate();
  const createMutation = useCreateScenarioMutation();
  const runMutation = useRunScenarioMutation();

  const [name, setName] = useState('What-if Q3');
  const [parameters, setParameters] = useState<ScenarioParameter[]>(DEFAULT_PARAMS);

  const updateParam = (index: number, field: 'label' | 'change', value: string) => {
    setParameters((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

  const handleRun = async () => {
    const created = await createMutation.mutateAsync({
      name: name.trim() || 'Новый сценарий',
      parameters,
    });
    await runMutation.mutateAsync(created.id);
    navigate(`/scenarios/${created.id}`);
  };

  const busy = createMutation.isPending || runMutation.isPending;

  return (
    <InternalLayout>
      <PageHeader
        title="Конструктор сценария"
        subtitle="Структурированные what-if параметры"
        breadcrumbs={[
          { label: 'Сценарии', to: '/scenarios' },
          { label: 'Новый' },
        ]}
      />

      <KitCard sx={{ maxWidth: 640 }}>
        <TextField
          fullWidth
          size="small"
          label="Название сценария"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>ПАРАМЕТРЫ</Typography>
        {parameters.map((p, index) => (
          <Box
            key={`${p.category}-${index}`}
            sx={{ display: 'flex', gap: 2, alignItems: 'center', py: 1.5, borderBottom: kit.border.hairline }}
          >
            <Typography variant="body2" sx={{ width: 100, color: kit.color.muted }}>
              {labelScenarioCategory(p.category)}
            </Typography>
            <TextField
              size="small"
              value={p.label}
              onChange={(e) => updateParam(index, 'label', e.target.value)}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              value={p.change}
              onChange={(e) => updateParam(index, 'change', e.target.value)}
              sx={{ width: 140 }}
            />
          </Box>
        ))}

        <KitButton variant="primary" sx={{ mt: 3 }} disabled={busy} onClick={() => void handleRun()}>
          {busy ? 'Расчёт…' : 'ЗАПУСТИТЬ СЦЕНАРИЙ'}
        </KitButton>
      </KitCard>
    </InternalLayout>
  );
}
