import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Divider,
  Grid,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { motion } from 'framer-motion';

const VerMenuDelDia = () => {
  const [platos, setPlatos] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetchPlatos();
  }, []);

  const fetchPlatos = async () => {
    setCargando(true);
    try {
      const res = await fetch('http://localhost:4000/api/menu/daily', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await res.json();
      setPlatos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id) => {
    const confirmar = window.confirm('¿Seguro que querés eliminar este plato del menú del día?');
    if (!confirmar) return;

    try {
      await fetch(`http://localhost:4000/api/menu/daily/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      fetchPlatos(); // refrescar
    } catch (err) {
      console.error(err);
      alert('❌ Error al eliminar plato');
    }
  };

  const platosFiltrados = platos.filter(p => {
    const matchFecha = filtroFecha ? p.date.startsWith(filtroFecha) : true;
    const matchRol = filtroRol ? p.for_role === filtroRol : true;
    return matchFecha && matchRol;
  });

  return (
    <Container sx={{ mt: 4, pb: 8 }}>
      <Typography variant="h4" gutterBottom>📋 Platos del Día</Typography>

      {/* Filtros */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            label="Filtrar por fecha"
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Rol</InputLabel>
            <Select
              value={filtroRol}
              label="Rol"
              onChange={(e) => setFiltroRol(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="usuario">👤 Usuario</MenuItem>
              <MenuItem value="empresa">🏢 Empresa</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              setFiltroFecha('');
              setFiltroRol('');
            }}
          >
            Limpiar filtros
          </Button>
        </Grid>
      </Grid>

      {/* Lista de platos */}
      {cargando ? (
        <Typography>Cargando...</Typography>
      ) : platosFiltrados.length === 0 ? (
        <Typography>No hay platos que coincidan con los filtros.</Typography>
      ) : (
        platosFiltrados.map((plato) => (
          <motion.div
            key={plato.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            viewport={{ once: true }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    {plato.image_url ? (
                      <img
                        src={plato.image_url}
                        alt={plato.name}
                        style={{
                          width: '100%',
                          height: 120,
                          objectFit: 'cover',
                          borderRadius: 8
                        }}
                      />
                    ) : (
                      <Box sx={{ width: '100%', height: 120, backgroundColor: '#eee', borderRadius: 2 }} />
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6">{plato.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {plato.description}
                    </Typography>
                    <Typography sx={{ mt: 1 }}>💵 ${plato.price}</Typography>
                    <Typography>📅 {plato.date}</Typography>
                    <Typography>👥 Rol: {plato.for_role}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      disabled
                      fullWidth
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      color="error"
                      fullWidth
                      onClick={() => handleEliminar(plato.id)}
                    >
                      Eliminar
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}
    </Container>
  );
};

export default VerMenuDelDia;
