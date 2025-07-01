import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';

import DoneIcon from '@mui/icons-material/Done';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import api from '../api/api';
import MapaCliente from '../components/MapaCliente';
import { useSelector } from 'react-redux';
import { selectUser, selectToken } from '../store/slices/authSlice';
import { Select, MenuItem, TextField } from '@mui/material';
import { Tabs, Tab } from '@mui/material';

import dayjs from 'dayjs';




const getTodayName = () => {
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  return dias[new Date().getDay()];
};

const EXTRAS_MAP = {
  1: '🍰 Postre',
  2: '🥗 Ensalada',
  3: '💪 Proteína'
};

const filtrarPedidosPorDia = (pedidos, dia) => {
  return pedidos.filter(p => {
    if (Array.isArray(p.items)) {
      return p.items.some(item =>
        item.dia === dia || item.dia === 'sin_dia' || !item.dia
      );
    }

    const diarios = p.pedido?.diarios?.[dia]
      || p.diarios?.[dia]
      || p.pedido?.diarios?.['sin_dia']
      || p.diarios?.['sin_dia']
      || {};

    const extras = p.pedido?.extras?.[dia]
      || p.extras?.[dia]
      || p.pedido?.extras?.['sin_dia']
      || p.extras?.['sin_dia']
      || {};

    const tartas = p.pedido?.tartas || p.tartas || {};

    const hayDiarios = Object.values(diarios).some(v => typeof v === 'number' || typeof v === 'object');
    const hayExtras = Object.values(extras).some(v => typeof v === 'number' || typeof v === 'object');
    const hayTartas = Object.keys(tartas).length > 0;

    return hayDiarios || hayExtras || hayTartas;
  });
};

const DeliveryDashboard = () => {
  const [pedidosAsignados, setPedidosAsignados] = useState([]);
  const [pedidosSinAsignar, setPedidosSinAsignar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuEspecialHoy, setMenuEspecialHoy] = useState([]);
  const [mensajeExito, setMensajeExito] = useState('');
  const [mostrarSnackbar, setMostrarSnackbar] = useState(false);
  const [usuario, setUsuario] = useState(null);
const [pedidoActual, setPedidoActual] = useState(null);
const [mostrarModalMotivo, setMostrarModalMotivo] = useState(false);
const [motivoNoEntrega, setMotivoNoEntrega] = useState('');
const [filtroFecha, setFiltroFecha] = useState('hoy');
const [desdeFecha, setDesdeFecha] = useState(dayjs().format('YYYY-MM-DD'));
const [hastaFecha, setHastaFecha] = useState(dayjs().format('YYYY-MM-DD'));
const [tabIndex, setTabIndex] = useState(0);



  const hoy = getTodayName();

const user = useSelector(selectUser);
const token = useSelector(selectToken);




  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await api.get('/daily/today');
        setMenuEspecialHoy(res.data);
      } catch (err) {
        console.error('❌ Error al obtener menú especial de hoy:', err);
      }
    };

    fetchMenus();
  }, []);

 useEffect(() => {
  const fetchData = async () => {
    try {
      let query = '';
      if (filtroFecha !== 'hoy') {
        query = `?desde=${desdeFecha}&hasta=${hastaFecha}`;
      }

      const asignadosRes = await api.get(`/delivery/my-orders${query}`);
      const sinAsignarRes = await api.get('/delivery/unassigned-orders');

      let asignados = asignadosRes.data;
      let sinAsignar = sinAsignarRes.data;

      // Solo filtramos por día si es "hoy"
     if (filtroFecha === 'hoy') {
  // Si querés seguir filtrando sin asignar por contenido del día
  sinAsignar = filtrarPedidosPorDia(sinAsignar, hoy);
}


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


  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await api.put(`/orders/${id}/status`, { status: nuevoEstado });
      setPedidosAsignados(prev =>
        prev.map(p => (p.id === id ? { ...p, estado: nuevoEstado } : p))
      );

      setMensajeExito(`Pedido #${id} marcado como "${nuevoEstado}"`);
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
await api.put(`/orders/${pedidoActual.id}/status`, {
  status: 'no_entregado',
  motivo: motivoNoEntrega
});



    setPedidosAsignados(prev =>
      prev.map(p =>
        p.id === pedidoActual.id ? { ...p, estado: 'no_entregado' } : p
      )
    );

    setMostrarSnackbar(true);
    setMensajeExito(`Pedido #${pedidoActual.id} marcado como no entregado`);
    setMostrarModalMotivo(false);
    setMotivoNoEntrega('');
  } catch (err) {
    console.error('❌ Error al marcar como no entregado:', err);
    alert('Hubo un error al enviar el motivo.');
  }
};


  const renderContenidoPedidoDeHoy = pedido => {
    if (pedido.items && Array.isArray(pedido.items)) {
      const itemsDeHoy = pedido.items.filter(i => i.dia === hoy || i.dia === 'sin_dia' || !i.dia);

      if (itemsDeHoy.length === 0) return <Typography>📭 Sin ítems para hoy</Typography>;

      return (
        <>
          <Typography variant="subtitle2">📅 {hoy}</Typography>
          {itemsDeHoy.map((item, i) => (
            <Typography key={i}>
              {item.item_type === 'extra' && '🧁'}
              {item.item_name || item.item_id}: {item.quantity}
            </Typography>
          ))}
        </>
      );
    }

    const diarios = pedido.pedido?.diarios?.[hoy] || pedido.pedido?.diarios?.['sin_dia'] || {};
    const extras = pedido.pedido?.extras?.[hoy] || pedido.pedido?.extras?.['sin_dia'] || {};
    const tartas = pedido.pedido?.tartas || {};

    return (
      <>
        {Object.entries(diarios).map(([nombre, cantidad], i) => (
          <Typography key={`plato-${i}`}>🍽️ {nombre}: {cantidad}</Typography>
        ))}
        {Object.entries(extras).map(([key, cantidad], i) => {
          const nombre = isNaN(key) ? key : EXTRAS_MAP[Number(key)] || `Extra #${key}`;
          return (
            <Typography key={`extra-${i}`}>🧁 {nombre}: {cantidad}</Typography>
          );
        })}
        {Object.entries(tartas).map(([nombre, cantidad], i) => (
          <Typography key={`tarta-${i}`}>🥧 {nombre}: {cantidad}</Typography>
        ))}
      </>
    );
  };

const pedidosEntregados = pedidosAsignados.filter(p => p.estado === 'entregado');
const pedidosPendientes = pedidosAsignados.filter(p => p.estado !== 'entregado' && p.estado !== 'cancelado' && p.estado !== 'no_entregado');
const pedidosCancelados = pedidosAsignados.filter(
  p => p.estado === 'cancelado' || p.estado === 'no_entregado'
);


  return (
    
    <Container sx={{ mt: 4, pb: 8 }}>
      <Box
  display="flex"
  justifyContent="space-between"
  alignItems="center"
  sx={{ mb: 4 }}
>
  <Box>
       <Typography variant="h5" gutterBottom>
      👋 ¡Bienvenido{user?.nombre ? `, ${user.nombre}` : ''}!
    </Typography>
    <Typography variant="subtitle1">
      Estos son tus pedidos asignados para hoy.
    </Typography>
  </Box>
  <Button
    variant="outlined"
    color="error"
    onClick={() => {
      localStorage.clear(); // o token específico
      window.location.href = '/login';
    }}
  >
    Cerrar sesión
  </Button>
</Box>

      
      <Typography variant="h4" gutterBottom>
 <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
  <Select
    value={filtroFecha}
    onChange={(e) => {
      const value = e.target.value;
      setFiltroFecha(value);

      const hoy = dayjs();
      if (value === 'semana_actual') {
        setDesdeFecha(hoy.startOf('week').add(1, 'day').format('YYYY-MM-DD')); // lunes
        setHastaFecha(hoy.endOf('week').add(1, 'day').format('YYYY-MM-DD'));   // domingo
      } else if (value === 'semana_pasada') {
        setDesdeFecha(hoy.startOf('week').subtract(6, 'day').format('YYYY-MM-DD'));
        setHastaFecha(hoy.startOf('week').format('YYYY-MM-DD'));
      } else if (value === 'hoy') {
        setDesdeFecha(hoy.format('YYYY-MM-DD'));
        setHastaFecha(hoy.format('YYYY-MM-DD'));
      }
    }}
    size="small"
  >
    <MenuItem value="hoy">📅 Hoy</MenuItem>
    <MenuItem value="semana_actual">🗓️ Semana actual</MenuItem>
    <MenuItem value="semana_pasada">📆 Semana pasada</MenuItem>
    <MenuItem value="personalizado">📅 Personalizado</MenuItem>
  </Select>

  {filtroFecha === 'personalizado' && (
    <>
      <TextField
        type="date"
        label="Desde"
        size="small"
        value={desdeFecha}
        onChange={(e) => setDesdeFecha(e.target.value)}
      />
      <TextField
        type="date"
        label="Hasta"
        size="small"
        value={hastaFecha}
        onChange={(e) => setHastaFecha(e.target.value)}
      />
    </>
  )}
</Box>

      </Typography>

      {loading ? (
        <Typography>Cargando...</Typography>
      ) : pedidosAsignados.length === 0 ? (
        <Typography>No tenés entregas asignadas hoy</Typography>
      ) : (
        <>
          <Tabs value={tabIndex} onChange={(e, newIndex) => setTabIndex(newIndex)} sx={{ mb: 3 }}>
  <Tab label="📦 Pendientes" />
  <Tab label="✅ Entregados" />
  <Tab label="❌ No entregados / Cancelados" />
</Tabs>

{tabIndex === 0 && pedidosPendientes.map(pedido => (
  <Card key={pedido.id} sx={{ mb: 4, boxShadow: 2 }}>
    <CardContent>
      <Typography variant="h6">📦 Pedido #{pedido.id}</Typography>
      <Typography>👤 {pedido.usuario?.nombre}</Typography>
      <Typography>📧 {pedido.usuario?.email}</Typography>
      <Typography>📍 Dirección: {pedido.usuario?.direccion || 'No especificada'}</Typography>
      <Typography>📞 {pedido.usuario?.telefono || 'No especificado'}</Typography>

      <Divider sx={{ my: 2 }} />
      {renderContenidoPedidoDeHoy(pedido)}

      <Typography sx={{ mt: 1 }}>
        💬 Observaciones: {pedido.observaciones || '—'}
      </Typography>

      <Box sx={{ mt: 2 }}>
        <MapaCliente
          direccion={pedido.usuario?.direccion}
          nombre={pedido.usuario?.nombre}
        />
        <Button
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            pedido.usuario?.direccion || ''
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
        >
          Abrir en Google Maps
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        {pedido.estado !== 'en camino' && (
          <Button
            variant="outlined"
            startIcon={<MapIcon />}
            onClick={() => cambiarEstado(pedido.id, 'en camino')}
          >
            Marcar en camino
          </Button>
        )}
        <Button
          variant="contained"
          color="success"
          startIcon={<DoneIcon />}
          onClick={() => cambiarEstado(pedido.id, 'entregado')}
        >
          Marcar entregado
        </Button>
        <Button
          variant="outlined"
          color="warning"
          onClick={() => {
            setPedidoActual(pedido);
            setMostrarModalMotivo(true);
          }}
        >
          No entregado
        </Button>
      </Box>
    </CardContent>
  </Card>
))}

{tabIndex === 1 && pedidosEntregados.map(pedido => (
  <Card key={pedido.id} sx={{ mb: 3, backgroundColor: '#f0f0f0' }}>
    <CardContent>
      <Typography variant="h6">📦 Pedido #{pedido.id} (Entregado)</Typography>
      <Typography>👤 {pedido.usuario?.nombre}</Typography>
      <Typography>📍 Dirección: {pedido.usuario?.direccion}</Typography>
    </CardContent>
  </Card>
))}

{tabIndex === 2 && pedidosCancelados.map(pedido => (
  <Card key={pedido.id} sx={{ mb: 3, backgroundColor: '#fff3f3' }}>
    <CardContent>
      <Typography variant="h6">📦 Pedido #{pedido.id} ({pedido.estado})</Typography>
      <Typography>👤 {pedido.usuario?.nombre}</Typography>
      <Typography>📍 Dirección: {pedido.usuario?.direccion}</Typography>

      <Divider sx={{ my: 1.5 }} />
      {renderContenidoPedidoDeHoy(pedido)}

      <Button
        variant="outlined"
        color="success"
        sx={{ mt: 2 }}
        onClick={() => cambiarEstado(pedido.id, 'entregado')}
        
      >
        ✅ Cambiar a entregado
      </Button>
    </CardContent>
  </Card>
))}

  </>
)}


      <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>
        📥 Pedidos disponibles para hoy ({hoy})
      </Typography>

      {pedidosSinAsignar.length === 0 ? (
        <Typography>No hay pedidos disponibles para hoy</Typography>
      ) : (
        pedidosSinAsignar.map(pedido => (
          <Card key={pedido.id} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6">Pedido #{pedido.id}</Typography>
              <Typography>🧍 Cliente: {pedido.usuario?.nombre}</Typography>
              <Typography>📍 Dirección: {pedido.usuario?.direccion}</Typography>
              <Typography>
                📅 Fecha entrega: {new Date(pedido.fecha).toLocaleDateString()}
              </Typography>
              <Typography>💬 Observaciones: {pedido.observaciones || '—'}</Typography>

              <Divider sx={{ my: 2 }} />
              {renderContenidoPedidoDeHoy(pedido)}

              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                color="primary"
                startIcon={<AssignmentIndIcon />}
                onClick={() => autoAsignarPedido(pedido.id)}
              >
                Asignarme este pedido
              </Button>
            </CardContent>
          </Card>
        ))
      )}

      {menuEspecialHoy.length > 0 && (
        <>
          <Typography variant="h5" sx={{ mt: 5 }}>
            🍽️ Menú Especial de hoy ({hoy})
          </Typography>
          {menuEspecialHoy.map((plato, i) => (
            <Card key={i} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{plato.name}</Typography>
                <Typography>{plato.description || '—'}</Typography>
                <Typography variant="caption">👥 Para: {plato.for_role}</Typography>
              </CardContent>
            </Card>
          ))}
        </>
      )}

      <Snackbar
        open={mostrarSnackbar}
        autoHideDuration={3000}
        onClose={() => setMostrarSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setMostrarSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          {mensajeExito}
        </Alert>
      </Snackbar>
{mostrarModalMotivo && (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}
  >
    <Card sx={{ width: 400, p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Motivo de no entrega para pedido #{pedidoActual?.id}
      </Typography>
      <textarea
        rows={4}
        style={{ width: '100%', padding: '8px' }}
        value={motivoNoEntrega}
        onChange={e => setMotivoNoEntrega(e.target.value)}
        placeholder="Escribí el motivo..."
      />
      <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 2 }}>
        <Button variant="outlined" onClick={() => setMostrarModalMotivo(false)}>
          Cancelar
        </Button>
        <Button variant="contained" color="warning" onClick={marcarNoEntregado}>
          Enviar motivo
        </Button>
      </Box>
    </Card>
  </Box>
)}

    </Container>
  );
};

export default DeliveryDashboard;
