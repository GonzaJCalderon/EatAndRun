import { useEffect, useState } from "react";
import {
  Container, Typography, Card, CardContent, Divider, TextField, MenuItem,
  Button, Select, FormControl, InputLabel, Grid, Pagination, Box
} from "@mui/material";
import { saveAs } from "file-saver";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from "framer-motion";
import api from "../api/api";

const HistorialAdmin = () => {
  const [pedidos, setPedidos] = useState([]);
  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const pedidosPorPagina = 10;

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      const res = await api.get('/admin/orders');
      const ordenados = res.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      ordenados.forEach(p => {
  if (p.pedido?.diarios && !p.pedido?.fecha_dia_por_dia) {
    // Intentamos calcularlo si falta
    const semanaBase = p.semana_inicio || p.fecha; // fallback
    const base = new Date(semanaBase);
    const diaMap = { lunes: 1, martes: 2, miercoles: 3, miércoles: 3, jueves: 4, viernes: 5 };

    const fecha_dia_por_dia = {};
    Object.keys(p.pedido.diarios).forEach(dia => {
      const numeroDia = diaMap[dia.toLowerCase()];
      if (numeroDia != null) {
        const fecha = new Date(base);
        fecha.setDate(fecha.getDate() - fecha.getDay() + numeroDia);
        fecha_dia_por_dia[dia] = fecha.toISOString().slice(0, 10);
      }
    });
    p.pedido.fecha_dia_por_dia = fecha_dia_por_dia;
  }
});

      setPedidos(ordenados);
    } catch (err) {
      console.error("❌ Error al obtener pedidos:", err);
    }
  };

  const exportarCSV = () => {
    let csv = "Nombre;Email;Estado;Fecha;Pedido;ComprobanteURL\n";
    pedidosFiltrados.forEach(p => {
      const pedidoStr = Object.entries(p.pedido || {})
        .map(([dia, platos]) =>
          `${dia}: ${Object.entries(platos).map(([platoKey, datos]) => {
            const nombre = datos?.nombreOriginal || platoKey;
            const cantidad = typeof datos === 'object' ? datos?.cantidad ?? 0 : datos;
            return `${nombre} x${cantidad}`;
          }).join(", ")}`.trim()
        ).join(" | ");

      csv += `${p.usuario?.nombre || 'N/A'};${p.usuario?.email || 'N/A'};${p.estado || 'pendiente'};${new Date(p.fecha).toLocaleDateString()};${pedidoStr};${p.comprobanteUrl || ''}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `historial-pedidos-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const pedidosFiltrados = pedidos.filter(p => {
    const matchBusqueda = `${p.usuario?.nombre || ''} ${p.usuario?.email || ''}`.toLowerCase().includes(filtroBusqueda.toLowerCase());
    const matchEstado = filtroEstado ? (p.estado || "pendiente") === filtroEstado : true;
    return matchBusqueda && matchEstado;
  });

  const indexInicio = (paginaActual - 1) * pedidosPorPagina;
  const indexFin = indexInicio + pedidosPorPagina;
  const pedidosPaginados = pedidosFiltrados.slice(indexInicio, indexFin);

  const totalPaginas = Math.ceil(pedidosFiltrados.length / pedidosPorPagina);

  const obtenerColorCard = (estado) => {
    switch (estado) {
      case 'realizado': return '#e0f2f1';
      case 'cancelado': return '#ffebee';
      default: return '#fffde7';
    }
  };

  return (
    <Container sx={{ mt: 4, pb: 8 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => window.location.href = "/admin"}
        sx={{ mb: 3 }}
      >
        Volver al admin
      </Button>

      <Typography variant="h4" gutterBottom textAlign="center">
        📜 Historial de Pedidos
      </Typography>

      {/* Filtros */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Buscar por nombre o email"
            variant="outlined"
            fullWidth
            value={filtroBusqueda}
            onChange={(e) => {
              setFiltroBusqueda(e.target.value);
              setPaginaActual(1);
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
                setPaginaActual(1);
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

      {/* Lista de pedidos */}
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
          >
            <Card sx={{ mb: 3, backgroundColor: obtenerColorCard(p.estado || "pendiente") }}>
              <CardContent>
                <Typography variant="h6">
                  👤 {p.usuario?.nombre} ({p.usuario?.email})
                </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
  📅 Pedido creado: {new Date(p.fecha).toLocaleDateString()}
</Typography>

{p.pedido?.fecha_dia_por_dia && Object.keys(p.pedido.fecha_dia_por_dia).length > 0 && (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2">📆 Fechas reales de entrega:</Typography>
    {Object.entries(p.pedido.fecha_dia_por_dia).map(([dia, fecha], idx) => (
      <Typography variant="body2" key={idx}>
        • {dia.toUpperCase()}: {new Date(fecha).toLocaleDateString()}
      </Typography>
    ))}
  </Box>
)}


                <Divider sx={{ my: 2 }} />

                {Object.entries(p.pedido || {}).map(([dia, platos], idx) => (
                  <div key={idx}>
                    <Typography variant="subtitle2" sx={{ mt: 2 }}>
                      📅 {dia.toUpperCase()}
                    </Typography>
                  {Object.entries(platos).map(([platoKey, datos], k) => {
  const esObjeto = typeof datos === 'object' && datos !== null;
  const nombreMostrar = esObjeto ? (datos.nombreOriginal || platoKey) : platoKey;
  const cantidadMostrar = esObjeto ? (datos.cantidad ?? 0) : datos;

  return (
    <Typography variant="body2" key={k}>
      🍽️ {nombreMostrar}: {cantidadMostrar} unidad{cantidadMostrar !== 1 ? 'es' : ''}
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

                {p.comprobanteUrl && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold">📎 Comprobante:</Typography>
                    <img
                      src={p.comprobanteUrl}
                      alt="Comprobante"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 200,
                        borderRadius: 6,
                        marginTop: 8
                      }}
                    />
                    <a
                      href={p.comprobanteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={p.comprobanteNombre || 'comprobante.jpg'}
                      style={{ display: 'inline-block', marginTop: 10 }}
                    >
                      <Button size="small" variant="outlined">Descargar</Button>
                    </a>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}

      {/* Paginación */}
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
