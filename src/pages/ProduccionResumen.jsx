import { useEffect, useState } from "react";
import {
  Container, Typography, Card, CardContent,
  Divider, Button, Box, CircularProgress,
  FormControl, InputLabel, Select, MenuItem,
  Checkbox, FormControlLabel, TextField, Paper, Grid, Chip
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import { useSnackbar } from 'notistack';
import api from "../api/api";
import ProduccionEditablePorDia from "../components/ProduccionEditablePorDia";
import VistaProduccionImpresion from "../components/VistaProduccionImpresion";
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
  const [mapaPlatos, setMapaPlatos] = useState({});
  const [filtroTiempo, setFiltroTiempo] = useState("semana");
  const [usarRangoPersonalizado, setUsarRangoPersonalizado] = useState(false);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [cargando, setCargando] = useState(true);
  const [filasLibres, setFilasLibres] = useState({});
  const [semanaActual, setSemanaActual] = useState({ lunes: null, viernes: null });
  const [platosDelDia, setPlatosDelDia] = useState([]);

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
      case "proxima_semana": {
        const dia = hoy.getDay();
        const lunes = new Date(hoy);
        lunes.setDate(hoy.getDate() - ((dia + 6) % 7) + 7); // Lunes de la semana que viene
        const viernes = new Date(lunes);
        viernes.setDate(lunes.getDate() + 4);
        return { desde: lunes, hasta: viernes };
      }
      case "semana_actual":
      default: {
        const dia = hoy.getDay();
        const lunes = new Date(hoy);
        // Si es sábado o domingo, automáticamente mostramos la próxima semana por defecto
        if (dia === 0) {
           lunes.setDate(hoy.getDate() + 1);
        } else if (dia === 6) {
           lunes.setDate(hoy.getDate() + 2);
        } else {
           lunes.setDate(hoy.getDate() - ((dia + 6) % 7));
        }
        
        const viernes = new Date(lunes);
        viernes.setDate(lunes.getDate() + 4);
        return { desde: lunes, hasta: viernes };
      }
    }

    return { desde: inicio, hasta: fin };
  };

  useEffect(() => {
    fetchPedidosYDiccionario();
  }, [tipoMenu, filtroTiempo, usarRangoPersonalizado, fechaDesde, fechaHasta]);

const fetchPedidosYDiccionario = async () => {
  try {
    setCargando(true);
    
    // 1. Fetch Diccionario de Platos
    const [resFixed, resTartas, resDaily] = await Promise.all([
      api.get("/fixed").catch(() => ({ data: [] })),
      api.get("/tartas").catch(() => ({ data: [] })),
      api.get("/daily/all").catch(() => ({ data: [] }))
    ]);

    const dict = {};
    
    // Mapeo Menú Fijo (por índice 0, 1, 2... y por ID)
    if (resFixed.data && Array.isArray(resFixed.data)) {
      resFixed.data.forEach((plato, index) => {
        dict[`${index}`] = plato.name; // Soporte para "0", "1", "2"
        dict[`ID:${plato.id}`] = plato.name;
        dict[`Plato ${plato.id}`] = plato.name;
      });
    }

    // Mapeo Menú del Día
    if (resDaily.data && Array.isArray(resDaily.data)) {
      resDaily.data.forEach((plato) => {
        dict[`ID:${plato.id}`] = plato.name;
        dict[`Plato ${plato.id}`] = plato.name;
      });
    }

    // Mapeo Tartas (por slug/key viejo y por ID)
    if (resTartas.data && Array.isArray(resTartas.data)) {
      resTartas.data.forEach(tarta => {
        const gustoStr = tarta.gusto || tarta.name || '';
        if (!gustoStr) return;
        const slug = `tarta-${gustoStr.toLowerCase().replace(/ /g, '-')}`;
        dict[slug] = `Tarta de ${gustoStr}`;
        dict[`tarta-${slug}`] = `Tarta de ${gustoStr}`;
        if (tarta.id) dict[`ID:${tarta.id}`] = `Tarta de ${gustoStr}`;
        dict[`ID:${gustoStr}`] = `Tarta de ${gustoStr}`;
      });
    }

    setMapaPlatos(dict);
    setPlatosDelDia(resDaily.data || []);

    // 2. Fetch Pedidos
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

    // 🟢 Evitar que el Timezone del navegador atrase el día (ej. 03:00Z -> 23:00 Local del día anterior)
    const fechaLimpia = typeof raw === 'string' ? raw.split('T')[0] : raw;
    const fecha = dayjs(fechaLimpia).startOf('day');

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
    calcularResumen(pedidosFiltrados, dict);
  } catch (err) {
    console.error("❌ Error al obtener pedidos:", err);
  } finally {
    setCargando(false);
  }
};


  const handleFilaLibreChange = (nuevasFilas) => {
    setFilasLibres(nuevasFilas);
  };

 const calcularResumen = (pedidosParaCalcular, dictPlatos) => {
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

  pedidosParaCalcular.forEach((p) => {
    const pedido = p.pedido || {};
    const nombre = getNombreConEmpresa(p.usuario, p.empresa_nombre);

    // ✅ TARTAS
    const tartas = pedido.tartas || {};
    Object.entries(tartas).forEach(([plato, cantidad]) => {
      const cantidadNum = Number(cantidad);
      if (!isNaN(cantidadNum) && cantidadNum > 0) {
        // Resolver nombre: primero buscar en diccionario, si no limpiar el slug manualmente
        let nombreReal = dictPlatos[plato] || dictPlatos[`tarta-${plato}`] || null;
        if (!nombreReal) {
          // Limpiar slug: "tarta-de-verdura" → "Tarta de verdura"
          const slug = plato.replace(/^tarta-de-/, '').replace(/^tarta-/, '').replace(/-/g, ' ');
          nombreReal = `Tarta de ${slug}`;
        }
        // Asegurarse que no quede "Tarta de de-xxx"
        const nombreLimpio = nombreReal
          .replace(/^Tarta de de-/i, 'Tarta de ')
          .replace(/^tarta-tarta-de-/i, 'Tarta de ')
          .replace(/^tarta-/i, 'Tarta de ')
          .toUpperCase();
        
        if (!resumenTemp["TARTAS"]) resumenTemp["TARTAS"] = {};
        if (!resumenTemp["TARTAS"][nombreLimpio]) {
          resumenTemp["TARTAS"][nombreLimpio] = { cantidad: 0, usuarios: [] };
        }
        
        resumenTemp["TARTAS"][nombreLimpio].cantidad += cantidadNum;
        resumenTemp["TARTAS"][nombreLimpio].usuarios.push({
          nombre,
          cantidad: cantidadNum,
          observaciones: p.observaciones || p.nota_admin,
          fechaPedido: p.fecha_entrega || p.created_at,
          fechaEntrega: p.fecha_entrega_tartas
        });

        totalTemp[nombreLimpio] = (totalTemp[nombreLimpio] || 0) + cantidadNum;
      }
    });

    if (Object.keys(tartas).length && p.observaciones) {
      if (!obsTemp["TARTAS"]) obsTemp["TARTAS"] = [];
      obsTemp["TARTAS"].push(`• ${nombre}: ${p.observaciones}`);
    }

    // ✅ PLATOS diarios y extras
    Object.entries(pedido).forEach(([categoria, diasOPlatos]) => {
      if (categoria === 'tartas' || categoria === 'fecha_dia_por_dia') return;

      if (!diasOPlatos || typeof diasOPlatos !== 'object') return;

      Object.entries(diasOPlatos).forEach(([dia, platos]) => {
        if (!platos || typeof platos !== 'object') return;

        const key = normalizeDia(dia); // ej: miércoles -> MIERCOLES

        if (!resumenTemp[key]) resumenTemp[key] = {};
        if (!obsTemp[key]) obsTemp[key] = [];

        Object.entries(platos).forEach(([plato, cantidad]) => {
          const cantidadNum = Number(cantidad);
          if (isNaN(cantidadNum) || cantidadNum <= 0) return;

          let nombrePlato = dictPlatos[plato] || plato;

          if (categoria === 'extras') {
            const idNormalizado = plato.replace(/^ID:/, '');
            nombrePlato = extraMap[idNormalizado] || dictPlatos[plato] || `Extra ${idNormalizado}`;
          }

          if (nombrePlato.startsWith('ID:')) {
             nombrePlato = nombrePlato.replace('ID:', '');
          }

          nombrePlato = nombrePlato.toUpperCase();

          if (!resumenTemp[key][nombrePlato]) {
            resumenTemp[key][nombrePlato] = { cantidad: 0, usuarios: [] };
          }

          resumenTemp[key][nombrePlato].cantidad += cantidadNum;
          resumenTemp[key][nombrePlato].usuarios.push({
            nombre,
            cantidad: cantidadNum,
            observaciones: p.observaciones || ''
          });

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

    const getPedidosPorDiaYPlato = (dia, plato) => {
      const key = normalizeDia(dia);
      return resumen[key]?.[plato]?.usuarios || [];
    };

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
    const agregarBloques = (listaPlatos) => {
      for (const plato of listaPlatos) {
        sheet.addRow([]);
        const tituloRow = sheet.addRow([plato.toUpperCase()]);
        const cell = sheet.getCell(`A${tituloRow.number}`);
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4CAF50' },
        };
        sheet.mergeCells(tituloRow.number, 1, tituloRow.number, 2);

        const pedidosDePlato = getPedidosPorDiaYPlato(dia, plato);
        pedidosDePlato.forEach(u => {
          sheet.addRow([u.cantidad > 1 ? `${u.nombre} (x${u.cantidad})` : u.nombre]);
        });

        const resumenRow = sheet.addRow(['TOTAL', dataDia[plato].cantidad]);
        sheet.getCell(`B${resumenRow.number}`).font = { bold: true };
      }
    };

    agregarBloques(platos);

    // 🧮 Tabla resumen
    sheet.addRow([]);
    sheet.addRow(['PLATO', 'CANTIDAD']).font = { bold: true };

    Object.entries(dataDia).forEach(([plato, data]) => {
      sheet.addRow([plato, data.cantidad]);
    });

    const total = Object.values(dataDia).reduce((acc, obj) => acc + obj.cantidad, 0);
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

      <Paper className="no-print" elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'text.secondary' }}>
          Filtros de Búsqueda
        </Typography>
        
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filtrar por menú</InputLabel>
              <Select value={tipoMenu} onChange={handleFiltroChange} label="Filtrar por menú">
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="usuario">Usuarios individuales</MenuItem>
                <MenuItem value="empresa">Empresas</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Periodo</InputLabel>
              <Select 
                value={filtroTiempo} 
                onChange={handleFiltroTiempoChange} 
                label="Periodo"
                disabled={usarRangoPersonalizado}
              >
                <MenuItem value="semana">Semana Actual</MenuItem>
                <MenuItem value="proxima_semana">Próxima Semana</MenuItem>
                <MenuItem value="mes">Mes</MenuItem>
                <MenuItem value="año">Año</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={usarRangoPersonalizado}
                  onChange={(e) => setUsarRangoPersonalizado(e.target.checked)}
                  color="primary"
                />
              }
              label="Usar rango de fechas personalizado"
            />
          </Grid>

          {usarRangoPersonalizado && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Desde"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Hasta"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                />
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      <Typography variant="h4" textAlign="center" gutterBottom>
        🍽️ Resumen de Producción
      </Typography>

      {semanaActual.lunes && semanaActual.viernes && (
        <Typography variant="subtitle1" textAlign="center" gutterBottom>
          {`Rango: del ${semanaActual.lunes.toLocaleDateString()} al ${semanaActual.viernes.toLocaleDateString()}`}
        </Typography>
      )}

      <Box className="no-print" sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mb: 5 }}>
        <Button variant="contained" color="success" size="large" onClick={exportarExcel} sx={{ px: 4 }}>
          📤 Exportar Excel
        </Button>
        <Button variant="contained" color="secondary" size="large" onClick={exportarExcelPorEmpresa} sx={{ px: 4 }}>
          🏢 Exportar por Empresa
        </Button>
        <Button variant="outlined" color="primary" size="large" onClick={() => window.print()} sx={{ px: 4, borderWidth: 2 }}>
          🖨️ Imprimir
        </Button>
      </Box>

      {cargando ? (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper elevation={0} sx={{ mt: 4, p: 3, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#1e293b' }}>
              📦 Producción Global de la Semana
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(totalProduccion).map(([plato, cantidad], idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: 'white', 
                    borderRadius: 2, 
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#334155' }}>
                      {plato}
                    </Typography>
                    <Chip label={cantidad} color="primary" size="small" sx={{ fontWeight: 'bold', minWidth: 40 }} />
                  </Box>
                </Grid>
              ))}
              {Object.keys(totalProduccion).length === 0 && (
                <Typography sx={{ p: 2, color: 'text.secondary' }}>No hay producción en este periodo.</Typography>
              )}
            </Grid>
          </Paper>

          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>📊 Vista de Producción (Formato Cocina)</Typography>
            <VistaProduccionImpresion 
              pedidos={pedidos} 
              resumen={resumen} 
              semanaActual={semanaActual} 
            />
          </Box>

          <Box sx={{ mt: 6 }} className="no-print">
            <Typography variant="h5" sx={{ mb: 2 }}>📝 Edición por día</Typography>
            <ProduccionEditablePorDia
              pedidos={pedidos}
              mapaPlatos={mapaPlatos}
              platosDelDia={platosDelDia}
              semanaActual={semanaActual}
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
