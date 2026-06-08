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

  const renderItems = (pedidoObj) => {
    if (!pedidoObj.pedido || typeof pedidoObj.pedido !== 'object') return null;

    const diariosObj = pedidoObj.pedido.diarios || {};
    const extrasObj = pedidoObj.pedido.extras || {};
    const tartasObj = pedidoObj.pedido.tartas || {};
    const fechasObj = pedidoObj.pedido.FECHA_DIA_POR_DIA || {};

    const daysSet = new Set([...Object.keys(diariosObj), ...Object.keys(extrasObj)]);
    
    const daysMap = {}; 

    daysSet.forEach(dayKey => {
      const baseDayMatch = dayKey.match(/^(lunes|martes|mi[eé]rcoles|jueves|viernes)/i);
      const baseDay = baseDayMatch ? baseDayMatch[1].toLowerCase() : dayKey;

      if (!daysMap[baseDay]) {
         daysMap[baseDay] = {
           displayDate: fechasObj[baseDay] || dayKey,
           items: []
         };
      }

      if (diariosObj[dayKey] && typeof diariosObj[dayKey] === 'object') {
        Object.entries(diariosObj[dayKey]).forEach(([nombre, cantidad]) => {
          daysMap[baseDay].items.push({ tipo: 'diarios', nombre, cantidad });
        });
      }

      if (extrasObj[dayKey] && typeof extrasObj[dayKey] === 'object') {
        Object.entries(extrasObj[dayKey]).forEach(([nombre, cantidad]) => {
          daysMap[baseDay].items.push({ tipo: 'extras', nombre, cantidad });
        });
      }
    });

    const hasTartas = tartasObj && Object.keys(tartasObj).length > 0;
    // sort days by order logic or just use map order (which is usually fine)
    const daysArray = Object.values(daysMap).filter(d => d.items.length > 0);

    return (
      <Box sx={{ mt: 2 }}>
        {daysArray.map((dayData, idx) => (
          <Box key={idx} sx={{ mb: 2, p: 1.5, backgroundColor: '#f8fafc', borderRadius: 2, borderLeft: '3px solid #3b82f6' }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase', color: '#1e293b' }}>
              📅 {dayData.displayDate}
            </Typography>
            <Box sx={{ mt: 1 }}>
              {dayData.items.map((item, i) => {
                const Icon = item.tipo === 'extras' ? '🥗' : '🍽️';
                return (
                  <Typography key={i} variant="body2" sx={{ color: '#334155', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    {Icon} <span><strong style={{ color: '#22c55e' }}>{item.cantidad}x</strong> {normalizarNombre(item.nombre, item.tipo)}</span>
                  </Typography>
                );
              })}
            </Box>
          </Box>
        ))}

        {hasTartas && (
          <Box sx={{ mb: 2, p: 1.5, backgroundColor: '#fff7ed', borderRadius: 2, borderLeft: '3px solid #f97316' }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase', color: '#1e293b' }}>
              🥧 Tartas (Toda la semana)
            </Typography>
            <Box sx={{ mt: 1 }}>
              {Object.entries(tartas).map(([nombre, cantidad], i) => (
                <Typography key={i} variant="body2" sx={{ color: '#334155', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  🥧 <span><strong style={{ color: '#22c55e' }}>{cantidad}x</strong> {normalizarNombre(nombre, 'tartas')}</span>
                </Typography>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
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
                      Semana del {formatFecha(p.fecha_entrega).toLowerCase()}
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
                    Seguimiento y Comprobante
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
