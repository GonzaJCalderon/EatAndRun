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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const exportarResumenCSV = (resumen) => {
  let csv = 'Día;Plato;Cantidad\n';
  Object.entries(resumen).forEach(([dia, platos]) => {
    Object.entries(platos).forEach(([_, data]) => {
      const nombre = typeof data === 'object' ? (data.nombreOriginal || '-') : '-';
      const cantidad = typeof data === 'object' ? (data.cantidad ?? 0) : data;
      csv += `${dia};${nombre};${cantidad}\n`;
    });
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `resumen-${new Date().toISOString().slice(0, 10)}.csv`);
};

const agruparPedidosResumen = (pedidos) => {
  const resumen = {};
  pedidos.forEach((p) => {
    Object.entries(p.pedido).forEach(([dia, platos]) => {
      if (!resumen[dia]) resumen[dia] = {};
      Object.entries(platos).forEach(([platoKey, datos]) => {
        if (!resumen[dia][platoKey]) resumen[dia][platoKey] = { cantidad: 0, nombreOriginal: datos?.nombreOriginal || platoKey };
        resumen[dia][platoKey].cantidad += typeof datos === 'object' ? (datos.cantidad ?? 0) : datos;
      });
    });
  });
  return resumen;
};

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [resumen, setResumen] = useState({});
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const data = localStorage.getItem('pedidos_eatandrun');
    if (data) {
      const parsed = JSON.parse(data);
      setPedidos(parsed);
      setResumen(agruparPedidosResumen(parsed));
    }
  }, []);

  const cambiarEstadoPedido = (index, nuevoEstado) => {
    const nuevos = [...pedidos];
    nuevos[index].estado = nuevoEstado;
    setPedidos(nuevos);
    localStorage.setItem('pedidos_eatandrun', JSON.stringify(nuevos));
  };

  const pedidosFiltrados = pedidos.filter((p) => {
    const query = busqueda.toLowerCase();
    return (
      p.usuario.nombre.toLowerCase().includes(query) ||
      p.usuario.email.toLowerCase().includes(query)
    );
  });

  const mostrarEstado = (estado) => {
    switch (estado) {
      case 'realizado':
        return '✅ Realizado';
      case 'cancelado':
        return '❌ Cancelado';
      default:
        return '🟡 Pendiente';
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
        onClick={() => window.location.href = "/admin"}
      >
        Volver al Admin
      </Button>

      <Typography variant="h4" gutterBottom>📋 Pedidos recibidos</Typography>

      {pedidos.length === 0 ? (
        <Typography>No hay pedidos aún.</Typography>
      ) : (
        <>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              color="success"
              onClick={() => exportarResumenCSV(resumen)}
            >
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

          <Typography variant="h5" gutterBottom>📊 Resumen por día</Typography>
          {Object.entries(resumen).map(([dia, platos]) => (
            <Card key={dia} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">📅 {dia.toUpperCase()}</Typography>
                <Divider sx={{ my: 1 }} />
                {Object.entries(platos).map(([_, data], i) => {
                  const nombreMostrar = typeof data === 'object' ? (data.nombreOriginal || '-') : '-';
                  const cantidadMostrar = typeof data === 'object' ? (data.cantidad ?? 0) : data;
                  return (
                    <Typography key={i}>
                      🍽️ {nombreMostrar}: <strong>{cantidadMostrar}</strong>
                    </Typography>
                  );
                })}
              </CardContent>
            </Card>
          ))}

          <Typography variant="h5" sx={{ mt: 5 }}>👤 Pedidos individuales</Typography>
          {pedidosFiltrados.map((p, i) => (
            <Card key={i} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{p.usuario.nombre}</Typography>
                <Typography variant="body2">📧 {p.usuario.email}</Typography>
                {p.usuario.direccion && <Typography variant="body2">🏠 {p.usuario.direccion}</Typography>}
                {p.usuario.telefono && <Typography variant="body2">📞 {p.usuario.telefono}</Typography>}
                <Typography variant="body2">🗓️ {new Date(p.fecha).toLocaleDateString()}</Typography>

                <Typography variant="body2" sx={{ mt: 1 }}>
                  📌 Estado: <strong>{mostrarEstado(p.estado)}</strong>
                </Typography>

                <FormControl size="small" sx={{ mt: 1 }}>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={p.estado}
                    label="Estado"
                    onChange={(e) => cambiarEstadoPedido(i, e.target.value)}
                  >
                    <MenuItem value="pendiente">🟡 Pendiente</MenuItem>
                    <MenuItem value="realizado">✅ Realizado</MenuItem>
                    <MenuItem value="cancelado">❌ Cancelado</MenuItem>
                  </Select>
                </FormControl>

                {Object.entries(p.pedido).map(([dia, platos], idx) => (
                  <div key={idx}>
                    <Typography variant="subtitle2" sx={{ mt: 2 }}>{dia.toUpperCase()}</Typography>
                    {Object.entries(platos).map(([platoKey, datos], k) => {
                      const nombreMostrar = datos?.nombreOriginal || platoKey;
                      const cantidadMostrar = typeof datos === 'object' ? datos?.cantidad ?? 0 : datos;
                      return (
                        <Typography variant="body2" key={k}>
                          🍽️ {nombreMostrar}: <strong>{cantidadMostrar}</strong>
                        </Typography>
                      );
                    })}
                  </div>
                ))}

                {p.observaciones && (
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    ✏️ Observaciones: {p.observaciones}
                  </Typography>
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
