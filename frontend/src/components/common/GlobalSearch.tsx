import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useGlobalSearchQuery } from '@/hooks/scm/useScmQueries';
import { useUiStore } from '@/store/uiStore';
import { kit } from '@/ui-kit/tokens';
import { SEARCH_ENTITY_LABELS } from '@/constants/platformRu';

const TYPE_LABELS = SEARCH_ENTITY_LABELS;

export function GlobalSearch() {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useUiStore();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const trimmed = searchQuery.trim();
  const { data, isFetching } = useGlobalSearchQuery(trimmed, open && trimmed.length >= 2);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (link: string) => {
    setOpen(false);
    setSearchQuery('');
    navigate(link);
  };

  return (
    <Box ref={containerRef} sx={{ flex: 1, maxWidth: { md: 480 }, position: 'relative' }}>
      <TextField
          placeholder="Поиск: ID поставки, поставщик, перевозчик, SKU, инцидент..."
        size="small"
        fullWidth
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && data?.[0]) handleSelect(data[0].link);
          if (e.key === 'Escape') setOpen(false);
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: kit.radius.button,
            bgcolor: kit.color.paper,
            fontSize: '0.875rem',
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {isFetching ? (
                <CircularProgress size={18} />
              ) : (
                <Search sx={{ color: kit.color.fog, fontSize: 20 }} />
              )}
            </InputAdornment>
          ),
        }}
        inputProps={{ 'aria-label': 'Глобальный поиск', 'aria-expanded': open }}
      />

      {open && trimmed.length >= 2 && (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 1300,
            maxHeight: 360,
            overflow: 'auto',
            borderRadius: kit.radius.panel,
            border: kit.border.hairline,
          }}
        >
          {data && data.length === 0 && !isFetching && (
            <Typography variant="body2" sx={{ p: 2, color: kit.color.muted }}>
              Ничего не найдено
            </Typography>
          )}
          <List disablePadding>
            {data?.map((result) => (
              <ListItemButton key={`${result.type}-${result.id}`} onClick={() => handleSelect(result.link)}>
                <ListItemText
                  primary={result.label}
                  secondary={`${TYPE_LABELS[result.type]}${result.subtitle ? ` · ${result.subtitle}` : ''}`}
                  primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
