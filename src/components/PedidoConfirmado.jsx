import { Box, Typography, Divider } from '@mui/material';

// Mapeo de tartas
const TARTA_LABELS = {
  jamonqueso: { label: 'Tarta de Jamón y Queso', icon: '🥧', precio: 13500 },
  verduras: { label: 'Tarta de Verduras', icon: '🥬', precio: 13500 }
};

// Mapeo de extras
const EXTRAS_LABELS = {
  'extra-postre': { label: 'Postre', icon: '🍰', precio: 2800 },
  'extra-ensalada': { label: 'Ensalada', icon: '🥗', precio: 2800 },
  'extra-proteina': { label: 'Proteína', icon: '💪', precio: 3500 }
};

const PedidoConfirmado = ({ pedido, tartas = {} }) => {
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

      {/* Sección por día */}
      {Object.entries(pedido).map(([dia, platos], idx) => (
        <Box key={idx} sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 1, color: '#1976d2', fontWeight: 'bold' }}>
            📅 {dia.toUpperCase()}
          </Typography>
          <Divider sx={{ mb: 1 }} />

          {Object.entries(platos).map(([key, datos], i) => {
            const cantidad = datos?.cantidad || 0;
            const tipo = datos?.tipo;
            const nombre = datos?.nombreOriginal || key;

            // Si es un extra, buscamos su precio
            const extraInfo = tipo === 'extra' ? EXTRAS_LABELS[key] : null;
            const precioUnitario = extraInfo?.precio || 6300; // platos normales por defecto

            const icon = extraInfo?.icon || '🍽️';

            return (
              <Typography key={i} variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                {icon} {extraInfo?.label || nombre} — <strong>{cantidad}</strong> unidad{cantidad > 1 ? 'es' : ''} (
                ${cantidad * precioUnitario})
              </Typography>
            );
          })}
        </Box>
      ))}

      {/* Sección Tartas */}
      {Object.keys(tartas).length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ color: '#ab47bc', fontWeight: 'bold' }}>
            🍰 Tartas Seleccionadas
          </Typography>
          <Divider sx={{ my: 1 }} />
          {Object.entries(tartas).map(([key, cantidad]) => {
            if (!cantidad) return null;
            const info = TARTA_LABELS[key];
            return (
              <Typography key={key} variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                {info?.icon || '🥧'} {info?.label || key} — <strong>{cantidad}</strong> unidad{cantidad > 1 ? 'es' : ''} (
                ${cantidad * (info?.precio || 13500)})
              </Typography>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default PedidoConfirmado;
