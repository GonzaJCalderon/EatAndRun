import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import {
  Container, Typography, CircularProgress, Box,
  Card, CardContent, IconButton, Button, Stack
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
    return tipo === 'extras' && id ? EXTRAS_MAP[id] || nombre : nombre;
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

  const formatFecha = (fecha) => new Date(fecha).toLocaleDateString();

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Cargando detalles del pedido...</Typography>
      </Container>
    );
  }

  if (!pedido) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>No se encontró el pedido.</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/mis-pedidos')}>
          Volver
        </Button>

        <Stack direction="row" gap={1}>
          <IconButton onClick={() => navigate('/dashboard')} title="Cerrar">
            <CloseIcon />
          </IconButton>
          <Button onClick={logout} color="error" startIcon={<LogoutIcon />}>
            Cerrar sesión
          </Button>
        </Stack>
      </Stack>

      <Typography variant="h5" gutterBottom>📋 Detalle del Pedido #{pedido.id}</Typography>
      <Typography>Fecha de entrega: <strong>{formatFecha(pedido.fecha_entrega)}</strong></Typography>
      <Typography>Estado actual: <strong>{pedido.status || pedido.estado}</strong></Typography>
      <Typography>Observaciones: {pedido.observaciones || '(ninguna)'}</Typography>
      <Typography>Total estimado: <strong>${pedido.total?.toLocaleString()}</strong></Typography>

      {pedido.comprobante_url && (
        <Box mt={2}>
          <Typography variant="subtitle1">📎 Comprobante:</Typography>
          <img
            src={pedido.comprobante_url}
            alt="Comprobante"
            style={{ maxWidth: '100%', border: '1px solid #ccc', marginTop: 8 }}
          />
        </Box>
      )}

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>🍽️ Ítems del pedido</Typography>
        {pedido.pedido ? (
          Object.entries(pedido.pedido).map(([tipo, grupo]) => (
            <Box key={tipo} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" color="text.secondary">{tipo.toUpperCase()}</Typography>
              {tipo === 'tartas' ? (
                Object.entries(grupo).map(([nombre, cantidad]) => (
                  <Typography key={nombre} sx={{ ml: 2 }}>
                    • {normalizarNombre(nombre, tipo)}: {cantidad}
                  </Typography>
                ))
              ) : (
                Object.entries(grupo).map(([subtipo, subitems]) => (
                  <Box key={subtipo} sx={{ ml: 2, mt: 1 }}>
                    <Typography variant="subtitle2">{subtipo}</Typography>
                    {Object.entries(subitems).map(([nombre, cantidad]) => (
                      <Typography key={nombre} sx={{ ml: 2 }}>
                        • {normalizarNombre(nombre, tipo)}: {cantidad}
                      </Typography>
                    ))}
                  </Box>
                ))
              )}
            </Box>
          ))
        ) : (
          <Typography>No hay ítems registrados en este pedido.</Typography>
        )}
      </Box>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>📜 Historial de estado</Typography>
        {historial.length === 0 ? (
          <Typography>No hay historial disponible.</Typography>
        ) : (
          historial.map((item, idx) => (
            <Card key={idx} sx={{ mb: 2 }}>
              <CardContent>
                <Typography><strong>{item.estado || item.status}</strong></Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(item.timestamp || item.fecha_cambio).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Container>
  );
};

export default PedidoDetalle;
