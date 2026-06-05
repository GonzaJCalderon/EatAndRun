// src/pages/EditarPrecios.jsx
import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Divider
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from '../api/api';
import { getTartaPrecios } from '../utils/getTartaPrecios';

const EditarPrecios = () => {
  const [preciosBase, setPreciosBase] = useState({
    plato: 6300,
    envio: 900,
    postre: 2800,
    ensalada: 2800,
    proteina: 3500,
    descuento_por_plato: 200,
    umbral_descuento: 5
  });

  const [preciosTarta, setPreciosTarta] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const configRes = await api.get('/config/precios');
        setPreciosBase(configRes.data);
        localStorage.setItem('precios_eatandrun', JSON.stringify(configRes.data));

        const tartas = await getTartaPrecios();
        setPreciosTarta(tartas);
      } catch (err) {
        console.error("❌ Error al cargar datos:", err);
      }
    };

    fetchData();
  }, []);

  const handleBaseChange = (campo, valor) => {
    setPreciosBase((prev) => ({
      ...prev,
      [campo]: parseInt(valor) || 0
    }));
  };

  const handleTartaChange = (id, valor) => {
    setPreciosTarta((prev) => ({
      ...prev,
      [id]: { ...prev[id], precio: parseInt(valor) || 0 }
    }));
  };

  const guardar = async () => {
    try {
      // Guardar precios base
      await api.put('/config/precios', preciosBase);
      localStorage.setItem("precios_eatandrun", JSON.stringify(preciosBase));

      // Guardar precios de tartas
      for (const id in preciosTarta) {
        await api.put(`/tartas/${id}`, { precio: preciosTarta[id].precio });
      }

      alert("✅ Datos actualizados correctamente");
    } catch (err) {
      alert("❌ Error al guardar en backend");
      console.error(err);
    }
  };

  return (
    <Container sx={{ mt: 4, pb: 6 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => window.location.href = "/admin"}
        sx={{ mb: 3 }}
      >
        Volver al Admin
      </Button>

      <Typography variant="h4" gutterBottom>
        ⚙️ Configuración Global de Precios
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 4, mb: 4 }}>
        {[
          'plato',
          'envio',
          'tarta',
          'postre',
          'ensalada',
          'proteina',
          'descuento_por_plato',
          'umbral_descuento'
        ].map((key) => {
          if (preciosBase[key] === undefined) return null;
          return (
            <TextField
              key={key}
              label={key.replace(/_/g, ' ').toUpperCase()}
              type="number"
              value={preciosBase[key]}
              onChange={(e) => handleBaseChange(key, e.target.value)}
              sx={{ minWidth: 180 }}
            />
          );
        })}
        <Button variant="contained" color="success" onClick={guardar} sx={{ alignSelf: 'center', height: '56px' }}>
          Guardar Precios
        </Button>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6">
        🥧 Precios por Tarta
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
        {Object.entries(preciosTarta).map(([id, tarta]) => (
          <TextField
            key={id}
            label={`TARTA: ${tarta.nombre ? tarta.nombre.toUpperCase() : 'DESCONOCIDA'}`}
            type="number"
            value={tarta.precio}
            onChange={(e) => handleTartaChange(id, e.target.value)}
            sx={{ minWidth: 180 }}
          />
        ))}
      </Box>
    </Container>
  );
};

export default EditarPrecios;
