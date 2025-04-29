import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  IconButton,
  Button,
  Card,
  CardContent,
  Divider,
  Box,
  Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/Upload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';

const dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

const EditarMenu = () => {
  const [menu, setMenu] = useState({});

  useEffect(() => {
    const data = localStorage.getItem('menu_eatandrun');
    if (data) {
      setMenu(JSON.parse(data));
    } else {
      const inicial = {};
      dias.forEach(d => (inicial[d] = []));
      setMenu(inicial);
    }
  }, []);

  const handleNombreChange = (dia, index, nuevoNombre) => {
    const nuevoMenu = { ...menu };
    nuevoMenu[dia][index].nombre = nuevoNombre;
    setMenu(nuevoMenu);
  };

  const handleDescripcionChange = (dia, index, nuevaDescripcion) => {
    const nuevoMenu = { ...menu };
    nuevoMenu[dia][index].descripcion = nuevaDescripcion;
    setMenu(nuevoMenu);
  };

  const handleImagenChange = (dia, index, file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const nuevoMenu = { ...menu };
      nuevoMenu[dia][index].img = reader.result;
      setMenu(nuevoMenu);
    };
    reader.readAsDataURL(file);
  };

  const agregarPlato = (dia) => {
    const nuevoMenu = { ...menu };
    nuevoMenu[dia].push({ nombre: '', descripcion: '', img: '' });
    setMenu(nuevoMenu);
  };

  const eliminarPlato = (dia, index) => {
    const nuevoMenu = { ...menu };
    nuevoMenu[dia].splice(index, 1);
    setMenu(nuevoMenu);
  };

  const guardarCambios = () => {
    localStorage.setItem('menu_eatandrun', JSON.stringify(menu));
    alert('✅ Menú actualizado correctamente');
  };

  return (
    <Container sx={{ mt: 4, pb: 8 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => window.location.href = "/admin"}
        >
          Volver al admin
        </Button>
      </Box>

      <Typography variant="h4" gutterBottom>📝 Editar Menú Semanal</Typography>

      {dias.map((dia) => (
        <motion.div
          key={dia}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>📅 {dia.toUpperCase()}</Typography>
              <Divider sx={{ mb: 3 }} />

              <Stack spacing={3}>
                {menu[dia]?.map((plato, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', md: 'row' },
                      alignItems: { md: 'center' },
                      gap: 2,
                      backgroundColor: '#f9f9f9',
                      p: 2,
                      borderRadius: 2
                    }}
                  >
                    {/* Imagen preview */}
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        borderRadius: 2,
                        overflow: 'hidden',
                        bgcolor: '#e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {plato.img && (
                        <img
                          src={plato.img}
                          alt="Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                    </Box>

                    {/* Nombre */}
                    <TextField
                      label="Nombre del plato"
                      value={plato.nombre}
                      onChange={(e) => handleNombreChange(dia, index, e.target.value)}
                      fullWidth
                      sx={{ maxWidth: { md: 300 } }}
                    />

                    {/* Descripción */}
                    <TextField
                      label="Descripción (opcional)"
                      value={plato.descripcion || ''}
                      onChange={(e) => handleDescripcionChange(dia, index, e.target.value)}
                      fullWidth
                      sx={{ maxWidth: { md: 300 } }}
                    />

                    {/* Botón subir imagen */}
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<UploadIcon />}
                      sx={{
                        minWidth: '120px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Imagen
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => handleImagenChange(dia, index, e.target.files[0])}
                      />
                    </Button>

                    {/* Botón eliminar */}
                    <IconButton onClick={() => eliminarPlato(dia, index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Stack>

              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => agregarPlato(dia)}
                sx={{ mt: 3 }}
              >
                ➕ Agregar plato
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={guardarCambios}
        sx={{ mt: 4 }}
      >
        💾 Guardar cambios del menú
      </Button>
    </Container>
  );
};

export default EditarMenu;
