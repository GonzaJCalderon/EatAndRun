import { useEffect, useState } from "react";
import {
  Container, Typography, Card, Grid, Box, Button, TextField, Snackbar, Alert, Divider, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BlockIcon from '@mui/icons-material/Block';
import api from "../api/api";
import SemanaManage from "../components/SemanaManage";

const AdminSemanas = () => {
  const [semanaActiva, setSemanaActiva] = useState(null);
  const [semanasHabilitadas, setSemanasHabilitadas] = useState([]);
  const [semanasDisponibles, setSemanasDisponibles] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [modalCrear, setModalCrear] = useState(false);
  const [nuevaSemana, setNuevaSemana] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    cierre: ''
  });

  const fetchSemanasDisponibles = async () => {
    try {
      const res = await api.get("/semana/todas");
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

  const fetchSemanaActiva = async () => {
    try {
      const res = await api.get('/semana/actual');
      setSemanaActiva(res.data);
    } catch (err) {
      console.error('❌ Error al obtener semana activa:', err);
    }
  };

  const loadData = () => {
    fetchSemanaActiva();
    fetchSemanasHabilitadas();
    fetchSemanasDisponibles();
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCrearSemana = async () => {
    try {
      await api.post('/semana', { ...nuevaSemana, cierre: nuevaSemana.fecha_fin });
      setSnackbar({ open: true, message: '✅ Semana creada con éxito', severity: 'success' });
      setModalCrear(false);
      setNuevaSemana({ fecha_inicio: '', fecha_fin: '', cierre: '' });
      loadData();
    } catch (err) {
      console.error('❌ Error al crear semana:', err);
      const msg = err.response?.data?.error || '❌ Error al crear semana';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const guardarSemana = async (semanaId, { inicio, fin, cierre }) => {
    try {
      await api.put("/semana", { fecha_inicio: inicio, fecha_fin: fin, cierre });
      loadData();
      setSnackbar({ open: true, message: "✅ Semana actualizada", severity: "success" });
    } catch (err) {
      console.error("❌ Error al guardar semana:", err);
      const msg = err.response?.data?.error || '❌ Error al actualizar semana';
      setSnackbar({ open: true, message: msg, severity: "error" });
    }
  };

  const eliminarSemana = async (semanaId) => {
    try {
      await api.delete(`/semana/${semanaId}`);
      setSnackbar({ open: true, message: '✅ Semana eliminada', severity: 'success' });
      loadData();
    } catch (err) {
      console.error("❌ Error al eliminar semana:", err);
      setSnackbar({ open: true, message: `❌ Error: no se pudo eliminar`, severity: 'error' });
    }
  };

  const guardarDiasSemana = async (semanaId, dias) => {
    try {
      await api.put("/semana/dias", { id: semanaId, dias_habilitados: dias });
      loadData();
      setSnackbar({ open: true, message: "✅ Días actualizados", severity: "success" });
    } catch (err) {
      console.error("❌ Error al guardar días:", err);
      setSnackbar({ open: true, message: "❌ Error al actualizar días", severity: "error" });
    }
  };

  const toggleEstadoSemana = async (semanaId, nuevoEstado) => {
    try {
      await api.put("/semana/habilitar", { id: semanaId, habilitado: nuevoEstado });
      loadData();
      setSnackbar({ open: true, message: nuevoEstado ? "✅ Semana habilitada" : "❌ Semana bloqueada", severity: "success" });
    } catch (err) {
      console.error("❌ Error al cambiar estado:", err);
      setSnackbar({ open: true, message: "❌ Error al cambiar estado", severity: "error" });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => window.location.href = "/admin"}>
          Volver
        </Button>
        <Typography variant="h4" fontWeight="bold">
          📅 Definir semanas de pedidos
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddCircleOutlineIcon />} onClick={() => setModalCrear(true)}>
          Programar Semana
        </Button>
      </Box>

      {/* SEMANA ACTIVA (LA QUE VEN LOS CLIENTES HOY) */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, color: '#2e7d32' }}>
        🟢 Semana Activa (Visible para clientes)
      </Typography>
      {semanaActiva && semanaActiva.habilitado ? (
        <Box sx={{ mb: 5 }}>
          <SemanaManage
            key={`activa-${semanaActiva.id}`}
            semana={semanaActiva}
            onGuardar={guardarSemana}
            onGuardarDias={guardarDiasSemana}
            onToggle={toggleEstadoSemana}
            onEliminar={eliminarSemana}
            isActive={true}
          />
        </Box>
      ) : (
        <Card sx={{ p: 4, mb: 5, textAlign: 'center', backgroundColor: '#fff3e0', border: '1px solid #ffcc80' }}>
          <Typography variant="h6" color="warning.dark">⚠️ No hay ninguna semana activa en este momento</Typography>
          <Typography color="text.secondary">Los clientes no pueden hacer pedidos. Habilitá una semana de abajo o creá una nueva.</Typography>
        </Card>
      )}

      <Divider sx={{ my: 4 }} />

      {/* OTRAS SEMANAS PROGRAMADAS */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        🗓️ Semanas Programadas (Habilitadas pero no activas)
      </Typography>
      {semanasHabilitadas.filter(s => s.id !== semanaActiva?.id).length > 0 ? (
        semanasHabilitadas.filter(s => s.id !== semanaActiva?.id).map((semana) => (
          <SemanaManage
            key={semana.id}
            semana={semana}
            onGuardar={guardarSemana}
            onGuardarDias={guardarDiasSemana}
            onToggle={toggleEstadoSemana}
            onEliminar={eliminarSemana}
          />
        ))
      ) : (
        <Typography color="text.secondary" sx={{ mb: 4 }}>No hay semanas adicionales habilitadas.</Typography>
      )}

      {/* HISTORIAL / SEMANAS BLOQUEADAS */}
      <Typography variant="h6" fontWeight="bold" sx={{ mt: 5, mb: 2, color: 'text.secondary' }}>
        🗄️ Semanas Guardadas / Cerradas
      </Typography>
      <Grid container spacing={2}>
        {semanasDisponibles.filter(s => !s.habilitado).map(semana => (
          <Grid item xs={12} sm={6} md={4} key={semana.id}>
             <Card sx={{ p: 2, opacity: 0.8 }}>
                <Typography variant="h6">Semana del <strong>{semana.fecha_inicio?.split('T')[0]}</strong> al <strong>{semana.fecha_fin?.split('T')[0]}</strong></Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                   <Button size="small" variant="contained" color="success" onClick={() => toggleEstadoSemana(semana.id, true)}>Rehabilitar</Button>
                   <Button size="small" variant="outlined" color="error" onClick={() => eliminarSemana(semana.id)}>Eliminar</Button>
                </Box>
             </Card>
          </Grid>
        ))}
      </Grid>
      {semanasDisponibles.filter(s => !s.habilitado).length === 0 && (
         <Typography color="text.secondary">No hay semanas cerradas en el historial.</Typography>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog open={modalCrear} onClose={() => setModalCrear(false)}>
        <DialogTitle>Programar Nueva Semana</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2, minWidth: 300 }}>
            <TextField label="Fecha Inicio" type="date" value={nuevaSemana.fecha_inicio} onChange={e => setNuevaSemana({...nuevaSemana, fecha_inicio: e.target.value})} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField label="Fecha Fin" type="date" value={nuevaSemana.fecha_fin} onChange={e => setNuevaSemana({...nuevaSemana, fecha_fin: e.target.value})} InputLabelProps={{ shrink: true }} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalCrear(false)} color="inherit">Cancelar</Button>
          <Button onClick={handleCrearSemana} variant="contained" color="primary">Guardar Semana</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminSemanas;
