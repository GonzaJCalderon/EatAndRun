import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import {
  Container, Typography, Card, CardContent,
  Box, List, CircularProgress, Button, Stack, IconButton
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';

const EXTRAS_MAP = {
  1: '🍰 Postre',
  2: '🥗 Ensalada',
  3: '💪 Proteína'
};

const MisPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/orders')
      .then(res => {
        console.log("📦 Pedidos recibidos:", res.data);
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

    const hayDiarios = Object.values(diarios).some(dia =>
      dia && typeof dia === 'object' && Object.keys(dia).length > 0
    );

    const hayExtras = Object.values(extras).some(dia =>
      dia && typeof dia === 'object' && Object.keys(dia).length > 0
    );

    const hayTartas = tartas && Object.keys(tartas).length > 0;

    return hayDiarios || hayExtras || hayTartas;
  };

  const normalizarNombre = (nombre, tipo) => {
    const idMatch = String(nombre).match(/^ID:(\d+)$/);
    if (!idMatch) return nombre;

    const id = parseInt(idMatch[1]);

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

  const renderItems = (pedido) => {
    if (!pedido.pedido || typeof pedido.pedido !== 'object') return null;

    return Object.entries(pedido.pedido).map(([tipo, grupo]) => (
      <Box key={tipo} sx={{ mt: 1 }}>
        <Typography variant="subtitle2"><em>{tipo.toUpperCase()}</em></Typography>

        {tipo === 'tartas' ? (
          Object.keys(grupo).length > 0 ? (
            Object.entries(grupo).map(([nombre, cantidad]) => (
              <Typography key={nombre} sx={{ ml: 2 }}>
                • {normalizarNombre(nombre, tipo)}: {cantidad}
              </Typography>
            ))
          ) : (
            <Typography sx={{ ml: 2 }} color="text.secondary">
              (Sin ítems registrados)
            </Typography>
          )
        ) : (
          typeof grupo === 'object' && Object.entries(grupo).map(([subkey, value]) => (
            <Box key={subkey} sx={{ ml: 2 }}>
              <Typography variant="body2">{subkey}</Typography>
              {value && typeof value === 'object' && Object.keys(value).length > 0 ? (
                Object.entries(value).map(([nombre, cantidad]) => (
                  <Typography key={nombre} sx={{ ml: 2 }}>
                    • {normalizarNombre(nombre, tipo)}: {cantidad}
                  </Typography>
                ))
              ) : (
                <Typography sx={{ ml: 2 }} color="text.secondary">
                  (Sin ítems registrados)
                </Typography>
              )}
            </Box>
          ))
        )}
      </Box>
    ));
  };

  if (cargando) return (
    <Container sx={{ mt: 4, textAlign: 'center' }}>
      <CircularProgress />
      <Typography>Obteniendo tus pedidos...</Typography>
    </Container>
  );

  return (
    <Container sx={{ mt: 4, mb: 8 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/app')}>
          Volver
        </Button>

        <Stack direction="row" gap={1}>
          <IconButton onClick={() => navigate('/')} title="Cerrar">
            <CloseIcon />
          </IconButton>
          <Button onClick={logout} color="error" startIcon={<LogoutIcon />}>
            Cerrar sesión
          </Button>
        </Stack>
      </Stack>

      <Typography variant="h5" sx={{ mb: 3 }}>🧾 Mis pedidos</Typography>

      {pedidos.length === 0 ? (
        <Typography>No has realizado pedidos aún.</Typography>
      ) : (
        <List>
          {pedidos.map(p => (
            <Card key={p.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography><strong>ID:</strong> {p.id}</Typography>
                <Typography><strong>Fecha de entrega:</strong> {new Date(p.fecha_entrega).toLocaleDateString()}</Typography>
                <Typography><strong>Estado:</strong> {p.estado || p.status}</Typography>
                <Typography><strong>Total:</strong> ${Number(p.total).toLocaleString()}</Typography>

                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">Detalles:</Typography>
                  {tieneDetalles(p.pedido) ? (
                    renderItems(p)
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Este pedido no tiene detalles registrados.
                    </Typography>
                  )}
                </Box>

                <Box mt={2}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate(`/mis-pedidos/${p.id}`)}
                  >
                    Ver detalle
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </List>
      )}
    </Container>
  );
};

export default MisPedidos;
