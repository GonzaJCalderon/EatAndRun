// src/pages/RecuperarClave.jsx
import { useState } from 'react';
import { Container, Typography, TextField, Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import api from '../api/api';

const RecuperarClave = () => {
  const [email, setEmail] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const [enviado, setEnviado] = useState(false);

  const handleEnviar = async () => {
    try {
      await api.post('/auth/forgot-password', { email });
      enqueueSnackbar('📩 Si el email está registrado, se envió un link para restablecer la contraseña.', { variant: 'info' });
      setEnviado(true);
    } catch (err) {
      enqueueSnackbar('❌ Error al enviar solicitud', { variant: 'error' });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h5" gutterBottom>🔒 Recuperar contraseña</Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>
        Ingresá tu correo electrónico para recibir un enlace de restablecimiento.
      </Typography>
      <TextField
        fullWidth
        label="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleEnviar} fullWidth disabled={enviado}>
        Enviar enlace
      </Button>
    </Container>
  );
};

export default RecuperarClave;
