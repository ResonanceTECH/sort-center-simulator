import { useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Collapse,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  APP_BRAND,
  CARRIER_NAV_ITEMS,
  INTERNAL_NAV_GROUPS,
  SUPPLIER_NAV_ITEMS,
  type NavGroupConfig,
  type NavItemConfig,
} from '@/constants/navigation';
import { canAccessRoute } from '@/constants/routePermissions';
import { NavIcon } from '@/components/general/NavIcon';
import { useControlTowerQuery } from '@/hooks/scm/useScmQueries';
import { usePermissions } from '@/hooks/usePermissions';
import { useUiStore } from '@/store/uiStore';
import { LANDING, landingFont } from '@/landing/styles/tokens';
import { SIDEBAR_WIDTH } from '@/theme';
import type { AppShell } from '@/types/scm/roles';

function LogoMark() {
  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: LANDING.radiusBadge,
        bgcolor: LANDING.obsidian,
        border: '1.5px solid #2c2e34',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: LANDING.ember }} />
    </Box>
  );
}

function filterNavItem(item: NavItemConfig, role: ReturnType<typeof usePermissions>['role']): boolean {
  if (item.roles && role && !item.roles.includes(role)) return false;
  return canAccessRoute(role, item.path);
}

function filterNavGroup(group: NavGroupConfig, role: ReturnType<typeof usePermissions>['role']): NavGroupConfig | null {
  if (group.roles && role && !group.roles.some((r) => r === role)) return null;
  const items = group.items.filter((item) => filterNavItem(item, role));
  if (items.length === 0) return null;
  return { ...group, items };
}

interface SidebarContentProps {
  shell: AppShell;
  onNavigate?: () => void;
}

function SidebarContent({ shell, onNavigate }: SidebarContentProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = usePermissions();
  const { data: towerData } = useControlTowerQuery();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const groups = useMemo(() => {
    if (shell === 'supplier') return null;
    if (shell === 'carrier') return null;
    return INTERNAL_NAV_GROUPS.map((g) => filterNavGroup(g, role)).filter(Boolean) as NavGroupConfig[];
  }, [shell, role]);

  const flatItems = shell === 'supplier' ? SUPPLIER_NAV_ITEMS : shell === 'carrier' ? CARRIER_NAV_ITEMS : null;

  const handleNav = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const getBadge = (key?: NavItemConfig['badgeKey']) => {
    if (!key || !towerData) return 0;
    return key === 'exceptions' ? towerData.alertCounts.exceptions : towerData.alertCounts.incidents;
  };

  const renderItem = (item: NavItemConfig) => {
    const active = isActive(item.path);
    const badge = getBadge(item.badgeKey);
    return (
      <ListItemButton
        key={item.id}
        onClick={() => handleNav(item.path)}
        sx={{
          borderRadius: LANDING.radiusButton,
          mb: 0.25,
          py: 0.875,
          px: 1.5,
          bgcolor: active ? LANDING.paper : 'transparent',
          borderLeft: active ? `3px solid ${LANDING.ember}` : '3px solid transparent',
          '&:hover': { bgcolor: active ? LANDING.paper : LANDING.subtle },
        }}
      >
        <ListItemIcon sx={{ minWidth: 32, color: active ? LANDING.ink : LANDING.steel }}>
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
        {badge > 0 && (
          <Badge badgeContent={badge} color="error" sx={{ mr: 0.5 }} />
        )}
      </ListItemButton>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: LANDING.snow,
        borderRight: `1px solid ${LANDING.border}`,
        fontFamily: landingFont,
        overflow: 'auto',
      }}
    >
      <Box sx={{ px: 2, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <LogoMark />
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: LANDING.ink, lineHeight: 1.3 }}>
          {APP_BRAND[shell]}
        </Typography>
      </Box>

      <List sx={{ flex: 1, px: 1.5, py: 0 }}>
        {flatItems?.map(renderItem)}

        {groups?.map((group) => {
          const open = collapsed[group.id] ?? true;
          const hasActive = group.items.some((item) => isActive(item.path));

          return (
            <Box key={group.id} sx={{ mb: 1 }}>
              {group.collapsible ? (
                <>
                  <ListItemButton
                    onClick={() => setCollapsed((s) => ({ ...s, [group.id]: !open }))}
                    sx={{ borderRadius: LANDING.radiusButton, py: 0.75, px: 1.5 }}
                  >
                    <ListItemText
                      primary={group.label}
                      primaryTypographyProps={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: LANDING.muted,
                      }}
                    />
                    {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                  </ListItemButton>
                  <Collapse in={open || hasActive}>{group.items.map(renderItem)}</Collapse>
                </>
              ) : (
                <>
                  <Typography
                    sx={{
                      px: 1.5,
                      py: 1,
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: LANDING.muted,
                    }}
                  >
                    {group.label}
                  </Typography>
                  {group.items.map(renderItem)}
                </>
              )}
            </Box>
          );
        })}
      </List>
    </Box>
  );
}

interface SidebarProps {
  shell?: AppShell;
}

export function Sidebar({ shell = 'internal' }: SidebarProps) {
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
        <SidebarContent shell={shell} onNavigate={() => setSidebarOpen(false)} />
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
      <SidebarContent shell={shell} />
    </Box>
  );
}
