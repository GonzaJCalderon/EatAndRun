// src/components/AdminMenuPreview.jsx

import { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardMedia,
  Button, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useMenuSemanal } from '../hooks/useMenuSemanal.js';

const AdminMenuPreview = () => {
  const [tartas, setTartas] = useState([]);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const { menuPorDia, loading } = useMenuSemanal('admin');

  const fetchTartas = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const API_BASE = window.location.hostname === 'localhost'
        ? 'http://localhost:4000/api'
        : 'https://eatandrun-back-production.up.railway.app/api';

      const resTartas = await fetch(`${API_BASE}/tartas`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const dataTartas = await resTartas.json();
      setTartas(Array.isArray(dataTartas) ? dataTartas : []);
    } catch (err) {
      console.error('❌ Error cargando tartas:', err);
      setError('No se pudieron cargar las tartas');
    }
  };

  useEffect(() => {
    fetchTartas();
  }, []);

  const renderPlato = (plato) => (
    <Card sx={{ display: 'flex', mb: 2, width: '100%' }} key={plato.id}>
      {(plato.image_url || plato.img) && (
        <CardMedia
          component="img"
          sx={{ width: 120 }}
          image={plato.image_url || plato.img}
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
            image={tarta.img}
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

  if (loading) {
    return (
      <Box sx={{ mt: 4, px: 2, textAlign: 'center' }}>
        <Typography>Cargando menús...</Typography>
      </Box>
    );
  }

  const clavesMenu = Object.keys(menuPorDia || {});

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
        Vista previa del Menú Semanal
      </Typography>

      {error && <Typography color="error">{error}</Typography>}

      {clavesMenu.length === 0 && (
        <Typography variant="body1" sx={{ mt: 3 }}>
          ⚠️ No hay menús cargados esta semana.
        </Typography>
      )}

      {clavesMenu.map((clave) => {
        const menuDelDia = menuPorDia[clave] || {};
        const [dia, anio, mes, diaNum] = clave.split('-');
        const fechaStr = `${diaNum}/${mes}`;
        const { fijos = [], especiales = [] } = menuDelDia;

        return (
          <Accordion
            key={clave}
            expanded={expanded === clave}
            onChange={handleAccordionToggle(clave)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                {dia} - {fechaStr}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* Menú Fijo */}
              <Typography variant="subtitle1" color="primary">
                Menú Fijo
              </Typography>
              <Grid container spacing={1}>
                {fijos.length > 0 ? (
                  fijos.map(renderPlato)
                ) : (
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 2, mt: 1 }}>
                    No hay platos fijos
                  </Typography>
                )}
              </Grid>

              {/* Especiales del día */}
              <Typography variant="subtitle1" color="secondary" sx={{ mt: 2 }}>
                Especiales del {dia}
              </Typography>
              <Grid container spacing={1}>
                {especiales.length > 0 ? (
                  especiales.map(renderPlato)
                ) : (
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 2, mt: 1 }}>
                    No hay especiales para {dia}
                  </Typography>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* Tartas fijas de la semana */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" gutterBottom>
          Tartas Fijas de la Semana
        </Typography>
        <Box sx={{ mt: 2 }}>
          {tartas.length > 0 ? (
            tartas.map(renderTarta)
          ) : (
            <Typography variant="body2" color="textSecondary">
              No hay tartas disponibles
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminMenuPreview;
