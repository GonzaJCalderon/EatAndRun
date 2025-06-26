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

const ProduccionResumen = () => {
  const [pedidos, setPedidos] = useState([]);
  const [resumen, setResumen] = useState({});
  const [observaciones, setObservaciones] = useState({});
  const [totalProduccion, setTotalProduccion] = useState({});
  const [tipoMenu, setTipoMenu] = useState('todos');
  const [filtroTiempo, setFiltroTiempo] = useState("semana");
  const [usarRangoPersonalizado, setUsarRangoPersonalizado] = useState(false);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [cargando, setCargando] = useState(true);
  const [filasLibres, setFilasLibres] = useState({});
  const [semanaActual, setSemanaActual] = useState({ lunes: null, viernes: null });

  const { enqueueSnackbar } = useSnackbar();

  const handleFiltroChange = (e) => setTipoMenu(e.target.value);
  const handleFiltroTiempoChange = (e) => setFiltroTiempo(e.target.value);

  const handleResumenEditado = ({ resumen, observaciones, total }) => {
  setResumen(resumen);
  setObservaciones(observaciones);
  setTotalProduccion(total);
};

const extraMap = {
  "1": "🍰 Postre",
  "2": "🥗 Ensalada",
  "3": "💪 Proteína"
};



  const getRangoFecha = () => {
    if (usarRangoPersonalizado && fechaDesde && fechaHasta) {
      const desde = new Date(fechaDesde);
      const hasta = new Date(fechaHasta);
      return { desde, hasta };
    }

    const hoy = new Date();
    const inicio = new Date(hoy);
    const fin = new Date(hoy);

    switch (filtroTiempo) {
      case "mes":
        inicio.setDate(1);
        fin.setMonth(inicio.getMonth() + 1);
        fin.setDate(0);
        break;
      case "año":
        inicio.setMonth(0, 1);
        fin.setMonth(11, 31);
        break;
      default: {
        const dia = hoy.getDay();
        const lunes = new Date(hoy);
        lunes.setDate(hoy.getDate() - ((dia + 6) % 7));
        const viernes = new Date(lunes);
        viernes.setDate(lunes.getDate() + 4);
        return { desde: lunes, hasta: viernes };
      }
    }

    return { desde: inicio, hasta: fin };
  };

  useEffect(() => {
    fetchPedidos();
  }, [tipoMenu, filtroTiempo, usarRangoPersonalizado, fechaDesde, fechaHasta]);

  const fetchPedidos = async () => {
    try {
      setCargando(true);
      const res = await api.get("/admin/orders");

      const { desde, hasta } = getRangoFecha();

      const inicio = new Date(desde);
      inicio.setHours(0, 0, 0, 0);
      const fin = new Date(hasta);
      fin.setHours(23, 59, 59, 999);

      setSemanaActual({ lunes: inicio, viernes: fin });

      const pedidosFiltrados = res.data
        .filter(p => {
          const raw = p.fecha_entrega || p.created_at;
          if (!raw) return false;

          const fecha = new Date(raw);
          return (
            fecha >= inicio &&
            fecha <= fin &&
            (tipoMenu === 'todos' || p.tipo_menu === tipoMenu)
          );
        })
        .sort((a, b) =>
          new Date(b.fecha_entrega || b.created_at) - new Date(a.fecha_entrega || a.created_at)
        );

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
              let nombrePlato = plato;

              if (categoria === 'extras') {
                const idNormalizado = plato.replace(/^ID:/, '');
                nombrePlato = extraMap[idNormalizado] || `Extra ${idNormalizado}`;
              }

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
  const dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

  const estiloTituloPlato = {
    font: { bold: true, name: 'Calibri' }
  };

  dias.forEach((dia) => {
    const sheet = workbook.addWorksheet(dia.toUpperCase());

    let fila = 1;
    const platosPorDia = {};

    pedidos.forEach(pedido => {
      const usuario = `${pedido.usuario?.nombre || ''} ${pedido.usuario?.apellido || ''}`.trim();
      const tipoMenu = pedido.tipo_menu?.toUpperCase() || '';
const notasPorDia = pedido.notas || {};
const notaLibre = notasPorDia[dia] || '';



      const platos = pedido.pedido?.diarios?.[dia] || {};

      Object.entries(platos).forEach(([nombrePlato, cantidad]) => {
        if (!platosPorDia[nombrePlato]) platosPorDia[nombrePlato] = [];

       platosPorDia[nombrePlato].push({
  usuario: `${usuario} - ${tipoMenu}`,
  cantidad,
  nota: notaLibre,
  observacion,
  esExtra: false
});

      });

      const extras = pedido.pedido?.extras?.[dia] || {};
      Object.entries(extras).forEach(([extraId, cantidad]) => {
        const nombre = extraMap[extraId.replace(/^ID:/, '')] || `Extra ${extraId}`;
        if (!platosPorDia[nombre]) platosPorDia[nombre] = [];

      platosPorDia[nombre].push({
  usuario: `${usuario} - ${tipoMenu}`,
  cantidad,
  nota: notaLibre,
  observacion,
  esExtra: true
});

      });
    });

    // Encabezado
sheet.columns = [
  { header: 'Usuario', key: 'usuario', width: 35 },
  { header: 'Tipo', key: 'tipo', width: 10 },
  { header: 'Cantidad', key: 'cantidad', width: 12 },
  { header: 'Nota libre', key: 'nota', width: 40 },
  { header: 'Observación', key: 'observacion', width: 40 }
];


    // Escribir por plato
    Object.entries(platosPorDia).forEach(([nombrePlato, usuarios]) => {
      // Título del plato
      sheet.addRow([]);
      const tituloRow = sheet.addRow([nombrePlato.toUpperCase()]);
      tituloRow.font = estiloTituloPlato;

      usuarios.forEach(u => {
     sheet.addRow({
  usuario: u.usuario,
  tipo: u.esExtra ? 'E' : 'A',
  cantidad: u.cantidad,
  nota: u.nota || '',
  observacion: u.observacion || ''
});

      });

      sheet.addRow([]); // Espacio entre bloques
    });
  });

  // Hoja de resumen
  const resumenSheet = workbook.addWorksheet("RESUMEN");
  resumenSheet.columns = [
    { header: "PLATO", key: "plato", width: 40 },
    { header: "CANTIDAD", key: "cantidad", width: 15 },
    { header: "TOTAL", key: "total", width: 15 },
  ];

  Object.entries(totalProduccion).forEach(([plato, cantidad]) => {
    resumenSheet.addRow({ plato, cantidad, total: cantidad });
  });

  // 📌 Agregar sección de observaciones generales
resumenSheet.addRow([]);
resumenSheet.addRow([{ value: "📝 OBSERVACIONES POR CATEGORÍA", font: { bold: true } }]);

Object.entries(observaciones).forEach(([categoria, obsLista]) => {
  resumenSheet.addRow([]);
  resumenSheet.addRow([{ value: `📅 ${categoria}`, font: { bold: true, italic: true } }]);

  if (obsLista.length === 0) {
    resumenSheet.addRow(["(Sin observaciones)"]);
  } else {
    obsLista.forEach(obs => {
      resumenSheet.addRow([obs]);
    });
  }
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
      fetchPedidos();
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

      <Box className="no-print" sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <label><strong>Filtrar por menú:</strong></label>
          <select value={tipoMenu} onChange={handleFiltroChange}>
            <option value="todos">Todos</option>
            <option value="usuario">Usuarios individuales</option>
            <option value="empresa">Empresas</option>
          </select>

          <label><strong>Filtrar por:</strong></label>
          <select value={filtroTiempo} onChange={handleFiltroTiempoChange} disabled={usarRangoPersonalizado}>
            <option value="semana">Semana</option>
            <option value="mes">Mes</option>
            <option value="año">Año</option>
          </select>
        </Box>

        <Box>
          <label>
            <input
              type="checkbox"
              checked={usarRangoPersonalizado}
              onChange={(e) => setUsarRangoPersonalizado(e.target.checked)}
            />{" "}
            Usar rango personalizado
          </label>
        </Box>

        {usarRangoPersonalizado && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box>
              <label>Desde:</label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </Box>
            <Box>
              <label>Hasta:</label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </Box>
          </Box>
        )}
      </Box>

      <Typography variant="h4" textAlign="center" gutterBottom>
        🍽️ Resumen de Producción
      </Typography>

      {semanaActual.lunes && semanaActual.viernes && (
        <Typography variant="subtitle1" textAlign="center" gutterBottom>
          {`Rango: del ${semanaActual.lunes.toLocaleDateString()} al ${semanaActual.viernes.toLocaleDateString()}`}
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
                📦 Total Producción
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {Object.entries(totalProduccion).map(([plato, cantidad], idx) => (
                <Typography key={idx} textAlign="center" sx={{ mb: 1 }}>
                  🍽️ <strong>{plato}</strong>: {cantidad}
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
  onResumenEditado={handleResumenEditado}
/>

          </Box>
        </>
      )}
    </Container>
  );
};

export default ProduccionResumen;
