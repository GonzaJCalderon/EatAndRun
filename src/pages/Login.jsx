import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import api from '../api/api';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

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
      enqueueSnackbar(`Bienvenido ${user.name}!`, { variant: 'success' });

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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: `url(https://res.cloudinary.com/dwiga4jg8/image/upload/v1752840768/Fondo_APLICACION_EAR_1_nxvzab.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: { xs: 3, sm: 5 },
          width: '100%',
          maxWidth: 400,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 3,
          textAlign: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
            Iniciar sesión
          </Typography>
        </motion.div>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            label="Correo electrónico"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={email.length > 0 && !email.includes('@')}
            helperText={email.length > 0 && !email.includes('@') ? 'Email inválido' : ''}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    aria-label="toggle password visibility"
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
            disabled={loading}
            sx={{
              backgroundColor: '#68955C',
              '&:hover': { backgroundColor: '#557d4c' },
            }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
