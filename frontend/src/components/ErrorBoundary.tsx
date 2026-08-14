import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Button, Typography } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: 2,
            p: 3,
          }}
        >
          <Typography variant="h5">Что-то пошло не так</Typography>
          <Typography color="text.secondary">
            Произошла ошибка при отображении страницы.
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Обновить страницу
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
