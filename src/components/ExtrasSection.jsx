// src/components/ExtrasSection.jsx
import React from 'react';
import { Typography, Box, TextField, Paper } from '@mui/material';
import { motion } from 'framer-motion';

const EXTRAS = [
  { key: 1, label: '🍰 Postre', precio: 2800 },
  { key: 2, label: '🥗 Ensalada', precio: 2800 },
  { key: 3, label: '💪 Proteína', precio: 3500 }
];

const ExtrasSection = ({ dia, selectedGlobal, onSelect }) => {
  const selected = selectedGlobal[dia] || {};

 const handleChange = (key, precio, value) => {
  const cantidad = parseInt(value);
  if (isNaN(cantidad) || cantidad < 0) return;

  const current = { ...selected };

  const itemKey = `extra-${key}`;

  if (cantidad === 0) {
    delete current[itemKey];
  } else {
    current[itemKey] = {
      id: key,
      tipo: 'extra',
      cantidad,
      precio
    };
  }

  const nuevoEstado = {
    ...selectedGlobal,
    [dia]: current
  };

  onSelect(nuevoEstado);
};


  return (
    <Box sx={{ mt: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        viewport={{ once: true }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          gutterBottom
          sx={{ textAlign: 'center' }}
        >
          ➕ Extras para el día: <strong>{dia?.toUpperCase()}</strong>
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 2,
            mt: 2
          }}
        >
          {EXTRAS.map((extra) => (
            <motion.div
              key={extra.key}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Paper
                elevation={3}
                sx={{
                  px: 2,
                  py: 2,
                  minWidth: { xs: '120px', sm: '140px' },
                  textAlign: 'center',
                  borderRadius: 3,
                  backgroundColor: '#fdfdfd',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  {extra.label}
                </Typography>

              <TextField
  type="number"
  size="small"
  inputProps={{ min: 0 }}
  value={selected?.[`extra-${extra.key}`]?.cantidad || ''}
  onChange={(e) =>
    handleChange(extra.key, extra.precio, e.target.value)
  }
  sx={{ mt: 1, width: '70px' }}
/>


                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 1 }}
                >
                  ${extra.precio}
                </Typography>
              </Paper>
            </motion.div>
          ))}
        </Box>
      </motion.div>
    </Box>
  );
};

export default ExtrasSection;
