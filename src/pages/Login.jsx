import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Container,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import api from '../api/api';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error('Login fallido. Respuesta incompleta del backend.');
      }

      localStorage.setItem('authToken', token);
      dispatch(setUser({ user, token }));
      enqueueSnackbar(`¡Bienvenido ${user.name}!`, { variant: 'success' });

      switch (user.role) {
        case 'admin':
        case 'moderador':
          navigate('/admin');
          break;
        case 'empresa':
        case 'empleado':
        case 'usuario':
          navigate('/app');
          break;
        case 'delivery':
          navigate('/delivery');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      const mensaje = err?.response?.data?.error || 'Email o contraseña incorrectos';
      enqueueSnackbar(mensaje, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const bgImage = 'https://res.cloudinary.com/dwiga4jg8/image/upload/w_1600,q_auto,f_auto/Fondo_APLICACION_EAR_1_nxvzab.png';

  return (
    // Layout mobile-first: columna en mobile, fila en desktop
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>

      {/* ── Mitad imagen (arriba en mobile, izquierda en desktop) ── */}
      <Box
        sx={{
          // Mobile: ocupa el 35% superior de la pantalla para dejar espacio al form
          height: { xs: '35vh', md: '100vh' },
          width: { xs: '100%', md: '55%' },
          flexShrink: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          // Mostramos la parte de la imagen donde está la leyenda
          backgroundPosition: { xs: 'center 20%', md: 'center center' },
          position: 'relative',
        }}
      >
      </Box>

      {/* ── Mitad formulario (abajo en mobile, derecha en desktop) ── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          p: { xs: 2.5, sm: 4, md: 6 },
          // En mobile, sube levemente sobre la imagen con un borde redondeado
          borderRadius: { xs: '24px 24px 0 0', md: 0 },
          mt: { xs: '-24px', md: 0 },  // Overlap suave sobre la imagen en mobile
          position: 'relative',
          zIndex: 2,
          boxShadow: { xs: '0 -8px 30px rgba(0,0,0,0.1)', md: 'none' },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Header compacto */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ backgroundColor: '#E8F5E9', p: 1, borderRadius: '50%', display: 'inline-flex' }}>
                <LockOutlinedIcon sx={{ fontSize: 24, color: '#4CAF50' }} />
              </Box>
              <Typography component="h1" variant="h6" fontWeight="bold" lineHeight={1.2}>
                Iniciar Sesión
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
              Ingresá tus credenciales para continuar
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                size="small"
                label="Correo electrónico"
                type="email"
                fullWidth
                required
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={email.length > 0 && !email.includes('@')}
                helperText={email.length > 0 && !email.includes('@') ? 'Email inválido' : ''}
                sx={{ mb: 2 }}
              />

              <TextField
                size="small"
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2.5 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.2,
                  fontSize: '0.95rem',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  backgroundColor: '#4CAF50',
                  boxShadow: '0 4px 14px rgba(76, 175, 80, 0.4)',
                  '&:hover': {
                    backgroundColor: '#43A047',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                {loading ? 'Ingresando...' : 'Ingresar'}
              </Button>

              <Button
                variant="text"
                fullWidth
                sx={{ mt: 1.5, textTransform: 'none', color: 'text.secondary', fontSize: '0.9rem' }}
                onClick={() => navigate('/recuperar-clave')}
              >
                ¿Olvidaste tu contraseña?
              </Button>

              <Button
                variant="text"
                fullWidth
                sx={{ textTransform: 'none', color: '#4CAF50', fontWeight: 600, fontSize: '0.9rem' }}
                onClick={() => navigate('/registro')}
              >
                ¿No tenés cuenta? Registrate
              </Button>
            </Box>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
