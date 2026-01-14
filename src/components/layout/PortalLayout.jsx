import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    Container,
    Button,
    IconButton,
    useTheme,
    alpha,
    Avatar,
    Menu,
    MenuItem
} from '@mui/material';
import {
    School as SchoolIcon,
    Search as SearchIcon,
    Brightness4 as DarkModeIcon,
    Login as LoginIcon,
    Apps as AppsIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const PortalLayout = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'auto',
            bgcolor: '#f8f9fa' // Light, clean background
        }}>
            {/* Premium Header */}
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    color: 'text.primary'
                }}
            >
                <Container maxWidth="lg">
                    <Toolbar disableGutters sx={{ height: 70 }}>
                        {/* Logo Area */}
                        <Box
                            onClick={() => navigate('/portal')}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                mr: 4
                            }}
                        >
                            <Box
                                sx={{
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    p: 1,
                                    borderRadius: 2,
                                    mr: 1.5,
                                    display: 'flex',
                                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                                }}
                            >
                                <SchoolIcon fontSize="small" />
                            </Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 800,
                                    letterSpacing: '-0.5px',
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    backgroundClip: 'text',
                                    textFillColor: 'transparent',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}
                            >
                                Knowledge Base
                            </Typography>
                        </Box>

                        {/* Navigation (Hidden on mobile for simplicity, or add generic links) */}
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                            <Button color="inherit" onClick={() => navigate('/portal')}>Início</Button>
                            <Button color="inherit">Categorias</Button>
                            <Button color="inherit">Ajuda</Button>
                        </Box>

                        {/* Actions */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton size="small" color="inherit">
                                <SearchIcon />
                            </IconButton>
                            <Button
                                variant="outlined"
                                startIcon={<AppsIcon />}
                                onClick={() => navigate('/')}
                                sx={{
                                    borderRadius: 20,
                                    textTransform: 'none',
                                    fontWeight: 600
                                }}
                            >
                                Abrir Aplicação
                            </Button>
                            {currentUser ? (
                                <>
                                    <IconButton onClick={handleMenuOpen} size="small">
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : currentUser.username?.charAt(0).toUpperCase() || 'U'}
                                        </Avatar>
                                    </IconButton>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={handleMenuClose}
                                    >
                                        <MenuItem disabled>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {currentUser.name || currentUser.username}
                                            </Typography>
                                        </MenuItem>
                                        <MenuItem onClick={() => { navigate('/base-conhecimento'); handleMenuClose(); }}>
                                            Gerenciar KB
                                        </MenuItem>
                                    </Menu>
                                </>
                            ) : (
                                <Button
                                    variant="outlined"
                                    startIcon={<LoginIcon />}
                                    onClick={() => navigate('/login')}
                                    sx={{
                                        borderRadius: 20,
                                        textTransform: 'none',
                                        fontWeight: 600
                                    }}
                                >
                                    Login
                                </Button>
                            )}
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1 }}>
                <Outlet />
            </Box>

            {/* Footer */}
            <Box
                component="footer"
                sx={{
                    py: 4,
                    bgcolor: 'white',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    mt: 8
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="body2" color="text.secondary" align="center">
                        © {new Date().getFullYear()} AppRaizes Knowledge Base. Todos os direitos reservados.
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default PortalLayout;
