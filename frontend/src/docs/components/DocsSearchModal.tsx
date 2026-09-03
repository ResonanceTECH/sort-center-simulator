import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { searchDocs } from '@/docs/search';
import { kit } from '@/ui-kit/tokens';

interface DocsSearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function DocsSearchModal({ open, onClose }: DocsSearchModalProps) {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const hits = useMemo(() => searchDocs(q), [q]);

  useEffect(() => {
    if (!open) setQ('');
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: kit.border.hairline }}>
          <TextField
            autoFocus
            fullWidth
            placeholder="Поиск по документации…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            size="small"
          />
          <Typography variant="caption" sx={{ color: kit.color.faint, mt: 1, display: 'block' }}>
            Esc — закрыть · Enter — открыть первый результат
          </Typography>
        </Box>
        <List sx={{ maxHeight: 420, overflow: 'auto' }}>
          {hits.length === 0 && q.length >= 2 && (
            <Typography variant="body2" sx={{ p: 2, color: kit.color.muted }}>
              Ничего не найдено
            </Typography>
          )}
          {hits.map((hit) => (
            <ListItemButton
              key={hit.slug}
              onClick={() => {
                navigate(`/docs/${hit.slug}`);
                onClose();
              }}
            >
              <ListItemText
                primary={hit.title}
                secondary={`${hit.category} — ${hit.excerpt}`}
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}
