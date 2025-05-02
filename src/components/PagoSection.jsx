import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputLabel,
  Button,
  Paper
} from '@mui/material';

const PagoSection = ({ onExtrasChange, onMetodoPagoChange, onComprobanteChange, metodoPago }) => {
  const [extras, setExtras] = useState('');
  const [archivo, setArchivo] = useState(null);

  const handleExtras = (e) => {
    const value = e.target.value;
    setExtras(value);
    onExtrasChange(value);
  };

  const handleMetodoPago = (e) => {
    onMetodoPagoChange(e.target.value);
  };

  const handleArchivo = (e) => {
    const file = e.target.files[0];
    setArchivo(file);
    onComprobanteChange(file);
  };

  return (
    <Box sx={{ mt: 5, background: '#f2fef5', borderRadius: 3, p: 3 }}>
      <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ mb: 2 }}>
        💰 ¿CUÁNTO PAGAR?
      </Typography>

      <Paper elevation={1} sx={{ p: 2, backgroundColor: '#ffffff', mb: 2 }}>
        <Typography variant="body2" sx={{ color: '#333', fontSize: 14 }}>
          <strong>🍱 Planes semanales:</strong><br />
          - 1 día: $6300 + 🚚 envío $900 = <strong>$7200</strong><br />
          - 2 días: $12600 + envío $1800 = <strong>$14400</strong><br />
          - 3 días: $18900 + envío $2700 = <strong>$21600</strong><br />
          - 4 días: $25200 + envío $3600 = <strong>$28800</strong><br />
          - 5 días: <strong>$34500 (con envío)</strong><br />
          <br />
          <strong>🍰 Extras:</strong><br />
          - Postre: $2800<br />
          - Ensalada de frutas: $2800<br />
          - Extra proteína (100g): $3500<br />
          <br />
          <strong>🥧 Tartas (8 porciones):</strong> $13500<br />
          Opciones: Acelga, JyQ, Capresse, Pollo, Verduras
        </Typography>
      </Paper>

      <TextField
        label="Extras o tartas (opcional)"
        placeholder="Ej: 1 postre, 1 ensalada de frutas, tarta JyQ"
        multiline
        fullWidth
        rows={3}
        value={extras}
        onChange={handleExtras}
        sx={{ mt: 2 }}
      />

      <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
        💳 ¿Cómo vas a pagar?
      </Typography>
      <RadioGroup value={metodoPago} onChange={handleMetodoPago} row>
        <FormControlLabel value="transferencia" control={<Radio />} label="Transferencia" />
        <FormControlLabel value="efectivo" control={<Radio />} label="Efectivo" />
      </RadioGroup>

      {metodoPago === 'transferencia' && (
        <Box sx={{ mt: 3 }}>
          <InputLabel sx={{ mb: 1, fontWeight: 'bold' }}>📎 Subí el comprobante de pago</InputLabel>
          <Button
            component="label"
            variant="outlined"
            color="success"
            fullWidth
            sx={{ mb: 1 }}
          >
            Seleccionar archivo
            <input
              type="file"
              hidden
              accept="image/*,application/pdf"
              onChange={handleArchivo}
            />
          </Button>

          {archivo && (
            <Typography variant="body2" color="text.secondary">
              Archivo cargado: <strong>{archivo.name}</strong>
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default PagoSection;
