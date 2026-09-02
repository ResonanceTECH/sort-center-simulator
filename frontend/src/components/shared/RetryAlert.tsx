import { Alert, Button } from '@mui/material';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import { OZON } from '@/theme';

interface RetryAlertProps {
  message: string;
  onRetry: () => void;
}

export function RetryAlert({ message, onRetry }: RetryAlertProps) {
  return (
    <Alert
      severity="error"
      icon={<WarningAmberOutlined />}
      action={
        <Button
          size="small"
          onClick={onRetry}
          sx={{ color: OZON.white, bgcolor: OZON.darkSpace, '&:hover': { bgcolor: OZON.darkSpace } }}
        >
          Повторить
        </Button>
      }
      sx={{
        mb: 3,
        bgcolor: 'rgba(9, 9, 11, 0.08)',
        color: OZON.darkSpace,
        border: `1px solid ${OZON.darkSpace}`,
        '& .MuiAlert-icon': { color: OZON.darkSpace },
      }}
    >
      {message}
    </Alert>
  );
}
