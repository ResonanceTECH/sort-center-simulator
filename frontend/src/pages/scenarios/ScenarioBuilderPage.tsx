import { Box, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitButton } from '@/ui-kit/Button';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';

const DEFAULT_PARAMS = [
  { category: 'Спрос', label: 'Глобальный спрос', change: '+20%' },
  { category: 'Поставщик', label: 'Поставщик B', change: 'Мощность -30%' },
  { category: 'Перевозчик', label: 'Перевозчик C', change: 'Недоступен' },
  { category: 'Маршрут', label: 'Москва → СПб', change: 'Закрыт' },
  { category: 'Запасы', label: 'Страховой запас', change: '+20%' },
];

export function ScenarioBuilderPage() {
  const navigate = useNavigate();

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
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>СЦЕНАРИЙ</Typography>
        {DEFAULT_PARAMS.map((p) => (
          <Box key={p.category} sx={{ display: 'flex', gap: 2, alignItems: 'center', py: 1.5, borderBottom: kit.border.hairline }}>
            <Typography variant="body2" sx={{ width: 100, color: kit.color.muted }}>{p.category}</Typography>
            <TextField size="small" defaultValue={p.label} sx={{ flex: 1 }} />
            <TextField size="small" defaultValue={p.change} sx={{ width: 140 }} />
          </Box>
        ))}
        <KitButton variant="primary" sx={{ mt: 3 }} onClick={() => navigate('/scenarios/scn-002')}>
          ЗАПУСТИТЬ СЦЕНАРИЙ
        </KitButton>
      </KitCard>
    </InternalLayout>
  );
}
