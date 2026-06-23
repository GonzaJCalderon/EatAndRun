import React, { useEffect, useState, useRef } from 'react';
import {
  Container, Typography, TextField, IconButton, Button,
  Card, CardContent, Box, Stack, Grid,
  Snackbar, Alert, CircularProgress, Tooltip,
  FormGroup, FormControlLabel, Checkbox
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/Upload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';

// 👇 Componente input file reseteable con forwardRef
const FileInputResetable = React.forwardRef(({ onChange, disabled }, ref) => {
  const [inputKey, setInputKey] = useState(Date.now());

  React.useImperativeHandle(ref, () => ({
    reset: () => setInputKey(Date.now())
  }));

  return (
    <input
      key={inputKey}
      type="file"
      hidden
      accept="image/*"
      onChange={onChange}
      disabled={disabled}
      data-testid="file-input"
    />
  );
});

const EditarMenu = () => {
  const [platosMenu, setPlatosMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loadingImagenes, setLoadingImagenes] = useState([]);
  const fileInputRefs = useRef([]); // Para controlar reset de cada input file

  const token = localStorage.getItem('authToken');
const isProd = window.location.hostname !== 'localhost';
const endpointBase = isProd
  ? 'https://eatandrun-back-production.up.railway.app/api/fixed'
  : 'http://localhost:4000/api/fixed'; // o tu puerto


  const fetchMenuCompleto = async () => {
    try {
      const res = await fetch(`${endpointBase}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al obtener menú');
      // Ordenar DESC por fecha (del más nuevo al más antiguo)
      const ordenados = [...data].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setPlatosMenu(ordenados);
    } catch (err) {
      console.error('❌ Error al cargar menú:', err);
      showSnackbar('❌ Error al cargar menú', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuCompleto();
  }, []);

  const handleInputChange = (index, campo, valor) => {
    const nuevos = [...platosMenu];
    nuevos[index][campo] = valor;
    setPlatosMenu(nuevos);
  };

  const handleQuitarImagen = (index) => {
    handleInputChange(index, 'image_url', '');
    handleInputChange(index, '_file', null);
    // Resetear input file
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].reset();
    }
  };

  const handleImagenChange = async (index, file) => {
    if (!file) return;
    handleInputChange(index, '_file', file);

    const nuevosLoading = [...loadingImagenes];
    nuevosLoading[index] = true;
    setLoadingImagenes(nuevosLoading);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('https://eatandrun-back-production.up.railway.app/api/images/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (data.imageUrl) {
        handleInputChange(index, 'image_url', data.imageUrl);
      } else {
        showSnackbar('❌ Error al subir imagen', 'error');
      }
    } catch (err) {
      console.error('❌ Error al subir imagen:', err);
      showSnackbar('❌ Error al subir imagen', 'error');
    } finally {
      const nuevosLoading = [...loadingImagenes];
      nuevosLoading[index] = false;
      setLoadingImagenes(nuevosLoading);
    }
  };

  const guardarPlato = async (index) => {
  const plato = platosMenu[index];
  const isNew = !plato.id;

  try {
    const body = new FormData();
    body.append('name', plato.name);
    body.append('description', plato.description || '');
    body.append('price', plato.price || 0);
    body.append('for_role', JSON.stringify(['usuario', 'empresa', 'empleado', 'admin']));

    if (plato.image_url) {
      body.append('image_url', plato.image_url);
    }
    
    if (plato.available_days) {
      body.append('available_days', JSON.stringify(plato.available_days));
    }

    // LOG: Mostrar todo lo que se manda en el FormData
    console.log('🟢 GUARDAR PLATO: Nuevo?', isNew);
    for (let [key, value] of body.entries()) {
      console.log('📦 FormData:', key, value);
    }

    const res = await fetch(
      isNew ? endpointBase : `${endpointBase}/${plato.id}`,
      {
        method: isNew ? 'POST' : 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body
      }
    );

    // LOG: Mostrar response
    console.log('🔵 [RESPONSE guardarPlato]', res);

    const data = await res.json();

    // LOG: Mostrar data del backend (respuesta JSON)
    console.log('🟡 [RESPONSE BODY guardarPlato]', data);

    if (!res.ok) throw new Error(data.error || 'Error al guardar');

    showSnackbar(isNew ? '✅ Plato creado' : '✅ Plato actualizado');
    fetchMenuCompleto();
  } catch (err) {
    console.error('❌ Error al guardar plato:', err);
    showSnackbar('❌ Error al guardar', 'error');
  }
};


  const eliminarPlato = async (index) => {
    const id = platosMenu[index]?.id;

    if (!id) {
      const nuevos = [...platosMenu];
      nuevos.splice(index, 1);
      setPlatosMenu(nuevos);
      return;
    }

    if (!window.confirm('¿Eliminar este plato fijo?')) return;

    try {
      const res = await fetch(`${endpointBase}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('No se pudo eliminar');

      showSnackbar('🗑️ Plato eliminado');
      fetchMenuCompleto();
    } catch (err) {
      console.error('❌ Error al eliminar:', err);
      showSnackbar('❌ Error al eliminar el plato', 'error');
    }
  };

  // Crea un plato vacío y lo pone al principio del array
  const agregarPlato = () => {
    setPlatosMenu(prev => [{ name: '', description: '', price: '', image_url: '', available_days: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'] }, ...prev]);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container sx={{ mt: 4, pb: 8 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => (window.location.href = '/admin')}
        >
          Volver al admin
        </Button>
      </Box>

      <Typography variant="h4" gutterBottom>
        🍽️ Editar Menú Fijo
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Guía rápida:</strong> Aquí podés administrar los platos fijos que están disponibles todas las semanas. 
        Si un plato es exclusivo de un día en particular (por ejemplo, "Solo los miércoles"), destildá los demás días en la sección <b>Días disponibles</b> de ese plato.
      </Alert>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Button
            variant="outlined"
            onClick={agregarPlato}
            fullWidth
            sx={{ mb: 3 }}
          >
            ➕ Agregar plato nuevo
          </Button>
          
          <Grid container spacing={2}>
            {platosMenu.map((plato, index) => (
              <Grid item xs={12} sm={6} md={4} lg={4} key={plato.id || `nuevo-${index}`}>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ height: '100%' }}
                >
                  <Card sx={{ borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.08)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ p: 2, pb: '16px !important', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
                        <TextField
                          label="Nombre del plato"
                          size="small"
                          multiline
                          rows={2}
                          value={plato.name}
                          onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                          fullWidth
                        />
                        <TextField
                          label="Descripción (opcional)"
                          size="small"
                          multiline
                          rows={2}
                          value={plato.description || ''}
                          onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                          fullWidth
                        />

                        <Box sx={{ mt: 1, border: '1px solid #e0e0e0', borderRadius: 1, p: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            Días disponibles:
                          </Typography>
                          <FormGroup row sx={{ gap: 0 }}>
                            {['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].map(dia => (
                              <FormControlLabel
                                key={dia}
                                control={
                                  <Checkbox 
                                    size="small" 
                                    checked={Array.isArray(plato.available_days) ? plato.available_days.includes(dia) : true}
                                    onChange={(e) => {
                                      const currentDays = Array.isArray(plato.available_days) 
                                        ? [...plato.available_days] 
                                        : ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
                                      
                                      let newDays;
                                      if (e.target.checked) {
                                        newDays = [...currentDays, dia];
                                      } else {
                                        newDays = currentDays.filter(d => d !== dia);
                                      }
                                      handleInputChange(index, 'available_days', newDays);
                                    }}
                                  />
                                }
                                label={<Typography variant="caption" sx={{textTransform: 'capitalize'}}>{dia === 'miercoles' ? 'Mié' : dia.slice(0,3)}</Typography>}
                                sx={{ ml: 0, mr: 1 }}
                              />
                            ))}
                          </FormGroup>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, mb: 1 }}>
                          {plato.image_url ? (
                            <>
                              <img />
                              <Tooltip title="Quitar imagen">
                                <IconButton size="small" color="error" onClick={() => handleQuitarImagen(index)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : (
                            <Box sx={{ width: 60, height: 60, bgcolor: '#f1f5f9', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Typography variant="caption" color="text.disabled">Sin foto</Typography>
                            </Box>
                          )}
                          <Button
                            variant="outlined"
                            component="label"
                            size="small"
                            sx={{ flexGrow: 1, height: 36, textTransform: 'none' }}
                            startIcon={loadingImagenes[index] ? <CircularProgress size={16} /> : <UploadIcon fontSize="small" />}
                            disabled={loadingImagenes[index]}
                          >
                            {loadingImagenes[index] ? '...' : 'Subir'}
                            <FileInputResetable
                              ref={el => (fileInputRefs.current[index] = el)}
                              onChange={e => handleImagenChange(index, e.target.files[0])}
                              disabled={loadingImagenes[index]}
                            />
                          </Button>
                        </Box>

                        <Box display="flex" justifyContent="space-between" alignItems="center" mt="auto" pt={1}>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => guardarPlato(index)}
                          >
                            Guardar
                          </Button>
                          <Tooltip title="Eliminar plato">
                            <IconButton onClick={() => eliminarPlato(index)} color="error" size="small">
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditarMenu;
