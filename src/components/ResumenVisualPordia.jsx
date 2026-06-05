import { Box, Typography, Card, Grid, Chip, Avatar, Divider, Badge } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';

const extraMap = {
  "1": "🍰 Postre",
  "2": "🥗 Ensalada",
  "3": "💪 Proteína",
  "ID:1": "🍰 Postre",
  "ID:2": "🥗 Ensalada",
  "ID:3": "💪 Proteína"
};

const ResumenVisualPorDia = ({ pedidos }) => {
  if (!Array.isArray(pedidos) || pedidos.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 4, bgcolor: '#f8fafc', borderRadius: 4, border: '1px dashed #cbd5e1' }}>
        <Typography color="text.secondary">No hay pedidos registrados para este día.</Typography>
      </Box>
    );
  }

  const agrupado = {};

  pedidos.forEach(p => {
    // Procesar Platos
    p.platos?.forEach(plato => {
      const nombre = plato.nombre;
      if (!agrupado[nombre]) agrupado[nombre] = {};
      agrupado[nombre][p.nombreCompleto] = (agrupado[nombre][p.nombreCompleto] || 0) + plato.cantidad;
    });
    // Procesar Extras
    p.extras?.forEach(extra => {
      const extraNameId = extra.nombre?.replace?.(/^ID:/, '') || extra.nombre;
      const nombreMostrado = extraMap[extra.nombre] || extraMap[extraNameId] || `Extra ${extraNameId}`;
      if (!agrupado[nombreMostrado]) agrupado[nombreMostrado] = {};
      agrupado[nombreMostrado][p.nombreCompleto] = (agrupado[nombreMostrado][p.nombreCompleto] || 0) + extra.cantidad;
    });
    // Procesar Tartas
    p.tartas?.forEach(tarta => {
      const nombreMostrado = `🥧 ${tarta.nombre}`;
      if (!agrupado[nombreMostrado]) agrupado[nombreMostrado] = {};
      agrupado[nombreMostrado][p.nombreCompleto] = (agrupado[nombreMostrado][p.nombreCompleto] || 0) + tarta.cantidad;
    });
  });

  const platosKeys = Object.keys(agrupado).sort();

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <RestaurantIcon color="primary" /> Resumen de Cocina
      </Typography>
      <Grid container spacing={3}>
        {platosKeys.map(plato => {
          const clientes = agrupado[plato];
          const totalCantidad = Object.values(clientes).reduce((a, b) => a + b, 0);

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={plato}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                borderTop: '4px solid #3b82f6',
                borderRadius: 2
              }}>
                <Box sx={{ p: 2, bgcolor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2, pr: 2, wordBreak: 'break-word' }}>
                    {plato.replace('Plato ', 'Plato ')}
                  </Typography>
                  <Chip 
                    label={totalCantidad} 
                    color="primary" 
                    size="small" 
                    sx={{ fontWeight: 'bold', fontSize: '1rem', height: 28, minWidth: 28 }} 
                  />
                </Box>
                <Divider />
                <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {Object.entries(clientes).map(([cliente, cant]) => (
                    <Box key={cliente} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: '#e2e8f0', color: '#475569' }}>
                          {cliente.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 140 }}>
                          {cliente}
                        </Typography>
                      </Box>
                      {cant > 1 && (
                        <Typography variant="body2" fontWeight="bold" color="text.primary">
                          x{cant}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ResumenVisualPorDia;
