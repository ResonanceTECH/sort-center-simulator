import { Button } from '@mui/material';
import { KitAlert, kit } from '@/ui-kit';

interface RetryAlertProps {
  message: string;
  onRetry: () => void;
}

export function RetryAlert({ message, onRetry }: RetryAlertProps) {
  return (
    <KitAlert
      severity="error"
      variant="inline"
      action={
        <Button
          size="small"
          onClick={onRetry}
          sx={{
            color: kit.color.snow,
            bgcolor: kit.color.ink,
            px: 1.5,
            borderRadius: kit.radius.button,
            textTransform: 'none',
            '&:hover': { bgcolor: kit.color.graphite },
          }}
        >
          Повторить
        </Button>
      }
      sx={{ mb: 3 }}
    >
      {message}
    </KitAlert>
  );
}
