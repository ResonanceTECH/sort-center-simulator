import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import type { CreateProjectPayload } from '@/types/projects';

const schema = yup.object({
  name: yup
    .string()
    .trim()
    .required('Название проекта обязательно')
    .max(120, 'Максимум 120 символов'),
  description: yup
    .string()
    .trim()
    .max(1000, 'Максимум 1000 символов')
    .default(''),
});

type FormValues = yup.InferType<typeof schema>;

interface CreateProjectDialogProps {
  open: boolean;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateProjectPayload) => Promise<void> | void;
}

export function CreateProjectDialog({
  open,
  loading = false,
  error = null,
  onClose,
  onSubmit,
}: CreateProjectDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const busy = loading || isSubmitting;

  useEffect(() => {
    if (open) {
      reset({ name: '', description: '' });
    }
  }, [open, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
    });
  });

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="create-project-title"
    >
      <DialogTitle id="create-project-title">Новый проект</DialogTitle>
      <DialogContent sx={{ pt: '12px !important' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              autoFocus
              required
              fullWidth
              label="Название проекта"
              placeholder="Например, Сортировочный центр 100К"
              margin="dense"
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              disabled={busy}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Описание"
              placeholder="Кратко опишите цель проекта (необязательно)"
              margin="dense"
              multiline
              minRows={3}
              error={Boolean(errors.description)}
              helperText={errors.description?.message}
              disabled={busy}
            />
          )}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} color="inherit" disabled={busy}>
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={() => void submit()}
          disabled={busy}
          startIcon={busy ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {busy ? 'Создание…' : 'Создать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
