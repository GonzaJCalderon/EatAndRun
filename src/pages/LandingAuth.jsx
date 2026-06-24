import React from 'react';
import { Box, Button, Container, Typography, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

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
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // Efecto parallax sutil
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 100%)', // Oscurece la imagen para que el cristal resalte
          zIndex: 1
        }
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          position: 'relative',
          zIndex: 2,
          m: 2
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Box
            sx={{
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.15)', // Cristal semi-transparente
              backdropFilter: 'blur(16px)', // Efecto esmerilado
              WebkitBackdropFilter: 'blur(16px)', // Soporte Safari
              border: '1px solid rgba(255, 255, 255, 0.3)', // Borde sutil iluminado
              borderRadius: 6,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
              p: { xs: 4, sm: 6 },
              color: '#ffffff'
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Box sx={{ mb: 2, display: 'inline-flex', backgroundColor: 'rgba(255,255,255,0.2)', p: 2, borderRadius: '50%' }}>
                <RestaurantMenuIcon sx={{ fontSize: 48, color: '#A5D6A7' }} />
              </Box>
            </motion.div>

            <img src="/fotos/logo.png" alt="Eat & Run" style={{ height: '60px', width: 'auto', display: 'block', margin: '0 auto 16px auto', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
            
            <Typography variant="h6" sx={{ mb: 5, fontWeight: 400, opacity: 0.9, lineHeight: 1.6 }}>
              Comida saludable, sin complicaciones.<br/>Elegí cómo querés empezar.
            </Typography>

            <Stack spacing={2}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                sx={{ 
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 3,
                  backgroundColor: '#4CAF50', 
                  color: '#fff',
                  boxShadow: '0 4px 14px 0 rgba(76, 175, 80, 0.39)',
                  '&:hover': { 
                    backgroundColor: '#43A047',
                    boxShadow: '0 6px 20px rgba(76, 175, 80, 0.23)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s'
                }}
                onClick={() => navigate('/login')}
              >
                Iniciar Sesión
              </Button>

              <Button
                variant="outlined"
                size="large"
                fullWidth
                sx={{ 
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 3,
                  borderWidth: 2,
                  borderColor: 'rgba(255,255,255,0.6)',
                  color: '#fff',
                  '&:hover': { 
                    borderWidth: 2,
                    borderColor: '#fff',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s'
                }}
                onClick={() => navigate('/registro')}
              >
                Crear Cuenta
              </Button>

              <Button
                variant="text"
                fullWidth
                sx={{ 
                  mt: 2, 
                  color: 'rgba(255,255,255,0.8)',
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { 
                    color: '#fff',
                    backgroundColor: 'transparent',
                    textDecoration: 'underline'
                  } 
                }}
                onClick={() => navigate('/recuperar-clave')}
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </Stack>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LandingAuth;
