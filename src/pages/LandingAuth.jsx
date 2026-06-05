import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';


const LandingAuth = () => {
  const navigate = useNavigate();

  const heroImage = 'https://res.cloudinary.com/dwiga4jg8/image/upload/w_1600,q_auto,f_auto/Fondo_APLICACION_EAR_2_qbxnl7.png';


  return (
   <Box
  sx={{
    minHeight: '100vh',
    width: '100%',
    backgroundImage: `url(${heroImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden'
  }}
>

      

      {/* Contenido sobre la imagen */}
      <Container
        maxWidth="sm"
        sx={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.97)',
          borderRadius: 4,
          p: { xs: 3, sm: 5 },
          m: 2
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Eat&Run 🍽️
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            Comida saludable, sin complicaciones. Elegí cómo querés empezar:
          </Typography>

          <Button
            variant="contained"
            size="large"
            fullWidth
            sx={{ mb: 2, backgroundColor: '#68955C', '&:hover': { backgroundColor: '#557d4c' } }}
            onClick={() => navigate('/login')}
          >
            Iniciar sesión
          </Button>

          <Button
            variant="outlined"
            size="large"
            fullWidth
            onClick={() => navigate('/registro')}
          >
            Crear cuenta
          </Button>

          <Button
            variant="text"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => navigate('/recuperar-clave')}
          >
            ¿Olvidaste tu contraseña?
          </Button>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LandingAuth;
