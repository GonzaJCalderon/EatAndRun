import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';

const CrearPlatoDelDia = () => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [imagen, setImagen] = useState(null);
  const [rol, setRol] = useState('usuario');
  const [cargando, setCargando] = useState(false);
  const [platosCreados, setPlatosCreados] = useState([]);
  const [platoEditando, setPlatoEditando] = useState(null); // 👈 control de edición
  const [busquedaNombre, setBusquedaNombre] = useState('');
const [filtroDesde, setFiltroDesde] = useState('');
const [filtroHasta, setFiltroHasta] = useState('');
const [semanaActiva, setSemanaActiva] = useState(null);

const navigate = useNavigate();
const dispatch = useDispatch();

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

const fetchPlatos = async () => {
  try {
    const res = await fetch('http://localhost:4000/api/menu/daily/all', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    const data = await res.json();

    // ✅ Ordenar por fecha ASC
    const ordenados = data.sort((a, b) => new Date(a.date) - new Date(b.date));

    setPlatosCreados(ordenados);
  } catch (err) {
    console.error('❌ Error al obtener platos:', err);
  }
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);



  useEffect(() => {
      fetchSemanaActiva();
    fetchPlatos();
  }, []);

  const resetFormulario = () => {
    setNombre('');
    setDescripcion('');
    setFecha('');
    setImagen(null);
    setRol('usuario');
    setPlatoEditando(null);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (semanaActiva && !semanaActiva.habilitado) {
    alert("🚫 La semana está bloqueada. No se pueden crear ni editar platos.");
    return;
  }

  if (!nombre || !fecha) {
    alert('⚠️ Completá los campos obligatorios');
    return;
  }

    setCargando(true);

    const formData = new FormData();
    formData.append('name', nombre);
    formData.append('description', descripcion);
    formData.append('date', fecha);
    formData.append('for_role', rol);
    if (imagen) formData.append('image', imagen);

    try {
      const url = platoEditando
        ? `http://localhost:4000/api/menu/daily/${platoEditando.id}`
        : 'http://localhost:4000/api/menu/daily';
      const method = platoEditando ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        alert(platoEditando ? '✏️ Plato actualizado' : '✅ Plato creado');
        resetFormulario();
        fetchPlatos();
      } else {
        console.error(data);
        alert('❌ Error en el proceso');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Error en la petición');
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id) => {
    const confirmar = window.confirm('¿Eliminar este plato del día?');
    if (!confirmar) return;

    try {
      await fetch(`http://localhost:4000/api/menu/daily/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      fetchPlatos();
    } catch (err) {
      console.error('❌ Error al eliminar plato:', err);
      alert('No se pudo eliminar');
    }
  };

 const handleEditar = (plato) => {
  setNombre(plato.name);
  setDescripcion(plato.description);
  setFecha(plato.date?.substring(0, 10)); // ✅ FIX
  setRol(plato.for_role);
  setImagen(null);
  setPlatoEditando(plato);
};

const formatFechaBonita = (dateStr) => {
  const fecha = new Date(dateStr);
  return fecha.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};



  return (
    <Container sx={{ mt: 4, pb: 10 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
  <Button
    variant="outlined"
    startIcon={<ArrowBackIcon />}
    onClick={() => navigate('/admin')}
  >
    Volver
  </Button>

  <Button
    variant="outlined"
    color="error"
    startIcon={<LogoutIcon />}
    onClick={() => {
      dispatch(logout());
      navigate('/login');
    }}
  >
    Cerrar sesión
  </Button>
</Box>

      <Typography variant="h4" gutterBottom>
        {platoEditando ? '✏️ Editar plato del día' : '🍽️ Crear plato del día'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <TextField
          label="Nombre del plato"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />

        <TextField
          label="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          fullWidth
          multiline
          rows={2}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Fecha"
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Para rol</InputLabel>
          <Select
            value={rol}
            label="Para rol"
            onChange={(e) => setRol(e.target.value)}
            required
          >
            <MenuItem value="usuario">👤 Usuario</MenuItem>
            <MenuItem value="empresa">🏢 Empresa</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadIcon />}
          sx={{ mb: 2 }}
        >
          Subir nueva imagen
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => setImagen(e.target.files[0])}
          />
        </Button>

        {imagen && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            Imagen seleccionada: <strong>{imagen.name}</strong>
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={cargando}
          >
            {cargando
              ? 'Guardando...'
              : platoEditando
              ? 'Actualizar'
              : 'Guardar plato'}
          </Button>

          {platoEditando && (
            <Button onClick={resetFormulario} variant="outlined" color="secondary">
              Cancelar edición
            </Button>
          )}
        </Box>
      </Box>

   <Box sx={{ mt: 5 }}>
    <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
  <TextField
    label="🔍 Buscar por nombre"
    variant="outlined"
    value={busquedaNombre}
    onChange={(e) => setBusquedaNombre(e.target.value)}
    sx={{ minWidth: 200 }}
  />
  <TextField
    label="Desde"
    type="date"
    InputLabelProps={{ shrink: true }}
    value={filtroDesde}
    onChange={(e) => setFiltroDesde(e.target.value)}
    sx={{ minWidth: 160 }}
  />
  <TextField
    label="Hasta"
    type="date"
    InputLabelProps={{ shrink: true }}
    value={filtroHasta}
    onChange={(e) => setFiltroHasta(e.target.value)}
    sx={{ minWidth: 160 }}
  />
</Box>

  <Typography variant="h5" gutterBottom>📋 Platos del día creados</Typography>

  {platosCreados.length === 0 ? (
    <Typography variant="body2">Aún no hay platos registrados.</Typography>
  ) : (
    // Agrupar por fecha legible
    Array.from(
      platosCreados.reduce((acc, plato) => {
        const fecha = new Date(plato.date);
        const diaSemana = fecha.toLocaleDateString('es-AR', { weekday: 'long' });
        const fechaLegible = fecha.toLocaleDateString('es-AR');
        const titulo = `${capitalize(diaSemana)} ${fechaLegible}`;

        if (!acc.has(titulo)) acc.set(titulo, []);
        acc.get(titulo).push(plato);
        return acc;
      }, new Map())
    ).map(([fecha, platosDelDia]) => (
      <Box key={fecha} sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          🗓️ {fecha}
        </Typography>

        {platosDelDia.map((plato) => (
          <Card key={plato.id} sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  {plato.image_url && (
                    <img
                      src={plato.image_url}
                      alt={plato.name}
                      style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8 }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6">{plato.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {plato.description}
                  </Typography>
                  <Typography>👥 Rol: {plato.for_role}</Typography>
                </Grid>
                <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<EditIcon />}
                    onClick={() => handleEditar(plato)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    startIcon={<DeleteIcon />}
                    onClick={() => handleEliminar(plato.id)}
                  >
                    Eliminar
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Box>
    ))
  )}
</Box>

    </Container>
  );
};

export default CrearPlatoDelDia;
