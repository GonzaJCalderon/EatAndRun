import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import logoEatAndRun from '../assets/eatandrun-logo.jpg'; // 👈🏼 Asegurate que esté en /src/assets/logo.png

const LoginForm = ({ onLogin }) => {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.nombre && form.email) {
      localStorage.setItem('eatAndRunUser', JSON.stringify(form));
      onLogin(form);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        mt: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}
    >
      {/* 🥗 Logo animado */}
      <motion.img
        src={logoEatAndRun}
        alt="Eat & Run Logo"
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          objectFit: 'cover',
          marginBottom: '20px',
          boxShadow: '0px 4px 12px rgba(0,0,0,0.2)'
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      />

      {/* 🏁 Bienvenida */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
          ¡Bienvenido a Eat & Run!
        </Typography>

        {/* ✨ Frase de marca */}
        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
          Acompañamos a quienes persiguen objetivos nutricionales.
        </Typography>
      </motion.div>

      {/* 📝 Formulario */}
      <TextField
        label="Nombre"
        name="nombre"
        fullWidth
        margin="normal"
        onChange={handleChange}
        required
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        fullWidth
        margin="normal"
        onChange={handleChange}
        required
      />
      <TextField
        label="Teléfono"
        name="telefono"
        fullWidth
        margin="normal"
        onChange={handleChange}
      />
      <TextField
        label="Dirección"
        name="direccion"
        fullWidth
        margin="normal"
        onChange={handleChange}
      />

      {/* 🎯 Botón */}
      <Button
        type="submit"
        variant="contained"
        color="success"
        fullWidth
        sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}
      >
        Ingresar
      </Button>
    </Box>
  );
};

export default LoginForm;
