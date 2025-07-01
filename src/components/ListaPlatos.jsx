import React, { useMemo } from 'react';
import { Typography, Box, Card, CardContent, Grid, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const ListaPlatos = ({ platosCreados, busquedaNombre, filtroDesde, filtroHasta, handleEditar, handleEliminar }) => {
  const platosAgrupados = useMemo(() => {
    return Array.from(
      platosCreados
        .filter(plato => {
          const matchNombre = plato.name.toLowerCase().includes(busquedaNombre.toLowerCase());
          const matchDesde = !filtroDesde || new Date(plato.date) >= new Date(filtroDesde);
          const matchHasta = !filtroHasta || new Date(plato.date) <= new Date(filtroHasta);
          return matchNombre && matchDesde && matchHasta;
        })
        .reduce((acc, plato) => {
          const fecha = new Date(plato.date);
          const diaSemana = fecha.toLocaleDateString('es-AR', { weekday: 'long' });
          const fechaLegible = fecha.toLocaleDateString('es-AR');
          const titulo = `${capitalize(diaSemana)} ${fechaLegible}`;
          if (!acc.has(titulo)) acc.set(titulo, []);
          acc.get(titulo).push(plato);
          return acc;
        }, new Map())
    );
  }, [platosCreados, busquedaNombre, filtroDesde, filtroHasta]);

  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="h5" gutterBottom>📋 Platos del día creados</Typography>
      {platosAgrupados.length === 0 ? (
        <Typography variant="body2">Aún no hay platos registrados.</Typography>
      ) : (
        platosAgrupados.map(([fecha, platosDelDia]) => (
          <Box key={fecha} sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              🗓️ {fecha}
            </Typography>
            {platosDelDia.map((plato) => (
              <Card key={plato.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      {plato.image_url && (
                        <img
                          src={plato.image_url}
                          alt={plato.name}
                          style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8 }}
                        />
                      )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6">{plato.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {plato.description}
                      </Typography>
                      <Typography>👥 Rol: {plato.for_role}</Typography>
                    </Grid>
                    <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<EditIcon />}
                        onClick={() => handleEditar(plato)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        startIcon={<DeleteIcon />}
                        onClick={() => handleEliminar(plato.id)}
                      >
                        Eliminar
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
        ))
      )}
    </Box>
  );
};

export default ListaPlatos;
