import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PedidoConfirmado = ({ modoEdicion = false }) => {

  const navigate = useNavigate();

  return (
    <Box sx={{ mt: 8, textAlign: 'center' }}>
     <Typography variant="h5" color="success.main" fontWeight="bold" gutterBottom>
  {modoEdicion
    ? '💾 Cambios guardados correctamente'
    : '✅ ¡Tu pedido fue registrado exitosamente!'}
</Typography>

<Typography variant="body1" sx={{ mb: 4 }}>
  {modoEdicion
    ? 'El pedido fue actualizado y ya refleja los cambios.'
    : 'Gracias por tu compra. ¡Muy pronto lo vas a recibir! 😊'}
</Typography>


      <Button
        variant="contained"
        color="primary"
        sx={{ px: 4, py: 1.5 }}
     onClick={() => navigate('/app')}
// 👈 O la ruta donde se inicia un nuevo pedido
      >
        🛒 Hacer otro pedido
      </Button>
    </Box>
  );
};

export default PedidoConfirmado;
