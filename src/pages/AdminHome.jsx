import { Container, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import PrintIcon from '@mui/icons-material/Print';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AddBoxIcon from '@mui/icons-material/AddBox';
import GroupIcon from '@mui/icons-material/Group';
import DateRangeIcon from '@mui/icons-material/DateRange';

const AdminHome = () => {
  const colorTexto = '#fff';

  const categorias = [
    {
      titulo: '📦 Menús y Pedidos',
      opciones: [
        { label: 'Ver pedidos', icon: <ListAltIcon sx={{ fontSize: 40 }} />, href: '/admin/ver-pedidos', color: '#1976d2' },
        { label: '📋 Ver menú semanal', icon: <RestaurantMenuIcon sx={{ fontSize: 40 }} />, href: '/admin/ver-menu', color: '#4caf50' },
        { label: 'Crear o Editar menú semanal', icon: <RestaurantMenuIcon sx={{ fontSize: 40 }} />, href: '/admin/editar-menu', color: '#0288d1' },
        { label: '📆 Crear o editar menú del día', icon: <AddBoxIcon sx={{ fontSize: 40 }} />, href: '/admin/editar-platos', color: '#009688' },
        { label: '🥧 Editar Tartas', icon: <AddBoxIcon sx={{ fontSize: 40 }} />, href: '/admin/editar-tartas', color: '#ba68c8' },
      ]
    },
    {
      titulo: '⚙️ Gestión y Producción',
      opciones: [
        { label: '📋 Producción semanal', icon: <PrintIcon sx={{ fontSize: 40 }} />, href: '/admin/produccion', color: '#2e7d32' },
        { label: 'Definir semanas de pedidos', icon: <DateRangeIcon sx={{ fontSize: 40 }} />, href: '/admin/semanas', color: '#512da8' }, // Ruta nueva
        { label: 'Editar precios', icon: <MonetizationOnIcon sx={{ fontSize: 40 }} />, href: '/admin/editar-precios', color: '#ed6c02' },
        { label: '🏢 Gestionar Empresas', icon: <DashboardIcon sx={{ fontSize: 40 }} />, href: '/admin/empresas', color: '#3949ab' },
        { label: 'Estadísticas', icon: <DashboardIcon sx={{ fontSize: 40 }} />, href: '/admin/dashboard', color: '#7b1fa2' },
        { label: 'Gestión de Usuarios', icon: <GroupIcon sx={{ fontSize: 40 }} />, href: '/admin/usuarios', color: '#ab47bc' }, // Ruta nueva
      ]
    },
    {
      titulo: '🔒 Sistema',
      opciones: [
        { label: 'Volver a la app', icon: <ArrowBackIcon sx={{ fontSize: 40 }} />, href: '/app', color: '#616161' },
        { label: '🚪 Cerrar sesión', icon: <ArrowBackIcon sx={{ fontSize: 40 }} />, href: '#logout', color: '#c62828' }
      ]
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 6, pb: 8 }}>
      <Typography variant="h4" gutterBottom textAlign="center" fontWeight="bold" sx={{ mb: 6 }}>
        Panel de Administración
      </Typography>

      {categorias.map((categoria, catIndex) => (
        <Box key={catIndex} sx={{ mb: 6 }}>
          <Typography variant="h6" color="text.secondary" fontWeight="bold" sx={{ mb: 2, borderBottom: '2px solid #eee', pb: 1 }}>
            {categoria.titulo}
          </Typography>

          <Box 
            sx={{ 
              display: 'grid', 
              gap: 3, 
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(5, 1fr)' // Exactamente 5 columnas
              }
            }}
          >
            {categoria.opciones.map(({ label, icon, href, color }, index) => (
              <Box key={index} sx={{ display: 'flex', width: '100%' }}>
                <motion.div
                  style={{ flexGrow: 1, width: '100%', display: 'flex' }}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    onClick={() => {
                      if (href === '#logout') {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                      } else {
                        window.location.assign(href);
                      }
                    }}
                    sx={{
                      height: 160,
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 3,
                      bgcolor: color,
                      color: colorTexto,
                      cursor: 'pointer',
                      boxShadow: 4,
                      fontWeight: 'bold',
                      fontSize: '1.05rem',
                      textAlign: 'center',
                      p: 2,
                      transition: 'all 0.3s ease-in-out',
                      ':hover': {
                        boxShadow: 8
                      }
                    }}
                  >
                    <Box sx={{ mb: 1 }}>{icon}</Box>
                    {label}
                  </Box>
                </motion.div>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Container>
  );
};

export default AdminHome;
