import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  KeyboardArrowDown,
  Menu as MenuIcon,
  NotificationsOutlined,
  Search,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { useUiStore } from '@/store/uiStore';
import { LANDING } from '@/landing/styles/tokens';
import type { Notification } from '@/types/general';

interface TopBarProps {
  notifications: Notification[];
}

export function TopBar({ notifications }: TopBarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { searchQuery, setSearchQuery, toggleSidebar } = useUiStore();

  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayName = user?.name ?? 'Демо Пользователь';

  const handleLogout = () => {
    setProfileAnchor(null);
    logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: LANDING.snow,
        borderBottom: `1px solid ${LANDING.border}`,
        color: LANDING.ink,
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: '64px !important', px: { xs: 2.5, sm: 4, md: 5 } }}>
        {isMobile && (
          <IconButton edge="start" onClick={toggleSidebar} aria-label="Меню">
            <MenuIcon />
          </IconButton>
        )}

        <TextField
          placeholder="Поиск по проектам, сценариям и отчётам..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            flex: 1,
            maxWidth: { md: 480 },
            '& .MuiOutlinedInput-root': {
              borderRadius: LANDING.radiusButton,
              bgcolor: LANDING.paper,
              fontSize: '0.875rem',
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search sx={{ color: LANDING.fog, fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          inputProps={{ 'aria-label': 'Поиск по проектам, сценариям и отчётам' }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
          <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)} aria-label="Уведомления">
            <Badge badgeContent={unreadCount} color="secondary">
              <NotificationsOutlined />
            </Badge>
          </IconButton>

          <Box
            onClick={(e) => setProfileAnchor(e.currentTarget)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              borderRadius: LANDING.radiusButton,
              px: 1,
              py: 0.5,
              '&:hover': { bgcolor: LANDING.paper },
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: LANDING.obsidian,
                color: LANDING.snow,
                fontSize: '0.875rem',
              }}
            >
              {displayName.charAt(0)}
            </Avatar>
            {!isMobile && (
              <Box>
                <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
                  {displayName}
                </Typography>
                <Typography variant="caption" sx={{ color: LANDING.muted }}>
                  Руководитель проекта
                </Typography>
              </Box>
            )}
            {!isMobile && (
              <KeyboardArrowDown sx={{ color: LANDING.fog, fontSize: 18 }} />
            )}
          </Box>
        </Box>

        <Menu
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={() => setNotifAnchor(null)}
          PaperProps={{ sx: { width: 320, maxHeight: 400 } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Уведомления
            </Typography>
          </Box>
          <Divider />
          {notifications.length === 0 ? (
            <MenuItem disabled>Нет уведомлений</MenuItem>
          ) : (
            notifications.map((n) => (
              <MenuItem key={n.id} onClick={() => setNotifAnchor(null)}>
                <ListItemText
                  primary={n.title}
                  secondary={n.message}
                  primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 600 }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
              </MenuItem>
            ))
          )}
        </Menu>

        <Menu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={() => setProfileAnchor(null)}
        >
          <MenuItem onClick={() => setProfileAnchor(null)}>
            <ListItemIcon>
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: '0.75rem',
                  bgcolor: LANDING.obsidian,
                  color: LANDING.snow,
                }}
              >
                {displayName.charAt(0)}
              </Avatar>
            </ListItemIcon>
            <ListItemText primary="Профиль" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              setProfileAnchor(null);
              navigate('/settings');
            }}
          >
            <ListItemText primary="Настройки" />
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemText
              primary="Выйти"
              primaryTypographyProps={{ color: LANDING.ink, fontWeight: 600 }}
            />
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
