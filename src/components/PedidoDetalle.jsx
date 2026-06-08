import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import {
  Container, Typography, CircularProgress, Box,
  Card, CardContent, IconButton, Button, Stack, Chip, Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';

const PedidoDetalle = () => {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const EXTRAS_MAP = {
    1: '🍰 Postre',
    2: '🥗 Ensalada',
    3: '💪 Proteína'
  };

  const normalizarNombre = (nombre, tipo) => {
    const match = nombre.match(/^ID:(\d+)/);
    const id = match?.[1];
    if (!id) return nombre;

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

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        const [pedidoRes, histRes] = await Promise.all([
          api.get(`/orders/${id}`),
          api.get(`/orders/${id}/history`)
        ]);
        setPedido(pedidoRes.data);
        setHistorial(histRes.data || []);
      } catch (err) {
        console.error('Error al obtener detalles del pedido', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetalle();
  }, [id]);

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const d = new Date(fechaStr);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
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
              {Object.entries(tartasObj).map(([nombre, cantidad], i) => (
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

  if (loading) {
    return (
      <Container sx={{ mt: 10, textAlign: 'center' }}>
        <CircularProgress color="success" size={50} />
        <Typography variant="h6" sx={{ mt: 2, color: '#64748b' }}>Cargando detalles del pedido...</Typography>
      </Container>
    );
  }

  if (!pedido) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">No se encontró el pedido.</Typography>
        <Button variant="contained" sx={{ mt: 2, borderRadius: 50 }} onClick={() => navigate('/mis-pedidos')}>
          Volver a mis pedidos
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/mis-pedidos')} sx={{ borderRadius: 50, textTransform: 'none', color: '#475569', borderColor: '#cbd5e1' }}>
          Volver
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
        🔍 Seguimiento de Pedido
      </Typography>

      <Card sx={{ mb: 4, borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 'bold', letterSpacing: 1 }}>PEDIDO #{pedido.id}</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mt: 0.5, textTransform: 'capitalize' }}>
                Semana del {formatFecha(pedido.fecha_entrega).toLowerCase()}
              </Typography>
            </Box>
            <Chip label={(pedido.estado || pedido.status || 'Pendiente').toUpperCase()} color={getStatusColor(pedido.estado || pedido.status)} sx={{ fontWeight: 'bold', borderRadius: 2 }} />
          </Stack>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#475569', mb: 1 }}>🍽️ Ítems del pedido</Typography>
            {renderItems(pedido)}
          </Box>

          <Box sx={{ backgroundColor: '#f1f5f9', p: 2, borderRadius: 3, mb: 4 }}>
             <Typography variant="subtitle2" sx={{ color: '#475569', fontWeight: 'bold', mb: 0.5 }}>📝 Observaciones del pedido:</Typography>
             <Typography variant="body2" sx={{ color: '#1e293b', fontStyle: pedido.observaciones ? 'normal' : 'italic' }}>
               {pedido.observaciones || 'No se registraron observaciones para este pedido.'}
             </Typography>
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', textAlign: 'right' }}>
            Total estimado: <span style={{ color: '#22c55e', fontSize: '1.4rem' }}>${Number(pedido.total).toLocaleString()}</span>
          </Typography>
        </CardContent>
      </Card>

      <Typography variant="h5" sx={{ mb: 3, fontWeight: 800, color: '#1e293b' }}>
        📜 Historial y Comprobante
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        
        {/* Historial Timeline */}
        <Card sx={{ flex: 1, borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#475569', mb: 3 }}>Historial de estados</Typography>
            {historial.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>No hay historial registrado aún.</Typography>
            ) : (
              <Stack spacing={2}>
                {historial.map((item, idx) => (
                  <Box key={idx} sx={{ position: 'relative', pl: 3, borderLeft: '2px solid #cbd5e1' }}>
                    <Box sx={{ position: 'absolute', left: -6, top: 4, width: 10, height: 10, borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                      {(item.estado || item.status).toUpperCase()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {new Date(item.timestamp || item.fecha_cambio).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' })}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Comprobante */}
        {pedido.comprobante_url && (
          <Card sx={{ flex: 1, borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#475569', mb: 2 }}>Comprobante de pago adjunto</Typography>
              <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'center' }}>
                <img
                  src={pedido.comprobante_url}
                  alt="Comprobante de pago"
                  style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
                />
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

    </Container>
  );
};

export default PedidoDetalle;
