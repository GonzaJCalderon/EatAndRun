import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PedidoConfirmado = () => {
  const navigate = useNavigate();

  const handleNuevoPedido = () => {
    navigate('/nuevo-pedido'); // Asegurate que esta ruta es la correcta en tu app
  };

  return (
    <Box sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h5" color="success.main" fontWeight="bold" gutterBottom>
        ✅ ¡Tu pedido fue registrado exitosamente!
      </Typography>

      <Typography variant="body1" sx={{ mb: 4 }}>
        Gracias por tu compra. ¡Muy pronto lo vas a recibir!
      </Typography>

      {/* <Button
        variant="contained"
        color="primary"
        onClick={handleNuevoPedido}
        sx={{ px: 4, py: 1.5 }}
      >
        Hacer otro pedido
      </Button> */}
    </Box>
  );
};

export default PedidoConfirmado;
