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
  alpha,
  Collapse,
  styled,
  Tooltip
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
  LocalGasStation as GasStationIcon,
  Settings as SettingsIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  MenuOpen as MenuOpenIcon,
  DirectionsCar as DirectionsCarIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  Engineering as EngineeringIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Check as CheckIcon,
  Agriculture as AgricultureIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 250;
const menuHoverColor = alpha('#1976d2', 0.08);
const menuActiveColor = alpha('#1976d2', 0.12);

// Componentes estilizados para garantir que não haja espaços indesejados
// Componente raiz do layout
const LayoutRoot = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  width: '100vw',
  overflow: 'hidden',
  margin: 0,
  padding: 0,
  position: 'relative',
  backgroundColor: '#f9fafc'
}));

// Conteúdo principal
const MainContent = styled('main')(({ menuwidth }) => ({
  flexGrow: 1,
  padding: 0,
  margin: 0,
  width: `calc(100% - ${menuwidth}px)`,
  marginLeft: `${menuwidth}px`,
  marginTop: '64px',
  height: 'calc(100vh - 64px)',
  overflow: 'auto',
  backgroundColor: '#f9fafc',
  transition: 'width 0.3s ease-in-out, margin-left 0.3s ease-in-out',
  display: 'flex',
  flexDirection: 'column',
  borderLeft: 'none'
}));

// Container do menu lateral
const MenuContainer = styled('div')(({ menuwidth }) => ({
  width: menuwidth,
  position: 'fixed',
  top: 0,
  left: 0,
  height: '100vh',
  zIndex: 1200,
  borderRight: 'none',
  display: 'flex',
  flexDirection: 'column'
}));

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Calcular a largura atual do menu
  const currentMenuWidth = menuCollapsed ? 64 : drawerWidth;
  
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

  // Função para verificar se um caminho está ativo
  const isPathActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return path !== '/' && location.pathname.startsWith(path);
  };

  // Função para verificar se algum submenu está ativo
  const isSubmenuActive = (submenuItems) => {
    return submenuItems.some(item => isPathActive(item.path));
  };

  // Função para alternar a expansão de um menu
  const handleMenuExpand = (menuId) => {
    setExpandedMenu(expandedMenu === menuId ? null : menuId);
  };

  // Função para alternar o colapso do menu lateral
  const toggleMenuCollapse = () => {
    setMenuCollapsed(!menuCollapsed);
    // Fechar submenus quando o menu é colapsado
    if (!menuCollapsed) {
      setExpandedMenu(null);
    }
  };

  // Estrutura de menu com submenus
  const menuItems = [
    { 
      id: 'dashboard',
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/dashboard',
      type: 'item'
    },
    { 
      id: 'pecas',
      text: 'Peças', 
      icon: <BuildIcon />, 
      type: 'submenu',
      submenu: [
        { text: 'Dicionário de Peças', icon: <BookIcon />, path: '/dicionario' },
        { text: 'Solicitações', icon: <ListAltIcon />, path: '/solicitacoes' },
        { text: 'Cadastro', icon: <AddIcon />, path: '/pecas/cadastro' }
      ]
    },
    { 
      id: 'maquinas',
      text: 'Máquinas', 
      icon: <AgricultureIcon />, 
      type: 'submenu',
      submenu: [
        { text: 'Famílias', icon: <CategoryIcon />, path: '/familias' },
        { text: 'Modelos', icon: <InventoryIcon />, path: '/modelos' },
        { text: 'Equipamentos', icon: <ConstructionIcon />, path: '/equipamentos' }
      ]
    },
    { 
      id: 'clientes',
      text: 'Clientes', 
      icon: <BusinessIcon />, 
      type: 'submenu',
      submenu: [
        { text: 'Cadastro', icon: <AddIcon />, path: '/clientes' },
        { text: 'Frota de Máquinas', icon: <DirectionsCarIcon />, path: '/clientes/frota' }
      ]
    },
    { 
      id: 'configuracoes',
      text: 'Configurações', 
      icon: <SettingsIcon />, 
      type: 'submenu',
      submenu: [
        { text: 'Gerenciar Usuários', icon: <ManageAccountsIcon />, path: '/usuarios' },
        { text: 'Ferramentas', icon: <ConstructionIcon />, path: '/configuracoes' }
      ]
    }
  ];
  
  // Adicionar itens de menu exclusivos para administradores, se necessário
  if (currentUser?.role === 'admin') {
    // Exemplo: menuItems.push({ ... });
  }

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', margin: 0, padding: 0 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'primary.main',
          color: 'white',
          px: 2,
          height: '64px',
          minHeight: '64px',
          maxHeight: '64px',
          boxSizing: 'border-box',
          margin: 0,
          padding: 0,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1300
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '64px'
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              letterSpacing: 1,
              textAlign: 'center',
              transition: 'opacity 0.2s',
              opacity: menuCollapsed ? 0 : 1,
              display: menuCollapsed ? 'none' : 'block',
              width: menuCollapsed ? 0 : 'auto',
              paddingLeft: '24px'
            }}
          >
            Appraizes
          </Typography>
        </Box>
        <IconButton 
          onClick={toggleMenuCollapse}
          sx={{ 
            color: 'white',
            p: 0.5,
            ml: menuCollapsed ? 'auto' : 0,
            mr: menuCollapsed ? 'auto' : 0,
            '&:hover': { backgroundColor: alpha('#ffffff', 0.1) }
          }}
        >
          {menuCollapsed ? <MenuIcon /> : <MenuOpenIcon />}
        </IconButton>
      </Box>
      <Divider sx={{ mx: menuCollapsed ? 0 : 2 }} />
      <List sx={{ px: menuCollapsed ? 0.5 : 1, mt: '64px', flexGrow: 1 }}>
        {menuItems.map((item) => {
          // Determinar se este item ou algum de seus subitens está ativo
          const isItemActive = item.type === 'item' ? isPathActive(item.path) : isSubmenuActive(item.submenu || []);
          const isExpanded = expandedMenu === item.id;
          
          return (
            <React.Fragment key={item.id}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton 
                  onClick={() => {
                    if (item.type === 'item') {
                      navigate(item.path);
                    } else {
                      handleMenuExpand(item.id);
                    }
                  }}
                  sx={{
                    borderRadius: 1.5,
                    py: 1,
                    px: menuCollapsed ? 1 : 2,
                    backgroundColor: isItemActive ? menuHoverColor : 'transparent',
                    '&:hover': {
                      backgroundColor: isItemActive ? menuActiveColor : menuHoverColor,
                    },
                    transition: 'all 0.2s ease-in-out',
                    justifyContent: menuCollapsed ? 'center' : 'flex-start'
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: isItemActive ? 'primary.main' : 'text.secondary',
                    minWidth: menuCollapsed ? 0 : 40,
                    mr: menuCollapsed ? 0 : 1
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {!menuCollapsed && (
                    <>
                      <ListItemText 
                        primary={item.text} 
                        primaryTypographyProps={{
                          fontWeight: isItemActive ? 600 : 400,
                          color: isItemActive ? 'primary.main' : 'text.primary',
                          fontSize: '0.95rem',
                          transition: 'all 0.2s ease-in-out'
                        }}
                        sx={{ my: 0 }}
                      />
                      {item.type === 'submenu' && (
                        <Box component="span" sx={{ ml: 'auto', transition: 'transform 0.3s' }}>
                          {isExpanded ? 
                            <ExpandMoreIcon sx={{ color: isItemActive ? 'primary.main' : 'text.secondary' }} /> : 
                            <ChevronRightIcon sx={{ color: isItemActive ? 'primary.main' : 'text.secondary' }} />}
                        </Box>
                      )}
                    </>
                  )}
                </ListItemButton>
              </ListItem>
              
              {/* Submenu */}
              {item.type === 'submenu' && (
                <Collapse in={isExpanded && !menuCollapsed} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 2 }}>
                    {item.submenu.map((subItem) => {
                      const isSubItemActive = isPathActive(subItem.path);
                      return (
                        <ListItem key={subItem.text} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemButton
                            onClick={() => navigate(subItem.path)}
                            sx={{
                              borderRadius: 1.5,
                              py: 0.75,
                              pl: 2,
                              backgroundColor: isSubItemActive ? menuHoverColor : 'transparent',
                              '&:hover': {
                                backgroundColor: isSubItemActive ? menuActiveColor : menuHoverColor,
                              },
                              transition: 'background-color 0.2s ease-in-out'
                            }}
                          >
                            <ListItemIcon sx={{ 
                              color: isSubItemActive ? 'primary.main' : 'text.secondary',
                              minWidth: 30,
                              fontSize: '0.85rem'
                            }}>
                              {subItem.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={subItem.text}
                              primaryTypographyProps={{
                                fontWeight: isSubItemActive ? 600 : 400,
                                color: isSubItemActive ? 'primary.main' : 'text.primary',
                                fontSize: '0.9rem'
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>
      
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {menuCollapsed ? (
            <Tooltip title="Versão 1.0.0" placement="right" arrow>
              <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            </Tooltip>
          ) : (
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
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <LayoutRoot>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${currentMenuWidth}px)` },
          ml: { sm: `${currentMenuWidth}px` },
          boxSizing: 'border-box',
          right: 0,
          transition: 'width 0.3s ease-in-out, margin-left 0.3s ease-in-out',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderLeft: 'none',
          height: '64px',
          maxHeight: '64px'
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ overflow: 'hidden', display: { xs: 'none', sm: 'block' } }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    color: 'white'
                  }}
                >
                  {currentUser?.name || 'Usuário'}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'white',
                    display: 'block',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {currentUser?.email || 'usuário@exemplo.com'}
                </Typography>
              </Box>
              <Avatar 
                sx={{ 
                  bgcolor: 'warning.main',
                  color: 'warning.contrastText',
                  fontSize: '0.875rem',
                  width: 36,
                  height: 36,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    bgcolor: 'warning.dark'
                  }
                }}
                onClick={handleProfileMenuOpen}
              >
                {currentUser?.name?.charAt(0) || 'U'}
              </Avatar>
            </Box>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
              sx={{ display: { xs: 'block', sm: 'none' } }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>
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
            <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/perfil'); }}>
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
      <MenuContainer menuwidth={currentMenuWidth}>
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
              borderRight: 'none'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            margin: 0,
            padding: 0,
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: currentMenuWidth,
              backgroundColor: '#ffffff',
              borderRight: 'none',
              boxShadow: 'none',
              overflow: 'hidden',
              transition: 'width 0.3s ease-in-out',
              margin: 0,
              padding: 0,
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              paddingTop: 0,
              display: 'flex',
              flexDirection: 'column'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </MenuContainer>
      <MainContent menuwidth={currentMenuWidth}>
        <Outlet />
      </MainContent>
    </LayoutRoot>
  );
}
