import React, { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, IconButton, Button,
  Card, CardContent, Box, Stack, Tabs, Tab,
  Snackbar, Alert, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/Upload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';

const EditarMenu = () => {
  const [activeTab, setActiveTab] = useState(0); // 0 = usuario, 1 = empresa
  const [platosUsuario, setPlatosUsuario] = useState([]);
  const [platosEmpresa, setPlatosEmpresa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loadingImagenes, setLoadingImagenes] = useState([]);
const [semanaActiva, setSemanaActiva] = useState(null);

  const token = localStorage.getItem('authToken');

  const endpointBase = 'http://localhost:4000/api/menu/fixed';

  const fetchSemanaActiva = async () => {
  try {
    const res = await fetch('http://localhost:4000/api/menu/semana/actual', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setSemanaActiva(data);
  } catch (err) {
    console.error("❌ Error al obtener semana activa:", err);
  }
};
  
useEffect(() => {
  fetchSemanaActiva();
  fetchPlatosPorRol('usuario');
  fetchPlatosPorRol('empresa');
}, []);


 const fetchPlatosPorRol = async (rol) => {
  try {
    const res = await fetch(`${endpointBase}/by-role?role=${rol}`, {

      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al obtener menú');

    rol === 'usuario' ? setPlatosUsuario(data) : setPlatosEmpresa(data);
  } catch (err) {
    console.error(`❌ Error al cargar menú de ${rol}:`, err);
    showSnackbar(`❌ Error al cargar menú de ${rol}`, 'error');
  } finally {
    setLoading(false);
  }
};


  const getCurrentMenu = () => activeTab === 0 ? platosUsuario : platosEmpresa;
  const setCurrentMenu = activeTab === 0 ? setPlatosUsuario : setPlatosEmpresa;
  const forRole = activeTab === 0 ? 'usuario' : 'empresa';

  const handleInputChange = (index, campo, valor) => {
    const nuevos = [...getCurrentMenu()];
    nuevos[index][campo] = valor;
    setCurrentMenu(nuevos);
  };

const handleImagenChange = async (index, file) => {
  handleInputChange(index, '_file', file);

  const nuevosLoading = [...loadingImagenes];
  nuevosLoading[index] = true;
  setLoadingImagenes(nuevosLoading);

  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch('http://localhost:4000/api/menu/upload-image', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();
    if (data.imageUrl) {
      handleInputChange(index, 'image_url', data.imageUrl);
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
  if (semanaActiva && !semanaActiva.habilitado) {
  showSnackbar('🚫 La semana está bloqueada. No se pueden guardar cambios.', 'warning');
  return;
}

  const menu = getCurrentMenu();
  const plato = menu[index];
  const isNew = !plato.id;

  try {
    const body = new FormData();
    body.append('name', plato.name);
    body.append('description', plato.description || '');
    body.append('price', plato.price || 0);
    body.append('for_role', forRole);

    if (plato.image_url) {
      body.append('image_url', plato.image_url); // imagen ya subida
    }

    const res = await fetch(
      isNew ? endpointBase : `${endpointBase}/${plato.id}`,
      {
        method: isNew ? 'POST' : 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
          // No agregar Content-Type si usás FormData
        },
        body
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al guardar');

    showSnackbar(isNew ? '✅ Plato creado' : '✅ Plato actualizado');
    fetchPlatosPorRol(forRole);
  } catch (err) {
    console.error('❌ Error al guardar plato:', err);
    showSnackbar('❌ Error al guardar', 'error');
  }
};



  const eliminarPlato = async (index) => {
    if (semanaActiva && !semanaActiva.habilitado) {
  showSnackbar('🚫 La semana está bloqueada. No se pueden eliminar platos.', 'warning');
  return;
}

    const menu = getCurrentMenu();
    const id = menu[index].id;

    if (!id) {
      const nuevos = [...menu];
      nuevos.splice(index, 1);
      setCurrentMenu(nuevos);
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
      fetchPlatosPorRol(forRole);
    } catch (err) {
      console.error('❌ Error al eliminar:', err);
      showSnackbar('❌ Error al eliminar el plato', 'error');
    }
  };

  const agregarPlato = () => {
    setCurrentMenu([
      ...getCurrentMenu(),
      { name: '', description: '', price: '', image_url: '' }
    ]);
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

      <Tabs
        value={activeTab}
        onChange={(e, newIndex) => setActiveTab(newIndex)}
        centered
        sx={{ mb: 4 }}
      >
        <Tab label="👤 Usuario" />
        <Tab label="🏢 Empresa" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {getCurrentMenu().map((plato, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Stack spacing={2}>
                    <TextField
                      label="Nombre del plato"
                      value={plato.name}
                      onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Descripción"
                      value={plato.description || ''}
                      onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Precio"
                      type="number"
                      value={plato.price}
                      onChange={(e) => handleInputChange(index, 'price', e.target.value)}
                      fullWidth
                    />
                    {plato.image_url && (
                      <img
                        src={plato.image_url}
                        alt="plato"
                        style={{ width: 120, height: 120, borderRadius: 8 }}
                      />
                    )}
                    <Button
  variant="outlined"
  component="label"
  startIcon={loadingImagenes[index] ? <CircularProgress size={20} /> : <UploadIcon />}
  disabled={loadingImagenes[index]}
>
  {loadingImagenes[index] ? 'Subiendo...' : 'Subir Imagen'}
  <input
    type="file"
    hidden
    accept="image/*"
    onChange={(e) => handleImagenChange(index, e.target.files[0])}
  />
</Button>

                    <Box display="flex" justifyContent="space-between">
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => guardarPlato(index)}
                      >
                        💾 Guardar
                      </Button>
                      <IconButton
                        onClick={() => eliminarPlato(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={agregarPlato}
            fullWidth
          >
            ➕ Agregar plato
          </Button>
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
