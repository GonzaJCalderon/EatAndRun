import React, { useMemo } from 'react';
import { Typography, Box, Button, Divider } from '@mui/material';
import { tartaLabelMap } from './TartaGallery';

const ResumenFinal = ({
  resumenDias,
  total,
  metodoPago,
  observaciones,
  tartasSeleccionadas = {},
  precios = { plato: 6300, envio: 900, tarta: 13500 },
  extrasDetalle = {},
  onEditar,
  onConfirmarFinal
}) => {
  const tartasMostradas = Object.entries(tartasSeleccionadas).filter(([_, cantidad]) => cantidad > 0);
  const totalTartas = tartasMostradas.reduce((sum, [_, cant]) => sum + cant, 0);
  const subtotalTartas = totalTartas * precios.tarta;

  const totalDiasConPlato = resumenDias.filter(({ resumen }) =>
    resumen && !resumen.startsWith('❌')
  ).length;
  const subtotalEnvio = totalDiasConPlato * precios.envio;

  // ✅ Nuevo: usamos useMemo para recalcular correctamente los extras
  const extraList = useMemo(() => {
    return Object.entries(extrasDetalle)
      .flatMap(([dia, extras]) =>
        Object.entries(extras).map(([nombre, obj]) => ({
          dia,
          nombre,
          cantidad: obj.cantidad,
          precio: obj.precio || 0
        }))
      );
  }, [extrasDetalle]);

  const subtotalExtras = extraList.reduce((sum, e) => sum + e.precio * e.cantidad, 0);
  const subtotalPlatos = total - subtotalTartas - subtotalEnvio - subtotalExtras;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>📋 Resumen del Pedido</Typography>

      {resumenDias.map(({ dia, resumen }) => (
        <Typography key={dia} sx={{ mb: 1 }}>
          📅 <strong>{dia.charAt(0).toUpperCase() + dia.slice(1)}:</strong> {resumen}
        </Typography>
      ))}

      {tartasMostradas.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>🥧 Tartas seleccionadas</Typography>
          {tartasMostradas.map(([tipo, cantidad]) => (
            <Typography key={tipo} sx={{ ml: 2 }}>
              🥧 {cantidad} x <strong>{tartaLabelMap[tipo] || tipo}</strong> — ${(
                cantidad * precios.tarta
              ).toLocaleString('es-AR')}
            </Typography>
          ))}
        </>
      )}

      {extraList.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>🧂 Extras</Typography>
          {extraList.map(({ dia, nombre, cantidad, precio }, i) => (
            <Typography key={i} sx={{ ml: 2 }}>
              ➕ {cantidad} x <strong>{nombre}</strong> ({dia}) — ${(
                cantidad * precio
              ).toLocaleString('es-AR')}
            </Typography>
          ))}
        </>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom>🧮 Desglose del Total:</Typography>
      <Typography sx={{ ml: 2 }}>🍽️ Platos: ${subtotalPlatos.toLocaleString('es-AR')}</Typography>
      <Typography sx={{ ml: 2 }}>🧂 Extras: ${subtotalExtras.toLocaleString('es-AR')}</Typography>
      <Typography sx={{ ml: 2 }}>🚚 Envío: ${subtotalEnvio.toLocaleString('es-AR')}</Typography>
      <Typography sx={{ ml: 2 }}>🥧 Tartas: ${subtotalTartas.toLocaleString('es-AR')}</Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="body1"><strong>Observaciones:</strong> {observaciones || 'Ninguna'}</Typography>
      <Typography variant="body1" sx={{ mt: 1 }}><strong>Método de pago:</strong> {metodoPago || 'No especificado'}</Typography>

      <Typography variant="h6" sx={{ mt: 2 }}>
        💰 Total Final: <strong>${total.toLocaleString('es-AR')}</strong>
      </Typography>

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button variant="outlined" fullWidth onClick={onEditar}>⬅️ Editar</Button>
        <Button variant="contained" color="success" fullWidth onClick={onConfirmarFinal}>
          ✅ Confirmar Pedido
        </Button>
      </Box>
    </Box>
  );
};

export default ResumenFinal;
