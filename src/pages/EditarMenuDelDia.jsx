// 🔁 ¡Versión adaptada para todos los roles!

import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Card, CardContent, Divider,
  TextField, Button, Box,
  IconButton, Grid, Snackbar, Alert, CircularProgress
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
  const [subiendo, setSubiendo] = useState({});
  const [semanaActiva, setSemanaActiva] = useState(null);

  const token = localStorage.getItem('authToken');

  // 👇 Detecta si es local o no:
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_BASE = isLocal
  ? 'http://localhost:4000/api'
  : 'https://eatandrun-back-production.up.railway.app/api';


  useEffect(() => {
    const fetchSemana = async () => {
      try {
        const res = await fetch(`${API_BASE}/daily/all`, {
  headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setSemanaActiva(data);
      } catch (err) {
        console.error("❌ Error al cargar semana activa:", err);
      }
    };

    fetchSemana();
    fetchPlatos();
  }, []);

  const fetchPlatos = async () => {
    try {
    const res = await fetch(`${API_BASE}/daily/all`, {
  headers: { Authorization: `Bearer ${token}` }
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
      const res = await fetch('https://eatandrun-back-production.up.railway.app/api/upload-image', {
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

  const isNuevo = !plato.id || plato.id.toString().startsWith('temp');
  const formData = new FormData();
  formData.append('name', plato.name);
  formData.append('description', plato.description ?? '');
  formData.append('price', plato.price ?? 0);
  formData.append('date', plato.date);

  if (plato.image_url) {
    formData.append('image_url', plato.image_url);
  }

  try {
    const endpoint = isNuevo
      ? `${API_BASE}/daily`
      : `${API_BASE}/daily/${plato.id}`;

    const res = await fetch(endpoint, {
      method: isNuevo ? 'POST' : 'PUT',
      headers: { Authorization: `Bearer ${token}` },
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
      const res = await fetch(`https://eatandrun-back-production.up.railway.app/api/daily/${id}`, {
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
      date: '', // Empieza vacío para que no se asigne a ningún día automáticamente
      image_url: '',
      tipo: 'daily' 
    };
    setPlatos((prev) => [nuevo, ...prev]); // Se agrega al principio de la lista
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const platosFiltrados = platos.filter((plato) => {
    return fechaFiltro ? plato.date === fechaFiltro : true;
  });

  const formatDateForInput = (value) => {
    if (!value) return '';
    const date = new Date(value);
    return date.toISOString().split('T')[0]; // 🧼 convierte a YYYY-MM-DD
  };

  const agruparPorFecha = (platosArray) => {
    const grupos = {};
    platosArray.forEach(plato => {
      const fecha = plato.date ? formatDateForInput(plato.date) : 'UNASSIGNED';
      if (!grupos[fecha]) grupos[fecha] = [];
      grupos[fecha].push(plato);
    });
    // Ordenar las fechas cronológicamente, pero mantener UNASSIGNED al principio
    return Object.keys(grupos).sort((a, b) => {
      if (a === 'UNASSIGNED') return -1;
      if (b === 'UNASSIGNED') return 1;
      return a.localeCompare(b);
    }).map(key => ({
      fecha: key,
      platos: grupos[key]
    }));
  };

  const formatearFechaLarga = (fechaStr) => {
  if (fechaStr === 'UNASSIGNED') return '🆕 Platos Nuevos (Sin asignar)';
  if (!fechaStr || typeof fechaStr !== 'string') return '📅 Fecha no disponible';

  let fecha;

  // Formato ISO detectado automáticamente (ya con hora o no)
  const matchISO = fechaStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (matchISO) {
    fecha = new Date(`${matchISO[1]}-${matchISO[2]}-${matchISO[3]}T00:00:00`);
  } else {
    return '📅 Fecha malformada';
  }

  if (isNaN(fecha.getTime())) {
    return '📅 Fecha inválida';
  }

  const opciones = {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };

  // Capitaliza el primer carácter del día
  const fechaFormateada = fecha.toLocaleDateString('es-AR', opciones);
  return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
};







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

      {/* {semanaActiva && !semanaActiva.habilitado && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          🚫 La semana actual está bloqueada. No se pueden agregar o editar platos.
        </Alert>
      )} */}

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
      </Grid>


<Button
  variant="contained"
  color="primary"
  fullWidth
  sx={{ mb: 3 }}
  onClick={agregarPlato}
>
  ➕ Crear nuevo plato
</Button>




      {platosFiltrados.length === 0 ? (
        <Typography>No hay platos que coincidan con los filtros.</Typography>
      ) : (
        agruparPorFecha(platosFiltrados).map((grupo) => (
          <Box key={grupo.fecha} sx={{ mb: 5, p: 3, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Typography variant="h5" color="primary.main" fontWeight="bold" sx={{ mb: 3, borderBottom: '2px solid #cbd5e1', pb: 1 }}>
              📅 {formatearFechaLarga(grupo.fecha)}
            </Typography>

            <Grid container spacing={2}>
              {grupo.platos.map((plato) => {
                const index = platos.findIndex(p => p.id === plato.id);
                return (
                  <Grid item xs={12} md={6} key={plato.id}>
                    <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ height: '100%' }}>
                      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.08)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ p: 2, pb: '16px !important', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', gap: 2, flexGrow: 1 }}>
                            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                              <TextField
                                label="Nombre"
                                size="small"
                                multiline
                                rows={2}
                                value={plato.name || ''}
                                onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                                fullWidth
                              />
                              <TextField
                                label="Fecha"
                                type="date"
                                size="small"
                                value={formatDateForInput(plato.date)}
                                onChange={(e) => handleInputChange(index, 'date', e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                              />
                              <TextField
                                label="Descripción"
                                size="small"
                                value={plato.description || ''}
                                onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                                fullWidth
                                multiline
                                rows={2}
                              />

                            </Box>
                          </Box>

                          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} pt={1} borderTop="1px solid #e2e8f0">
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => guardarCambios(index)}
                              disabled={cargando}
                            >
                              Guardar
                            </Button>
                            {plato.id && !`${plato.id}`.startsWith('temp-') && (
                              <IconButton color="error" size="small" onClick={() => eliminarPlato(plato.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
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
