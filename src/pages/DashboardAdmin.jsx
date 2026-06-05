import { useEffect, useState } from "react";
import { Container, Typography, Card, Divider, Grid, Box, Button } from "@mui/material";
import { motion } from "framer-motion";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from "../api/api";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const DashboardAdmin = () => {
  const [pedidos, setPedidos] = useState([]);
  const [resumen, setResumen] = useState({
    totalPedidos: 0,
    totalUsuarios: 0,
    totalPlatos: 0,
    cancelados: 0,
    realizados: 0,
    pedidosPorDia: {},
    platosVendidos: {},
    platosVendidosPorDia: {}
  });

  const fetchPedidos = async () => {
    try {
      const res = await api.get("/orders/all");
      const pedidosOrdenados = res.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setPedidos(pedidosOrdenados);
      calcularResumen(pedidosOrdenados);
    } catch (error) {
      console.error("❌ Error al obtener pedidos:", error);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const extraMap = {
    "1": "🍰 Postre",
    "2": "🥗 Ensalada",
    "3": "💪 Proteína",
    "ID:1": "🍰 Postre",
    "ID:2": "🥗 Ensalada",
    "ID:3": "💪 Proteína"
  };

  const calcularResumen = (pedidos) => {
    const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

    const resumenTemp = {
      totalPedidos: pedidos.length,
      totalUsuarios: new Set(pedidos.map(p => p.usuario?.email)).size,
      totalPlatos: 0,
      cancelados: pedidos.filter(p => p.estado === "cancelado").length,
      realizados: pedidos.filter(p => p.estado === "realizado").length,
      pedidosPorDia: {},
      platosVendidos: {},
      platosVendidosPorDia: {}
    };

    diasSemana.forEach(dia => {
      resumenTemp.pedidosPorDia[dia] = 0;
      resumenTemp.platosVendidosPorDia[dia] = {};
    });

    pedidos.forEach((pedido) => {
      const datosPedido = pedido.pedido || {};

      ['diarios', 'extras'].forEach(tipo => {
        const diasTipo = datosPedido[tipo] || {};
        Object.entries(diasTipo).forEach(([dia, platos]) => {
          if (!diasSemana.includes(dia)) return;
          resumenTemp.pedidosPorDia[dia]++;

          Object.entries(platos).forEach(([nombrePlato, cantidad]) => {
            const esExtra = tipo === 'extras';
            const nombreReal = esExtra ? extraMap[nombrePlato] || nombrePlato : nombrePlato;

            resumenTemp.platosVendidos[nombreReal] = (resumenTemp.platosVendidos[nombreReal] || 0) + cantidad;
            resumenTemp.platosVendidosPorDia[dia][nombreReal] = (resumenTemp.platosVendidosPorDia[dia][nombreReal] || 0) + cantidad;
            resumenTemp.totalPlatos += cantidad;
          });
        });
      });

      if (datosPedido.tartas && Object.keys(datosPedido.tartas).length > 0) {
        const fecha = new Date(pedido.fecha);
        const diaPedido = fecha.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();

        if (diasSemana.includes(diaPedido)) {
          resumenTemp.pedidosPorDia[diaPedido]++;
          Object.entries(datosPedido.tartas).forEach(([nombreTarta, cantidad]) => {
            resumenTemp.platosVendidos[nombreTarta] = (resumenTemp.platosVendidos[nombreTarta] || 0) + cantidad;
            resumenTemp.platosVendidosPorDia[diaPedido][nombreTarta] = (resumenTemp.platosVendidosPorDia[diaPedido][nombreTarta] || 0) + cantidad;
            resumenTemp.totalPlatos += cantidad;
          });
        }
      }
    });

    setResumen(resumenTemp);
  };

  const datosGraficoTorta = {
    labels: Object.keys(resumen.platosVendidos || {}),
    datasets: [{
      label: "Platos vendidos",
      data: Object.values(resumen.platosVendidos || {}),
      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#8D6E63"],
      borderWidth: 1
    }]
  };

  const datosGraficoBarras = {
    labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
    datasets: [{
      label: "Pedidos por día",
      data: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'].map(d => resumen.pedidosPorDia?.[d] || 0),
      backgroundColor: "#42A5F5"
    }]
  };

  return (
    <Container sx={{ mt: 4, pb: 6 }}>
      <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => window.location.href = "/admin"} sx={{ mb: 3 }}>
        Volver
      </Button>

      <Typography variant="h4" gutterBottom textAlign="center">
        📊 Estadísticas y Métricas
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>📝 Total Pedidos</Typography>
              <Typography variant="h4">{resumen.totalPedidos}</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>👥 Usuarios únicos</Typography>
              <Typography variant="h5">{resumen.totalUsuarios}</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>❌ Cancelados</Typography>
              <Typography variant="h5" color="error">{resumen.cancelados}</Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>✅ Realizados: {resumen.realizados}</Typography>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={8}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>📅 Pedidos por Día</Typography>
              <Bar data={datosGraficoBarras} options={{ responsive: true }} />
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={12}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>🍽️ Platos más vendidos</Typography>
              <Box sx={{ height: 400, display: 'flex', justifyContent: 'center' }}>
                 <Pie data={datosGraficoTorta} options={{ responsive: true, maintainAspectRatio: false }} />
              </Box>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardAdmin;
