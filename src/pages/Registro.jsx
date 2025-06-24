import React, { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import API from '../api/api';
import registerImage from '../assets/imgs/register-ilustration.png';

const Registro = ({ onRegister }) => {
const [form, setForm] = useState({
  nombre: '',
  apellido: '', 
  email: '',
  password: '',
  role: 'usuario',
  telefono: '',
  direccion: '',
  direccionAlt: '',
  razonSocial: '',
  cuit: ''
});


  const [loading, setLoading] = useState(false);

  const roles = [
    { value: 'usuario', label: '👤 Usuario' },
    { value: 'empresa', label: '🏢 Empresa' }
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const { enqueueSnackbar } = useSnackbar();
const navigate = useNavigate();


 const handleSubmit = async (e) => {
  e.preventDefault();

 if (!form.nombre || !form.apellido || !form.email || !form.password || !form.telefono || !form.direccion) {
  enqueueSnackbar('❗ Todos los campos personales son obligatorios', { variant: 'warning' });
  return;
}


  if (form.role === 'empresa' && (!form.razonSocial || !form.cuit)) {
    enqueueSnackbar('❗ Razón social y CUIT son obligatorios para empresas', { variant: 'warning' });
    return;
  }

  setLoading(true);

  try {
  const res = await API.post('/auth/register', {
  name: form.nombre,
  apellido: form.apellido, // 👈 AGREGADO
  email: form.email,
  password: form.password,
  role: form.role,
  telefono: form.telefono,
  direccion_principal: form.direccion,
  direccion_alternativa: form.direccionAlt,
  empresa: form.role === 'empresa' ? {
    razonSocial: form.razonSocial,
    cuit: form.cuit
  } : null
});


    if (res.data) {
      localStorage.setItem('eatAndRunUser', JSON.stringify(res.data));
      enqueueSnackbar('✅ Registro exitoso. Ahora podés iniciar sesión.', { variant: 'success' });

      setTimeout(() => {
        navigate('/login');
      }, 1500);

      if (onRegister) onRegister(res.data);
    }
  } catch (err) {
    console.error('🔥 Error:', err?.response?.data || err.message);
    enqueueSnackbar(err?.response?.data?.error || '❌ Error al registrar el usuario', {
      variant: 'error'
    });
  } finally {
    setLoading(false);
  }
};


  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      <Grid item xs={false} sm={6} md={7}>
        <Box
          sx={{
            height: '100%',
            backgroundImage: `url(${registerImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
              Crear cuenta
            </Typography>
          </motion.div>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
           <TextField
  label="Nombre"
  name="nombre"
  fullWidth
  required
  value={form.nombre}
  onChange={handleChange}
  sx={{ mb: 2 }}
/>
<TextField
  label="Apellido"
  name="apellido"
  fullWidth
  required
  value={form.apellido}
  onChange={handleChange}
  sx={{ mb: 2 }}
/>

            <TextField label="Email" name="email" type="email" fullWidth required value={form.email} onChange={handleChange} sx={{ mb: 2 }} />
            <TextField label="Contraseña" name="password" type="password" fullWidth required value={form.password} onChange={handleChange} sx={{ mb: 2 }} />
            <TextField label="Teléfono" name="telefono" fullWidth required value={form.telefono} onChange={handleChange} sx={{ mb: 2 }} />
            <TextField label="Dirección principal" name="direccion" fullWidth required value={form.direccion} onChange={handleChange} sx={{ mb: 2 }} />
            <TextField label="Dirección alternativa (opcional)" name="direccionAlt" fullWidth value={form.direccionAlt} onChange={handleChange} sx={{ mb: 2 }} />

            <TextField select label="Tipo de usuario" name="role" value={form.role} onChange={handleChange} fullWidth sx={{ mb: 3 }}>
              {roles.map((r) => (
                <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
              ))}
            </TextField>

            {form.role === 'empresa' && (
              <>
                <TextField label="Razón Social" name="razonSocial" fullWidth required value={form.razonSocial} onChange={handleChange} sx={{ mb: 2 }} />
                <TextField label="CUIT" name="cuit" fullWidth required value={form.cuit} onChange={handleChange} sx={{ mb: 2 }} />
              </>
            )}

            <Button type="submit" fullWidth variant="contained" sx={{ mt: 1, backgroundColor: '#68955C', '&:hover': { backgroundColor: '#557d4c' } }} disabled={loading}>
              {loading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Registro;
