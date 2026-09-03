import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Button } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { resolveDocsSlugForPath } from '@/docs/registry';

interface ContextualDocsLinkProps {
  /** Override auto-resolve from current path */
  slug?: string;
  label?: string;
}

/** Short entry to full docs — not a tooltip dump. */
export function ContextualDocsLink({ slug, label = 'Справка' }: ContextualDocsLinkProps) {
  const { pathname } = useLocation();
  const resolved = slug ?? resolveDocsSlugForPath(pathname);
  if (!resolved) return null;

  return (
    <Button
      component={RouterLink}
      to={`/docs/${resolved}`}
      size="small"
      startIcon={<HelpOutlineIcon fontSize="small" />}
      sx={{ textTransform: 'none' }}
    >
      {label}
    </Button>
  );
}
