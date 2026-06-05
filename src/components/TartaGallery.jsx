import React, { useState, useEffect, useRef } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  IconButton,
  Card,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import api from '../api/api';
import { setTartaLabelMap } from '../utils/tartaUtils';

const TartaGallery = ({ seleccionadas = {}, onChange }) => {
  const [tartas, setTartas] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef(null); // 👈 ref para scroll manual con flechas

  useEffect(() => {
    const fetchTartas = async () => {
      try {
        const res = await api.get('/tartas');
        const data = Array.isArray(res.data) ? res.data : [];
        setTartas(data);
        setTartaLabelMap(data);

        console.log(`🥧 Tartas cargadas desde el backend: ${data.length}`, data);
      } catch (err) {
        console.error('❌ Error al cargar tartas:', err);
      }
    };

    fetchTartas();
  }, []);

  const handleCantidadChange = (key, cantidad) => {
    if (cantidad < 0) return;
    onChange({ ...seleccionadas, [key]: cantidad });
  };

  const tartasValidas = tartas.filter(t => t.key && t.nombre);
  console.log("🔎 Todas las tartas:", tartas);
  console.log("✅ Tartas válidas:", tartasValidas);

  const scrollBy = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (!tartasValidas.length) return null;

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(prev => !prev)}
      sx={{ mt: 4 }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6" fontWeight="bold">🥧 Tartas (8 porciones)</Typography>
      </AccordionSummary>

      <AccordionDetails>
        {/* Contenedor scroll horizontal */}
        <Box
          ref={scrollRef}
          sx={{
            display: 'flex',
            overflowX: 'auto',
            gap: 2,
            pb: 1,
            px: 1,
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': {
              height: 8
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#aaa',
              borderRadius: 4
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f0f0f0'
            }
          }}
        >
          {tartasValidas.map((tarta) => {
            const cantidad = seleccionadas[tarta.key] || 0;
            return (
              <Box
                key={tarta.key}
                sx={{
                  scrollSnapAlign: 'start',
                  minWidth: { xs: 220, sm: 240 },
                  flexShrink: 0
                }}
              >
                <Card sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}>
                  <Box
                    component="img"
                    src={tarta.img}
                    alt={tarta.nombre}
                    sx={{
                      width: '100%',
                      height: 130,
                      objectFit: 'cover',
                      borderRadius: 2,
                      mb: 1
                    }}
                  />
                  <Typography variant="subtitle1" fontWeight="bold">{tarta.nombre}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {tarta.descripcion}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <IconButton onClick={() => handleCantidadChange(tarta.key, cantidad - 1)} size="small">
                      <RemoveIcon />
                    </IconButton>
                    <Typography variant="body1" sx={{ mx: 2 }}>{cantidad}</Typography>
                    <IconButton onClick={() => handleCantidadChange(tarta.key, cantidad + 1)} size="small">
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Card>
              </Box>
            );
          })}
        </Box>

        {/* Flechas de scroll */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <IconButton onClick={() => scrollBy(-250)} size="small">
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={() => scrollBy(250)} size="small">
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default TartaGallery;
