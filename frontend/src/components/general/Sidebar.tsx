import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { NAV_BOTTOM_ITEMS, NAV_ITEMS } from '@/constants/navigation';
import { NavIcon } from '@/components/general/NavIcon';
import { useUiStore } from '@/store/uiStore';
import { OZON, SIDEBAR_WIDTH } from '@/theme';
import { PROJECTS_PAGE } from '@/constants/projects';

function LogoMark() {
  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: '8px',
        background: `linear-gradient(135deg, ${OZON.blue} 0%, ${OZON.morningBlue} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          width: 14,
          height: 14,
          borderLeft: `3px solid ${OZON.white}`,
          borderBottom: `3px solid ${OZON.white}`,
          transform: 'rotate(-45deg) translate(1px, -1px)',
        }}
      />
    </Box>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const renderItems = (items: typeof NAV_ITEMS) =>
    items.map((item) => {
      const active = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
      return (
        <ListItemButton
          key={item.id}
          onClick={() => handleNav(item.path)}
          sx={{
            borderRadius: '10px',
            mb: 0.25,
            py: 1,
            px: 1.5,
            transition: 'background-color 0.18s ease',
            bgcolor: active ? 'rgba(0, 91, 255, 0.10)' : 'transparent',
            borderLeft: active ? `3px solid ${OZON.blue}` : '3px solid transparent',
            '&:hover': {
              bgcolor: active ? 'rgba(0, 91, 255, 0.10)' : 'rgba(0, 162, 255, 0.08)',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: active ? OZON.blue : OZON.darkSpace }}>
            <NavIcon name={item.icon} />
          </ListItemIcon>
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              fontSize: '0.8125rem',
              fontWeight: active ? 600 : 400,
              color: active ? OZON.blue : OZON.darkSpace,
            }}
          />
        </ListItemButton>
      );
    });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: OZON.white,
        borderRight: `1px solid ${PROJECTS_PAGE.border}`,
      }}
    >
      <Box sx={{ px: 2, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <LogoMark />
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, lineHeight: 1.3, fontSize: '0.875rem', color: OZON.darkSpace }}
        >
          Конструктор СЦ
        </Typography>
      </Box>

      <List sx={{ flex: 1, px: 1.5, py: 0 }}>{renderItems(NAV_ITEMS)}</List>

      <Box sx={{ px: 1.5, pb: 2 }}>{renderItems(NAV_BOTTOM_ITEMS)}</Box>
    </Box>
  );
}

export function Sidebar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sidebarOpen, setSidebarOpen } = useUiStore();

  if (isMobile) {
    return (
      <Drawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            border: 'none',
            boxShadow: '0 8px 24px rgba(0, 26, 52, 0.12)',
          },
        }}
      >
        <SidebarContent onNavigate={() => setSidebarOpen(false)} />
      </Drawer>
    );
  }

  return (
    <Box
      component="nav"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: theme.zIndex.drawer,
      }}
    >
      <SidebarContent />
    </Box>
  );
}
