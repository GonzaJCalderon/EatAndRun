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
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 100%)',
          zIndex: 1
        }
      }}
    >
      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 2, m: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Box
            sx={{
              p: { xs: 4, sm: 5 },
              backgroundColor: 'rgba(255, 255, 255, 0.9)', // Fondo blanco translúcido
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              textAlign: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Box sx={{ 
                mb: 2, 
                display: 'inline-flex', 
                backgroundColor: '#4CAF50', 
                p: 2, 
                borderRadius: '50%',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)'
              }}>
                <LockOutlinedIcon sx={{ fontSize: 32, color: '#fff' }} />
              </Box>
            </motion.div>

            <Typography component="h1" variant="h5" fontWeight="bold" gutterBottom color="text.primary">
              Iniciar Sesión
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Ingresa tus credenciales para continuar
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                label="Correo electrónico"
                type="email"
                fullWidth
                required
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={email.length > 0 && !email.includes('@')}
                helperText={email.length > 0 && !email.includes('@') ? 'Email inválido' : ''}
                sx={{ 
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.7)'
                  }
                }}
              />

              <TextField
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ 
                  mb: 4,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.7)'
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
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
                  py: 1.5,
                  fontSize: '1.05rem',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  backgroundColor: '#4CAF50',
                  color: '#fff',
                  boxShadow: '0 4px 14px 0 rgba(76, 175, 80, 0.39)',
                  '&:hover': {
                    backgroundColor: '#43A047',
                    boxShadow: '0 6px 20px rgba(76, 175, 80, 0.23)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                {loading ? 'Ingresando...' : 'Ingresar'}
              </Button>
              
              <Button
                variant="text"
                fullWidth
                sx={{ mt: 2, textTransform: 'none', color: 'text.secondary' }}
                onClick={() => navigate('/registro')}
              >
                ¿No tienes cuenta? Regístrate
              </Button>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;
