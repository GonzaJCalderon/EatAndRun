// src/pages/ResetPassword.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, TextField, Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import api from '../api/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    try {
      await api.post('/auth/reset-password', { token, password });
      enqueueSnackbar('✅ Contraseña actualizada correctamente', { variant: 'success' });
      navigate('/login');
    } catch (err) {
      enqueueSnackbar('❌ Token inválido o expirado', { variant: 'error' });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h5" gutterBottom>🔑 Nueva contraseña</Typography>
      <TextField
        fullWidth
        label="Nueva contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleSubmit} fullWidth>
        Guardar nueva contraseña
      </Button>
    </Container>
  );
};

export default ResetPassword;
