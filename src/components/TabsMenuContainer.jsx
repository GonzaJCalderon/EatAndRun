// src/components/TabsMenuContainer.jsx
import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import UnifiedDayMenuGallery from './UnifiedDayMenuGallery';
import ExtrasSection from './ExtrasSection';
import dayjs from '../utils/day';

const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

const prettyName = (key) => key?.charAt(0).toUpperCase() + key.slice(1);

const TabsMenuContainer = ({ menuData, selecciones, onSelect, onFinalizarDias, semanaCerrada }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [diasDisponibles, setDiasDisponibles] = useState([]);

  useEffect(() => {
    const diasConPlatos = diasSemana.filter(
      (dia) =>
        menuData[dia] &&
        (menuData[dia].fijos?.length > 0 || menuData[dia].especiales?.length > 0)
    );
    setDiasDisponibles(diasConPlatos);
    if (tabIndex >= diasConPlatos.length) setTabIndex(0);
  }, [menuData]);

  const diaActual = diasDisponibles[tabIndex];
  const platosFijos = menuData[diaActual]?.fijos || [];
  const platosEspeciales = menuData[diaActual]?.especiales || [];
  const seleccionDia = selecciones[diaActual] || {};

  const avanzarAlSiguienteDia = () => {
    if (tabIndex < diasDisponibles.length - 1) {
      setTabIndex((prev) => prev + 1);
    } else {
      // 👇 Cuando ya estamos en el último día y hay selección
      if (typeof onFinalizarDias === 'function') {
        onFinalizarDias();
      }
    }
  };

  const handleSelectCambio = (nuevaSeleccion) => {
    if (typeof onSelect === 'function') {
      const nuevoEstadoCompleto = {
        ...selecciones,
        [diaActual]: nuevaSeleccion
      };
      onSelect(nuevoEstadoCompleto);
    }
  };

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      {diasDisponibles.length === 0 ? (
        <Typography align="center" variant="body1" color="text.secondary">
          No hay platos disponibles esta semana.
        </Typography>
      ) : (
        <>
          <Tabs
            value={tabIndex}
            onChange={(_, newValue) => setTabIndex(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            {diasDisponibles.map((dia, i) => {
              const diaData = menuData[dia];
              const primeraFecha = diaData?.especiales?.[0]?.date || diaData?.fijos?.[0]?.date;
              const fechaFormateada = primeraFecha ? dayjs.utc(primeraFecha).format('DD/MM') : '';
              return (
                <Tab 
                  key={dia} 
                  label={`${prettyName(dia)} ${fechaFormateada ? `- ${fechaFormateada}` : ''}`} 
                  id={`tab-${i}`} 
                />
              );
            })}
          </Tabs>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <UnifiedDayMenuGallery
              day={diaActual}
              fijos={platosFijos}
              especiales={platosEspeciales}
              selected={seleccionDia}
              onChange={handleSelectCambio}
              disabled={semanaCerrada}
            />
          </motion.div>

          <ExtrasSection
            dia={diaActual}
            selectedGlobal={selecciones}
            onSelect={onSelect}
            disabled={semanaCerrada}
            semanaCerrada={semanaCerrada}
          />

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={avanzarAlSiguienteDia}
              sx={{ px: 4, py: 1.5, borderRadius: 8, textTransform: 'none', fontWeight: 'bold' }}
            >
              {tabIndex < diasDisponibles.length - 1 ? 'Siguiente Día ➔' : 'Ir a Confirmar Pedido ✓'}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};


export default TabsMenuContainer;
