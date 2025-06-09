import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import heroImage from '../assets/imgs/landing-welcome.png'; // 📸 Pedí esta imagen a Sora

const LandingAuth = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 4, p: 5 }}>
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
        </motion.div>
      </Container>
    </Box>
  );
};

export default LandingAuth;
