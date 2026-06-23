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
      titulo: 'Menús y Pedidos',
      opciones: [
        { label: 'Ver pedidos', icon: <ListAltIcon sx={{ fontSize: 32 }} />, href: '/admin/ver-pedidos', color: '#1976d2' },
        { label: 'Ver menú semanal', icon: <RestaurantMenuIcon sx={{ fontSize: 32 }} />, href: '/admin/ver-menu', color: '#4a7c42' },
        { label: 'Crear o Editar menú semanal', icon: <RestaurantMenuIcon sx={{ fontSize: 32 }} />, href: '/admin/editar-menu', color: '#0288d1' },
        { label: 'Crear o editar menú del día', icon: <AddBoxIcon sx={{ fontSize: 32 }} />, href: '/admin/editar-platos', color: '#009688' },
        { label: 'Editar Tartas', icon: <AddBoxIcon sx={{ fontSize: 32 }} />, href: '/admin/editar-tartas', color: '#ba68c8' },
      ]
    },
    {
      titulo: 'Gestión y Producción',
      opciones: [
        { label: 'Producción semanal', icon: <PrintIcon sx={{ fontSize: 32 }} />, href: '/admin/produccion', color: '#2e7d32' },
        { label: 'Definir semanas de pedidos', icon: <DateRangeIcon sx={{ fontSize: 32 }} />, href: '/admin/semanas', color: '#512da8' },
        { label: 'Editar precios', icon: <MonetizationOnIcon sx={{ fontSize: 32 }} />, href: '/admin/editar-precios', color: '#ed6c02' },
        { label: 'Gestionar Empresas', icon: <DashboardIcon sx={{ fontSize: 32 }} />, href: '/admin/empresas', color: '#3949ab' },
        { label: 'Estadísticas', icon: <DashboardIcon sx={{ fontSize: 32 }} />, href: '/admin/dashboard', color: '#7b1fa2' },
        { label: 'Gestión de Usuarios', icon: <GroupIcon sx={{ fontSize: 32 }} />, href: '/admin/usuarios', color: '#ab47bc' },
      ]
    },
    {
      titulo: 'Sistema',
      opciones: [
        { label: 'Volver a la app', icon: <ArrowBackIcon sx={{ fontSize: 32 }} />, href: '/app', color: '#616161' },
        { label: 'Cerrar sesión', icon: <ArrowBackIcon sx={{ fontSize: 32 }} />, href: '#logout', color: '#c62828' }
      ]
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 6, pb: 8 }}>
      <Typography variant="h4" gutterBottom textAlign="center" fontWeight="800" sx={{ mb: 6, color: '#1a3a17' }}>
        Panel de Administración
      </Typography>

      {categorias.map((categoria, catIndex) => (
        <Box key={catIndex} sx={{ mb: 6 }}>
          <Typography variant="h6" color="#5a6557" fontWeight="bold" sx={{ mb: 3, borderBottom: '2px solid #e4f4e1', pb: 1 }}>
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
                lg: 'repeat(4, 1fr)'
              }
            }}
          >
            {categoria.opciones.map(({ label, icon, href, color }, index) => (
              <Box key={index} sx={{ display: 'flex', width: '100%' }}>
                <motion.div
                  style={{ flexGrow: 1, width: '100%', display: 'flex' }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.2 }}
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
                      minHeight: 120,
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      borderRadius: 3,
                      bgcolor: '#fff',
                      border: '1px solid #eaeaea',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      p: 3,
                      transition: 'all 0.2s ease',
                      ':hover': {
                        borderColor: color,
                        boxShadow: `0 8px 24px ${color}20`
                      }
                    }}
                  >
                    <Box sx={{ mb: 2, display: 'inline-flex', p: 1.5, borderRadius: 2, backgroundColor: `${color}15`, color: color }}>
                      {icon}
                    </Box>
                    <Typography variant="body1" fontWeight="600" sx={{ color: '#2c3e50', lineHeight: 1.2 }}>
                      {label}
                    </Typography>
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
