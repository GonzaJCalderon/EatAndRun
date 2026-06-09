import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  useMediaQuery,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../api/api';

const slugify = (str) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const AdminTartas = () => {
  const [tartas, setTartas] = useState([]);
  const [form, setForm] = useState({
    key: '',
    nombre: '',
    descripcion: '',
    img: ''
  });

  const [modoEditar, setModoEditar] = useState(false);
  const [editarId, setEditarId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');


  useEffect(() => {
    fetchTartas();
  }, []);

  const fetchTartas = async () => {
    try {
      const res = await api.get('/tartas');
      setTartas(res.data);
    } catch (err) {
      console.error('Error cargando tartas:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newForm = {
      ...form,
      [name]: name === 'precio' ? Number(value) : value
    };
    if (name === 'nombre' && !modoEditar) {
      newForm.key = slugify(value);
    }
    setForm(newForm);
  };

  const handleGuardar = async () => {
    if (!form.nombre || !form.key) {
      alert('Debe ingresar un nombre válido para generar el key.');
      return;
    }

    try {
      if (modoEditar) {
        await api.put(`/tartas/${editarId}`, form);
      } else {
        await api.post('/tartas', form);
      }
      fetchTartas();
      cerrarDialogo();
    } catch (err) {
      if (
        err.response?.data?.detail &&
        err.response.data.detail.includes('already exists')
      ) {
        alert('⚠️ Ya existe una tarta con ese nombre. Cambia el nombre o edítala.');
      } else {
        alert('Error guardando tarta: ' + (err.response?.data?.detail || err.message));
      }
      console.error('Error guardando tarta:', err);
    }
  };

  const cerrarDialogo = () => {
    setDialogOpen(false);
    setForm({ key: '', nombre: '', descripcion: '', img: '' });
    setModoEditar(false);
    setEditarId(null);
    setSubiendo(false);
  };

  const handleEditar = (tarta) => {
    setForm({ ...tarta });
    setEditarId(tarta.id);
    setModoEditar(true);
    setDialogOpen(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Seguro que querés eliminar esta tarta?')) {
      await api.delete(`/tartas/${id}`);
      fetchTartas();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setSubiendo(true);
      const res = await api.post('/images/tarta', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm((prev) => ({ ...prev, img: res.data.secure_url }));
    } catch (err) {
      console.error('❌ Error al subir imagen:', err);
    } finally {
      setSubiendo(false);
    }
  };

  const handleEliminarImagen = () => {
    setForm((prev) => ({ ...prev, img: '' }));
  };

  const handleVolver = () => window.history.back();

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <Container sx={{ mt: 3 }}>
      {/* BOTONES SUPERIORES */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleVolver} variant="outlined" color="primary">Volver</Button>
        <Button startIcon={<LogoutIcon />} onClick={handleCerrarSesion} variant="outlined" color="error">Cerrar sesión</Button>
      </Box>

      <Typography variant="h4" gutterBottom textAlign={isMobile ? 'center' : 'left'}>
        🥧 Editor de Tartas
      </Typography>

      <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
        <strong>Guía rápida:</strong> Las tartas están siempre disponibles en la plataforma como un adicional.
        Aquí podés agregar nuevas variedades, editar sus nombres, descripciones y actualizar sus fotos.
      </Alert>

      <Box sx={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start', mb: 2, mt: 4 }}>
        <Button startIcon={<AddIcon />} variant="contained" onClick={() => {
          setDialogOpen(true);
          setModoEditar(false);
          setForm({ key: '', nombre: '', descripcion: '', img: '' });
        }}>
          Nueva Tarta
        </Button>
      </Box>

      <Grid container spacing={2}>
        {tartas.map((tarta) => (
          <Grid item xs={12} sm={6} md={4} key={tarta.id}>
            <Card>
              <CardMedia component="img" height="140" image={tarta.img} alt={tarta.nombre} />
              <CardContent>
                <Typography variant="h6">{tarta.nombre}</Typography>
                <Typography variant="body2" color="text.secondary">{tarta.descripcion}</Typography>

              </CardContent>
              <CardActions>
                <IconButton onClick={() => handleEditar(tarta)}><EditIcon /></IconButton>
                <IconButton onClick={() => handleEliminar(tarta.id)} color="error"><DeleteIcon /></IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* DIALOGO TARTA */}
      <Dialog open={dialogOpen} onClose={cerrarDialogo} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>{modoEditar ? 'Editar Tarta' : 'Nueva Tarta'}</DialogTitle>
        <DialogContent>
          <TextField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} fullWidth sx={{ mt: 1 }} />
          <TextField label="Descripción" name="descripcion" value={form.descripcion} onChange={handleChange} fullWidth multiline rows={3} sx={{ mt: 2 }} />

          <Button variant="outlined" component="label" sx={{ mt: 2 }}>
            {subiendo ? <CircularProgress size={20} /> : '📷 Subir Imagen'}
            <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
          </Button>
          {form.img && (
            <Box sx={{ mt: 2 }}>
              <img src={form.img} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }} />
              <Button onClick={handleEliminarImagen} variant="outlined" color="error" size="small" sx={{ mt: 1 }}>
                🗑️ Quitar imagen
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarDialogo}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardar}>
            {modoEditar ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminTartas;
