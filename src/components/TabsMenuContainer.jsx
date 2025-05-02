// src/components/TabsMenuContainer.jsx
import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import DayMenuCard from './DayMenuCard';

const diasOrdenados = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

const capitalizar = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const TabsMenuContainer = ({ menuData, selecciones, onSelect }) => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_, newValue) => {
    setTabIndex(newValue);
  };

  const diaActual = diasOrdenados[tabIndex];
  const platosDelDia = menuData[diaActual] || [];

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label="Seleccionar día de la semana"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 2
        }}
      >
        {diasOrdenados.map((dia, index) => (
          <Tab
            key={dia}
            label={capitalizar(dia)}
            id={`tab-${index}`}
            aria-controls={`tabpanel-${index}`}
          />
        ))}
      </Tabs>

      <DayMenuCard
        day={diaActual}
        options={platosDelDia}
        selected={selecciones[diaActual] || {}}
        onSelect={onSelect}
      />
    </Box>
  );
};

export default TabsMenuContainer;
