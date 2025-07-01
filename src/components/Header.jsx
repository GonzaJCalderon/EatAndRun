import {
  AppBar, Toolbar, Typography, Button, Box, IconButton,
  Drawer, List, ListItem, ListItemText
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, selectUser } from '../store/slices/authSlice';
import { useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';

const Header = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
   { label: 'Menú', path: '/app' },
  user && { label: 'Mis pedidos', path: '/mis-pedidos' },
    { label: '¿Quiénes Somos?', path: '/quienes-somos' },
    ...(user?.role === 'admin' ? [{ label: 'Panel Admin', path: '/admin' }] : []),
    ...(user?.role === 'delivery' ? [{ label: 'Reparto', path: '/delivery' }] : []),
    ...(user ? [{ label: `Hola, ${user.name}`, path: '/perfil' }, { label: 'Salir', action: handleLogout }] : [{ label: 'Ingresar', path: '/login' }])
  ];

  const handleNavClick = (item) => {
    setDrawerOpen(false);
    if (item.action) {
      item.action();
    } else {
      navigate(item.path);
    }
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#4caf50' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <img
              src="/assets/eatandrun-logo.jpg"
              alt="Logo"
              style={{ height: 40, borderRadius: '50%', marginRight: 8 }}
            />
            <Typography variant="h6" fontWeight="bold">Eat & Run</Typography>
          </Box>

          {/* Botones Desktop */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {navItems.map((item, i) => (
                <Button
                  key={i}
                  color="inherit"
                  onClick={() => handleNavClick(item)}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Menú Hamburguesa Mobile */}
          {isMobile && (
            <>
              <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
              <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Box sx={{ width: 240, p: 2 }}>
                  <List>
                    {navItems.map((item, i) => (
                      <ListItem button key={i} onClick={() => handleNavClick(item)}>
                        <ListItemText primary={item.label} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Drawer>
            </>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Header;
