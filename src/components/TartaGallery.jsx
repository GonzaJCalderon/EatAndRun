import React, { useState, useEffect, useRef } from 'react';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import api from '../api/api';
import { setTartaLabelMap } from '../utils/tartaUtils';

const TartaGallery = ({ seleccionadas = {}, onChange }) => {
  const [tartas, setTartas] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef(null); // 👈 ref para scroll manual con flechas

  useEffect(() => {
    const fetchTartas = async () => {
      try {
        const res = await api.get('/tartas');
        const data = Array.isArray(res.data) ? res.data : [];
        setTartas(data);
        setTartaLabelMap(data);

        console.log(`🥧 Tartas cargadas desde el backend: ${data.length}`, data);
      } catch (err) {
        console.error('❌ Error al cargar tartas:', err);
      }
    };

    fetchTartas();
  }, []);

  const handleCantidadChange = (key, cantidad) => {
    if (cantidad < 0) return;
    onChange({ ...seleccionadas, [key]: cantidad });
  };

  const tartasValidas = tartas.filter(t => t.key && t.nombre);
  console.log("🔎 Todas las tartas:", tartas);
  console.log("✅ Tartas válidas:", tartasValidas);

  const scrollBy = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (!tartasValidas.length) return null;

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, px: 1 }}>
        🥧 Tartas (8 porciones)
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(auto-fill, minmax(200px, 1fr))'
          },
          gap: 2,
          justifyContent: 'center',
          alignItems: 'stretch',
          px: 1,
          pb: 2,
        }}
      >
        {tartasValidas.map((tarta) => {
          const cantidad = seleccionadas[tarta.key] || 0;
          const isSelected = cantidad > 0;
          return (
            <Card 
              key={tarta.key}
              sx={{ 
                p: 0, 
                borderRadius: 4, 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: isSelected ? '0 8px 20px rgba(34, 197, 94, 0.25)' : '0 4px 12px rgba(0,0,0,0.06)',
                border: isSelected ? '2px solid #22c55e' : '2px solid transparent',
                transition: 'all 0.2s',
                overflow: 'hidden'
              }}
            >
              <Box
                component="img"
                src={tarta.img}
                alt={tarta.nombre}
                sx={{
                  width: '100%',
                  height: 110,
                  objectFit: 'cover',
                  borderBottom: '1px solid #f1f5f9'
                }}
              />
              <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#1e293b', mb: 0.5 }}>
                  {tarta.nombre}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1, mb: 1 }}>
                  {tarta.descripcion}
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    backgroundColor: isSelected ? '#22c55e' : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#334155',
                    borderRadius: 8,
                    p: 0.5,
                    mt: 'auto'
                  }}
                >
                  <IconButton 
                    onClick={() => handleCantidadChange(tarta.key, cantidad - 1)} 
                    size="small"
                    disabled={!isSelected}
                    sx={{ color: isSelected ? '#ffffff' : 'inherit', p: '4px' }}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {cantidad > 0 ? cantidad : 'Add'}
                  </Typography>
                  <IconButton 
                    onClick={() => handleCantidadChange(tarta.key, cantidad + 1)} 
                    size="small"
                    sx={{ color: isSelected ? '#ffffff' : 'inherit', p: '4px' }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default TartaGallery;
