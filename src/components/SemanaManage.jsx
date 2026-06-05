import { useState } from "react";
import {
  Card, Typography, TextField, Grid, Button, Box
} from "@mui/material";

const diasSemana = ["lunes", "martes", "miercoles", "jueves", "viernes"];

const SemanaManage = ({ semana, onGuardar, onToggle, onGuardarDias, onEliminar }) => {
  const [inicio, setInicio] = useState(semana.semana_inicio?.split("T")[0]);
  const [fin, setFin] = useState(semana.semana_fin?.split("T")[0]);
  const [cierre, setCierre] = useState(semana.cierre?.split("T")[0]);
  const [dias, setDias] = useState({ ...semana.dias_habilitados });

  const cambiarDia = (dia) => {
    setDias((prev) => ({ ...prev, [dia]: !prev[dia] }));
  };

  const guardarFechas = () => {
    onGuardar(semana.id, { inicio, fin, cierre });
  };

  const guardarDias = () => {
    onGuardarDias(semana.id, dias);
  };

  const cambiarEstado = () => {
    onToggle(semana.id, !semana.habilitado);
  };

  const eliminar = () => {
    if (window.confirm("¿Estás seguro de que querés eliminar esta semana? Esta acción no se puede deshacer.")) {
      onEliminar(semana.id);
    }
  };

  return (
    <Card sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6">📅 Semana del {inicio} al {fin}</Typography>
      <Typography>🕒 Cierre: <strong>{cierre}</strong></Typography>
      <Typography>Estado: <strong>{semana.habilitado ? "✅ Habilitada" : "❌ Bloqueada"}</strong></Typography>

      <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 2 }}>
        <TextField
          label="Inicio"
          type="date"
          value={inicio}
          onChange={(e) => setInicio(e.target.value)}
        />
        <TextField
          label="Fin"
          type="date"
          value={fin}
          onChange={(e) => setFin(e.target.value)}
        />
        <TextField
          label="Cierre"
          type="date"
          value={cierre}
          onChange={(e) => setCierre(e.target.value)}
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1">🗓️ Días habilitados:</Typography>
        <Grid container spacing={1} sx={{ mt: 1 }}>
          {diasSemana.map((dia) => (
            <Grid item key={dia}>
              <Button
                variant={dias[dia] ? "contained" : "outlined"}
                color={dias[dia] ? "success" : "error"}
                onClick={() => cambiarDia(dia)}
              >
                {dia.charAt(0).toUpperCase() + dia.slice(1)}: {dias[dia] ? "✅" : "❌"}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ mt: 3, display: "flex", flexWrap: "wrap", gap: 2 }}>
        <Button variant="contained" onClick={guardarFechas}>💾 Guardar semana</Button>
        <Button variant="contained" onClick={guardarDias}>🗓️ Guardar días</Button>
        <Button
          variant="contained"
          color={semana.habilitado ? "error" : "success"}
          onClick={cambiarEstado}
        >
          {semana.habilitado ? "❌ Bloquear pedidos" : "✅ Habilitar pedidos"}
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={eliminar}
        >
          🗑️ Eliminar semana
        </Button>
      </Box>
    </Card>
  );
};

export default SemanaManage;
