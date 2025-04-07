import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Divider, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  Avatar,
  Menu,
  MenuItem,
  alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ListAlt as ListAltIcon,
  Add as AddIcon,
  Book as BookIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  ManageAccounts as ManageAccountsIcon,
  Business as BusinessIcon,
  Construction as ConstructionIcon,
  Build as BuildIcon,
  LocalGasStation as GasStationIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 250;

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estilo global para remover margens e padding do body
  useEffect(() => {
    document.body.style.margin = 0;
    document.body.style.padding = 0;
    document.body.style.overflow = 'hidden';
    document.body.style.boxSizing = 'border-box';
    document.body.style.width = '100vw';
    document.body.style.height = '100vh';
    
    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.overflow = '';
      document.body.style.boxSizing = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Itens de menu comuns a todos os usuários
  const commonMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Solicitações', icon: <ListAltIcon />, path: '/solicitacoes' },
    { text: 'Nova Solicitação', icon: <AddIcon />, path: '/solicitacoes/nova' },
    { text: 'Clientes', icon: <BusinessIcon />, path: '/clientes' },
    { text: 'Equipamentos', icon: <ConstructionIcon />, path: '/equipamentos' },
    { text: 'Abastecimentos', icon: <GasStationIcon />, path: '/abastecimentos' },
    { text: 'Peças', icon: <BuildIcon />, path: '/pecas' },
    { text: 'Dicionário de Peças', icon: <BookIcon />, path: '/dicionario' },
    { text: 'Gerenciar Usuários', icon: <ManageAccountsIcon />, path: '/usuarios' },
  ];
  
  // Itens de menu apenas para administradores (reservado para futuras opções exclusivas)
  const adminMenuItems = [];
  
  // Combina os itens de menu com base na função do usuário
  const menuItems = [
    ...commonMenuItems,
    ...(currentUser?.role === 'admin' ? adminMenuItems : [])
  ];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'primary.main',
          color: 'white',
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600,
            letterSpacing: 1,
            textAlign: 'center'
          }}
        >
          Appraizes
        </Typography>
      </Box>
      <Divider sx={{ mx: 2 }} />
      <List sx={{ px: 1, mt: 1, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
                         (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton 
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 1.5,
                  py: 1,
                  backgroundColor: isActive ? alpha('#1976d2', 0.08) : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive ? alpha('#1976d2', 0.12) : alpha('#1976d2', 0.04),
                  },
                  transition: 'background-color 0.2s ease-in-out'
                }}
              >
                <ListItemIcon sx={{ 
                  color: isActive ? 'primary.main' : 'text.secondary',
                  minWidth: 40
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'primary.main' : 'text.primary',
                    fontSize: '0.95rem'
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 1.5,
          px: 1
        }}>
          <Avatar 
            sx={{ 
              width: 32, 
              height: 32, 
              bgcolor: 'primary.main',
              fontSize: '0.875rem',
              mr: 1.5
            }}
          >
            {currentUser?.name?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {currentUser?.name || 'Usuário'}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                display: 'block',
                lineHeight: 1.2
              }}
            >
              {currentUser?.email || 'usuário@exemplo.com'}
            </Typography>
          </Box>
        </Box>
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: 'text.disabled',
            px: 1
          }}
        >
          <InfoIcon sx={{ fontSize: 12, mr: 0.5 }} />
          Versão 1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden'
    }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          boxSizing: 'border-box',
          right: 0
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Sistema de Solicitações de Peças
          </Typography>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              {currentUser?.name?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit">Perfil</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit">Sair</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: '#ffffff',
              borderRight: '1px solid rgba(0, 0, 0, 0.06)'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: '#ffffff',
              borderRight: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0 0 20px rgba(0, 0, 0, 0.03)',
              overflow: 'hidden'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1,
          width: { xs: '100vw', sm: `calc(100vw - ${drawerWidth}px)` },
          ml: { xs: 0, sm: 0 },
          pt: 'calc(64px - 70px)',
          height: 'calc(100vh - (64px - 70px))',
          overflow: 'auto',
          position: 'fixed',
          left: { xs: 0, sm: drawerWidth },
          right: 0,
          backgroundColor: '#fff',
          px: 0
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
