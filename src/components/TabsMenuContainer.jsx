// src/components/TabsMenuContainer.jsx
import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import UnifiedDayMenuGallery from './UnifiedDayMenuGallery';
import ExtrasSection from './ExtrasSection';

const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

const prettyName = (key) => key?.charAt(0).toUpperCase() + key.slice(1);

const TabsMenuContainer = ({ menuData, selecciones, onSelect }) => {
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
            {diasDisponibles.map((dia, i) => (
              <Tab key={dia} label={prettyName(dia)} id={`tab-${i}`} />
            ))}
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
            />
          </motion.div>

          <ExtrasSection
            dia={diaActual}
            selectedGlobal={selecciones}
            onSelect={onSelect}
          />
        </>
      )}
    </Box>
  );
};

export default TabsMenuContainer;
