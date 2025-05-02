import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputLabel,
  Button
} from '@mui/material';

const PagoSection = ({ onExtrasChange, onMetodoPagoChange, onComprobanteChange, metodoPago }) => {
  const [extras, setExtras] = useState('');
  const [archivo, setArchivo] = useState(null);

  const handleExtras = (e) => {
    setExtras(e.target.value);
    onExtrasChange(e.target.value);
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
        💵 ¿CUÁNTO PAGAR?
      </Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-line', fontSize: 14, color: '#333' }}>
        {`
Info sobre los planes y sus respectivos valores:

Básico Almuerzo $6300 + envío $900 = $7.200

Almuerzo x2 días + envío $12.600 + $1800
Almuerzo x3 días + envío $18.900 + $2700
Almuerzo x4 días + envío $25.200 + $3600
Pack 5 días
*Almuerzo x5 días + envío $34.500*

Costo envío diario $900.
Precio postre $2.800 c/u

Extras Fit - colaciones
- Ensalada de frutas $2800
- Extra proteínas $3500 = 100 gr

Tarta 8 porciones $13.500
Opciones: ACELGA, JyQ, CAPRESSE, POLLO, VERDURAS
`}
      </Typography>

      <TextField
        label="Extras o tartas (opcional)"
        multiline
        fullWidth
        rows={3}
        value={extras}
        onChange={handleExtras}
        sx={{ mt: 2 }}
      />

      <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
        💳 ¿Cómo pagás?
      </Typography>
      <RadioGroup value={metodoPago} onChange={handleMetodoPago} row>
        <FormControlLabel value="transferencia" control={<Radio />} label="Transferencia" />
        <FormControlLabel value="efectivo" control={<Radio />} label="Efectivo" />
      </RadioGroup>

      {metodoPago === 'transferencia' && (
        <>
          <Box sx={{ mt: 2, backgroundColor: '#e0f7fa', p: 2, borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Banco Santander
            </Typography>
            <Typography variant="body2">CBU: <strong>072006878000038359572</strong></Typography>
            <Typography variant="body2">Alias: <strong>MOLINAGUERRA</strong></Typography>
            <Typography variant="body2">
              Titular: <strong>Molina Guerra Matías Mauricio</strong>
            </Typography>
            <Typography variant="body2">
              Cuenta: <strong>068-383595/7</strong> - DNI: <strong>32224452</strong>
            </Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            <InputLabel sx={{ mb: 1 }}>📎 Subí tu comprobante (PDF o imagen)</InputLabel>
            <input type="file" accept="image/*,application/pdf" onChange={handleArchivo} />
            {archivo && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Archivo cargado: {archivo.name}
              </Typography>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default PagoSection;
