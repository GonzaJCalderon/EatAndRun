import React, { useMemo } from 'react';
import {
  Typography,
  Box,
  Button,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputLabel,
  CircularProgress
} from '@mui/material';

import { tartaLabelMap } from '../utils/tartaUtils';
import CopyText from './CopyText';
import { usePreciosCompletos } from '../hooks/usePreciosCompletos';

const ResumenFinal = ({
   loading,
precios, 
  resumenDias,
  descuento = 0,
  metodoPago,
  observaciones,
  tartasSeleccionadas = {},
  extrasDetalle = {},
  comprobante,
  onComprobanteChange,
  onMetodoPagoChange,
  onEditar,
  onConfirmarFinal,
  isEmpresa = false,
  subtotalPlatos = 0,
  subtotalExtras = 0,
  subtotalEnvio = 0,
  subtotalTartas = 0,
  guardando = false
}) => {

  if (loading || !precios) {
    return <Box sx={{ textAlign: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  const totalFinal = subtotalPlatos + subtotalExtras + subtotalEnvio + subtotalTartas - descuento;

  const tartasMostradas = Object.entries(tartasSeleccionadas).filter(([_, cantidad]) => cantidad > 0);

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

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>📋 Resumen del Pedido</Typography>

      {resumenDias.map(({ dia, resumen }, idx) => (
        typeof dia === 'string' && (
          <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
            📅 <strong>{dia.charAt(0).toUpperCase() + dia.slice(1)}:</strong> {resumen}
          </Typography>
        )
      ))}

      {tartasMostradas.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1">🥧 Tartas seleccionadas</Typography>
          {tartasMostradas.map(([tipo, cantidad]) => (
            <Typography key={tipo} sx={{ ml: 2 }}>
              🥧 {cantidad} x <strong>{tartaLabelMap[tipo] || tipo}</strong>
              {!isEmpresa && ` — $${(cantidad * precios.tarta).toLocaleString('es-AR')}`}
            </Typography>
          ))}
        </>
      )}

      {extraList.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1">🧂 Extras</Typography>
          {extraList.map(({ dia, nombre, cantidad, precio }, i) => (
            <Typography key={i} sx={{ ml: 2 }}>
              ➕ {cantidad} x <strong>{nombre?.charAt(0).toUpperCase() + nombre.slice(1)}</strong> ({dia})
              {!isEmpresa && ` — $${(cantidad * precio).toLocaleString('es-AR')}`}
            </Typography>
          ))}
        </>
      )}

      {!isEmpresa && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1">🧮 Desglose del Total:</Typography>
          <Typography sx={{ ml: 2 }}>🍽️ Platos: ${subtotalPlatos.toLocaleString('es-AR')}</Typography>
          <Typography sx={{ ml: 2 }}>🧂 Extras: ${subtotalExtras.toLocaleString('es-AR')}</Typography>
          <Typography sx={{ ml: 2 }}>🚚 Envío: ${subtotalEnvio.toLocaleString('es-AR')}</Typography>
          <Typography sx={{ ml: 2 }}>🥧 Tartas: ${subtotalTartas.toLocaleString('es-AR')}</Typography>

          {descuento > 0 && (
            <Typography sx={{ ml: 2, mt: 1, color: 'green', fontWeight: 'bold' }}>
              🎉 Descuento por superar {precios.umbral_descuento} platos
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            💰 Total Final: <strong>${totalFinal.toLocaleString('es-AR')}</strong>
          </Typography>
        </>
      )}

      <Typography variant="body1" sx={{ mt: 2 }}>
        <strong>Observaciones:</strong> {observaciones || 'Ninguna'}
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* 💳 MÉTODO DE PAGO */}
      <Typography variant="h6" sx={{ mb: 1 }}>
        💳 ¿Cómo vas a pagar?
      </Typography>
      <RadioGroup value={metodoPago} onChange={(e) => onMetodoPagoChange(e.target.value)} row>
        <FormControlLabel value="transferencia" control={<Radio />} label="Transferencia" />
        <FormControlLabel value="efectivo" control={<Radio />} label="Efectivo" />
      </RadioGroup>

      {metodoPago === 'transferencia' && (
        <>
          <Box
            sx={{
              backgroundColor: '#f4f6f8',
              mt: 3,
              mb: 3,
              p: 2,
              border: '1px dashed #999',
              borderRadius: 2
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              🏦 Datos para Transferencia
            </Typography>
            <Typography variant="body2">Banco: <strong>Santander</strong></Typography>
            <Typography variant="body2">Tipo de cuenta: <strong>Caja de Ahorro en Pesos</strong></Typography>
            <Typography variant="body2">Titular: <strong>Molina Guerra Matias Mauricio</strong></Typography>
            <Typography variant="body2">DNI: <strong>32224452</strong></Typography>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <strong>CBU:</strong> 0720068788000038359572 <CopyText text="0720068788000038359572" />
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <strong>Alias:</strong> MOLINAGUERRA <CopyText text="MOLINAGUERRA" />
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 3, p: 2, backgroundColor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
            <InputLabel sx={{ mb: 1, fontWeight: 'bold', color: '#166534' }}>📎 Ya transferí, subo mi comprobante:</InputLabel>
            <Button component="label" variant="contained" color="success" fullWidth sx={{ mb: 1 }}>
              Seleccionar archivo
              <input
                type="file"
                hidden
                accept="image/jpeg,image/png,image/jpg"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file && ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                    onComprobanteChange(file);
                  } else {
                    alert('❌ Solo se permiten imágenes JPG o PNG');
                    onComprobanteChange(null);
                  }
                }}
              />
            </Button>

            {comprobante && (
              <Typography variant="body2" sx={{ mt: 1, color: '#15803d', fontWeight: 'bold' }}>
                ✅ Archivo cargado: {comprobante.name}
              </Typography>
            )}
          </Box>
        </>
      )}

      {/* ACCIONES */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button variant="outlined" fullWidth onClick={onEditar} disabled={guardando}>
          ⬅️ Editar
        </Button>
        <Button
          variant="contained"
          color="success"
          fullWidth
          onClick={onConfirmarFinal}
          disabled={guardando}
        >
          {guardando ? 'Guardando...' : '✅ Confirmar Pedido'}
        </Button>
      </Box>
    </Box>
  );
};

export default ResumenFinal;
