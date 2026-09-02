import type { ReactNode } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { LANDING } from '@/landing/styles/tokens';

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select';
  options?: { value: string; label: string }[];
}

export interface FilterBarProps {
  fields: FilterField[];
  values: Record<string, string | undefined>;
  onChange: (updates: Record<string, string | undefined>) => void;
  actions?: ReactNode;
}

export function FilterBar({ fields, values, onChange, actions }: FilterBarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1.5,
        mb: 2.5,
        p: 2,
        borderRadius: LANDING.radiusCard,
        bgcolor: LANDING.snow,
        border: `1px solid ${LANDING.border}`,
        alignItems: 'flex-end',
      }}
    >
      {fields.map((field) =>
        field.type === 'select' ? (
          <FormControl key={field.key} size="small" sx={{ minWidth: 160 }}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              label={field.label}
              value={values[field.key] ?? ''}
              onChange={(e) =>
                onChange({ [field.key]: e.target.value || undefined })
              }
            >
              <MenuItem value="">Все</MenuItem>
              {(field.options ?? []).map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <TextField
            key={field.key}
            size="small"
            label={field.label}
            value={values[field.key] ?? ''}
            onChange={(e) => onChange({ [field.key]: e.target.value || undefined })}
            sx={{ minWidth: 180 }}
          />
        ),
      )}
      {actions && <Box sx={{ ml: 'auto' }}>{actions}</Box>}
    </Box>
  );
}
