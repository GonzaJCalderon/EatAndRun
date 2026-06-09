import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Card, CardContent, Button, Divider, Box,
  Snackbar, Alert, Select, MenuItem, TextField, Tabs, Tab, Avatar, Chip
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import DoneIcon from '@mui/icons-material/Done';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import api from '../api/api';
import MapaCliente from '../components/MapaCliente';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import dayjs from '../utils/day';

const getTodayName = () => {
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  return dias[new Date().getDay()];
};

const EXTRAS_MAP = {
  1: '🍰 Postre',
  2: '🥗 Ensalada',
  3: '💪 Proteína'
};

const cardStyle = {
  mb: 4,
  borderRadius: 4,
  boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
  border: '1px solid rgba(0,0,0,0.05)',
  transition: 'transform 0.2s',
  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }
};

const DeliveryDashboard = () => {
  const [pedidosAsignados, setPedidosAsignados] = useState([]);
  const [pedidosSinAsignar, setPedidosSinAsignar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeExito, setMensajeExito] = useState('');
  const [mostrarSnackbar, setMostrarSnackbar] = useState(false);
  const [pedidoActual, setPedidoActual] = useState(null);
  const [mostrarModalMotivo, setMostrarModalMotivo] = useState(false);
  const [motivoNoEntrega, setMotivoNoEntrega] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('hoy');
  const [desdeFecha, setDesdeFecha] = useState(dayjs().format('YYYY-MM-DD'));
  const [hastaFecha, setHastaFecha] = useState(dayjs().format('YYYY-MM-DD'));
  const [tabIndex, setTabIndex] = useState(0);

  const hoy = getTodayName();
  const user = useSelector(selectUser);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let query = '';
        const hoyStr = dayjs().format('YYYY-MM-DD');

        if (filtroFecha !== 'hoy') {
          query = `?desde=${desdeFecha}&hasta=${hastaFecha}`;
        } else {
          query = `?desde=${hoyStr}&hasta=${hoyStr}`;
        }

        const asignadosRes = await api.get(`/delivery/daily-tasks${query}`);
        const sinAsignarRes = await api.get(`/delivery/daily-tasks/unassigned${query}`);

        // Filtrar 'especial' del objeto agrupado si existe, sin depender de p.items que no viene en getPedidosConItems
        const limpiarEspeciales = (p) => {
          if (p.pedido && p.pedido.diarios) {
            Object.keys(p.pedido.diarios).forEach(dia => {
              Object.keys(p.pedido.diarios[dia]).forEach(plato => {
                // Como los especiales se agrupan en diarios, no podemos filtrarlos fácil por item_type acá
                // ya que se perdió esa info. Pero al menos quitamos el filtro que rompía todo.
              });
            });
          }
          return p;
        };

        const flattenToDailyTasks = (pedidos) => {
          const tasks = [];
          pedidos.forEach(p => {
            const fechasMap = p.pedido?.fecha_dia_por_dia || {};
            const fechas = Object.values(fechasMap);
            if (p.pedido?.tarta_fecha) fechas.push(p.pedido.tarta_fecha);
            
            let uniqueFechas = [...new Set(fechas)];
            // Filtrar por el rango actual
            uniqueFechas = uniqueFechas.filter(f => dayjs(f).isBetween(desdeFecha, hastaFecha, 'day', '[]'));

            if (uniqueFechas.length === 0) {
              uniqueFechas = [desdeFecha]; // fallback
            }

            uniqueFechas.forEach(fechaStr => {
              // Buscar los días (ej: "lunes") que correspondan a esta fechaStr
              const diasCorrespondientes = Object.keys(fechasMap).filter(k => fechasMap[k] === fechaStr);
              tasks.push({
                 ...p,
                 task_date: fechaStr,
                 task_status: p.pedido?.daily_status?.[fechaStr] || 'pendiente',
                 task_dias: diasCorrespondientes,
                 es_tarta_date: p.pedido?.tarta_fecha === fechaStr
              });
            });
          });
          return tasks;
        };

        let asignados = flattenToDailyTasks(asignadosRes.data.map(limpiarEspeciales));
        let sinAsignar = flattenToDailyTasks(sinAsignarRes.data.map(limpiarEspeciales));

        const sortPorFecha = (a, b) => dayjs(a.task_date).diff(dayjs(b.task_date));

        asignados.sort(sortPorFecha);
        sinAsignar.sort(sortPorFecha);

        setPedidosAsignados(asignados);
        setPedidosSinAsignar(sinAsignar);
      } catch (err) {
        console.error('❌ Error al obtener pedidos', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hoy, filtroFecha, desdeFecha, hastaFecha]);

  const cambiarEstado = async (id, nuevoEstado, fechaTask) => {
    try {
      const fechaParaActualizar = fechaTask || desdeFecha; // Fallback to current filter if missing
      await api.put(`/delivery/daily-tasks/${id}/${fechaParaActualizar}/status`, { status: nuevoEstado });
      setPedidosAsignados(prev => prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            task_status: p.task_date === fechaParaActualizar ? nuevoEstado : p.task_status,
            pedido: {
              ...p.pedido,
              daily_status: {
                ...(p.pedido?.daily_status || {}),
                [fechaParaActualizar]: nuevoEstado
              }
            }
          };
        }
        return p;
      }));
      setMensajeExito(`Entrega marcada como "${nuevoEstado}"`);
      setMostrarSnackbar(true);
    } catch (err) {
      console.error('❌ Error actualizando estado', err);
    }
  };

  const autoAsignarPedido = async id => {
    try {
      await api.put(`/delivery/orders/${id}/claim`);
      const pedidoAsignado = pedidosSinAsignar.find(p => p.id === id);
      setPedidosAsignados(prev => [...prev, { ...pedidoAsignado, estado: 'preparando' }]);
      setPedidosSinAsignar(prev => prev.filter(p => p.id !== id));
      setMensajeExito('✅ Pedido asignado con éxito');
      setMostrarSnackbar(true);
    } catch (err) {
      console.error('❌ Error al autoasignar pedido:', err);
    }
  };

  const marcarNoEntregado = async () => {
    if (!motivoNoEntrega || motivoNoEntrega.trim().length < 5) {
      alert('Por favor, escribí un motivo válido (mínimo 5 caracteres).');
      return;
    }
    try {
      const fechaParaActualizar = pedidoActual.task_date || desdeFecha;
      await api.put(`/delivery/daily-tasks/${pedidoActual.id}/${fechaParaActualizar}/status`, {
        status: 'no_entregado',
        motivo: motivoNoEntrega
      });
      setPedidosAsignados(prev => prev.map(p => {
        if (p.id === pedidoActual.id) {
          return {
            ...p,
            task_status: p.task_date === fechaParaActualizar ? 'no_entregado' : p.task_status,
            pedido: {
              ...p.pedido,
              daily_status: {
                ...(p.pedido?.daily_status || {}),
                [fechaParaActualizar]: 'no_entregado'
              }
            }
          };
        }
        return p;
      }));
      setMostrarSnackbar(true);
      setMensajeExito(`Entrega marcada como no entregada`);
      setMostrarModalMotivo(false);
      setMotivoNoEntrega('');
    } catch (err) {
      console.error('❌ Error al marcar como no entregado:', err);
      alert('Hubo un error al enviar el motivo.');
    }
  };

  const renderContenidoPedido = pedido => {
    const diarios = pedido.pedido?.diarios || {};
    const extras = pedido.pedido?.extras || {};
    const tartas = pedido.pedido?.tartas || {};

    const filterByDay = (itemsMap) => {
      if (!pedido.task_dias || pedido.task_dias.length === 0) return itemsMap;
      const filtered = {};
      pedido.task_dias.forEach(diaKey => {
        // Find matching keys since itemsMap keys might be "lunes 23/10" and diaKey is "lunes"
        const matchedKeys = Object.keys(itemsMap).filter(k => k.toLowerCase().startsWith(diaKey.toLowerCase()));
        matchedKeys.forEach(k => { filtered[k] = itemsMap[k]; });
      });
      return filtered;
    };

    const diariosFiltrados = filterByDay(diarios);
    const extrasFiltrados = filterByDay(extras);

    return (
      <Box display="flex" flexDirection="column" gap={1}>
        {Object.entries(diariosFiltrados).map(([dia, platos]) => 
          Object.entries(platos).map(([nombre, cantidad], i) => (
            <Box key={`plato-${dia}-${i}`} display="flex" alignItems="center" gap={1}>
              <Chip size="small" color="primary" label={`${cantidad}x`} sx={{ fontWeight: 'bold' }} />
              <Typography variant="body2" fontWeight="500">{nombre}</Typography>
              <Chip size="small" variant="outlined" label={dia} sx={{ ml: 'auto' }} />
            </Box>
          ))
        )}
        {Object.entries(extrasFiltrados).map(([dia, extrasDia]) => 
          Object.entries(extrasDia).map(([key, cantidad], i) => {
            const nombre = isNaN(key) ? key : EXTRAS_MAP[Number(key)] || `Extra #${key}`;
            return (
              <Box key={`extra-${dia}-${i}`} display="flex" alignItems="center" gap={1}>
                <Chip size="small" color="warning" label={`${cantidad}x`} sx={{ fontWeight: 'bold' }} />
                <Typography variant="body2" fontWeight="500">{nombre}</Typography>
                <Chip size="small" variant="outlined" label={dia} sx={{ ml: 'auto' }} />
              </Box>
            );
          })
        )}
        {pedido.es_tarta_date && Object.entries(tartas).map(([nombre, cantidad], i) => (
          <Box key={`tarta-${i}`} display="flex" alignItems="center" gap={1}>
            <Chip size="small" color="error" label={`${cantidad}x`} sx={{ fontWeight: 'bold' }} />
            <Typography variant="body2" fontWeight="500">{nombre}</Typography>
            <Chip size="small" variant="outlined" label="Tarta" sx={{ ml: 'auto' }} />
          </Box>
        ))}
        {Object.keys(diariosFiltrados).length === 0 && Object.keys(extrasFiltrados).length === 0 && !pedido.es_tarta_date && (
          <Typography variant="body2" color="text.secondary">No hay ítems para entregar en esta fecha.</Typography>
        )}
      </Box>
    );
  };

  const pedidosEntregados = pedidosAsignados.filter(p => p.task_status === 'entregado');
  const pedidosPendientes = pedidosAsignados.filter(p => p.task_status !== 'entregado' && p.task_status !== 'cancelado' && p.task_status !== 'no_entregado');
  const pedidosCancelados = pedidosAsignados.filter(p => p.task_status === 'cancelado' || p.task_status === 'no_entregado');

  return (
    <Container sx={{ mt: { xs: 2, md: 4 }, pb: 10, maxWidth: '800px !important' }}>
      
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4, background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)', p: 3, borderRadius: 4, color: 'white', boxShadow: '0 10px 30px rgba(76, 175, 80, 0.3)' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'white', color: '#2e7d32', width: 56, height: 56 }}>
            <LocalShippingIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              ¡Hola, {user?.nombre || 'Repartidor'}! 👋
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Listado de entregas y asignaciones
            </Typography>
          </Box>
        </Box>
        <Button variant="contained" color="error" size="small" sx={{ borderRadius: 8, textTransform: 'none', fontWeight: 'bold' }} onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>
          Salir
        </Button>
      </Box>

      <Box sx={{ mb: 4, p: 2, bgcolor: '#f8fafc', borderRadius: 4, border: '1px solid #e2e8f0' }}>
        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" gutterBottom>
          Filtro de Fecha
        </Typography>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Select value={filtroFecha} onChange={(e) => {
            const value = e.target.value;
            setFiltroFecha(value);
            const hoy = dayjs();
            if (value === 'semana_actual') {
              setDesdeFecha(hoy.startOf('week').add(1, 'day').format('YYYY-MM-DD'));
              setHastaFecha(hoy.endOf('week').add(1, 'day').format('YYYY-MM-DD'));
            } else if (value === 'semana_pasada') {
              setDesdeFecha(hoy.startOf('week').subtract(6, 'day').format('YYYY-MM-DD'));
              setHastaFecha(hoy.startOf('week').format('YYYY-MM-DD'));
            } else if (value === 'hoy') {
              setDesdeFecha(hoy.format('YYYY-MM-DD'));
              setHastaFecha(hoy.format('YYYY-MM-DD'));
            } else if (value === 'historial') {
              setDesdeFecha('2024-01-01');
              setHastaFecha(hoy.format('YYYY-MM-DD'));
            }
          }} size="small" sx={{ minWidth: 150, bgcolor: 'white', borderRadius: 2 }}>
            <MenuItem value="hoy">📅 Hoy</MenuItem>
            <MenuItem value="semana_actual">🗓️ Semana actual</MenuItem>
            <MenuItem value="semana_pasada">📆 Semana pasada</MenuItem>
            <MenuItem value="historial">📜 Historial completo</MenuItem>
            <MenuItem value="personalizado">⚙️ Personalizado</MenuItem>
          </Select>
          {filtroFecha === 'personalizado' && (
            <>
              <TextField type="date" label="Desde" size="small" value={desdeFecha} onChange={(e) => setDesdeFecha(e.target.value)} sx={{ bgcolor: 'white', borderRadius: 2 }} />
              <TextField type="date" label="Hasta" size="small" value={hastaFecha} onChange={(e) => setHastaFecha(e.target.value)} sx={{ bgcolor: 'white', borderRadius: 2 }} />
            </>
          )}
        </Box>
      </Box>

      {loading ? (
        <Typography textAlign="center">Cargando datos...</Typography>
      ) : (
        <>
          <Tabs value={tabIndex} onChange={(e, newIndex) => setTabIndex(newIndex)} sx={{ mb: 4, '& .MuiTabs-flexContainer': { gap: 2 } }} TabIndicatorProps={{ style: { display: 'none' } }}>
            {['📦 Pendientes', '✅ Entregados', '❌ Cancelados'].map((label, idx) => (
              <Tab key={idx} label={label} sx={{ borderRadius: 8, border: '1px solid #e2e8f0', bgcolor: tabIndex === idx ? '#4caf50' : '#f8fafc', color: tabIndex === idx ? 'white !important' : 'text.primary', fontWeight: 'bold', textTransform: 'none', transition: 'all 0.2s', minHeight: 40, py: 1 }} />
            ))}
          </Tabs>

          {tabIndex === 0 && (
            pedidosPendientes.length === 0 ? <Typography textAlign="center" color="text.secondary">No tenés entregas pendientes hoy</Typography> :
            pedidosPendientes.map(pedido => (
              <Card key={`${pedido.id}-${pedido.task_date}`} sx={cardStyle}>
                <Box sx={{ bgcolor: '#f8fafc', p: 2, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight="bold">📦 Pedido #{pedido.id}</Typography>
                  <Chip size="small" color="primary" label={dayjs(pedido.task_date).format('dddd DD/MM')} sx={{ fontWeight: 'bold', textTransform: 'capitalize' }} />
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <PersonOutlineIcon color="action" fontSize="small" />
                    <Typography fontWeight="500">{pedido.usuario?.nombre} {pedido.usuario?.apellido || ''}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <MapIcon color="action" fontSize="small" />
                    <Typography>{pedido.usuario?.direccion || 'Sin dirección'}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <PhoneIcon color="action" fontSize="small" />
                    <Typography>{pedido.usuario?.telefono || 'Sin teléfono'}</Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Detalle del pedido</Typography>
                  {renderContenidoPedido(pedido)}

                  {pedido.observaciones && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fffbeb', borderRadius: 2, border: '1px solid #fde68a' }}>
                      <Typography variant="body2" color="#b45309">💬 <strong>Observaciones:</strong> {pedido.observaciones}</Typography>
                    </Box>
                  )}

                  <Box sx={{ mt: 3 }}>
                    <MapaCliente direccion={pedido.usuario?.direccion} nombre={pedido.usuario?.nombre} />
                    <Button href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pedido.usuario?.direccion || '')}`} target="_blank" rel="noopener noreferrer" variant="outlined" color="primary" fullWidth sx={{ mt: 2, borderRadius: 2, fontWeight: 'bold' }}>
                      Abrir en Google Maps
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    {pedido.task_status !== 'en camino' && (
                      <Button variant="outlined" startIcon={<LocalShippingIcon />} onClick={() => cambiarEstado(pedido.id, 'en camino', pedido.task_date)} sx={{ borderRadius: 2, flex: 1, fontWeight: 'bold' }}>
                        En camino
                      </Button>
                    )}
                    <Button variant="contained" color="success" startIcon={<DoneIcon />} onClick={() => cambiarEstado(pedido.id, 'entregado', pedido.task_date)} sx={{ borderRadius: 2, flex: 1, fontWeight: 'bold', boxShadow: '0 4px 14px rgba(76, 175, 80, 0.4)' }}>
                      Entregado
                    </Button>
                    <Button variant="text" color="error" onClick={() => { setPedidoActual(pedido); setMostrarModalMotivo(true); }} sx={{ fontWeight: 'bold' }}>
                      Rechazar
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}

          {tabIndex === 1 && pedidosEntregados.map(pedido => (
            <Card key={`${pedido.id}-${pedido.task_date}`} sx={{ mb: 3, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 4 }}>
              <CardContent>
                <Typography variant="h6" color="#166534" fontWeight="bold">✅ Pedido #{pedido.id} ({dayjs(pedido.task_date).format('DD/MM')})</Typography>
                <Typography mt={1}>👤 {pedido.usuario?.nombre}</Typography>
                <Typography>📍 {pedido.usuario?.direccion}</Typography>
              </CardContent>
            </Card>
          ))}

          {tabIndex === 2 && pedidosCancelados.map(pedido => (
            <Card key={`${pedido.id}-${pedido.task_date}`} sx={{ mb: 3, bgcolor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4 }}>
              <CardContent>
                <Typography variant="h6" color="#991b1b" fontWeight="bold">❌ Pedido #{pedido.id} ({pedido.task_status}) - {dayjs(pedido.task_date).format('DD/MM')}</Typography>
                <Typography mt={1}>👤 {pedido.usuario?.nombre}</Typography>
                <Typography>📍 {pedido.usuario?.direccion}</Typography>
                <Divider sx={{ my: 1.5 }} />
                {renderContenidoPedido(pedido)}
                <Button variant="outlined" color="success" sx={{ mt: 2, borderRadius: 2, fontWeight: 'bold' }} onClick={() => cambiarEstado(pedido.id, 'entregado', pedido.task_date)}>
                  ✅ Marcar como entregado
                </Button>
              </CardContent>
            </Card>
          ))}
        </>
      )}

      <Box sx={{ mt: 6, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssignmentIndIcon color="primary" />
        <Typography variant="h5" fontWeight="bold">Pedidos disponibles sin asignar</Typography>
      </Box>

      {pedidosSinAsignar.length === 0 ? (
        <Alert severity="success" sx={{ borderRadius: 3 }}>¡Todo al día! No hay pedidos sueltos por ahora.</Alert>
      ) : (
        pedidosSinAsignar.map(pedido => (
          <Card key={`${pedido.id}-${pedido.task_date}`} sx={{ mb: 3, borderRadius: 4, borderLeft: '6px solid #3b82f6', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" fontWeight="bold">Pedido #{pedido.id}</Typography>
                <Chip size="small" color="primary" label={dayjs(pedido.task_date).format('dddd DD/MM')} sx={{ fontWeight: 'bold', textTransform: 'capitalize' }} />
              </Box>
              <Typography>🧍 <strong>Cliente:</strong> {pedido.usuario?.nombre}</Typography>
              <Typography>📍 <strong>Dirección:</strong> {pedido.usuario?.direccion}</Typography>
              <Typography color="text.secondary" variant="body2" mt={1}>💬 {pedido.observaciones || 'Sin observaciones'}</Typography>

              <Box sx={{ mt: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                {renderContenidoPedido(pedido)}
              </Box>

              <Button variant="contained" fullWidth sx={{ mt: 3, borderRadius: 2, py: 1.5, fontWeight: 'bold', bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }} startIcon={<AssignmentIndIcon />} onClick={() => autoAsignarPedido(pedido.id)}>
                ¡Asignarme este pedido!
              </Button>
            </CardContent>
          </Card>
        ))
      )}

      <Snackbar open={mostrarSnackbar} autoHideDuration={3000} onClose={() => setMostrarSnackbar(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setMostrarSnackbar(false)} severity="success" sx={{ width: '100%', borderRadius: 2 }}>{mensajeExito}</Alert>
      </Snackbar>

      {mostrarModalMotivo && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <Card sx={{ width: '90%', maxWidth: 400, p: 3, borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Motivo de rechazo (Pedido #{pedidoActual?.id})</Typography>
            <TextField multiline rows={4} fullWidth variant="outlined" placeholder="Escribí el motivo por el que no se pudo entregar..." value={motivoNoEntrega} onChange={e => setMotivoNoEntrega(e.target.value)} sx={{ mt: 2 }} />
            <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 3 }}>
              <Button variant="text" color="inherit" onClick={() => setMostrarModalMotivo(false)} sx={{ fontWeight: 'bold' }}>Cancelar</Button>
              <Button variant="contained" color="error" onClick={marcarNoEntregado} sx={{ borderRadius: 2, fontWeight: 'bold' }}>Rechazar Pedido</Button>
            </Box>
          </Card>
        </Box>
      )}
    </Container>
  );
};

export default DeliveryDashboard;
