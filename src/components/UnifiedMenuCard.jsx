import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import StarOutlineIcon from '@mui/icons-material/StarOutline';

const UnifiedMenuCard = ({ plato, cantidad = 0, onChange }) => {
  const aumentar = () => onChange(plato, cantidad + 1);
  const disminuir = () => onChange(plato, Math.max(0, cantidad - 1));

  const esEspecial = plato?.tipo === 'daily';

  const imagenEspecial = 'https://res.cloudinary.com/dwiga4jg8/image/upload/v1752866539/menu_especial_wqo6fw.png';

  // ✅ Usar imagen propia si existe, si no la especial
  const imagenFinal =
    typeof plato?.img === 'string' && plato.img.trim().length > 10
      ? plato.img
      : (esEspecial ? imagenEspecial : null);

  return (
    <Card
      sx={{
        width: 160,
        height: 230,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 2,
        boxShadow: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Imagen */}
      {imagenFinal ? (
        <Box sx={{ position: 'relative', width: '100%', height: 100 }}>
          <Box
            component="img"
            src={imagenFinal}
            alt={plato.nombre}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '8px 8px 0 0',
            }}
          />
          {/* {esEspecial && (
            <Chip
              label="Menú Especial"
              size="small"
              color="success"
              icon={<StarOutlineIcon fontSize="small" />}
              sx={{
                position: 'absolute',
                top: 6,
                left: 6,
                fontSize: '0.65rem',
                padding: '0 4px',
                backgroundColor: '#1ba830ff',
                color: 'white',
              }}
            />
          )} */}
        </Box>
      ) : (
        <Box
          sx={{
            width: '100%',
            height: 100,
            backgroundColor: '#fef4e7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px 8px 0 0',
            borderBottom: '1px solid #e0e0e0',
            position: 'relative',
          }}
        >
          {/* <Box sx={{ textAlign: 'center' }}>
            <StarOutlineIcon fontSize="small" sx={{ color: '#ffff1fff', mb: 0.5 }} />
            <Typography
              variant="caption"
              sx={{
                color: '#1ba830ff',
                fontWeight: 600,
                letterSpacing: 0.3,
                fontSize: '0.75rem',
              }}
            >
              Menú Especial
            </Typography>
          </Box> */}
        </Box>
      )}

      {/* Contenido del card */}
      <CardContent sx={{ p: 1, flexGrow: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            lineHeight: '1.2em',
            whiteSpace: 'normal',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            mb: 0.5,
          }}
        >
          {plato?.nombre || 'Sin nombre'}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: '2.2em',
          }}
        >
          {plato?.descripcion || 'Sin descripción'}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <IconButton size="small" onClick={disminuir} disabled={cantidad === 0}>
            <RemoveIcon fontSize="small" />
          </IconButton>
          <Typography sx={{ mx: 1 }}>{cantidad}</Typography>
          <IconButton size="small" onClick={aumentar}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UnifiedMenuCard;
