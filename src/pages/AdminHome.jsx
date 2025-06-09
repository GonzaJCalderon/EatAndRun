import { Container, Typography, Box, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import PrintIcon from '@mui/icons-material/Print';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AddBoxIcon from '@mui/icons-material/AddBox';

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
      label: 'Editar menú semanal',
      icon: <RestaurantMenuIcon sx={{ fontSize: 40 }} />,
      href: '/admin/editar-menu',
      color: '#0288d1'
    },
    {
      label: '📆 Crear menú del día',
      icon: <AddBoxIcon sx={{ fontSize: 40 }} />,
      href: '/admin/crear-dia',
      color: '#009688'
    },
  {
  label: '✏️ Editar menú del día',
  icon: <RestaurantMenuIcon sx={{ fontSize: 40 }} />,
  href: '/admin/editar-menu-del-dia',
  color: '#ff7043'
},
{
  label: '🧩 Crear menú del día empresa',
  icon: <AddBoxIcon sx={{ fontSize: 40 }} />,
  href: '/admin/empresa/especial',
  color: '#d81b60'
},

    {
      label: '📈 Ver estadísticas',
      icon: <DashboardIcon sx={{ fontSize: 40 }} />,
      href: '/admin/dashboard',
      color: '#7b1fa2'
    },
    {
      label: '👤 Gestión de usuarios',
      icon: <DashboardIcon sx={{ fontSize: 40 }} />,
      href: '/admin/dashboard',
      color: '#6a1b9a'
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
      label: 'Volver a la app',
      icon: <ArrowBackIcon sx={{ fontSize: 40 }} />,
      href: '/App',
      color: '#616161'
    },
    {
      label: '📋 Ver menú semanal',
      icon: <RestaurantMenuIcon sx={{ fontSize: 40 }} />,
      href: '/admin/ver-menu',
      color: '#4caf50'
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
                onClick={() => window.location.assign(href)}
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
