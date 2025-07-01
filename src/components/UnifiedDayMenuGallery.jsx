import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  FormControlLabel,
  Checkbox,
  Card
} from '@mui/material';
import { ScrollMenu } from 'react-horizontal-scrolling-menu';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { motion } from 'framer-motion';
import UnifiedMenuCard from './UnifiedMenuCard';

const UnifiedDayMenuGallery = ({ day, fijos = [], especiales = [], selected = {}, onChange }) => {
      console.log("📅 Día actual:", day);
  console.log("📦 Platos fijos:", fijos);
  console.log("🌟 Platos especiales:", especiales);
  console.log("🎯 Selección actual:", selected);
  const handleCantidadChange = (plato, nuevaCantidad) => {
    if (nuevaCantidad < 0) return;

    const nuevaSeleccion = {
      ...selected,
      [plato.id]: {
        ...plato,
        cantidad: nuevaCantidad,
        tipo: plato.tipo || 'daily'
      }
    };

    onChange(nuevaSeleccion);
  };

  const handleNoDeseaMenuChange = (event) => {
    const deseaOmitir = event.target.checked;

    if (deseaOmitir) {
      onChange({
        ...selected,
        noDeseaMenu: {
          tipo: 'skip',
          cantidad: 1
        }
      });
    } else {
      const nuevaSeleccion = { ...selected };
      delete nuevaSeleccion.noDeseaMenu;
      onChange(nuevaSeleccion);
    }
  };

  const estaOmitido = selected.noDeseaMenu?.tipo === 'skip';

  return (
    <Card variant="outlined" sx={{ p: 2, mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        ⭐ Menú del día completo
      </Typography>

      <FormControlLabel
        control={
          <Checkbox
            checked={estaOmitido}
            onChange={handleNoDeseaMenuChange}
            color="error"
          />
        }
        label="❌ No deseo menú este día"
        sx={{ mb: 2 }}
      />

      {!estaOmitido && (
        <>
          {fijos.length > 0 && (
            <>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                📦 Platos fijos
              </Typography>
     <Box
  sx={{
    display: 'flex',
    gap: 2,
    overflowX: 'auto',
    pb: 1,
    scrollSnapType: 'x mandatory'
  }}
>
  {fijos.map((plato) => (
   <Box key={`fijo-${plato.id}`} sx={{ flex: '0 0 auto', scrollSnapAlign: 'start' }}>
  <UnifiedMenuCard
    plato={plato}
    cantidad={selected[plato.id]?.cantidad || 0}
    onChange={(p, c) => handleCantidadChange(p, c)}
  />
</Box>

  ))}
</Box>


            </>
          )}

          {especiales.length > 0 && (
            <>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3, mb: 2 }}>
                ⭐ Menú especial del día
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2
                }}
              >
                {especiales.map((plato) => {
                  const cantidad = selected[plato.id]?.cantidad || 0;
                  return (
                <motion.div
  key={`especial-${plato.id}`}
  whileHover={{ scale: 1.03 }}
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  <UnifiedMenuCard
    plato={plato}
    cantidad={cantidad}
    onChange={(p, c) => handleCantidadChange(p, c)}
  />
</motion.div>

                  );
                })}
              </Box>
            </>
          )}
        </>
      )}
    </Card>
  );
};

export default UnifiedDayMenuGallery;
