import { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardMedia,
  Divider, Button, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import dayjs from '../utils/day';

const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:4000/api'
  : 'https://eatandrun-back-production.up.railway.app/api';

const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

const AdminMenuPreview = () => {
  const [menuFijo, setMenuFijo] = useState([]);
  const [menuEspecial, setMenuEspecial] = useState([]);
  const [tartas, setTartas] = useState([]);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState('lunes');

 const fetchMenus = async () => {
  try {
    const token = localStorage.getItem('authToken');

    const [resFijos, resEspecial, resTartas] = await Promise.all([
      fetch(`${API_BASE}/fixed`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`${API_BASE}/daily/all`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`${API_BASE}/tartas`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);

    const dataFijos = await resFijos.json();
    const dataEspecial = await resEspecial.json();
    const dataTartas = await resTartas.json();

    setMenuFijo(Array.isArray(dataFijos) ? dataFijos : []);  // ✅ prevención
    setMenuEspecial(Array.isArray(dataEspecial) ? dataEspecial : []);
    setTartas(Array.isArray(dataTartas) ? dataTartas : []);
  } catch (err) {
    console.error('❌ Error cargando menús:', err);
    setError('No se pudieron cargar los menús');
  }
};


  useEffect(() => {
    fetchMenus();
  }, []);

  const agruparPorDia = (platos) => {
    const agrupado = { lunes: [], martes: [], miercoles: [], jueves: [], viernes: [] };

    platos.forEach(p => {
      const fecha = new Date(p.date);
      const dia = fecha.getDay();
      const map = { 1: 'lunes', 2: 'martes', 3: 'miercoles', 4: 'jueves', 5: 'viernes' };
      const diaTexto = map[dia];
      if (diaTexto) agrupado[diaTexto].push(p);
    });

    return agrupado;
  };

  const agruparTartasPorFecha = (lista) => {
    const agrupado = {};
    if (!Array.isArray(lista)) return agrupado;

    lista.forEach(t => {
      const fecha = dayjs(t.fecha);
      if (!fecha.isValid()) {
        console.warn('❌ Fecha inválida en tarta:', t);
        return;
      }

      const fechaStr = fecha.format('dddd D [de] MMMM');
      if (!agrupado[fechaStr]) agrupado[fechaStr] = [];
      agrupado[fechaStr].push(t);
    });

    return agrupado;
  };

  const menuEspecialPorDia = agruparPorDia(menuEspecial);
  const tartasPorFecha = agruparTartasPorFecha(tartas);

  const renderPlato = (plato) => (
    <Card sx={{ display: 'flex', mb: 2, width: '100%' }} key={plato.id}>
      {plato.image_url && (
        <CardMedia
          component="img"
          sx={{ width: 120 }}
          image={plato.image_url}
          alt={plato.name || plato.nombre}
        />
      )}
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold">
          {plato.name || plato.nombre}
        </Typography>
        <Typography variant="body2">
          {plato.description || plato.descripcion}
        </Typography>
      </CardContent>
    </Card>
  );

  const renderTarta = (tarta, idx) => (
  <Card sx={{ mb: 2 }} key={idx}>
    <Box sx={{ display: 'flex' }}>
      {tarta.img && (
        <CardMedia
          component="img"
          sx={{ width: 120, objectFit: 'cover' }}
          image={tarta.img} // ✅ la propiedad real
          alt={tarta.nombre}
        />
      )}
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold">
          {tarta.nombre}
        </Typography>
        <Typography variant="body2">
          {tarta.descripcion || '—'}
        </Typography>
      </CardContent>
    </Box>
  </Card>
);


  const volver = () => {
    window.location.href = '/admin';
  };

  const cerrarSesion = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  const handleAccordionToggle = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ mt: 4, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={volver}>
          Volver al Admin
        </Button>
        <Button variant="contained" color="error" startIcon={<LogoutIcon />} onClick={cerrarSesion}>
          Cerrar sesión
        </Button>
      </Box>

      <Typography variant="h4" gutterBottom>
        📋 Vista previa del Menú Semanal
      </Typography>

      {error && <Typography color="error">{error}</Typography>}

      {dias.map((dia) => (
        <Accordion
          key={dia}
          expanded={expanded === dia}
          onChange={handleAccordionToggle(dia)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
              📅 {dia}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {/* Fijos (ya no separados) */}
            <Typography variant="subtitle1" color="primary">🍽️ Menú Fijo</Typography>
            <Grid container spacing={1}>
              {menuFijo.map(renderPlato)}
            </Grid>

            {/* Especiales */}
            <Typography variant="subtitle1" color="secondary" sx={{ mt: 2 }}>⭐ Especiales</Typography>
            <Grid container spacing={1}>
              {(menuEspecialPorDia[dia] || []).map(renderPlato)}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Tartas por fecha */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" gutterBottom>🥧 Tartas por Fecha</Typography>
        {Object.entries(tartasPorFecha).map(([fecha, lista]) => (
          <Box key={fecha} sx={{ mt: 2, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold">{fecha}</Typography>
            <Divider sx={{ my: 1 }} />
            {lista.map(renderTarta)}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AdminMenuPreview;
