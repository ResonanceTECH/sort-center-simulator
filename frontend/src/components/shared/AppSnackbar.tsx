import { Snackbar } from '@mui/material';
import { KitAlert } from '@/ui-kit';
import { useUiStore } from '@/store/uiStore';

export function AppSnackbar() {
  const { snackbar, hideSnackbar } = useUiStore();

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={3000}
      onClose={(_, reason) => {
        if (reason === 'clickaway') return;
        hideSnackbar();
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <KitAlert severity={snackbar.severity} variant="toast" onClose={hideSnackbar}>
        {snackbar.message}
      </KitAlert>
    </Snackbar>
  );
}
