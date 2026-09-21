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
import dayjs from '../utils/day';

// ✅ Función para cargar nombres desde los endpoints
const fetchNameMaps = async () => {
  const map = { 
    diarios: {}, 
    extras: { 
      '1': '🍰 Postre',
      '2': '🥗 Ensalada', 
      '3': '💪 Proteína'
    }, 
    tartas: {} 
  };

  try {
    const resSemanal = await api.get('/daily/semanal');
    const semanal = resSemanal.data || {};
    
    Object.values(semanal).forEach(diaObj => {
      if (Array.isArray(diaObj?.platos)) {
        diaObj.platos.forEach(p => {
          const id = String(p.id || '').trim();
          if (id) map.diarios[id] = p.name || p.nombre || `Plato ${id}`;
        });
      }
      
      if (Array.isArray(diaObj?.especiales)) {
        diaObj.especiales.forEach(p => {
          const id = String(p.id || '').trim();
          if (id) map.diarios[id] = p.name || p.nombre || `Plato ${id}`;
        });
      }
    });
  } catch (error) {
    console.warn('⚠️ Error cargando menú semanal:', error);
  }

  try {
    const resFijo = await api.get('/fixed');
    const fijos = Array.isArray(resFijo.data) ? resFijo.data : [];
    
    fijos.forEach(p => {
      const id = String(p.id || p._id || '').trim();
      if (id) map.diarios[id] = p.name || p.nombre || `Plato ${id}`;
    });
  } catch (error) {
    console.warn('⚠️ Error cargando menú fijo:', error);
  }

  try {
    const resTartas = await api.get('/tartas');
    const tartas = Array.isArray(resTartas.data) ? resTartas.data : [];
    
    tartas.forEach(t => {
      const key = t.key || t.nombre || '';
      if (key) map.tartas[key] = t.nombre || key;
    });
  } catch (error) {
    console.warn('⚠️ Error cargando tartas:', error);
  }

  console.log('📚 Name map cargado en MisPedidos:', map);
  return map;
};

// ✅ Función helper para resolver nombres
const resolveNombrePlatoLocal = (
  platoKey = '',
  categoria = 'diarios',
  nameMapLocal = {}
) => {
  const key = String(platoKey).trim();
  const catMap = nameMapLocal?.[categoria] || {};
  
  if (catMap[key]) return catMap[key];
  
  const idClean = key.replace(/^ID:/i, '');
  if (catMap[idClean]) return catMap[idClean];
  
  if (categoria === 'extras') {
    const extraMap = { 
      '1': '🍰 Postre', 
      '2': '🥗 Ensalada', 
      '3': '💪 Proteína' 
    };
    if (extraMap[idClean]) return extraMap[idClean];
  }
  
  for (const bucket of Object.values(nameMapLocal || {})) {
    if (bucket?.[key]) return bucket[key];
    if (bucket?.[idClean]) return bucket[idClean];
  }
  
  if (/^\d+$/.test(idClean)) {
    return `Plato ${idClean}`;
  }
  
  return key
    .replace(/^ID:/i, '')
    .replace(/_/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/^\w|\s\w/g, c => c.toUpperCase());
};

const MisPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [nameMap, setNameMap] = useState({ diarios: {}, extras: {}, tartas: {} });
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const [resPedidos, nameData] = await Promise.all([
          api.get('/orders'),
          fetchNameMaps()
        ]);

        console.log('📦 Pedidos recibidos:', resPedidos.data);
        setPedidos(resPedidos.data);
        setNameMap(nameData);
      } catch (err) {
        console.error('⚠ Error cargando pedidos:', err);
      } finally {
        setCargando(false);
      }
    };

    fetchPedidos();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const puedeEditarPedido = (pedido) => {
    const hoy = dayjs().tz('America/Argentina/Buenos_Aires').startOf('day');
    const fechas = Object.values(pedido?.pedido?.fecha_dia_por_dia || {});
    return fechas.some(fechaStr => dayjs(fechaStr).isAfter(hoy));
  };

  const renderItems = (pedido) => {
    if (!pedido.pedido) return null;

    return (
      <Box sx={{ mt: 1 }}>
        {Object.entries(pedido.pedido.diarios || {}).map(([diaCompleto, platos]) => {
          const diaBase = diaCompleto.split(' ')[0];
          const fechaReal = pedido.pedido.fecha_dia_por_dia?.[diaBase];
          const fecha = dayjs(fechaReal);
          if (!fecha.isValid()) return null;

          const fechaTexto = `${fecha.locale('es').format('dddd').toUpperCase()} ${fecha.format('DD/MM/YYYY')}`;

          return (
            <Box key={diaCompleto} sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">📅 {fechaTexto}</Typography>

              {Object.entries(platos).map(([id, cantidad]) => (
                <Typography key={id} sx={{ ml: 2 }}>
                  🍽️ {resolveNombrePlatoLocal(id, 'diarios', nameMap)} x {cantidad}
                </Typography>
              ))}

              {Object.entries(pedido.pedido.extras?.[diaCompleto] || {}).map(([id, cantidad]) => (
                <Typography key={id} sx={{ ml: 2 }}>
                  🧃 {resolveNombrePlatoLocal(id, 'extras', nameMap)} x {cantidad}
                </Typography>
              ))}
            </Box>
          );
        })}

        {pedido.pedido.tartas && Object.keys(pedido.pedido.tartas).length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              🥧 Tartas ({dayjs(pedido.fecha_entrega_tartas).format('DD/MM/YYYY')}):
            </Typography>
            {Object.entries(pedido.pedido.tartas).map(([key, cantidad]) => (
              <Typography key={key} sx={{ ml: 2 }}>
                🥧 {resolveNombrePlatoLocal(key, 'tartas', nameMap)} x {cantidad}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    );
  };

  if (cargando) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Obteniendo tus pedidos...</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 8 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/app')}>
          Volver
        </Button>
        <Stack direction="row" gap={1}>
          <IconButton onClick={() => navigate('/')} title="Cerrar"><CloseIcon /></IconButton>
          <Button onClick={logout} color="error" startIcon={<LogoutIcon />}>Cerrar sesión</Button>
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
                <Typography><strong>Semana:</strong> {dayjs(p.fecha_entrega).format('DD/MM/YYYY')}</Typography>
                <Typography><strong>Estado:</strong> {p.estado || p.status}</Typography>
                <Typography><strong>Total:</strong> ${Number(p.total).toLocaleString()}</Typography>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Detalles:</Typography>
                  {renderItems(p)}
                </Box>

                <Box mt={2}>
                  {puedeEditarPedido(p) ? (
                    <Button fullWidth variant="outlined" onClick={() => navigate(`/editar-pedido/${p.id}`)}>
                      ✏️ Editar pedido
                    </Button>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No editable</Typography>
                  )}
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