import React, { useState, useRef, useEffect } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Button,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UnifiedDayMenuGallery from './UnifiedDayMenuGallery';
import ExtrasSection from './ExtrasSection';
import dayjs from '../utils/day'; // o tu ruta real

const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

const prettyName = (key) => key.charAt(0).toUpperCase() + key.slice(1);

// 🔠 Ordenar por fecha y luego por nombre
const ordenarPlatos = (a, b) => {
  const fechaA = new Date(a.date);
  const fechaB = new Date(b.date);
  if (fechaA < fechaB) return -1;
  if (fechaA > fechaB) return 1;
  return (a.nombre || '').localeCompare(b.nombre || '');
};

const AccordionMenuContainer = ({
  menuData = {},
  selecciones = {},
  onSelect,
  diasHabilitados = {},
  semanaCerrada = false
}) => {
  const [expanded, setExpanded] = useState(null);
  const accordionRefs = useRef({});
  const nextScrollTarget = useRef(null);
  const hasScrolled = useRef(false);

useEffect(() => {
  if (hasScrolled.current || expanded) return;
  const primeroHabilitado = diasSemana.find((dia) => diasHabilitados[dia]);
  if (primeroHabilitado) {
    setExpanded(primeroHabilitado);
    hasScrolled.current = true;
  }
}, []); // ⬅️ eliminá diasHabilitados como dependencia


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

  useEffect(() => {
  if (menuData.viernes && menuData.viernes.especiales.length === 0) {
    console.warn("⚠️ El viernes no tiene menú especial cargado.");
  }
}, [menuData]);


  const avanzarAlSiguienteDia = (diaActual) => {
    const idx = diasSemana.indexOf(diaActual);
    const siguiente = diasSemana.slice(idx + 1).find((d) => diasHabilitados[d]);
    if (!siguiente) return;
    nextScrollTarget.current = siguiente;
    setExpanded(siguiente);
  };

  const handleSelectCambio = (dia, nuevaSeleccion) => {
  if (typeof onSelect !== 'function') return;
  const nuevoEstado = {
    ...selecciones,
    [dia]: nuevaSeleccion
  };
  onSelect(nuevoEstado);
};


  const toggleAccordion = (dia) => {
    setExpanded((prev) => (prev === dia ? null : dia));
  };
  useEffect(() => {
  console.log("🧭 Días habilitados:", diasHabilitados);
  console.log("📆 Día expandido:", expanded);
}, [expanded, diasHabilitados]);


  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      {diasSemana.map((dia) => {
        const estaHabilitado = diasHabilitados?.[dia] === true;
        const diaData = menuData?.[dia] || {};

        // 🧠 APLICAMOS ORDENAMIENTO
        const platosFijos = [...(diaData.fijos || [])].sort(ordenarPlatos);
        const platosEspeciales = [...(diaData.especiales || [])].sort(ordenarPlatos);

        const seleccionDia = selecciones?.[dia] || {};

        return (
          <Accordion
            key={dia}
            expanded={expanded === dia}
            onChange={() => toggleAccordion(dia)}
            ref={(el) => (accordionRefs.current[dia] = el)}
            disableGutters
            slotProps={{ transition: { unmountOnExit: true } }}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              {(() => {
  const platos = [...platosFijos, ...platosEspeciales];
  const primeraFecha = platos[0]?.date;
  const fechaFormateada = primeraFecha
    ? dayjs(primeraFecha).format('DD/MM')
    : null;

  return (
    <Typography
      fontWeight="bold"
      color={expanded === dia ? 'primary.main' : 'text.primary'}
    >
      📅 {prettyName(dia)} {fechaFormateada ? `- ${fechaFormateada}` : ''}
    </Typography>
  );
})()}

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
                      day={dia}
                      fijos={platosFijos}
                      especiales={platosEspeciales}
                      selected={seleccionDia}
                      onChange={(seleccion) => handleSelectCambio(dia, seleccion)}
                      semanaCerrada={semanaCerrada}
                      disabled={!estaHabilitado}
                    />
                  )}

                  <ExtrasSection
                    dia={dia}
                    selectedGlobal={selecciones}
                    onSelect={onSelect}
                    semanaCerrada={semanaCerrada}
                    disabled={!estaHabilitado}
                  />

                  {dia === 'viernes' ? (
                    <Button
                      variant="outlined"
                      color="info"
                      fullWidth
                      onClick={() => {
                        const target = document.getElementById('confirmar-pedido-btn');
                        if (target) {
                          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }}
                      sx={{ mt: 2 }}
                    >
                      👉 Ir a Confirmar Pedido
                    </Button>
                  ) : (
                   <Button
  variant="outlined"
  fullWidth
  sx={{ mt: 2 }}
  onClick={() => {
    console.log("🧭 Click en Siguiente Día desde:", dia);
    console.log("⛔ semanaCerrada:", semanaCerrada);
    avanzarAlSiguienteDia(dia);
  }}
  disabled={false} // <--- ⚠️ DESACTIVALO PARA TESTEAR
>
  👉 Siguiente día
</Button>

                  )}
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
