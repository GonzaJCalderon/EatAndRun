import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  Alert,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import API from '../api/api';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import heroRegistro from '../assets/imgs/hero-registro.png';
import PublicNavbar from '../components/public/PublicNavbar';

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
  const [showPassword, setShowPassword] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const roles = [
    { value: 'usuario', label: '👤 Usuario' },
    { value: 'empresa', label: '🏢 Empresa' }
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (_, newRole) => {
    if (newRole !== null) setForm({ ...form, role: newRole });
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

  // Imagen de registro
  const bgImage = '/assets/elegi.png';

  return (
    <>
      <PublicNavbar />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, pt: { xs: '64px', md: '72px' } }}>

      {/* ── Imagen arriba en mobile, izquierda en desktop ── */}
      <Box
        sx={{
          height: { xs: '35vh', md: '100vh' },
          width: { xs: '100%', md: '50%' },
          flexShrink: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: { xs: 'center 30%', md: 'center' },
          position: 'relative',
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.1)' }} />
        <Box sx={{ position: 'absolute', bottom: { xs: 16, md: 40 }, right: { xs: 16, md: 40 }, textAlign: 'right' }}>
          <Typography variant="h3" component="span" sx={{ fontWeight: 800, fontFamily: 'Inter, sans-serif', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.4)', letterSpacing: '-1px' }}>
            eat<b style={{ fontWeight: 900, color: '#e4f4e1' }}>&amp;</b>run
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600, textShadow: '0 1px 6px rgba(0,0,0,0.4)', mt: -0.5 }}>
            #familiaEatAndRun
          </Typography>
        </Box>
      </Box>

      {/* ── Formulario abajo en mobile, derecha en desktop ── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          p: { xs: 2.5, sm: 4, md: 5 },
          borderRadius: { xs: '24px 24px 0 0', md: 0 },
          mt: { xs: '-24px', md: 0 },
          position: 'relative',
          zIndex: 2,
          boxShadow: { xs: '0 -8px 30px rgba(0,0,0,0.1)', md: 'none' },
          overflowY: 'auto',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 480 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Header compacto */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box sx={{ backgroundColor: '#e4f4e1', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PersonAddAlt1Icon sx={{ fontSize: 24, color: '#4a7c42' }} />
              </Box>
              <Box>
                <Typography component="h1" variant="h5" fontWeight="800" sx={{ color: '#0f1a0d' }}>
                  Crear cuenta
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Únete a Eat &amp; Run y comé saludable
                </Typography>
              </Box>
            </Box>

            {empresaAsignada && (
              <Alert severity="info" sx={{ mb: 2, py: 0.5, borderRadius: 2 }}>
                Empleado de <strong>{empresaAsignada}</strong>
              </Alert>
            )}

            {/* Formulario compacto */}
            <Box component="form" onSubmit={handleSubmit} sx={{ '& .MuiTextField-root': { mb: 1.5 }, '& .MuiOutlinedInput-root': { borderRadius: '12px', '&.Mui-focused fieldset': { borderColor: '#4a7c42' } }, '& .MuiInputLabel-root.Mui-focused': { color: '#4a7c42' } }}>
              <Grid container spacing={0}>
                <Grid item xs={12}>
                  <TextField label="Nombre *" name="nombre" fullWidth value={form.nombre} onChange={handleChange} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Apellido *" name="apellido" fullWidth value={form.apellido} onChange={handleChange} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Email *" name="email" type="email" fullWidth value={form.email} onChange={handleChange} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Teléfono *" name="telefono" fullWidth value={form.telefono} onChange={handleChange} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Dirección *" name="direccion" fullWidth value={form.direccion} onChange={handleChange} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Contraseña *"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    value={form.password}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#5a6557' }}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Selector de rol tipo pastilla */}
                {!codigoEmpresa && (
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Tipo de cuenta
                    </Typography>
                    <ToggleButtonGroup
                      value={form.role}
                      exclusive
                      onChange={handleRoleChange}
                      sx={{
                        display: 'flex',
                        gap: 1.5,
                        '& .MuiToggleButton-root': {
                          border: '1px solid #ccc !important',
                          borderRadius: '8px !important',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          textTransform: 'none',
                          py: 0.8,
                          px: 2,
                          color: '#5a6557',
                          '&.Mui-selected': {
                            backgroundColor: '#e4f4e1',
                            color: '#4a7c42',
                            borderColor: '#4a7c42 !important',
                          },
                          '&:hover': { backgroundColor: '#f1f8f1' },
                        },
                      }}
                    >
                      <ToggleButton value="usuario">
                        <PersonIcon fontSize="small" sx={{ mr: 1 }} /> Usuario
                      </ToggleButton>
                      <ToggleButton value="empresa">
                        <BusinessIcon fontSize="small" sx={{ mr: 1 }} /> Empresa
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Grid>
                )}

                {/* Campos extra si es Empresa */}
                {form.role === 'empresa' && (
                  <>
                    <Grid item xs={6}>
                      <TextField size="small" label="Razón Social" name="razonSocial" fullWidth required value={form.razonSocial} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField size="small" label="CUIT" name="cuit" fullWidth required value={form.cuit} onChange={handleChange} />
                    </Grid>
                  </>
                )}

              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
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
                  transition: 'background-color 0.2s',
                }}
              >
                {loading ? 'Registrando...' : 'Crear cuenta'}
              </Button>

              <Divider sx={{ my: 2 }} />

              <Button
                variant="text"
                fullWidth
                sx={{ textTransform: 'none', color: '#4a7c42', fontWeight: 'bold', fontSize: '0.95rem' }}
                onClick={() => navigate('/login')}
              >
                ¿Ya tenés cuenta? Iniciá sesión
              </Button>
            </Box>
          </motion.div>
        </Box>
      </Box>
    </Box>
    </>
  );
};

export default Registro;

