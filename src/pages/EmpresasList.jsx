import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Pagination,
} from '@mui/material';
import { Delete, Add, ArrowBack, Logout } from '@mui/icons-material';
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
  const itemsPorPagina = 10;

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
    if (!window.confirm('¿Estás seguro de eliminar esta empresa?')) return;
    try {
      await axios.delete(`/admin/empresas/${id}`);
      enqueueSnackbar('✅ Empresa eliminada', { variant: 'success' });
      fetchEmpresas();
    } catch (err) {
      enqueueSnackbar('❌ No se pudo eliminar', { variant: 'error' });
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

  const handleVolver = () => navigate('/admin');

  useEffect(() => {
    fetchEmpresas();
  }, []);

  return (
    <Box p={4}>
      {/* 🔙 Volver y Logout */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button startIcon={<ArrowBack />} variant="outlined" onClick={handleVolver}>
          Volver
        </Button>
        <Typography variant="h4" fontWeight="bold">🏢 Empresas registradas</Typography>
        <Button color="error" variant="outlined" startIcon={<Logout />} onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </Box>

      {/* ➕ Crear nueva empresa */}
      <Box mb={2}>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCrear(true)}>
          Nueva Empresa
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <List>
          {empresasPaginadas.map((empresa) => (
            <Paper
              key={empresa.id}
              sx={{
                mb: 2,
                px: 2,
                py: 1,
                transition: 'all 0.3s',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#e3f2fd',
                  transform: 'scale(1.01)',
                }
              }}
              elevation={3}
              onClick={() => navigate(`/admin/empresa/${empresa.id}`)}
            >
              <ListItem
                secondaryAction={
                  <IconButton edge="end" onClick={(e) => {
                    e.stopPropagation(); // Para que no haga navigate
                    eliminarEmpresa(empresa.id);
                  }}>
                    <Delete />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={empresa.nombre}
                  secondary={`CUIT: ${empresa.cuit || 'N/A'} | Responsable: ${empresa.responsable_email}`}
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      )}

      {/* PAGINADO */}
      <Box mt={3} display="flex" justifyContent="center">
        <Pagination
          count={Math.ceil(empresas.length / itemsPorPagina)}
          page={pagina}
          onChange={(e, value) => setPagina(value)}
          color="primary"
        />
      </Box>

      {/* MODAL CREAR EMPRESA */}
      <Dialog open={openCrear} onClose={() => setOpenCrear(false)} maxWidth="sm" fullWidth>
        <DialogTitle>➕ Crear nueva empresa</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            name="nombre"
            label="Nombre de la empresa"
            value={nuevaEmpresa.nombre}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="dense"
            name="responsable_email"
            label="Email del responsable"
            type="email"
            value={nuevaEmpresa.responsable_email}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="dense"
            name="cuit"
            label="CUIT (opcional)"
            value={nuevaEmpresa.cuit}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCrear(false)}>Cancelar</Button>
          <Button variant="contained" onClick={crearEmpresa}>
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmpresasList;
