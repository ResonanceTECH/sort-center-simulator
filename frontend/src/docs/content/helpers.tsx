import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { kit } from '@/ui-kit/tokens';

export function P({ children }: { children: ReactNode }) {
  return (
    <Typography variant="body1" sx={{ color: kit.color.body, mb: 1.5, lineHeight: 1.7 }}>
      {children}
    </Typography>
  );
}

export function Ul({ items }: { items: ReactNode[] }) {
  return (
    <Box component="ul" sx={{ m: 0, mb: 2, pl: 2.5, color: kit.color.body, lineHeight: 1.7 }}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </Box>
  );
}

export function InlineCode({ children }: { children: ReactNode }) {
  return (
    <Box
      component="code"
      sx={{
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: '0.85em',
        bgcolor: kit.color.paper,
        border: kit.border.hairline,
        px: 0.6,
        py: 0.1,
        borderRadius: 1,
      }}
    >
      {children}
    </Box>
  );
}

export function Callout({
  title,
  children,
  tone = 'info',
}: {
  title: string;
  children: ReactNode;
  tone?: 'info' | 'warn';
}) {
  return (
    <Box
      sx={{
        mb: 2,
        p: 1.5,
        borderRadius: kit.radius.button,
        border: kit.border.hairline,
        bgcolor: tone === 'warn' ? '#fff8f0' : kit.color.subtle,
        borderLeft: `3px solid ${tone === 'warn' ? kit.color.accent : kit.color.iron}`,
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: kit.color.body, lineHeight: 1.65 }}>
        {children}
      </Typography>
    </Box>
  );
}

export function DocLink({ to, children }: { to: string; children: ReactNode }) {
  const external = to.startsWith('http');
  if (external) {
    return (
      <Box component="a" href={to} target="_blank" rel="noreferrer" sx={{ color: kit.color.accent }}>
        {children}
      </Box>
    );
  }
  return (
    <Box component={RouterLink} to={to} sx={{ color: kit.color.accent, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
      {children}
    </Box>
  );
}

export function ApiRow({ method, path, note }: { method: string; path: string; note?: string }) {
  return (
    <Box sx={{ mb: 1, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.8125rem' }}>
      <Box component="span" sx={{ fontWeight: 700, mr: 1 }}>
        {method}
      </Box>
      <InlineCode>{path}</InlineCode>
      {note ? (
        <Typography component="span" variant="caption" sx={{ ml: 1, color: kit.color.muted }}>
          — {note}
        </Typography>
      ) : null}
    </Box>
  );
}
