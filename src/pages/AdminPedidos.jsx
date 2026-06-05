import api from '../api/api';
import { useEffect, useState } from 'react';
import {
  Container, Typography, Card, CardContent, Divider,
  Button, TextField, MenuItem, Select, FormControl, InputLabel,
  Tabs, Tab, Box
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Autocomplete from '@mui/material/Autocomplete';
import Modal from '@mui/material/Modal';
import { saveAs } from 'file-saver';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ResumenVisualPorDia from '../components/ResumenVisualPordia';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import * as XLSX from 'xlsx';
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

  const base = dayjs(semanaInicio); // semana activa
  console.log('📆 Base semanaInicio:', semanaInicio);

  items.forEach((item, idx) => {
    const dia = item.dia?.toLowerCase?.() || 'otro';
    const cantidad = Number(item.quantity || 0);

    console.log(`📦 Item[${idx}] →`, {
      diaOriginal: item.dia,
      diaUsado: dia,
      cantidad,
      item_id: item.item_id,
      tipo: item.item_type,
    });

    if (cantidad <= 0) return;

    const diaEntrega = diaMap[dia];
    if (!diaEntrega) {
      console.warn('❌ Día inválido:', dia);
      return;
    }

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

  console.log('✅ Resultado → fecha_dia_por_dia:', fecha_dia_por_dia);

  return { diarios, extras, tartas, fecha_dia_por_dia };
};



const diaMap = {
  lunes: 1,
  martes: 2,
  miercoles: 3,
  miércoles: 3,
  jueves: 4,
  viernes: 5
};


const exportarResumenVisualExcel = (resumenDetallado) => {
  const wb = XLSX.utils.book_new();

  Object.entries(resumenDetallado).forEach(([fechaKey, pedidos]) => {
    const agrupadoPorPlato = {};
    const totalesPorPlato = {};
    const totalesIndividual = {};
    const totalesEmpresa = {};

    // Agrupar por plato
    pedidos.forEach(p => {
      const tipo = p.esEmpresa ? 'empresa' : 'individual';
      p.platos.forEach(plato => {
        const nombre = plato.nombre;
        if (!agrupadoPorPlato[nombre]) agrupadoPorPlato[nombre] = [];
        agrupadoPorPlato[nombre].push(p.nombreCompleto);

        // Totales
        totalesPorPlato[nombre] = (totalesPorPlato[nombre] || 0) + plato.cantidad;
        if (tipo === 'empresa') {
          totalesEmpresa[nombre] = (totalesEmpresa[nombre] || 0) + plato.cantidad;
        } else {
          totalesIndividual[nombre] = (totalesIndividual[nombre] || 0) + plato.cantidad;
        }
      });
    });

    // Crear hoja estilo tabla como la imagen 📋
    const sheetData = [];

    // 1. Encabezado horizontal con todos los platos
    const platos = Object.keys(agrupadoPorPlato);
    sheetData.push(platos);

    // 2. Máximo de filas necesarias
    const maxFilas = Math.max(...Object.values(agrupadoPorPlato).map(arr => arr.length));

    // 3. Rellenar nombres de personas debajo de cada plato
    for (let i = 0; i < maxFilas; i++) {
      const fila = platos.map(plato => agrupadoPorPlato[plato][i] || '');
      sheetData.push(fila);
    }

    // 4. Fila vacía
    sheetData.push([]);

    // 5. Totales individuales y empresas por plato
    sheetData.push(['PLATO', 'INDIVIDUAL', 'EMPRESA', 'TOTAL']);
    platos.forEach(plato => {
      const fila = [
        plato,
        totalesIndividual[plato] || 0,
        totalesEmpresa[plato] || 0,
        totalesPorPlato[plato] || 0
      ];
      sheetData.push(fila);
    });

    // 6. Fila TOTAL general
    const totalGeneral = Object.values(totalesPorPlato).reduce((a, b) => a + b, 0);
    sheetData.push([]);
    sheetData.push(['TOTAL GENERAL', '', '', totalGeneral]);

    // 📄 Crear hoja
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, dayjs(fechaKey).format('dddd DD/MM'));
  });

  // 📥 Exportar Excel
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'resumen-visual.xlsx');
};


const exportarResumenCSV = (resumen) => {
  let csv = 'Fecha Real;Plato;Cantidad;Usuario;Teléfono;Dirección;Empresa\n';

  Object.entries(resumen).forEach(([fechaReal, pedidosDelDia]) => {
    pedidosDelDia.forEach(pedido => {
      pedido.platos.forEach(plato => {
        csv += `${fechaReal};${plato.nombre};${plato.cantidad};${pedido.nombreCompleto};${pedido.telefono};${pedido.direccion};${pedido.empresa_nombre || (pedido.esEmpresa ? 'SÍ' : 'NO')}\n`;
      });
      pedido.extras.forEach(extra => {
        csv += `${fechaReal};EXTRA: ${extra.nombre};${extra.cantidad};${pedido.nombreCompleto};${pedido.telefono};${pedido.direccion};${pedido.empresa_nombre || (pedido.esEmpresa ? 'SÍ' : 'NO')}\n`;
      });
      pedido.tartas.forEach(tarta => {
        csv += `${fechaReal};TARTA: ${tarta.nombre};${tarta.cantidad};${pedido.nombreCompleto};${pedido.telefono};${pedido.direccion};${pedido.empresa_nombre || (pedido.esEmpresa ? 'SÍ' : 'NO')}\n`;
      });
    });
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `resumen-detallado-${new Date().toISOString().slice(0, 10)}.csv`);
};


// agrupador con empresa
const agruparPedidosPorFechaConDetalle = (pedidos) => {
  const resultado = {};

  pedidos.forEach(p => {
    const { usuario, pedido: pedidoObj, estado, tipo_menu, id, fecha, empresa_nombre } = p;
    const esEmpresa = tipo_menu === 'empresa';
    const nombreCompleto = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ');
    const direccion = usuario.direccion || '';
    const subdireccion = usuario.direccionSecundaria || '';
    const telefono = usuario.telefono || '';
    const email = usuario.email || '';

    // 👉 base común para todos los días
    const baseDetalle = {
      id,
      nombreCompleto,
      direccion,
      subdireccion,
      telefono,
      email,
      empresa_nombre: empresa_nombre || '',
      estado,
      delivery: p.delivery || {},
      esEmpresa,
      metodoPago: p.metodoPago || null,
      comprobanteUrl: p.comprobanteUrl || null,
      platos: [],
      extras: [],
      tartas: [] // Las agrupamos después si querés
    };

    // ✅ Agrupar diarios por día real
    for (const [dia, items] of Object.entries(pedidoObj.diarios || {})) {
const fechaReal = pedidoObj.fecha_dia_por_dia?.[dia.toLowerCase()]
  || dayjs(p.fecha).startOf('week').add(diaMap[dia.toLowerCase()] - 1, 'day').format('YYYY-MM-DD');

      if (!fechaReal) continue;

      const detalle = { ...baseDetalle, platos: [], extras: [], tartas: [] };

      for (const [plato, cantidad] of Object.entries(items)) {
        detalle.platos.push({ nombre: plato, cantidad });
      }

      if (!resultado[fechaReal]) resultado[fechaReal] = [];
      resultado[fechaReal].push(detalle);
    }

    // ✅ Agrupar extras por día real
    for (const [dia, items] of Object.entries(pedidoObj.extras || {})) {
      const fechaReal = pedidoObj.fecha_dia_por_dia?.[dia.toLowerCase()];
      if (!fechaReal) continue;

      const detalle = { ...baseDetalle, platos: [], extras: [], tartas: [] };

      for (const [extra, cantidad] of Object.entries(items)) {
        detalle.extras.push({ nombre: extra, cantidad });
      }

      if (!resultado[fechaReal]) resultado[fechaReal] = [];
      resultado[fechaReal].push(detalle);
    }

    // 🥧 Tartas → no tienen día, se agrupan por fecha original del pedido
    if (Object.keys(pedidoObj.tartas || {}).length > 0) {
      let fechaKey = 'Fecha desconocida';
      try {
        if (fecha) {
          fechaKey = new Date(fecha).toISOString().slice(0, 10);
        }
      } catch (e) {
        console.warn('Fecha inválida para tarta:', fecha);
      }
      
      const detalle = { ...baseDetalle, platos: [], extras: [], tartas: [] };

      for (const [tarta, cantidad] of Object.entries(pedidoObj.tartas)) {
        detalle.tartas.push({ nombre: tarta, cantidad });
      }

      if (!resultado[fechaKey]) resultado[fechaKey] = [];
      resultado[fechaKey].push(detalle);
    }
  });

  // 📅 Ordenar fechas
  return Object.fromEntries(
    Object.entries(resultado).sort(([a], [b]) => new Date(a) - new Date(b))
  );
};


const formatearFechaBonita = (isoDate) => {
  if (!isoDate || isoDate === 'Fecha desconocida' || isoDate === 'Invalid Date') return '📦 Especiales / Sin Fecha';
  try {
    const fecha = new Date(isoDate);
    if (isNaN(fecha.getTime())) return '📦 Especiales / Sin Fecha';
    return new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit'
    }).format(fecha);
  } catch (e) {
    return '📦 Especiales / Sin Fecha';
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

  // Filtros de fechas
  const [filtroDesde, setFiltroDesde] = useState(null);
  const [filtroHasta, setFiltroHasta] = useState(null);

 // Primero: obtener semana activa
useEffect(() => {
  api.get('/semana/actual').then(res => {
    const semana = res.data.semana || res.data;
    console.log('🗓️ Semana activa recibida:', semana);
    setSemanaActiva(semana);
  });
}, []);

// Segundo: obtener pedidos SOLO CUANDO haya semana activa
useEffect(() => {
  if (!semanaActiva) return;

  api.get('/admin/orders').then(res => {
  const pedidosNormalizados = res.data.map(p => {
  if (!p.pedido?.diarios && Array.isArray(p.items)) {
    const normalizado = normalizarPedidoItems(p.items, semanaActiva.semana_inicio);
    return {
      ...p,
      pedido: {
        ...normalizado
      }
    };
  }
  return p;
});

    setPedidos(pedidosNormalizados);
  });
}, [semanaActiva]); // 👈 esto asegura que se ejecute cuando la semana esté cargada




  // Agrupa pedidos cuando cambian filtros/busqueda
  useEffect(() => {
    let pedidosFiltrados = [...pedidos];

    // Filtro fechas
    if (filtroDesde) {
      const desdeDate = dayjs(filtroDesde).startOf('day');
     pedidosFiltrados = pedidosFiltrados.filter(p =>
  dayjs(p.fecha).startOf('day').isSameOrAfter(desdeDate)
);

    }
    if (filtroHasta) {
      const hastaDate = dayjs(filtroHasta).endOf('day');
     pedidosFiltrados = pedidosFiltrados.filter(p =>
  dayjs(p.fecha).startOf('day').isSameOrBefore(hastaDate)
);

    }

    // Filtro busqueda: nombre, apellido, email, dirección, subdirección, empresa
    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase();
      pedidosFiltrados = pedidosFiltrados.filter(p => {
        const { usuario, empresa_nombre = '' } = p;
        return (
          (usuario.nombre && usuario.nombre.toLowerCase().includes(texto)) ||
          (usuario.apellido && usuario.apellido.toLowerCase().includes(texto)) ||
          (usuario.email && usuario.email.toLowerCase().includes(texto)) ||
          (usuario.direccion && usuario.direccion.toLowerCase().includes(texto)) ||
          (usuario.direccionSecundaria && usuario.direccionSecundaria.toLowerCase().includes(texto)) ||
          (empresa_nombre && empresa_nombre.toLowerCase().includes(texto))
        );
      });
    }

 const agrupado = agruparPedidosPorFechaConDetalle(pedidosFiltrados);
console.log('📊 Fechas en resumenDetallado:', Object.keys(agrupado));
setResumenDetallado(agrupado);
;

    // Mantener la pestaña si existe, o seleccionar la primera
   const fechas = Object.keys(agrupado);
if (!tabDia || !fechas.includes(tabDia)) {
  setTabDia(fechas[0] || 'HISTORIAL');
}

  }, [pedidos, filtroDesde, filtroHasta, busqueda]);

  // Extra: "Historial" fuera de la semana activa
  const fechasDisponibles = Object.keys(resumenDetallado);

  // Busca historial por fuera de la semana activa
// Mostrar TODO el historial agrupado por fechas reales
const historialCompletoAgrupado = agruparPedidosPorFechaConDetalle(pedidos);


  const cambiarEstadoPedido = (id, estado) => {
    api.put(`/orders/${id}`, { status: estado }).then(() => {
      const updated = pedidos.map(p => p.id === id ? { ...p, estado } : p);
      setPedidos(updated);
    });
  };

  const asignarDelivery = async (id, delivery) => {
    try {
      if (!delivery?.id) return;
      await api.put(`/orders/${id}/assign`, { delivery_id: delivery.id });
      const actualizado = pedidos.map(p =>
        p.id === id ? { ...p, delivery } : p
      );
      setPedidos(actualizado);
    } catch (error) {
      //
    }
  };

  const handleVerComprobante = async (pedido) => {
    if (!pedido.comprobanteUrl) return;
    setComprobanteUrl(pedido.comprobanteUrl);
    setModalOpen(true);
  };

  if (!semanaActiva) return <Typography sx={{ mt: 4, textAlign: 'center' }}>Cargando información...</Typography>;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, pb: 10 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />}
          onClick={() => window.location.href = '/admin'} sx={{ borderRadius: 2 }}>
          Volver
        </Button>
        <Typography variant="h4" fontWeight="bold" color="primary.main">
          📋 Gestión de Pedidos
        </Typography>
      </Box>

      {/* Filtros de Fecha y Búsqueda */}
      <Card sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Fecha Desde"
                value={filtroDesde}
                onChange={setFiltroDesde}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Fecha Hasta"
                value={filtroHasta}
                onChange={setFiltroHasta}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Buscar por cliente, empresa, email o dirección..."
              fullWidth
              size="small"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              sx={{ backgroundColor: '#fff' }}
            />
          </Grid>
        </Grid>
      </Card>

      {/* Tabs Modernos */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs
          value={tabDia}
          onChange={(e, val) => setTabDia(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            '& .MuiTab-root': { fontWeight: 'bold', fontSize: '1rem', textTransform: 'capitalize', minHeight: 60 },
            '& .Mui-selected': { color: '#1976d2' }
          }}
        >
          {fechasDisponibles.map(f => (
            <Tab key={f} label={formatearFechaBonita(f)} value={f} />
          ))}
          <Tab label="📜 Historial Completo" value="HISTORIAL" sx={{ color: '#d32f2f' }} />
        </Tabs>
      </Box>

      {/* Pedidos de un día */}
      {tabDia !== 'HISTORIAL' && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h5" fontWeight="bold">Resumen de Preparación</Typography>
            <Button
              variant="contained"
              color="success"
              onClick={() => exportarResumenVisualExcel(resumenDetallado)}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
            >
              📊 Exportar Planilla Excel
            </Button>
          </Box>
          <ResumenVisualPorDia pedidos={resumenDetallado[tabDia] || []} />

          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, mt: 5 }}>Detalle de Entregas</Typography>
          <Grid container spacing={3}>
            {(resumenDetallado[tabDia] && resumenDetallado[tabDia].length > 0)
              ? resumenDetallado[tabDia].map((pedido, i) => (
                <Grid item xs={12} md={6} lg={4} key={i}>
                  <Card sx={{ 
                    borderRadius: 3, 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                    border: '1px solid #e2e8f0',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Box sx={{ bgcolor: pedido.esEmpresa ? '#e0f2fe' : '#f8fafc', p: 2, borderBottom: '1px solid #e2e8f0' }}>
                      <Typography variant="h6" fontWeight="bold" color="text.primary">
                        {pedido.esEmpresa ? '🏢' : '👤'} {pedido.nombreCompleto}
                      </Typography>
                      {pedido.empresa_nombre && (
                        <Typography variant="body2" color="primary.main" fontWeight="bold">
                          Empresa: {pedido.empresa_nombre}
                        </Typography>
                      )}
                    </Box>
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2">📍 <strong>Dirección:</strong> {pedido.direccion}</Typography>
                      {pedido.subdireccion && <Typography variant="body2">📍 <strong>Alternativa:</strong> {pedido.subdireccion}</Typography>}
                      <Typography variant="body2">📞 <strong>Tel:</strong> {pedido.telefono}</Typography>

                      <Divider sx={{ my: 1 }} />
                      <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">PLATOS PEDIDOS</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
                        {pedido.platos.map((plato, j) => (
                          <Typography key={j} variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#f1f5f9', px: 1, py: 0.5, borderRadius: 1 }}>
                            <span>🍽 {typeof plato.nombre === 'object' ? JSON.stringify(plato.nombre) : plato.nombre}</span>
                            <strong>x{typeof plato.cantidad === 'object' ? JSON.stringify(plato.cantidad) : plato.cantidad}</strong>
                          </Typography>
                        ))}
                        {pedido.extras.map((extra, j) => {
                          const id = extra.nombre?.replace?.(/^ID:/, '') || '';
                          const nombreMostrado = extraMap[extra.nombre] || extraMap[id] || `Extra ${id}`;
                          return (
                            <Typography key={`e${j}`} variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#fef3c7', px: 1, py: 0.5, borderRadius: 1 }}>
                              <span>➕ {nombreMostrado}</span>
                              <strong>x{extra.cantidad}</strong>
                            </Typography>
                          );
                        })}
                        {pedido.tartas.map((tarta, j) => (
                          <Typography key={`t${j}`} variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#fce7f3', px: 1, py: 0.5, borderRadius: 1 }}>
                            <span>🥧 {tarta.nombre}</span>
                            <strong>x{tarta.cantidad}</strong>
                          </Typography>
                        ))}
                      </Box>
                      
                      <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', mt: 1 }}>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary">🚚 DELIVERY ASIGNADO</Typography>
                        {pedido.delivery?.nombre ? (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" fontWeight="bold">{pedido.delivery.nombre}</Typography>
                            {pedido.delivery.telefono && <Typography variant="body2" color="text.secondary">{pedido.delivery.telefono}</Typography>}
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <TextField
                                label="Nombre"
                                size="small"
                                value={pedido.delivery?.nombre || ''}
                                fullWidth
                                onChange={e => asignarDelivery(pedido.id, { ...pedido.delivery, nombre: e.target.value })}
                              />
                              <TextField
                                label="Teléfono"
                                size="small"
                                value={pedido.delivery?.telefono || ''}
                                fullWidth
                                onChange={e => asignarDelivery(pedido.id, { ...pedido.delivery, telefono: e.target.value })}
                              />
                            </Box>
                          </Box>
                        ) : (
                          <Box sx={{ mt: 1 }}>
                            <Autocomplete
                              freeSolo
                              size="small"
                              onInputChange={async (e, value) => {
                                const res = await api.get('/deliveries/search?q=' + value);
                                setOpcionesDelivery(prev => ({ ...prev, [pedido.id]: res.data }));
                              }}
                              onChange={(e, selected) => {
                                if (!selected) return;
                                asignarDelivery(pedido.id, selected);
                              }}
                              options={opcionesDelivery[pedido.id] || []}
                              getOptionLabel={(option) => typeof option === 'string' ? option : `${option.name} (${option.email})`}
                              renderInput={(params) => <TextField {...params} label="Buscar delivery" fullWidth />}
                            />
                          </Box>
                        )}
                      </Box>

                      <Box sx={{ mt: 'auto', pt: 2 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Estado de Entrega</InputLabel>
                          <Select
                            value={pedido.estado}
                            label="Estado de Entrega"
                            onChange={e => cambiarEstadoPedido(pedido.id, e.target.value)}
                            sx={{
                              bgcolor: pedido.estado === 'entregado' ? '#dcfce7' : pedido.estado === 'cancelado' ? '#fee2e2' : pedido.estado === 'en camino' ? '#dbeafe' : '#fff',
                              fontWeight: 'bold'
                            }}
                          >
                            <MenuItem value="pendiente">🟡 Pendiente</MenuItem>
                            <MenuItem value="preparando">🍳 Preparando</MenuItem>
                            <MenuItem value="en camino">🚚 En camino</MenuItem>
                            <MenuItem value="entregado">📦 Entregado</MenuItem>
                            <MenuItem value="cancelado">❌ Cancelado</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
              : <Typography sx={{ width: '100%', textAlign: 'center', color: 'text.secondary', mt: 4 }}>No hay pedidos registrados para esta fecha.</Typography>}
          </Grid>
        </>
      )}

      {/* Historial */}
   {/* Historial */}
{tabDia === 'HISTORIAL' && (
  <>
    <Typography variant="h5" sx={{ mt: 3 }}>📜 Historial de Pedidos</Typography>
    {Object.entries(historialCompletoAgrupado).map(([fecha, pedidosDelDia]) => (
      <Box key={fecha} sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          📆 {formatearFechaBonita(fecha)}
        </Typography>

        {pedidosDelDia.map((p, idx) => (
          <Card key={idx} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">
                {p.esEmpresa ? '🏢' : '👤'} {p.nombreCompleto}
                {p.empresa_nombre && (
                  <> — <span style={{ color: '#2074a0' }}>Empresa: <b>{p.empresa_nombre}</b></span></>
                )}
              </Typography>
              <Typography>📧 {p.email}</Typography>
              <Typography>📦 Estado: {p.estado}</Typography>
              <Typography>📞 {p.telefono}</Typography>
              <Typography>📍 {p.direccion}</Typography>
              {p.subdireccion && <Typography>📍 {p.subdireccion}</Typography>}

              <Divider sx={{ my: 1 }} />

              {p.platos.map((plato, j) => (
                <Typography key={j}>🍽️ {plato.cantidad} × {plato.nombre}</Typography>
              ))}
              {p.extras.map((extra, j) => (
                <Typography key={`e${j}`}>➕ {extra.cantidad} extra: {extra.nombre}</Typography>
              ))}
              {p.tartas.map((tarta, j) => (
                <Typography key={`t${j}`}>🥧 {tarta.cantidad} tarta: {tarta.nombre}</Typography>
              ))}
            </CardContent>
          </Card>
        ))}
      </Box>
    ))}
  </>
)}


      {/* Modal comprobante */}
      {comprobanteUrl && (
        <Modal open={modalOpen} onClose={() => {
          setModalOpen(false);
          setComprobanteUrl(null);
        }}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 2,
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            {comprobanteUrl.endsWith('.pdf') ? (
              <iframe
                src={comprobanteUrl}
                width="100%"
                height="600px"
                title="Comprobante PDF"
              />
            ) : (
              <img
                src={comprobanteUrl}
                alt="Comprobante"
                style={{ maxWidth: '100%' }}
              />
            )}
          </Box>
        </Modal>
      )}
    </Container>
  );
};

export default AdminPedidos;
