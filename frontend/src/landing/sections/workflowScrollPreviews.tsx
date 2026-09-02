import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import { OZON } from '@/theme';

const previewBoxSx = {
  height: '100%',
  p: 2.5,
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
} as const;

export function EditorPreview() {
  return (
    <Box sx={{ height: '100%', bgcolor: '#fff' }}>
      <Box
        component="img"
        src="/images/project-plan-1.svg"
        alt=""
        sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
      />
    </Box>
  );
}

export function ParametersPreview() {
  const stats = [
    { label: 'Пропускная способность', value: '100 000 тов./ч' },
    { label: 'Направления', value: '400' },
    { label: 'Ворота', value: '24' },
    { label: 'Сортеры', value: '12' },
  ];

  return (
    <Box sx={previewBoxSx}>
      {stats.map((stat) => (
        <Box
          key={stat.label}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            py: 1.5,
            borderRadius: '12px',
            border: '1px solid #ececee',
            bgcolor: '#fff',
          }}
        >
          <Typography sx={{ fontSize: '0.875rem', color: 'rgba(0,26,52,0.64)' }}>{stat.label}</Typography>
          <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: OZON.darkSpace }}>{stat.value}</Typography>
        </Box>
      ))}
    </Box>
  );
}

export function SimulationPreview() {
  return (
    <Box sx={{ ...previewBoxSx, justifyContent: 'space-between' }}>
      <Box
        component="img"
        src="/images/project-plan-3.svg"
        alt=""
        sx={{ width: '100%', flex: 1, objectFit: 'cover', objectPosition: 'top center', borderRadius: '12px', border: '1px solid #ececee' }}
      />
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between">
          <Typography sx={{ fontSize: '0.8125rem', color: 'rgba(0,26,52,0.64)' }}>Прогресс симуляции</Typography>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: OZON.blue }}>67%</Typography>
        </Stack>
        <LinearProgress variant="determinate" value={67} sx={{ height: 6, borderRadius: 3 }} />
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {['Trace-события', 'Очереди', 'Загрузка'].map((tag) => (
            <Box
              key={tag}
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: '12px',
                fontSize: '0.75rem',
                border: '1px solid #ececee',
                color: OZON.darkSpace,
              }}
            >
              {tag}
            </Box>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

function loadBar(label: string, value: number, critical?: boolean) {
  return (
    <Box key={label}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
        <Typography sx={{ fontSize: '0.875rem', color: OZON.darkSpace }}>{label}</Typography>
        <Typography
          sx={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: critical ? OZON.darkSpace : OZON.blue,
          }}
        >
          {value}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: 'rgba(0,26,52,0.08)',
          '& .MuiLinearProgress-bar': {
            bgcolor: critical ? OZON.darkSpace : value >= 80 ? OZON.morningBlue : OZON.blue,
            borderRadius: 4,
          },
        }}
      />
    </Box>
  );
}

export function BottlenecksPreview() {
  return (
    <Box sx={previewBoxSx}>
      {loadBar('Сортеры', 84)}
      {loadBar('Заклейщики', 65)}
      {loadBar('Палетайзеры', 72)}
      {loadBar('Ворота', 96, true)}
    </Box>
  );
}

export function ComparePreview() {
  const rows = [
    { label: 'Базовый', value: '99 022 тов./ч' },
    { label: 'Оптимизированный', value: '99 972 тов./ч' },
    { label: 'Новая конфигурация', value: '100 012 тов./ч', highlight: true },
  ];

  return (
    <Box sx={previewBoxSx}>
      {rows.map((row) => (
        <Box
          key={row.label}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            py: 1.75,
            borderRadius: '12px',
            border: `1px solid ${row.highlight ? OZON.blue : '#ececee'}`,
            bgcolor: row.highlight ? 'rgba(0,91,255,0.06)' : '#fff',
          }}
        >
          <Typography sx={{ fontSize: '0.875rem', color: 'rgba(0,26,52,0.64)' }}>{row.label}</Typography>
          <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: OZON.darkSpace }}>{row.value}</Typography>
        </Box>
      ))}
    </Box>
  );
}

export function RecommendationPreview() {
  const metrics = [
    { label: 'Производительность', value: '100 012 тов./ч' },
    { label: 'Загрузка ворот', value: '84%' },
    { label: 'Очередь', value: '16 КТЯ' },
    { label: 'Цель', value: 'достигнута', success: true },
  ];

  return (
    <Box sx={{ ...previewBoxSx, justifyContent: 'center' }}>
      <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: OZON.darkSpace, mb: 1 }}>
        Рекомендуемый сценарий
      </Typography>
      <Stack spacing={1.25}>
        {metrics.map((metric) => (
          <Stack key={metric.label} direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: '0.875rem', color: 'rgba(0,26,52,0.64)' }}>{metric.label}</Typography>
            <Typography
              sx={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: metric.success ? OZON.morningBlue : OZON.darkSpace,
              }}
            >
              {metric.value}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
