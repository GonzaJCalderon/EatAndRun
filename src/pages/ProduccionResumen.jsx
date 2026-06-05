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
import dayjs from '../utils/day'; 
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

const a = dayjs('2025-07-13');
const b = dayjs('2025-07-20');

console.log(a.isBetween(b.subtract(7, 'day'), b, null, '[]')); 

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

const getNombreConEmpresa = (usuario = {}, empresa_nombre = null) => {
  const nombre = `${usuario?.nombre || ''} ${usuario?.apellido || ''}`.trim();
  const empresa = empresa_nombre || usuario?.empresa_nombre || null;
  return empresa ? `${nombre} (${empresa})` : nombre;
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
    const inicio = dayjs(desde).startOf('day');
    const fin = dayjs(hasta).endOf('day');

    setSemanaActual({ lunes: inicio.toDate(), viernes: fin.toDate() });
const pedidosFiltrados = res.data
  .filter(p => {
    const raw = p.fecha_entrega || p.created_at;

    if (!raw) {
      console.warn(`❌ Pedido sin fecha: ID ${p.id}`);
      return false;
    }

    const fecha = dayjs(raw).startOf('day'); // 🟢 importantísimo

    const inicioOp = dayjs(inicio).startOf('day');
    const finOp = dayjs(fin).endOf('day'); // 🟢 fin extendido

    const enRango = fecha.isBetween(inicioOp, finOp, 'day', '[]'); // inclusive

    if (!enRango) {
      console.warn(`⏱️ Pedido fuera de rango: ${fecha.format('dddd DD/MM')}`);
    }

    return enRango && (tipoMenu === 'todos' || p.tipo_menu === tipoMenu);
  })
  .sort((a, b) =>
    dayjs(b.fecha_entrega || b.created_at).valueOf() -
    dayjs(a.fecha_entrega || a.created_at).valueOf()
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

  // 🔠 Normaliza día a MAYÚSCULAS y SIN TILDES
  const normalizeDia = (str) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

  pedidos.forEach((p) => {
    const pedido = p.pedido || {};
    const nombre = getNombreConEmpresa(p.usuario, p.empresa_nombre);

    // ✅ TARTAS
    const tartas = pedido.tartas || {};
    Object.entries(tartas).forEach(([plato, cantidad]) => {
      const cantidadNum = Number(cantidad);
      if (!isNaN(cantidadNum)) {
        if (!resumenTemp["TARTAS"]) resumenTemp["TARTAS"] = {};
        resumenTemp["TARTAS"][plato] = (resumenTemp["TARTAS"][plato] || 0) + cantidadNum;
        totalTemp[plato] = (totalTemp[plato] || 0) + cantidadNum;
      }
    });

    if (Object.keys(tartas).length && p.observaciones) {
      if (!obsTemp["TARTAS"]) obsTemp["TARTAS"] = [];
      obsTemp["TARTAS"].push(`• ${nombre}: ${p.observaciones}`);
    }

    // ✅ PLATOS diarios y extras
    Object.entries(pedido).forEach(([categoria, diasOPlatos]) => {
      if (categoria === 'tartas') return;

      Object.entries(diasOPlatos).forEach(([dia, platos]) => {
        const key = normalizeDia(dia); // ej: miércoles -> MIERCOLES

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
    });
  });

  setResumen(resumenTemp);
  setObservaciones(obsTemp);
  setTotalProduccion(totalTemp);
};




// 🔽 Esta parte del código se mantiene exactamente como está...

// 🔁 Reemplazá SOLO el contenido de exportarExcel por este 👇

const normalizeDia = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

const exportarExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const fechaHoy = new Date().toLocaleDateString('es-AR');

  const diasSemana = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES'];
  const fechasDias = {};

  // Obtenemos la fecha real del lunes de la semana
  const lunes = dayjs(semanaActual.lunes);
  diasSemana.forEach((dia, index) => {
    const fecha = lunes.add(index, 'day');
    fechasDias[dia] = fecha;
  });

  const getPedidosPorDiaYPlato = (dia, plato) =>
    pedidos.filter(p => {
      const platosDia = p.pedido?.diarios?.[dia.toLowerCase()] || {};
      return platosDia[plato] > 0;
    });

for (const dia of diasSemana) {
  const key = normalizeDia(dia); // ahora sí va a ser "MIERCOLES"
  const dataDia = resumen[key] || {};
  const fechaDia = fechasDias[dia]?.format('DD/MM') || 'Sin fecha';
  const sheet = workbook.addWorksheet(dia); // conservamos el nombre original con tilde

  if (Object.keys(dataDia).length === 0) {
    sheet.addRow([`📭 Sin producción para ${dia}`]);
    continue;
  }

    sheet.columns = Array(10).fill({ width: 25 });
    sheet.addRow([`🍽️ PRODUCCIÓN - ${dia} ${fechaDia}`]);
    sheet.getRow(1).font = { bold: true, size: 16 };
    sheet.getRow(1).alignment = { horizontal: 'center' };
    sheet.mergeCells('A1:J1');
    sheet.addRow([]);

    const platos = Object.keys(dataDia);
    const mitad = Math.ceil(platos.length / 2);
    const platosIzq = platos.slice(0, mitad);
    const platosDer = platos.slice(mitad);

    const agregarBloques = (platos, colInicio) => {
      for (const plato of platos) {
        sheet.addRow([]);
        const tituloRow = sheet.addRow([]);
        const colChar = String.fromCharCode(65 + colInicio);
        const cell = sheet.getCell(`${colChar}${tituloRow.number}`);
        cell.value = plato.toUpperCase();
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4CAF50' },
        };
        sheet.mergeCells(
          tituloRow.number,
          colInicio + 1,
          tituloRow.number,
          colInicio + 2
        );

        const pedidosDePlato = getPedidosPorDiaYPlato(dia, plato);
        pedidosDePlato.forEach(p => {
          const nombre = getNombreConEmpresa(p.usuario, p.empresa_nombre);
          const row = sheet.addRow([]);
          sheet.getCell(`${colChar}${row.number}`).value = nombre;
        });

        const resumenRow = sheet.addRow([]);
        sheet.getCell(`${colChar}${resumenRow.number}`).value = 'TOTAL';
        sheet.getCell(`${String.fromCharCode(65 + colInicio + 1)}${resumenRow.number}`).value = dataDia[plato];
      }
    };

    agregarBloques(platosIzq, 0);  // columnas A/B
    agregarBloques(platosDer, 5);  // columnas F/G

    // 🧮 Tabla resumen
    sheet.addRow([]);
    sheet.addRow(['PLATO', 'CANTIDAD']).font = { bold: true };

    Object.entries(dataDia).forEach(([plato, cantidad]) => {
      sheet.addRow([plato, cantidad]);
    });

    const total = Object.values(dataDia).reduce((acc, n) => acc + n, 0);
    const rowTotal = sheet.addRow(['TOTAL', total]);
    rowTotal.font = { bold: true };
  }

  // (continúa igual con hoja de TARTAS y RESUMEN SEMANAL...)

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  saveAs(blob, `Produccion-Semanal-${fechaHoy.replaceAll('/', '-')}.xlsx`);
};


const exportarExcelPorEmpresa = async () => {
  const workbook = new ExcelJS.Workbook();
  const fecha = new Date().toLocaleDateString('es-AR');

  const pedidosPorEmpresa = {};

  pedidos.forEach(p => {
    const empresa = p.usuario?.empresa_nombre || 'Sin empresa';
    if (!pedidosPorEmpresa[empresa]) pedidosPorEmpresa[empresa] = [];
    pedidosPorEmpresa[empresa].push(p);
  });

  Object.entries(pedidosPorEmpresa).forEach(([nombreEmpresa, pedidosEmpresa]) => {
    const sheet = workbook.addWorksheet(nombreEmpresa.slice(0, 31));
    sheet.columns = [
      { width: 25 }, // Empleado
      { width: 15 }, // Fecha
      { width: 20 }, // Plato
      { width: 10 }, // Cantidad
      { width: 15 }, // Tipo
      { width: 40 }  // Observaciones + Nota Admin
    ];

    sheet.addRow([`🍽️ PRODUCCIÓN - ${nombreEmpresa} - ${fecha}`]);
    sheet.getRow(1).font = { bold: true, size: 16 };
    sheet.mergeCells('A1:F1');
    sheet.addRow([]);

    // Header
    sheet.addRow(['Empleado', 'Fecha Entrega', 'Plato', 'Cantidad', 'Tipo', 'Observaciones']).font = { bold: true };

    pedidosEmpresa.forEach(p => {
      const nombre = getNombreConEmpresa(p.usuario, p.empresa_nombre);
      const fechaEntrega = new Date(p.fecha_entrega || p.created_at).toLocaleDateString('es-AR');
      const pedido = p.pedido || {};

      const observacionCompleta = [
        p.observaciones || '',
        p.nota_admin ? `Nota admin: ${p.nota_admin}` : ''
      ].filter(Boolean).join(' — ');

      const renderPlatos = (obj, tipo) => {
        Object.entries(obj || {}).forEach(([key, valor]) => {
          const cantidad = Number(valor);
          if (isNaN(cantidad) || cantidad <= 0) return;

          let nombrePlato = key;
          if (tipo === 'extras') {
            const id = key.replace(/^ID:/, '');
            nombrePlato = extraMap[id] || `Extra ${id}`;
          }

          sheet.addRow([
            nombre,
            fechaEntrega,
            nombrePlato,
            cantidad,
            tipo,
            observacionCompleta
          ]);
        });
      };

      renderPlatos(pedido.tartas, 'tarta');
      renderPlatos(pedido.diarios?.lunes, 'lunes');
      renderPlatos(pedido.diarios?.martes, 'martes');
      renderPlatos(pedido.diarios?.miércoles, 'miércoles');
      renderPlatos(pedido.diarios?.jueves, 'jueves');
      renderPlatos(pedido.diarios?.viernes, 'viernes');
      renderPlatos(pedido.extras?.lunes, 'extras');
      renderPlatos(pedido.extras?.martes, 'extras');
      renderPlatos(pedido.extras?.miércoles, 'extras');
      renderPlatos(pedido.extras?.jueves, 'extras');
      renderPlatos(pedido.extras?.viernes, 'extras');
    });

    // Totales por empresa
    const totalPorEmpresa = {};
    sheet.addRow([]);
    sheet.addRow(['RESUMEN POR EMPRESA']).font = { bold: true };

    sheet.eachRow((row, rowNum) => {
      if (rowNum <= 3) return;
      const plato = row.getCell(3).value;
      const cantidad = row.getCell(4).value;
      if (plato && cantidad && !isNaN(cantidad)) {
        totalPorEmpresa[plato] = (totalPorEmpresa[plato] || 0) + cantidad;
      }
    });

    Object.entries(totalPorEmpresa).forEach(([plato, cantidad]) => {
      sheet.addRow([plato, cantidad]);
    });

    const totalGeneral = Object.values(totalPorEmpresa).reduce((a, b) => a + b, 0);
    sheet.addRow(['TOTAL GENERAL', totalGeneral]).font = { bold: true };
  });

  // Guardar archivo
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  saveAs(blob, `Produccion-Empresas-${fecha.replaceAll('/', '-')}.xlsx`);
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
        <Button variant="contained" color="secondary" onClick={exportarExcelPorEmpresa}>
  🏢 Exportar por Empresa
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

  onResumenEditado={handleResumenEditado}
  onGuardarCambios={handleGuardarCambios}
  filasLibres={filasLibres}
  onFilasLibresChange={handleFilaLibreChange}
/>



          </Box>
        </>
      )}
    </Container>
  );
};

export default ProduccionResumen;
