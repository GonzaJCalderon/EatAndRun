import { useState } from 'react';
import {
  Tabs,
  Tab,
  Box,
  Typography
} from '@mui/material';
import DayMenuCard from './DayMenuCard';

const diasOrden = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

const TabsMenuContainer = ({ menuData, selecciones, onSelect }) => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (e, newIndex) => {
    setTabIndex(newIndex);
  };

  const diaActual = diasOrden[tabIndex];
  const platosActuales = menuData[diaActual] || [];

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        {diasOrden.map((dia, index) => (
          <Tab key={dia} label={dia.toUpperCase()} />
        ))}
      </Tabs>

      <DayMenuCard
        day={diaActual}
        options={platosActuales}
        selected={selecciones[diaActual] || {}}
        onSelect={onSelect}
      />
    </Box>
  );
};

export default TabsMenuContainer;
