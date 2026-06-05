import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef
} from 'react';

import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Card,
  IconButton
} from '@mui/material';
import UnifiedMenuCard from './UnifiedMenuCard';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { dedupeByContenido } from '../utils/dedupe';


const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const UnifiedDayMenuGallery = ({
  day,
  fijos = [],
  especiales = [],
  selected = {},
  onChange,
  disabled = false
}) => {
  const scrollRefEspeciales = useRef(null);
  const scrollRefFijos = useRef(null);

  const handleCantidadChange = (plato, nuevaCantidad) => {
    if (disabled || nuevaCantidad < 0) return;

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
    if (disabled) return;

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

  

  // ✅ Dedupe: fijos
const fijosSinDuplicados = useMemo(() => {
  const vistos = new Set();
  return fijos.filter((p) => {
    const key = `${(p.nombre || '').trim().toLowerCase()}|${(p.descripcion || '').trim().toLowerCase()}`;
    if (vistos.has(key)) return false;
    vistos.add(key);
    return true;
  });
}, [fijos]);


  // ✅ Dedupe: especiales
  const especialesSinDuplicados = useMemo(() => {
    const vistos = new Set();
    return especiales.filter((p) => {
      return !vistos.has(p.id) && vistos.add(p.id);
    });
  }, [especiales]);

  // 🧪 Debug opcional: dejarlo comentado si querés
  /*
  useEffect(() => {
    const allPlatos = [...fijos, ...especiales];
    const ids = new Set();
    allPlatos.forEach((p) => {
      if (ids.has(p.id)) {
        console.warn(`⚠️ Plato duplicado (ID): ${p.id} en el día: ${day}`);
      }
      ids.add(p.id);
    });
  }, [fijos, especiales, day]);
  */
 useEffect(() => {
  const nombres = fijos.map(p => p.nombre);
  const duplicados = nombres.filter((v, i, a) => a.indexOf(v) !== i);
  if (duplicados.length) {
    console.warn(`⚠️ Platos fijos duplicados en "${day}":`, duplicados);
  }
}, [fijos, day]);

  

  const renderScrollGrid = (platos, scrollRef, isEspecial = false) => {
    const scrollBy = (offset) => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({
          left: offset,
          behavior: 'smooth'
        });
      }
    };

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
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#ccc',
              borderRadius: 4
            },
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {isEspecial
            ? platos.map((plato) => (
                <Box
                  key={`especial-${day}-${plato.id}`}
                  sx={{
                    scrollSnapAlign: 'start',
                    flexShrink: 0,
                    minWidth: { xs: 180, sm: 200, md: 220 }
                  }}
                >
 <UnifiedMenuCard
plato={plato}
  cantidad={selected[plato.id]?.cantidad || 0}
  onChange={(p, c) => handleCantidadChange(p, c)}
/>


                </Box>
              ))
            : chunkArray(platos, 2).map((colPlatos, colIdx) => (
                <Box
                  key={`col-${day}-${colIdx}`}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    minWidth: { xs: 180, sm: 200, md: 220 },
                    scrollSnapAlign: 'start',
                    flexShrink: 0
                  }}
                >
                  {colPlatos.map((plato) => (
                    <UnifiedMenuCard
                      key={`fijo-${day}-${plato.id}`}
                      plato={plato}
                      cantidad={selected[plato.id]?.cantidad || 0}
                      onChange={(p, c) => handleCantidadChange(p, c)}
                    />
                  ))}
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
          {especialesSinDuplicados.length > 0 && (
            <>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ⭐ Menú especial del día
              </Typography>
              {renderScrollGrid(especialesSinDuplicados, scrollRefEspeciales, true)}
            </>
          )}

          {fijosSinDuplicados.length > 0 && (
            <>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                📦 Platos fijos
              </Typography>
              {renderScrollGrid(fijosSinDuplicados, scrollRefFijos)}
            </>
          )}
        </>
      )}
    </Card>
  );
};

export default UnifiedDayMenuGallery;
