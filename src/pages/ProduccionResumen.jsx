import { useEffect, useState } from "react";
import {
  Container, Typography, Card, CardContent,
  Divider, Button, Box, CircularProgress
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import { useSnackbar } from 'notistack';
import api from "../api/api";
import ProduccionEditablePorDia from "../components/ProduccionEditablePorDia";
import { getSemanaActualRange } from '../utils/date';

const ProduccionResumen = () => {
  const [pedidos, setPedidos] = useState([]);
  const [resumen, setResumen] = useState({});
  const [observaciones, setObservaciones] = useState({});
  const [totalProduccion, setTotalProduccion] = useState({});
  const [tipoMenu, setTipoMenu] = useState('todos');
  const [cargando, setCargando] = useState(true);
  const [filasLibres, setFilasLibres] = useState({});
  const [semanaActual, setSemanaActual] = useState({ lunes: null, viernes: null }); // 💡 nuevo

  const { enqueueSnackbar } = useSnackbar();

  const handleFiltroChange = (e) => setTipoMenu(e.target.value);

  useEffect(() => {
    fetchPedidos();
  }, [tipoMenu]);

const fetchPedidos = async () => {
  try {
    setCargando(true);
    const res = await api.get("/admin/orders");

    const { lunes, viernes } = getSemanaActualRange();
    setSemanaActual({ lunes, viernes });

    const pedidosFiltrados = res.data
      .filter(p => {
        const fecha = new Date(p.fecha_entrega);
        return (
          fecha >= lunes &&
          fecha <= viernes &&
          (tipoMenu === 'todos' || p.tipo_menu === tipoMenu)
        );
      })
      .sort((a, b) => new Date(b.fecha_entrega) - new Date(a.fecha_entrega));

    console.log("📦 Pedidos filtrados:", pedidosFiltrados);

    setPedidos(pedidosFiltrados);
    calcularResumen(pedidosFiltrados);
  } catch (err) {
    console.error("❌ Error al obtener pedidos:", err);
  } finally {
    setCargando(false);
  }
};


  const handleFilaLibreChange = (nuevasFilas) => {
    setFilasLibres(nuevasFilas);
  };

  const calcularResumen = (pedidos) => {
    const resumenTemp = {};
    const obsTemp = {};
    const totalTemp = {};
  const extraMap = {
  "1": "🍰 Postre",
  "2": "🥗 Ensalada",
  "3": "💪 Proteína"
};



    pedidos.forEach((p) => {
      const pedido = p.pedido || {};
      const nombre = `${p.usuario?.nombre || ''} ${p.usuario?.apellido || ''}`.trim();

      Object.entries(pedido).forEach(([categoria, diasOPlatos]) => {
        if (categoria === 'tartas') {
          Object.entries(diasOPlatos).forEach(([plato, cantidad]) => {
            const cantidadNum = Number(cantidad);
            if (!isNaN(cantidadNum)) {
              if (!resumenTemp["TARTAS"]) resumenTemp["TARTAS"] = {};
              resumenTemp["TARTAS"][plato] = (resumenTemp["TARTAS"][plato] || 0) + cantidadNum;
              totalTemp[plato] = (totalTemp[plato] || 0) + cantidadNum;
            }
          });

          if (p.observaciones) {
            if (!obsTemp["TARTAS"]) obsTemp["TARTAS"] = [];
            obsTemp["TARTAS"].push(`• ${nombre}: ${p.observaciones}`);
          }
        } else {
          Object.entries(diasOPlatos).forEach(([dia, platos]) => {
            const key = dia.toUpperCase();
            if (!resumenTemp[key]) resumenTemp[key] = {};
            if (!obsTemp[key]) obsTemp[key] = [];
Object.entries(platos).forEach(([plato, cantidad]) => {
  const cantidadNum = Number(cantidad);

  // 🧠 Mapear nombre solo si es EXTRA
  let nombrePlato = plato;
  if (categoria === 'extras') {
    const idNormalizado = plato.replace(/^ID:/, '');
    nombrePlato = extraMap[idNormalizado] || `Extra ${idNormalizado}`;
  }

  // ✅ Guardar en resumen y total usando el nombre mapeado
  resumenTemp[key][nombrePlato] = (resumenTemp[key][nombrePlato] || 0) + cantidadNum;
  totalTemp[nombrePlato] = (totalTemp[nombrePlato] || 0) + cantidadNum;
});


            if (p.observaciones) {
              obsTemp[key].push(`• ${nombre}: ${p.observaciones}`);
            }
          });
        }
      });
    });

    setResumen(resumenTemp);
    setObservaciones(obsTemp);
    setTotalProduccion(totalTemp);
  };

  const exportarExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const styles = {
      header: {
        font: { bold: true },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCE5FF' } },
        border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
      },
      rowBorder: {
        border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
      },
      total: {
        font: { bold: true },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } },
        border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
      }
    };

    Object.entries(resumen).forEach(([dia, platos]) => {
      const sheet = workbook.addWorksheet(dia);
      sheet.columns = [
        { header: "Plato", key: "plato", width: 35 },
        { header: "Cantidad", key: "cantidad", width: 15 }
      ];
      sheet.getRow(1).eachCell(cell => Object.assign(cell, styles.header));

      let total = 0;
      Object.entries(platos).forEach(([plato, cantidad]) => {
        const row = sheet.addRow({ plato, cantidad });
        row.eachCell(cell => Object.assign(cell, styles.rowBorder));
        total += cantidad;
      });

      sheet.addRow([]);
      const totalRow = sheet.addRow(["TOTAL", total]);
      totalRow.eachCell(cell => Object.assign(cell, styles.total));

      if (observaciones[dia]) {
        sheet.addRow([]);
        const title = sheet.addRow(["OBSERVACIONES"]);
        sheet.mergeCells(`A${title.number}:B${title.number}`);
        title.getCell(1).font = { italic: true, bold: true };

        observaciones[dia].forEach((obs) => {
          const row = sheet.addRow([obs]);
          sheet.mergeCells(`A${row.number}:B${row.number}`);
          row.getCell(1).font = { italic: true, size: 11 };
        });
      }

      if (filasLibres[dia.toLowerCase()]) {
        sheet.addRow([]);
        const libre = sheet.addRow([`🔓 Fila libre: ${filasLibres[dia.toLowerCase()]}`]);
        sheet.mergeCells(`A${libre.number}:B${libre.number}`);
        libre.getCell(1).font = { italic: true };
      }
    });

    const resumenSheet = workbook.addWorksheet("RESUMEN SEMANAL");
    resumenSheet.columns = [
      { header: "Plato", key: "plato", width: 35 },
      { header: "Total Semana", key: "cantidad", width: 20 }
    ];
    resumenSheet.getRow(1).eachCell(cell => Object.assign(cell, styles.header));

    Object.entries(totalProduccion).forEach(([plato, cantidad]) => {
      const row = resumenSheet.addRow({ plato, cantidad });
      row.eachCell(cell => Object.assign(cell, styles.rowBorder));
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, `produccion-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleGuardarCambios = async (pedidoId, nuevosItems) => {
    try {
      await api.put(`/orders/${pedidoId}/update-items`, { items: nuevosItems });
      enqueueSnackbar('✅ Cambios guardados', { variant: 'success' });
      fetchPedidos(); // actualizar
    } catch (err) {
      enqueueSnackbar('❌ Error al guardar', { variant: 'error' });
    }
  };

  return (
    <Container sx={{ mt: 4, pb: 8 }}>
      <Box className="no-print" sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => window.location.href = "/admin"}
        >
          Volver al Admin
        </Button>
      </Box>

      <Box className="no-print" sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <label style={{ marginRight: '8px', fontWeight: 500 }}>Filtrar por tipo de menú:</label>
        <select value={tipoMenu} onChange={handleFiltroChange}>
          <option value="todos">Todos</option>
          <option value="usuario">Usuarios individuales</option>
          <option value="empresa">Empresas</option>
        </select>
      </Box>

      <Typography variant="h4" textAlign="center" gutterBottom>
        🍽️ Resumen de Producción
      </Typography>

      {semanaActual.lunes && semanaActual.viernes && (
        <Typography variant="subtitle1" textAlign="center" gutterBottom>
          Semana actual: del {semanaActual.lunes.toLocaleDateString()} al {semanaActual.viernes.toLocaleDateString()}
        </Typography>
      )}

      <Box className="no-print" sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
        <Button variant="contained" color="success" onClick={exportarExcel}>
          📤 Exportar Excel
        </Button>
        <Button variant="outlined" color="primary" onClick={() => window.print()}>
          🖨️ Imprimir producción
        </Button>
      </Box>

      {cargando ? (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Card sx={{ mt: 4, backgroundColor: '#f0f0f0' }}>
            <CardContent>
              <Typography variant="h5" textAlign="center" sx={{ mb: 2 }}>
                📦 Total Producción Semanal
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {Object.entries(totalProduccion).map(([plato, cantidad], idx) => (
                <Typography key={idx} textAlign="center" sx={{ mb: 1 }}>
                  🍽️ <strong>{plato}</strong>: {typeof cantidad === 'object' ? JSON.stringify(cantidad) : cantidad}
                </Typography>
              ))}
            </CardContent>
          </Card>

          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>📝 Edición por día</Typography>
            <ProduccionEditablePorDia
              pedidos={pedidos}
              onGuardarCambios={handleGuardarCambios}
              onFilaLibreChange={handleFilaLibreChange}
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default ProduccionResumen;
