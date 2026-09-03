import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { DOCS_NAV } from '@/docs/navTree';
import { kit } from '@/ui-kit/tokens';
import { DocsSearchModal } from '@/docs/components/DocsSearchModal';

interface DocsShellProps {
  children: ReactNode;
  toc?: { id: string; title: string }[];
  activeSlug?: string;
}

export function DocsShell({ children, toc = [], activeSlug }: DocsShellProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const nav = useMemo(
    () => (
      <Box sx={{ p: 2, width: 280 }}>
        <Box
          component={RouterLink}
          to="/docs"
          sx={{ textDecoration: 'none', color: kit.color.ink, display: 'block', mb: 2 }}
        >
          <Typography variant="subtitle1" fontWeight={800}>
            Документация
          </Typography>
          <Typography variant="caption" sx={{ color: kit.color.muted }}>
            SCM Platform
          </Typography>
        </Box>
        {DOCS_NAV.map((group) => (
          <Box key={group.id} sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{ color: kit.color.faint, textTransform: 'uppercase', letterSpacing: 0.6 }}
            >
              {group.title}
            </Typography>
            <List dense disablePadding sx={{ mt: 0.5 }}>
              {group.items.map((item) => {
                const planned = !item.slug || item.status === 'planned';
                const selected = item.slug === activeSlug;
                return (
                  <ListItemButton
                    key={item.title}
                    disabled={planned}
                    selected={selected}
                    onClick={() => {
                      if (!item.slug) return;
                      navigate(`/docs/${item.slug}`);
                      setNavOpen(false);
                    }}
                    sx={{ borderRadius: 1, py: 0.4 }}
                  >
                    <ListItemText
                      primary={item.title}
                      secondary={planned ? 'скоро' : undefined}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: selected ? 700 : 500,
                        fontSize: '0.8125rem',
                      }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>
    ),
    [activeSlug, navigate],
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: kit.color.canvas, color: kit.color.body }}>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          borderBottom: kit.border.hairline,
          bgcolor: 'rgba(244,244,245,0.92)',
          backdropFilter: 'blur(8px)',
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {isMobile && (
          <IconButton aria-label="Меню" onClick={() => setNavOpen(true)}>
            <MenuIcon />
          </IconButton>
        )}
        <Box
          component={RouterLink}
          to="/"
          sx={{ color: kit.color.muted, textDecoration: 'none', fontSize: '0.8125rem', mr: 1 }}
        >
          ← На сайт
        </Box>
        <TextField
          size="small"
          placeholder="Поиск документации"
          onClick={() => setSearchOpen(true)}
          InputProps={{
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Typography variant="caption" sx={{ color: kit.color.faint }}>
                  ⌘K
                </Typography>
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 360, flex: 1, bgcolor: kit.color.snow, borderRadius: 1 }}
        />
        <Box sx={{ flex: 1 }} />
        <Box
          component={RouterLink}
          to="/login"
          sx={{ color: kit.color.ink, textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600 }}
        >
          Войти
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '260px minmax(0, 1fr)',
            lg: toc.length > 0 ? '280px minmax(0, 1fr) 220px' : '280px minmax(0, 1fr)',
          },
          gap: { xs: 2, md: 3 },
          maxWidth: 1280,
          mx: 'auto',
          width: '100%',
          px: { xs: 2, md: 3 },
          py: 3,
          alignItems: 'start',
        }}
      >
        {!isMobile && (
          <Box
            sx={{
              position: 'sticky',
              top: 64,
              maxHeight: 'calc(100vh - 80px)',
              overflow: 'auto',
              borderRight: kit.border.hairline,
            }}
          >
            {nav}
          </Box>
        )}

        <Box component="main" sx={{ minWidth: 0, maxWidth: toc.length > 0 ? 760 : 920 }}>
          {children}
        </Box>

        {!isMobile && toc.length > 0 && (
          <Box sx={{ position: 'sticky', top: 72, display: { xs: 'none', lg: 'block' } }}>
            <Typography variant="caption" fontWeight={700} sx={{ color: kit.color.faint }}>
              На этой странице
            </Typography>
            <List dense disablePadding sx={{ mt: 1 }}>
              {toc.map((item) => (
                <ListItemButton
                  key={item.id}
                  component="a"
                  href={`#${item.id}`}
                  sx={{ borderRadius: 1, py: 0.25 }}
                >
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{ variant: 'caption', color: kit.color.muted }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        )}
      </Box>

      <Drawer open={navOpen} onClose={() => setNavOpen(false)}>
        {nav}
      </Drawer>
      <DocsSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </Box>
  );
}
