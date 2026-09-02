import { Box, Typography } from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { kit } from '@/ui-kit/tokens';

export interface MetricBarChartPoint {
  label: string;
  value: number;
  drillDownLink?: string;
}

interface MetricBarChartProps {
  data: MetricBarChartPoint[];
  height?: number;
  onBarClick?: (point: MetricBarChartPoint) => void;
}

export function MetricBarChart({ data, height = 280, onBarClick }: MetricBarChartProps) {
  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={kit.color.border} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: kit.color.muted, fontSize: 12 }}
            axisLine={{ stroke: kit.color.border }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: kit.color.muted, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: kit.radius.button,
              border: kit.border.hairline,
              fontSize: '0.8125rem',
            }}
          />
          <Bar
            dataKey="value"
            fill={kit.color.obsidian}
            radius={[6, 6, 0, 0]}
            cursor={onBarClick ? 'pointer' : 'default'}
            onClick={(_data, index) => {
              const point = data[index];
              if (point && onBarClick) onBarClick(point);
            }}
          />
        </BarChart>
      </ResponsiveContainer>
      {data.length === 0 && (
        <Typography variant="body2" sx={{ color: kit.color.muted, textAlign: 'center', py: 4 }}>
          Нет данных для отображения
        </Typography>
      )}
    </Box>
  );
}
