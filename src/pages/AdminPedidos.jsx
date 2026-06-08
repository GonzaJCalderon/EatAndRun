import api from '../api/api';
import { useEffect, useState } from 'react';
import {
  Container, Typography, Card, Divider, Button, TextField, MenuItem, Select, FormControl, 
  Tabs, Tab, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Autocomplete, Modal, Grid
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const extraMap = {
  "1": "🍰 Postre",
  "2": "🥗 Ensalada",
  "3": "💪 Proteína",
  "ID:1": "🍰 Postre",
  "ID:2": "🥗 Ensalada",
  "ID:3": "💪 Proteína"
};

const normalizarPedidoItems = (items = [], semanaInicio) => {
  const diarios = {};
  const extras = {};
  const tartas = {};
  const fecha_dia_por_dia = {};

  const base = dayjs(semanaInicio); 

  items.forEach((item, idx) => {
    const dia = item.dia?.toLowerCase?.() || 'otro';
    const cantidad = Number(item.quantity || 0);

    if (cantidad <= 0) return;

    const diaEntrega = diaMap[dia];
    if (!diaEntrega) return;

    const fechaEntrega = base.day(diaEntrega);
    fecha_dia_por_dia[dia] = fechaEntrega.format('YYYY-MM-DD');

    if (item.item_type === 'fijo' || item.item_type === 'especial') {
      if (!diarios[dia]) diarios[dia] = {};
      diarios[dia][`Plato ${item.item_id}`] = (diarios[dia][`Plato ${item.item_id}`] || 0) + cantidad;
    } else if (item.item_type === 'extra') {
      if (!extras[dia]) extras[dia] = {};
      const key = `ID:${item.item_id}`;
      extras[dia][key] = (extras[dia][key] || 0) + cantidad;
    } else if (item.item_type === 'tarta') {
      tartas[item.item_id] = (tartas[item.item_id] || 0) + cantidad;
    }
  });

  return { diarios, extras, tartas, fecha_dia_por_dia };
};

const diaMap = {
  lunes: 1, martes: 2, miercoles: 3, miércoles: 3, jueves: 4, viernes: 5
};

const combinarItems = (arr1, arr2) => {
  const map = {};
  [...arr1, ...arr2].forEach(item => {
    let nombreNorm = (item.nombre || '').toString().trim();
    
    // Limpieza de errores comunes de tipeo en la base de datos
    if (nombreNorm.startsWith('tarta-tarta-')) {
      nombreNorm = nombreNorm.replace('tarta-tarta-', 'tarta-');
    }

    // Buscamos si ya existe ignorando mayúsculas/minúsculas
    const existingKey = Object.keys(map).find(k => k.toLowerCase() === nombreNorm.toLowerCase());
    
    if (existingKey) {
      map[existingKey] += item.cantidad;
    } else {
      map[nombreNorm] = item.cantidad;
    }
  });
  return Object.entries(map).map(([nombre, cantidad]) => ({ nombre, cantidad }));
};

const agruparPedidosPorFechaConDetalle = (pedidos) => {
  const resultado = {};

  const addOrMergeDetalle = (fechaReal, detalleObj) => {
    if (!resultado[fechaReal]) resultado[fechaReal] = [];
    
    // Buscar si ya existe este cliente (por email o nombre+telefono) en este día
    const existente = resultado[fechaReal].find(d => 
      (d.email && d.email === detalleObj.email) || 
      (d.nombreCompleto === detalleObj.nombreCompleto && d.telefono === detalleObj.telefono)
    );

    if (existente) {
      if (!existente.ids.includes(detalleObj.id)) existente.ids.push(detalleObj.id);
      if (detalleObj.comprobanteUrl && !existente.comprobanteUrl) existente.comprobanteUrl = detalleObj.comprobanteUrl;
      existente.platos = combinarItems(existente.platos, detalleObj.platos);
      existente.extras = combinarItems(existente.extras, detalleObj.extras);
      existente.tartas = combinarItems(existente.tartas, detalleObj.tartas);
    } else {
      detalleObj.ids = [detalleObj.id];
      resultado[fechaReal].push(detalleObj);
    }
  };

  pedidos.forEach(p => {
    const { usuario, pedido: pedidoObj, estado, tipo_menu, id, fecha, empresa_nombre } = p;
    const esEmpresa = tipo_menu === 'empresa';
    const nombreCompleto = [usuario?.nombre, usuario?.apellido].filter(Boolean).join(' ');
    const direccion = usuario?.direccion || '';
    const subdireccion = usuario?.direccionSecundaria || '';
    const telefono = usuario?.telefono || '';
    const email = usuario?.email || '';

    const baseDetalle = {
      id, nombreCompleto, direccion, subdireccion, telefono, email,
      empresa_nombre: empresa_nombre || '', estado, delivery: p.delivery || {},
      esEmpresa, metodoPago: p.metodoPago || null, comprobanteUrl: p.comprobanteUrl || null,
      platos: [], extras: [], tartas: []
    };

    for (const [dia, items] of Object.entries(pedidoObj?.diarios || {})) {
      const diaKey = dia.split(' ')[0].toLowerCase();
      const fallbackDate = dayjs(p.fecha ? p.fecha.toString().split('T')[0] : undefined).day(diaMap[diaKey] || 1).format('YYYY-MM-DD');
      const fechaReal = pedidoObj.fecha_dia_por_dia?.[diaKey] || fallbackDate;

      if (!fechaReal || fechaReal === 'Invalid Date') continue;
      const detalle = { ...baseDetalle, platos: [], extras: [], tartas: [] };
      for (const [plato, cantidad] of Object.entries(items)) detalle.platos.push({ nombre: plato, cantidad });
      addOrMergeDetalle(fechaReal, detalle);
    }

    for (const [dia, items] of Object.entries(pedidoObj?.extras || {})) {
      const diaKey = dia.split(' ')[0].toLowerCase();
      const fallbackDate = dayjs(p.fecha ? p.fecha.toString().split('T')[0] : undefined).day(diaMap[diaKey] || 4).format('YYYY-MM-DD');
      const fechaReal = pedidoObj.fecha_dia_por_dia?.[diaKey] || fallbackDate;
      if (!fechaReal || fechaReal === 'Invalid Date') continue;
      const detalle = { ...baseDetalle, platos: [], extras: [], tartas: [] };
      for (const [extra, cantidad] of Object.entries(items)) detalle.extras.push({ nombre: extra, cantidad });
      addOrMergeDetalle(fechaReal, detalle);
    }

    if (Object.keys(pedidoObj?.tartas || {}).length > 0) {
      // Tartas van a una pestaña fija '__TARTAS__'
      const detalle = { ...baseDetalle, platos: [], extras: [], tartas: [] };
      for (const [tarta, cantidad] of Object.entries(pedidoObj.tartas)) detalle.tartas.push({ nombre: tarta, cantidad });
      addOrMergeDetalle('__TARTAS__', detalle);
    }
  });

  return Object.fromEntries(
    Object.entries(resultado).sort(([a], [b]) => {
      if (a === 'Fecha desconocida') return 1;
      if (b === 'Fecha desconocida') return -1;
      return new Date(a) - new Date(b);
    })
  );
};

const formatearFechaBonita = (isoDate) => {
  if (!isoDate || isoDate === 'Fecha desconocida' || isoDate === 'Invalid Date') return '📦 Especiales / Sin Fecha';
  try {
    // Si isoDate es "YYYY-MM-DD", dayjs lo asume como medianoche local y NO lo mueve de día
    const fecha = dayjs(isoDate);
    if (!fecha.isValid()) return '📦 Especiales / Sin Fecha';
    const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);
    return `${capitalize(fecha.format('dddd'))} ${fecha.format('DD-MM')}`;
  } catch (e) {
    return '📦 Especiales / Sin Fecha';
  }
};

const getEstadoColor = (estado) => {
  switch(estado) {
    case 'pendiente': return '#fef08a';
    case 'preparando': return '#fed7aa';
    case 'en camino': return '#bfdbfe';
    case 'entregado': return '#bbf7d0';
    case 'cancelado': return '#fecaca';
    default: return '#f1f5f9';
  }
};

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [resumenDetallado, setResumenDetallado] = useState({});
  const [busqueda, setBusqueda] = useState('');
  const [semanaActiva, setSemanaActiva] = useState(null);
  const [tabDia, setTabDia] = useState('');
  const [opcionesDelivery, setOpcionesDelivery] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [comprobanteUrl, setComprobanteUrl] = useState(null);
  const [filtroDesde, setFiltroDesde] = useState(null);
  const [filtroHasta, setFiltroHasta] = useState(null);
  const [dictPlatos, setDictPlatos] = useState({});

  // Resolver ID:XX → nombre real usando el menú fijo
  const resolverNombre = (nombre) => {
    if (!nombre) return nombre;
    const id = nombre.replace(/^ID:/, '');
    return dictPlatos[`ID:${id}`] || dictPlatos[id] || nombre;
  };

  useEffect(() => {
    api.get('/semana/actual').then(res => {
      const semana = res.data.semana || res.data;
      setSemanaActiva(semana);
    });
    // Cargar diccionario de platos para resolver ID:XX sin depender del backend
    api.get('/fixed').then(res => {
      const dict = {};
      (res.data || []).forEach(p => {
        dict[`ID:${p.id}`] = p.name;
        dict[`${p.id}`] = p.name;
      });
      setDictPlatos(dict);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!semanaActiva) return;
    api.get('/admin/orders').then(res => {
      const pedidosNormalizados = res.data.map(p => {
        if (!p.pedido?.diarios && Array.isArray(p.items)) {
          const normalizado = normalizarPedidoItems(p.items, semanaActiva.semana_inicio);
          return { ...p, pedido: { ...normalizado } };
        }
        return p;
      });
      setPedidos(pedidosNormalizados);
    });
  }, [semanaActiva]);

  useEffect(() => {
    let pedidosFiltrados = [...pedidos];
    if (filtroDesde) {
      const desdeDate = dayjs(filtroDesde).startOf('day');
      pedidosFiltrados = pedidosFiltrados.filter(p => dayjs(p.fecha).startOf('day').isSameOrAfter(desdeDate));
    }
    if (filtroHasta) {
      const hastaDate = dayjs(filtroHasta).endOf('day');
      pedidosFiltrados = pedidosFiltrados.filter(p => dayjs(p.fecha).startOf('day').isSameOrBefore(hastaDate));
    }
    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase();
      pedidosFiltrados = pedidosFiltrados.filter(p => {
        const { usuario, empresa_nombre = '' } = p;
        return (
          (usuario?.nombre?.toLowerCase().includes(texto)) ||
          (usuario?.apellido?.toLowerCase().includes(texto)) ||
          (usuario?.email?.toLowerCase().includes(texto)) ||
          (usuario?.direccion?.toLowerCase().includes(texto)) ||
          (usuario?.direccionSecundaria?.toLowerCase().includes(texto)) ||
          (empresa_nombre?.toLowerCase().includes(texto))
        );
      });
    }

    const agrupado = agruparPedidosPorFechaConDetalle(pedidosFiltrados);
    setResumenDetallado(agrupado);

    const fechas = Object.keys(agrupado);
    if (!tabDia || !fechas.includes(tabDia)) {
      setTabDia(fechas[0] || 'HISTORIAL');
    }
  }, [pedidos, filtroDesde, filtroHasta, busqueda]);

  const fechasDisponibles = Object.keys(resumenDetallado);
  const historialCompletoAgrupado = agruparPedidosPorFechaConDetalle(pedidos);

  const cambiarEstadoPedido = (ids, estado) => {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    Promise.all(idsArray.map(orderId => api.put(`/orders/${orderId}`, { status: estado })))
      .then(() => {
        const updated = pedidos.map(p => idsArray.includes(p.id) ? { ...p, estado } : p);
        setPedidos(updated);
      });
  };

  const asignarDelivery = async (ids, delivery) => {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    try {
      if (!delivery?.id) return;
      await Promise.all(idsArray.map(orderId => api.put(`/orders/${orderId}/assign`, { delivery_id: delivery.id })));
      const actualizado = pedidos.map(p => idsArray.includes(p.id) ? { ...p, delivery } : p);
      setPedidos(actualizado);
    } catch (error) { }
  };

  if (!semanaActiva) return <Typography sx={{ mt: 4, textAlign: 'center' }}>Cargando información...</Typography>;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, pb: 10 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => window.location.href = '/admin'} sx={{ borderRadius: 2 }}>
          Volver
        </Button>
        <Typography variant="h4" fontWeight="bold" color="primary.main">
          🚚 Despacho y Logística
        </Typography>
      </Box>

      <Card sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker label="Fecha Desde" value={filtroDesde} onChange={setFiltroDesde} slotProps={{ textField: { fullWidth: true, size: 'small' } }} />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker label="Fecha Hasta" value={filtroHasta} onChange={setFiltroHasta} slotProps={{ textField: { fullWidth: true, size: 'small' } }} />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Buscar cliente, empresa, email o dirección..."
              fullWidth size="small" value={busqueda} onChange={e => setBusqueda(e.target.value)}
              sx={{ backgroundColor: '#fff' }}
            />
          </Grid>
        </Grid>
      </Card>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs
          value={tabDia}
          onChange={(e, val) => setTabDia(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ '& .MuiTab-root': { fontWeight: 'bold', fontSize: '1rem', textTransform: 'capitalize', minHeight: 60 }, '& .Mui-selected': { color: '#1976d2' } }}
        >
          {fechasDisponibles.filter(f => f !== '__TARTAS__').map(f => (
            <Tab key={f} label={formatearFechaBonita(f)} value={f} />
          ))}
          {fechasDisponibles.includes('__TARTAS__') && (
            <Tab key="__TARTAS__" label="🥧 Tartas" value="__TARTAS__" />
          )}
          <Tab label="📜 Historial Completo" value="HISTORIAL" sx={{ color: '#d32f2f' }} />
        </Tabs>
      </Box>

      {tabDia !== 'HISTORIAL' && (
        <TableContainer component={Paper} sx={{ boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', borderRadius: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Cliente / Empresa</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Contacto / Dirección</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Detalle del Pedido</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Delivery Asignado</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '15%', textAlign: 'center' }}>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(resumenDetallado[tabDia] && resumenDetallado[tabDia].length > 0) ? (
                resumenDetallado[tabDia].map((pedido, i) => (
                  <TableRow key={i} hover sx={{ '&:last-child td, &:last-child th': { border: 0 }, bgcolor: pedido.esEmpresa ? '#f0f9ff' : 'inherit' }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {pedido.esEmpresa ? '🏢' : '👤'} {pedido.nombreCompleto}
                      </Typography>
                      {pedido.empresa_nombre && (
                        <Chip label={pedido.empresa_nombre} size="small" color="primary" variant="outlined" sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }} />
                      )}
                      {pedido.comprobanteUrl && (
                        <Button size="small" variant="text" sx={{ display: 'block', mt: 1, p: 0, fontSize: '0.75rem', textTransform: 'none' }} onClick={() => { setComprobanteUrl(pedido.comprobanteUrl); setModalOpen(true); }}>
                          📎 Ver Comprobante
                        </Button>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}><strong>Tel:</strong> {pedido.telefono}</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}><strong>Dir:</strong> {pedido.direccion}</Typography>
                      {pedido.subdireccion && <Typography variant="body2" sx={{ fontSize: '0.8rem' }}><strong>Alt:</strong> {pedido.subdireccion}</Typography>}
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {pedido.platos.map((plato, j) => (
                          <Typography key={j} variant="caption" sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#f1f5f9', px: 1, borderRadius: 1 }}>
                            <span>🍽 {resolverNombre(plato.nombre)}</span> <strong>x{plato.cantidad}</strong>
                          </Typography>
                        ))}
                        {pedido.extras.map((extra, j) => {
                          const id = extra.nombre?.replace?.(/^ID:/, '') || '';
                          return (
                            <Typography key={`e${j}`} variant="caption" sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#fef3c7', px: 1, borderRadius: 1 }}>
                              <span>➕ {extraMap[extra.nombre] || extraMap[id] || `Extra ${id}`}</span> <strong>x{extra.cantidad}</strong>
                            </Typography>
                          );
                        })}
                        {pedido.tartas.map((tarta, j) => (
                          <Typography key={`t${j}`} variant="caption" sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#fce7f3', px: 1, borderRadius: 1 }}>
                            <span>🥧 {tarta.nombre}</span> <strong>x{tarta.cantidad}</strong>
                          </Typography>
                        ))}
                      </Box>
                    </TableCell>

                    <TableCell>
                      {pedido.delivery?.nombre ? (
                        <Box>
                          <Typography variant="body2" fontWeight="bold">{pedido.delivery.nombre}</Typography>
                          <Typography variant="caption" color="text.secondary">{pedido.delivery.telefono}</Typography>
                          <Button size="small" sx={{ fontSize: '0.65rem', minWidth: 'auto', p: 0, mt: 0.5 }} onClick={() => asignarDelivery(pedido.ids, { id: null, nombre: '', telefono: '' })}>
                            Cambiar
                          </Button>
                        </Box>
                      ) : (
                        <Autocomplete
                          freeSolo size="small"
                          onInputChange={async (e, value) => {
                            const res = await api.get('/deliveries/search?q=' + value);
                            setOpcionesDelivery(prev => ({ ...prev, [pedido.ids[0]]: res.data }));
                          }}
                          onChange={(e, selected) => { if (selected) asignarDelivery(pedido.ids, selected); }}
                          options={opcionesDelivery[pedido.ids[0]] || []}
                          getOptionLabel={(option) => typeof option === 'string' ? option : `${option.name}`}
                          renderInput={(params) => <TextField {...params} label="Asignar..." variant="standard" />}
                        />
                      )}
                    </TableCell>

                    <TableCell align="center">
                      <FormControl fullWidth size="small" variant="standard">
                        <Select
                          value={pedido.estado}
                          onChange={e => cambiarEstadoPedido(pedido.ids, e.target.value)}
                          disableUnderline
                          sx={{
                            bgcolor: getEstadoColor(pedido.estado),
                            px: 1, py: 0.5, borderRadius: 1, fontSize: '0.85rem', fontWeight: 'bold'
                          }}
                        >
                          <MenuItem value="pendiente">🟡 Pendiente</MenuItem>
                          <MenuItem value="preparando">🍳 Preparando</MenuItem>
                          <MenuItem value="en camino">🚚 En camino</MenuItem>
                          <MenuItem value="entregado">📦 Entregado</MenuItem>
                          <MenuItem value="cancelado">❌ Cancelado</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No hay pedidos para este día.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tabDia === 'HISTORIAL' && (
        <Typography variant="h6" sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
          El historial completo ahora se maneja en la nueva tabla por día. Seleccioná una fecha arriba.
        </Typography>
      )}

      {comprobanteUrl && (
        <Modal open={modalOpen} onClose={() => { setModalOpen(false); setComprobanteUrl(null); }}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#fff', p: 1, boxShadow: 24, borderRadius: 2, maxWidth: '90vw', maxHeight: '90vh' }}>
            {comprobanteUrl.endsWith('.pdf') ? (
              <iframe src={comprobanteUrl} width="100%" height="600px" title="Comprobante" />
            ) : (
              <img src={comprobanteUrl} alt="Comprobante" style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain' }} />
            )}
          </Box>
        </Modal>
      )}
    </Container>
  );
};

export default AdminPedidos;
