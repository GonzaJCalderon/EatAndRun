import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Pagination,
  Avatar,
  Tooltip,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import { Delete, Add, ArrowBack, Logout, Business, Edit, Mail, Assignment } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import axios from '../api/api';

const EmpresasList = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openCrear, setOpenCrear] = useState(false);
  const [nuevaEmpresa, setNuevaEmpresa] = useState({
    nombre: '',
    responsable_email: '',
    cuit: '',
  });

  const [pagina, setPagina] = useState(1);
  const itemsPorPagina = 9; // 3x3 grid

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/admin/empresas');
      setEmpresas(res.data);
    } catch (err) {
      enqueueSnackbar('❌ Error al cargar empresas', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const eliminarEmpresa = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta empresa? Todos sus datos y relaciones se perderán.')) return;
    try {
      await axios.delete(`/admin/empresas/${id}`);
      enqueueSnackbar('✅ Empresa eliminada', { variant: 'success' });
      fetchEmpresas();
    } catch (err) {
      enqueueSnackbar('❌ No se pudo eliminar la empresa', { variant: 'error' });
    }
  };

  const handleChange = (e) => {
    setNuevaEmpresa({
      ...nuevaEmpresa,
      [e.target.name]: e.target.value,
    });
  };

  const crearEmpresa = async () => {
    const { nombre, responsable_email } = nuevaEmpresa;
    if (!nombre || !responsable_email) {
      return enqueueSnackbar('⚠️ Nombre y email son obligatorios', { variant: 'warning' });
    }
    try {
      await axios.post('/admin/empresas', nuevaEmpresa);
      enqueueSnackbar('🏢 Empresa creada correctamente', { variant: 'success' });
      setNuevaEmpresa({ nombre: '', responsable_email: '', cuit: '' });
      setOpenCrear(false);
      fetchEmpresas();
    } catch (err) {
      enqueueSnackbar('❌ Error al crear empresa', { variant: 'error' });
    }
  };

  const empresasPaginadas = empresas.slice((pagina - 1) * itemsPorPagina, pagina * itemsPorPagina);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    fetchEmpresas();
    // eslint-disable-next-line
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Button startIcon={<ArrowBack />} variant="outlined" onClick={() => navigate('/admin')}>
          Volver
        </Button>
        <Box display="flex" alignItems="center" gap={1}>
          <Business sx={{ color: '#6366f1', fontSize: 32 }} />
          <Typography variant="h4" fontWeight="bold">Directorio de Empresas</Typography>
        </Box>
        <Button color="error" variant="outlined" startIcon={<Logout />} onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </Box>

      {/* Guía */}
      <Alert severity="info" sx={{ mb: 4, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>📖 Guía de uso:</Typography>
        <Typography variant="body2">
          Aquí podés dar de alta nuevas empresas clientes. Al crear una empresa, el sistema genera automáticamente un usuario <strong>Responsable</strong> asociado a ese email. Entrá a "Gestionar" para compartirle a la empresa su Link de Invitación, con el cual sus empleados podrán registrarse y cargar pedidos.
        </Typography>
      </Alert>

      {/* Acciones */}
      <Box mb={4} display="flex" justifyContent="flex-end" alignItems="center">
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCrear(true)} sx={{ borderRadius: 2 }}>
          Nueva Empresa
        </Button>
      </Box>

      {/* Grid de Empresas */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : empresas.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3, bgcolor: '#f8fafc' }}>
          <Business sx={{ fontSize: 60, color: '#cbd5e1', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No hay empresas registradas aún</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCrear(true)} sx={{ mt: 2 }}>
            Crear la primera
          </Button>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {empresasPaginadas.map((empresa) => (
              <Grid item xs={12} sm={6} md={4} key={empresa.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 3,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Avatar sx={{ bgcolor: '#e0e7ff', color: '#4f46e5', width: 48, height: 48, fontWeight: 'bold' }}>
                        {empresa.nombre.charAt(0).toUpperCase()}
                      </Avatar>
                      <Chip 
                        size="small" 
                        label={empresa.cuit ? `CUIT: ${empresa.cuit}` : 'Sin CUIT'} 
                        variant="outlined" 
                        color={empresa.cuit ? 'primary' : 'default'}
                      />
                    </Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom noWrap title={empresa.nombre}>
                      {empresa.nombre}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mb={1} color="text.secondary">
                      <Mail fontSize="small" />
                      <Typography variant="body2" noWrap title={empresa.responsable_email}>
                        {empresa.responsable_email}
                      </Typography>
                    </Box>
                  </CardContent>
                  <Divider />
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1.5, bgcolor: '#f8fafc' }}>
                    <Button 
                      size="small" 
                      variant="contained" 
                      startIcon={<Edit />} 
                      onClick={() => navigate(`/admin/empresa/${empresa.id}`)}
                      sx={{ borderRadius: 2 }}
                      disableElevation
                    >
                      Gestionar
                    </Button>
                    <Tooltip title="Eliminar empresa">
                      <IconButton size="small" color="error" onClick={() => eliminarEmpresa(empresa.id)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* PAGINADO */}
          {empresas.length > itemsPorPagina && (
            <Box mt={5} display="flex" justifyContent="center">
              <Pagination
                count={Math.ceil(empresas.length / itemsPorPagina)}
                page={pagina}
                onChange={(e, value) => setPagina(value)}
                color="primary"
                size="large"
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}

      {/* MODAL CREAR EMPRESA */}
      <Dialog open={openCrear} onClose={() => setOpenCrear(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Business color="primary" /> 
          Crear nueva empresa
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Al crear una empresa, se generará automáticamente un usuario Responsable con el email provisto.
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            name="nombre"
            label="Razón Social / Nombre de la empresa"
            value={nuevaEmpresa.nombre}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            name="responsable_email"
            label="Email del responsable"
            type="email"
            value={nuevaEmpresa.responsable_email}
            onChange={handleChange}
            required
            helperText="Este email se usará para iniciar sesión como administrador de la empresa."
          />
          <TextField
            fullWidth
            margin="normal"
            name="cuit"
            label="CUIT (opcional)"
            value={nuevaEmpresa.cuit}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpenCrear(false)} color="inherit">Cancelar</Button>
          <Button variant="contained" onClick={crearEmpresa} sx={{ borderRadius: 2, px: 3 }}>
            Crear Empresa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmpresasList;
