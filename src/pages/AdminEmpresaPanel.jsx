// src/pages/AdminEmpresasPanel.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Grid, IconButton, Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

import { Delete } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../api/api';

const AdminEmpresasPanel = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [empresas, setEmpresas] = useState([]);
  const [nuevaEmpresa, setNuevaEmpresa] = useState({
    nombre: '',
    responsable_email: '',
    cuit: ''
  });

  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    empresa_id: '',
    name: '',
    apellido: '',
    email: ''
  });

  const fetchEmpresas = async () => {
    try {
      const res = await api.get('/admin/empresas');
      setEmpresas(res.data);
    } catch (err) {
      console.error('❌ Error al obtener empresas:', err);
    }
  };

  const navigate = useNavigate();

const handleLogout = () => {
  localStorage.removeItem('token'); // o sessionStorage si usás eso
  enqueueSnackbar('👋 Sesión cerrada', { variant: 'info' });
  navigate('/login');
};


  useEffect(() => {
    fetchEmpresas();
  }, []);

  const handleCrearEmpresa = async () => {
    try {
      await api.post('/admin/empresas', nuevaEmpresa);
      enqueueSnackbar('✅ Empresa creada correctamente', { variant: 'success' });
      setNuevaEmpresa({ nombre: '', responsable_email: '', cuit: '' });
      fetchEmpresas();
    } catch (err) {
      enqueueSnackbar('❌ Error al crear empresa', { variant: 'error' });
    }
  };

  const handleEliminarEmpresa = async (id) => {
    if (!window.confirm('¿Eliminar esta empresa?')) return;
    try {
      await api.delete(`/admin/empresas/${id}`);
      enqueueSnackbar('🗑️ Empresa eliminada', { variant: 'info' });
      fetchEmpresas();
    } catch (err) {
      enqueueSnackbar('❌ Error al eliminar empresa', { variant: 'error' });
    }
  };

  const handleCrearEmpleado = async () => {
    const { empresa_id, name, apellido, email } = nuevoEmpleado;
    if (!empresa_id || !name || !apellido || !email) {
      return enqueueSnackbar('Completa todos los campos', { variant: 'warning' });
    }

    try {
      await api.post('/admin/empresas/empleados', {
        empresa_id,
        name,
        apellido,
        email
      });
      enqueueSnackbar('✅ Empleado creado correctamente', { variant: 'success' });
      setNuevoEmpleado({ empresa_id: '', name: '', apellido: '', email: '' });
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al crear empleado';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  return (
    <Box p={4}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
  <Button
    variant="outlined"
    startIcon={<ArrowBackIcon />}
    onClick={() => navigate('/admin')}
  >
    Volver al dashboard
  </Button>

  <Button
    variant="outlined"
    color="error"
    startIcon={<LogoutIcon />}
    onClick={handleLogout}
  >
    Cerrar sesión
  </Button>
</Box>

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        🏢 Administración de Empresas
      </Typography>

      {/* Crear Empresa */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>➕ Crear nueva empresa</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth label="Nombre de la empresa"
              value={nuevaEmpresa.nombre}
              onChange={e => setNuevaEmpresa({ ...nuevaEmpresa, nombre: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth label="Email del responsable"
              value={nuevaEmpresa.responsable_email}
              onChange={e => setNuevaEmpresa({ ...nuevaEmpresa, responsable_email: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth label="CUIT"
              value={nuevaEmpresa.cuit}
              onChange={e => setNuevaEmpresa({ ...nuevaEmpresa, cuit: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={handleCrearEmpresa}>
              Crear empresa
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Crear Empleado para empresa */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>👥 Crear empleado para una empresa</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <TextField
              select fullWidth label="Empresa"
              value={nuevoEmpleado.empresa_id}
              onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, empresa_id: e.target.value })}
              SelectProps={{ native: true }}
            >
              <option value="">Seleccionar empresa</option>
              {empresas.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nombre}</option>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth label="Nombre"
              value={nuevoEmpleado.name}
              onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, name: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth label="Apellido"
              value={nuevoEmpleado.apellido}
              onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, apellido: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth label="Email"
              value={nuevoEmpleado.email}
              onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, email: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={handleCrearEmpleado}>
              Crear empleado
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Empresas existentes */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>🏬 Empresas registradas</Typography>
        {empresas.length === 0 ? (
          <Typography>No hay empresas registradas.</Typography>
        ) : (
          empresas.map(emp => (
            <Box key={emp.id} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
              <Typography variant="subtitle1">{emp.nombre}</Typography>
              <Typography>Email responsable: {emp.responsable_email}</Typography>
              <Typography>CUIT: {emp.cuit}</Typography>
              <IconButton color="error" onClick={() => handleEliminarEmpresa(emp.id)}>
                <Delete />
              </IconButton>
              <Divider sx={{ mt: 1 }} />
            </Box>
          ))
        )}
      </Paper>
    </Box>
  );
};

export default AdminEmpresasPanel;
