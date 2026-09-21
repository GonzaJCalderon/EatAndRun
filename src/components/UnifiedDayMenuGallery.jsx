// src/components/UnifiedDayMenuGallery.jsx
import React, { useRef, useMemo } from 'react';
import { Box, Typography, Card, FormControlLabel, Checkbox, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import UnifiedMenuCard from './UnifiedMenuCard';

const chunkArray = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const normalizePlato = (p) => ({
  ...p,
  nombre: p.nombre || p.name || '',
  descripcion: p.descripcion || p.description || '',
  img: p.img || p.image_url || '',
  tipo: p.tipo || 'daily' // tipo por defecto
});

const UnifiedDayMenuGallery = ({
  day,
  fecha,
  fijos = [],
  especiales = [],
  extras = [],
  tartas = [],
  selected = {},
  onChange,
  disabled = false
}) => {
  const scrollRefEspeciales = useRef(null);
  const scrollRefFijos = useRef(null);

  const fijosNorm = useMemo(() => fijos.map(normalizePlato), [fijos]);
  const especialesNorm = useMemo(() => especiales.map(normalizePlato), [especiales]);

  const handleCantidadChange = (plato, nuevaCantidad) => {
    if (disabled || nuevaCantidad < 0) return;

    const clave = `${plato.tipo}-${plato.id}`;
    const nuevaSeleccion = { ...selected };

    if (nuevaCantidad === 0) {
      delete nuevaSeleccion[clave];
    } else {
      nuevaSeleccion[clave] = {
        ...plato,
        cantidad: nuevaCantidad,
        tipo: plato.tipo || 'daily'
      };
    }

    onChange(nuevaSeleccion);
  };

  const handleNoDeseaMenuChange = (event) => {
    if (disabled) return;
    const deseaOmitir = event.target.checked;

    const nuevaSeleccion = { ...selected };
    if (deseaOmitir) {
      nuevaSeleccion.noDeseaMenu = { tipo: 'skip', cantidad: 1 };
    } else {
      delete nuevaSeleccion.noDeseaMenu;
    }

    onChange(nuevaSeleccion);
  };

  const estaOmitido = selected.noDeseaMenu?.tipo === 'skip';

  const renderScrollGrid = (platos, scrollRef, isEspecial = false) => {
    const scrollBy = (offset) => scrollRef.current?.scrollBy({ left: offset, behavior: 'smooth' });

    return (
      <>
        <Box
          ref={scrollRef}
          sx={{
            display: 'flex',
            overflowX: 'auto',
            gap: 2,
            scrollSnapType: 'x mandatory',
            px: 1,
            pb: 1,
            '&::-webkit-scrollbar': { height: 6 },
            '&::-webkit-scrollbar-thumb': { backgroundColor: '#ccc', borderRadius: 4 },
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {isEspecial
            ? platos.map((plato) => {
                const clave = `${plato.tipo}-${plato.id}`;
                const cantidad = selected[clave]?.cantidad || 0;

                return (
                  <Box
                    key={`esp-${day}-${plato.id}`}
                    sx={{
                      scrollSnapAlign: 'start',
                      flexShrink: 0,
                      minWidth: { xs: 180, sm: 200, md: 220 }
                    }}
                  >
                    <UnifiedMenuCard
                      plato={plato}
                      cantidad={cantidad}
                      onChange={(p, c) => handleCantidadChange(p, c)}
                    />
                  </Box>
                );
              })
            : chunkArray(platos, 2).map((col, idx) => (
                <Box
                  key={`col-${day}-${idx}`}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    minWidth: { xs: 180, sm: 200, md: 220 },
                    scrollSnapAlign: 'start',
                    flexShrink: 0
                  }}
                >
                  {col.map((plato) => {
                    const clave = `${plato.tipo}-${plato.id}`;
                    const cantidad = selected[clave]?.cantidad || 0;

                    return (
                      <UnifiedMenuCard
                        key={`fijo-${day}-${plato.id}`}
                        plato={plato}
                        cantidad={cantidad}
                        onChange={(p, c) => handleCantidadChange(p, c)}
                      />
                    );
                  })}
                </Box>
              ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <IconButton onClick={() => scrollBy(-250)} size="small">
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={() => scrollBy(250)} size="small">
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Box>
      </>
    );
  };

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
            disabled={disabled}
          />
        }
        label="❌ No deseo menú este día"
        sx={{ mb: 2 }}
      />

      {!estaOmitido && (
        <>
          {especialesNorm.length > 0 && (
            <>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ⭐ Menú especial del día
              </Typography>
              {renderScrollGrid(especialesNorm, scrollRefEspeciales, true)}
            </>
          )}

          {fijosNorm.length > 0 && (
            <>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                📦 Platos fijos
              </Typography>
              {renderScrollGrid(fijosNorm, scrollRefFijos)}
            </>
          )}
        </>
      )}
    </Card>
  );
};

export default UnifiedDayMenuGallery;
