import { useEffect, useState } from 'react';
import API from '../api/api';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Divider,
  Button,
  Box
} from '@mui/material';

const DeliveryAutoAsignador = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPedidosSinAsignar = async () => {
    try {
      const res = await API.get('/delivery/unassigned-orders');
      setPedidos(res.data);
    } catch (err) {
      console.error('❌ Error al obtener pedidos sin asignar:', err);
    } finally {
      setLoading(false);
    }
  };

  const asignarmePedido = async (id) => {
    try {
      await API.put(`/delivery/orders/${id}/claim`);
      setPedidos((prev) => prev.filter((p) => p.id !== id)); // lo sacamos de la lista
    } catch (err) {
      console.error('❌ Error al autoasignar pedido:', err);
    }
  };

  useEffect(() => {
    fetchPedidosSinAsignar();
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>📦 Pedidos sin asignar</Typography>

      {loading ? (
        <Typography>Cargando...</Typography>
      ) : pedidos.length === 0 ? (
        <Typography>🎉 No hay pedidos sin asignar en este momento</Typography>
      ) : (
        pedidos.map((pedido) => (
          <Card key={pedido.id} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6">Pedido #{pedido.id}</Typography>
              <Typography>🧍 Cliente: {pedido.usuario?.nombre}</Typography>
              <Typography>📍 Dirección: {pedido.usuario?.direccion}</Typography>
              <Typography>📅 Fecha de entrega: {new Date(pedido.fecha).toLocaleDateString()}</Typography>
              <Typography>💬 Observaciones: {pedido.observaciones || '—'}</Typography>

              <Divider sx={{ my: 2 }} />

              <Typography fontWeight="bold">🧾 Platos:</Typography>
              {Object.entries(pedido.pedido || {}).map(([tipo, grupo], idx) => (
                <Box key={idx} sx={{ ml: 2, mt: 1 }}>
                  <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>{tipo}</Typography>
                  {typeof Object.values(grupo)[0] === 'object'
                    ? Object.entries(grupo).map(([dia, platos], j) => (
                        <Box key={j} sx={{ ml: 2 }}>
                          <Typography>📆 {dia}</Typography>
                          {Object.entries(platos).map(([nombre, cantidad], k) => (
                            <Typography key={k}>🍽️ {nombre}: {cantidad}</Typography>
                          ))}
                        </Box>
                      ))
                    : Object.entries(grupo).map(([nombre, cantidad], j) => (
                        <Typography key={j}>🍰 {nombre}: {cantidad}</Typography>
                      ))}
                </Box>
              ))}

              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => asignarmePedido(pedido.id)}
              >
                🙋‍♂️ Asignarme este pedido
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
};

export default DeliveryAutoAsignador;
