import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import API from '../api/api';

const EmpleadoEmpresa = () => {
  const [empleados, setEmpleados] = useState([]);
  const [email, setEmail] = useState('');
  const [linkInvitacion, setLinkInvitacion] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const fetchEmpleados = async () => {
    try {
      const res = await API.get('/empresa/empleados');
      setEmpleados(res.data);
    } catch (err) {
      console.error(err);
      enqueueSnackbar('❌ Error al cargar empleados', { variant: 'error' });
    }
  };

  const fetchLinkInvitacion = async () => {
    try {
      const res = await API.get('/empresa/link-invitacion');
      setLinkInvitacion(res.data);
    } catch (err) {
      console.error(err);
      enqueueSnackbar('❌ No se pudo obtener el link', { variant: 'error' });
    }
  };

  const handleAgregarEmpleado = async () => {
    if (!email) return;

    try {
      await API.post('/empresa/agregar-empleado', { email });
      enqueueSnackbar('✅ Empleado agregado', { variant: 'success' });
      setEmail('');
      fetchEmpleados(); // actualizamos
    } catch (err) {
      enqueueSnackbar(err.response?.data?.error || '❌ Error al agregar', {
        variant: 'error'
      });
    }
  };

  const handleEliminarEmpleado = async (id) => {
    try {
      await API.delete(`/empresa/eliminar-empleado/${id}`);
      enqueueSnackbar('🗑️ Empleado eliminado', { variant: 'info' });
      fetchEmpleados();
    } catch (err) {
      enqueueSnackbar('❌ No se pudo eliminar', { variant: 'error' });
    }
  };

  useEffect(() => {
    fetchEmpleados();
    fetchLinkInvitacion();
  }, []);

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        👥 Empleados de tu Empresa
      </Typography>

      {/* Agregar empleado */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          ➕ Agregar empleado por email
        </Typography>
        <Box display="flex" gap={2}>
          <TextField
            label="Email del empleado"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <Button variant="contained" onClick={handleAgregarEmpleado}>
            Agregar
          </Button>
        </Box>
      </Paper>

      {/* Link de invitación */}
      {linkInvitacion && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6">📎 Link de invitación</Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Copiá este link y compartilo:
          </Typography>
          <TextField
            fullWidth
            value={linkInvitacion.link}
            sx={{ mt: 1 }}
            InputProps={{ readOnly: true }}
          />
          <Typography variant="caption" color="text.secondary">
            Expira: {new Date(linkInvitacion.expira).toLocaleString()}
          </Typography>
        </Paper>
      )}

      {/* Lista de empleados */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          👨‍💼 Lista de empleados
        </Typography>
        <List>
          {empleados.map((empleado) => (
            <React.Fragment key={empleado.id}>
              <ListItem
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleEliminarEmpleado(empleado.id)}>
                    <Delete />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={`${empleado.name} ${empleado.apellido} (${empleado.email})`}
                  secondary={`Rol: ${empleado.rol}`}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default EmpleadoEmpresa;
