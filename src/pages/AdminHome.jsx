import { Container, Typography, Box, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import PrintIcon from '@mui/icons-material/Print';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AddBoxIcon from '@mui/icons-material/AddBox';
import LogoutIcon from '@mui/icons-material/Logout';
import BusinessIcon from '@mui/icons-material/Business';
import BakeryDiningIcon from '@mui/icons-material/BakeryDining';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const AdminHome = () => {
  const colorTexto = '#fff';

  const opciones = [
    {
      label: 'Ver pedidos',
      icon: <ListAltIcon sx={{ fontSize: 40 }} />,
      href: '/admin/ver-pedidos',
      color: '#1976d2' // Azul fuerte
    },
    {
      label: 'Menú semanal',
      icon: <RestaurantMenuIcon sx={{ fontSize: 40 }} />,
      href: '/admin/editar-menu',
      color: '#009688' // Teal
    },
    {
      label: 'Menú del día',
      icon: <CalendarMonthIcon sx={{ fontSize: 40 }} />,
      href: '/admin/editar-platos',
      color: '#4caf50' // Verde
    },
    {
      label: 'Empresas',
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      href: '/admin/empresas',
      color: '#f57c00' // Naranja
    },
    {
      label: 'Tartas',
      icon: <BakeryDiningIcon sx={{ fontSize: 40 }} />,
      href: '/admin/editar-tartas',
      color: '#ab47bc' // Violeta medio
    },
    {
      label: 'Estadísticas y Gestión',
      icon: <DashboardIcon sx={{ fontSize: 40 }} />,
      href: '/admin/dashboard',
      color: '#512da8' // Violeta oscuro
    },
    {
      label: 'Producción semanal',
      icon: <PrintIcon sx={{ fontSize: 40 }} />,
      href: '/admin/produccion',
      color: '#2e7d32' // Verde oscuro
    },
    {
      label: 'Editar precios',
      icon: <MonetizationOnIcon sx={{ fontSize: 40 }} />,
      href: '/admin/editar-precios',
      color: '#d84315' // Naranja rojizo
    },
    {
      label: 'Vista previa menú',
      icon: <RestaurantMenuIcon sx={{ fontSize: 40 }} />,
      href: '/admin/ver-menu',
      color: '#0288d1' // Azul claro
    },
    {
      label: 'Volver a la app',
      icon: <ArrowBackIcon sx={{ fontSize: 40 }} />,
      href: '/app',
      color: '#616161' // Gris
    },
    {
      label: 'Cerrar sesión',
      icon: <LogoutIcon sx={{ fontSize: 40 }} />,
      href: '#logout',
      color: '#c62828' // Rojo oscuro
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 6, pb: 8 }}>
      <Typography variant="h4" gutterBottom textAlign="center" fontWeight="bold" sx={{ mb: 5 }}>
        🛠️ Panel de Administración
      </Typography>

      <Grid container spacing={2}>
        {opciones.map(({ label, icon, href, color }, index) => (
          <Grid item xs={12} sm={6} md={3} key={index} sx={{ display: 'flex' }}>
            <motion.div
              style={{ flexGrow: 1, width: '100%', display: 'flex' }}
              whileHover={{ scale: 1.03 }}
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
                  height: 140, // Altura fija y uniforme
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  bgcolor: color,
                  color: colorTexto,
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  p: 2,
                  transition: 'all 0.3s ease-in-out',
                  ':hover': {
                    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                    filter: 'brightness(1.1)' // Efecto de brillo al pasar el mouse
                  }
                }}
              >
                <Box sx={{ mb: 1, opacity: 0.9 }}>{icon}</Box>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 'bold', 
                    px: 1, 
                    lineHeight: 1.2, 
                    textAlign: 'center',
                    wordBreak: 'break-word' // Evita que textos largos rompan la caja
                  }}
                >
                  {label}
                </Typography>
              </Box>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AdminHome;
