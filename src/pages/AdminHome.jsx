import { Container, Typography, Button, Box } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import PrintIcon from '@mui/icons-material/Print';

const AdminHome = () => {
  return (
    <Container sx={{ mt: 6, pb: 8 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        🛠️ Panel de Administración
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 4 }}>
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<ListAltIcon />}
            onClick={() => window.location.href = "/admin/ver-pedidos"}
          >
            Ver pedidos
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<RestaurantMenuIcon />}
            onClick={() => window.location.href = "/admin/editar-menu"}
          >
            Editar menú semanal
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<DashboardIcon />}
            onClick={() => window.location.href = "/admin/dashboard"}
          >
            📈 Ver estadísticas
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
          <Button
            variant="contained"
            fullWidth
            color="success"
            startIcon={<PrintIcon />}
            onClick={() => window.location.href = "/admin/produccion"}
          >
            📋 Producción semanal
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<ArrowBackIcon />}
            onClick={() => window.location.href = "/"}
          >
            Volver a la app
          </Button>
        </motion.div>
      </Box>
    </Container>
  );
};

export default AdminHome;
