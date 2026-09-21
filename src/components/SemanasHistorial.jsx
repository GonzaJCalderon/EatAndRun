// src/components/SemanasHistorial.jsx
import { useState, useEffect } from "react";
import {
  Card, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Stack
} from "@mui/material";
import dayjs from "../utils/day"; // tu dayjs personalizado
import api from "../api/api"; // tu instancia de axios

// Formato dd/mm/yyyy
const fmtUI = (s) => {
  if (!s) return "—";
  return dayjs.tz(s, 'America/Argentina/Buenos_Aires').format("DD/MM/YYYY");
};

const SemanasHistorial = () => {
  const [todasLasSemanas, setTodasLasSemanas] = useState([]);
  const [pagina, setPagina] = useState(1);
  const porPagina = 6;

  // 🚀 Cargar todas las semanas al montar
  useEffect(() => {
    const fetchSemanas = async () => {
      try {
        const { data } = await api.get("/semana/todas");
        setTodasLasSemanas(data.semanas || []);
      } catch (err) {
        console.error("❌ Error al cargar semanas:", err);
      }
    };
    fetchSemanas();
  }, []);

  // Ordenar de más antigua a más nueva
  const semanasOrdenadas = [...todasLasSemanas].sort(
    (a, b) => new Date(a.semana_inicio) - new Date(b.semana_inicio)
  );

  const totalPaginas = Math.ceil(semanasOrdenadas.length / porPagina);
  const inicio = (pagina - 1) * porPagina;
  const paginas = semanasOrdenadas.slice(inicio, inicio + porPagina);

  // Solo permitir eliminar semanas futuras
  const esFutura = (fecha) => {
    return dayjs(fecha).isAfter(dayjs(), "day");
  };

  const handleEliminarSemana = async (id) => {
    if (!window.confirm("¿Seguro que querés eliminar esta semana futura?")) return;

    try {
      await api.delete(`/semana/${id}`);
      alert("✅ Semana eliminada correctamente");

      // Refrescar la tabla (estado local)
      setTodasLasSemanas((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("❌ Error al eliminar semana:", error);
      alert("⚠️ No se pudo eliminar la semana");
    }
  };

  return (
    <>
      <Typography variant="h5" sx={{ mt: 6 }}>
        🗃️ Historial de Semanas
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Acá podrás consultar todas las semanas de producción creadas.
      </Typography>

      {todasLasSemanas.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          📭 No hay semanas registradas aún.
        </Typography>
      ) : (
        <>
          <Card sx={{ mt: 2, p: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>📅 Inicio</TableCell>
                    <TableCell>📅 Fin</TableCell>
                    <TableCell>🕒 Cierre</TableCell>
                    <TableCell>🔐 Estado</TableCell>
                    <TableCell>⚙️ Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginas.map((semana) => (
                    <TableRow key={semana.id}>
                      <TableCell>{fmtUI(semana.semana_inicio)}</TableCell>
                      <TableCell>{fmtUI(semana.semana_fin)}</TableCell>
                      <TableCell>{fmtUI(semana.cierre)}</TableCell>
                      <TableCell>
                        {semana.habilitado ? "✅ Habilitada" : "❌ Bloqueada"}
                      </TableCell>
                      <TableCell>
                        {esFutura(semana.semana_inicio) && (
                          <Button
                            color="error"
                            variant="outlined"
                            size="small"
                            onClick={() => handleEliminarSemana(semana.id)}
                          >
                            🗑️ Eliminar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          {totalPaginas > 1 && (
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              alignItems="center"
              sx={{ mt: 2 }}
            >
              <Button
                variant="contained"
                disabled={pagina === 1}
                onClick={() => setPagina((p) => p - 1)}
              >
                ← Anterior
              </Button>
              <Typography>Página {pagina} de {totalPaginas}</Typography>
              <Button
                variant="contained"
                disabled={pagina === totalPaginas}
                onClick={() => setPagina((p) => p + 1)}
              >
                Siguiente →
              </Button>
            </Stack>
          )}
        </>
      )}
    </>
  );
};

export default SemanasHistorial;
