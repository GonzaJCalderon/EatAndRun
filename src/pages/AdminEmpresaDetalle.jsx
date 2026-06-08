import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Grid, Button, TextField, IconButton,
  Tooltip, Divider, CircularProgress, Chip, Avatar, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert
} from '@mui/material';
import { Delete, ArrowBack, Logout, ContentCopy, WhatsApp, Refresh, Person, Business } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from '../api/api';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const rolColor = { admin: '#f97316', empleado: '#3b82f6', empresa: '#8b5cf6' };

const AdminEmpresaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formEmpleado, setFormEmpleado] = useState({ name: '', apellido: '', email: '' });
  const [empleados, setEmpleados] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [linkInvitacion, setLinkInvitacion] = useState(null);
  const [filtroDesde, setFiltroDesde] = useState(null);
  const [filtroHasta, setFiltroHasta] = useState(null);
  const [loadingLink, setLoadingLink] = useState(false);

  const fetchEmpresa = async () => {
    try {
      const res = await axios.get(`/admin/empresas/${id}`);
      setEmpresa(res.data);
      // Separar owner de empleados: el owner tiene rol='admin' o es el responsable
      setEmpleados(res.data.empleados || []);
    } catch (err) {
      enqueueSnackbar('Error al cargar datos de empresa', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPedidos = async () => {
    try {
      const params = {};
      if (filtroDesde) params.desde = dayjs(filtroDesde).format('YYYY-MM-DD');
      if (filtroHasta) params.hasta = dayjs(filtroHasta).format('YYYY-MM-DD');
      const res = await axios.get(`/admin/empresas/${id}/pedidos`, { params });
      setPedidos(res.data || []);
    } catch (err) {
      enqueueSnackbar('Error al cargar pedidos', { variant: 'error' });
    }
  };

  const fetchLink = async () => {
    try {
      // Usamos el codigo_invitacion que viene de getEmpresaById
      const res = await axios.get(`/admin/empresas/${id}`);
      const codigo = res.data.codigo_invitacion;
      const expira = res.data.codigo_expira;
      if (codigo) {
        const frontendUrl = 'https://eatandrun.com.ar';
        setLinkInvitacion({
          link: `${frontendUrl}/registro?empresa=${codigo}`,
          expira
        });
      }
    } catch (err) {
      enqueueSnackbar('No se pudo obtener el link', { variant: 'error' });
    }
  };

  const handleRegenerarLink = async () => {
    setLoadingLink(true);
    try {
      // Regenerar via admin endpoint directo a DB
      const res = await axios.post(`/admin/empresas/${id}/regenerar-link`);
      if (res.data?.link) {
        setLinkInvitacion({ link: res.data.link, expira: res.data.expira });
        enqueueSnackbar('✅ Link regenerado', { variant: 'success' });
      }
    } catch (err) {
      enqueueSnackbar('No se pudo regenerar el link', { variant: 'error' });
    } finally {
      setLoadingLink(false);
    }
  };

  const handleCopiarLink = () => {
    if (linkInvitacion?.link) {
      navigator.clipboard.writeText(linkInvitacion.link);
      enqueueSnackbar('✅ Link copiado al portapapeles', { variant: 'success' });
    }
  };

  const handleWhatsApp = () => {
    if (linkInvitacion?.link) {
      const mensaje = encodeURIComponent(
        `🍽️ ¡Hola! Te invito a registrarte en Eat & Run para cargar tus pedidos de la semana.\n\nHacé click en el siguiente link para registrarte:\n${linkInvitacion.link}\n\n⚠️ Este link expira el ${linkInvitacion.expira ? dayjs(linkInvitacion.expira).format('DD/MM/YYYY') : 'pronto'}.`
      );
      window.open(`https://wa.me/?text=${mensaje}`, '_blank');
    }
  };

  useEffect(() => {
    fetchEmpresa();
    fetchPedidos();
    fetchLink();
    // eslint-disable-next-line
  }, [id]);

  const handleAgregarEmpleado = async () => {
    const { name, apellido, email } = formEmpleado;
    if (!name || !apellido || !email) {
      return enqueueSnackbar('Completa todos los campos', { variant: 'warning' });
    }
    try {
      await axios.post('/admin/empresas/empleados', { empresa_id: id, name, apellido, email });
      enqueueSnackbar('✅ Empleado agregado', { variant: 'success' });
      setFormEmpleado({ name: '', apellido: '', email: '' });
      fetchEmpresa();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.error || 'Error al agregar empleado', { variant: 'error' });
    }
  };

  const handleEliminarEmpleado = async (userId) => {
    try {
      await axios.delete(`/admin/empresas/${id}/empleados/${userId}`);
      enqueueSnackbar('Empleado eliminado', { variant: 'info' });
      fetchEmpresa();
    } catch (err) {
      enqueueSnackbar('No se pudo eliminar empleado', { variant: 'error' });
    }
  };

  const handleActualizarEmpresa = async () => {
    try {
      await axios.put(`/admin/empresas/${id}`, {
        nombre: empresa.nombre,
        cuit: empresa.cuit,
        direccion: empresa.direccion,
        telefono: empresa.telefono,
        responsable_nombre: empresa.responsable_nombre,
        responsable_email: empresa.responsable_email
      });
      enqueueSnackbar('✅ Empresa actualizada', { variant: 'success' });
      fetchEmpresa(); // Recargar datos para ver el cambio reflejado
    } catch (err) {
      enqueueSnackbar(err.response?.data?.error || 'Error al actualizar', { variant: 'error' });
    }
  };

  if (loading || !empresa) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
      <CircularProgress />
    </Box>
  );

  // Separar: el responsable tiene rol 'admin', los empleados tienen rol 'empleado'
  const responsable = empleados.find(e => e.rol === 'admin' || e.email === empresa.responsable_email);
  const soloEmpleados = empleados.filter(e => e.rol !== 'admin' && e.email !== empresa.responsable_email);

  const formatNombre = (emp) => {
    const nombre = emp.name || '';
    const apellido = emp.apellido || '';
    // Si el nombre es igual a la razon_social, mostrar solo el email
    if (nombre.toLowerCase() === (empresa.nombre || '').toLowerCase() && !apellido) {
      return emp.email;
    }
    return [nombre, apellido].filter(Boolean).join(' ') || emp.email;
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: 'auto' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/admin/empresas')}>
          Volver
        </Button>
        <Box display="flex" alignItems="center" gap={1}>
          <Business sx={{ color: '#6366f1', fontSize: 32 }} />
          <Typography variant="h4" fontWeight="bold">{empresa.nombre}</Typography>
        </Box>
        <Button color="error" variant="outlined" startIcon={<Logout />} onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}>
          Cerrar sesión
        </Button>
      </Box>

      {/* Guía */}
      <Alert severity="info" sx={{ mb: 4, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>📖 Guía de Gestión Corporativa:</Typography>
        <Typography variant="body2" component="div">
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li><strong>Responsable:</strong> Al editar su nombre o email en <em>"Datos de la Empresa"</em>, se actualizan sus datos de acceso instantáneamente.</li>
            <li><strong>Link de Invitación:</strong> Compartilo con la empresa (ej. por WhatsApp) para que sus empleados puedan registrarse solos como parte de este equipo.</li>
            <li><strong>Pedidos:</strong> Todo lo que pidan los empleados vinculados a esta empresa aparecerá automáticamente agrupado en la tabla inferior.</li>
          </ul>
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Info empresa */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>📄 Datos de la Empresa</Typography>
            <Grid container spacing={2}>
              {[['nombre', 'Razón Social'], ['cuit', 'CUIT'], ['direccion', 'Dirección'], ['telefono', 'Teléfono']].map(([field, label]) => (
                <Grid item xs={12} sm={6} key={field}>
                  <TextField label={label} name={field} fullWidth size="small"
                    value={empresa[field] || ''} onChange={e => setEmpresa(p => ({ ...p, [field]: e.target.value }))} />
                </Grid>
              ))}
              <Grid item xs={12} sm={6}>
                <TextField label="Nombre del Responsable" fullWidth size="small" name="responsable_nombre"
                  value={empresa.responsable_nombre || ''} onChange={e => setEmpresa(p => ({ ...p, responsable_nombre: e.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Email del Responsable" fullWidth size="small" name="responsable_email"
                  value={empresa.responsable_email || ''} onChange={e => setEmpresa(p => ({ ...p, responsable_email: e.target.value }))} />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" onClick={handleActualizarEmpresa} sx={{ borderRadius: 2 }}>
                  💾 Guardar Cambios
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Link de invitación */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>🔗 Link de Invitación</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Compartí este link con los empleados para que se registren y carguen sus pedidos.
            </Typography>

            {linkInvitacion ? (
              <>
                <TextField
                  fullWidth size="small"
                  value={linkInvitacion.link}
                  InputProps={{ readOnly: true, sx: { fontFamily: 'monospace', fontSize: '0.78rem' } }}
                  sx={{ mb: 1 }}
                />
                {linkInvitacion.expira && (
                  <Typography variant="caption" color={dayjs(linkInvitacion.expira).isBefore(dayjs()) ? 'error' : 'text.secondary'}>
                    {dayjs(linkInvitacion.expira).isBefore(dayjs())
                      ? '⚠️ Link expirado — regenerá uno nuevo'
                      : `✅ Expira: ${dayjs(linkInvitacion.expira).format('DD/MM/YYYY HH:mm')}`}
                  </Typography>
                )}
                <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                  <Button size="small" variant="outlined" startIcon={<ContentCopy />} onClick={handleCopiarLink}>
                    Copiar
                  </Button>
                  <Button size="small" variant="contained" startIcon={<WhatsApp />}
                    onClick={handleWhatsApp} sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' } }}>
                    Enviar por WhatsApp
                  </Button>
                  <Tooltip title="Regenerar link">
                    <IconButton size="small" onClick={handleRegenerarLink} disabled={loadingLink}>
                      <Refresh fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </>
            ) : (
              <Box>
                <Alert severity="warning" sx={{ mb: 2 }}>No hay link de invitación generado aún.</Alert>
                <Button 
                  variant="contained" 
                  startIcon={<Refresh />} 
                  onClick={handleRegenerarLink} 
                  disabled={loadingLink}
                  size="small"
                >
                  Generar Link Ahora
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Responsable */}
        {responsable && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>👔 Responsable de la Empresa</Typography>
              <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: '#faf5ff' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '12px !important' }}>
                  <Avatar sx={{ bgcolor: '#8b5cf6' }}>
                    <Business />
                  </Avatar>
                  <Box flex={1}>
                    <Typography fontWeight="bold">{formatNombre(responsable)}</Typography>
                    <Typography variant="body2" color="text.secondary">{responsable.email}</Typography>
                  </Box>
                  <Chip label="Responsable" size="small" sx={{ bgcolor: '#8b5cf6', color: 'white' }} />
                </CardContent>
              </Card>
            </Paper>
          </Grid>
        )}

        {/* Empleados */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              👨‍💼 Empleados ({soloEmpleados.length})
            </Typography>

            {soloEmpleados.length === 0 ? (
              <Alert severity="info">
                Aún no hay empleados registrados. Compartí el link de invitación para que se registren.
              </Alert>
            ) : (
              <Box display="flex" flexDirection="column" gap={1}>
                {soloEmpleados.map(emp => (
                  <Card key={emp.id} variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '10px !important' }}>
                      <Avatar sx={{ bgcolor: '#3b82f6', width: 36, height: 36, fontSize: '0.9rem' }}>
                        {(emp.name || emp.email || '?')[0].toUpperCase()}
                      </Avatar>
                      <Box flex={1}>
                        <Typography fontWeight="bold" variant="body1">{formatNombre(emp)}</Typography>
                        <Typography variant="body2" color="text.secondary">{emp.email}</Typography>
                      </Box>
                      <Chip label={emp.rol || 'empleado'} size="small"
                        sx={{ bgcolor: rolColor[emp.rol] || '#3b82f6', color: 'white' }} />
                      <Tooltip title="Eliminar empleado">
                        <IconButton size="small" color="error" onClick={() => handleEliminarEmpleado(emp.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Agregar empleado manual */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>➕ Agregar Empleado Manualmente</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Podés agregar empleados directamente sin necesidad del link de invitación.
            </Typography>
            <Grid container spacing={2}>
              {[['name', 'Nombre'], ['apellido', 'Apellido'], ['email', 'Email']].map(([field, label]) => (
                <Grid item xs={12} sm={4} key={field}>
                  <TextField fullWidth size="small" label={label} name={field}
                    value={formEmpleado[field]} onChange={e => setFormEmpleado(p => ({ ...p, [field]: e.target.value }))} />
                </Grid>
              ))}
              <Grid item xs={12}>
                <Button variant="contained" onClick={handleAgregarEmpleado} sx={{ borderRadius: 2 }}>
                  Agregar empleado
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Pedidos */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>📦 Pedidos de Empleados</Typography>

            <Grid container spacing={2} mb={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker label="Desde" value={filtroDesde} onChange={setFiltroDesde}
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }} />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={4}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker label="Hasta" value={filtroHasta} onChange={setFiltroHasta}
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }} />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button variant="outlined" onClick={fetchPedidos} sx={{ borderRadius: 2 }}>
                  Filtrar
                </Button>
              </Grid>
            </Grid>

            {pedidos.length === 0 ? (
              <Alert severity="info">No hay pedidos registrados para esta empresa.</Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Pedido</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Empleado</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Detalle</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pedidos.map(pedido => {
                      const nombreEmpleado = pedido.usuario
                        ? `${pedido.usuario.nombre || ''} ${pedido.usuario.apellido || ''}`.trim() || pedido.usuario.email
                        : 'Desconocido';
                      const diasOrden = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
                      const sortPorDia = (a, b) => {
                        const idxA = diasOrden.indexOf(a[0].split('-')[0].toLowerCase());
                        const idxB = diasOrden.indexOf(b[0].split('-')[0].toLowerCase());
                        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
                      };

                      const diarios = Object.entries(pedido.pedido?.diarios || {}).sort(sortPorDia);
                      const extras = Object.entries(pedido.pedido?.extras || {}).sort(sortPorDia);
                      const tartas = Object.entries(pedido.pedido?.tartas || {});
                      return (
                        <TableRow key={pedido.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">#{pedido.id}</Typography>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#3b82f6' }}>
                                {(nombreEmpleado[0] || '?').toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body2">{nombreEmpleado}</Typography>
                                <Typography variant="caption" color="text.secondary">{pedido.usuario?.email}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {pedido.fecha ? dayjs(pedido.fecha).format('DD/MM/YYYY') : '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              {diarios.map(([dia, platos]) => (
                                <Box key={dia}>
                                  <Typography variant="caption" color="text.secondary" fontWeight="bold">{dia}: </Typography>
                                  {Object.entries(platos).map(([plato, cant]) => (
                                    <Chip key={plato} label={`${plato} x${cant}`} size="small" sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }} />
                                  ))}
                                </Box>
                              ))}
                              {extras.map(([dia, exts]) => (
                                <Box key={`e-${dia}`}>
                                  <Typography variant="caption" color="#d97706" fontWeight="bold">+ Extras {dia}: </Typography>
                                  {Object.entries(exts).map(([ext, cant]) => (
                                    <Chip key={ext} label={`${ext} x${cant}`} size="small" sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem', bgcolor: '#fef3c7' }} />
                                  ))}
                                </Box>
                              ))}
                              {tartas.length > 0 && (
                                <Box>
                                  <Typography variant="caption" color="#db2777" fontWeight="bold">🥧 Tartas: </Typography>
                                  {tartas.map(([t, cant]) => (
                                    <Chip key={t} label={`${t} x${cant}`} size="small" sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem', bgcolor: '#fce7f3' }} />
                                  ))}
                                </Box>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={pedido.estado || 'pendiente'}
                              size="small"
                              sx={{
                                bgcolor: pedido.estado === 'entregado' ? '#bbf7d0' : pedido.estado === 'cancelado' ? '#fecaca' : '#fef08a',
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminEmpresaDetalle;
