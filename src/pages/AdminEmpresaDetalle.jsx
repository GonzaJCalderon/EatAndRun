import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Grid, Button, TextField, IconButton,
  Tooltip, List, ListItem, ListItemText, Divider, CircularProgress
} from '@mui/material';
import { Delete, ArrowBack, Logout } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from '../api/api';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const AdminEmpresaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formEmpleado, setFormEmpleado] = useState({ name: '', apellido: '', email: '' });
  const [empleados, setEmpleados] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [filtroDesde, setFiltroDesde] = useState(null);
  const [filtroHasta, setFiltroHasta] = useState(null);

  const fetchEmpresa = async () => {
    try {
      const res = await axios.get(`/admin/empresas/${id}`);
      setEmpresa(res.data);
      setEmpleados(res.data.empleados || []);
    } catch (err) {
      console.error('❌ Error al cargar empresa', err);
      enqueueSnackbar('Error al cargar datos de empresa', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPedidos = async () => {
    try {
      const params = {};
      if (filtroDesde) params.desde = dayjs(filtroDesde).format('YYYY-MM-DD');
      if (filtroHasta) params.hasta = dayjs(filtroHasta).format('YYYY-MM-DD');
      const res = await axios.get(`/admin/empresas/${id}/pedidos`, { params });
      setPedidos(res.data || []);
    } catch (err) {
      console.error('❌ Error al cargar pedidos', err);
      enqueueSnackbar('Error al cargar pedidos', { variant: 'error' });
    }
  };

  useEffect(() => {
    fetchEmpresa();
    fetchPedidos();
    // eslint-disable-next-line
  }, [id]);

  const handleInputChange = (e) => {
    setFormEmpleado({ ...formEmpleado, [e.target.name]: e.target.value });
  };

  const handleEmpresaChange = (e) => {
    const { name, value } = e.target;
    setEmpresa(prev => ({ ...prev, [name]: value }));
  };

  const handleAgregarEmpleado = async () => {
    const { name, apellido, email } = formEmpleado;
    if (!name || !apellido || !email) {
      return enqueueSnackbar('Completa todos los campos', { variant: 'warning' });
    }
    try {
      await axios.post('/admin/empresas/empleados', {
        empresa_id: id, name, apellido, email
      });
      enqueueSnackbar('✅ Empleado agregado', { variant: 'success' });
      setFormEmpleado({ name: '', apellido: '', email: '' });
      fetchEmpresa();
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al agregar empleado';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  const handleEliminarEmpleado = async (userId) => {
    try {
      await axios.delete(`/admin/empresas/${id}/empleados/${userId}`);
      enqueueSnackbar('Empleado eliminado', { variant: 'info' });
      fetchEmpresa();
    } catch (err) {
      enqueueSnackbar('No se pudo eliminar empleado', { variant: 'error' });
    }
  };

  const handleActualizarEmpresa = async () => {
    try {
      await axios.put(`/admin/empresas/${id}`, {
        nombre: empresa.nombre,
        cuit: empresa.cuit,
        direccion: empresa.direccion,
        telefono: empresa.telefono
      });
      enqueueSnackbar('✅ Empresa actualizada correctamente', { variant: 'success' });
      fetchEmpresa();
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al actualizar empresa';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  const handleFiltrarPedidos = () => {
    fetchPedidos();
  };

  const handleVolver = () => navigate('/admin/empresas');
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading || !empresa) return <CircularProgress />;

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={handleVolver}>Volver</Button>
        <Typography variant="h4">🏢 {empresa?.nombre}</Typography>
        <Button color="error" variant="outlined" startIcon={<Logout />} onClick={handleLogout}>Cerrar sesión</Button>
      </Box>

      {/* Detalles de la empresa */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>📄 Editar Empresa</Typography>
        <Grid container spacing={2}>
          {[
            ['nombre', 'Nombre / Razón Social'],
            ['cuit', 'CUIT'],
            ['direccion', 'Dirección'],
            ['telefono', 'Teléfono']
          ].map(([name, label]) => (
            <Grid item xs={12} sm={6} key={name}>
              <TextField label={label} name={name} fullWidth value={empresa[name] || ''} onChange={handleEmpresaChange} />
            </Grid>
          ))}
          <Grid item xs={12} sm={6}>
            <TextField label="Responsable" fullWidth value={empresa.responsable_nombre || ''} disabled />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Email del Responsable" fullWidth value={empresa.responsable_email || ''} disabled />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={handleActualizarEmpresa}>💾 Guardar Cambios</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Empleados */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>👨‍💼 Empleados</Typography>
        {empleados.length === 0 ? (
          <Typography>No hay empleados aún.</Typography>
        ) : (
          <List>
            {empleados.map((emp) => (
              <div key={emp.id}>
                <ListItem secondaryAction={
                  <Tooltip title="Eliminar">
                    <IconButton edge="end" onClick={() => handleEliminarEmpleado(emp.id)}><Delete /></IconButton>
                  </Tooltip>
                }>
                  <ListItemText primary={`${emp.name} ${emp.apellido}`} secondary={`${emp.email} — Rol: ${emp.rol}`} />
                </ListItem>
                <Divider />
              </div>
            ))}
          </List>
        )}
      </Paper>

      {/* Agregar empleado */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>➕ Agregar Empleado</Typography>
        <Grid container spacing={2}>
          {['name', 'apellido', 'email'].map((field, i) => (
            <Grid item xs={12} sm={4} key={field}>
              <TextField fullWidth label={field.charAt(0).toUpperCase() + field.slice(1)} name={field} value={formEmpleado[field]} onChange={handleInputChange} />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button variant="contained" onClick={handleAgregarEmpleado}>Agregar empleado</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Historial de pedidos */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>📦 Historial de Pedidos</Typography>

        {/* Filtros por fecha */}
        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Desde"
                value={filtroDesde}
                onChange={(newValue) => setFiltroDesde(newValue)}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Hasta"
                value={filtroHasta}
                onChange={(newValue) => setFiltroHasta(newValue)}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12}>
            <Button variant="outlined" onClick={handleFiltrarPedidos}>Filtrar</Button>
          </Grid>
        </Grid>

        {/* Lista de pedidos */}
        {pedidos.length === 0 ? (
          <Typography>No hay pedidos registrados aún.</Typography>
        ) : (
          <List>
            {pedidos.map((pedido) => (
              <div key={pedido.id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={`🧾 Pedido #${pedido.id} — ${new Date(pedido.fecha).toLocaleString('es-AR')}`}
                    secondary={
                      <>
                        <strong>Empleado:</strong>{" "}
                        {pedido.usuario && pedido.usuario.nombre
                          ? `${pedido.usuario.nombre} (${pedido.usuario.email || 'sin email'})`
                          : 'Desconocido'}
                        <br />
                        <strong>Productos:</strong>{" "}
                        {Object.entries(pedido.pedido?.diarios || {}).map(([dia, productos]) => (
                          <div key={dia}>
                            <strong>{dia}:</strong> {Object.entries(productos).map(([prod, cant]) => `${prod} x${cant}`).join(', ')}
                          </div>
                        ))}
                        {Object.entries(pedido.pedido?.extras || {}).map(([dia, extras]) => (
                          <div key={`e-${dia}`}>
                            <strong>Extras {dia}:</strong> {Object.entries(extras).map(([prod, cant]) => `${prod} x${cant}`).join(', ')}
                          </div>
                        ))}
                        {Object.entries(pedido.pedido?.tartas || {}).length > 0 && (
                          <div>
                            <strong>Tartas:</strong> {Object.entries(pedido.pedido.tartas).map(([prod, cant]) => `${prod} x${cant}`).join(', ')}
                          </div>
                        )}
                      </>
                    }
                  />
                </ListItem>
                <Divider />
              </div>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default AdminEmpresaDetalle;
