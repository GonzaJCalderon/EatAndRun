import React, { useEffect } from 'react';
import { Box, Typography, Container, Grid, Divider, Paper, Link } from '@mui/material';
import { motion, useAnimation } from 'framer-motion';
import { FaLeaf, FaWarehouse, FaUserMd, FaHandshake } from 'react-icons/fa';
import InstagramIcon from '@mui/icons-material/Instagram';

import empresaImg from '../assets/imgs/empresaImg.png';
import plantaImg from '../assets/imgs/planta-elaboradora.png';
import nutricionImg from '../assets/imgs/nutricionImg.png';

// Logos
import acsa from '../assets/logos/acsa_mining.jpg';
import allianz from '../assets/logos/Allianz.jpg';
import blogo from '../assets/logos/Blogo.jpg';
import chitza from '../assets/logos/chitza.jpg';
import sanJorge from '../assets/logos/colegio_san_jorge.jpg';
import goldstein from '../assets/logos/goldstein.jpg';
import hidroplas from '../assets/logos/Hidroplas.jpg';
import inap from '../assets/logos/inap.jpg';
import ciudad from '../assets/logos/mendoza_ciudad.jpg';
import nav from '../assets/logos/nav.jpg';

const logos = [acsa, allianz, blogo, chitza, sanJorge, goldstein, hidroplas, inap, ciudad, nav];

const hitos = [
  { año: '2019', titulo: 'Fundación', descripcion: 'Nacemos con el objetivo de llevar salud y sabor a empresas.' },
  { año: '2020', titulo: 'Planta propia', descripcion: 'Abrimos nuestra planta en Carrodilla con procesos certificados.' },
  { año: '2021', titulo: 'Asesoramiento nutricional', descripcion: 'Sumamos nutricionistas para armar menús balanceados.' },
  { año: '2022', titulo: 'Crecimiento corporativo', descripcion: 'Grandes empresas comienzan a confiar en Eat & Run.' },
  { año: '2023', titulo: 'Plataforma online', descripcion: 'Lanzamos pedidos digitales y autogestión para usuarios.' }
];

const Timeline = () => (
  <Box sx={{ borderLeft: '4px solid #81c784', pl: 3, mt: 6 }}>
    {hitos.map((h, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.2 }}
        viewport={{ once: true }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="overline" color="success.main">{h.año}</Typography>
          <Typography variant="h6" fontWeight="bold">{h.titulo}</Typography>
          <Typography variant="body2" color="text.secondary">{h.descripcion}</Typography>
          <Divider sx={{ mt: 2, opacity: 0.3 }} />
        </Box>
      </motion.div>
    ))}
  </Box>
);

const QuienesSomos = () => {
  const controls = useAnimation();

  const startScroll = () => {
    controls.start({
      x: ['0%', '-100%'],
      transition: {
        repeat: Infinity,
        repeatType: 'loop',
        duration: 40,
        ease: 'linear'
      }
    });
  };

  const stopScroll = () => {
    controls.stop();
  };

  useEffect(() => {
    startScroll();
  }, []);

  return (
    <Box sx={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#f8fcf9' }}>
      {/* Hero */}
      <Box
        sx={{
          backgroundImage: `url(${empresaImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: 320,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          color: '#fff',
          textShadow: '0 0 15px rgba(0,0,0,0.7)'
        }}
      >
        <Typography variant="h3" fontWeight="bold">¿Quiénes somos?</Typography>
      </Box>

      <Container sx={{ py: 6 }}>
        {/* Presentación */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            <FaLeaf style={{ color: '#66bb6a', marginRight: 8 }} />
            Comida saludable, rica y profesional
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Somos una empresa mendocina que ofrece soluciones gastronómicas a empresas e instituciones. Elaboramos diariamente menús ricos, frescos y saludables.
          </Typography>
        </motion.div>

        {/* Planta */}
        <Grid container spacing={4} alignItems="center" sx={{ my: 6 }}>
          <Grid item xs={12} md={6}>
            <motion.img
              src={plantaImg}
              alt="Planta"
              style={{ width: '100%', borderRadius: 16 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight="bold">
              <FaWarehouse style={{ marginRight: 8, color: '#66bb6a' }} />
              Planta elaboradora propia
            </Typography>
            <Typography variant="body1" color="text.secondary">
              En Luján de Cuyo, equipada con cámaras de frío y logística propia. Nos aseguramos que todo llegue fresco y puntual.
            </Typography>
          </Grid>
        </Grid>

        {/* Nutrición */}
        <Grid container spacing={4} alignItems="center" sx={{ my: 6, flexDirection: { xs: 'column-reverse', md: 'row' } }}>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
            <motion.img
              src={nutricionImg}
              alt="Nutrición"
              style={{ width: '100%', maxWidth: '100%', borderRadius: 16 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight="bold">
              <FaUserMd style={{ marginRight: 8, color: '#66bb6a' }} />
              Supervisión nutricional
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Todos los menús son supervisados por profesionales para asegurar balance y aporte calórico ideal.
            </Typography>
          </Grid>
        </Grid>

        {/* Timeline */}
        <Timeline />

        {/* Logos animados */}
        <Box sx={{ mt: 8, overflow: 'hidden' }}>
          <Typography variant="h6" fontWeight="bold" textAlign="center" gutterBottom>
            <FaHandshake style={{ color: '#66bb6a', marginRight: 8 }} />
            Empresas que confían en nosotros
          </Typography>
          <Box
            onMouseEnter={stopScroll}
            onMouseLeave={startScroll}
            sx={{
              mt: 4,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <motion.div
              animate={controls}
              style={{
                display: 'inline-flex',
                gap: '40px',
                padding: '10px 0',
                alignItems: 'center',
              }}
            >
              {[...logos, ...logos].map((logo, i) => (
                <Paper
                  key={i}
                  elevation={2}
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: '#fff',
                    minWidth: 120,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 70,
                  }}
                >
                  <img src={logo} alt={`logo-${i}`} style={{ height: 50, objectFit: 'contain' }} />
                </Paper>
              ))}
            </motion.div>
          </Box>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', py: 4, mt: 6, backgroundColor: '#f1f1f1' }}>
        <img
          src="/assets/eatandrun-logo.jpg"
          alt="Logo Footer"
          style={{ width: '60px', borderRadius: '50%', marginBottom: 8 }}
        />
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Eat & Run - Healthy Food 🍃
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
          <InstagramIcon sx={{ color: '#E1306C' }} />
          <Link
            href="https://www.instagram.com/eatandrun.mza/"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            variant="body2"
            sx={{ fontWeight: 500, color: 'text.secondary' }}
          >
            @eatandrun.mza
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default QuienesSomos;
