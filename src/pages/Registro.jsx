import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Alert,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import API from '../api/api';
import registerImage from '../assets/imgs/register-ilustration.png';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';

const Registro = ({ onRegister }) => {
  const [searchParams] = useSearchParams();
  const codigoEmpresa = searchParams.get('empresa');

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    role: codigoEmpresa ? 'usuario' : 'usuario', // Si viene por invitación, queda como usuario (empleado)
    telefono: '',
    direccion: '',
    direccionAlt: '',
    razonSocial: '',
    cuit: ''
  });

  const [loading, setLoading] = useState(false);
  const [empresaAsignada, setEmpresaAsignada] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const roles = [
    { value: 'usuario', label: '👤 Usuario' },
    { value: 'empresa', label: '🏢 Empresa' }
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre || !form.apellido || !form.email || !form.password || !form.telefono || !form.direccion) {
      enqueueSnackbar('❗ Todos los campos personales son obligatorios', { variant: 'warning' });
      return;
    }

    if (form.role === 'empresa' && (!form.razonSocial || !form.cuit)) {
      enqueueSnackbar('❗ Razón social y CUIT son obligatorios para empresas', { variant: 'warning' });
      return;
    }

    setLoading(true);

    try {
      const res = await API.post('/auth/register', {
        name: form.nombre,
        apellido: form.apellido,
        email: form.email,
        password: form.password,
        role: form.role,
        telefono: form.telefono,
        direccion_principal: form.direccion,
        direccion_alternativa: form.direccionAlt,
        empresa: form.role === 'empresa' ? {
          razonSocial: form.razonSocial,
          cuit: form.cuit
        } : null,
        codigoInvitacion: codigoEmpresa || null
      });

      if (res.data) {
        localStorage.setItem('eatAndRunUser', JSON.stringify(res.data));
        enqueueSnackbar('✅ Registro exitoso. Ahora podés iniciar sesión.', { variant: 'success' });

        setTimeout(() => {
          navigate('/login');
        }, 1500);

        if (onRegister) onRegister(res.data);
      }
    } catch (err) {
      console.error('🔥 Error:', err?.response?.data || err.message);
      enqueueSnackbar(err?.response?.data?.error || '❌ Error al registrar el usuario', {
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchEmpresa = async () => {
      if (!codigoEmpresa) return;

      try {
        const res = await API.post('/auth/verificar-codigo', { codigo: codigoEmpresa });

        if (res.data && res.data.nombreEmpresa) {
          setEmpresaAsignada(res.data.nombreEmpresa);
        } else {
          enqueueSnackbar('⚠️ Código inválido o expirado', { variant: 'warning' });
        }
      } catch (err) {
        enqueueSnackbar('❌ No se pudo verificar el código de empresa', { variant: 'error' });
      }
    };

    fetchEmpresa();
  }, [codigoEmpresa]);

  return (
    <Grid container component="main" sx={{ height: '100vh', backgroundColor: '#f9fafb' }}>
      <Grid item xs={false} sm={5} md={6}>
        <Box
          sx={{
            height: '100%',
            backgroundImage: `url(${registerImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'linear-gradient(to right, rgba(0,0,0,0.1), rgba(249,250,251,1))' // Transición suave hacia el form
            }
          }}
        />
      </Grid>

      <Grid item xs={12} sm={7} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Box
          component={Paper}
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            width: '100%',
            maxWidth: 550,
            backgroundColor: '#ffffff',
            borderRadius: 4,
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ width: '100%', textAlign: 'center' }}
          >
            <Box sx={{ mb: 2, display: 'inline-flex', backgroundColor: '#E8F5E9', p: 1.5, borderRadius: '50%' }}>
              <PersonAddAlt1Icon sx={{ fontSize: 36, color: '#4CAF50' }} />
            </Box>

            <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom color="text.primary">
              Crear cuenta
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Únete a Eat & Run y comienza a comer saludable.
            </Typography>

            {empresaAsignada && (
              <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                Te estás registrando como empleado de <strong>{empresaAsignada}</strong>
              </Alert>
            )}
          </motion.div>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Nombre" name="nombre" fullWidth required value={form.nombre} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Apellido" name="apellido" fullWidth required value={form.apellido} onChange={handleChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Email" name="email" type="email" fullWidth required value={form.email} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Contraseña" name="password" type="password" fullWidth required value={form.password} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Teléfono" name="telefono" fullWidth required value={form.telefono} onChange={handleChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Dirección principal" name="direccion" fullWidth required value={form.direccion} onChange={handleChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Dirección alternativa (opcional)" name="direccionAlt" fullWidth value={form.direccionAlt} onChange={handleChange} />
              </Grid>

              {!codigoEmpresa && (
                <Grid item xs={12}>
                  <TextField select label="Tipo de usuario" name="role" value={form.role} onChange={handleChange} fullWidth>
                    {roles.map((r) => (
                      <MenuItem key={r.value} value={r.value}>
                        {r.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}

              {form.role === 'empresa' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Razón Social" name="razonSocial" fullWidth required value={form.razonSocial} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="CUIT" name="cuit" fullWidth required value={form.cuit} onChange={handleChange} />
                  </Grid>
                </>
              )}
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ 
                mt: 4, 
                py: 1.5,
                fontSize: '1.05rem',
                fontWeight: 'bold',
                borderRadius: 2,
                backgroundColor: '#4CAF50', 
                color: '#fff',
                boxShadow: '0 4px 14px 0 rgba(76, 175, 80, 0.39)',
                '&:hover': { 
                  backgroundColor: '#43A047',
                  boxShadow: '0 6px 20px rgba(76, 175, 80, 0.23)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s'
              }}
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </Button>
            
            <Divider sx={{ my: 3 }} />
            
            <Button
              variant="text"
              fullWidth
              sx={{ textTransform: 'none', color: 'text.secondary' }}
              onClick={() => navigate('/login')}
            >
              ¿Ya tienes una cuenta? Inicia sesión
            </Button>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Registro;
