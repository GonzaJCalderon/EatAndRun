import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

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

  const isSelected = cantidad > 0;

  return (
    <Card
      sx={{
        width: { xs: 150, sm: 170 }, // Slightly adaptive width
        height: '100%',
        minHeight: 240,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 4, // Softer corners
        boxShadow: isSelected 
          ? '0 8px 20px rgba(34, 197, 94, 0.25)' 
          : '0 4px 12px rgba(0,0,0,0.06)',
        border: isSelected ? '2px solid #22c55e' : '2px solid transparent',
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        '&:active': { transform: 'scale(0.98)' }
      }}
      onClick={(e) => {
        // Allow clicking the card itself to add 1 if not selected
        if (!isSelected && e.target.tagName !== 'svg' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'path') {
          aumentar();
        }
      }}
    >
      {/* Imagen */}
      {imagenFinal ? (
        <Box sx={{ position: 'relative', width: '100%', height: 110 }}>
          <Box
            component="img"
            src={imagenFinal}
            alt={plato.nombre}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderBottom: '1px solid #f1f5f9'
            }}
          />
        </Box>
      ) : (
        <Box
          sx={{
            width: '100%',
            height: 110,
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #e2e8f0',
          }}
        />
      )}

      {/* Contenido del card */}
      <CardContent sx={{ p: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            lineHeight: '1.2em',
            color: '#1e293b',
            mb: 0.5,
          }}
        >
          {plato?.nombre || 'Sin nombre'}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            mb: 1,
            flexGrow: 1
          }}
        >
          {plato?.descripcion || 'Sin descripción'}
        </Typography>

        {/* Counter UI - UberEats Style Pill */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 'auto',
            backgroundColor: isSelected ? '#22c55e' : '#f1f5f9',
            color: isSelected ? '#ffffff' : '#334155',
            borderRadius: 8,
            px: 0.5,
            py: 0.5,
            transition: 'background-color 0.2s',
          }}
          onClick={(e) => e.stopPropagation()} // Prevent card click event here
        >
          <IconButton 
            size="small" 
            onClick={disminuir} 
            disabled={!isSelected}
            sx={{ 
              color: isSelected ? '#ffffff' : 'inherit',
              padding: '4px',
              '&.Mui-disabled': { color: '#94a3b8' }
            }}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
          
          <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem', minWidth: '20px', textAlign: 'center' }}>
            {cantidad > 0 ? cantidad : 'Add'}
          </Typography>
          
          <IconButton 
            size="small" 
            onClick={aumentar}
            sx={{ 
              color: isSelected ? '#ffffff' : 'inherit',
              padding: '4px'
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UnifiedMenuCard;
