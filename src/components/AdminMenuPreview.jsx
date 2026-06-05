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

  const renderPlatoCompacto = (plato) => (
    <Card sx={{ 
      display: 'flex', 
      alignItems: 'center',
      mb: 1.5, 
      p: 1,
      borderRadius: 2, 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      bgcolor: '#fff'
    }} key={plato.id || plato.name}>
      {plato.image_url && (
        <CardMedia
          component="img"
          sx={{ width: 50, height: 50, borderRadius: 1, objectFit: 'cover', mr: 1.5 }}
          image={plato.image_url}
          alt={plato.name || plato.nombre}
        />
      )}
      <Box>
        <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1.1 }}>
          {plato.name || plato.nombre}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 180, display: 'block' }}>
          {plato.description || plato.descripcion}
        </Typography>
      </Box>
    </Card>
  );

  const renderTarta = (tarta, idx) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
      <Card sx={{ 
        display: 'flex', 
        height: '100%', 
        borderRadius: 2, 
        border: '1px solid #f1f5f9',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        {tarta.img && (
          <CardMedia
            component="img"
            sx={{ width: 90, objectFit: 'cover' }}
            image={tarta.img}
            alt={tarta.nombre}
          />
        )}
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, flexGrow: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1.2, mb: 0.5 }}>
            {tarta.nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {tarta.descripcion || '—'}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
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

      <Typography variant="h4" fontWeight="bold" gutterBottom color="primary.main">
        📋 Vista previa del Menú Semanal
      </Typography>

      {/* Leyenda explicativa para el Admin */}
      <Card sx={{ bgcolor: '#e0f2fe', p: 2, mb: 4, borderRadius: 2, border: '1px solid #bae6fd' }}>
        <Typography variant="body1" fontWeight="bold" color="#0369a1">
          💡 ¿Qué estoy viendo aquí?
        </Typography>
        <Typography variant="body2" color="#0c4a6e" sx={{ mt: 0.5 }}>
          Esta pantalla es únicamente de <strong>Lectura y Control</strong>. Muestra los 20-25 platos fijos que se repiten automáticamente de lunes a viernes. 
          Aquí el administrador puede verificar rápidamente cómo están distribuidos los platos en la semana sin miedo a romper nada.
        </Typography>
      </Card>

      {error && <Typography color="error">{error}</Typography>}

      {/* Columnas Kanban para los días */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        overflowX: 'auto', 
        pb: 2,
        '&::-webkit-scrollbar': { height: 8 },
        '&::-webkit-scrollbar-thumb': { backgroundColor: '#cbd5e1', borderRadius: 4 }
      }}>
        {dias.map((dia) => (
          <Box key={dia} sx={{ 
            minWidth: 280, 
            maxWidth: 320, 
            flex: 1, 
            bgcolor: '#f1f5f9', 
            borderRadius: 3, 
            p: 2,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography variant="h6" align="center" fontWeight="bold" sx={{ mb: 2, textTransform: 'capitalize', color: '#334155' }}>
              📅 {dia}
            </Typography>

            <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>🍽️ Menú Fijo</Typography>
            <Box sx={{ mb: 2 }}>
              {menuFijo.map(renderPlatoCompacto)}
            </Box>

            {(menuEspecialPorDia[dia] && menuEspecialPorDia[dia].length > 0) && (
              <>
                <Typography variant="subtitle2" color="secondary" sx={{ mb: 1, fontWeight: 'bold' }}>⭐ Especiales</Typography>
                <Box>
                  {menuEspecialPorDia[dia].map(renderPlatoCompacto)}
                </Box>
              </>
            )}
          </Box>
        ))}
      </Box>

      {/* Tartas por fecha */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" gutterBottom>🥧 Tartas por Fecha</Typography>
        {Object.entries(tartasPorFecha).map(([fecha, lista]) => (
          <Box key={fecha} sx={{ mt: 2, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold">{fecha}</Typography>
            <Grid container spacing={2}>
              {lista.map(renderTarta)}
            </Grid>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AdminMenuPreview;
