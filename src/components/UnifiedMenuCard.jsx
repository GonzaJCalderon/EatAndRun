import React from 'react';
import { Card, CardContent, Typography, IconButton, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const UnifiedMenuCard = ({ plato, cantidad, onChange }) => {
  const aumentar = () => onChange(plato, cantidad + 1);
  const disminuir = () => onChange(plato, Math.max(0, cantidad - 1));

  return (
    <Card sx={{ width: 250 }}>
      <img src={plato.img} alt={plato.nombre} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
      <CardContent>
        <Typography variant="h6" noWrap>{plato.nombre}</Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {plato.descripcion}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <IconButton onClick={disminuir}><RemoveIcon /></IconButton>
          <Typography sx={{ mx: 1 }}>{cantidad}</Typography>
          <IconButton onClick={aumentar}><AddIcon /></IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UnifiedMenuCard;
