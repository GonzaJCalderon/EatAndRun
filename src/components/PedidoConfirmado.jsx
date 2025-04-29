import { Box, Typography, Divider } from '@mui/material';

const PedidoConfirmado = ({ pedido }) => {
  if (!pedido || Object.keys(pedido).length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
        No hay platos seleccionados para mostrar.
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" color="success.main" fontWeight="bold" textAlign="center" gutterBottom>
        ✅ ¡Tu pedido fue registrado exitosamente!
      </Typography>

      <Typography variant="body1" textAlign="center" sx={{ mb: 3 }}>
        Este es el resumen de lo que vas a recibir:
      </Typography>

      {Object.entries(pedido).map(([dia, platos], idx) => (
        <Box key={idx} sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 1, color: '#1976d2', fontWeight: 'bold' }}>
            📅 {dia.toUpperCase()}
          </Typography>
          <Divider sx={{ mb: 1 }} />

          {Object.entries(platos).map(([platoKey, datos], index) => {
            const nombreMostrar = datos?.nombreOriginal || platoKey;
            const cantidadMostrar = typeof datos === 'object' ? datos?.cantidad ?? 0 : datos;

            return (
              <Typography
                key={index}
                variant="body2"
                sx={{ ml: 2, mb: 0.5, fontSize: '1rem' }}
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

export default PedidoConfirmado;
