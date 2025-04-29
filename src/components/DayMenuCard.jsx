import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Box
} from '@mui/material';
import { motion } from 'framer-motion';
import { getPlatoKey } from '../utils/helpers'; // Asegurate de tener este helper bien hecho

const DayMenuCard = ({ day, options, selected, onSelect }) => {

  const handleCantidadChange = (platoObj, cantidad) => {
    const cantidadNum = parseInt(cantidad);
    if (isNaN(cantidadNum) || cantidadNum < 0) return;

    const platoKey = getPlatoKey(platoObj);
    const newSelection = { ...selected };

    if (cantidadNum === 0) {
      delete newSelection[platoKey];
    } else {
      newSelection[platoKey] = {
        cantidad: cantidadNum,
        descripcion: platoObj.descripcion || '',
        nombreOriginal: platoObj.nombre // 👈 Guardamos el nombre visible real
      };
    }

    onSelect(day, newSelection);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <Card
        sx={{
          mb: 5,
          p: 2,
          borderRadius: 5,
          background: '#ffffff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        }}
      >
        <Typography
          variant="h6"
          textAlign="center"
          sx={{ mb: 3, color: "#333", fontWeight: 'bold' }}
        >
          📅 {day.toUpperCase()}
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr 1fr',
              lg: 'repeat(auto-fit, minmax(240px, 1fr))'
            },
            gap: 3
          }}
        >
          {options.map((plato, index) => {
            const platoKey = getPlatoKey(plato);
            const cantidadSeleccionada = selected?.[platoKey]?.cantidad || '';

            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Card
                  sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: '#fafafa',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    p: 1
                  }}
                >
                  <Box
                    component="img"
                    src={plato.img || 'https://source.unsplash.com/300x200/?food'}
                    alt={plato.nombre}
                    sx={{
                      width: '100%',
                      height: 160,
                      objectFit: 'cover',
                      borderRadius: 3,
                      mb: 1
                    }}
                  />

                  <Box
                    sx={{
                      minHeight: 80,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      px: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: '100%',
                      }}
                    >
                      {plato.nombre}
                    </Typography>

                    {plato.descripcion && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: '0.8rem',
                          mt: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {plato.descripcion}
                      </Typography>
                    )}
                  </Box>

                  <TextField
                    type="number"
                    size="small"
                    variant="outlined"
                    placeholder="Cant"
                    inputProps={{ min: 0 }}
                    value={cantidadSeleccionada}
                    onChange={(e) => handleCantidadChange(plato, e.target.value)}
                    sx={{
                      width: '80px',
                      mt: 1,
                      mb: 1
                    }}
                  />
                </Card>
              </motion.div>
            );
          })}
        </Box>
      </Card>
    </motion.div>
  );
};

export default DayMenuCard;
