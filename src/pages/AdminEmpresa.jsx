import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, TextField, IconButton,
  Tooltip, Divider, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, Avatar, Stack, Chip, Container
} from '@mui/material';
import {
  Delete, ContentCopy, Autorenew, Search, PersonAdd,
  ReceiptLong, Email, VpnKey, BusinessCenter, RestaurantMenu
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from '../api/api';
import { useNavigate } from 'react-router-dom';

const AdminEmpresa = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [link, setLink] = useState('');
  const [expira, setExpira] = useState(null);
  const [loadingLink, setLoadingLink] = useState(false);

  const [empresa, setEmpresa] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [loadingEmpleados, setLoadingEmpleados] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [openDialog, setOpenDialog] = useState(false);
  const [formEmpleado, setFormEmpleado] = useState({ name: '', apellido: '', email: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchMiEmpresa = async () => {
    try {
      const res = await axios.get('/empresa/mi-empresa');
      setEmpresa(res.data);
    } catch (err) {
      console.error('❌ Error al obtener empresa:', err);
    }
  };

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

  const copiarLink = () => {
    navigator.clipboard.writeText(link)
      .then(() => enqueueSnackbar('📋 Link copiado al portapapeles', { variant: 'info' }))
      .catch(() => enqueueSnackbar('❌ No se pudo copiar el link', { variant: 'error' }));
  };

  const handleInputChange = (e) => {
    setFormEmpleado({ ...formEmpleado, [e.target.name]: e.target.value });
  };

  const handleAgregarEmpleado = async () => {
    const { name, apellido, email } = formEmpleado;
    if (!name || !apellido || !email) {
      return enqueueSnackbar('Completa todos los campos', { variant: 'warning' });
    }

    try {
      setSubmitting(true);
      await axios.post('/empresa/empleados/nuevo', { name, apellido, email });
      enqueueSnackbar('✅ Empleado creado correctamente', { variant: 'success' });
      setFormEmpleado({ name: '', apellido: '', email: '' });
      setOpenDialog(false);
      fetchEmpleados();
    } catch (err) {
      console.error('❌ Error al crear empleado:', err);
      const msg = err.response?.data?.error || 'Error al crear empleado';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminarEmpleado = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar a ${nombre} de tu empresa?`)) return;
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
    fetchMiEmpresa();
  }, []);

  const empleadosFiltrados = useMemo(() => {
    if (!searchQuery) return empleados;
    const lower = searchQuery.toLowerCase();
    return empleados.filter(emp =>
      emp.name?.toLowerCase().includes(lower) ||
      emp.apellido?.toLowerCase().includes(lower) ||
      emp.email?.toLowerCase().includes(lower)
    );
  }, [empleados, searchQuery]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessCenter fontSize="large" color="primary" /> {empresa ? `Hola, ${empresa.razon_social}` : 'Panel de Empresa'}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#64748b' }}>
            Gestiona los empleados y pedidos de tu organización
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            startIcon={<RestaurantMenu />}
            onClick={() => navigate('/app')}
            sx={{ borderRadius: 50, px: 3, textTransform: 'none', fontWeight: 'bold' }}
          >
            Ir al Menú
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={<ReceiptLong />}
            onClick={() => navigate('/empresa/pedidos')}
            sx={{ borderRadius: 50, px: 4, textTransform: 'none', fontWeight: 'bold' }}
          >
            Ver Pedidos Globales
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={4}>
        {/* Link Invitación */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <VpnKey color="primary" /> Enlace de Invitación
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                Comparte este enlace con tus empleados para que se registren automáticamente bajo tu empresa.
              </Typography>

              {link ? (
                <Box>
                  <TextField
                    fullWidth
                    value={link}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Copiar enlace">
                            <IconButton onClick={copiarLink} color="primary">
                              <ContentCopy />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ backgroundColor: '#f8fafc', borderRadius: 2 }}
                  />
                  {expira && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#94a3b8', fontWeight: 'bold' }}>
                      ⏳ Expira: {new Date(expira).toLocaleString('es-AR')}
                    </Typography>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<Autorenew />}
                    onClick={regenerarLink}
                    disabled={loadingLink}
                    fullWidth
                    sx={{ mt: 3, borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                  >
                    {loadingLink ? 'Regenerando...' : 'Generar nuevo enlace'}
                  </Button>
                </Box>
              ) : (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={30} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Empleados */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                  👨‍💼 Empleados ({empleados.length})
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PersonAdd />}
                  onClick={() => setOpenDialog(true)}
                  sx={{ borderRadius: 50, textTransform: 'none', px: 3 }}
                >
                  Nuevo Empleado
                </Button>
              </Stack>

              <TextField
                fullWidth
                placeholder="Buscar por nombre, apellido o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 3, backgroundColor: '#f8fafc' } }}
              />

              {loadingEmpleados ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress />
                </Box>
              ) : empleadosFiltrados.length === 0 ? (
                <Box textAlign="center" p={4} sx={{ backgroundColor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
                  <Typography variant="body1" sx={{ color: '#64748b' }}>No se encontraron empleados.</Typography>
                </Box>
              ) : (
                <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
                  <Stack spacing={2}>
                    {empleadosFiltrados.map((emp) => (
                      <Card key={emp.id} variant="outlined" sx={{ borderRadius: 3, transition: '0.2s', '&:hover': { borderColor: '#cbd5e1', backgroundColor: '#f8fafc' } }}>
                        <CardContent sx={{ p: '16px !important', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 'bold' }}>
                              {emp.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b' }}>
                                {emp.name} {emp.apellido || ''}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Email fontSize="inherit" /> {emp.email}
                              </Typography>
                            </Box>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Chip label={emp.rol} size="small" sx={{ textTransform: 'capitalize', fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#475569' }} />
                            <Tooltip title="Eliminar empleado">
                              <IconButton color="error" size="small" onClick={() => handleEliminarEmpleado(emp.id, emp.name)}>
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal Nuevo Empleado */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 2 } }}>
        <DialogTitle sx={{ fontWeight: 900, textAlign: 'center', color: '#1e293b' }}>Crear Empleado</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 3, textAlign: 'center' }}>
            Ingresa los datos para registrar un nuevo empleado en tu empresa. Se le enviará una notificación (próximamente).
          </Typography>
          <Stack spacing={3} mt={1}>
            <TextField
              fullWidth
              name="name"
              label="Nombre"
              value={formEmpleado.name}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              name="apellido"
              label="Apellido"
              value={formEmpleado.apellido}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              name="email"
              label="Correo Electrónico"
              type="email"
              value={formEmpleado.email}
              onChange={handleInputChange}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit" sx={{ borderRadius: 50, px: 3, textTransform: 'none' }}>Cancelar</Button>
          <Button
            onClick={handleAgregarEmpleado}
            variant="contained"
            color="success"
            disabled={submitting}
            sx={{ borderRadius: 50, px: 3, textTransform: 'none', fontWeight: 'bold' }}
          >
            {submitting ? 'Guardando...' : 'Crear empleado'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminEmpresa;
