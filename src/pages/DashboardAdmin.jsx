import { useEffect, useState } from "react";
import {
  Container, Typography, Card, Divider, Grid,
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, TextField, Snackbar, Alert 
} from "@mui/material";
import { motion } from "framer-motion";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement, BarElement, CategoryScale, LinearScale,
  Tooltip, Legend
} from "chart.js";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import api from "../api/api";
import UserCard from "../components/UserCard";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const DashboardAdmin = () => {
  const [pedidos, setPedidos] = useState([]);
  const [resumen, setResumen] = useState({});
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [semanaActiva, setSemanaActiva] = useState(null);
const [nuevaFechaCierre, setNuevaFechaCierre] = useState('');
const [loadingSemana, setLoadingSemana] = useState(false);
const [nuevaFechaInicio, setNuevaFechaInicio] = useState('');
const [nuevaFechaFin, setNuevaFechaFin] = useState('');
const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
const [confirmDelete, setConfirmDelete] = useState({ open: false, userId: null });






useEffect(() => {
  fetchSemanaActiva();
}, []);

const fetchSemanaActiva = async () => {
  try {
    const res = await api.get('/semana/actual');
 setNuevaFechaInicio(res.data.semana_inicio?.split('T')[0] || '');
setNuevaFechaFin(res.data.semana_fin?.split('T')[0] || '');

setNuevaFechaCierre(res.data.cierre?.split('T')[0] || '');
setSemanaActiva(res.data);

  } catch (err) {
    console.error('❌ Error al obtener semana activa:', err);
  }
};



  useEffect(() => {
    fetchPedidos();
    fetchUsuarios();
  }, []);

  const roleMapReverse = {
  usuario: 1,
  empresa: 2,
  delivery: 3,
  admin: 4,
  moderador: 5
};

const actualizarFechasSemana = async () => {
  try {
    await api.put('/semana', {
      fecha_inicio: nuevaFechaInicio,
      fecha_fin: nuevaFechaFin,
      cierre: nuevaFechaCierre
    });

    fetchSemanaActiva();
    alert('✅ Semana actualizada correctamente');
  } catch (err) {
    console.error('❌ Error al actualizar fechas de semana:', err);
    alert('Error al actualizar las fechas de la semana');
  }
};


const toggleHabilitacion = async () => {
  try {
    await api.put('/semana/habilitar', {
      habilitado: !semanaActiva.habilitado
    });
    fetchSemanaActiva();
    alert(`🔁 Semana ${!semanaActiva.habilitado ? 'habilitada' : 'bloqueada'}`);
  } catch (err) {
    console.error('❌ Error al cambiar estado:', err);
  }
};

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

  const fetchUsuarios = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsuarios(res.data);
    } catch (err) {
      console.error("❌ Error al cargar usuarios:", err);
    }
  };

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

    // 1. DIARIOS y EXTRAS → contienen días como claves
    ['diarios', 'extras'].forEach(tipo => {
      const diasTipo = datosPedido[tipo] || {};
      Object.entries(diasTipo).forEach(([dia, platos]) => {
        if (!diasSemana.includes(dia)) return;

        resumenTemp.pedidosPorDia[dia]++;

      Object.entries(platos).forEach(([nombrePlato, cantidad]) => {
  const esExtra = tipo === 'extras';
  const nombreReal = esExtra
    ? extraMap[nombrePlato] || nombrePlato
    : nombrePlato;

  resumenTemp.platosVendidos[nombreReal] = (resumenTemp.platosVendidos[nombreReal] || 0) + cantidad;
  resumenTemp.platosVendidosPorDia[dia][nombreReal] = (resumenTemp.platosVendidosPorDia[dia][nombreReal] || 0) + cantidad;
  resumenTemp.totalPlatos += cantidad;
});

      });
    });

    // 2. TARTAS → no tienen días asociados (💡 usar fecha del pedido)
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



const cambiarRol = async (userId, nuevoRol) => {
  try {
    const res = await api.put(`/admin/users/${userId}/role`, { rol: nuevoRol }); // ✅ usa `rol`, no `role_id`
    console.log('✔️ Rol actualizado:', res.data);

    // Actualiza el estado localmente sin refetch
    setUsuarios(prev =>
      prev.map(u =>
        u.id === userId ? { ...u, rol: nuevoRol } : u
      )
    );
  } catch (err) {
    console.error("❌ Error al cambiar rol:", err);
  }
};

const confirmarEliminarUsuario = (userId) => {
  setConfirmDelete({ open: true, userId });
};


const eliminarUsuario = async () => {
  try {
    await api.delete(`/admin/users/${confirmDelete.userId}`);
    setSnackbar({ open: true, message: '✅ Usuario eliminado correctamente', severity: 'success' });
    fetchUsuarios();
  } catch (err) {
    const detail = err.response?.data?.detail || 'Error al eliminar usuario';
    setSnackbar({ open: true, message: `❌ ${detail}`, severity: 'error' });
  } finally {
    setConfirmDelete({ open: false, userId: null });
  }
};




  const abrirModalUsuario = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setModalAbierto(true);
  };

  const cerrarModalUsuario = () => {
    setUsuarioSeleccionado(null);
    setModalAbierto(false);
  };

  const exportarUsuariosExcel = () => {
    const data = usuariosFiltrados.map((u) => ({
  ID: u.id,
  Nombre: u.nombre || "—",
  Apellido: u.apellido || "—",
  Email: u.email,
  Rol: u.rol,
  Teléfono: u.telefono || "—",
  Dirección_Principal: u.direccion_principal || "—",
  Dirección_Secundaria: u.direccion_secundaria || "—"
}));


    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "usuarios-eatandrun.xlsx");
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const coincideRol = filtroRol === "todos" || u.rol === filtroRol;
    const coincideBusqueda = `${u.nombre || ""} ${u.email || ""}`.toLowerCase().includes(busqueda.toLowerCase());
    return coincideRol && coincideBusqueda;
  });

  const datosGraficoTorta = {
    labels: Object.keys(resumen.platosVendidos || {}),
    datasets: [{
      label: "Platos vendidos",
      data: Object.values(resumen.platosVendidos || {}),
      backgroundColor: [
        "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
        "#9966FF", "#FF9F40", "#8D6E63"
      ],
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

<Card sx={{ p: 3, mb: 4 }}>
  <Typography variant="h5" gutterBottom>⚙️ Gestión de Semana Activa</Typography>
  {semanaActiva ? (
    <>
<Typography>
  📅 Semana actual: <strong>{semanaActiva.fecha_inicio}</strong> al <strong>{semanaActiva.fecha_fin}</strong>
</Typography>

      <Typography>🕔 Cierre: <strong>{semanaActiva.cierre?.split('T')[0]}</strong></Typography>
      <Typography>🚦 Estado: <strong>{semanaActiva.habilitado ? 'Habilitado ✅' : 'Cerrado ❌'}</strong></Typography>

      <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="📅 Inicio de semana"
          type="date"
          value={nuevaFechaInicio}
          onChange={(e) => setNuevaFechaInicio(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="📅 Fin de semana"
          type="date"
          value={nuevaFechaFin}
          onChange={(e) => setNuevaFechaFin(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="🕒 Fecha de cierre"
          type="date"
          value={nuevaFechaCierre}
          onChange={(e) => setNuevaFechaCierre(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button variant="contained" color="primary" onClick={actualizarFechasSemana}>
          💾 Guardar semana
        </Button>
        <Button
          onClick={toggleHabilitacion}
          variant="contained"
          color={semanaActiva.habilitado ? 'error' : 'success'}
        >
          {semanaActiva.habilitado ? '❌ Bloquear pedidos' : '✅ Habilitar pedidos'}
        </Button>
      </Box>
    </>
  ) : (
    <Typography>Cargando semana activa...</Typography>
  )}
</Card>


      <Grid container spacing={3}>
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
              <Pie data={datosGraficoTorta} options={{ responsive: true }} />
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      <Typography variant="h5" sx={{ mt: 6, mb: 2 }}>
        👤 Gestión de Usuarios
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ padding: 8, width: '100%', maxWidth: 300, borderRadius: 4, border: '1px solid #ccc' }}
        />

        <Select
          size="small"
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="todos">Todos los roles</MenuItem>
          <MenuItem value="usuario">Usuario</MenuItem>
          <MenuItem value="empresa">Empresa</MenuItem>
          <MenuItem value="delivery">Delivery</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </Select>

        <Button variant="outlined" onClick={exportarUsuariosExcel}>
          📤 Exportar a Excel
        </Button>
      </Box>

      <Card sx={{ p: 2, mb: 6 }}>
        {usuariosFiltrados.length === 0 ? (
          <Typography>No hay usuarios que coincidan con la búsqueda.</Typography>
        ) : (
          usuariosFiltrados.map((usuario) => (
          <UserCard
  key={usuario.id}
  usuario={usuario}
  onVer={abrirModalUsuario}
onEliminar={confirmarEliminarUsuario}

  onRolChange={cambiarRol}
/>

          ))
        )}
      </Card>
<Dialog open={modalAbierto} onClose={cerrarModalUsuario}>
  <DialogTitle>👤 Información del Usuario</DialogTitle>
  <DialogContent dividers>
    {usuarioSeleccionado ? (
      <>
        <Typography><strong>ID:</strong> {usuarioSeleccionado.id}</Typography>
        <Typography><strong>Nombre:</strong> {usuarioSeleccionado.nombre || '—'}</Typography>
        <Typography><strong>Apellido:</strong> {usuarioSeleccionado.apellido || '—'}</Typography>
        <Typography><strong>Email:</strong> {usuarioSeleccionado.email}</Typography>
        <Typography><strong>Rol:</strong> {usuarioSeleccionado.rol}</Typography>
        <Typography><strong>Teléfono:</strong> {usuarioSeleccionado.telefono || '—'}</Typography>
        <Typography><strong>Dirección principal:</strong> {usuarioSeleccionado.direccion_principal || '—'}</Typography>
        <Typography><strong>Dirección secundaria:</strong> {usuarioSeleccionado.direccion_secundaria || '—'}</Typography>
      </>
    ) : (
      <Typography>Cargando...</Typography>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={cerrarModalUsuario} color="primary">Cerrar</Button>
  </DialogActions>
</Dialog>

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
      <Snackbar
  open={snackbar.open}
  autoHideDuration={4000}
  onClose={() => setSnackbar({ ...snackbar, open: false })}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
>
  <Alert
    onClose={() => setSnackbar({ ...snackbar, open: false })}
    severity={snackbar.severity}
    sx={{ width: '100%' }}
  >
    {snackbar.message}
  </Alert>
</Snackbar>

<Dialog
  open={confirmDelete.open}
  onClose={() => setConfirmDelete({ open: false, userId: null })}
>
  <DialogTitle>¿Eliminar usuario?</DialogTitle>
  <DialogContent>Esta acción no se puede deshacer. ¿Deseás continuar?</DialogContent>
  <DialogActions>
    <Button onClick={() => setConfirmDelete({ open: false, userId: null })}>Cancelar</Button>
    <Button onClick={eliminarUsuario} color="error" variant="contained">Eliminar</Button>
  </DialogActions>
</Dialog>


    </Container>
  );
};

export default DashboardAdmin;
