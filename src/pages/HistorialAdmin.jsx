import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Divider,
  TextField,
  MenuItem,
  Button,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Pagination,
  Box
} from "@mui/material";
import { saveAs } from "file-saver";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from "framer-motion";

const HistorialAdmin = () => {
  const [pedidos, setPedidos] = useState([]);
  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const pedidosPorPagina = 10;

  useEffect(() => {
    const data = localStorage.getItem("pedidos_eatandrun");
    if (data) {
      const parsed = JSON.parse(data);
      const ordenados = parsed.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // 🧠 Más nuevos primero
      setPedidos(ordenados);
    }
  }, []);

  const exportarCSV = () => {
    let csv = "Nombre;Email;Estado;Fecha;Pedido\n";
    pedidosFiltrados.forEach(p => {
      const pedidoStr = Object.entries(p.pedido)
        .map(([dia, platos]) =>
          `${dia}: ${Object.entries(platos).map(([platoKey, datos]) => {
            const nombreMostrar = datos?.nombreOriginal || platoKey;
            const cantidadMostrar = typeof datos === 'object' ? datos?.cantidad ?? 0 : datos;
            return `${nombreMostrar} x${cantidadMostrar}`;
          }).join(", ")}`
        ).join(" | ");
      csv += `${p.usuario.nombre};${p.usuario.email};${p.estado || 'pendiente'};${new Date(p.fecha).toLocaleDateString()};${pedidoStr}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `historial-pedidos-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const cambiarEstado = (indexGlobal, nuevoEstado) => {
    const nuevos = [...pedidos];
    nuevos[indexGlobal].estado = nuevoEstado;
    setPedidos(nuevos);
    localStorage.setItem("pedidos_eatandrun", JSON.stringify(nuevos));
  };

  const pedidosFiltrados = pedidos.filter(p => {
    const matchBusqueda = p.usuario.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
      p.usuario.email.toLowerCase().includes(filtroBusqueda.toLowerCase());
    const matchEstado = filtroEstado ? (p.estado || "pendiente") === filtroEstado : true;
    return matchBusqueda && matchEstado;
  });

  // PAGINACIÓN
  const indexInicio = (paginaActual - 1) * pedidosPorPagina;
  const indexFin = indexInicio + pedidosPorPagina;
  const pedidosPaginados = pedidosFiltrados.slice(indexInicio, indexFin);

  const totalPaginas = Math.ceil(pedidosFiltrados.length / pedidosPorPagina);

  const obtenerColorCard = (estado) => {
    switch (estado) {
      case 'realizado':
        return '#e0f2f1'; // Verde suave
      case 'cancelado':
        return '#ffebee'; // Rojo suave
      default:
        return '#fffde7'; // Amarillo suave
    }
  };

  return (
    <Container sx={{ mt: 4, pb: 8 }}>
      {/* BOTÓN VOLVER */}
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => window.location.href = "/admin"}
        sx={{ mb: 3 }}
      >
        Volver al admin
      </Button>

      {/* TITULO */}
      <Typography variant="h4" gutterBottom textAlign="center">
        📜 Historial de Pedidos
      </Typography>

      {/* FILTROS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Buscar por nombre o email"
            variant="outlined"
            fullWidth
            value={filtroBusqueda}
            onChange={(e) => {
              setFiltroBusqueda(e.target.value);
              setPaginaActual(1); // 👈 Al filtrar, vuelve a página 1
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Filtrar por estado</InputLabel>
            <Select
              value={filtroEstado}
              label="Filtrar por estado"
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setPaginaActual(1); // 👈 Al filtrar, vuelve a página 1
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="pendiente">🟡 Pendiente</MenuItem>
              <MenuItem value="realizado">✅ Realizado</MenuItem>
              <MenuItem value="cancelado">❌ Cancelado</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={exportarCSV}
          >
            Exportar CSV
          </Button>
        </Grid>
      </Grid>

      {/* LISTADO DE PEDIDOS */}
      {pedidosPaginados.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No hay pedidos que coincidan con los filtros.
        </Typography>
      ) : (
        pedidosPaginados.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
          >
            <Card sx={{ mb: 3, backgroundColor: obtenerColorCard(p.estado || "pendiente") }}>
              <CardContent>
                <Typography variant="h6">
                  👤 {p.usuario.nombre} ({p.usuario.email})
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  📅 Fecha: {new Date(p.fecha).toLocaleDateString()}
                </Typography>

                {/* Cambiar Estado */}
                <FormControl size="small" sx={{ mb: 2 }}>
                  <Select
                    value={p.estado || "pendiente"}
                    onChange={(e) => cambiarEstado((paginaActual - 1) * pedidosPorPagina + i, e.target.value)}
                  >
                    <MenuItem value="pendiente">🟡 Pendiente</MenuItem>
                    <MenuItem value="realizado">✅ Realizado</MenuItem>
                    <MenuItem value="cancelado">❌ Cancelado</MenuItem>
                  </Select>
                </FormControl>

                <Divider sx={{ my: 2 }} />

                {/* Pedido Detallado */}
                {Object.entries(p.pedido).map(([dia, platos], idx) => (
                  <div key={idx}>
                    <Typography variant="subtitle2" sx={{ mt: 2 }}>
                      📅 {dia.toUpperCase()}
                    </Typography>
                    {Object.entries(platos).map(([platoKey, datos], k) => {
                      const nombreMostrar = datos?.nombreOriginal || platoKey;
                      const cantidadMostrar = typeof datos === 'object' ? datos?.cantidad ?? 0 : datos;
                      return (
                        <Typography variant="body2" key={k}>
                          🍽️ {nombreMostrar}: {cantidadMostrar} unidad{cantidadMostrar > 1 ? 'es' : ''}
                        </Typography>
                      );
                    })}
                  </div>
                ))}

                {/* Observaciones */}
                {p.observaciones && (
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    ✏️ Observaciones: {p.observaciones}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}

      {/* PAGINADOR */}
      {totalPaginas > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPaginas}
            page={paginaActual}
            onChange={(e, value) => setPaginaActual(value)}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
};

export default HistorialAdmin;
