import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Paper
} from '@mui/material';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';

import api from '../api/api';
import loginImage from '../assets/imgs/nutricionImg.png';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await api.post('/auth/login', { email, password });

    console.log('📦 Login response:', response.data); // 💥 Verificá el contenido

    const token = response.data.token;
    const user = response.data.user;

    if (!token || !user) {
      throw new Error('Login fallido. Respuesta incompleta del backend.');
    }

    localStorage.setItem('authToken', token);

    dispatch(setUser({ user, token })); // 👈 payload correcto

    enqueueSnackbar(`Bienvenido ${user.name}!`, { variant: 'success' });
    console.log('👀 Usuario logueado:', user);

    // Redirección
    switch (user.role) {
      case 'admin':
      case 'moderador':
        navigate('/admin');
        break;
      case 'empresa':
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
    console.error('❌ Error en login:', err?.response?.data || err.message);
    const mensaje = err?.response?.data?.error || 'Email o contraseña incorrectos';
    enqueueSnackbar(mensaje, { variant: 'error' });
  } finally {
    setLoading(false);
  }
};


  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      {/* Imagen lateral */}
      <Grid
        item
        xs={false}
        sm={false}
        md={7}
        sx={{
          display: { xs: 'none', md: 'block' },
          backgroundImage: `url(${loginImage})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: '100%',
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h3" color="white">
            Eat & Run 🍃
          </Typography>
        </Box>
      </Grid>

      {/* Formulario */}
      <Grid item xs={12} sm={12} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
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

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
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
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
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
        </Box>
      </Grid>
    </Grid>
  );
};

export default Login;
