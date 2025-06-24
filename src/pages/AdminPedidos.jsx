import api from '../api/api';
import { useEffect, useState } from 'react';
import {
  Container, Typography, Card, CardContent, Divider,
  Button, TextField, MenuItem, Select, FormControl, InputLabel,
  Tabs, Tab, Box
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Autocomplete from '@mui/material/Autocomplete';
import { saveAs } from 'file-saver';

const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

const extraMap = {
  "1": "🍰 Postre",
  "2": "🥗 Ensalada",
  "3": "💪 Proteína",
  "ID:1": "🍰 Postre",
  "ID:2": "🥗 Ensalada",
  "ID:3": "💪 Proteína"
};


const exportarResumenCSV = (resumen) => {
  let csv = 'Día;Plato;Cantidad;Usuario;Teléfono;Dirección;Empresa\n';
  Object.entries(resumen).forEach(([dia, platos]) => {
    Object.entries(platos).forEach(([nombre, entradas]) => {
      entradas.forEach(({ usuario, cantidad, telefono, direccion, esEmpresa }) => {
        csv += `${dia};${nombre};${cantidad};${usuario};${telefono};${direccion};${esEmpresa ? 'SÍ' : 'NO'}\n`;
      });
    });
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `resumen-detallado-${new Date().toISOString().slice(0, 10)}.csv`);
};

const agruparPedidosPorDiaConDetalle = (pedidos) => {
  const resultado = {};

  pedidos.forEach(p => {
    const { usuario, pedido, estado, tipo_menu, id, fecha } = p;
    const esEmpresa = tipo_menu === 'empresa';
    const nombreCompleto = usuario.nombre;
    const direccion = usuario.direccion || '';
    const subdireccion = usuario.direccionSecundaria || '';
    const telefono = usuario.telefono || '';
    const email = usuario.email || '';

    const dias = new Set();

    const detalle = {
      id,
      nombreCompleto,
      direccion,
      subdireccion,
      telefono,
      email,
      estado,
      delivery: p.delivery || {},
      esEmpresa,
      fecha,
      platos: [],
      extras: [],
      tartas: []
    };

    for (const [dia, items] of Object.entries(pedido.diarios || {})) {
      dias.add(dia);
      for (const [plato, cantidad] of Object.entries(items)) {
        detalle.platos.push({ nombre: plato, cantidad });
      }
    }

    for (const [dia, items] of Object.entries(pedido.extras || {})) {
      dias.add(dia);
      for (const [extra, cantidad] of Object.entries(items)) {
        detalle.extras.push({ nombre: extra, cantidad });
      }
    }

    for (const [tarta, cantidad] of Object.entries(pedido.tartas || {})) {
      detalle.tartas.push({ nombre: tarta, cantidad });
    }

    dias.forEach(dia => {
      if (!resultado[dia]) resultado[dia] = [];
      resultado[dia].push(detalle);
    });

    if (detalle.tartas.length > 0) {
      if (!resultado['TARTAS']) resultado['TARTAS'] = [];
      resultado['TARTAS'].push(detalle);
    }
  });

  return resultado;
};

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [resumenDetallado, setResumenDetallado] = useState({});
  const [busqueda, setBusqueda] = useState('');
  const [semanaActiva, setSemanaActiva] = useState(null);
  const [tabDia, setTabDia] = useState('lunes');
  const [opcionesDelivery, setOpcionesDelivery] = useState({});

  useEffect(() => {
    api.get('/admin/orders').then(res => {
      setPedidos(res.data);
      setResumenDetallado(agruparPedidosPorDiaConDetalle(res.data));
    });

    api.get('/menu/semana/actual').then(res => {
      setSemanaActiva(res.data.semana || res.data);
    });
  }, []);

  const cambiarEstadoPedido = (id, estado) => {
    api.put(`/orders/${id}`, { status: estado }).then(() => {
      const updated = pedidos.map(p => p.id === id ? { ...p, estado } : p);
      setPedidos(updated);
      setResumenDetallado(agruparPedidosPorDiaConDetalle(updated));
    });
  };
const asignarDelivery = async (id, delivery) => {
  try {
    if (!delivery?.id) {
      console.warn(`❗ Delivery inválido para pedido ${id}`);
      return;
    }

    const res = await api.put(`/orders/${id}/assign`, {
      delivery_id: delivery.id
    });

    // Actualizar en frontend
    const actualizado = pedidos.map(p =>
      p.id === id ? { ...p, delivery } : p
    );

    setPedidos(actualizado);
    setResumenDetallado(agruparPedidosPorDiaConDetalle(actualizado));

    console.log(`✅ Delivery asignado al pedido ${id}`, res.data);
  } catch (error) {
    console.error(`❌ Error al asignar delivery al pedido ${id}:`, error.response?.data || error.message);
  }
};


  if (!semanaActiva) return <Typography>Cargando...</Typography>;

  const filtrados = pedidos.filter(p =>
    !busqueda ||
    p.usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.usuario.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  const mostrarEstado = e => ({
    pendiente: '🟡 Pendiente',
    realizado: '✅ Realizado',
    entregado: '📦 Entregado',
    cancelado: '❌ Cancelado',
    no_entregado: '🚫 No Entregado'
  }[e] || '🟡 Pendiente');

  const pedidosSemana = filtrados.filter(p =>
    p.fecha >= semanaActiva.semana_inicio && p.fecha <= semanaActiva.semana_fin
  );

  const pedidosHistorial = filtrados.filter(p =>
    p.fecha < semanaActiva.semana_inicio
  );



  return (
    <Container sx={{ mt: 4 }}>
      <Button variant="outlined" startIcon={<ArrowBackIcon />}
        onClick={() => window.location.href = '/admin'}>
        Volver al Admin
      </Button>

      <Typography variant="h4" sx={{ my: 2 }}>📋 Pedidos de la Semana</Typography>
      <TextField label="Buscar por nombre o email" fullWidth sx={{ mb: 3 }}
        value={busqueda} onChange={e => setBusqueda(e.target.value)} />

      <Tabs
        value={tabDia}
        onChange={(e, val) => setTabDia(val)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        {diasSemana.map(d => <Tab key={d} label={d.toUpperCase()} value={d} />)}
        <Tab label="📜 Historial" value="HISTORIAL" />
      </Tabs>

      {tabDia !== 'HISTORIAL' && (
        <>
          <Button variant="contained" color="success" sx={{ mb: 2 }}
            onClick={() => exportarResumenCSV(resumenDetallado)}>
            📤 Exportar resumen CSV
          </Button>

          {(resumenDetallado[tabDia] && resumenDetallado[tabDia].length > 0)
            ? resumenDetallado[tabDia].map((pedido, i) => (
              <Card key={i} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">{pedido.esEmpresa ? '🏢' : '👤'} {pedido.nombreCompleto}</Typography>
                  <Typography>📍 {pedido.direccion}</Typography>
                  {pedido.subdireccion && <Typography>📍 {pedido.subdireccion}</Typography>}
                  <Typography>📞 {pedido.telefono}</Typography>
                  <Typography>📧 {pedido.email}</Typography>

                  {pedido.delivery?.nombre ? (
                    <>
                      <Typography>🚚 Delivery: {pedido.delivery.nombre}</Typography>
                      {pedido.delivery.telefono && <Typography>📞 {pedido.delivery.telefono}</Typography>}

                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <TextField
                          label="Nombre del delivery"
                          value={pedido.delivery?.nombre || ''}
                          fullWidth
                          onChange={e => asignarDelivery(pedido.id, {
                            ...pedido.delivery,
                            nombre: e.target.value
                          })}
                        />
                        <TextField
                          label="Teléfono del delivery"
                          value={pedido.delivery?.telefono || ''}
                          fullWidth
                          onChange={e => asignarDelivery(pedido.id, {
                            ...pedido.delivery,
                            telefono: e.target.value
                          })}
                        />
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ mt: 2 }}>
                      <Autocomplete
                        freeSolo
                        onInputChange={async (e, value) => {
                          const res = await api.get('/deliveries/search?q=' + value);
                          setOpcionesDelivery(prev => ({
                            ...prev,
                            [pedido.id]: res.data
                          }));
                        }}
                        onChange={(e, selected) => {
                          if (!selected) return;
                          asignarDelivery(pedido.id, selected);
                        }}
                        options={opcionesDelivery[pedido.id] || []}
                        getOptionLabel={(option) => `${option.name} (${option.email})`}
                        renderInput={(params) => <TextField {...params} label="Buscar delivery" fullWidth />}
                      />
                    </Box>
                  )}

                  <Typography>📦 Estado: {pedido.estado}</Typography>

                  <Divider sx={{ my: 1 }} />

                {pedido.platos.map((plato, j) => (
  <Typography key={j}>
    🍽 {typeof plato.cantidad === 'object' ? JSON.stringify(plato.cantidad) : plato.cantidad} × {typeof plato.nombre === 'object' ? JSON.stringify(plato.nombre) : plato.nombre}
  </Typography>
))}

                  {pedido.extras.map((extra, j) => {
  const id = extra.nombre?.replace?.(/^ID:/, '') || '';
  const nombreMostrado = extraMap[extra.nombre] || extraMap[id] || `Extra ${id}`;
  return (
    <Typography key={`e${j}`}>➕ {extra.cantidad} extra: {nombreMostrado}</Typography>
  );
})}

                  {pedido.tartas.map((tarta, j) => (
                    <Typography key={`t${j}`}>🥧 {tarta.cantidad} tarta: {tarta.nombre}</Typography>
                  ))}

                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Estado del Pedido</InputLabel>
                   <Select
  value={pedido.estado}
  label="Estado del Pedido"
  onChange={e => cambiarEstadoPedido(pedido.id, e.target.value)}
>
  <MenuItem value="pendiente">🟡 Pendiente</MenuItem>
  <MenuItem value="preparando">🍳 Preparando</MenuItem>
  <MenuItem value="en camino">🚚 En camino</MenuItem>
  <MenuItem value="entregado">📦 Entregado</MenuItem>
  <MenuItem value="cancelado">❌ Cancelado</MenuItem>
</Select>

                  </FormControl>
                </CardContent>
              </Card>
            ))
            : <Typography>No hay pedidos para {tabDia}</Typography>}
        </>
      )}

      {tabDia === 'HISTORIAL' && (
        <>
          <Typography variant="h5" sx={{ mt: 3 }}>📜 Historial de Pedidos</Typography>
          {pedidosHistorial.map(p => (
            <Card key={p.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{p.tipo_menu === 'empresa' ? '🏢' : '👤'} {p.usuario.nombre}</Typography>
                <Typography>📧 {p.usuario.email}</Typography>
                <Typography>📅 {new Date(p.fecha).toLocaleDateString('es-AR')}</Typography>
                <Typography>📌 {mostrarEstado(p.estado)}</Typography>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </Container>
  );
};

export default AdminPedidos;
