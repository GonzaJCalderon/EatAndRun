import React, { useEffect, useState } from "react";
import {
  Container, Typography, Card, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, TextField, Snackbar, Alert 
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from "../api/api";
import UserCard from "../components/UserCard";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalCrearUsuario, setModalCrearUsuario] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, userId: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'usuario'
  });

  const fetchUsuarios = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsuarios(res.data);
    } catch (err) {
      console.error("❌ Error al cargar usuarios:", err);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const abrirModalUsuario = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setModalAbierto(true);
  };

  const cerrarModalUsuario = () => {
    setUsuarioSeleccionado(null);
    setModalAbierto(false);
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

  const cambiarRol = async (userId, nuevoRol) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { rol: nuevoRol });
      setUsuarios(prev => prev.map(u => u.id === userId ? { ...u, rol: nuevoRol } : u));
      setSnackbar({ open: true, message: '✅ Rol actualizado', severity: 'success' });
    } catch (err) {
      console.error("❌ Error al cambiar rol:", err);
      setSnackbar({ open: true, message: '❌ Error al cambiar rol', severity: 'error' });
    }
  };

  const abrirModalEdicion = (usuario) => {
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
        await api.put(`/admin/users/${usuarioEditando.id}/role`, {
          rol: usuarioEditando.rol
        });
      }

      setSnackbar({ open: true, message: '✅ Usuario actualizado', severity: 'success' });
      setModalEditar(false);
      fetchUsuarios();
    } catch (err) {
      console.error('❌ Error al editar usuario:', err);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => window.location.href = "/admin"} sx={{ mr: 2 }}>
          Volver
        </Button>
        <Typography variant="h4" fontWeight="bold">
          👥 Gestión de Usuarios
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ padding: '10px 14px', flexGrow: 1, minWidth: 250, borderRadius: 8, border: '1px solid #ccc', fontSize: '1rem' }}
        />
        <Select
          size="small"
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          sx={{ minWidth: 160, backgroundColor: '#fff' }}
        >
          <MenuItem value="todos">Todos los roles</MenuItem>
          <MenuItem value="usuario">Usuario</MenuItem>
          <MenuItem value="empresa">Empresa</MenuItem>
          <MenuItem value="delivery">Delivery</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="empleado">Empleado</MenuItem> 
          <MenuItem value="moderador">Moderador</MenuItem>
        </Select>

        <Button variant="contained" color="success" onClick={() => setModalCrearUsuario(true)}>
          ➕ Crear Usuario
        </Button>
        <Button variant="outlined" onClick={exportarUsuariosExcel}>
          📤 Exportar
        </Button>
      </Box>

      <Card sx={{ p: 2, mb: 6, backgroundColor: '#fdfdfd' }}>
        {usuariosFiltrados.length === 0 ? (
          <Typography textAlign="center" color="text.secondary" sx={{ py: 3 }}>No hay usuarios que coincidan con la búsqueda.</Typography>
        ) : (
          usuariosFiltrados.map((usuario) => (
            <UserCard
              key={usuario.id}
              usuario={usuario}
              onVer={abrirModalUsuario}
              onEliminar={confirmarEliminarUsuario}
              onRolChange={cambiarRol}
              onEditar={abrirModalEdicion}
            />
          ))
        )}
      </Card>

      {/* Modales */}
      <Dialog open={modalAbierto} onClose={cerrarModalUsuario}>
        <DialogTitle>👤 Información del Usuario</DialogTitle>
        <DialogContent dividers>
          {usuarioSeleccionado ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography><strong>ID:</strong> {usuarioSeleccionado.id}</Typography>
              <Typography><strong>Nombre:</strong> {usuarioSeleccionado.nombre || '—'}</Typography>
              <Typography><strong>Apellido:</strong> {usuarioSeleccionado.apellido || '—'}</Typography>
              <Typography><strong>Email:</strong> {usuarioSeleccionado.email}</Typography>
              <Typography><strong>Rol:</strong> {usuarioSeleccionado.rol}</Typography>
              <Typography><strong>Teléfono:</strong> {usuarioSeleccionado.telefono || '—'}</Typography>
              <Typography><strong>Dirección principal:</strong> {usuarioSeleccionado.direccion_principal || '—'}</Typography>
              <Typography><strong>Dirección secundaria:</strong> {usuarioSeleccionado.direccion_secundaria || '—'}</Typography>
            </Box>
          ) : (
            <Typography>Cargando...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModalUsuario} color="primary">Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, userId: null })}>
        <DialogTitle>¿Eliminar usuario?</DialogTitle>
        <DialogContent>Esta acción no se puede deshacer. ¿Deseás continuar?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete({ open: false, userId: null })}>Cancelar</Button>
          <Button onClick={eliminarUsuario} color="error" variant="contained">Eliminar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modalCrearUsuario} onClose={() => setModalCrearUsuario(false)}>
        <DialogTitle>➕ Crear nuevo usuario</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
          <TextField label="Nombre" fullWidth value={nuevoUsuario.nombre} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })} />
          <TextField label="Apellido" fullWidth value={nuevoUsuario.apellido} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, apellido: e.target.value })} />
          <TextField label="Email" fullWidth value={nuevoUsuario.email} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })} />
          <TextField label="Contraseña" fullWidth type="password" value={nuevoUsuario.password} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })} />
          <Select fullWidth value={nuevoUsuario.rol} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })}>
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
          <Button variant="contained" onClick={handleCrearUsuario} disabled={!nuevoUsuario.nombre || !nuevoUsuario.email || !nuevoUsuario.password}>Crear</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modalEditar} onClose={() => setModalEditar(false)}>
        <DialogTitle>✏️ Editar Usuario</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
          {usuarioEditando ? (
            <>
              <TextField label="Nombre" fullWidth value={usuarioEditando.nombre || ''} onChange={(e) => setUsuarioEditando((prev) => ({ ...prev, nombre: e.target.value }))} />
              <TextField label="Apellido" fullWidth value={usuarioEditando.apellido || ''} onChange={(e) => setUsuarioEditando((prev) => ({ ...prev, apellido: e.target.value }))} />
              <TextField label="Email" fullWidth value={usuarioEditando.email || ''} onChange={(e) => setUsuarioEditando((prev) => ({ ...prev, email: e.target.value }))} />
              <TextField label="Teléfono" fullWidth value={usuarioEditando.telefono || ''} onChange={(e) => setUsuarioEditando((prev) => ({ ...prev, telefono: e.target.value }))} />
              <TextField label="Dirección principal" fullWidth value={usuarioEditando.direccion_principal || ''} onChange={(e) => setUsuarioEditando((prev) => ({ ...prev, direccion_principal: e.target.value }))} />
              <TextField label="Dirección secundaria" fullWidth value={usuarioEditando.direccion_secundaria || ''} onChange={(e) => setUsuarioEditando((prev) => ({ ...prev, direccion_secundaria: e.target.value }))} />
              <Select fullWidth value={usuarioEditando.rol} onChange={(e) => setUsuarioEditando((prev) => ({ ...prev, rol: e.target.value }))}>
                <MenuItem value="usuario">Usuario</MenuItem>
                <MenuItem value="empresa">Empresa</MenuItem>
                <MenuItem value="delivery">Delivery</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="empleado">Empleado</MenuItem>
                <MenuItem value="moderador">Moderador</MenuItem>
              </Select>
            </>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalEditar(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleEditarUsuario}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminUsuarios;
