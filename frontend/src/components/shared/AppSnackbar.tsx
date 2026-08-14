import { Alert, Snackbar } from '@mui/material';
import { useUiStore } from '@/store/uiStore';

export function AppSnackbar() {
  const { snackbar, hideSnackbar } = useUiStore();

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={3000}
      onClose={hideSnackbar}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity={snackbar.severity} variant="filled" onClose={hideSnackbar}>
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
}
