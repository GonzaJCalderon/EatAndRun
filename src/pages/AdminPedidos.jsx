import api from '../api/api';
import { useEffect, useState } from 'react';
import {
  Container, Typography, Card, CardContent, Divider,
  Button, TextField, MenuItem, Select, FormControl, InputLabel,
  Tabs, Tab, Box
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Autocomplete from '@mui/material/Autocomplete';
import Modal from '@mui/material/Modal';
import { saveAs } from 'file-saver';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ResumenVisualPorDia from '../components/ResumenVisualPordia';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

import * as XLSX from 'xlsx';
import dayjs from '../utils/day';

import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Configurar dayjs plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = 'America/Argentina/Buenos_Aires';
// Normaliza cualquier cosa a clave de fecha AR: YYYY-MM-DD (inicio del día AR)
const toFechaKeyAR = (d) => {
  return dayjs(d).tz('America/Argentina/Buenos_Aires').startOf('day').format('YYYY-MM-DD');
};



// Parsea "DD/MM" en el mismo año del pedido, fijo en AR
const fromDDMM_AR = (dd, mm, year) =>
  dayjs.tz(
    `${String(year).padStart(4,'0')}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}T00:00:00`,
    TZ
  );

const parseFechaArgentina = (raw) => dayjs.utc(raw).tz('America/Argentina/Buenos_Aires');

// Mapeo de dÃ­as en espaÃ±ol
// Mapeo de días en español (UTF-8 correcto)
const diasEspanol = {
  monday:    'lunes',
  tuesday:   'martes',
  wednesday: 'miércoles',
  thursday:  'jueves',
  friday:    'viernes',
  saturday:  'sábado',
  sunday:    'domingo'
};


// ===== FUNCIONES COPIADAS DE ProduccionResumen =====
const extraMap = {
  "1": "🍰 Postre",
  "2": "🥗 Ensalada",
  "3": "💪 Proteína"
};

// 👇 Alias manuales para IDs sin nombre
const manualAliases = {
  '0': '👉 DEFINIR NOMBRE PARA ID 0',
  '8': '👉 DEFINIR NOMBRE PARA ID 8'
};

const humanizar = (s = '') =>
  String(s)
    .replace(/^ID:/i, '')
    .replace(/_/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/^\w|\s\w/g, c => c.toUpperCase());

const resolveNombrePlato = (
  platoKey = '',
  categoria = 'diarios',
  nameMapLocal = {},
  extraMapLocal = extraMap
) => {
  const key = String(platoKey).trim();

  // 0️⃣ Revisar alias manual primero
  if (manualAliases[key]) return manualAliases[key];
  if (manualAliases[key.replace(/^ID:/i, '')]) {
    return manualAliases[key.replace(/^ID:/i, '')];
  }

  // 1️⃣ Formato "ID:29"
  const idMatch = key.match(/^ID:(\d+)$/i);
  if (idMatch) {
    const id = idMatch[1];
    if (categoria === 'extras') return extraMapLocal[id] || `Extra ${id}`;
    const catMap = nameMapLocal[categoria] || {};
    return catMap[id] || `Plato ${id}`;
  }

  // 2️⃣ Número puro (ej: "29")
  if (/^\d+$/.test(key)) {
    const catMap = nameMapLocal[categoria] || {};
    if (catMap[key]) return catMap[key];
    if (categoria === 'extras') return extraMapLocal[key] || `Extra ${key}`;
    return `Plato ${key}`;
  }

  // 3️⃣ Texto
  const catMap = nameMapLocal[categoria] || {};
  if (catMap[key]) return catMap[key];
  return humanizar(key);
};

// Construye nameMap desde el MENÚ (diarios + fijos)
const buildNameMapFromMenu = async () => {
  const map = { diarios: {}, extras: { '1':'🍰 Postre','2':'🥗 Ensalada','3':'💪 Proteína' }, tartas: {} };

  // diarios por semana
  try {
    const r = await api.get('/daily/semanal');
    const semanal = r.data || {};
    Object.values(semanal).forEach(diaObj => {
      (diaObj?.especiales || []).forEach(p => {
        const id = String(p.id ?? '').trim();
        if (id) map.diarios[id] = p.name || p.nombre || `Plato ${id}`;
      });
    });
  } catch (e) {
    console.warn('No pude traer /daily/semanal', e);
  }

  // fijos
  try {
    const r = await api.get('/fixed');
    const fijos = Array.isArray(r.data) ? r.data : [];
    fijos.forEach(p => {
      const id = String(p.id ?? p._id ?? '').trim();
      if (id) map.diarios[id] = p.name || p.nombre || `Plato ${id}`;
    });
  } catch (e) {
    console.warn('No pude traer /fixed', e);
  }

  return map;
};

// Construye nameMap desde los pedidos (por si trajeran metadatos o claves legibles)
const buildNameMapFromPedidos = (pedidos = []) => {
  const map = { diarios: {}, extras: {}, tartas: {} };

  const put = (bucket, idLike, nombre) => {
    if (!idLike || !nombre) return;
    const id = String(idLike).replace(/^ID:/i, '');
    map[bucket][id] = String(nombre);
    map[id] = String(nombre);
  };

  pedidos.forEach(p => {
    const pedido = p.pedido || {};
    // desde diarios
    Object.values(pedido.diarios || {}).forEach(platos => {
      Object.entries(platos || {}).forEach(([k, v]) => {
        if (typeof v === 'string') put('diarios', k, v);
      });
    });
    // desde extras
    Object.values(pedido.extras || {}).forEach(platos => {
      Object.entries(platos || {}).forEach(([k, v]) => {
        if (typeof v === 'string') put('extras', k, v);
      });
    });
    // tartas (si tuvieras mapeo)
    Object.entries(pedido.tartas || {}).forEach(([k]) => {
      const id = String(k).replace(/^ID:/i, '');
      if (!map.tartas[id]) map.tartas[id] = `Tarta ${id}`;
    });
  });

  // extras fijos por emoji
  map.extras = { '1':'🍰 Postre','2':'🥗 Ensalada','3':'💪 Proteína', ...map.extras };

  return map;
};

const parseFechaLocal = (raw) =>
  dayjs.utc(raw).tz('America/Argentina/Buenos_Aires');

const agruparPedidosPorFechaConDetalle = (pedidos, nameMapLocal = {}) => {
  const resultado = {};

  pedidos.forEach(p => {
    try {
      const { usuario, pedido: pedidoObj, estado, tipo_menu, id, fecha, fecha_entrega, created_at, empresa_nombre } = p;
      if (!usuario || !pedidoObj) return;

      // Tomamos la fecha base igual que ProduccionResumen (en AR), elige p.fecha || p.fecha_entrega || p.created_at
      const rawBase = fecha || fecha_entrega || created_at;
const fechaBaseAR = dayjs(rawBase).add(3, 'hour').tz(TZ).startOf('day');

      console.log('📅 Fecha original:', rawBase);
console.log('🇦🇷 Fecha AR interpretada:', fechaBaseAR.format());
console.log('🔑 Fecha clave usada:', toFechaKeyAR(rawBase));

      const esEmpresa = tipo_menu === 'empresa';
      const nombreCompleto = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ') || 'Sin nombre';

      const baseDetalle = {
        id,
        nombreCompleto,
        direccion: usuario.direccion || '',
        subdireccion: usuario.direccionSecundaria || '',
        telefono: usuario.telefono || '',
        email: usuario.email || '',
        empresa_nombre: empresa_nombre || '',
        estado: estado || 'pendiente',
        delivery: p.delivery || {},
        esEmpresa,
        metodoPago: p.metodoPago || null,
        comprobanteUrl: p.comprobanteUrl || null,
        platos: [],
        extras: [],
        tartas: []
      };

      // mismo criterio que ProduccionResumen pero fijo AR
      const calcularFechaRealDelDia = (nombreDia) => {
        const diaKey = String(nombreDia).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        // "lunes 18/08", "18/08", etc -> usar esa fecha en AR, mismo año que el pedido
        const m = String(nombreDia).match(/(\d{1,2})\/(\d{1,2})/);
        if (m) {
          const [, dd, mm] = m;
          return fromDDMM_AR(dd, mm, fechaBaseAR.year());
        }

        // Sólo día textual -> map lunes..domingo dentro de la semana del pedido (AR)
        const diasSemanaMap = {
          'lunes': 1,
          'martes': 2,
          'miercoles': 3,
          'miércoles': 3,
          'jueves': 4,
          'viernes': 5,
          'sabado': 6,
          'sábado': 6,
          'domingo': 0
        };
        const numeroDia = diasSemanaMap[diaKey];

        if (numeroDia !== undefined) {
          // startOf('week') parte en domingo, sumamos 1 para lunes
          const lunesAR = fechaBaseAR.startOf('week').add(1, 'day');
          return numeroDia === 0 ? lunesAR.add(6, 'day') : lunesAR.add(numeroDia - 1, 'day');
        }

        // fallback
        return fechaBaseAR;
      };

      // ===== Diarios =====
      if (pedidoObj.diarios && typeof pedidoObj.diarios === 'object') {
        for (const [dia, items] of Object.entries(pedidoObj.diarios)) {
          const fechaRealAR = calcularFechaRealDelDia(dia);
          const fechaKey = toFechaKeyAR(fechaRealAR);

          let detalle = resultado[fechaKey]?.find(d => d.id === id);
          if (!detalle) {
            detalle = { ...baseDetalle };
            if (!resultado[fechaKey]) resultado[fechaKey] = [];
            resultado[fechaKey].push(detalle);
          }

          for (const [nombrePlato, cantidad] of Object.entries(items || {})) {
            const n = Number(cantidad);
            if (n > 0) {
              const nombreResuelto = resolveNombrePlato(nombrePlato, 'diarios', nameMapLocal);
              detalle.platos.push({ nombre: nombreResuelto, cantidad: n });
            }
          }
        }
      }

      // ===== Extras =====
      if (pedidoObj.extras && typeof pedidoObj.extras === 'object') {
        for (const [dia, items] of Object.entries(pedidoObj.extras)) {
          const fechaRealAR = calcularFechaRealDelDia(dia);
          const fechaKey = toFechaKeyAR(fechaRealAR);

          let detalle = resultado[fechaKey]?.find(d => d.id === id);
          if (!detalle) {
            detalle = { ...baseDetalle };
            if (!resultado[fechaKey]) resultado[fechaKey] = [];
            resultado[fechaKey].push(detalle);
          }

          for (const [nombreExtra, cantidad] of Object.entries(items || {})) {
            const n = Number(cantidad);
            if (n > 0) {
              const nombreResuelto = resolveNombrePlato(nombreExtra, 'extras', nameMapLocal);
              detalle.extras.push({ nombre: nombreResuelto, cantidad: n });
            }
          }
        }
      }

      // ===== Tartas (van pegadas a la fecha base del pedido en AR) =====
      if (pedidoObj.tartas && typeof pedidoObj.tartas === 'object' && Object.keys(pedidoObj.tartas).length > 0) {
        const fechaKey = toFechaKeyAR(fechaBaseAR);

        let detalle = resultado[fechaKey]?.find(d => d.id === id);
        if (!detalle) {
          detalle = { ...baseDetalle };
          if (!resultado[fechaKey]) resultado[fechaKey] = [];
          resultado[fechaKey].push(detalle);
        }

        for (const [nombreTarta, cantidad] of Object.entries(pedidoObj.tartas)) {
          const n = Number(cantidad);
          if (n > 0) {
            const nombreResuelto = resolveNombrePlato(nombreTarta, 'tartas', nameMapLocal);
            detalle.tartas.push({ nombre: nombreResuelto, cantidad: n });
          }
        }
      }

    } catch (error) {
      console.error('❌ Error procesando pedido:', error, p);
    }
  });

  // Orden por fecha (YYYY-MM-DD ordena bien como string)
  return Object.fromEntries(
    Object.entries(resultado).sort(([a], [b]) => a.localeCompare(b))
  );
};


// Helper para convertir nombres de días a números
const getDayNumber = (dia) => {
  const diaMap = {
    'lunes': 1,
    'martes': 2,
    'miércoles': 3,
    'miercoles': 3,
    'jueves': 4,
    'viernes': 5,
    'sábado': 6,
    'sabado': 6,
    'domingo': 0
  };
  return diaMap[dia.toLowerCase()] || 1;
};

// Función para formatear fecha en español sin usar dayjs locale
// Función para formatear fecha en español usando la fecha LOCAL AR (sin UTC)
const formatearFechaBonita = (isoDateKey) => {
  try {
    // MUY IMPORTANTE: interpretar la clave 'YYYY-MM-DD' como medianoche en AR directamente
    const fecha = dayjs.tz(isoDateKey, TZ).startOf('day');

    // si mantenés el mapa en inglés -> OK
    const diaSemana = diasEspanol[fecha.format('dddd').toLowerCase()];
    const dia = fecha.date().toString().padStart(2, '0');
    const mes = (fecha.month() + 1).toString().padStart(2, '0');
    return `${diaSemana} ${dia}/${mes}`;
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha inválida';
  }
};



const exportarResumenVisualExcel = (resumenDetallado) => {
  try {
    const wb = XLSX.utils.book_new();

    Object.entries(resumenDetallado).forEach(([fechaKey, pedidos]) => {
      const agrupadoPorPlato = {};
      const totalesPorPlato = {};
      const totalesIndividual = {};
      const totalesEmpresa = {};

      // Agrupar por plato
      pedidos.forEach(p => {
        const tipo = p.esEmpresa ? 'empresa' : 'individual';
        p.platos.forEach(plato => {
          const nombre = plato.nombre;
          if (!agrupadoPorPlato[nombre]) agrupadoPorPlato[nombre] = [];
          agrupadoPorPlato[nombre].push(p.nombreCompleto);

          // Totales
          totalesPorPlato[nombre] = (totalesPorPlato[nombre] || 0) + plato.cantidad;
          if (tipo === 'empresa') {
            totalesEmpresa[nombre] = (totalesEmpresa[nombre] || 0) + plato.cantidad;
          } else {
            totalesIndividual[nombre] = (totalesIndividual[nombre] || 0) + plato.cantidad;
          }
        });
      });

      // Crear hoja estilo tabla
      const sheetData = [];
      const platos = Object.keys(agrupadoPorPlato);
      
      if (platos.length === 0) return;

      sheetData.push(platos);

      const maxFilas = Math.max(...Object.values(agrupadoPorPlato).map(arr => arr.length));

      for (let i = 0; i < maxFilas; i++) {
        const fila = platos.map(plato => agrupadoPorPlato[plato][i] || '');
        sheetData.push(fila);
      }

      sheetData.push([]);
      sheetData.push(['PLATO', 'INDIVIDUAL', 'EMPRESA', 'TOTAL']);
      
      platos.forEach(plato => {
        const fila = [
          plato,
          totalesIndividual[plato] || 0,
          totalesEmpresa[plato] || 0,
          totalesPorPlato[plato] || 0
        ];
        sheetData.push(fila);
      });

      const totalGeneral = Object.values(totalesPorPlato).reduce((a, b) => a + b, 0);
      sheetData.push([]);
      sheetData.push(['TOTAL GENERAL', '', '', totalGeneral]);

      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(wb, ws, formatearFechaBonita(fechaKey));
    });

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'resumen-visual.xlsx');
  } catch (error) {
    console.error('Error exportando Excel:', error);
    alert('Error al exportar Excel. Ver consola para más detalles.');
  }
};

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [resumenDetallado, setResumenDetallado] = useState({});
  const [busqueda, setBusqueda] = useState('');
  const [semanaActiva, setSemanaActiva] = useState(null);
  const [tabDia, setTabDia] = useState('');
  const [opcionesDelivery, setOpcionesDelivery] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [comprobanteUrl, setComprobanteUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nameMap, setNameMap] = useState({ diarios: {}, extras: {}, tartas: {} }); // NUEVO STATE

  // Filtros de fechas
  const [filtroDesde, setFiltroDesde] = useState(null);
  const [filtroHasta, setFiltroHasta] = useState(null);

  // Obtener semana activa
  useEffect(() => {
    const cargarSemanaActiva = async () => {
      try {
        const res = await api.get('/semana/actual');
        const semana = res.data.semana || res.data;
        console.log('🗓️ Semana activa recibida:', semana);
        setSemanaActiva(semana);
      } catch (error) {
        console.error('❌ Error cargando semana activa:', error);
        setError('Error cargando semana activa');
      }
    };

    cargarSemanaActiva();
  }, []);

  // Obtener pedidos cuando hay semana activa
  useEffect(() => {
    if (!semanaActiva) return;

    const cargarPedidos = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/orders');
        console.log('📦 Pedidos recibidos desde backend:', res.data);

        // Los pedidos ya vienen normalizados desde el backend
        const pedidosNormalizados = res.data;
        
        // CONSTRUIR NAMEMAP IGUAL QUE EN PRODUCCIONRESUMEN
        const [menuMap, pedidosMap] = await Promise.all([
          buildNameMapFromMenu(),
          Promise.resolve(buildNameMapFromPedidos(pedidosNormalizados)),
        ]);

        const merged = {
          diarios: { ...pedidosMap.diarios, ...menuMap.diarios },
          extras:  { ...pedidosMap.extras,  ...menuMap.extras  },
          tartas:  { ...pedidosMap.tartas,  ...menuMap.tartas  },
        };

        console.log('🔍 NameMap construido:', merged);
        setNameMap(merged);
        
        setPedidos(pedidosNormalizados);
        setError(null);
      } catch (error) {
        console.error('❌ Error cargando pedidos:', error);
        setError('Error cargando pedidos');
      } finally {
        setLoading(false);
      }
    };

    cargarPedidos();
  }, [semanaActiva]);

  // Procesar pedidos cuando cambian los filtros - AHORA USA NAMEMAP
  useEffect(() => {
    let pedidosFiltrados = [...pedidos];

const pickRawDate = (p) => p.fecha || p.fecha_entrega || p.created_at;

if (filtroDesde) {
const desdeDate = dayjs.tz(filtroDesde, TZ).startOf('day');
  pedidosFiltrados = pedidosFiltrados.filter(p => {
    const raw = pickRawDate(p);
    return dayjs.utc(raw).tz(TZ).startOf('day').isSameOrAfter(desdeDate);
  });
}

if (filtroHasta) {
const hastaDate = dayjs.tz(filtroHasta, TZ).endOf('day');
  pedidosFiltrados = pedidosFiltrados.filter(p => {
    const raw = pickRawDate(p);
    return dayjs.utc(raw).tz(TZ).startOf('day').isSameOrBefore(hastaDate);
  });
}



    // Filtro por búsqueda
    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase();
      pedidosFiltrados = pedidosFiltrados.filter(p => {
        const { usuario, empresa_nombre = '' } = p;
        if (!usuario) return false;
        
        return (
          (usuario.nombre && usuario.nombre.toLowerCase().includes(texto)) ||
          (usuario.apellido && usuario.apellido.toLowerCase().includes(texto)) ||
          (usuario.email && usuario.email.toLowerCase().includes(texto)) ||
          (usuario.direccion && usuario.direccion.toLowerCase().includes(texto)) ||
          (usuario.direccionSecundaria && usuario.direccionSecundaria.toLowerCase().includes(texto)) ||
          (empresa_nombre && empresa_nombre.toLowerCase().includes(texto))
        );
      });
    }

    // USAR NAMEMAP EN EL AGRUPADO
    const agrupado = agruparPedidosPorFechaConDetalle(pedidosFiltrados, nameMap);
    console.log('📊 Resumen detallado agrupado:', agrupado);
    setResumenDetallado(agrupado);

    // Mantener la pestaña si existe, o seleccionar la primera
    const fechas = Object.keys(agrupado);
    if (!tabDia || !fechas.includes(tabDia)) {
      setTabDia(fechas[0] || 'HISTORIAL');
    }
  }, [pedidos, filtroDesde, filtroHasta, busqueda, nameMap]); // AGREGAR NAMEMAP COMO DEPENDENCIA

  const cambiarEstadoPedido = async (id, estado) => {
    try {
      await api.put(`/orders/${id}`, { status: estado });
      const updated = pedidos.map(p => p.id === id ? { ...p, estado } : p);
      setPedidos(updated);
    } catch (error) {
      console.error('Error cambiando estado:', error);
    }
  };

  const asignarDelivery = async (id, delivery) => {
    try {
      if (!delivery?.id) return;
      await api.put(`/orders/${id}/assign`, { delivery_id: delivery.id });
      const actualizado = pedidos.map(p =>
        p.id === id ? { ...p, delivery } : p
      );
      setPedidos(actualizado);
    } catch (error) {
      console.error('Error asignando delivery:', error);
    }
  };

  const handleVerComprobante = (pedido) => {
    if (!pedido.comprobanteUrl) return;
    setComprobanteUrl(pedido.comprobanteUrl);
    setModalOpen(true);
  };

  // Mostrar loading
  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Cargando pedidos...</Typography>
      </Container>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">Error: {error}</Typography>
        <Button onClick={() => window.location.reload()}>Recargar</Button>
      </Container>
    );
  }

  // Mostrar si no hay semana activa
  if (!semanaActiva) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>No hay semana activa configurada</Typography>
      </Container>
    );
  }

  const fechasDisponibles = Object.keys(resumenDetallado);
  const historialCompletoAgrupado = agruparPedidosPorFechaConDetalle(pedidos, nameMap); // USAR NAMEMAP TAMBIÉN AQUÍ

  return (
    <Container sx={{ mt: 4 }}>
      <Button 
        variant="outlined" 
        startIcon={<ArrowBackIcon />}
        onClick={() => window.location.href = '/admin'}
      >
        Volver al Admin
      </Button>

      <Typography variant="h4" sx={{ my: 2 }}>
        📋 Pedidos de la Semana ({pedidos.length} total)
      </Typography>

      {/* Filtros de Fecha */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Desde"
            value={filtroDesde}
            onChange={setFiltroDesde}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </LocalizationProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Hasta"
            value={filtroHasta}
            onChange={setFiltroHasta}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </LocalizationProvider>
      </Box>

      {/* Buscador */}
      <TextField
        label="Buscar por nombre, apellido, dirección, email o empresa"
        fullWidth 
        sx={{ mb: 3 }}
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
      />

      {/* Tabs */}
      <Tabs
        value={tabDia}
        onChange={(e, val) => setTabDia(val)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        {fechasDisponibles.map(f => (
  <Tab key={f} label={formatearFechaBonita(f)} value={f} />


        ))}
        <Tab label="📜 Historial" value="HISTORIAL" />
      </Tabs>

      {/* Pedidos de un día específico */}
      {tabDia !== 'HISTORIAL' && (
        <>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => exportarResumenVisualExcel(resumenDetallado)}
              disabled={!resumenDetallado[tabDia] || resumenDetallado[tabDia].length === 0}
            >
              📊 Exportar Excel estilo planilla
            </Button>
          </Box>

          <ResumenVisualPorDia 
            pedidos={resumenDetallado[tabDia] || []} 
            nameMap={nameMap} // PASAR EL NAMEMAP AL COMPONENTE
          />

          {resumenDetallado[tabDia] && resumenDetallado[tabDia].length > 0 ? (
            resumenDetallado[tabDia].map((pedido, i) => (
              <Card key={`${pedido.id}-${i}`} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">
                    {pedido.esEmpresa ? '🏢' : '👤'} {pedido.nombreCompleto}
                    {pedido.empresa_nombre && (
                      <> — <span style={{ color: '#2074a0' }}>
                        Empresa: <b>{pedido.empresa_nombre}</b>
                      </span></>
                    )}
                  </Typography>
                  
                  <Typography>📍 {pedido.direccion}</Typography>
                  {pedido.subdireccion && <Typography>📍 {pedido.subdireccion}</Typography>}
                  <Typography>📞 {pedido.telefono}</Typography>
                  <Typography>📧 {pedido.email}</Typography>
                  <Typography>📦 Estado: {pedido.estado}</Typography>

                  {pedido.metodoPago && (
                    <Typography>💳 Método de pago: {pedido.metodoPago}</Typography>
                  )}

                  {pedido.comprobanteUrl && (
                    <Button
                      variant="outlined"
                      color="primary"
                      sx={{ mt: 1 }}
                      onClick={() => handleVerComprobante(pedido)}
                    >
                      🔎 Ver comprobante
                    </Button>
                  )}

                  <Divider sx={{ my: 1 }} />

                  {/* Mostrar platos - AHORA CON NOMBRES RESUELTOS */}
                  {pedido.platos.map((plato, j) => (
                    <Typography key={`plato-${j}`}>
                      🍽️ {plato.cantidad} × {plato.nombre}
                    </Typography>
                  ))}

                  {pedido.extras.map((extra, j) => (
                    <Typography key={`extra-${j}`}>
                      ➕ {extra.cantidad} × {extra.nombre}
                    </Typography>
                  ))}

                  {pedido.tartas.map((tarta, j) => (
                    <Typography key={`tarta-${j}`}>
                      🥧 {tarta.cantidad} × {tarta.nombre}
                    </Typography>
                  ))}

                  {/* Delivery */}
                  {pedido.delivery?.nombre ? (
                    <>
                      <Typography>🚚 Delivery: {pedido.delivery.nombre}</Typography>
                      {pedido.delivery.telefono && (
                        <Typography>📞 {pedido.delivery.telefono}</Typography>
                      )}
                    </>
                  ) : (
                    <Box sx={{ mt: 2 }}>
                      <Autocomplete
                        freeSolo
                        onInputChange={async (e, value) => {
                          if (!value) return;
                          try {
                            const res = await api.get('/deliveries/search?q=' + value);
                            setOpcionesDelivery(prev => ({
                              ...prev,
                              [pedido.id]: res.data
                            }));
                          } catch (error) {
                            console.error('Error buscando deliveries:', error);
                          }
                        }}
                        onChange={(e, selected) => {
                          if (!selected) return;
                          asignarDelivery(pedido.id, selected);
                        }}
                        options={opcionesDelivery[pedido.id] || []}
                        getOptionLabel={(option) => `${option.name} (${option.email})`}
                        renderInput={(params) => (
                          <TextField {...params} label="Buscar delivery" fullWidth />
                        )}
                      />
                    </Box>
                  )}

                  {/* Cambiar estado */}
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Estado del Pedido</InputLabel>
                    <Select
                      value={pedido.estado}
                      label="Estado del Pedido"
                      onChange={e => cambiarEstadoPedido(pedido.id, e.target.value)}
                    >
                      <MenuItem value="pendiente">🟡 Pendiente</MenuItem>
                      <MenuItem value="preparando">🍳 Preparando</MenuItem>
                      <MenuItem value="en camino">🚚 En camino</MenuItem>
                      <MenuItem value="entregado">📦 Entregado</MenuItem>
                      <MenuItem value="cancelado">❌ Cancelado</MenuItem>
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography>No hay pedidos para {formatearFechaBonita(tabDia)}</Typography>
          )}
        </>
      )}

      {/* Historial completo */}
      {tabDia === 'HISTORIAL' && (
        <>
          <Typography variant="h5" sx={{ mt: 3 }}>📜 Historial de Pedidos</Typography>
          {Object.keys(historialCompletoAgrupado).length === 0 ? (
            <Typography>No hay pedidos en el historial</Typography>
          ) : (
            Object.entries(historialCompletoAgrupado).map(([fecha, pedidosDelDia]) => (
              <Box key={fecha} sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  📆 {formatearFechaBonita(fecha)} ({pedidosDelDia.length} pedidos)
                </Typography>

                {pedidosDelDia.map((p, idx) => (
                  <Card key={`hist-${p.id}-${idx}`} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6">
                        {p.esEmpresa ? '🏢' : '👤'} {p.nombreCompleto}
                        {p.empresa_nombre && (
                          <> — <span style={{ color: '#2074a0' }}>
                            Empresa: <b>{p.empresa_nombre}</b>
                          </span></>
                        )}
                      </Typography>
                      
                      <Typography>📧 {p.email}</Typography>
                      <Typography>📞 {p.telefono}</Typography>
                      <Typography>📍 {p.direccion}</Typography>
                      {p.subdireccion && <Typography>📍 {p.subdireccion}</Typography>}
                      <Typography>📦 Estado: {p.estado}</Typography>

                      <Divider sx={{ my: 1 }} />

                      {/* Mostrar platos con nombres resueltos */}
                      {p.platos.map((plato, j) => (
                        <Typography key={`hist-plato-${j}`}>
                          🍽️ {plato.cantidad} × {plato.nombre}
                        </Typography>
                      ))}
                      
                      {p.extras.map((extra, j) => (
                        <Typography key={`hist-extra-${j}`}>
                          ➕ {extra.cantidad} × {extra.nombre}
                        </Typography>
                      ))}
                      
                      {p.tartas.map((tarta, j) => (
                        <Typography key={`hist-tarta-${j}`}>
                          🥧 {tarta.cantidad} × {tarta.nombre}
                        </Typography>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ))
          )}
        </>
      )}

      {/* Modal para ver comprobantes */}
      {comprobanteUrl && (
        <Modal 
          open={modalOpen} 
          onClose={() => {
            setModalOpen(false);
            setComprobanteUrl(null);
          }}
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 2,
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            {comprobanteUrl.endsWith('.pdf') ? (
              <iframe
                src={comprobanteUrl}
                width="100%"
                height="600px"
                title="Comprobante PDF"
              />
            ) : (
              <img
                src={comprobanteUrl}
                alt="Comprobante"
                style={{ maxWidth: '100%' }}
              />
            )}
          </Box>
        </Modal>
      )}
    </Container>
  );
};

export default AdminPedidos;