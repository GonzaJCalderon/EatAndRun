import { useState, useEffect } from 'react';
import {
  Container, Typography, TextField, Button,
  CircularProgress, Box, Divider
} from '@mui/material';
import api from '../api/api';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom'; 

const PerfilUsuario = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    telefono: '',
    direccion_principal: '',
    direccion_alternativa: '',
    apellido: ''
  });

  const [passwordData, setPasswordData] = useState({
    actual: '',
    nueva: '',
    repetir: ''
  });

  const navigate = useNavigate();

const handleLogout = () => {
  localStorage.removeItem('authToken');
  navigate('/login');
};


  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const res = await api.get('/perfil/me');
        setPerfil(res.data);
        setFormData({
          email: res.data.email || '',
          telefono: res.data.telefono || '',
          direccion_principal: res.data.direccion_principal || '',
          direccion_alternativa: res.data.direccion_alternativa || '',
          apellido: res.data.apellido || ''
        });
      } catch (err) {
        enqueueSnackbar('ℹ️ Aún no tenés perfil, completá los campos y presioná guardar.', { variant: 'info' });
        setEditando(true);
      } finally {
        setCargando(false);
      }
    };

    fetchPerfil();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardar = async () => {
    try {
      const res = await api.put('/perfil/me', formData);
      enqueueSnackbar('✅ Perfil actualizado correctamente', { variant: 'success' });
      setPerfil(res.data.profile || res.data);
      setEditando(false);
    } catch (err) {
      console.error('❌ ERROR GUARDANDO PERFIL:', err.response?.data || err);
      enqueueSnackbar(`❌ Error al guardar perfil: ${err.response?.data?.error || 'desconocido'}`, { variant: 'error' });
    }
  };

  const handleChangePassword = async () => {
    const { actual, nueva, repetir } = passwordData;
    if (nueva !== repetir) {
      enqueueSnackbar('⚠️ Las contraseñas no coinciden', { variant: 'warning' });
      return;
    }

    try {
      await api.post('/auth/change-password', {
        actual,
        nueva
      });
      enqueueSnackbar('🔐 Contraseña actualizada con éxito', { variant: 'success' });
      setPasswordData({ actual: '', nueva: '', repetir: '' });
    } catch (err) {
      enqueueSnackbar('❌ Error al cambiar contraseña', { variant: 'error' });
    }
  };

  if (cargando) {
    return (
      <Container sx={{ mt: 6, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Cargando perfil...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
        👤 Mi Perfil
      </Typography>

      <TextField fullWidth label="Nombre" value={perfil?.name || ''} disabled sx={{ mb: 2 }} />
      <TextField fullWidth label="Apellido" name="apellido" value={formData.apellido} disabled sx={{ mb: 2 }} />

      <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} disabled={!editando} sx={{ mb: 2 }} />
      <TextField fullWidth label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} disabled={!editando} sx={{ mb: 2 }} />
      <TextField fullWidth label="Dirección principal" name="direccion_principal" value={formData.direccion_principal} onChange={handleChange} disabled={!editando} sx={{ mb: 2 }} />
      <TextField fullWidth label="Dirección alternativa" name="direccion_alternativa" value={formData.direccion_alternativa} onChange={handleChange} disabled={!editando} sx={{ mb: 3 }} />

      {editando ? (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" color="success" fullWidth onClick={handleGuardar}>💾 Guardar</Button>
          <Button variant="outlined" fullWidth onClick={() => {
            setEditando(false);
            setFormData({
              email: perfil.email || '',
              telefono: perfil.telefono || '',
              direccion_principal: perfil.direccion_principal || '',
              direccion_alternativa: perfil.direccion_alternativa || '',
              apellido: perfil.apellido || ''
            });
          }}>
            ❌ Cancelar
          </Button>
        </Box>
      ) : (
        <Button variant="contained" fullWidth onClick={() => setEditando(true)}>✏️ Editar Perfil</Button>
      )}

      <Divider sx={{ my: 4 }} />
      <Typography variant="h6" sx={{ mb: 2 }}>🔐 Cambiar contraseña</Typography>
      <TextField fullWidth label="Contraseña actual" type="password" value={passwordData.actual} onChange={(e) => setPasswordData(prev => ({ ...prev, actual: e.target.value }))} sx={{ mb: 2 }} />
      <TextField fullWidth label="Nueva contraseña" type="password" value={passwordData.nueva} onChange={(e) => setPasswordData(prev => ({ ...prev, nueva: e.target.value }))} sx={{ mb: 2 }} />
      <TextField fullWidth label="Repetir nueva contraseña" type="password" value={passwordData.repetir} onChange={(e) => setPasswordData(prev => ({ ...prev, repetir: e.target.value }))} sx={{ mb: 3 }} />
      <Button variant="outlined" color="primary" fullWidth onClick={handleChangePassword}>🔁 Actualizar Contraseña</Button>
   <Divider sx={{ my: 4 }} />

<Box sx={{ display: 'flex', gap: 2 }}>
  <Button
    variant="outlined"
    color="secondary"
    fullWidth
    onClick={() => navigate('/app')} // 👈 Ruta a la que querés volver
  >
    🔙 Volver
  </Button>
  <Button
    variant="contained"
    color="error"
    fullWidth
    onClick={handleLogout}
  >
    🚪 Cerrar sesión
  </Button>
</Box>

    </Container>


  );
};

export default PerfilUsuario;
