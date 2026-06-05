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

  // Misma imagen que usaba la Landing
  const bgImage = 'https://res.cloudinary.com/dwiga4jg8/image/upload/q_100,f_auto/Fondo_APLICACION_EAR_2_qbxnl7.png';

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>

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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ backgroundColor: '#E8F5E9', p: 1, borderRadius: '50%', display: 'inline-flex' }}>
                <PersonAddAlt1Icon sx={{ fontSize: 24, color: '#4CAF50' }} />
              </Box>
              <Box>
                <Typography component="h1" variant="h6" fontWeight="bold" lineHeight={1.2}>
                  Crear cuenta
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Únete a Eat &amp; Run y comé saludable
                </Typography>
              </Box>
            </Box>

            {empresaAsignada && (
              <Alert severity="info" sx={{ mb: 2, py: 0.5, borderRadius: 2 }}>
                Empleado de <strong>{empresaAsignada}</strong>
              </Alert>
            )}

            {/* Formulario compacto — reordenado y con ojito en contraseña */}
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={1.5}>

                {/* Fila 1: Nombre / Apellido */}
                <Grid item xs={6}>
                  <TextField size="small" label="Nombre" name="nombre" fullWidth required value={form.nombre} onChange={handleChange} />
                </Grid>
                <Grid item xs={6}>
                  <TextField size="small" label="Apellido" name="apellido" fullWidth required value={form.apellido} onChange={handleChange} />
                </Grid>

                {/* Fila 2: Email / Teléfono */}
                <Grid item xs={7}>
                  <TextField size="small" label="Email" name="email" type="email" fullWidth required value={form.email} onChange={handleChange} />
                </Grid>
                <Grid item xs={5}>
                  <TextField size="small" label="Teléfono" name="telefono" fullWidth required value={form.telefono} onChange={handleChange} />
                </Grid>

                {/* Fila 3: Dirección full width */}
                <Grid item xs={12}>
                  <TextField size="small" label="Dirección" name="direccion" fullWidth required value={form.direccion} onChange={handleChange} />
                </Grid>

                {/* Fila 4: Contraseña con ojito */}
                <Grid item xs={12}>
                  <TextField
                    size="small"
                    label="Contraseña"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    required
                    value={form.password}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Selector de rol tipo pastilla */}
                {!codigoEmpresa && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      Tipo de cuenta
                    </Typography>
                    <ToggleButtonGroup
                      value={form.role}
                      exclusive
                      onChange={handleRoleChange}
                      fullWidth
                      size="small"
                      sx={{
                        '& .MuiToggleButton-root': {
                          border: '1.5px solid #e0e0e0',
                          borderRadius: '8px !important',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          py: 0.8,
                          gap: 0.5,
                          color: 'text.secondary',
                          '&.Mui-selected': {
                            backgroundColor: '#E8F5E9',
                            color: '#2E7D32',
                            borderColor: '#4CAF50',
                          },
                          '&:hover': { backgroundColor: '#f1f8f1' },
                        },
                        gap: 1,
                      }}
                    >
                      <ToggleButton value="usuario">
                        <PersonIcon fontSize="small" sx={{ mr: 0.5 }} /> Usuario
                      </ToggleButton>
                      <ToggleButton value="empresa">
                        <BusinessIcon fontSize="small" sx={{ mr: 0.5 }} /> Empresa
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
                size="large"
                disabled={loading}
                sx={{
                  mt: 2.5,
                  py: 1.3,
                  fontWeight: 'bold',
                  borderRadius: 2,
                  backgroundColor: '#4CAF50',
                  boxShadow: '0 4px 14px rgba(76, 175, 80, 0.4)',
                  '&:hover': {
                    backgroundColor: '#43A047',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                {loading ? 'Registrando...' : 'Crear cuenta'}
              </Button>

              <Divider sx={{ my: 1.5 }} />

              <Button
                variant="text"
                fullWidth
                sx={{ textTransform: 'none', color: '#4CAF50', fontWeight: 600, fontSize: '0.85rem' }}
                onClick={() => navigate('/login')}
              >
                ¿Ya tenés cuenta? Iniciá sesión
              </Button>
            </Box>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
};

export default Registro;

