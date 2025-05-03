import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const EditarPrecios = () => {
  const [precios, setPrecios] = useState({
    plato: 6300,
    envio: 900,
    postre: 2800,
    ensalada: 2800,
    proteina: 3500,
    tarta: 13500,
  });

  useEffect(() => {
    const guardado = localStorage.getItem("precios_eatandrun");
    if (guardado) {
      setPrecios(JSON.parse(guardado));
    }
  }, []);

  const handleChange = (campo, valor) => {
    setPrecios((prev) => ({
      ...prev,
      [campo]: parseInt(valor)
    }));
  };

  const guardar = () => {
    localStorage.setItem("precios_eatandrun", JSON.stringify(precios));
    alert("✅ Precios actualizados correctamente");
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

      {Object.entries(precios).map(([key, value]) => (
        <Box key={key} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            type="number"
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        </Box>
      ))}

      <Button variant="contained" color="primary" onClick={guardar} fullWidth sx={{ mt: 3 }}>
        Guardar cambios
      </Button>
    </Container>
  );
};

export default EditarPrecios;
