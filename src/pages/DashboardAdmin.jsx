import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Divider,
  Grid,
  Box,
  Button
} from "@mui/material";
import { motion } from "framer-motion";
import { Bar, Pie } from 'react-chartjs-2'; // 👈 GRAFICOS
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const DashboardAdmin = () => {
  const [pedidos, setPedidos] = useState([]);
  const [resumen, setResumen] = useState({});

  useEffect(() => {
    const data = localStorage.getItem("pedidos_eatandrun");
    if (data) {
      const parsed = JSON.parse(data);
      setPedidos(parsed);
      calcularResumen(parsed);
    }
  }, []);

  const calcularResumen = (pedidos) => {
    const resumenTemp = {
      totalPedidos: pedidos.length,
      totalUsuarios: new Set(pedidos.map((p) => p.usuario.email)).size,
      totalPlatos: 0,
      cancelados: pedidos.filter((p) => p.estado === "cancelado").length,
      realizados: pedidos.filter((p) => p.estado === "realizado").length,
      pedidosPorDia: {},
      platosVendidos: {}
    };

    pedidos.forEach((p) => {
      Object.entries(p.pedido).forEach(([dia, platos]) => {
        if (!resumenTemp.pedidosPorDia[dia]) resumenTemp.pedidosPorDia[dia] = 0;
        resumenTemp.pedidosPorDia[dia]++;

        Object.entries(platos).forEach(([platoKey, datos]) => {
          const nombre = typeof datos === 'object' ? (datos.nombreOriginal || platoKey) : platoKey;
          const cantidad = typeof datos === 'object' ? (datos.cantidad ?? 0) : datos;

          if (!resumenTemp.platosVendidos[nombre]) resumenTemp.platosVendidos[nombre] = 0;
          resumenTemp.platosVendidos[nombre] += cantidad;
          resumenTemp.totalPlatos += cantidad;
        });
      });
    });

    setResumen(resumenTemp);
  };

  const datosGraficoTorta = {
    labels: Object.keys(resumen.platosVendidos || {}),
    datasets: [
      {
        label: 'Platos vendidos',
        data: Object.values(resumen.platosVendidos || {}),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
        ],
        borderWidth: 1
      }
    ]
  };

  const datosGraficoBarras = {
    labels: Object.keys(resumen.pedidosPorDia || {}),
    datasets: [
      {
        label: 'Pedidos por día',
        data: Object.values(resumen.pedidosPorDia || {}),
        backgroundColor: '#42A5F5',
      }
    ]
  };

  return (
    <Container sx={{ mt: 4, pb: 6 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => window.location.href = "/admin"}
        sx={{ mb: 3 }}
      >
        Volver
      </Button>

      <Typography variant="h4" gutterBottom textAlign="center">
        📊 Dashboard Admin
      </Typography>

      <Grid container spacing={3}>
        {/* Datos generales */}
        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                📝 Total Pedidos
              </Typography>
              <Typography variant="h4">{resumen.totalPedidos}</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                👥 Usuarios únicos
              </Typography>
              <Typography variant="h5">{resumen.totalUsuarios}</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                ❌ Cancelados
              </Typography>
              <Typography variant="h5" color="error">
                {resumen.cancelados}
              </Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>
                ✅ Realizados: {resumen.realizados}
              </Typography>
            </Card>
          </motion.div>
        </Grid>

        {/* Pedidos por día - BARRAS */}
        <Grid item xs={12} md={8}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                📅 Pedidos por Día
              </Typography>
              <Bar data={datosGraficoBarras} options={{ responsive: true }} />
            </Card>
          </motion.div>
        </Grid>

        {/* Platos más vendidos - TORTA */}
        <Grid item xs={12} md={12}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                🍽️ Platos más vendidos
              </Typography>
              <Pie data={datosGraficoTorta} options={{ responsive: true }} />
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Botón extra */}
      <Box textAlign="center" sx={{ mt: 5 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<HistoryEduIcon />}
          onClick={() => window.location.href = "/admin/historial"}
          size="large"
        >
          Ver historial de pedidos
        </Button>
      </Box>
    </Container>
  );
};

export default DashboardAdmin;
