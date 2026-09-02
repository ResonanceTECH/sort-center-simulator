import { Box, Typography } from '@mui/material';
import { kit } from '@/ui-kit/tokens';

export interface ActivityTimelineItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  detail?: string;
}

interface ActivityTimelineProps {
  items: ActivityTimelineItem[];
  emptyMessage?: string;
}

export function ActivityTimeline({ items, emptyMessage = 'Нет записей' }: ActivityTimelineProps) {
  if (items.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: kit.color.muted, py: 2 }}>
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <>
      {items.map((item) => (
        <Box key={item.id} sx={{ py: 1.25, borderBottom: kit.border.hairline }}>
          <Typography variant="caption" sx={{ color: kit.color.muted }}>
            {item.timestamp} · {item.actor}
          </Typography>
          <Typography variant="body2" fontWeight={600}>{item.action}</Typography>
          {item.detail && (
            <Typography variant="body2" sx={{ color: kit.color.muted }}>{item.detail}</Typography>
          )}
        </Box>
      ))}
    </>
  );
}
