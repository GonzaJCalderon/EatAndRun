import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import {
  Container, Typography, Card, CardContent,
  Box, List, CircularProgress, Button, Stack, IconButton, Chip, Divider,
  Accordion, AccordionSummary, AccordionDetails, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const EXTRAS_MAP = {
  1: '🍰 Postre',
  2: '🥗 Ensalada',
  3: '💪 Proteína'
};

const MisPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Filters
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroMes, setFiltroMes] = useState('Todos');
  
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
    
    const hasDiarios = Object.values(diarios || {}).some(val => val && typeof val === 'object' && Object.keys(val).length > 0);
    const hasExtras = Object.values(extras || {}).some(val => val && typeof val === 'object' && Object.keys(val).length > 0);
    const hasTartas = (tartas || {}) && Object.keys(tartas || {}).length > 0;
    
    return hasDiarios || hasExtras || hasTartas;
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
    
    // Sort days logically (Lunes -> Viernes)
    const diasOrden = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    const daysArray = Object.values(daysMap)
      .filter(d => d.items.length > 0)
      .sort((a, b) => {
        const diaA = a.displayDate.split('-')[0].toLowerCase();
        const diaB = b.displayDate.split('-')[0].toLowerCase();
        const indexA = diasOrden.indexOf(diaA);
        const indexB = diasOrden.indexOf(diaB);
        return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
      });

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

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const d = new Date(fechaStr);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  // Generate unique months for the filter dropdown
  const mesesDisponibles = useMemo(() => {
    const meses = pedidos.map(p => {
      const d = new Date(p.fecha_entrega);
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
      return d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    });
    return [...new Set(meses)];
  }, [pedidos]);

  // Filter the orders based on selected filters
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter(p => {
      const d = new Date(p.fecha_entrega);
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
      const orderMonth = d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
      const orderStatus = (p.estado || p.status || 'pendiente').toLowerCase();

      const matchMes = filtroMes === 'Todos' || orderMonth === filtroMes;
      const matchEstado = filtroEstado === 'Todos' ||
        (filtroEstado === 'Pendiente' && orderStatus.includes('pendiente')) ||
        (filtroEstado === 'Entregado' && (orderStatus.includes('entregado') || orderStatus.includes('completado'))) ||
        (filtroEstado === 'Cancelado' && orderStatus.includes('cancelado'));

      return matchMes && matchEstado;
    });
  }, [pedidos, filtroMes, filtroEstado]);

  if (cargando) return (
    <Container sx={{ mt: 10, textAlign: 'center' }}>
      <CircularProgress color="success" size={50} />
      <Typography variant="h6" sx={{ mt: 2, color: '#64748b' }}>Obteniendo tus pedidos...</Typography>
    </Container>
  );

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

      {/* FILTERS */}
      {pedidos.length > 0 && (
        <Card sx={{ mb: 4, borderRadius: 4, p: 2, boxShadow: 'none', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                value={filtroEstado}
                label="Estado"
                onChange={(e) => setFiltroEstado(e.target.value)}
                sx={{ backgroundColor: 'white', borderRadius: 2 }}
              >
                <MenuItem value="Todos">Todos los estados</MenuItem>
                <MenuItem value="Pendiente">Pendiente</MenuItem>
                <MenuItem value="Entregado">Entregado</MenuItem>
                <MenuItem value="Cancelado">Cancelado</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Mes</InputLabel>
              <Select
                value={filtroMes}
                label="Mes"
                onChange={(e) => setFiltroMes(e.target.value)}
                sx={{ backgroundColor: 'white', borderRadius: 2, textTransform: 'capitalize' }}
              >
                <MenuItem value="Todos">Cualquier mes</MenuItem>
                {mesesDisponibles.map(mes => (
                  <MenuItem key={mes} value={mes} sx={{ textTransform: 'capitalize' }}>{mes}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Card>
      )}

      {pedidosFiltrados.length === 0 ? (
        <Card sx={{ borderRadius: 4, p: 4, textAlign: 'center', backgroundColor: '#f8fafc', boxShadow: 'none', border: '1px dashed #cbd5e1' }}>
          <Typography variant="h6" sx={{ color: '#64748b' }}>
            {pedidos.length === 0 ? "No has realizado pedidos aún." : "No hay pedidos que coincidan con los filtros."}
          </Typography>
          {pedidos.length === 0 && (
            <Button variant="contained" color="success" sx={{ mt: 3, borderRadius: 50, textTransform: 'none' }} onClick={() => navigate('/app')}>
              ¡Hacer mi primer pedido!
            </Button>
          )}
        </Card>
      ) : (
        <List sx={{ p: 0 }}>
          {pedidosFiltrados.map(p => (
            <Card key={p.id} sx={{ mb: 3, borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' } }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 }, pb: '16px !important' }}>
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

                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b' }}>
                    Total estimado: <span style={{ color: '#22c55e', fontSize: '1.2rem' }}>${Number(p.total).toLocaleString()}</span>
                  </Typography>
                </Stack>
                
                <Accordion sx={{ boxShadow: 'none', border: '1px solid #e2e8f0', borderRadius: '12px !important', '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: '#f8fafc', borderRadius: 3 }}>
                    <Typography variant="subtitle2" sx={{ color: '#475569', fontWeight: 'bold' }}>Seguimiento y Comprobante</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 2 }}>
                    {/* Observaciones */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Observaciones del pedido:</Typography>
                      <Typography variant="body2" sx={{ color: '#1e293b', fontStyle: p.observaciones ? 'normal' : 'italic', mt: 0.5 }}>
                        {p.observaciones || 'No se registraron observaciones.'}
                      </Typography>
                    </Box>

                    {/* Comprobante */}
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Comprobante de pago:</Typography>
                      {p.comprobante_url ? (
                        <Box sx={{ mt: 1, borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', backgroundColor: '#f1f5f9' }}>
                           <img src={p.comprobante_url} alt="Comprobante" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} / decoding="async" loading="lazy">
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic', mt: 0.5 }}>No hay comprobante adjunto.</Typography>
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </List>
      )}
    </Container>
  );
};

export default MisPedidos;
