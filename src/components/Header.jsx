import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, selectUser } from '../store/slices/authSlice';

const Header = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#4caf50' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo + nombre empresa */}
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/assets/eatandrun-logo.jpg" alt="Logo" style={{ height: 40, borderRadius: '50%', marginRight: 8 }} />
          <Typography variant="h6" fontWeight="bold">Eat & Run</Typography>
        </Box>

        {/* Links */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button color="inherit" onClick={() => navigate('/')}>Menú</Button>
          <Button color="inherit" onClick={() => navigate('/quienes-somos')}>¿Quiénes Somos?</Button>

          {user?.role === 'admin' && (
            <Button color="inherit" onClick={() => navigate('/admin')}>Panel Admin</Button>
          )}

          {user?.role === 'delivery' && (
            <Button color="inherit" onClick={() => navigate('/delivery')}>Reparto</Button>
          )}

          {user ? (
            <>
              <Typography variant="body2">Hola, {user.name}</Typography>
              <Button color="inherit" onClick={handleLogout}>Salir</Button>
            </>
          ) : (
            <Button color="inherit" onClick={() => navigate('/login')}>Ingresar</Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
