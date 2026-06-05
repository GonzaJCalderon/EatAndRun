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
import SemanaManage from "../components/SemanaManage";


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
const [empresas, setEmpresas] = useState([]);
const [modalEmpresaAbierto, setModalEmpresaAbierto] = useState(false);
const [modalCrearUsuario, setModalCrearUsuario] = useState(false);
const [modalEditar, setModalEditar] = useState(false);
const [usuarioEditando, setUsuarioEditando] = useState(null);

const [semanasHabilitadas, setSemanasHabilitadas] = useState([]);
const [semanasDisponibles, setSemanasDisponibles] = useState([]);

const fetchSemanasDisponibles = async () => {
  try {
    const res = await api.get("/semana/disponibles");
    setSemanasDisponibles(res.data.semanas || []);
  } catch (err) {
    console.error("❌ Error al obtener semanas disponibles:", err);
  }
};



const fetchSemanasHabilitadas = async () => {
  try {
    const res = await api.get('/semana/activas');
    setSemanasHabilitadas(res.data.semanas || []);
  } catch (err) {
    console.error('❌ Error al obtener semanas habilitadas:', err);
  }
};

const guardarSemana = async (semanaId, { inicio, fin, cierre }) => {
  try {
    await api.put("/semana", {
      fecha_inicio: inicio,
      fecha_fin: fin,
      cierre
    });
    fetchSemanasHabilitadas();
    setSnackbar({ open: true, message: "✅ Semana actualizada", severity: "success" });
  } catch (err) {
    console.error("❌ Error al guardar semana:", err);
    setSnackbar({ open: true, message: "❌ Error al guardar semana", severity: "error" });
  }
};

const eliminarSemana = async (semanaId) => {
  if (!window.confirm('¿Eliminar esta semana? Asegurate que no tenga pedidos.')) return;

  try {
    await api.delete(`/semana/${semanaId}`);
    setSnackbar({ open: true, message: '✅ Semana eliminada correctamente', severity: 'success' });
    fetchSemanasHabilitadas(); // refresca
  } catch (err) {
    console.error("❌ Error al eliminar semana:", err.response?.data || err);
    setSnackbar({ open: true, message: `❌ ${err.response?.data?.error || 'No se pudo eliminar'}`, severity: 'error' });
  }
};


const guardarDiasSemana = async (semanaId, dias) => {
  try {
    await api.put("/semana/dias", { dias_habilitados: dias });
    fetchSemanasHabilitadas();
    setSnackbar({ open: true, message: "✅ Días actualizados", severity: "success" });
  } catch (err) {
    console.error("❌ Error al guardar días:", err);
    setSnackbar({ open: true, message: "❌ Error al guardar días", severity: "error" });
  }
};
const toggleEstadoSemana = async (semanaId, nuevoEstado) => {
  try {
    const res = await api.put("/semana/habilitar", {
      id: semanaId,
      habilitado: nuevoEstado
    });

    console.log("✅ Backend respondió:", res.data); // <--- importante para ver qué pasó

    fetchSemanasHabilitadas();
    setSnackbar({
      open: true,
      message: nuevoEstado ? "✅ Semana habilitada" : "❌ Semana bloqueada",
      severity: "success"
    });
  } catch (err) {
    console.error("❌ Error al cambiar estado:", err.response?.data || err);
    setSnackbar({ open: true, message: "❌ Error al cambiar estado", severity: "error" });
  }
};


const abrirModalEdicion = (usuario) => {
  setUsuarioEditando(usuario);
  setModalEditar(true);
};

const [nuevoUsuario, setNuevoUsuario] = useState({
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  rol: 'usuario'
});


const [diasHabilitados, setDiasHabilitados] = useState({
  lunes: true,
  martes: true,
  miercoles: true,
  jueves: true,
  viernes: true
});

const [nuevaEmpresa, setNuevaEmpresa] = useState({
  nombre: '',
  responsable_email: '',
cuit:''
});

const handleEditarUsuario = async () => {
  try {
    const payload = {
      name: usuarioEditando.nombre,
      apellido: usuarioEditando.apellido,
      email: usuarioEditando.email,
      telefono: usuarioEditando.telefono,
      direccion_principal: usuarioEditando.direccion_principal,
      direccion_alternativa: usuarioEditando.direccion_secundaria
    };

    await api.put(`/admin/users/${usuarioEditando.id}`, payload);

    if (usuarioEditando.rol) {
      await api.put(`/admin/users/${usuarioEditando.id}/role`, {
        rol: usuarioEditando.rol // ✅ aquí está la clave
      });
    }

    setSnackbar({ open: true, message: '✅ Usuario actualizado', severity: 'success' });
    setModalEditar(false);
    fetchUsuarios(); // 👈 refresca lista
  } catch (err) {
    console.error('❌ Error al editar usuario:', err.response?.data || err);
    setSnackbar({ open: true, message: '❌ Error al editar usuario', severity: 'error' });
  }
};




const handleCrearUsuario = async () => {
  try {
    await api.post('/admin/users', nuevoUsuario);
    setSnackbar({ open: true, message: '✅ Usuario creado', severity: 'success' });
    fetchUsuarios();
    setModalCrearUsuario(false);
    setNuevoUsuario({ nombre: '', apellido: '', email: '', password: '', rol: 'usuario' });
  } catch (err) {
    console.error('❌ Error al crear usuario:', err);
    setSnackbar({ open: true, message: '❌ Error al crear usuario', severity: 'error' });
  }
};


useEffect(() => {
  fetchSemanasDisponibles();
}, []);


useEffect(() => {
  fetchSemanaActiva();
  fetchPedidos();
  fetchUsuarios();
  fetchEmpresas();
  fetchSemanasHabilitadas(); // ✅ esto es lo importante
}, []);


const fetchSemanaActiva = async () => {
  try {
    const res = await api.get('/semana/actual');

    setNuevaFechaInicio(res.data.semana_inicio?.split('T')[0] || '');
    setNuevaFechaFin(res.data.semana_fin?.split('T')[0] || '');
    setNuevaFechaCierre(res.data.cierre?.split('T')[0] || '');

    // 🆕 esto es lo importante:
    setDiasHabilitados(res.data.dias_habilitados || {
      lunes: true,
      martes: true,
      miercoles: true,
      jueves: true,
      viernes: true
    });

   setSemanaActiva({
  id: res.data.id,
  fecha_inicio: res.data.semana_inicio,
  fecha_fin: res.data.semana_fin,
  cierre: res.data.cierre,
  habilitado: res.data.habilitado,
  dias_habilitados: res.data.dias_habilitados
});

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
  moderador: 5,
  empleado: 6
};

const handleCrearEmpresa = async () => {
  try {
    await api.post('/admin/empresas', nuevaEmpresa);
    setSnackbar({ open: true, message: '✅ Empresa creada correctamente', severity: 'success' });
    fetchEmpresas();
    setModalEmpresaAbierto(false);
    setNuevaEmpresa({ nombre: '', responsable_email: '' });
  } catch (err) {
    console.error("❌ Error al crear empresa:", err);
    setSnackbar({ open: true, message: '❌ Error al crear empresa', severity: 'error' });
  }
};

const actualizarDiasHabilitados = async () => {
  try {
    await api.put('/semana/dias', { dias_habilitados: diasHabilitados });
    fetchSemanaActiva();
    alert('✅ Días habilitados guardados correctamente');
  } catch (err) {
    console.error('❌ Error al guardar días habilitados:', err);
    alert('Error al guardar días habilitados');
  }
};

const actualizarFechasSemana = async () => {
  if (!nuevaFechaInicio || !nuevaFechaFin || !nuevaFechaCierre) {
    alert('⛔ Todas las fechas son obligatorias');
    return;
  }

  if (new Date(nuevaFechaInicio) > new Date(nuevaFechaFin)) {
    alert('⛔ La fecha de inicio no puede ser posterior a la fecha de fin');
    return;
  }

  try {
    console.log('🛰️ Enviando fechas al backend:', {
      fecha_inicio: nuevaFechaInicio,
      fecha_fin: nuevaFechaFin,
      cierre: nuevaFechaCierre
    });

    await api.put('/semana', {
      fecha_inicio: nuevaFechaInicio,
      fecha_fin: nuevaFechaFin,
      cierre: nuevaFechaCierre
    });

    const nuevaSemana = await api.get('/semana/actual');
    console.log('🧾 Semana después de update:', nuevaSemana.data);

    fetchSemanaActiva(); // actualiza UI
    alert('✅ Semana actualizada correctamente');
  } catch (err) {
    console.error('❌ Error al actualizar fechas de semana:', err.response?.data || err);
    alert('Error al actualizar las fechas de la semana');
  }
};





const fetchEmpresas = async () => {
  try {
    const res = await api.get('/admin/empresas');
    setEmpresas(res.data);
  } catch (err) {
    console.error("❌ Error al obtener empresas:", err);
  }
};

const eliminarEmpresa = async (empresaId) => {
  if (!window.confirm('¿Eliminar esta empresa? Esta acción no se puede deshacer.')) return;

  try {
    await api.delete(`/admin/empresas/${empresaId}`);
    setSnackbar({ open: true, message: '✅ Empresa eliminada', severity: 'success' });
    fetchEmpresas(); // refrescamos
  } catch (err) {
    console.error('❌ Error al eliminar empresa:', err);
    setSnackbar({ open: true, message: '❌ Error al eliminar empresa', severity: 'error' });
  }
};


useEffect(() => {
  fetchEmpresas();
}, []);

const toggleHabilitacion = async () => {
  try {
    if (!semanaActiva?.id) {
      console.warn("⛔ semanaActiva.id no está disponible");
      return;
    }

    await api.put('/semana/habilitar', {
      id: semanaActiva.id,
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

      <Box sx={{ mt: 3 }}>
  <Typography variant="h6" gutterBottom>
    🔒 Días habilitados individualmente
  </Typography>

  <Grid container spacing={1}>
    {['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].map((dia) => (
      <Grid item xs={6} sm={4} md={2.4} key={dia}>
        <Button
          fullWidth
          variant={diasHabilitados[dia] ? 'contained' : 'outlined'}
          color={diasHabilitados[dia] ? 'success' : 'error'}
          onClick={() => setDiasHabilitados(prev => ({
            ...prev,
            [dia]: !prev[dia]
          }))}
        >
          {dia.charAt(0).toUpperCase() + dia.slice(1)}: {diasHabilitados[dia] ? '✅' : '❌'}
        </Button>
      </Grid>
    ))}
  </Grid>
</Box>


   <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
  <Button variant="contained" color="primary" onClick={actualizarFechasSemana}>
    💾 Guardar semana
  </Button>
  <Button
    variant="contained"
    color="secondary"
    onClick={actualizarDiasHabilitados}
  >
    🗓️ Guardar días habilitados
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
<Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
  🛠️ Otras semanas habilitadas
</Typography> 

<Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
  📦 Semanas disponibles para tomar pedidos
</Typography>

{semanasDisponibles.length > 0 ? (
  semanasDisponibles.map((semana) => (
    <Box key={semana.id} sx={{ my: 2, p: 2, border: '1px dashed #ccc', borderRadius: 2 }}>
      <Typography>
        Semana: <strong>{semana.semana_inicio}</strong> → <strong>{semana.semana_fin}</strong>
      </Typography>
      <Typography>Inicio toma de pedidos: <strong>{semana.inicio_toma_pedidos}</strong></Typography>
      <Typography>Estado: {semana.habilitado ? '✅ Habilitada' : '❌ Bloqueada'}</Typography>
      <Typography>Cierre: {new Date(semana.cierre).toLocaleString('es-AR')}</Typography>
    </Box>
  ))
) : (
  <Typography sx={{ mt: 2 }}>📭 No hay semanas disponibles aún</Typography>
)}



{semanasHabilitadas.length > 0 ? (
  semanasHabilitadas.map((semana) => (
  <SemanaManage
  key={semana.id}
  semana={semana}
  onGuardar={guardarSemana}
  onGuardarDias={guardarDiasSemana}
  onToggle={toggleEstadoSemana}
  onEliminar={eliminarSemana} // ✅ NUEVO
/>

  ))
) : (
  <Typography variant="body1" sx={{ mt: 2 }}>
    📭 No hay otras semanas habilitadas actualmente.
  </Typography>
)}



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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
  
</Box>

     




      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ padding: 8, width: '100%', maxWidth: 300, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <Button
  variant="contained"
  color="success"
  onClick={() => setModalCrearUsuario(true)}
>
  ➕ Crear Usuario
</Button>


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
           <MenuItem value="empleado">Empleado</MenuItem> 
           <MenuItem value="moderador">Moderador</MenuItem>

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
  onEditar={abrirModalEdicion} // ✅ ESTO FALTABA
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
        {/* <Button
          variant="contained"
          color="primary"
          startIcon={<HistoryEduIcon />}
          onClick={() => window.location.href = "/admin/historial"}
          size="large"
        >
          Ver historial de pedidos
        </Button> */}
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
<Dialog open={modalCrearUsuario} onClose={() => setModalCrearUsuario(false)}>
  <DialogTitle>➕ Crear nuevo usuario</DialogTitle>
  <DialogContent dividers>
    <TextField
      label="Nombre"
      fullWidth
      value={nuevoUsuario.nombre}
      onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
      sx={{ mb: 2 }}
    />
    <TextField
      label="Apellido"
      fullWidth
      value={nuevoUsuario.apellido}
      onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, apellido: e.target.value })}
      sx={{ mb: 2 }}
    />
    <TextField
      label="Email"
      fullWidth
      value={nuevoUsuario.email}
      onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
      sx={{ mb: 2 }}
    />
    <TextField
      label="Contraseña"
      fullWidth
      type="password"
      value={nuevoUsuario.password}
      onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
      sx={{ mb: 2 }}
    />
    <Select
      fullWidth
      value={nuevoUsuario.rol}
      onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })}
    >
      <MenuItem value="usuario">Usuario</MenuItem>
      <MenuItem value="empresa">Empresa</MenuItem>
      <MenuItem value="delivery">Delivery</MenuItem>
      <MenuItem value="admin">Admin</MenuItem>
      <MenuItem value="empleado">Empleado</MenuItem>
      <MenuItem value="moderador">Moderador</MenuItem>

    </Select>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setModalCrearUsuario(false)}>Cancelar</Button>
    <Button
      variant="contained"
      onClick={handleCrearUsuario}
      disabled={!nuevoUsuario.nombre || !nuevoUsuario.email || !nuevoUsuario.password}
    >
      Crear
    </Button>
  </DialogActions>
</Dialog>

<Dialog open={modalEditar} onClose={() => setModalEditar(false)}>
  <DialogTitle>✏️ Editar Usuario</DialogTitle>
  <DialogContent dividers>
    {usuarioEditando ? (
      <>
        <TextField
          label="Nombre"
          fullWidth
          sx={{ mb: 2 }}
          value={usuarioEditando.nombre || ''}
          onChange={(e) =>
            setUsuarioEditando((prev) => ({ ...prev, nombre: e.target.value }))
          }
        />
        <TextField
          label="Apellido"
          fullWidth
          sx={{ mb: 2 }}
          value={usuarioEditando.apellido || ''}
          onChange={(e) =>
            setUsuarioEditando((prev) => ({ ...prev, apellido: e.target.value }))
          }
        />
        <TextField
          label="Email"
          fullWidth
          sx={{ mb: 2 }}
          value={usuarioEditando.email || ''}
          onChange={(e) =>
            setUsuarioEditando((prev) => ({ ...prev, email: e.target.value }))
          }
        />
        <TextField
          label="Teléfono"
          fullWidth
          sx={{ mb: 2 }}
          value={usuarioEditando.telefono || ''}
          onChange={(e) =>
            setUsuarioEditando((prev) => ({ ...prev, telefono: e.target.value }))
          }
        />
        <TextField
          label="Dirección principal"
          fullWidth
          sx={{ mb: 2 }}
          value={usuarioEditando.direccion_principal || ''}
          onChange={(e) =>
            setUsuarioEditando((prev) => ({ ...prev, direccion_principal: e.target.value }))
          }
        />
        <TextField
          label="Dirección secundaria"
          fullWidth
          sx={{ mb: 2 }}
          value={usuarioEditando.direccion_secundaria || ''}
          onChange={(e) =>
            setUsuarioEditando((prev) => ({ ...prev, direccion_secundaria: e.target.value }))
          }
        />
<Select
  fullWidth
  value={usuarioEditando.rol}
  onChange={(e) =>
    setUsuarioEditando((prev) => ({ ...prev, rol: e.target.value }))
  }
>
  <MenuItem value="usuario">Usuario</MenuItem>
  <MenuItem value="empresa">Empresa</MenuItem>
  <MenuItem value="delivery">Delivery</MenuItem>
  <MenuItem value="admin">Admin</MenuItem>
  <MenuItem value="empleado">Empleado</MenuItem>
  <MenuItem value="moderador">Moderador</MenuItem> {/* ✅ ¡Este faltaba! */}
</Select>

      </>
    ) : (
      <Typography>Cargando datos del usuario...</Typography>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setModalEditar(false)}>Cancelar</Button>
    <Button
      variant="contained"
      onClick={handleEditarUsuario}
      disabled={!usuarioEditando?.nombre || !usuarioEditando?.email}
    >
      Guardar cambios
    </Button>
  </DialogActions>
</Dialog>





{/* <Dialog open={modalEmpresaAbierto} onClose={() => setModalEmpresaAbierto(false)}>
  <DialogTitle>➕ Crear nueva empresa</DialogTitle>
  <DialogContent dividers>
    <TextField
      label="🏢 Nombre de la empresa"
      fullWidth
      sx={{ mb: 2 }}
      value={nuevaEmpresa.nombre}
      onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, nombre: e.target.value })}
    />
    <TextField
      label="✉️ Email del responsable"
      fullWidth
      value={nuevaEmpresa.responsable_email}
      onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, responsable_email: e.target.value })}
    />
    <TextField
  label="CUIT"
  fullWidth
  value={nuevaEmpresa.cuit ?? ''} // 👈 esto lo protege
  onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, cuit: e.target.value })}
/>

  </DialogContent>
  <DialogActions>
    <Button onClick={() => setModalEmpresaAbierto(false)}>Cancelar</Button>
    <Button variant="contained" onClick={handleCrearEmpresa} disabled={!nuevaEmpresa.nombre || !nuevaEmpresa.responsable_email}>
      Crear
    </Button>
  </DialogActions>
</Dialog> */}



    </Container>
  );
};

export default DashboardAdmin;
