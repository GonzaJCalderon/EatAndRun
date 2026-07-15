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
    <div className="pub-page" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm">
        <Typography variant="h4" fontWeight="800" gutterBottom sx={{ color: '#0f1a0d' }}>
          🔑 Nueva contraseña
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: '#5a6557' }}>
          Ingresá tu nueva contraseña para acceder a tu cuenta.
        </Typography>
        <TextField
          fullWidth
          label="Nueva contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          onClick={handleSubmit}
          fullWidth
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
          }}
        >
          Guardar nueva contraseña
        </Button>
      </Container>
    </div>
  );
};

export default ResetPassword;
