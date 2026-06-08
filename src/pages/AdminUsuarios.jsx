import React, { useEffect, useState } from "react";
import {
  Container, Typography, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, TextField, Snackbar, Alert, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination, IconButton, Chip, Tooltip, Paper
} from "@mui/material";
import { ArrowBack, Delete, Visibility, Edit, Group, Add, GetApp } from "@mui/icons-material";
import api from "../api/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const rolColors = {
  admin: 'error',
  moderador: 'warning',
  empresa: 'secondary',
  delivery: 'info',
  empleado: 'success',
  usuario: 'default'
};

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  
  // Paginación
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(15);
  
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
    const coincideBusqueda = `${u.nombre || ""} ${u.apellido || ""} ${u.email || ""}`.toLowerCase().includes(busqueda.toLowerCase());
    return coincideRol && coincideBusqueda;
  });

  // Efecto para resetear paginación si se filtra
  useEffect(() => {
    setPagina(0);
  }, [busqueda, filtroRol]);

  const handleChangePage = (event, newPage) => {
    setPagina(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setFilasPorPagina(parseInt(event.target.value, 10));
    setPagina(0);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, pb: 6 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Button startIcon={<ArrowBack />} variant="outlined" onClick={() => window.location.href = "/admin"}>
          Volver
        </Button>
        <Box display="flex" alignItems="center" gap={1}>
          <Group sx={{ color: '#6366f1', fontSize: 32 }} />
          <Typography variant="h4" fontWeight="bold">Gestión de Usuarios</Typography>
        </Box>
        <Box /> {/* Spacer */}
      </Box>

      {/* Guía */}
      <Alert severity="info" sx={{ mb: 4, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>📖 Guía del Administrador:</Typography>
        <Typography variant="body2">
          Desde este panel tenés acceso total a todos los usuarios del sistema. Podés <strong>cambiar roles</strong> rápidamente desde el desplegable en cada fila, crear usuarios de emergencia o <strong>exportar la base de datos</strong> completa a Excel. Utilizá el buscador y los filtros para encontrar fácilmente usuarios específicos.
        </Typography>
      </Alert>

      {/* Filtros y Acciones */}
      <Paper sx={{ p: 2, mb: 4, borderRadius: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', bgcolor: '#f8fafc' }}>
        <TextField
          size="small"
          placeholder="Buscar por nombre, apellido o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 250, bgcolor: 'white', borderRadius: 1 }}
        />
        <Select
          size="small"
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          sx={{ minWidth: 160, bgcolor: 'white' }}
        >
          <MenuItem value="todos">Todos los roles</MenuItem>
          <MenuItem value="usuario">Usuario (Base)</MenuItem>
          <MenuItem value="empresa">Empresa</MenuItem>
          <MenuItem value="empleado">Empleado Corporativo</MenuItem> 
          <MenuItem value="delivery">Delivery</MenuItem>
          <MenuItem value="moderador">Moderador</MenuItem>
          <MenuItem value="admin">Administrador</MenuItem>
        </Select>

        <Button variant="contained" color="success" onClick={() => setModalCrearUsuario(true)} startIcon={<Add />} sx={{ borderRadius: 2 }}>
          Crear Usuario
        </Button>
        <Button variant="outlined" onClick={exportarUsuariosExcel} startIcon={<GetApp />} sx={{ borderRadius: 2 }}>
          Exportar
        </Button>
      </Paper>

      {/* Tabla Compacta (DataGrid alternative) */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <TableContainer sx={{ maxHeight: '65vh' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>Nombre Completo</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>Rol</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usuariosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No hay usuarios que coincidan con la búsqueda.
                  </TableCell>
                </TableRow>
              ) : (
                usuariosFiltrados
                  .slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina)
                  .map((usuario) => (
                    <TableRow key={usuario.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {usuario.nombre || usuario.apellido ? `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{usuario.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          value={usuario.rol}
                          onChange={(e) => cambiarRol(usuario.id, e.target.value)}
                          sx={{ 
                            fontSize: '0.8rem', 
                            height: 30, 
                            minWidth: 120,
                            '.MuiSelect-select': { py: 0.5 }
                          }}
                        >
                          <MenuItem value="usuario" sx={{ fontSize: '0.8rem' }}>Usuario</MenuItem>
                          <MenuItem value="empresa" sx={{ fontSize: '0.8rem' }}>Empresa</MenuItem>
                          <MenuItem value="empleado" sx={{ fontSize: '0.8rem' }}>Empleado</MenuItem>
                          <MenuItem value="delivery" sx={{ fontSize: '0.8rem' }}>Delivery</MenuItem>
                          <MenuItem value="moderador" sx={{ fontSize: '0.8rem' }}>Moderador</MenuItem>
                          <MenuItem value="admin" sx={{ fontSize: '0.8rem' }}>Admin</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Ver Detalles">
                          <IconButton size="small" onClick={() => abrirModalUsuario(usuario)} color="primary">
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => abrirModalEdicion(usuario)} sx={{ color: '#0ea5e9' }}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" onClick={() => confirmarEliminarUsuario(usuario.id)} color="error">
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[15, 30, 50, 100]}
          component="div"
          count={usuariosFiltrados.length}
          rowsPerPage={filasPorPagina}
          page={pagina}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

      {/* MODAL: VER USUARIO */}
      <Dialog open={modalAbierto} onClose={cerrarModalUsuario} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Group color="primary" /> Información del Usuario
        </DialogTitle>
        <DialogContent dividers>
          {usuarioSeleccionado ? (
            <Box display="grid" gridTemplateColumns="1fr 2fr" gap={2}>
              <Typography fontWeight="bold">ID:</Typography>
              <Typography>{usuarioSeleccionado.id}</Typography>
              
              <Typography fontWeight="bold">Nombre:</Typography>
              <Typography>{usuarioSeleccionado.nombre || '—'}</Typography>
              
              <Typography fontWeight="bold">Apellido:</Typography>
              <Typography>{usuarioSeleccionado.apellido || '—'}</Typography>
              
              <Typography fontWeight="bold">Email:</Typography>
              <Typography>{usuarioSeleccionado.email}</Typography>
              
              <Typography fontWeight="bold">Rol:</Typography>
              <Chip size="small" label={usuarioSeleccionado.rol} color={rolColors[usuarioSeleccionado.rol] || 'default'} />
              
              <Typography fontWeight="bold">Teléfono:</Typography>
              <Typography>{usuarioSeleccionado.telefono || '—'}</Typography>
              
              <Typography fontWeight="bold">Dirección 1:</Typography>
              <Typography>{usuarioSeleccionado.direccion_principal || '—'}</Typography>
              
              <Typography fontWeight="bold">Dirección 2:</Typography>
              <Typography>{usuarioSeleccionado.direccion_secundaria || '—'}</Typography>
            </Box>
          ) : (
            <Typography>Cargando...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModalUsuario} variant="contained" sx={{ borderRadius: 2 }}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: ELIMINAR */}
      <Dialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, userId: null })}>
        <DialogTitle>⚠️ ¿Eliminar usuario?</DialogTitle>
        <DialogContent>Esta acción no se puede deshacer y borrará permanentemente sus pedidos asociados si corresponde. ¿Deseás continuar?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete({ open: false, userId: null })}>Cancelar</Button>
          <Button onClick={eliminarUsuario} color="error" variant="contained">Eliminar Definitivamente</Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: CREAR */}
      <Dialog open={modalCrearUsuario} onClose={() => setModalCrearUsuario(false)} maxWidth="sm" fullWidth>
        <DialogTitle>➕ Crear nuevo usuario</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Nombre" fullWidth size="small" value={nuevoUsuario.nombre} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })} />
          <TextField label="Apellido" fullWidth size="small" value={nuevoUsuario.apellido} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, apellido: e.target.value })} />
          <TextField label="Email" fullWidth size="small" value={nuevoUsuario.email} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })} />
          <TextField label="Contraseña" fullWidth size="small" type="password" value={nuevoUsuario.password} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })} />
          <Select size="small" fullWidth value={nuevoUsuario.rol} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })}>
            <MenuItem value="usuario">Usuario</MenuItem>
            <MenuItem value="empresa">Empresa</MenuItem>
            <MenuItem value="empleado">Empleado</MenuItem>
            <MenuItem value="delivery">Delivery</MenuItem>
            <MenuItem value="moderador">Moderador</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalCrearUsuario(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCrearUsuario} disabled={!nuevoUsuario.nombre || !nuevoUsuario.email || !nuevoUsuario.password}>Crear Usuario</Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: EDITAR */}
      <Dialog open={modalEditar} onClose={() => setModalEditar(false)} maxWidth="sm" fullWidth>
        <DialogTitle>✏️ Editar Usuario</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {usuarioEditando && (
            <>
              <TextField label="Nombre" fullWidth size="small" value={usuarioEditando.nombre || ''} onChange={(e) => setUsuarioEditando((prev) => ({ ...prev, nombre: e.target.value }))} />
              <TextField label="Apellido" fullWidth size="small" value={usuarioEditando.apellido || ''} onChange={(e) => setUsuarioEditando((prev) => ({ ...prev, apellido: e.target.value }))} />
              <TextField label="Email" fullWidth size="small" value={usuarioEditando.email || ''} onChange={(e) => setUsuarioEditando((prev) => ({ ...prev, email: e.target.value }))} />
              <TextField label="Teléfono" fullWidth size="small" value={usuarioEditando.telefono || ''} onChange={(e) => setUsuarioEditando((prev) => ({ ...prev, telefono: e.target.value }))} />
              <TextField label="Dirección principal" fullWidth size="small" value={usuarioEditando.direccion_principal || ''} onChange={(e) => setUsuarioEditando((prev) => ({ ...prev, direccion_principal: e.target.value }))} />
              <TextField label="Dirección secundaria" fullWidth size="small" value={usuarioEditando.direccion_secundaria || ''} onChange={(e) => setUsuarioEditando((prev) => ({ ...prev, direccion_secundaria: e.target.value }))} />
              <Select size="small" fullWidth value={usuarioEditando.rol} onChange={(e) => setUsuarioEditando((prev) => ({ ...prev, rol: e.target.value }))}>
                <MenuItem value="usuario">Usuario</MenuItem>
                <MenuItem value="empresa">Empresa</MenuItem>
                <MenuItem value="empleado">Empleado</MenuItem>
                <MenuItem value="delivery">Delivery</MenuItem>
                <MenuItem value="moderador">Moderador</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalEditar(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleEditarUsuario}>Guardar Cambios</Button>
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
