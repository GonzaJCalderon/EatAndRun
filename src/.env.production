// 📁 src/components/CrearEmpleado.jsx
import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';
import { useSnackbar } from 'notistack';
import API from '../api/api';

const CrearEmpleado = () => {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [passwordGenerada, setPasswordGenerada] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCrear = async (e) => {
    e.preventDefault();

    if (!form.nombre || !form.apellido || !form.email) {
      enqueueSnackbar('❗ Todos los campos son obligatorios', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/empresa/empleados/nuevo', {
        name: form.nombre,
        apellido: form.apellido,
        email: form.email
      });

      const empleado = res.data?.empleado;
      setPasswordGenerada(empleado.password);

      enqueueSnackbar('✅ Empleado creado correctamente', { variant: 'success' });
      setForm({ nombre: '', apellido: '', email: '' });
    } catch (err) {
      console.error('❌ Error al crear empleado:', err?.response?.data || err);
      enqueueSnackbar(err?.response?.data?.error || 'Error al crear empleado', {
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Crear nuevo empleado
      </Typography>

      <Box component="form" onSubmit={handleCrear}>
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
        <TextField
          label="Email"
          name="email"
          type="email"
          fullWidth
          required
          value={form.email}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{ backgroundColor: '#68955C', '&:hover': { backgroundColor: '#557d4c' } }}
        >
          {loading ? 'Creando...' : 'Crear empleado'}
        </Button>

        {passwordGenerada && (
          <Box mt={3} p={2} sx={{ background: '#f0f0f0', borderRadius: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              ✅ Contraseña generada:
            </Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
              {passwordGenerada}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Compartila con el empleado para que inicie sesión.
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default CrearEmpleado;
