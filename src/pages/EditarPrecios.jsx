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

  const [preciosTarta, setPreciosTarta] = useState([]); // ahora es un array

  useEffect(() => {
    const fetchData = async () => {
      try {
        const configRes = await api.get('/config/precios');
        setPreciosBase(configRes.data);
        localStorage.setItem('precios_eatandrun', JSON.stringify(configRes.data));

        const tartas = await getTartaPrecios(); // debe incluir id, nombre, precio
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

  const handleTartaChange = (index, valor) => {
    const nuevoPrecio = parseInt(valor) || 0;
    setPreciosTarta(prev => {
      const copia = [...prev];
      copia[index].precio = nuevoPrecio;
      return copia;
    });
  };

  const guardar = async () => {
    try {
      // Guardar precios base
      await api.put('/config/precios', preciosBase);
      localStorage.setItem("precios_eatandrun", JSON.stringify(preciosBase));

      // Guardar precios de tartas
      for (const tarta of preciosTarta) {
        await api.put(`/tartas/${tarta.id}`, { precio: tarta.precio });
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
        💰 Editar Precios
      </Typography>

      <Typography variant="h6" sx={{ mt: 3 }}>
        ⚙️ Configuración de Descuentos
      </Typography>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Umbral para Descuento (mín. platos)"
          type="number"
          value={preciosBase.umbral_descuento}
          onChange={(e) => handleBaseChange('umbral_descuento', e.target.value)}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Descuento por Plato ($)"
          type="number"
          value={preciosBase.descuento_por_plato}
          onChange={(e) => handleBaseChange('descuento_por_plato', e.target.value)}
        />
      </Box>

      <Typography variant="h6" sx={{ mt: 3 }}>
        💸 Precios Base
      </Typography>

      {Object.entries(preciosBase)
        .filter(([key]) => !['descuento_por_plato', 'umbral_descuento'].includes(key))
        .map(([key, value]) => (
          <Box key={key} sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              type="number"
              value={value}
              onChange={(e) => handleBaseChange(key, e.target.value)}
            />
          </Box>
        ))}

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6">
        🥧 Precios por Tarta
      </Typography>

      {preciosTarta.map((tarta, index) => (
        <Box key={tarta.id} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label={`Tarta: ${tarta.nombre}`}
            type="number"
            value={tarta.precio}
            onChange={(e) => handleTartaChange(index, e.target.value)}
          />
        </Box>
      ))}

      <Button
        variant="contained"
        color="primary"
        onClick={guardar}
        fullWidth
        sx={{ mt: 3 }}
      >
        Guardar cambios
      </Button>
    </Container>
  );
};

export default EditarPrecios;
