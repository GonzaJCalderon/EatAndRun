import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  IconButton,
  Card,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useState, useRef } from 'react';
import dayjs from '../utils/day';

const TartaGallery = ({
  seleccionadas = {},
  onChange,
  tartasDisponibles = [],
  semanasDisponibles = [],
  semanaSeleccionada,
  onSemanaChange
}) => {
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef(null);

  const handleCantidadChange = (tarta, cantidad) => {
    if (cantidad < 0) return;

    const clave = `tarta-${tarta.id || tarta.nombre?.toLowerCase().replace(/\s+/g, '-')}`;
    const nuevas = { ...seleccionadas };

    if (cantidad === 0) {
      delete nuevas[clave];
    } else {
      nuevas[clave] = cantidad;
    }

    onChange(nuevas);
  };

  if (!tartasDisponibles.length) return null;

  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(prev => !prev)} sx={{ mt: 4 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6" fontWeight="bold">🥧 Tartas (8 porciones)</Typography>
      </AccordionSummary>

      <AccordionDetails>
        {semanasDisponibles.length > 1 && (
          <Box sx={{ mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Semana para recibir las tartas</InputLabel>
              <Select
                value={semanaSeleccionada || ''}
                onChange={(e) => onSemanaChange(e.target.value)}
                label="Semana para recibir las tartas"
              >
                {semanasDisponibles.map((semana) => (
                  <MenuItem key={semana.id} value={semana.id}>
                    {dayjs(semana.semana_inicio).format('DD/MM')} al {dayjs(semana.semana_fin).format('DD/MM')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        <Box
          ref={scrollRef}
          sx={{
            display: 'flex',
            overflowX: 'auto',
            gap: 2,
            pb: 1,
            px: 1,
            scrollSnapType: 'x mandatory'
          }}
        >
          {tartasDisponibles.map((tarta) => {
            const clave = `tarta-${tarta.id || tarta.nombre?.toLowerCase().replace(/\s+/g, '-')}`;
            const cantidad = seleccionadas[clave] || 0;

            return (
              <Box
                key={clave}
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
                    sx={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 2, mb: 1 }}
                  />
                  <Typography variant="subtitle1" fontWeight="bold">{tarta.nombre}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {tarta.descripcion}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <IconButton onClick={() => handleCantidadChange(tarta, cantidad - 1)} size="small">
                      <RemoveIcon />
                    </IconButton>
                    <Typography variant="body1" sx={{ mx: 2 }}>{cantidad}</Typography>
                    <IconButton onClick={() => handleCantidadChange(tarta, cantidad + 1)} size="small">
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Card>
              </Box>
            );
          })}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default TartaGallery;
