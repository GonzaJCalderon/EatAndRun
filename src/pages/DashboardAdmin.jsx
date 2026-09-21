// src/pages/DashboardAdmin.jsx
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  Container, Typography, Card, Divider, Grid,
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, TextField, Snackbar, Alert,
  Chip, Stack, Tooltip
} from "@mui/material";
import { motion } from "framer-motion";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement, BarElement, CategoryScale, LinearScale,
  Tooltip as ChartTooltip, Legend
} from "chart.js";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";
import SaveIcon from "@mui/icons-material/Save";
import AddCircleIcon from "@mui/icons-material/AddCircle";

import api from "../api/api";
import UserCard from "../components/UserCard";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import SemanaManage from "../components/SemanaManage";
import SemanasHistorial from "../components/SemanasHistorial";

import dayjs from "../utils/day"; // tu dayjs con TZ/locale

// =================== ChartJS ===================
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, ChartTooltip, Legend);

// =================== Helpers fechas ===================
const TZ = "America/Argentina/Buenos_Aires";

// medianoche local -> UTC ISO (string)
const toUTCAtLocalMidnight = (dateString) => {
  return dayjs.tz(dateString, "YYYY-MM-DD", TZ).utc().format();
};

// "YYYY-MM-DD" safe
const fmtInput = (s) => {
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return dayjs.utc(s).format("YYYY-MM-DD");
};

// para mostrar siempre YYYY-MM-DD
const fmtUI = (s) => {
  if (!s) return "—";
  return dayjs.tz(s, 'America/Argentina/Buenos_Aires').format("YYYY-MM-DD");
};


const dayLabel = (d) => (d ? dayjs(d).format("ddd").replace(".", "") : "—"); // ej: lun, mar...

// === Helpers de nombres (idénticos a AdminPedidos/Produccion) ===
const manualAliases = { '0': '👉 DEFINIR NOMBRE PARA ID 0', '8': '👉 DEFINIR NOMBRE PARA ID 8' };
const humanizar = (s='') => String(s).replace(/^ID:/i,'').replace(/_/g,' ').trim()
  .replace(/\s+/g,' ').toLowerCase().replace(/^\w|\s\w/g, c => c.toUpperCase());

const resolveNombrePlato = (platoKey = '', categoria = 'diarios', nameMapLocal = {}, extraMapLocal = {
  "1":"🍰 Postre","2":"🥗 Ensalada","3":"💪 Proteína"
}) => {
  const key = String(platoKey).trim();
  if (manualAliases[key]) return manualAliases[key];
  if (manualAliases[key.replace(/^ID:/i, '')]) return manualAliases[key.replace(/^ID:/i, '')];

  const idMatch = key.match(/^ID:(\d+)$/i);
  if (idMatch) {
    const id = idMatch[1];
    if (categoria === 'extras') return extraMapLocal[id] || `Extra ${id}`;
    const catMap = nameMapLocal[categoria] || {};
    return catMap[id] || `Plato ${id}`;
  }

  if (/^\d+$/.test(key)) {
    const catMap = nameMapLocal[categoria] || {};
    if (catMap[key]) return catMap[key];
    if (categoria === 'extras') return extraMapLocal[key] || `Extra ${key}`;
    return `Plato ${key}`;
  }

  const catMap = nameMapLocal[categoria] || {};
  if (catMap[key]) return catMap[key];
  return humanizar(key);
};

// Construye nameMap desde menú
const buildNameMapFromMenu = async () => {
  const map = { diarios: {}, extras: { '1':'🍰 Postre','2':'🥗 Ensalada','3':'💪 Proteína' }, tartas: {} };
  try {
    const r = await api.get('/daily/semanal');
    const semanal = r.data || {};
    Object.values(semanal).forEach(diaObj => {
      (diaObj?.especiales || []).forEach(p => {
        const id = String(p.id ?? '').trim();
        if (id) map.diarios[id] = p.name || p.nombre || `Plato ${id}`;
      });
    });
  } catch {}
  try {
    const r = await api.get('/fixed');
    const fijos = Array.isArray(r.data) ? r.data : [];
    fijos.forEach(p => {
      const id = String(p.id ?? p._id ?? '').trim();
      if (id) map.diarios[id] = p.name || p.nombre || `Plato ${id}`;
    });
  } catch {}
  return map;
};

// Construye nameMap desde pedidos
const buildNameMapFromPedidos = (pedidos = []) => {
  const map = { diarios: {}, extras: {}, tartas: {} };
  const put = (bucket, idLike, nombre) => {
    if (!idLike || !nombre) return;
    const id = String(idLike).replace(/^ID:/i, '');
    map[bucket][id] = String(nombre);
    map[id] = String(nombre);
  };
  pedidos.forEach(p => {
    const pedido = p.pedido || {};
    Object.values(pedido.diarios || {}).forEach(platos => {
      Object.entries(platos || {}).forEach(([k, v]) => {
        if (typeof v === 'string') put('diarios', k, v);
      });
    });
    Object.values(pedido.extras || {}).forEach(platos => {
      Object.entries(platos || {}).forEach(([k, v]) => {
        if (typeof v === 'string') put('extras', k, v);
      });
    });
    Object.entries(pedido.tartas || {}).forEach(([k]) => {
      const id = String(k).replace(/^ID:/i, '');
      if (!map.tartas[id]) map.tartas[id] = `Tarta ${id}`;
    });
  });
  map.extras = { '1':'🍰 Postre','2':'🥗 Ensalada','3':'💪 Proteína', ...map.extras };
  return map;
};


const DashboardAdmin = () => {
  const user = useSelector((state) => state.auth.user);
  const esModerador = user?.rol === "moderador";
  // =================== Estados ===================
  const [pedidos, setPedidos] = useState([]);
  const [resumen, setResumen] = useState({});
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");

  const [semanaActiva, setSemanaActiva] = useState(null);
  const [semanaProxima, setSemanaProxima] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, userId: null });
  const [modalCrearUsuario, setModalCrearUsuario] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  
  const [semanasHabilitadas, setSemanasHabilitadas] = useState([]);
  const [semanasDisponibles, setSemanasDisponibles] = useState([]);
  const [semanasPasadas, setSemanasPasadas] = useState([]);
  
  // Semana ACTUAL (fechas editables)
  const [fechaInicioSemanaActual, setFechaInicioSemanaActual] = useState("");
  const [fechaFinSemanaActual, setFechaFinSemanaActual] = useState("");
  const [fechaCierreSemanaActual, setFechaCierreSemanaActual] = useState("");
  const [diasActual, setDiasActual] = useState({
    lunes: true, martes: true, miercoles: true, jueves: true, viernes: true
  });

  // Semana PRÓXIMA (días editables)
  const [diasProxima, setDiasProxima] = useState({
    lunes: true, martes: true, miercoles: true, jueves: true, viernes: true
  });

  // Crear PRÓXIMA (libre: inicio/fin/cierre)
  const [nuevaFechaInicio, setNuevaFechaInicio] = useState("");
  const [nuevaFechaFin, setNuevaFechaFin] = useState("");
  const [nuevaFechaCierre, setNuevaFechaCierre] = useState("");

  // Confirm eliminar semana (muestra título y rango)
  const [confirmSemana, setConfirmSemana] = useState({ open: false, semana: null });

  const [nameMap, setNameMap] = useState({ diarios: {}, extras: {}, tartas: {} });

  const [paginaActual, setPaginaActual] = useState(1);
const usuariosPorPagina = 10;

const [ordenAscendente, setOrdenAscendente] = useState(true);
const [mostrarHistorialSemanas, setMostrarHistorialSemanas] = useState(false);
const [todasLasSemanas, setTodasLasSemanas] = useState([]);




  // =================== API Semanas ===================
  const fetchSemanasDisponibles = async () => {
    try {
      const res = await api.get("/semana/disponibles");
      setSemanasDisponibles(res.data.semanas || []);
    } catch (err) {
      console.error("❌ Error al obtener semanas disponibles:", err);
    }
  };

  const fetchTodasLasSemanas = async () => {
  try {
    const res = await api.get("/semana/todas"); // endpoint correcto
    setTodasLasSemanas(res.data.semanas || []);
  } catch (error) {
    console.error("❌ Error al obtener todas las semanas:", error);
  }
};


const fetchSemanasHabilitadas = async () => {
  try {
    const res = await api.get("/semana/activas");
    const todas = res.data.semanas || [];

    const hoy = new Date();

    // 👉 filtro por fecha_fin
    const activas = todas.filter(s => new Date(s.semana_fin) >= hoy);
    const pasadas = todas.filter(s => new Date(s.semana_fin) < hoy);

    setSemanasHabilitadas(activas);
    setSemanasPasadas(pasadas); // ✅ SEMANAS PASADAS
  } catch (err) {
    console.error("❌ Error al obtener semanas habilitadas:", err);
  }
};


  

  const fetchSemanaActiva = async () => {
    try {
      const res = await api.get("/semana/actual");
      setSemanaActiva(
        res.data?.id
          ? {
              id: res.data.id,
              fecha_inicio: fmtUI(res.data.semana_inicio),
              fecha_fin: fmtUI(res.data.semana_fin),
              cierre: fmtUI(res.data.cierre),
              habilitado: res.data.habilitado,
              dias_habilitados: res.data.dias_habilitados
            }
          : null
      );

      setFechaInicioSemanaActual(fmtInput(res.data.semana_inicio));
      setFechaFinSemanaActual(fmtInput(res.data.semana_fin));
      setFechaCierreSemanaActual(fmtInput(res.data.cierre));

      setDiasActual(
        res.data.dias_habilitados || {
          lunes: true, martes: true, miercoles: true, jueves: true, viernes: true
        }
      );
    } catch (err) {
      console.error("❌ Error al obtener semana actual:", err);
    }
  };

  const fetchSemanaProxima = async () => {
    try {
      const res = await api.get("/semana/proxima");
      const s = res.data?.semana;
      setSemanaProxima(
        s
          ? {
              id: s.id,
              fecha_inicio: fmtUI(s.semana_inicio),
              fecha_fin: fmtUI(s.semana_fin),
              cierre: fmtUI(s.cierre),
              habilitado: s.habilitado,
              dias_habilitados: s.dias_habilitados
            }
          : null
      );

      setDiasProxima(
        s?.dias_habilitados || {
          lunes: true, martes: true, miercoles: true, jueves: true, viernes: true
        }
      );
    } catch (err) {
      console.error("❌ Error al obtener semana próxima:", err);
    }
  };

  const guardarDiasSemana = async (semanaId, dias) => {
    try {
      await api.put("/semana/dias", { id: semanaId, dias_habilitados: dias });
      await fetchSemanasHabilitadas();
      setSnackbar({ open: true, message: "✅ Días actualizados", severity: "success" });
    } catch (err) {
      console.error("❌ Error al guardar días:", err.response?.data || err);
      setSnackbar({ open: true, message: "❌ Error al guardar días", severity: "error" });
    }
  };

  const toggleEstadoSemana = async (semanaId, nuevoEstado) => {
    try {
      await api.put("/semana/habilitar", { id: semanaId, habilitado: nuevoEstado });
      await fetchSemanasHabilitadas();
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

  const eliminarSemanaAPI = async (semanaId) => {
    try {
      await api.delete(`/semana/${semanaId}`);
      setSnackbar({ open: true, message: "✅ Semana eliminada correctamente", severity: "success" });
      await fetchSemanasHabilitadas();
    } catch (err) {
      console.error("❌ Error al eliminar semana:", err.response?.data || err);
      setSnackbar({
        open: true,
        message: `❌ ${err.response?.data?.error || "No se pudo eliminar"}`,
        severity: "error"
      });
    }
  };

// REEMPLAZAR guardarSemana si lo seguís usando:
const guardarSemana = async (_semanaId, { inicio, fin, cierre }) => {
  try {
    await api.put('/semana/actualizar', {   // 👈 ruta que no fuerza
      fecha_inicio: inicio,   // 👈 date-only
      fecha_fin:    fin,      // 👈 date-only
      cierre:       cierre    // 👈 date-only
    });
    await fetchSemanasHabilitadas();
    setSnackbar({ open: true, message: "✅ Semana actualizada", severity: "success" });
  } catch (err) {
    console.error("❌ Error al guardar semana:", err);
    setSnackbar({ open: true, message: "❌ Error al guardar semana", severity: "error" });
  }
};


  // 👉 Crear semana LIBRE (usa tu controlador crearSemanaPuraController)
// REEMPLAZAR crearNuevaSemana:
const crearNuevaSemana = async () => {
  if (!nuevaFechaInicio || !nuevaFechaFin || !nuevaFechaCierre) {
    alert('⛔ Inicio, fin y cierre son obligatorios');
    return;
  }
  if (new Date(nuevaFechaInicio) > new Date(nuevaFechaFin)) {
    alert('⛔ El inicio no puede ser posterior al fin');
    return;
  }
  if (new Date(nuevaFechaCierre) < new Date(nuevaFechaInicio) ||
      new Date(nuevaFechaCierre) > new Date(nuevaFechaFin)) {
    alert('⛔ El cierre debe estar entre inicio y fin (inclusive)');
    return;
  }

  try {
    await api.post('/semana/pura', {
      fecha_inicio: nuevaFechaInicio,   // 👈 date-only
      fecha_fin: nuevaFechaFin,         // 👈 date-only
      cierre: nuevaFechaCierre          // 👈 date-only
    });
    await fetchSemanaProxima();
    await fetchSemanaActiva();
    await fetchSemanasHabilitadas();
    await fetchSemanasDisponibles();

    setNuevaFechaInicio('');
    setNuevaFechaFin('');
    setNuevaFechaCierre('');
    setSnackbar({ open: true, message: '✅ Semana creada correctamente', severity: 'success' });
  } catch (err) {
    console.error('❌ Error al crear semana:', err.response?.data || err);
    setSnackbar({ open: true, message: '❌ Error al crear semana', severity: 'error' });
  }
};


  // =================== Acciones UI por bloque ===================
  const guardarDiasActual = async () => {
    if (!semanaActiva?.id) return;
    await guardarDiasSemana(semanaActiva.id, diasActual);
    await fetchSemanaActiva();
  };

  const guardarDiasProxima = async () => {
    if (!semanaProxima?.id) return;
    await guardarDiasSemana(semanaProxima.id, diasProxima);
    await fetchSemanaProxima();
  };

  const toggleActual = async () => {
    if (!semanaActiva?.id) return;
    await toggleEstadoSemana(semanaActiva.id, !semanaActiva.habilitado);
    await fetchSemanaActiva();
  };

  const toggleProxima = async () => {
    if (!semanaProxima?.id) return;
    await toggleEstadoSemana(semanaProxima.id, !semanaProxima.habilitado);
    await fetchSemanaProxima();
  };

  const pedirEliminarSemana = (semana) => setConfirmSemana({ open: true, semana });
  const confirmarEliminar = async () => {
    const id = confirmSemana.semana?.id;
    if (!id) return;
    await eliminarSemanaAPI(id);
    setConfirmSemana({ open: false, semana: null });
    await fetchSemanaActiva();
    await fetchSemanaProxima();
    await fetchSemanasHabilitadas();
    await fetchSemanasDisponibles();
  };

  // REEMPLAZAR actualizarFechasSemana:
const actualizarFechasSemana = async () => {
  if (esModerador) return;

  if (!fechaInicioSemanaActual || !fechaFinSemanaActual || !fechaCierreSemanaActual) {
    alert('⛔ Inicio, fin y cierre son obligatorios');
    return;
  }
  if (new Date(fechaInicioSemanaActual) > new Date(fechaFinSemanaActual)) {
    alert('⛔ La fecha de inicio no puede ser posterior a la fecha de fin');
    return;
  }
  if (new Date(fechaCierreSemanaActual) < new Date(fechaInicioSemanaActual) ||
      new Date(fechaCierreSemanaActual) > new Date(fechaFinSemanaActual)) {
    alert('⛔ El cierre debe estar entre inicio y fin (inclusive)');
    return;
  }

  try {
    await api.put('/semana/actualizar', {   // 👈 usa el controller que NO fuerza
      fecha_inicio: fechaInicioSemanaActual, // 👈 date-only
      fecha_fin:    fechaFinSemanaActual,    // 👈 date-only
      cierre:       fechaCierreSemanaActual  // 👈 date-only
    });

    await fetchSemanaActiva();
    setSnackbar({ open: true, message: '✅ Semana actualizada', severity: 'success' });
  } catch (err) {
    console.error('❌ Error al actualizar fechas de semana:', err.response?.data || err);
    setSnackbar({ open: true, message: '❌ Error al actualizar semana', severity: 'error' });
  }
};

  // =================== Otras APIs (pedidos/usuarios) ===================
  const fetchPedidos = async () => {
  try {
    const res = await api.get("/orders/all");
    const pedidosOrdenados = res.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    // construir nameMap (menú + pedidos)
    const [menuMap, pedidosMap] = await Promise.all([
      buildNameMapFromMenu(),
      Promise.resolve(buildNameMapFromPedidos(pedidosOrdenados)),
    ]);
    const merged = {
      diarios: { ...pedidosMap.diarios, ...menuMap.diarios },
      extras:  { ...pedidosMap.extras,  ...menuMap.extras  },
      tartas:  { ...pedidosMap.tartas,  ...menuMap.tartas  },
    };
    setNameMap(merged);

    setPedidos(pedidosOrdenados);
    calcularResumen(pedidosOrdenados, merged); // 👈 pasar nameMap
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

  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "", apellido: "", email: "", password: "", rol: "usuario",
    telefono: "", direccion_principal: "", direccion_alternativa: ""
  });

 const abrirModalEdicion = (usuario) => {
  if (esModerador) return;
  setUsuarioEditando(usuario);
  setModalEditar(true);
};


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
        await api.put(`/admin/users/${usuarioEditando.id}/role`, { rol: usuarioEditando.rol });
      }
      setSnackbar({ open: true, message: "✅ Usuario actualizado", severity: "success" });
      setModalEditar(false);
      fetchUsuarios();
    } catch (err) {
      console.error("❌ Error al editar usuario:", err.response?.data || err);
      setSnackbar({ open: true, message: "❌ Error al editar usuario", severity: "error" });
    }
  };

  const handleCrearUsuario = async () => {
    try {
      const payload = {
        name: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        email: nuevoUsuario.email,
        password: nuevoUsuario.password,
        role: nuevoUsuario.rol,
        telefono: nuevoUsuario.telefono,
        direccion_principal: nuevoUsuario.direccion_principal,
        direccion_alternativa: nuevoUsuario.direccion_alternativa
      };
      await api.post("/admin/users", payload);
      setSnackbar({ open: true, message: "✅ Usuario creado", severity: "success" });
      fetchUsuarios();
      setModalCrearUsuario(false);
      setNuevoUsuario({
        nombre: "", apellido: "", email: "", password: "", rol: "usuario",
        telefono: "", direccion_principal: "", direccion_alternativa: ""
      });
    } catch (err) {
      console.error("❌ Error al crear usuario:", err);
      setSnackbar({ open: true, message: "❌ Error al crear usuario", severity: "error" });
    }
  };

  const confirmarEliminarUsuario = (userId) => setConfirmDelete({ open: true, userId });
  const eliminarUsuario = async () => {
    try {
      await api.delete(`/admin/users/${confirmDelete.userId}`);
      setSnackbar({ open: true, message: "✅ Usuario eliminado correctamente", severity: "success" });
      fetchUsuarios();
    } catch (err) {
      const detail = err.response?.data?.detail || "Error al eliminar usuario";
      setSnackbar({ open: true, message: `❌ ${detail}`, severity: "error" });
    } finally {
      setConfirmDelete({ open: false, userId: null });
    }
  };

  const abrirModalUsuario = (usuario) => { setUsuarioSeleccionado(usuario); setModalAbierto(true); };
  const cerrarModalUsuario = () => { setUsuarioSeleccionado(null); setModalAbierto(false); };

  const exportarUsuariosExcel = () => {
    const data = usuariosFiltrados.map((u) => ({
      ID: u.id,
      Nombre: u.nombre || "—",
      Apellido: u.apellido || "—",
      Email: u.email,
      Rol: u.rol,
      Teléfono: u.telefono || "—",
      Dirección_Principal: u.direccion_principal || "—",
      Dirección_Secundaria: u.direccion_secundaria || u.direccion_alternativa || "—"
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
    const texto = `${u.nombre || ""} ${u.apellido || ""} ${u.email || ""}`.toLowerCase();
    return coincideRol && texto.includes(busqueda.toLowerCase());
  });

  const usuariosOrdenados = [...usuariosFiltrados].sort((a, b) => {
  const nombreA = `${a.nombre || ""} ${a.apellido || ""}`.toLowerCase();
  const nombreB = `${b.nombre || ""} ${b.apellido || ""}`.toLowerCase();
  return ordenAscendente
    ? nombreA.localeCompare(nombreB)
    : nombreB.localeCompare(nombreA);
});

const indiceInicio = (paginaActual - 1) * usuariosPorPagina;
const indiceFin = indiceInicio + usuariosPorPagina;
const usuariosPaginados = usuariosOrdenados.slice(indiceInicio, indiceFin);
const totalPaginas = Math.ceil(usuariosOrdenados.length / usuariosPorPagina);


  // =================== Resúmenes ===================
  const extraMap = {
    "1": "🍰 Postre", "2": "🥗 Ensalada", "3": "💪 Proteína",
    "ID:1": "🍰 Postre", "ID:2": "🥗 Ensalada", "ID:3": "💪 Proteína"
  };

 const calcularResumen = (pedidosArr, nameMapLocal = nameMap) => {
  const diasSemana = ["lunes", "martes", "miércoles", "jueves", "viernes"];
  const resumenTemp = {
    totalPedidos: pedidosArr.length,
    totalUsuarios: new Set(pedidosArr.map((p) => p.usuario?.email)).size,
    totalPlatos: 0,
    cancelados: pedidosArr.filter((p) => p.estado === "cancelado").length,
    realizados: pedidosArr.filter((p) => p.estado === "realizado").length,
    pedidosPorDia: {},
    platosVendidos: {},
    platosVendidosPorDia: {}
  };

  diasSemana.forEach((dia) => {
    resumenTemp.pedidosPorDia[dia] = 0;
    resumenTemp.platosVendidosPorDia[dia] = {};
  });

  pedidosArr.forEach((pedido) => {
    const datosPedido = pedido.pedido || {};

    // Diarios + Extras con nombre resuelto
    ["diarios", "extras"].forEach((tipo) => {
      const diasTipo = datosPedido[tipo] || {};
      Object.entries(diasTipo).forEach(([dia, platos]) => {
        // normalizar el día (por si viene con "Miércoles" / "miercoles")
        const diaNorm = dia.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const target = diaNorm === 'miercoles' ? 'miércoles' : diaNorm; // reponer tilde
        if (!diasSemana.includes(target)) return;

        resumenTemp.pedidosPorDia[target]++;
        Object.entries(platos || {}).forEach(([plKey, cantidad]) => {
          const cant = Number(cantidad) || 0;
          if (cant <= 0) return;

          const nombreReal = resolveNombrePlato(plKey, tipo, nameMapLocal);
          resumenTemp.platosVendidos[nombreReal] = (resumenTemp.platosVendidos[nombreReal] || 0) + cant;
          resumenTemp.platosVendidosPorDia[target][nombreReal] =
            (resumenTemp.platosVendidosPorDia[target][nombreReal] || 0) + cant;
          resumenTemp.totalPlatos += cant;
        });
      });
    });

    // Tartas (también resueltas)
    if (datosPedido.tartas && Object.keys(datosPedido.tartas).length > 0) {
      const fecha = dayjs(pedido.fecha || pedido.fecha_entrega || pedido.created_at);
      const diaPedido = fecha.format('dddd').toLowerCase(); // ej: lunes, martes
      // resolver miércoles con tilde
      const diaOk = diaPedido === 'miercoles' ? 'miércoles' : diaPedido;
      if (diasSemana.includes(diaOk)) {
        resumenTemp.pedidosPorDia[diaOk]++;
        Object.entries(datosPedido.tartas).forEach(([plKey, cantidad]) => {
          const cant = Number(cantidad) || 0;
          if (cant <= 0) return;
          const nombreReal = resolveNombrePlato(plKey, 'tartas', nameMapLocal);
          resumenTemp.platosVendidos[nombreReal] = (resumenTemp.platosVendidos[nombreReal] || 0) + cant;
          resumenTemp.platosVendidosPorDia[diaOk][nombreReal] =
            (resumenTemp.platosVendidosPorDia[diaOk][nombreReal] || 0) + cant;
          resumenTemp.totalPlatos += cant;
        });
      }
    }
  });

  setResumen(resumenTemp);
};


  const datosGraficoTorta = {
    labels: Object.keys(resumen.platosVendidos || {}),
    datasets: [
      {
        label: "Platos vendidos",
        data: Object.values(resumen.platosVendidos || {}),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#8D6E63"],
        borderWidth: 1
      }
    ]
  };

  const datosGraficoBarras = {
    labels: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
    datasets: [
      {
        label: "Pedidos por día",
        data: ["lunes", "martes", "miércoles", "jueves", "viernes"].map((d) => resumen.pedidosPorDia?.[d] || 0),
        backgroundColor: "#42A5F5"
      }
    ]
  };

  // =================== useEffects ===================
  useEffect(() => {
    fetchSemanaActiva();
    fetchSemanaProxima();
    fetchSemanasHabilitadas();
    fetchSemanasDisponibles();
    fetchPedidos();
    fetchUsuarios();
  }, []);

  // =================== Render ===================
  return (
    <Container sx={{ mt: 4, pb: 6 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => (window.location.href = "/admin")}
        sx={{ mb: 3 }}
      >
        Volver
      </Button>

      <Typography variant="h4" gutterBottom textAlign="center">
        📊 Dashboard Admin
      </Typography>

      {/* =================== Gestión de Semanas =================== */}
      <Card sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          📅 Gestión de Semanas
        </Typography>


        {/* ======= SEMANA ACTUAL ======= */}
        <Box sx={{ mt: 2, p: 2, borderRadius: 2, border: "2px solid #4caf50", bgcolor: "#e8f5e9" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Typography variant="h6">✅ Semana ACTUAL</Typography>
              {semanaActiva && (
                <Chip
                  size="small"
                  label={semanaActiva.habilitado ? "Habilitada" : "Bloqueada"}
                  color={semanaActiva.habilitado ? "success" : "error"}
                  variant="filled"
                />
              )}
            </Stack>

            {semanaActiva ? (
              <Stack direction="row" alignItems="center" gap={2} sx={{ color: "text.secondary" }}>
                <Typography>
                  📆 {semanaActiva.fecha_inicio} → {semanaActiva.fecha_fin}
                </Typography>
                <Typography>🕒 Cierre: {semanaActiva.cierre}</Typography>
              </Stack>
            ) : (
              <Typography color="text.secondary">— No hay semana que contenga hoy —</Typography>
            )}
          </Stack>

          {semanaActiva && (
            <>
              {/* Fechas ACTUAL */}
              <Stack direction="row" gap={2} flexWrap="wrap" sx={{ mt: 2 }}>
               <TextField
  label={`📅 Inicio (${dayLabel(fechaInicioSemanaActual)})`}
  type="date"
  value={fechaInicioSemanaActual}
  onChange={(e) => setFechaInicioSemanaActual(e.target.value)}
  disabled={esModerador}
  InputLabelProps={{ shrink: true }}
  size="small"
/>

                <TextField
                  label={`📅 Fin (${dayLabel(fechaFinSemanaActual)})`}
                  type="date"
                  value={fechaFinSemanaActual}
                  onChange={(e) => setFechaFinSemanaActual(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <TextField
                  label={`🕒 Cierre (${dayLabel(fechaCierreSemanaActual)})`}
                  type="date"
                  value={fechaCierreSemanaActual}
                  onChange={(e) => setFechaCierreSemanaActual(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <Tooltip title="Guardar fechas de la semana actual">
                  <span>
                   <Button
  variant="contained"
  startIcon={<SaveIcon />}
  onClick={actualizarFechasSemana}
  disabled={esModerador || !fechaInicioSemanaActual || !fechaFinSemanaActual || !fechaCierreSemanaActual}
>
  Guardar fechas
</Button>

                  </span>
                </Tooltip>
              </Stack>

              {/* Días ACTUAL */}
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                🗓️ Días (ACTUAL)
              </Typography>
              <Grid container spacing={1}>
                {["lunes", "martes", "miercoles", "jueves", "viernes"].map((d) => (
                  <Grid item xs={6} sm={2.4} key={`act-${d}`}>
                    <Button
                      fullWidth
                      variant={diasActual[d] ? "contained" : "outlined"}
                onClick={() => {
  if (esModerador) return;
  setDiasActual((prev) => ({ ...prev, [d]: !prev[d] }));
}}

                    >
                      {d.charAt(0).toUpperCase() + d.slice(1)} {diasActual[d] ? "✅" : "❌"}
                    </Button>
                  </Grid>
                ))}
              </Grid>

              <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 2 }}>
              <Button
  variant="contained"
  color="secondary"
  onClick={guardarDiasActual}
  startIcon={<SaveIcon />}
  disabled={esModerador}
>
  Guardar días
</Button>

                <Button
                  variant="outlined"
                  color={semanaActiva.habilitado ? "error" : "success"}
                  onClick={toggleActual}
                  startIcon={semanaActiva.habilitado ? <LockIcon /> : <LockOpenIcon />}
                >
                  {semanaActiva.habilitado ? "Bloquear pedidos" : "Habilitar pedidos"}
                </Button>
                <Button
                  variant="text"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={() =>
                    pedirEliminarSemana({
                      id: semanaActiva.id,
                      titulo: "Semana ACTUAL",
                      rango: `${semanaActiva.fecha_inicio} → ${semanaActiva.fecha_fin}`
                    })
                  }
                >
                  Eliminar ACTUAL
                </Button>
              </Stack>
            </>
          )}
        </Box>

        {/* ======= PRÓXIMA SEMANA ======= */}
        <Box sx={{ mt: 3, p: 2, borderRadius: 2, border: "2px solid #9c27b0", bgcolor: "#f3e5f5" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Typography variant="h6">🔮 Próxima SEMANA</Typography>
              {semanaProxima && (
                <Chip
                  size="small"
                  label={semanaProxima.habilitado ? "Habilitada" : "Bloqueada"}
                  color={semanaProxima.habilitado ? "success" : "error"}
                  variant="filled"
                />
              )}
            </Stack>

            {semanaProxima ? (
              <Stack direction="row" alignItems="center" gap={2} sx={{ color: "text.secondary" }}>
                <Typography>
                  📆 {semanaProxima.fecha_inicio} → {semanaProxima.fecha_fin}
                </Typography>
                <Typography>🕒 Cierre: {semanaProxima.cierre}</Typography>
              </Stack>
            ) : (
              <Typography color="text.secondary">— Aún no definiste la próxima —</Typography>
            )}
          </Stack>

          {semanaProxima && (
            <>
              {/* Días PRÓXIMA */}
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                🗓️ Días (PRÓXIMA)
              </Typography>
              <Grid container spacing={1}>
                {["lunes", "martes", "miercoles", "jueves", "viernes"].map((d) => (
                  <Grid item xs={6} sm={2.4} key={`prox-${d}`}>
                    <Button
                      fullWidth
                      variant={diasProxima[d] ? "contained" : "outlined"}
                      color={diasProxima[d] ? "success" : "error"}
                      onClick={() => setDiasProxima((prev) => ({ ...prev, [d]: !prev[d] }))}
                    >
                      {d.charAt(0).toUpperCase() + d.slice(1)} {diasProxima[d] ? "✅" : "❌"}
                    </Button>
                  </Grid>
                ))}
              </Grid>

              <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 2 }}>
                <Button variant="contained" color="secondary" onClick={guardarDiasProxima} startIcon={<SaveIcon />}>
                  Guardar días
                </Button>
                <Button
                  variant="outlined"
                  color={semanaProxima.habilitado ? "error" : "success"}
                  onClick={toggleProxima}
                  startIcon={semanaProxima.habilitado ? <LockIcon /> : <LockOpenIcon />}
                >
                  {semanaProxima.habilitado ? "Bloquear pedidos" : "Habilitar pedidos"}
                </Button>
                <Button
                  variant="text"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={() =>
                    pedirEliminarSemana({
                      id: semanaProxima.id,
                      titulo: "Próxima SEMANA",
                      rango: `${semanaProxima.fecha_inicio} → ${semanaProxima.fecha_fin}`
                    })
                  }
                >
                  Eliminar PRÓXIMA
                </Button>
              </Stack>
            </>
          )}
        </Box>

        {/* ======= CREAR NUEVA (PRÓXIMA) LIBRE ======= */}
        <Box sx={{ mt: 3, p: 2, borderRadius: 2, border: "2px dashed #1976d2", bgcolor: "#e3f2fd" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Typography variant="h6">➕ Crear semana (libre)</Typography>
            <Stack direction="row" gap={1} alignItems="center" sx={{ color: "text.secondary" }}>
              {nuevaFechaInicio && (
                <Chip label={`Inicio: ${nuevaFechaInicio} (${dayLabel(nuevaFechaInicio)})`} size="small" />
              )}
              {nuevaFechaFin && (
                <Chip label={`Fin: ${nuevaFechaFin} (${dayLabel(nuevaFechaFin)})`} size="small" />
              )}
              {nuevaFechaCierre && (
                <Chip label={`Cierre: ${nuevaFechaCierre} (${dayLabel(nuevaFechaCierre)})`} size="small" />
              )}
            </Stack>
          </Stack>

          <Stack direction="row" gap={2} flexWrap="wrap" sx={{ mt: 2 }}>
            <TextField
              label={`📅 Inicio (${dayLabel(nuevaFechaInicio)})`}
              type="date"
              value={nuevaFechaInicio}
              onChange={(e) => setNuevaFechaInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              label={`📅 Fin (${dayLabel(nuevaFechaFin)})`}
              type="date"
              value={nuevaFechaFin}
              onChange={(e) => setNuevaFechaFin(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              label={`🕒 Cierre (${dayLabel(nuevaFechaCierre)})`}
              type="date"
              value={nuevaFechaCierre}
              onChange={(e) => setNuevaFechaCierre(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <Tooltip title="Crear semana con las fechas indicadas">
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddCircleIcon />}
                  onClick={crearNuevaSemana}
                  disabled={!nuevaFechaInicio || !nuevaFechaFin || !nuevaFechaCierre}
                >
                  Crear
                </Button>
              </span>
            </Tooltip>
          </Stack>
          <Typography variant="caption" sx={{ mt: 1, display: "block", color: "text.secondary" }}>
            Podés empezar martes y cerrar jueves (feriados, excepciones). El cierre debe estar entre inicio y fin.
          </Typography>
        </Box>
      </Card>

      {/* =================== Semanas informativas =================== */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        📦 Semanas disponibles para tomar pedidos
      </Typography>
      {semanasDisponibles.length > 0 ? (
        semanasDisponibles.map((semana) => (
          <Box
            key={semana.id}
            sx={{ my: 2, p: 2, border: "2px dashed #1976d2", borderRadius: 2, backgroundColor: "#f0f8ff" }}
          >
            <Typography>
              📅 <strong>Semana:</strong> {fmtUI(semana.semana_inicio)} → {fmtUI(semana.semana_fin)}
            </Typography>
            <Typography>🕔 <strong>Cierre:</strong> {fmtUI(semana.cierre)}</Typography>
            <Typography>🔓 <strong>Estado:</strong> {semana.habilitado ? "✅ Habilitada" : "❌ Bloqueada"}</Typography>
          </Box>
        ))
      ) : (
        <Typography sx={{ mt: 2 }}>📭 No hay semanas disponibles aún</Typography>
      )}

      {/* Otras semanas habilitadas (gestión rápida por tarjeta) */}
      {semanasHabilitadas.length > 0 ? (
        semanasHabilitadas.map((semana) => (
          <SemanaManage
            key={semana.id}
            semana={semana}
            onGuardar={guardarSemana}
            onGuardarDias={guardarDiasSemana}
            onToggle={toggleEstadoSemana}
            onEliminar={eliminarSemanaAPI}
          />
        ))
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          📭 No hay otras semanas habilitadas actualmente.
        </Typography>
      )}

      {mostrarHistorialSemanas && (
  <SemanasHistorial semanas={todasLasSemanas} />

)}


  <Button
  variant="outlined"
  onClick={() => {
    if (!mostrarHistorialSemanas) {
      fetchTodasLasSemanas(); // Solo si se va a mostrar
    }
    setMostrarHistorialSemanas(prev => !prev);
  }}
  sx={{ mt: 4, mb: 2 }}
>
  {mostrarHistorialSemanas ? "🔽 Ocultar historial de semanas" : "📁 Semanas de producción creadas"}
</Button>




      {/* =================== KPIs & Charts =================== */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>📝 Total Pedidos</Typography>
              <Typography variant="h4">{resumen.totalPedidos || 0}</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>👥 Usuarios únicos</Typography>
              <Typography variant="h5">{resumen.totalUsuarios || 0}</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>❌ Cancelados</Typography>
              <Typography variant="h5" color="error">{resumen.cancelados || 0}</Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>✅ Realizados: {resumen.realizados || 0}</Typography>
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

      {/* =================== Gestión de Usuarios =================== */}
      <Typography variant="h5" sx={{ mt: 6, mb: 2 }}>
        👤 Gestión de Usuarios
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Button
  variant="outlined"
  onClick={() => {
    setOrdenAscendente(!ordenAscendente);
    setPaginaActual(1); // reset
  }}
>
  {ordenAscendente ? "🔼 Orden A-Z" : "🔽 Orden Z-A"}
</Button>

        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ padding: 8, width: "100%", maxWidth: 300, borderRadius: 4, border: "1px solid #ccc" }}
        />
      <Button
  variant="contained"
  color="success"
  onClick={() => !esModerador && setModalCrearUsuario(true)}
  disabled={esModerador}
>
  ➕ Crear Usuario
</Button>


        <Select size="small" value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)} sx={{ minWidth: 160 }}>
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
        usuariosPaginados.map((usuario) => (

            <UserCard
              key={usuario.id}
              usuario={usuario}
              onVer={abrirModalUsuario}
              onEliminar={confirmarEliminarUsuario}
              onRolChange={async (userId, nuevoRol) => {
                try {
                  await api.put(`/admin/users/${userId}/role`, { rol: nuevoRol });
                  setUsuarios((prev) => prev.map((u) => (u.id === userId ? { ...u, rol: nuevoRol } : u)));
                } catch (err) {
                  console.error("❌ Error al cambiar rol:", err);
                }
              }}
              onEditar={abrirModalEdicion}
            />
          ))
        )}
      </Card>
      {totalPaginas > 1 && (
  <Stack
    direction="row"
    spacing={2}
    justifyContent="center"
    alignItems="center"
    sx={{ mb: 4 }}
  >
    <Button
      variant="contained"
      disabled={paginaActual === 1}
      onClick={() => setPaginaActual((p) => p - 1)}
    >
      ← Anterior
    </Button>
    <Typography variant="body1">
      Página {paginaActual} de {totalPaginas}
    </Typography>
    <Button
      variant="contained"
      disabled={paginaActual === totalPaginas}
      onClick={() => setPaginaActual((p) => p + 1)}
    >
      Siguiente →
    </Button>
  </Stack>
)}


      {/* =================== Dialogs & Alerts =================== */}
      {/* Detalle Usuario */}
      <Dialog open={modalAbierto} onClose={cerrarModalUsuario}>
        <DialogTitle>👤 Información del Usuario</DialogTitle>
        <DialogContent dividers>
          {usuarioSeleccionado ? (
            <>
              <Typography><strong>ID:</strong> {usuarioSeleccionado.id}</Typography>
              <Typography><strong>Nombre:</strong> {usuarioSeleccionado.nombre || "—"}</Typography>
              <Typography><strong>Apellido:</strong> {usuarioSeleccionado.apellido || "—"}</Typography>
              <Typography><strong>Email:</strong> {usuarioSeleccionado.email}</Typography>
              <Typography><strong>Rol:</strong> {usuarioSeleccionado.rol}</Typography>
              <Typography><strong>Teléfono:</strong> {usuarioSeleccionado.telefono || "—"}</Typography>
              <Typography><strong>Dirección principal:</strong> {usuarioSeleccionado.direccion_principal || "—"}</Typography>
              <Typography><strong>Dirección secundaria:</strong> {usuarioSeleccionado.direccion_secundaria || "—"}</Typography>
            </>
          ) : (
            <Typography>Cargando...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModalUsuario} color="primary">Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm eliminar usuario */}
      <Dialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, userId: null })}>
        <DialogTitle>¿Eliminar usuario?</DialogTitle>
        <DialogContent>Esta acción no se puede deshacer. ¿Deseás continuar?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete({ open: false, userId: null })}>Cancelar</Button>
          <Button onClick={eliminarUsuario} color="error" variant="contained">Eliminar</Button>
        </DialogActions>
      </Dialog>

      {/* Crear usuario */}
      <Dialog open={modalCrearUsuario} onClose={() => setModalCrearUsuario(false)}>
        <DialogTitle>➕ Crear nuevo usuario</DialogTitle>
        <DialogContent dividers>
          <TextField label="Nombre" fullWidth sx={{ mb: 2 }}
            value={nuevoUsuario.nombre}
            onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
          />
          <TextField label="Apellido" fullWidth sx={{ mb: 2 }}
            value={nuevoUsuario.apellido}
            onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, apellido: e.target.value })}
          />
          <TextField label="Email" fullWidth sx={{ mb: 2 }}
            value={nuevoUsuario.email}
            onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
          />
          <TextField label="Contraseña" type="password" fullWidth sx={{ mb: 2 }}
            value={nuevoUsuario.password}
            onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
          />
          <TextField label="Teléfono" fullWidth sx={{ mb: 2 }}
            value={nuevoUsuario.telefono}
            onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, telefono: e.target.value })}
          />
          <TextField label="Dirección principal" fullWidth sx={{ mb: 2 }}
            value={nuevoUsuario.direccion_principal}
            onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, direccion_principal: e.target.value })}
          />
          <TextField label="Dirección alternativa" fullWidth sx={{ mb: 2 }}
            value={nuevoUsuario.direccion_alternativa}
            onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, direccion_alternativa: e.target.value })}
          />
          <Select fullWidth value={nuevoUsuario.rol}
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

      {/* Editar usuario */}
      <Dialog open={modalEditar} onClose={() => setModalEditar(false)}>
        <DialogTitle>✏️ Editar Usuario</DialogTitle>
        <DialogContent dividers>
          {usuarioEditando ? (
            <>
              <TextField label="Nombre" fullWidth sx={{ mb: 2 }}
                value={usuarioEditando.nombre || ""}
                onChange={(e) => setUsuarioEditando((p) => ({ ...p, nombre: e.target.value }))}
              />
              <TextField label="Apellido" fullWidth sx={{ mb: 2 }}
                value={usuarioEditando.apellido || ""}
                onChange={(e) => setUsuarioEditando((p) => ({ ...p, apellido: e.target.value }))}
              />
              <TextField label="Email" fullWidth sx={{ mb: 2 }}
                value={usuarioEditando.email || ""}
                onChange={(e) => setUsuarioEditando((p) => ({ ...p, email: e.target.value }))}
              />
              <TextField label="Teléfono" fullWidth sx={{ mb: 2 }}
                value={usuarioEditando.telefono || ""}
                onChange={(e) => setUsuarioEditando((p) => ({ ...p, telefono: e.target.value }))}
              />
              <TextField label="Dirección principal" fullWidth sx={{ mb: 2 }}
                value={usuarioEditando.direccion_principal || ""}
                onChange={(e) => setUsuarioEditando((p) => ({ ...p, direccion_principal: e.target.value }))}
              />
              <TextField label="Dirección alternativa" fullWidth sx={{ mb: 2 }}
                value={usuarioEditando.direccion_alternativa || ""}
                onChange={(e) => setUsuarioEditando((p) => ({ ...p, direccion_alternativa: e.target.value }))}
              />
              <Select fullWidth value={usuarioEditando.rol}
                onChange={(e) => setUsuarioEditando((p) => ({ ...p, rol: e.target.value }))}
              >
                <MenuItem value="usuario">Usuario</MenuItem>
                <MenuItem value="empresa">Empresa</MenuItem>
                <MenuItem value="delivery">Delivery</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="empleado">Empleado</MenuItem>
                <MenuItem value="moderador">Moderador</MenuItem>
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

      {/* Confirm eliminar semana */}
      <Dialog open={confirmSemana.open} onClose={() => setConfirmSemana({ open: false, semana: null })}>
        <DialogTitle>¿Eliminar {confirmSemana.semana?.titulo || "semana"}?</DialogTitle>
        <DialogContent>
          {confirmSemana.semana?.rango
            ? `Se eliminará la semana: ${confirmSemana.semana.rango}. Esta acción no se puede deshacer.`
            : "Esta acción no se puede deshacer."}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmSemana({ open: false, semana: null })}>Cancelar</Button>
          <Button onClick={confirmarEliminar} color="error" variant="contained">Eliminar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar global */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DashboardAdmin;
