import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, Divider } from '@mui/material';

const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

const AdminMenuPreview = () => {
  const [menuFijo, setMenuFijo] = useState({ usuario: [], empresa: [] });
  const [menuEspecial, setMenuEspecial] = useState([]);
  const [error, setError] = useState(null);

  const fetchMenus = async () => {
    try {
      const token = localStorage.getItem('authToken');

      // Fijos por rol
      const [resUsuario, resEmpresa] = await Promise.all([
        fetch('http://localhost:4000/api/menu/fixed/by-role?role=usuario', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:4000/api/menu/fixed/by-role?role=empresa', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const dataUsuario = await resUsuario.json();
      const dataEmpresa = await resEmpresa.json();

      // Especiales (sin filtro)
      const resEspecial = await fetch('http://localhost:4000/api/menu/daily/all', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const dataEspecial = await resEspecial.json();

      setMenuFijo({ usuario: dataUsuario, empresa: dataEmpresa });
      setMenuEspecial(dataEspecial);
    } catch (err) {
      console.error('❌ Error cargando menús:', err);
      setError('No se pudieron cargar los menús');
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const agruparPorDia = (platos) => {
    const agrupado = {
      lunes: [], martes: [], miercoles: [], jueves: [], viernes: []
    };

    platos.forEach(p => {
      const fecha = new Date(p.date);
      const dia = fecha.getDay();
      const map = { 1: 'lunes', 2: 'martes', 3: 'miercoles', 4: 'jueves', 5: 'viernes' };
      const diaTexto = map[dia];
      if (diaTexto) {
        agrupado[diaTexto].push(p);
      }
    });

    return agrupado;
  };

  const menuEspecialPorDia = agruparPorDia(menuEspecial);

  const renderPlato = (plato) => (
    <Card sx={{ display: 'flex', mb: 2 }} key={plato.id}>
      {plato.image_url && (
        <CardMedia component="img" sx={{ width: 120 }} image={plato.image_url} alt={plato.name} />
      )}
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold">{plato.name || plato.nombre}</Typography>
        <Typography variant="body2">{plato.description || plato.descripcion}</Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>📋 Vista previa del Menú Semanal</Typography>

      {error && <Typography color="error">{error}</Typography>}

      {dias.map(dia => (
        <Box key={dia} sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>{dia.charAt(0).toUpperCase() + dia.slice(1)}</Typography>
          <Divider sx={{ mb: 2 }} />

          <Typography variant="subtitle1" color="primary">👤 Fijos Usuario</Typography>
          <Grid container spacing={1}>
            {menuFijo.usuario.map(renderPlato)}
          </Grid>

          <Typography variant="subtitle1" color="primary" sx={{ mt: 2 }}>🏢 Fijos Empresa</Typography>
          <Grid container spacing={1}>
            {menuFijo.empresa.map(renderPlato)}
          </Grid>

          <Typography variant="subtitle1" color="secondary" sx={{ mt: 2 }}>⭐ Especiales</Typography>
          <Grid container spacing={1}>
            {(menuEspecialPorDia[dia] || []).map(renderPlato)}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};

export default AdminMenuPreview;
