// src/components/TartaGallery.jsx
import React from 'react';
import {
  Card,
  Typography,
  Box,
  IconButton,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { motion } from 'framer-motion';

const tartas = [
  {
    key: 'jamonqueso',
    nombre: 'Jamón y Queso',
    descripcion: 'Clásica y deliciosa.',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnYwz0tnYeAVCIY2lgvAT74k4JI_sY7589xg&s'
  },
  {
    key: 'verduras',
    nombre: 'Verduras',
    descripcion: 'Colorida, saludable y rica.',
    img: 'https://media.tycsports.com/files/2024/07/08/739758/tarta-de-verdura_862x485.webp'
  },
  {
    key: 'acelga',
    nombre: 'Acelga',
    descripcion: 'La opción verde, fresca y casera.',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJMGXstZJ_CRcZ1iQTHd8YjEtv8rPc_UHu0g&s'
  },
  {
    key: 'capresse',
    nombre: 'Capresse',
    descripcion: 'Tomate, albahaca y muzza. Simplemente genial.',
    img: 'https://www.lasaltena.com.ar/wp-content/uploads/2020/03/Tarta-caprese_banner-400x196.png.webp'
  },
  {
    key: 'pollo',
    nombre: 'Pollo',
    descripcion: 'Súper sabrosa y bien cargada.',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLy8mYRLS32pHUIp_E-TyTPsCCI1LyqxVRug&s'
  }
];


// 🔁 Mapa para reutilizar el nombre real (para backend, PDF, etc.)
export const tartaLabelMap = tartas.reduce((acc, tarta) => {
  acc[tarta.key] = tarta.nombre;
  return acc;
}, {});

const TartaGallery = ({ seleccionadas = {}, onChange }) => {
  const handleCantidadChange = (key, cantidad) => {
    if (cantidad < 0) return;

    const actualizadas = {
      ...seleccionadas,
      [key]: cantidad
    };

    onChange?.(actualizadas);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
       <Typography variant="h6" fontWeight="bold" textAlign="center">
  🍰 Tartas (8 porciones): $13.500 c/u
</Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 2,
            mt: 3
          }}
        >
          {tartas.map((tarta) => {
            const cantidad = seleccionadas[tarta.key] || 0;

            return (
              <motion.div key={tarta.key} whileHover={{ scale: 1.03 }}>
                <Card
                  sx={{
                    width: 220,
                    p: 2,
                    textAlign: 'center',
                    borderRadius: 4,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                  }}
                >
                  <Box
                    component="img"
                    src={tarta.img}
                    alt={tarta.nombre}
                    sx={{
                      width: '100%',
                      height: 130,
                      objectFit: 'cover',
                      borderRadius: 3,
                      mb: 1
                    }}
                  />
                  <Typography variant="subtitle1" fontWeight="bold">
                    {tarta.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {tarta.descripcion}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <IconButton onClick={() => handleCantidadChange(tarta.key, cantidad - 1)} size="small">
                      <RemoveIcon />
                    </IconButton>
                    <Typography variant="body1" sx={{ mx: 2 }}>
                      {cantidad}
                    </Typography>
                    <IconButton onClick={() => handleCantidadChange(tarta.key, cantidad + 1)} size="small">
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Card>
              </motion.div>
            );
          })}
        </Box>
      </motion.div>
    </Box>
  );
};

export default TartaGallery;
