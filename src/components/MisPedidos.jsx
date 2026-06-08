import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import {
  Container, Typography, Card, CardContent,
  Box, List, CircularProgress, Button, Stack, IconButton, Chip, Divider
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';

const EXTRAS_MAP = {
  1: '🍰 Postre',
  2: '🥗 Ensalada',
  3: '💪 Proteína'
};

const MisPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/orders')
      .then(res => {
        setPedidos(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setCargando(false));
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const tieneDetalles = (pedido) => {
    if (!pedido || typeof pedido !== 'object') return false;
    const { diarios = {}, extras = {}, tartas = {} } = pedido;

    const hayDiarios = Object.values(diarios).some(dia =>
      dia && typeof dia === 'object' && Object.keys(dia).length > 0
    );

    const hayExtras = Object.values(extras).some(dia =>
      dia && typeof dia === 'object' && Object.keys(dia).length > 0
    );

    const hayTartas = tartas && Object.keys(tartas).length > 0;

    return hayDiarios || hayExtras || hayTartas;
  };

  const normalizarNombre = (nombre, tipo) => {
    const idMatch = String(nombre).match(/^ID:(\d+)$/);
    if (!idMatch) return nombre;

    const id = parseInt(idMatch[1]);

    switch (tipo) {
      case 'extras':
        return EXTRAS_MAP[id] || `Extra #${id}`;
      case 'diarios':
        return `Menú diario #${id}`;
      case 'tartas':
        return `Tarta #${id}`;
      default:
        return nombre;
    }
  };

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('pendiente')) return 'warning';
    if (s.includes('entregado') || s.includes('completado')) return 'success';
    if (s.includes('cancelado')) return 'error';
    return 'default';
  };

  const renderItems = (pedido) => {
    if (!pedido.pedido || typeof pedido.pedido !== 'object') return null;

    const allowedTypes = ['diarios', 'extras', 'tartas'];
    
    return Object.entries(pedido.pedido)
      .filter(([tipo]) => allowedTypes.includes(tipo.toLowerCase()))
      .map(([tipo, grupo]) => {
        if (!grupo) return null;

        // Prevent rendering empty categories
        if (tipo === 'tartas') {
          if (Object.keys(grupo).length === 0) return null;
        } else {
          const hasItems = Object.values(grupo).some(val => val && typeof val === 'object' && Object.keys(val).length > 0);
          if (!hasItems) return null;
        }

        const Icon = tipo === 'tartas' ? '🥧' : tipo === 'extras' ? '🥗' : '🍽️';
        const Title = tipo.charAt(0).toUpperCase() + tipo.slice(1);

        return (
          <Box key={tipo} sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#475569', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              {Icon} {Title}
            </Typography>

            {tipo === 'tartas' ? (
              <Box sx={{ ml: 3, mt: 1 }}>
                {Object.entries(grupo).map(([nombre, cantidad]) => (
                  <Typography key={nombre} variant="body2" sx={{ color: '#1e293b', mb: 0.5 }}>
                    <strong style={{ color: '#22c55e' }}>{cantidad}x</strong> {normalizarNombre(nombre, tipo)}
                  </Typography>
                ))}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                {Object.entries(grupo).map(([subkey, value]) => {
                  if (!value || typeof value !== 'object' || Object.keys(value).length === 0) return null;
                  return (
                    <Box key={subkey} sx={{ ml: 3, p: 1.5, backgroundColor: '#f8fafc', borderRadius: 2, borderLeft: '3px solid #e2e8f0' }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b' }}>
                        📅 {subkey}
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        {Object.entries(value).map(([nombre, cantidad]) => (
                          <Typography key={nombre} variant="body2" sx={{ color: '#1e293b', mt: 0.5 }}>
                            <strong style={{ color: '#22c55e' }}>{cantidad}x</strong> {normalizarNombre(nombre, tipo)}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        );
      });
  };

  if (cargando) return (
    <Container sx={{ mt: 10, textAlign: 'center' }}>
      <CircularProgress color="success" size={50} />
      <Typography variant="h6" sx={{ mt: 2, color: '#64748b' }}>Obteniendo tus pedidos...</Typography>
    </Container>
  );

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const d = new Date(fechaStr);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/app')} sx={{ borderRadius: 50, textTransform: 'none', color: '#475569', borderColor: '#cbd5e1' }}>
          Volver a la App
        </Button>

        <Stack direction="row" gap={1}>
          <IconButton onClick={() => navigate('/')} title="Ir al Inicio" sx={{ backgroundColor: '#f1f5f9' }}>
            <CloseIcon />
          </IconButton>
          <Button onClick={logout} color="error" startIcon={<LogoutIcon />} sx={{ borderRadius: 50, textTransform: 'none' }}>
            Cerrar sesión
          </Button>
        </Stack>
      </Stack>

      <Typography variant="h4" sx={{ mb: 4, fontWeight: 900, color: '#1e293b' }}>
        🧾 Mis pedidos
      </Typography>

      {pedidos.length === 0 ? (
        <Card sx={{ borderRadius: 4, p: 4, textAlign: 'center', backgroundColor: '#f8fafc', boxShadow: 'none', border: '1px dashed #cbd5e1' }}>
          <Typography variant="h6" sx={{ color: '#64748b' }}>No has realizado pedidos aún.</Typography>
          <Button variant="contained" color="success" sx={{ mt: 3, borderRadius: 50, textTransform: 'none' }} onClick={() => navigate('/app')}>
            ¡Hacer mi primer pedido!
          </Button>
        </Card>
      ) : (
        <List sx={{ p: 0 }}>
          {pedidos.map(p => (
            <Card key={p.id} sx={{ mb: 3, borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' } }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 'bold', letterSpacing: 1 }}>PEDIDO #{p.id}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mt: 0.5, textTransform: 'capitalize' }}>
                      {formatFecha(p.fecha_entrega)}
                    </Typography>
                  </Box>
                  <Chip label={(p.estado || p.status || 'Pendiente').toUpperCase()} color={getStatusColor(p.estado || p.status)} size="small" sx={{ fontWeight: 'bold', borderRadius: 2 }} />
                </Stack>
                
                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 3 }}>
                  {tieneDetalles(p.pedido) ? (
                    renderItems(p)
                  ) : (
                    <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                      Este pedido no tiene detalles registrados.
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b' }}>
                    Total: <span style={{ color: '#22c55e', fontSize: '1.2rem' }}>${Number(p.total).toLocaleString()}</span>
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate(`/mis-pedidos/${p.id}`)}
                    sx={{ backgroundColor: '#1e293b', color: 'white', borderRadius: 50, textTransform: 'none', px: 3, py: 1, '&:hover': { backgroundColor: '#334155' } }}
                  >
                    Ver detalle completo
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </List>
      )}
    </Container>
  );
};

export default MisPedidos;
