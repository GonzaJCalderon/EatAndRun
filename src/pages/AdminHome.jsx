import React from 'react';
import { Container, Typography, Box, Grid, Card, CardActionArea } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import PrintIcon from '@mui/icons-material/Print';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AddBoxIcon from '@mui/icons-material/AddBox';
import LogoutIcon from '@mui/icons-material/Logout';
import PieChartIcon from '@mui/icons-material/PieChart';
import BusinessIcon from '@mui/icons-material/Business';
import BakeryDiningIcon from '@mui/icons-material/BakeryDining';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const AdminHome = () => {
  const opciones = [
    {
      label: 'Ver pedidos',
      description: 'Gestión de órdenes actuales',
      icon: <ListAltIcon />,
      href: '/admin/ver-pedidos',
      color: '#1976d2'
    },
    {
      label: 'Menú semanal',
      description: 'Crear o editar la semana',
      icon: <RestaurantMenuIcon />,
      href: '/admin/editar-menu',
      color: '#0288d1'
    },
    {
      label: 'Menú del día',
      description: 'Configurar platos diarios',
      icon: <CalendarMonthIcon />,
      href: '/admin/editar-platos',
      color: '#009688'
    },
    {
      label: 'Empresas',
      description: 'Gestión de clientes corporativos',
      icon: <BusinessIcon />,
      href: '/admin/empresas',
      color: '#3949ab'
    },
    {
      label: 'Tartas',
      description: 'Editar catálogo de tartas',
      icon: <BakeryDiningIcon />,
      href: '/admin/editar-tartas',
      color: '#ba68c8'
    },
    {
      label: 'Estadísticas y Ajustes',
      description: 'Métricas y configuración general',
      icon: <PieChartIcon />,
      href: '/admin/dashboard',
      color: '#7b1fa2'
    },
    {
      label: 'Producción semanal',
      description: 'Reporte para cocina',
      icon: <PrintIcon />,
      href: '/admin/produccion',
      color: '#2e7d32'
    },
    {
      label: 'Editar precios',
      description: 'Actualizar costos del menú',
      icon: <MonetizationOnIcon />,
      href: '/admin/editar-precios',
      color: '#ed6c02'
    },
    {
      label: 'Vista Previa Menú',
      description: 'Ver menú como cliente',
      icon: <DashboardIcon />,
      href: '/admin/ver-menu',
      color: '#4caf50'
    },
    {
      label: 'Volver a la app',
      description: 'Ir al inicio de cliente',
      icon: <ArrowBackIcon />,
      href: '/app',
      color: '#616161'
    },
    {
      label: 'Cerrar sesión',
      description: 'Salir del panel de control',
      icon: <LogoutIcon />,
      href: '#logout',
      color: '#d32f2f'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', pt: { xs: 4, md: 8 }, pb: 10 }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ mb: { xs: 4, md: 6 }, textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Typography variant="h3" fontWeight="900" color="text.primary" gutterBottom sx={{ fontSize: { xs: '2rem', md: '3rem' }, letterSpacing: '-1px' }}>
              Panel de Administración
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }}>
              Gestioná pedidos, menús y configuración desde un solo lugar
            </Typography>
          </motion.div>
        </Box>

        {/* Grid de opciones */}
        <Grid container spacing={3}>
          {opciones.map(({ label, description, icon, href, color }, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                style={{ height: '100%' }}
              >
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                    height: '100%',
                    border: '1px solid rgba(0,0,0,0.06)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: `0 12px 28px ${color}20`,
                      borderColor: `${color}40`,
                    }
                  }}
                >
                  <CardActionArea
                    onClick={() => {
                      if (href === '#logout') {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                      } else {
                        window.location.assign(href);
                      }
                    }}
                    sx={{ height: '100%', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}
                  >
                    <Box
                      sx={{
                        backgroundColor: `${color}15`,
                        color: color,
                        p: 1.5,
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2.5
                      }}
                    >
                      {React.cloneElement(icon, { sx: { fontSize: 32 } })}
                    </Box>
                    <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ mb: 0.5, lineHeight: 1.2, fontSize: '1.1rem' }}>
                      {label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                      {description}
                    </Typography>
                  </CardActionArea>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminHome;
