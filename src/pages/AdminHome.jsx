import { Container, Typography, Box, Grid } from '@mui/material';
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

  const opciones = [
    {
      label: 'Ver pedidos',
      icon: <ListAltIcon sx={{ fontSize: 40 }} />,
      href: '/admin/ver-pedidos',
      color: '#1976d2'
    },
    {
      label: 'Crear o Editar menú semanal',
      icon: <RestaurantMenuIcon sx={{ fontSize: 40 }} />,
      href: '/admin/editar-menu',
      color: '#0288d1'
    },
    {
      label: '📆 Crear o editar menú del día',
      icon: <AddBoxIcon sx={{ fontSize: 40 }} />,
      href: '/admin/editar-platos',
      color: '#009688'
    },
    // {
    //   label: '✏️ Editar menú del día',
    //   icon: <RestaurantMenuIcon sx={{ fontSize: 40 }} />,
    //   href: '/admin/editar-menu-del-dia',
    //   color: '#ff7043'
    // },

    {
  label: '🏢 Gestionar Empresas',
  icon: <DashboardIcon sx={{ fontSize: 40 }} />,
  href: '/admin/empresas',
  color: '#3949ab'
},


    {
  label: '🥧 Editar Tartas',
  icon: <AddBoxIcon sx={{ fontSize: 40 }} />,
  href: '/admin/editar-tartas',
  color: '#ba68c8'
},


    {
      label: 'Estadísticas',
      icon: <DashboardIcon sx={{ fontSize: 40 }} />,
      href: '/admin/dashboard',
      color: '#7b1fa2' // Violeta oscuro original
    },
    {
      label: 'Gestión de Usuarios',
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      href: '/admin/dashboard', // Por ahora apunta al mismo dashboard, podés cambiarlo si tenés ruta propia
      color: '#ab47bc' // Violeta medio
    },
    {
      label: 'Semanas de pedidos',
      icon: <DateRangeIcon sx={{ fontSize: 40 }} />,
      href: '/admin/dashboard', // Por ahora apunta al mismo dashboard
      color: '#512da8' // Púrpura intenso
    },
    {
      label: '📋 Producción semanal',
      icon: <PrintIcon sx={{ fontSize: 40 }} />,
      href: '/admin/produccion',
      color: '#2e7d32'
    },
    {
      label: 'Editar precios',
      icon: <MonetizationOnIcon sx={{ fontSize: 40 }} />,
      href: '/admin/editar-precios',
      color: '#ed6c02'
    },
    {
      label: '📋 Ver menú semanal',
      icon: <RestaurantMenuIcon sx={{ fontSize: 40 }} />,
      href: '/admin/ver-menu',
      color: '#4caf50'
    },
    {
      label: 'Volver a la app',
      icon: <ArrowBackIcon sx={{ fontSize: 40 }} />,
      href: '/App',
      color: '#616161'
    },
    {
      label: '🚪 Cerrar sesión',
      icon: <ArrowBackIcon sx={{ fontSize: 40 }} />,
      href: '#logout',
      color: '#c62828'
    }
  ];

  return (
    <Container sx={{ mt: 6, pb: 8 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        🛠️ Panel de Administración
      </Typography>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        {opciones.map(({ label, icon, href, color }, index) => (
          <Grid item xs={12} sm={6} md={4} key={index} sx={{ display: 'flex' }}>
            <motion.div
              style={{ flexGrow: 1, width: '100%' }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                onClick={() => {
                  if (href === '#logout') {
                    localStorage.removeItem('token'); // Si usás sessionStorage, cambialo
                    window.location.href = '/login'; // Ajustá si tenés otra ruta de login
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
                  fontSize: '1.1rem',
                  textAlign: 'center',
                  p: 2,
                  transition: 'all 0.3s ease-in-out',
                  ':hover': {
                    boxShadow: 8
                  }
                }}
              >
                {icon && <Box sx={{ mb: 1 }}>{icon}</Box>}
                {label}
              </Box>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AdminHome;
