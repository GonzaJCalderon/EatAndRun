import { Box, Typography } from '@mui/material';

const ResumenVisualPorDia = ({ pedidos }) => {
  if (!Array.isArray(pedidos) || pedidos.length === 0) {
    return <Typography>No hay pedidos para mostrar.</Typography>;
  }

  const agrupado = {};

  pedidos.forEach(p => {
    p.platos.forEach(plato => {
      const nombre = plato.nombre;
      if (!agrupado[nombre]) agrupado[nombre] = [];
      agrupado[nombre].push({ nombre: p.nombreCompleto, cantidad: plato.cantidad });
    });
  });

  const platos = Object.keys(agrupado);
  const mitad = Math.ceil(platos.length / 2);
  const col1 = platos.slice(0, mitad);
  const col2 = platos.slice(mitad);

  const renderColumna = (lista) => (
    <Box sx={{ flex: 1, pr: 2 }}>
      {lista.map(nombre => (
        <Box key={nombre} sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', background: '#ffe0b2', px: 1 }}>{nombre}</Typography>
          {agrupado[nombre].map((p, i) => (
            <Typography key={i} sx={{ pl: 2 }}>• {p.nombre}</Typography>
          ))}
          <Typography sx={{ fontWeight: 'bold', mt: 1, pl: 2 }}>
            TOTAL: {agrupado[nombre].reduce((a, b) => a + b.cantidad, 0)}
          </Typography>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
      {renderColumna(col1)}
      {renderColumna(col2)}
    </Box>
  );
};

export default ResumenVisualPorDia;
