// src/pages/PedidosEmpresa.jsx
import React, { useEffect, useState } from 'react';
import axios from '../api/api';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Grid,
  Alert,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import dayjs from 'dayjs';

const PedidosEmpresa = () => {
  const [pedidos, setPedidos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filtroTexto, setFiltroTexto] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const res = await axios.get('/empresa/pedidos');
        if (Array.isArray(res.data)) {
          const ordenados = res.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
          setPedidos(ordenados);
          setFiltered(ordenados);
        } else {
          setPedidos([]);
        }
      } catch (err) {
        console.error('❌ Error al obtener pedidos:', err);
        setError('Error al obtener pedidos de empleados');
        setPedidos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  useEffect(() => {
    let filtrados = [...pedidos];

    // 🔍 Filtro texto
    if (filtroTexto.trim()) {
      filtrados = filtrados.filter(p =>
        p.usuario?.nombre?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        p.usuario?.email?.toLowerCase().includes(filtroTexto.toLowerCase())
      );
    }

    // 📅 Filtro fecha
    if (desde) {
      filtrados = filtrados.filter(p => dayjs(p.fecha).isAfter(dayjs(desde).subtract(1, 'day')));
    }

    if (hasta) {
      filtrados = filtrados.filter(p => dayjs(p.fecha).isBefore(dayjs(hasta).add(1, 'day')));
    }

    setFiltered(filtrados);
  }, [filtroTexto, desde, hasta, pedidos]);

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        📦 Pedidos de Empleados
      </Typography>

      {/* 🔍 FILTROS */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          label="Buscar por nombre o email"
          variant="outlined"
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton disabled>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <TextField
          label="Desde"
          type="date"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <TextField
          label="Hasta"
          type="date"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
      </Box>

      {/* 🔄 ESTADOS */}
      {loading && (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && filtered.length === 0 && !error && (
        <Typography>No hay pedidos con ese criterio.</Typography>
      )}

      {!loading && filtered.length > 0 && (
        <Grid container spacing={2}>
          {filtered.map((pedido) => (
            <Grid item xs={12} md={6} key={pedido.id}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Pedido #{pedido.id}
                </Typography>
                <Typography>
                  Fecha: {new Date(pedido.fecha).toLocaleDateString()}
                </Typography>
                <Typography>
                  Empleado: {pedido.usuario?.nombre} {pedido.usuario?.apellido}
                </Typography>
                <Typography>Email: {pedido.usuario?.email}</Typography>
                <Typography>Estado: {pedido.estado}</Typography>

                {/* 📦 Detalles de lo pedido */}
                {pedido.pedido && (
                  <>
                    {Object.entries(pedido.pedido.diarios).map(([dia, items]) => (
                      <Box key={dia} mt={1}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          🍽️ Menú {dia}:
                        </Typography>
                        {Object.entries(items).map(([nombre, cantidad]) => (
                          <Typography key={nombre}>
                            - {nombre} x {cantidad}
                          </Typography>
                        ))}
                      </Box>
                    ))}

                    {Object.entries(pedido.pedido.extras).map(([dia, items]) => (
                      <Box key={dia} mt={1}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          🧁 Extras {dia}:
                        </Typography>
                        {Object.entries(items).map(([nombre, cantidad]) => (
                          <Typography key={nombre}>
                            - {nombre} x {cantidad}
                          </Typography>
                        ))}
                      </Box>
                    ))}

                    {Object.entries(pedido.pedido.tartas).length > 0 && (
                      <Box mt={1}>
                        <Typography variant="subtitle2" fontWeight="bold">🥧 Tartas:</Typography>
                        {Object.entries(pedido.pedido.tartas).map(([nombre, cantidad]) => (
                          <Typography key={nombre}>
                            - {nombre} x {cantidad}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default PedidosEmpresa;
