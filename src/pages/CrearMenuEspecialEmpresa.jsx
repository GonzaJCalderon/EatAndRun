import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Typography,
  Button,
  Alert,
  Box,
  Divider
} from '@mui/material';

const CrearMenuEspecialEmpresa = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [imagen, setImagen] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [menus, setMenus] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [semanaActiva, setSemanaActiva] = useState(null);

  const token = localStorage.getItem('authToken');
  const fetchSemanaActiva = async () => {
  try {
    const res = await fetch('http://localhost:4000/api/menu/semana/actual', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setSemanaActiva(data);
  } catch (err) {
    console.error('❌ Error al obtener semana activa:', err);
  }
};

  useEffect(() => {
    if (imagen) {
      const objectUrl = URL.createObjectURL(imagen);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setPreviewUrl(null);
  }, [imagen]);

  const fetchMenus = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/menu/daily/empresa/especial', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMenus(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
      console.error("❌ Error al cargar menús especiales:", err);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleEditClick = (menu) => {
    setEditingId(menu.id);
    setName(menu.name);
    setDescription(menu.description || '');
    setPrice(menu.price);
    setDate(menu.date.split('T')[0]); // cortar timestamp
    setPreviewUrl(menu.image_url || null);
    setImagen(null); // se actualizará si cargás una nueva
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (semanaActiva && !semanaActiva.habilitado) {
    alert("🚫 La semana está bloqueada. No se pueden crear ni editar menús especiales.");
    return;
  }

  if (!name || !price || !date) {
    setMensaje({ type: 'error', text: 'Todos los campos obligatorios deben completarse' });
    return;
  }


    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('date', date);
    if (imagen) formData.append('image', imagen);

    const endpoint = editingId
      ? `http://localhost:4000/api/menu/daily/empresa/especial/${editingId}`
      : 'http://localhost:4000/api/menu/daily/empresa/especial';

    try {
      const res = await fetch(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje({ type: 'success', text: editingId ? '✅ Menú actualizado' : '✅ Menú creado' });
        setName('');
        setDescription('');
        setPrice('');
        setDate('');
        setImagen(null);
        setPreviewUrl(null);
        setEditingId(null);
        fetchMenus();
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (err) {
      console.error(err);
      setMensaje({ type: 'error', text: '❌ Error al guardar el menú especial' });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        🍱 {editingId ? 'Editar Menú Especial' : 'Crear Menú Especial'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <TextField
          label="Nombre del plato"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
          sx={{ mb: 2 }}
        />

        <TextField
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={2}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Precio"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          fullWidth
          sx={{ mb: 2 }}
        />

        <TextField
          label="Fecha"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          fullWidth
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />

        <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
          📸 Subir imagen del plato
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => setImagen(e.target.files[0])}
          />
        </Button>

        {previewUrl && (
          <Box
            component="img"
            src={previewUrl}
            alt="Previsualización"
            sx={{ width: '100%', maxHeight: 250, objectFit: 'cover', borderRadius: 2, mb: 2 }}
          />
        )}

        <Button variant="contained" type="submit" fullWidth>
          {editingId ? '✏️ Actualizar menú' : '💾 Guardar menú'}
        </Button>

        {mensaje && (
          <Alert severity={mensaje.type} sx={{ mt: 2 }}>
            {mensaje.text}
          </Alert>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" gutterBottom>
        📋 Menús Especiales Creados
      </Typography>

      {menus.length === 0 ? (
        <Typography variant="body2">No hay menús especiales aún.</Typography>
      ) : (
        menus.map((menu) => (
          <Box
            key={menu.id}
            onClick={() => handleEditClick(menu)}
            sx={{
              p: 2,
              border: '1px solid #ddd',
              borderRadius: 2,
              mb: 2,
              cursor: 'pointer',
              '&:hover': { backgroundColor: '#f7f7f7' }
            }}
          >
            <Typography fontWeight="bold">{menu.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(menu.date).toLocaleDateString()} - ${menu.price}
            </Typography>
          </Box>
        ))
      )}
    </Container>
  );
};

export default CrearMenuEspecialEmpresa;
