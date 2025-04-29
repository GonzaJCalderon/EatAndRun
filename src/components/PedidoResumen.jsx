import { Box, Typography, Divider } from '@mui/material';

const PedidoResumen = ({ pedido }) => {
  if (!pedido || Object.keys(pedido).length === 0) {
    return <Typography color="text.secondary">No seleccionaste ningún plato aún.</Typography>;
  }

  return (
    <Box sx={{ mt: 3 }}>
      {Object.entries(pedido).map(([dia, platos], idx) => (
        <Box key={idx} sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, color: '#1e88e5', fontWeight: 'bold' }}>
            📅 {dia.toUpperCase()}
          </Typography>
          <Divider sx={{ mb: 1 }} />
          {Object.entries(platos).map(([platoKey, datos], i) => {
            const nombreMostrar = datos?.nombreOriginal || platoKey;
            const cantidadMostrar = typeof datos === 'object' ? datos.cantidad ?? 0 : datos;
            return (
              <Typography
                key={i}
                variant="body1"
                sx={{ ml: 2, mb: 0.5, fontSize: '0.95rem' }}
              >
                🍽️ {nombreMostrar} — <strong>{cantidadMostrar}</strong> unidad{cantidadMostrar > 1 ? 'es' : ''}
              </Typography>
            );
          })}
        </Box>
      ))}
    </Box>
  );
};

export default PedidoResumen;
