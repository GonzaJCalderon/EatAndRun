import API from '../api/api';
import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Divider,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box
} from '@mui/material';
import { isThisWeek } from 'date-fns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const exportarResumenCSV = (resumen) => {
  let csv = 'Día;Plato;Cantidad\n';
  Object.entries(resumen).forEach(([dia, platos]) => {
    Object.entries(platos).forEach(([nombre, cantidad]) => {
      csv += `${dia};${nombre};${cantidad}\n`;
    });
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `resumen-${new Date().toISOString().slice(0, 10)}.csv`);
};

const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function calcularTimestampDesdeDia(fechaPedido, diaTexto) {
  if (diaTexto === 'tartas') return new Date(fechaPedido).getTime();
  const diaPedido = new Date(fechaPedido);
  const numeroDia = diasSemana.indexOf(diaTexto.toLowerCase());
  const diferencia = numeroDia - diaPedido.getDay();
  const fechaFinal = new Date(diaPedido);
  fechaFinal.setDate(diaPedido.getDate() + diferencia);
  fechaFinal.setHours(0, 0, 0, 0);
  return fechaFinal.getTime();
}

function formatFechaEntrega(fechaEntrega, diaTexto) {
  const ts = calcularTimestampDesdeDia(fechaEntrega, diaTexto);
  const fecha = new Date(ts);
  return fecha.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}


const agruparPedidosResumen = (pedidos) => {
  const resumen = {};
  const diasPermitidos = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];
  pedidos.forEach(({ pedido }) => {
    if (!pedido) return;
    ['diarios', 'extras', 'tartas'].forEach((tipo) => {
      const grupo = pedido[tipo];
      if (!grupo) return;
      if (typeof Object.values(grupo)[0] === 'object') {
        Object.entries(grupo).forEach(([dia, platos]) => {
          const diaLower = dia.toLowerCase();
          if (!diasPermitidos.includes(diaLower)) return;
          if (!resumen[diaLower]) resumen[diaLower] = {};
          Object.entries(platos).forEach(([nombre, cantidad]) => {
            if (!resumen[diaLower][nombre]) resumen[diaLower][nombre] = 0;
            resumen[diaLower][nombre] += cantidad;
          });
        });
      } else {
        const dia = 'tartas';
        if (!resumen[dia]) resumen[dia] = {};
        Object.entries(grupo).forEach(([nombre, cantidad]) => {
          if (!resumen[dia][nombre]) resumen[dia][nombre] = 0;
          resumen[dia][nombre] += cantidad;
        });
      }
    });
  });
  return resumen;
};


const AdminPedidos = () => {
  const [deliveryUsers, setDeliveryUsers] = useState([]); // ✅ Aquí está OK
  const [pedidos, setPedidos] = useState([]);
  const [resumen, setResumen] = useState({});
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
  const fetchDeliveries = async () => {
const res = await API.get('/admin/users?role=delivery');


    setDeliveryUsers(res.data);
  };

  fetchDeliveries();
}, []);

useEffect(() => {
  const fetchPedidos = async () => {
  try {
    const resAsignados = await API.get('/delivery/orders');
    const resSinAsignar = await API.get('/delivery/unassigned-orders');

    setPedidosAsignados(resAsignados.data);
    setPedidosDisponibles(resSinAsignar.data);
  } catch (err) {
    console.error('❌ Error al obtener pedidos', err);
  }
};

    
    fetchPedidos();
  }, []);

  const cambiarEstadoPedido = async (id, nuevoEstado) => {
    try {
      const res = await API.put(`/orders/${id}`, { status: nuevoEstado });
      const nuevos = pedidos.map(p =>
        p.id === id ? { ...p, estado: res.data.status } : p
      );
      setPedidos(nuevos);
    } catch (error) {
      console.error('❌ Error al actualizar estado:', error);
    }
  };

  const pedidosFiltrados = pedidos.filter((p) => {
    if (!p.fecha || !p.usuario) return false;
    const query = busqueda.toLowerCase();
    const fechaPedido = new Date(p.fecha);
    const coincideBusqueda =
      p.usuario.nombre.toLowerCase().includes(query) ||
      p.usuario.email.toLowerCase().includes(query);
      return (query === '' ? true : coincideBusqueda) && isThisWeek(fechaPedido);
  });

  const mostrarEstado = (estado) => {
    switch (estado) {
      case 'realizado': return '✅ Realizado';
      case 'cancelado': return '❌ Cancelado';
      default: return '🟡 Pendiente';
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Button variant="outlined" startIcon={<ArrowBackIcon />} sx={{ mb: 3 }} onClick={() => window.location.href = "/admin"}>
        Volver al Admin
      </Button>

      <Typography variant="h4" gutterBottom>📋 Pedidos recibidos</Typography>

      {pedidos.length === 0 ? (
        <Typography>No hay pedidos aún.</Typography>
      ) : (
        <>
          <Box sx={{ mb: 3 }}>
            <Button variant="contained" color="success" onClick={() => exportarResumenCSV(resumen)}>
              📤 Exportar resumen
            </Button>
          </Box>

          <TextField
            label="Buscar por nombre o email"
            variant="outlined"
            fullWidth
            sx={{ mb: 4 }}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          {/* RESUMEN POR DÍA */}
          <Typography variant="h5" gutterBottom>📊 Resumen por día</Typography>
          {Object.entries(resumen).map(([dia, platos]) => (
            <Card key={dia} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">
                  📅 {dia.toUpperCase()} {(() => {
                    const pConDia = pedidos.find(p => p.pedido?.diarios?.[dia] || p.pedido?.extras?.[dia]);
                    return pConDia ? formatFechaEntrega(pConDia.fecha, dia) : '';
                  })()}
                </Typography>
                <Divider sx={{ my: 1 }} />
                {Object.entries(platos).map(([nombre, cantidad], i) => (
                  <Typography key={i}>🍽️ {nombre}: <strong>{cantidad}</strong></Typography>
                ))}
              </CardContent>
            </Card>
          ))}

          {/* PEDIDOS INDIVIDUALES */}
          <Typography variant="h5" sx={{ mt: 5 }}>👤 Pedidos individuales</Typography>
          {pedidosFiltrados.map((p, i) => (
            <Card key={i} sx={{ mt: 2, mb: 4 }}>
              <CardContent>
                <Typography variant="h6">👤 {p.usuario.nombre}</Typography>
                {p.usuario.email && <Typography>📧 {p.usuario.email}</Typography>}
                {p.usuario.direccion && <Typography>🏠 {p.usuario.direccion}</Typography>}
                {p.usuario.telefono && <Typography>📞 {p.usuario.telefono}</Typography>}
                <Typography sx={{ mt: 1 }}>📌 Estado: <strong>{mostrarEstado(p.estado)}</strong></Typography>

                <FormControl size="small" sx={{ mt: 1 }}>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={p.estado || 'pendiente'}
                    label="Estado"
                    onChange={(e) => cambiarEstadoPedido(p.id, e.target.value)}
                  >
                    <MenuItem value="pendiente">🟡 Pendiente</MenuItem>
                    <MenuItem value="realizado">✅ Realizado</MenuItem>
                    <MenuItem value="cancelado">❌ Cancelado</MenuItem>
                  </Select>
                </FormControl>

                {/* PEDIDOS POR TIPO */}
                {Object.entries(p.pedido || {}).map(([tipo, grupo]) => (
                  <Box key={tipo} sx={{ mt: 2 }}>
                    <Typography fontWeight="bold" textTransform="uppercase">{tipo}</Typography>
                    {typeof Object.values(grupo)[0] === 'object'
                      ? Object.entries(grupo).map(([dia, platos], j) => (
                          <Box key={j} sx={{ ml: 2, mt: 1 }}>
                            <Typography variant="subtitle1">📅 {dia.toUpperCase()} {formatFechaEntrega(p.fecha, dia)}</Typography>
                            {Object.entries(platos).map(([nombre, cantidad], k) => (
                              <Typography key={k}>🍽️ {nombre}: <strong>{cantidad}</strong></Typography>
                            ))}
                          </Box>
                        ))
                      : Object.entries(grupo).map(([nombre, cantidad], k) => (
                          <Typography key={k} sx={{ ml: 2 }}>🍰 {nombre}: <strong>{cantidad}</strong></Typography>
                        ))}
                  </Box>
                ))}

                {p.observaciones && (
                  <Typography sx={{ mt: 2 }}>✏️ Observaciones: {p.observaciones}</Typography>
                )}

                {p.comprobanteUrl && (
                  <Box sx={{ mt: 2 }}>
                    <Typography fontWeight="bold">📎 Comprobante:</Typography>
                    <img src={p.comprobanteUrl} alt="comprobante" style={{ maxWidth: '100%', maxHeight: 200, marginTop: 8, borderRadius: 6 }} />
                    <a href={p.comprobanteUrl} download={p.comprobanteNombre || 'comprobante.jpg'}>
                      <Button size="small" variant="outlined" sx={{ mt: 1 }}>Descargar</Button>
                    </a>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </Container>
  );
};

export default AdminPedidos;
