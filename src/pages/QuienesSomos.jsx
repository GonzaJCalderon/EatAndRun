import React, { useEffect } from 'react';
import { Box, Typography, Container, Grid, Button, Paper, Link } from '@mui/material';
import { motion, useAnimation } from 'framer-motion';
import { FaLeaf, FaWarehouse, FaUserMd, FaHandshake, FaArrowRight, FaWhatsapp } from 'react-icons/fa';
import InstagramIcon from '@mui/icons-material/Instagram';
import { useNavigate } from 'react-router-dom';

import empresaImg from '../assets/imgs/empresaImg.png';
import plantaImg from '../assets/imgs/planta-elaboradora.png';
import nutricionImg from '../assets/imgs/nutricionista_saludable.png';

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
  { año: '2019', titulo: 'Fundación', descripcion: 'Nacemos con el objetivo de llevar salud y sabor a tu mesa.' },
  { año: '2020', titulo: 'Planta propia', descripcion: 'Abrimos nuestra planta en Paso de los Andes 25, Ciudad, con procesos certificados.' },
  { año: '2021', titulo: 'Asesoramiento nutricional', descripcion: 'Sumamos nutricionistas para armar menús balanceados.' },
  { año: '2022', titulo: 'Crecimiento', descripcion: 'Grandes instituciones comienzan a confiar en Eat & Run.' },
  { año: '2026', titulo: 'Plataforma online', descripcion: 'Lanzamos pedidos digitales y autogestión para nuestros usuarios.' }
];

const Timeline = () => (
  <Box sx={{ borderLeft: '4px solid #22c55e', pl: 4, mt: 4, ml: { xs: 2, md: 0 } }}>
    {hitos.map((h, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.15, duration: 0.5 }}
        viewport={{ once: true, margin: "-50px" }}
        style={{ position: 'relative', marginBottom: '3rem' }}
      >
        <Box 
          sx={{ 
            position: 'absolute', 
            left: '-41px', 
            top: 0, 
            width: 18, 
            height: 18, 
            borderRadius: '50%', 
            backgroundColor: '#22c55e',
            border: '4px solid #f8fcf9'
          }} 
        />
        <Box 
          sx={{ 
            backgroundColor: '#ffffff', 
            p: 3, 
            borderRadius: 4, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            transition: 'transform 0.3s',
            '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 30px rgba(34,197,94,0.15)' }
          }}
        >
          <Typography variant="overline" sx={{ color: '#16a34a', fontWeight: 'bold', fontSize: '0.9rem' }}>{h.año}</Typography>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b', mt: 0.5 }}>{h.titulo}</Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 1, fontSize: '1rem' }}>{h.descripcion}</Typography>
        </Box>
      </motion.div>
    ))}
  </Box>
);

const QuienesSomos = () => {
  const navigate = useNavigate();
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
    <Box sx={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#f8fcf9', minHeight: '100vh', pb: 0 }}>
      {/* Hero Premium */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '60vh', md: '75vh' },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url(${empresaImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            zIndex: 0,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to bottom, rgba(15,23,42,0.7), rgba(15,23,42,0.4))',
            zIndex: 1,
          }
        }}
      >
        <Container sx={{ position: 'relative', zIndex: 2, textAlign: 'center', color: '#fff', px: 2 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2rem', md: '3.5rem' }, textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
              Eat & Run
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 400, mb: 4, maxWidth: '800px', mx: 'auto', opacity: 0.9, lineHeight: 1.5, fontSize: { xs: '1rem', md: '1.2rem' } }}>
              Alimentarte bien es quererte mejor. Llevamos menús saludables, frescos y ricos directo a tu mesa.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/registro')}
                endIcon={<FaArrowRight />}
                sx={{
                  backgroundColor: '#22c55e',
                  color: 'white',
                  px: { xs: 3, md: 5 },
                  py: 1.5,
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  fontWeight: 'bold',
                  borderRadius: 50,
                  textTransform: 'none',
                  boxShadow: '0 8px 25px rgba(34,197,94,0.4)',
                  '&:hover': {
                    backgroundColor: '#16a34a',
                    transform: 'scale(1.05)',
                    boxShadow: '0 12px 30px rgba(34,197,94,0.6)',
                  },
                  transition: 'all 0.3s'
                }}
              >
                Registrarme Ahora
              </Button>
              <Button
                variant="outlined"
                size="large"
                href="https://wa.me/5492614601788"
                target="_blank"
                startIcon={<FaWhatsapp />}
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  px: { xs: 3, md: 5 },
                  py: 1.5,
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  fontWeight: 'bold',
                  borderRadius: 50,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: 'white',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.3s'
                }}
              >
                Contactanos
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      <Container sx={{ py: { xs: 8, md: 12 } }}>
        {/* Presentación */}
        <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 12 }, maxWidth: '800px', mx: 'auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#dcfce7', px: 2, py: 1, borderRadius: 50, mb: 3 }}>
              <FaLeaf style={{ color: '#16a34a', marginRight: 8 }} />
              <Typography sx={{ color: '#16a34a', fontWeight: 'bold', fontSize: '0.9rem' }}>NUESTRA MISIÓN</Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#1e293b', mb: 3, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
              Comida saludable, rica y profesional
            </Typography>
            <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 400, lineHeight: 1.6, fontSize: { xs: '1rem', md: '1.1rem' } }}>
              Somos una empresa mendocina dedicada a ofrecer soluciones gastronómicas. Nuestro objetivo es mejorar la calidad de vida de las personas a través de la alimentación consciente y constante.
            </Typography>
          </motion.div>
        </Box>

        {/* Planta Elaboradora */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', md: 'row' }, gap: { xs: 6, md: 8 }, alignItems: 'center', mb: { xs: 10, md: 15 } }}>
          <Box sx={{ flex: 1 }}>
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ backgroundColor: '#f0fdf4', p: 1.5, borderRadius: 3, mr: 2 }}>
                  <FaWarehouse size={24} color="#22c55e" />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>Planta propia</Typography>
              </Box>
              <Typography variant="body1" sx={{ color: '#475569', fontSize: '1.1rem', lineHeight: 1.7, mb: 3 }}>
                Ubicada en Paso de los Andes 25, Ciudad, nuestra planta está equipada con tecnología de punta, cámaras de frío y un sistema de logística propia. Controlamos cada paso del proceso para asegurarnos de que todo llegue a tus manos fresco y puntual.
              </Typography>
            </motion.div>
          </Box>
          <Box sx={{ flex: 1 }}>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}>
              <Box sx={{ position: 'relative', borderRadius: 6, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', maxWidth: '400px', mx: 'auto' }}>
                <Box component="img" src={plantaImg} alt="Planta Elaboradora" sx={{ width: '100%', display: 'block', transition: 'transform 0.5s', '&:hover': { transform: 'scale(1.05)' } }} />
                <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', height: '40%' }} />
              </Box>
            </motion.div>
          </Box>
        </Box>

        {/* Supervisión Nutricional */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', md: 'row-reverse' }, gap: { xs: 6, md: 8 }, alignItems: 'center', mb: { xs: 10, md: 15 } }}>
          <Box sx={{ flex: 1 }}>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ backgroundColor: '#eff6ff', p: 1.5, borderRadius: 3, mr: 2 }}>
                  <FaUserMd size={24} color="#3b82f6" />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>Supervisión nutricional</Typography>
              </Box>
              <Typography variant="body1" sx={{ color: '#475569', fontSize: '1.1rem', lineHeight: 1.7, mb: 3 }}>
                No solo cocinamos, planificamos. Todos nuestros menús son diseñados y supervisados por profesionales de la nutrición para garantizar un balance perfecto, un aporte calórico ideal y la mejor calidad de ingredientes.
              </Typography>
            </motion.div>
          </Box>
          <Box sx={{ flex: 1 }}>
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}>
              <Box sx={{ position: 'relative', borderRadius: 6, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', maxWidth: '400px', mx: 'auto' }}>
                <Box component="img" src={nutricionImg} alt="Nutrición" sx={{ width: '100%', display: 'block', transition: 'transform 0.5s', '&:hover': { transform: 'scale(1.05)' } }} />
              </Box>
            </motion.div>
          </Box>
        </Box>

        {/* Timeline */}
        <Box sx={{ mb: { xs: 10, md: 15 } }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', textAlign: 'center', mb: 6 }}>
            Nuestra Historia
          </Typography>
          <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
            <Timeline />
          </Box>
        </Box>

        {/* Logos animados */}
        <Box sx={{ overflow: 'hidden', mb: { xs: 8, md: 12 } }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', textAlign: 'center', mb: 2 }}>
            Empresas que confían
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', textAlign: 'center', mb: 6, maxWidth: '600px', mx: 'auto' }}>
            Acompañamos el día a día de decenas de instituciones y empresas con nuestra gastronomía.
          </Typography>
          <Box
            onMouseEnter={stopScroll}
            onMouseLeave={startScroll}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0, top: 0, bottom: 0,
                width: '100px',
                background: 'linear-gradient(to right, #f8fcf9, transparent)',
                zIndex: 2,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                right: 0, top: 0, bottom: 0,
                width: '100px',
                background: 'linear-gradient(to left, #f8fcf9, transparent)',
                zIndex: 2,
              }
            }}
          >
            <motion.div
              animate={controls}
              style={{
                display: 'inline-flex',
                gap: '40px',
                padding: '20px 0',
                alignItems: 'center',
              }}
            >
              {[...logos, ...logos].map((logo, i) => (
                <Paper
                  key={i}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    minWidth: 150,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 90,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                      borderColor: '#cbd5e1'
                    }
                  }}
                >
                  <img />
                </Paper>
              ))}
            </motion.div>
          </Box>
        </Box>
      </Container>

      {/* CTA Section */}
      <Box sx={{ backgroundColor: '#1e293b', color: '#fff', py: { xs: 6, md: 8 }, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
            ¿Querés empezar a comer mejor?
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 400, color: '#cbd5e1', mb: 5, lineHeight: 1.6, fontSize: { xs: '1rem', md: '1.1rem' } }}>
            Sumate a nuestra plataforma, mirá nuestros menús semanales y recibí tu almuerzo listo para disfrutar.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/registro')}
            sx={{
              backgroundColor: '#22c55e',
              color: 'white',
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              borderRadius: 50,
              textTransform: 'none',
              boxShadow: '0 8px 25px rgba(34,197,94,0.3)',
              '&:hover': {
                backgroundColor: '#16a34a',
                transform: 'scale(1.05)',
                boxShadow: '0 12px 30px rgba(34,197,94,0.5)',
              },
              transition: 'all 0.3s'
            }}
          >
            Crear mi Cuenta Gratis
          </Button>
        </Container>
      </Box>

      {/* Footer minimalista extra (si querés dejarlo) */}
      <Box sx={{ textAlign: 'center', py: 4, backgroundColor: '#0f172a' }}>
        <img />
        <Typography variant="body2" sx={{ color: '#94a3b8', mb: 1 }}>
          Eat & Run - Healthy Food 🍃
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
          <InstagramIcon sx={{ color: '#E1306C', fontSize: '1.2rem' }} />
          <Link
            href="https://www.instagram.com/eatandrun.mza/"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{ fontWeight: 500, color: '#94a3b8', fontSize: '0.9rem', '&:hover': { color: '#fff' } }}
          >
            @eatandrun.mza
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default QuienesSomos;
