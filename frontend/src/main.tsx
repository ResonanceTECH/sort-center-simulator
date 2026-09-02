import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { App } from '@/App';
import { AppProviders } from '@/app/AppProviders';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppSnackbar } from '@/components/shared/AppSnackbar';
import { AuthProvider } from '@/context/AuthProvider';
import { theme } from '@/theme';
import '@/styles/tokens.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppProviders>
          <AuthProvider>
            <ErrorBoundary>
              <App />
              <AppSnackbar />
            </ErrorBoundary>
          </AuthProvider>
        </AppProviders>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
