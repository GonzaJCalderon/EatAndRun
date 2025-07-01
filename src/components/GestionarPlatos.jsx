import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import {
  Container, Typography, TextField, Button, Box
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import FormularioPlato from './FormularioPlato';
import ListaPlatos from './ListaPlatos';

const GestionarPlatos  = () => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [imagen, setImagen] = useState(null);
  const [rol, setRol] = useState('usuario');
  const [cargando, setCargando] = useState(false);
  const [platosCreados, setPlatosCreados] = useState([]);
  const [platoEditando, setPlatoEditando] = useState(null);
  const [busquedaNombre, setBusquedaNombre] = useState('');
  const [filtroDesde, setFiltroDesde] = useState('');
  const [filtroHasta, setFiltroHasta] = useState('');
  const [semanaActiva, setSemanaActiva] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
  resetFormulario();
}, []);


  const fetchSemanaActiva = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('https://eatandrun-back-production.up.railway.app/api/semana/actual', {
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
      const res = await fetch('https://eatandrun-back-production.up.railway.app/api/daily/all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await res.json();
      const ordenados = data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setPlatosCreados(ordenados);
    } catch (err) {
      console.error('❌ Error al obtener platos:', err);
    }
  };

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
      alert("🚫 Semana bloqueada");
      return;
    }
    if (!nombre || !fecha) {
      alert('⚠️ Completá nombre y fecha');
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
        ? `https://eatandrun-back-production.up.railway.app/api/daily/${platoEditando.id}`
        : 'https://eatandrun-back-production.up.railway.app/api/daily/daily';
      const method = platoEditando ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      if (res.ok) {
        alert(platoEditando ? '✏️ Actualizado' : '✅ Plato creado');
        resetFormulario();
        fetchPlatos();
      } else {
        const err = await res.json();
        console.error(err);
        alert('❌ Error del servidor');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Error en la petición');
    } finally {
      setCargando(false);
    }
  };

  const handleEditar = (plato) => {
    setNombre(plato.name ?? '');
    setDescripcion(plato.description ?? '');
    setFecha(plato.date?.substring(0, 10) ?? '');
    setRol(plato.for_role ?? 'usuario');
    setImagen(null);
    setPlatoEditando(plato);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar plato?')) return;
    try {
      await fetch(`https://eatandrun-back-production.up.railway.app/api/daily/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      fetchPlatos();
    } catch (err) {
      console.error('❌ Error al eliminar:', err);
      alert('Error al eliminar');
    }
  };

  return (
    <Container sx={{ mt: 4, pb: 10 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin')}>
          Volver
        </Button>
        <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={() => {
          dispatch(logout());
          navigate('/login');
        }}>
          Cerrar sesión
        </Button>
      </Box>

      <FormularioPlato
        nombre={nombre} setNombre={setNombre}
        descripcion={descripcion} setDescripcion={setDescripcion}
        fecha={fecha} setFecha={setFecha}
        rol={rol} setRol={setRol}
        imagen={imagen} setImagen={setImagen}
        cargando={cargando}
        handleSubmit={handleSubmit}
        platoEditando={platoEditando}
        resetFormulario={resetFormulario}
      />

      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <TextField
          label="🔍 Buscar por nombre"
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

      <ListaPlatos
        platosCreados={platosCreados}
        busquedaNombre={busquedaNombre}
        filtroDesde={filtroDesde}
        filtroHasta={filtroHasta}
        handleEditar={handleEditar}
        handleEliminar={handleEliminar}
      />
    </Container>
  );
};

export default GestionarPlatos ;
