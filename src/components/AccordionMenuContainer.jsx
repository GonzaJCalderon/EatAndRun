import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails,
  Typography, Box, Button, Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UnifiedDayMenuGallery from './UnifiedDayMenuGallery';
import ExtrasSection from './ExtrasSection';
import dayjs from '../utils/day';

const TZ = 'America/Argentina/Buenos_Aires';
const prettyName = (key) => key.charAt(0).toUpperCase() + key.slice(1);

const AccordionMenuContainer = ({
  menuData = {},           // { lunes-2025-09-30: {fecha, fijos, especiales, extras}, ... }
  selecciones = {},
  onSelect,
  diasHabilitados = {},    // { lunes: true, ... }
  semanaCerrada = false
}) => {
  const [expanded, setExpanded] = useState(null);
  const accordionRefs = useRef({});
  const nextScrollTarget = useRef(null);
  const hasScrolled = useRef(false);

  const diasVisibles = useMemo(() => {
    console.log('📅 menuData keys:', Object.keys(menuData));

    const visibles = Object.keys(menuData);

    if (visibles.length === 0) {
      console.warn('⚠️ No hay días disponibles en el menú.');
    }

    return visibles;
  }, [menuData]);

  useEffect(() => {
    if (hasScrolled.current || expanded) return;
    if (diasVisibles.length > 0) {
      setExpanded(diasVisibles[0]);
      hasScrolled.current = true;
    }
  }, [diasVisibles, expanded]);

  useEffect(() => {
    if (!nextScrollTarget.current) return;
    const el = accordionRefs.current[nextScrollTarget.current];
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        nextScrollTarget.current = null;
      }, 300);
    }
  }, [expanded]);

  const avanzarAlSiguienteDia = (claveActual) => {
    const idx = diasVisibles.indexOf(claveActual);
    const siguiente = diasVisibles[idx + 1];
    if (!siguiente) return;
    nextScrollTarget.current = siguiente;
    setExpanded(siguiente);
  };

const handleSelectCambio = (clave, nuevaSeleccion) => {
  if (typeof onSelect !== 'function') return;
  onSelect({
    ...selecciones,
    [clave]: nuevaSeleccion
  });
};


  const toggleAccordion = (clave) =>
    setExpanded((prev) => (prev === clave ? null : clave));

  if (diasVisibles.length === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="info">
          🕓 No hay días disponibles para pedidos en las fechas actuales.
          <br />
          (Revisá que el menú tenga fechas en esta semana)
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      {diasVisibles.map((clave) => {
        const diaData = menuData?.[clave] || {};
       const [dia] = clave.split('-'); // Extrae "viernes" de "viernes-2025-10-03"


        const platosFijos = diaData.fijos || [];
        const platosEspeciales = diaData.especiales || [];
        const extras = diaData.extras || [];
const seleccionDia = useMemo(() => {
  return JSON.parse(JSON.stringify(selecciones?.[clave] || {}));
}, [selecciones, clave]);



        const fecha = diaData.fecha ? dayjs.tz(diaData.fecha, TZ).startOf('day') : null;
        const hoy = dayjs().tz(TZ).startOf('day');
        const mañana = hoy.add(1, 'day');
        const esPasado = fecha ? fecha.isBefore(mañana) : false;
        
        const estaHabilitado = (diasHabilitados?.[dia] !== false) && !esPasado;
        const fechaFormateada = diaData.fecha
          ? dayjs.tz(diaData.fecha, TZ).format('DD/MM')
          : null;

        return (
          <Accordion
            key={clave}
            expanded={expanded === clave}
            onChange={() => toggleAccordion(clave)}
            ref={(el) => (accordionRefs.current[clave] = el)}
            disableGutters
            slotProps={{ transition: { unmountOnExit: true } }}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography
                fontWeight="bold"
                color={expanded === clave ? 'primary.main' : 'text.primary'}
              >
                📅 {prettyName(dia)} {fechaFormateada ? `- ${fechaFormateada}` : ''}
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              {!estaHabilitado ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  🚫 El día {prettyName(dia)} está deshabilitado para pedidos.
                </Alert>
              ) : (
                <>
                  {platosFijos.length === 0 && platosEspeciales.length === 0 ? (
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      🚧 Aún no hay platos cargados para este día.
                    </Typography>
                  ) : (
                    <UnifiedDayMenuGallery
                        day={clave}
                      fecha={diaData.fecha}
                      fijos={platosFijos}
                      especiales={platosEspeciales}
                      extras={extras}
                     selected={seleccionDia}
  onChange={(seleccion) => handleSelectCambio(clave, seleccion)}
                      semanaCerrada={semanaCerrada}
                      disabled={!estaHabilitado}
                    />
                  )}

<ExtrasSection
dia={dia}   // ✅ sólo "jueves"
   selected={selecciones?.[clave] || {}}
   onSelect={(nuevoSeleccionDia) => handleSelectCambio(clave, nuevoSeleccionDia)}
   semanaCerrada={semanaCerrada}
   disabled={!estaHabilitado}
/>




                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => {
                      if (diasVisibles.indexOf(clave) === diasVisibles.length - 1) {
                        const target = document.getElementById('confirmar-pedido-btn');
                        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      } else {
                        avanzarAlSiguienteDia(clave);
                      }
                    }}
                  >
                    👉 {diasVisibles.indexOf(clave) === diasVisibles.length - 1
                      ? 'Ir a Confirmar Pedido'
                      : 'Siguiente día'}
                  </Button>
                </>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default AccordionMenuContainer;
