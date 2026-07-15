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
    <div className="pub-page" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm">
        <Typography variant="h4" fontWeight="800" gutterBottom sx={{ color: '#0f1a0d' }}>
          🔒 Recuperar contraseña
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: '#5a6557' }}>
          Ingresá tu correo electrónico para recibir un enlace de restablecimiento.
        </Typography>
        <TextField
          fullWidth
          label="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              '&.Mui-focused fieldset': { borderColor: '#4a7c42' },
            },
            '& .MuiInputLabel-root.Mui-focused': { color: '#4a7c42' },
          }}
        />
        <Button
          variant="contained"
          onClick={handleEnviar}
          fullWidth
          disabled={enviado}
          sx={{
            py: 1.5,
            fontSize: '1rem',
            fontWeight: '700',
            borderRadius: '24px',
            backgroundColor: '#4a7c42',
            boxShadow: 'none',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#3a6832',
              boxShadow: 'none',
            },
            '&.Mui-disabled': {
              backgroundColor: '#e0e0e0',
              color: '#9e9e9e'
            }
          }}
        >
          {enviado ? 'Enlace enviado' : 'Enviar enlace'}
        </Button>
      </Container>
    </div>
  );
};

export default RecuperarClave;
