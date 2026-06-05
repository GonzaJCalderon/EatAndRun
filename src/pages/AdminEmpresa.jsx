// src/pages/AdminEmpresa.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Delete, ContentCopy, Autorenew } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from '../api/api';
import { useNavigate } from 'react-router-dom';

const AdminEmpresa = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [link, setLink] = useState('');
  const [expira, setExpira] = useState(null);
  const [loadingLink, setLoadingLink] = useState(false);

  const [empleados, setEmpleados] = useState([]);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);

  const [formEmpleado, setFormEmpleado] = useState({
    name: '',
    apellido: '',
    email: '',
  });

  const handleInputChange = (e) => {
    setFormEmpleado({
      ...formEmpleado,
      [e.target.name]: e.target.value,
    });
  };

  // 🔗 Obtener link invitación
  const fetchLink = async () => {
    try {
      const res = await axios.get('/empresa/link-invitacion');
      setLink(res.data.link);
      setExpira(res.data.expira);
    } catch (err) {
      console.error('❌ Error al obtener link:', err);
      enqueueSnackbar('Error al obtener el link de invitación', { variant: 'error' });
    }
  };

  // 👥 Obtener empleados
  const fetchEmpleados = async () => {
    try {
      setLoadingEmpleados(true);
      const res = await axios.get('/empresa/empleados');
      setEmpleados(res.data);
    } catch (err) {
      console.error('❌ Error al obtener empleados:', err);
      enqueueSnackbar('Error al cargar empleados', { variant: 'error' });
    } finally {
      setLoadingEmpleados(false);
    }
  };

  // 🔁 Regenerar link
  const regenerarLink = async () => {
    try {
      setLoadingLink(true);
      const res = await axios.post('/empresa/regenerar-link');
      setLink(res.data.link);
      setExpira(res.data.expira);
      enqueueSnackbar('🔁 Link regenerado correctamente', { variant: 'success' });
    } catch (err) {
      console.error('❌ Error al regenerar link:', err);
      enqueueSnackbar('Error al regenerar el link', { variant: 'error' });
    } finally {
      setLoadingLink(false);
    }
  };

  // 📋 Copiar link
  const copiarLink = () => {
    navigator.clipboard.writeText(link)
      .then(() => enqueueSnackbar('📋 Link copiado al portapapeles', { variant: 'info' }))
      .catch(() => enqueueSnackbar('❌ No se pudo copiar el link', { variant: 'error' }));
  };

  // ➕ Agregar empleado
  const handleAgregarEmpleado = async () => {
    const { name, apellido, email } = formEmpleado;

    if (!name || !apellido || !email) {
      return enqueueSnackbar('Completa todos los campos', { variant: 'warning' });
    }

    try {
      await axios.post('/empresa/empleados/nuevo', {
        name,
        apellido,
        email,
      });
      enqueueSnackbar('✅ Empleado creado correctamente', { variant: 'success' });
      setFormEmpleado({ name: '', apellido: '', email: '' });
      fetchEmpleados();
    } catch (err) {
      console.error('❌ Error al crear empleado:', err);
      const msg = err.response?.data?.error || 'Error al crear empleado';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  // 🗑️ Eliminar empleado
  const handleEliminarEmpleado = async (id) => {
    try {
      await axios.delete(`/empresa/eliminar-empleado/${id}`);
      enqueueSnackbar('🗑️ Empleado eliminado', { variant: 'info' });
      fetchEmpleados();
    } catch (err) {
      console.error('❌ Error al eliminar empleado:', err);
      enqueueSnackbar('No se pudo eliminar el empleado', { variant: 'error' });
    }
  };

  useEffect(() => {
    fetchLink();
    fetchEmpleados();
  }, []);

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        🏢 Panel de Empresa
      </Typography>

      {/* 🔗 Link de invitación */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6">🔗 Link de invitación</Typography>
        {link ? (
          <>
            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
              {link}
              <Tooltip title="Copiar">
                <IconButton size="small" onClick={copiarLink}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            {expira && (
              <Typography variant="caption" color="text.secondary">
                Expira: {new Date(expira).toLocaleString('es-AR')}
              </Typography>
            )}
            <Box mt={2}>
              <Button
                variant="outlined"
                startIcon={<Autorenew />}
                onClick={regenerarLink}
                disabled={loadingLink}
              >
                {loadingLink ? 'Regenerando...' : 'Regenerar Link'}
              </Button>
            </Box>
          </>
        ) : (
          <Typography variant="body2">Cargando link...</Typography>
        )}
      </Paper>

      {/* ➕ Agregar empleado */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6">➕ Crear nuevo empleado</Typography>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              name="name"
              label="Nombre"
              value={formEmpleado.name}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              name="apellido"
              label="Apellido"
              value={formEmpleado.apellido}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              name="email"
              label="Email"
              type="email"
              value={formEmpleado.email}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={handleAgregarEmpleado}>
              Crear empleado
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* 👨‍💼 Lista de empleados */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          👨‍💼 Empleados actuales
        </Typography>
        {loadingEmpleados ? (
          <CircularProgress />
        ) : (
          <List>
            {empleados.map((emp) => (
              <React.Fragment key={emp.id}>
                <ListItem
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleEliminarEmpleado(emp.id)}>
                      <Delete />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={`${emp.name} ${emp.apellido || ''}`}
                    secondary={`${emp.email} — Rol: ${emp.rol}`}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* 📦 Ver pedidos */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Acciones adicionales
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button variant="outlined" onClick={() => navigate('/empresa/pedidos')}>
              📦 Ver pedidos de empleados
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AdminEmpresa;
