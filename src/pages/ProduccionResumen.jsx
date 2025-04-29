import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Divider,
  Button,
  Box
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { saveAs } from 'file-saver';
import { getPlatoKey } from '../utils/helpers'; 

const ProduccionResumen = () => {
  const [pedidos, setPedidos] = useState([]);
  const [resumen, setResumen] = useState({});
  const [observaciones, setObservaciones] = useState({});
  const [totalProduccion, setTotalProduccion] = useState({});

  useEffect(() => {
    const data = localStorage.getItem("pedidos_eatandrun");
    if (data) {
      const parsed = JSON.parse(data);
      setPedidos(parsed);
      calcularResumen(parsed);
    }
  }, []);

  const calcularResumen = (pedidos) => {
    const resumenTemp = {};
    const obsTemp = {};
    const totalTemp = {};

    pedidos.forEach((p) => {
      Object.entries(p.pedido).forEach(([dia, platos]) => {
        if (!resumenTemp[dia]) resumenTemp[dia] = {};

        Object.entries(platos).forEach(([platoKey, datos]) => {
          const nombre = datos.nombreOriginal || platoKey;

          if (!resumenTemp[dia][nombre]) resumenTemp[dia][nombre] = 0;
          resumenTemp[dia][nombre] += datos.cantidad;

          if (!totalTemp[nombre]) totalTemp[nombre] = 0;
          totalTemp[nombre] += datos.cantidad;
        });

        if (p.observaciones) {
          if (!obsTemp[dia]) obsTemp[dia] = [];
          obsTemp[dia].push(`• ${p.usuario.nombre}: ${p.observaciones}`);
        }
      });
    });

    setResumen(resumenTemp);
    setObservaciones(obsTemp);
    setTotalProduccion(totalTemp);
  };

  const exportarCSV = () => {
    let csv = 'Día;Plato;Cantidad\n';
    Object.entries(resumen).forEach(([dia, platos]) => {
      Object.entries(platos).forEach(([plato, cantidad]) => {
        csv += `${dia};${plato};${cantidad}\n`;
      });
    });

    csv += '\nTotal Producción\n';
    Object.entries(totalProduccion).forEach(([plato, cantidad]) => {
      csv += `;${plato};${cantidad}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `resumen-produccion-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <Container sx={{ mt: 4, pb: 8 }}>
      {/* Botón volver */}
      <Box className="no-print" sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => window.location.href = "/admin"}
        >
          Volver al Admin
        </Button>
      </Box>

      <Typography variant="h4" textAlign="center" gutterBottom>
        🍽️ Resumen de Producción
      </Typography>

      {/* Botones de acción */}
      <Box className="no-print" sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
        <Button variant="contained" color="success" onClick={exportarCSV}>
          📤 Exportar CSV
        </Button>

        <Button variant="outlined" color="primary" onClick={() => window.print()}>
          🖨️ Imprimir producción
        </Button>
      </Box>

      {/* Resumen por día */}
      {Object.keys(resumen).length === 0 ? (
        <Typography>No hay pedidos aún.</Typography>
      ) : (
        <>
          {Object.entries(resumen).map(([dia, platos]) => (
            <Card key={dia} sx={{ mb: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <Typography variant="h6">📅 {dia.toUpperCase()}</Typography>
                <Divider sx={{ my: 2 }} />
                {Object.entries(platos).map(([plato, cantidad], i) => (
                  <Typography key={i} sx={{ mb: 1 }}>
                    🍴 <strong>{plato}</strong> — {cantidad}
                  </Typography>
                ))}

                {/* Observaciones */}
                {observaciones[dia] && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      ✏️ Observaciones:
                    </Typography>
                    {observaciones[dia].map((obs, idx) => (
                      <Typography key={idx} variant="body2" sx={{ ml: 2 }}>
                        {obs}
                      </Typography>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Total final de la producción semanal */}
          <Card sx={{ mt: 4, backgroundColor: '#f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Typography variant="h5" textAlign="center" sx={{ mb: 2 }}>
                📦 Total Producción Semanal
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {Object.entries(totalProduccion).map(([plato, cantidad], idx) => (
                <Typography key={idx} textAlign="center" sx={{ mb: 1 }}>
                  🍽️ <strong>{plato}</strong>: {cantidad}
                </Typography>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
};

export default ProduccionResumen;
