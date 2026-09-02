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
import { LANDING, landingFont } from '@/landing/styles/tokens';
import { SIDEBAR_WIDTH } from '@/theme';

function LogoMark() {
  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: LANDING.radiusBadge,
        bgcolor: LANDING.obsidian,
        border: '1.5px solid #2c2e34',
        boxShadow: LANDING.shadowPrimary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: '2px',
          bgcolor: LANDING.ember,
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
      const active =
        location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
      return (
        <ListItemButton
          key={item.id}
          onClick={() => handleNav(item.path)}
          sx={{
            borderRadius: LANDING.radiusButton,
            mb: 0.25,
            py: 1,
            px: 1.5,
            transition: 'background-color 0.18s ease',
            bgcolor: active ? LANDING.paper : 'transparent',
            borderLeft: active ? `3px solid ${LANDING.ember}` : '3px solid transparent',
            '&:hover': {
              bgcolor: active ? LANDING.paper : LANDING.subtle,
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: active ? LANDING.ink : LANDING.steel }}>
            <NavIcon name={item.icon} />
          </ListItemIcon>
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              fontSize: '0.8125rem',
              fontWeight: active ? 600 : 400,
              color: active ? LANDING.ink : LANDING.body,
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
        bgcolor: LANDING.snow,
        borderRight: `1px solid ${LANDING.border}`,
        fontFamily: landingFont,
      }}
    >
      <Box sx={{ px: 2, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <LogoMark />
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            lineHeight: 1.3,
            fontSize: '0.875rem',
            color: LANDING.ink,
            letterSpacing: '-0.02em',
          }}
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
            boxShadow: '0 12px 32px rgba(9, 9, 11, 0.12)',
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
