import { useEffect, useState } from "react";
import { Container, Typography, Card, CardContent, Divider, Grid, Box, Button, Avatar } from "@mui/material";
import { motion } from "framer-motion";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { ArrowBack, Assignment, Group, CheckCircle, Cancel, TrendingUp } from "@mui/icons-material";
import api from "../api/api";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const DashboardAdmin = () => {
  const [resumen, setResumen] = useState({
    totalPedidos: 0,
    totalUsuarios: 0,
    totalPlatos: 0,
    cancelados: 0,
    entregados: 0,
    pedidosPorDia: {},
    platosVendidos: {},
  });
  const [loading, setLoading] = useState(true);

  const formatSlug = (slug) => {
    if (!slug) return '';
    const clean = slug.replace(/^tarta-/i, ''); // remove prefix if exists
    return clean.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const extraMap = {
    "1": "🍰 Postre",
    "2": "🥗 Ensalada",
    "3": "💪 Proteína",
    "ID:1": "🍰 Postre",
    "ID:2": "🥗 Ensalada",
    "ID:3": "💪 Proteína"
  };

  const fetchPedidos = async () => {
    try {
      const res = await api.get("/orders/all");
      const pedidosOrdenados = res.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      calcularResumen(pedidosOrdenados);
    } catch (error) {
      console.error("❌ Error al obtener pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
    // eslint-disable-next-line
  }, []);

  const calcularResumen = (pedidos) => {
    const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

    const resumenTemp = {
      totalPedidos: pedidos.length,
      totalUsuarios: new Set(pedidos.map(p => p.usuario?.email)).size,
      totalPlatos: 0,
      cancelados: pedidos.filter(p => p.estado === "cancelado").length,
      entregados: pedidos.filter(p => p.estado === "entregado").length,
      pedidosPorDia: {},
      platosVendidos: {},
    };

    diasSemana.forEach(dia => {
      resumenTemp.pedidosPorDia[dia] = 0;
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
            let nombreReal = esExtra ? (extraMap[nombrePlato] || nombrePlato) : nombrePlato;
            
            // Normalize names
            if (nombreReal.includes('-')) {
               nombreReal = formatSlug(nombreReal);
            }

            resumenTemp.platosVendidos[nombreReal] = (resumenTemp.platosVendidos[nombreReal] || 0) + cantidad;
            resumenTemp.totalPlatos += cantidad;
          });
        });
      });

      if (datosPedido.tartas && Object.keys(datosPedido.tartas).length > 0) {
        const fecha = new Date(pedido.fecha);
        let diaPedido = fecha.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
        
        // tartas might not match perfectly the exact day string if Timezone differs, 
        // fallback to putting it in total stats
        if (diasSemana.includes(diaPedido)) {
          resumenTemp.pedidosPorDia[diaPedido]++;
        }

        Object.entries(datosPedido.tartas).forEach(([nombreTarta, cantidad]) => {
          const nombreReal = "🥧 " + formatSlug(nombreTarta);
          resumenTemp.platosVendidos[nombreReal] = (resumenTemp.platosVendidos[nombreReal] || 0) + cantidad;
          resumenTemp.totalPlatos += cantidad;
        });
      }
    });

    // Ordenar platos más vendidos de mayor a menor
    const platosOrdenados = Object.entries(resumenTemp.platosVendidos)
      .sort(([, a], [, b]) => b - a)
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

    resumenTemp.platosVendidos = platosOrdenados;
    setResumen(resumenTemp);
  };

  // Tomar el Top 10 para el gráfico
  const topPlatosLabels = Object.keys(resumen.platosVendidos).slice(0, 10);
  const topPlatosData = Object.values(resumen.platosVendidos).slice(0, 10);

  const datosGraficoTorta = {
    labels: topPlatosLabels.length > 0 ? topPlatosLabels : ['Sin datos'],
    datasets: [{
      data: topPlatosData.length > 0 ? topPlatosData : [1],
      backgroundColor: ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#64748b"],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const chartOptionsPie = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { boxWidth: 12, font: { size: 12, family: 'Inter' } }
      }
    }
  };

  const datosGraficoBarras = {
    labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
    datasets: [{
      label: "Pedidos realizados",
      data: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'].map(d => resumen.pedidosPorDia?.[d] || 0),
      backgroundColor: "#3b82f6",
      borderRadius: 6,
    }]
  };

  const chartOptionsBar = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, grid: { borderDash: [5, 5] } },
      x: { grid: { display: false } }
    },
    plugins: { legend: { display: false } }
  };

  const KpiCard = ({ title, value, icon, color, bgcolor }) => (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
        <Avatar sx={{ bgcolor: bgcolor, color: color, width: 56, height: 56, mr: 2 }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight="bold" textTransform="uppercase">{title}</Typography>
          <Typography variant="h4" fontWeight="bold" sx={{ mt: 0.5 }}>{value}</Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container sx={{ mt: 4, pb: 6, maxWidth: '1200px !important' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => window.location.href = "/admin"}>
          Volver
        </Button>
        <Typography variant="h4" fontWeight="bold">📊 Panel de Métricas</Typography>
        <Box /> {/* Spacer */}
      </Box>

      {loading ? (
        <Typography textAlign="center" color="text.secondary" mt={10}>Cargando estadísticas...</Typography>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Fila de KPIs */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard title="Total Pedidos" value={resumen.totalPedidos} icon={<Assignment fontSize="large" />} color="#4f46e5" bgcolor="#e0e7ff" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard title="Usuarios Únicos" value={resumen.totalUsuarios} icon={<Group fontSize="large" />} color="#0ea5e9" bgcolor="#e0f2fe" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard title="Entregados" value={resumen.entregados} icon={<CheckCircle fontSize="large" />} color="#10b981" bgcolor="#d1fae5" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard title="Cancelados" value={resumen.cancelados} icon={<Cancel fontSize="large" />} color="#ef4444" bgcolor="#fee2e2" />
            </Grid>
          </Grid>

          {/* Gráficos */}
          <Grid container spacing={3}>
            {/* Gráfico de Barras */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box display="flex" alignItems="center" mb={3} gap={1}>
                    <TrendingUp color="primary" />
                    <Typography variant="h6" fontWeight="bold">Volumen de Pedidos por Día</Typography>
                  </Box>
                  <Box sx={{ height: 300 }}>
                    <Bar data={datosGraficoBarras} options={chartOptionsBar} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Gráfico de Torta */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" mb={3}>🥗 Top 10 Platos Más Vendidos</Typography>
                  <Box sx={{ height: 300 }}>
                    <Doughnut data={datosGraficoTorta} options={chartOptionsPie} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      )}
    </Container>
  );
};

export default DashboardAdmin;
