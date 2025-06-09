import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Card, CardContent, Divider,
  TextField, Button, Box, MenuItem, Select, InputLabel,
  FormControl, IconButton, Grid, Snackbar, Alert, CircularProgress
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { motion } from 'framer-motion';

const EditarMenuDelDia = () => {
  const [platos, setPlatos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [fechaFiltro, setFechaFiltro] = useState('');
  const [rolFiltro, setRolFiltro] = useState('');
  const [subiendo, setSubiendo] = useState({});

  const token = localStorage.getItem('authToken');


  const [semanaActiva, setSemanaActiva] = useState(null);

useEffect(() => {
  const fetchSemana = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/menu/semana/actual', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSemanaActiva(data);
    } catch (err) {
      console.error("❌ Error al cargar semana activa:", err);
    }
  };

  fetchSemana();
}, []);


  useEffect(() => {
    fetchPlatos();
  }, []);

  

  const fetchPlatos = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/menu/daily/all', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setPlatos(data);
    } catch (err) {
      console.error('❌ Error al cargar platos:', err);
      showSnackbar('❌ Error al cargar platos', 'error');
    }
  };

  const handleInputChange = (index, campo, valor) => {
    const nuevos = [...platos];
    nuevos[index][campo] = valor;
    setPlatos(nuevos);
  };

  const handleImagenChange = async (index, file) => {
    const formData = new FormData();
    formData.append('image', file);
    setSubiendo((prev) => ({ ...prev, [index]: true }));

    try {
      const res = await fetch('http://localhost:4000/api/menu/upload-image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (data.imageUrl) {
        handleInputChange(index, 'image_url', data.imageUrl);
        showSnackbar('✅ Imagen subida correctamente');
      } else {
        throw new Error('No se recibió imageUrl');
      }
    } catch (err) {
      console.error('❌ Error al subir imagen:', err);
      showSnackbar('❌ Error al subir imagen', 'error');
    } finally {
      setSubiendo((prev) => ({ ...prev, [index]: false }));
    }
  };

const guardarCambios = async (index) => {
  const plato = platos[index];
  setCargando(true);

  // ✅ Validación de semana activa
  if (semanaActiva && !semanaActiva.habilitado) {
    alert("🚫 La semana actual está bloqueada. No se pueden guardar o modificar platos.");
    setCargando(false);
    return;
  }

  const isNuevo = !plato.id || plato.id.toString().startsWith('temp');
  const formData = new FormData();
  formData.append('name', plato.name);
  formData.append('description', plato.description ?? '');
  formData.append('price', plato.price ?? 0);
  formData.append('date', plato.date);
  formData.append('for_role', plato.for_role);

  if (plato.image_url) {
    formData.append('image_url', plato.image_url);
  }

  try {
    const endpoint = isNuevo
      ? 'http://localhost:4000/api/menu/daily'
      : `http://localhost:4000/api/menu/daily/${plato.id}`;

    const res = await fetch(endpoint, {
      method: isNuevo ? 'POST' : 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo guardar el plato');

    showSnackbar(isNuevo ? '✅ Plato creado' : '✅ Plato actualizado');
    fetchPlatos();
  } catch (err) {
    console.error('❌ Error:', err);
    alert('❌ ' + err.message);
  } finally {
    setCargando(false);
  }
};



  const eliminarPlato = async (id) => {
    if (!window.confirm('¿Eliminar este plato del día?')) return;

    try {
      const res = await fetch(`http://localhost:4000/api/menu/daily/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error();

      showSnackbar('🗑️ Plato eliminado');
      fetchPlatos();
    } catch {
      showSnackbar('❌ No se pudo eliminar el plato', 'error');
    }
  };

const agregarPlato = () => {
  const nuevo = {
    id: `temp-${Date.now()}`,
    name: '',
    description: '',
    price: '',
    date: fechaFiltro || new Date().toISOString().split('T')[0],
    for_role: rolFiltro || '',
    image_url: ''
  };
  setPlatos((prev) => [...prev, nuevo]);
};


  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const platosFiltrados = platos.filter((plato) => {
    const coincideFecha = fechaFiltro ? plato.date === fechaFiltro : true;
    const coincideRol = rolFiltro ? plato.for_role === rolFiltro : true;
    return coincideFecha && coincideRol;
  });

  return (
    <Container sx={{ mt: 4 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => (window.location.href = '/admin')}
        sx={{ mb: 3 }}
      >
        Volver al Admin
      </Button>

      <Typography variant="h4" gutterBottom>
        ✏️ Editar Menú del Día
      </Typography>

      {semanaActiva && !semanaActiva.habilitado && (
  <Alert severity="warning" sx={{ mb: 2 }}>
    🚫 La semana actual está bloqueada. No se pueden agregar o editar platos.
  </Alert>
)}


      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            type="date"
            label="Filtrar por fecha"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={fechaFiltro}
            onChange={(e) => setFechaFiltro(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Filtrar por rol</InputLabel>
            <Select
              value={rolFiltro}
              label="Filtrar por rol"
              onChange={(e) => setRolFiltro(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="usuario">👤 Usuario</MenuItem>
              <MenuItem value="empresa">🏢 Empresa</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

     <Button
  variant="outlined"
  startIcon={<AddIcon />}
  fullWidth
  sx={{ mb: 3 }}
  onClick={agregarPlato}
  disabled={semanaActiva && !semanaActiva.habilitado}
>
  ➕ Agregar nuevo plato
</Button>


      {platosFiltrados.length === 0 ? (
        <Typography>No hay platos que coincidan con los filtros.</Typography>
      ) : (
        platosFiltrados.map((plato, index) => (
          <motion.div key={plato.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>📅 {plato.date}</Typography>
                <Divider sx={{ mb: 2 }} />

<TextField
  label="Nombre"
  value={plato.name || ''}
  onChange={(e) => handleInputChange(index, 'name', e.target.value)}
  fullWidth
  sx={{ mb: 2 }}
/>

<TextField
  label="Descripción"
  value={plato.description || ''}
  onChange={(e) => handleInputChange(index, 'description', e.target.value)}
  fullWidth
  multiline
  sx={{ mb: 2 }}
/>

<TextField
  label="Precio"
  type="number"
  value={plato.price || ''}
  onChange={(e) => handleInputChange(index, 'price', e.target.value)}
  fullWidth
  sx={{ mb: 2 }}
/>


                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Para rol</InputLabel>
                 <Select
  value={plato.for_role || ''}
  label="Para rol"
  onChange={(e) => handleInputChange(index, 'for_role', e.target.value)}
>
  <MenuItem value="usuario">👤 Usuario</MenuItem>
  <MenuItem value="empresa">🏢 Empresa</MenuItem>
</Select>

                </FormControl>

                {plato.image_url && (
                  <Box sx={{ mb: 2 }}>
                    <img
                      src={plato.image_url}
                      alt="plato"
                      style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }}
                    />
                  </Box>
                )}

                <Button
                  variant="outlined"
                  component="label"
                  startIcon={subiendo[index] ? <CircularProgress size={16} /> : <UploadIcon />}
                  disabled={subiendo[index]}
                  sx={{ mb: 2 }}
                >
                  {subiendo[index] ? 'Subiendo...' : 'Subir imagen'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleImagenChange(index, e.target.files[0])}
                  />
                </Button>

                <Box display="flex" gap={2} mt={2}>
                  <Button
                    variant="contained"
                    onClick={() => guardarCambios(index)}
                    disabled={cargando}
                  >
                    💾 Guardar
                  </Button>
                  {plato.id && !`${plato.id}`.startsWith('temp-') && (
                    <IconButton color="error" onClick={() => eliminarPlato(plato.id)}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditarMenuDelDia;
