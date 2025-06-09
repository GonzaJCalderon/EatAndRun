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
  const [tartas, setTartas] = useState([
    {
      key: 'jamonqueso',
      nombre: 'Jamón y Queso',
      descripcion: 'Clásica y deliciosa.',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnYwz0tnYeAVCIY2lgvAT74k4JI_sY7589xg&s'
    },
    {
      key: 'verduras',
      nombre: 'Verduras',
      descripcion: 'Colorida, saludable y rica.',
      img: 'https://media.tycsports.com/files/2024/07/08/739758/tarta-de-verdura_862x485.webp'
    },
    {
      key: 'acelga',
      nombre: 'Acelga',
      descripcion: 'La opción verde, fresca y casera.',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJMGXstZJ_CRcZ1iQTHd8YjEtv8rPc_UHu0g&s'
    },
    {
      key: 'capresse',
      nombre: 'Capresse',
      descripcion: 'Tomate, albahaca y muzza. Simplemente genial.',
      img: 'https://www.lasaltena.com.ar/wp-content/uploads/2020/03/Tarta-caprese_banner-400x196.png.webp'
    },
    {
      key: 'pollo',
      nombre: 'Pollo',
      descripcion: 'Súper sabrosa y bien cargada.',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLy8mYRLS32pHUIp_E-TyTPsCCI1LyqxVRug&s'
    }
  ]);

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
    if (guardado) setPrecios(JSON.parse(guardado));

    const tartasGuardadas = localStorage.getItem("tartas_eatandrun");
    if (tartasGuardadas) setTartas(JSON.parse(tartasGuardadas));
  }, []);

  const handleChange = (campo, valor) => {
    setPrecios((prev) => ({
      ...prev,
      [campo]: parseInt(valor)
    }));
  };

  const guardar = () => {
    localStorage.setItem("precios_eatandrun", JSON.stringify(precios));
    localStorage.setItem("tartas_eatandrun", JSON.stringify(tartas));
    alert("✅ Datos actualizados correctamente");
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

      <Typography variant="h5" sx={{ mt: 5, mb: 2 }}>
        🍰 Editar Tartas
      </Typography>

      {tartas.map((tarta, index) => (
        <Box key={tarta.key} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
          <TextField
            label="Nombre"
            fullWidth
            value={tarta.nombre}
            onChange={(e) => {
              const nuevo = [...tartas];
              nuevo[index].nombre = e.target.value;
              setTartas(nuevo);
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Descripción"
            fullWidth
            value={tarta.descripcion}
            onChange={(e) => {
              const nuevo = [...tartas];
              nuevo[index].descripcion = e.target.value;
              setTartas(nuevo);
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            label="URL de Imagen"
            fullWidth
            value={tarta.img}
            onChange={(e) => {
              const nuevo = [...tartas];
              nuevo[index].img = e.target.value;
              setTartas(nuevo);
            }}
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
