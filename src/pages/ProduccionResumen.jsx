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

const extraMap = {
  "1": "🍰 Postre",
  "2": "🥗 Ensalada",
  "3": "💪 Proteína"
};

const manualAliases = {
  '0': '👉 DEFINIR NOMBRE PARA ID 0',
  '8': '👉 DEFINIR NOMBRE PARA ID 8'
};

const tieneContenidoEnDia = (pedido, diaClave) => {
  const fecha = pedido.pedido?.fecha_dia_por_dia?.[diaClave];
  if (!fecha) return false;
  const fechaStr = dayjs(fecha).format('DD/MM');
  const keyCompleta = `${diaClave} ${fechaStr}`; // ej: viernes 24/10

  const diarios = pedido.pedido?.diarios?.[keyCompleta] || {};
  const extras = pedido.pedido?.extras?.[keyCompleta] || {};

  const hayDiarios = Object.values(diarios).some(val => val > 0);
  const hayExtras = Object.values(extras).some(val => val > 0);
  return hayDiarios || hayExtras;
};


const getClaveUI = (fechaEntrega) => {
  if (!fechaEntrega?.isValid?.()) return 'Día desconocido';
  const fechaES = fechaEntrega.locale('es');
  const nombreDia = fechaES.format('dddd');
  const fechaLegible = fechaES.format('DD/MM');
  const nombreDiaCapitalizado = nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1);
  return `${nombreDiaCapitalizado} ${fechaLegible}`;
};

const humanizar = (s = '') =>
  String(s)
    .replace(/^ID:/i, '')
    .replace(/_/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/^\w|\s\w/g, c => c.toUpperCase());

const resolveNombreAny = (key, categoria, mapping) => {
  if (!key) return 'Desconocido';
  const k  = String(key).trim();
  const id = k.replace(/^ID:/i, '');
  const catMap = mapping?.[categoria] || {};
  if (catMap[k])  return catMap[k];
  if (catMap[id]) return catMap[id];
  for (const bucket of Object.values(mapping || {})) {
    if (bucket?.[k])  return bucket[k];
    if (bucket?.[id]) return bucket[id];
  }
  if (categoria === 'extras') {
    const extraMap = { '1':'🍰 Postre','2':'🥗 Ensalada','3':'💪 Proteína' };
    if (extraMap[id]) return extraMap[id];
  }
  return /^\d+$/.test(id) ? `Plato ${id}` : humanizar(k);
};

const resolveNombrePlato = (
  platoKey = '',
  categoria = 'diarios',
  nameMapLocal = {},
  extraMapLocal = extraMap
) => {
  const key = String(platoKey).trim();
  if (manualAliases[key]) return manualAliases[key];
  if (manualAliases[key.replace(/^ID:/i, '')]) {
    return manualAliases[key.replace(/^ID:/i, '')];
  }
  const idMatch = key.match(/^ID:(\d+)$/i);
  if (idMatch) {
    const id = idMatch[1];
    if (categoria === 'extras') return extraMapLocal[id] || `Extra ${id}`;
    const catMap = nameMapLocal[categoria] || {};
    return catMap[id] || `Plato ${id}`;
  }
  if (/^\d+$/.test(key)) {
    const catMap = nameMapLocal[categoria] || {};
    if (catMap[key]) return catMap[key];
    if (categoria === 'extras') return extraMapLocal[key] || `Extra ${key}`;
    return `Plato ${key}`;
  }
  const catMap = nameMapLocal[categoria] || {};
  if (catMap[key]) return catMap[key];
  return humanizar(key);
};

const buildNameMapFromMenu = async () => {
  const map = { diarios: {}, extras: { '1':'🍰 Postre','2':'🥗 Ensalada','3':'💪 Proteína' }, tartas: {} };
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
    Object.values(pedido.diarios || {}).forEach(platos => {
      Object.entries(platos || {}).forEach(([k, v]) => {
        if (typeof v === 'string') put('diarios', k, v);
      });
    });
    Object.values(pedido.extras || {}).forEach(platos => {
      Object.entries(platos || {}).forEach(([k, v]) => {
        if (typeof v === 'string') put('extras', k, v);
      });
    });
    Object.entries(pedido.tartas || {}).forEach(([k]) => {
      const id = String(k).replace(/^ID:/i, '');
      if (!map.tartas[id]) map.tartas[id] = `Tarta ${id}`;
    });
  });
  map.extras = { '1':'🍰 Postre','2':'🥗 Ensalada','3':'💪 Proteína', ...map.extras };
  return map;
};

const getNombreConEmpresa = (p = {}) => {
  const u = p.usuario || {};
  const nombre = u.nombre || p.nombre || '';
  const apellido = u.apellido || p.apellido || '';
  const empresa = p.empresa_nombre || u.empresa_nombre || null;
  const nom = `${nombre} ${apellido}`.trim();
  return empresa ? `${nom} (${empresa})` : nom || '—';
};

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
  const [semanaActual, setSemanaActual] = useState({ lunes: null, viernes: null });
  const [nameMap, setNameMap] = useState({ diarios: {}, extras: {}, tartas: {} });

  const { enqueueSnackbar } = useSnackbar();

  const getRangoFecha = () => {
    if (usarRangoPersonalizado && fechaDesde && fechaHasta) {
      const d = dayjs(fechaDesde, 'YYYY-MM-DD').startOf('day');
      const h = dayjs(fechaHasta, 'YYYY-MM-DD').endOf('day');
      return { desde: d.toDate(), hasta: h.toDate() };
    }
    const hoy = dayjs();
    switch (filtroTiempo) {
      case "mes": {
        const inicio = hoy.startOf('month');
        const fin = hoy.endOf('month');
        return { desde: inicio.toDate(), hasta: fin.toDate() };
      }
      case "año": {
        const inicio = hoy.startOf('year');
        const fin = hoy.endOf('year');
        return { desde: inicio.toDate(), hasta: fin.toDate() };
      }
      default: {
        const inicioSemana = hoy.locale('es').startOf('week');
        const finSemana = hoy.locale('es').endOf('week');
        return { desde: inicioSemana.toDate(), hasta: finSemana.toDate() };
      }
    }
  };
const calcularResumen = (pedidosList, nameMapping) => {
  const resumenPorDia = {};
  const observacionesPorDia = {};
  const totalProd = {};

  pedidosList.forEach(pedido => {
    // ✅ Backend NUEVO: usa items[]
    if (pedido.items && Array.isArray(pedido.items)) {
      pedido.items.forEach(item => {
        const fechaISO = item.fecha_dia;
        if (!fechaISO) return;

        const fecha = dayjs(fechaISO).locale('es');
        const claveUI = `${fecha.format('dddd')[0].toUpperCase() + fecha.format('dddd').slice(1)} ${fecha.format('DD/MM')}`;
        if (!resumenPorDia[claveUI]) resumenPorDia[claveUI] = {};

        const nombre = resolveNombreAny(item.item_id, item.item_type, nameMapping);
        resumenPorDia[claveUI][nombre] = (resumenPorDia[claveUI][nombre] || 0) + item.quantity;
        totalProd[nombre] = (totalProd[nombre] || 0) + item.quantity;
      });
    }

    // ✅ Backend VIEJO: usa pedido.diarios + fecha_dia_por_dia
    if (pedido.pedido?.diarios) {
      const fechasPorDia = pedido.pedido.fecha_dia_por_dia || {};
      
      Object.entries(pedido.pedido.diarios).forEach(([diaClave, platos]) => {
        // 🔥 Buscar la fecha correspondiente
        let fechaISO = fechasPorDia[diaClave];
        
        // 🔥 Si la clave es "sin_dia", buscar cualquier fecha disponible
        if (!fechaISO && Object.keys(fechasPorDia).length > 0) {
          fechaISO = Object.values(fechasPorDia)[0];
        }
        
        if (!fechaISO) return;

        const fecha = dayjs(fechaISO).locale('es');
        const claveUI = `${fecha.format('dddd')[0].toUpperCase() + fecha.format('dddd').slice(1)} ${fecha.format('DD/MM')}`;
        if (!resumenPorDia[claveUI]) resumenPorDia[claveUI] = {};

        Object.entries(platos).forEach(([platoId, cantidad]) => {
          const nombre = resolveNombreAny(platoId, 'diarios', nameMapping);
          resumenPorDia[claveUI][nombre] = (resumenPorDia[claveUI][nombre] || 0) + cantidad;
          totalProd[nombre] = (totalProd[nombre] || 0) + cantidad;
        });
      });
    }

    // ✅ MANEJO DE EXTRAS con fecha_dia_por_dia
    if (pedido.pedido?.extras) {
      const fechasPorDia = pedido.pedido.fecha_dia_por_dia || {};
      
      Object.entries(pedido.pedido.extras).forEach(([diaClave, extras]) => {
        // 🔥 Buscar la fecha correspondiente
        let fechaISO = fechasPorDia[diaClave];
        
        // 🔥 Si la clave es "sin_dia", buscar cualquier fecha disponible
        if (!fechaISO && Object.keys(fechasPorDia).length > 0) {
          fechaISO = Object.values(fechasPorDia)[0];
        }
        
        if (!fechaISO) return;

        const fecha = dayjs(fechaISO).locale('es');
        const claveUI = `${fecha.format('dddd')[0].toUpperCase() + fecha.format('dddd').slice(1)} ${fecha.format('DD/MM')}`;
        if (!resumenPorDia[claveUI]) resumenPorDia[claveUI] = {};

        Object.entries(extras).forEach(([extraId, cantidad]) => {
          const nombre = resolveNombreAny(extraId, 'extras', nameMapping);
          resumenPorDia[claveUI][nombre] = (resumenPorDia[claveUI][nombre] || 0) + cantidad;
          totalProd[nombre] = (totalProd[nombre] || 0) + cantidad;
        });
      });
    }

    // ✅ MANEJO DE TARTAS con fecha_entrega_tartas
    if (pedido.pedido?.tartas && Object.keys(pedido.pedido.tartas).length > 0) {
      const fechaTarta = dayjs(pedido.fecha_entrega_tartas || pedido.fecha_entrega || pedido.fecha);
      if (fechaTarta.isValid()) {
        const claveUI = 'TARTAS';
        if (!resumenPorDia[claveUI]) resumenPorDia[claveUI] = {};

        Object.entries(pedido.pedido.tartas).forEach(([tartaKey, cantidad]) => {
          const nombre = resolveNombreAny(tartaKey, 'tartas', nameMapping);
          resumenPorDia[claveUI][nombre] = (resumenPorDia[claveUI][nombre] || 0) + cantidad;
          totalProd[nombre] = (totalProd[nombre] || 0) + cantidad;
        });
      }
    }

    // ✅ Observaciones
    if (pedido.observaciones && pedido.fecha_entrega) {
      const fecha = dayjs(pedido.fecha_entrega).locale('es');
      const clave = `${fecha.format('dddd')[0].toUpperCase() + fecha.format('dddd').slice(1)} ${fecha.format('DD/MM')}`;
      if (!observacionesPorDia[clave]) observacionesPorDia[clave] = [];
      observacionesPorDia[clave].push(`${pedido.usuario_nombre || 'Usuario'}: ${pedido.observaciones}`);
    }
  });

  // 🔥 Eliminar días sin ningún plato ni extra
for (const claveDia of Object.keys(resumenPorDia)) {
  const items = resumenPorDia[claveDia] || {};
  const totalItems = Object.values(items).reduce((sum, n) => sum + n, 0);
  if (totalItems === 0) {
    delete resumenPorDia[claveDia];
    delete observacionesPorDia[claveDia]; // opcional, por si hay basura
  }
}

  setResumen(resumenPorDia);
  setObservaciones(observacionesPorDia);
  setTotalProduccion(totalProd);
};


  const fetchPedidos = async () => {
    try {
      setCargando(true);
      const res = await api.get("/admin/orders/");
      const { desde, hasta } = getRangoFecha();
      const inicio = dayjs(desde).startOf('day');
      const fin = dayjs(hasta).endOf('day');
      setSemanaActual({ lunes: inicio.toDate(), viernes: fin.toDate() });
      const pedidosRaw = res.data || [];
      const pedidosFiltrados = pedidosRaw.filter(p => {
        const raw = p.fecha || p.fecha_entrega || p.created_at;
        if (!raw) return false;
       let fechaPedido;
try {
  fechaPedido = dayjs.tz(raw, 'America/Argentina/Buenos_Aires');
  if (!fechaPedido.isValid()) return false;
  fechaPedido = fechaPedido.startOf('day');
} catch (error) {
  return false;
}

        const enRango = fechaPedido.isBetween(inicio, fin, 'day', '[]') ||
                       fechaPedido.isSame(inicio, 'day') ||
                       fechaPedido.isSame(fin, 'day');
        const pasaTipoMenu = (tipoMenu === 'todos' || p.tipo_menu === tipoMenu);
        return enRango && pasaTipoMenu;
      }).sort((a, b) =>
        dayjs(b.fecha || b.fecha_entrega || b.created_at).valueOf() -
        dayjs(a.fecha || a.fecha_entrega || a.created_at).valueOf()
      );
      const [menuMap, pedidosMap] = await Promise.all([
        buildNameMapFromMenu(),
        Promise.resolve(buildNameMapFromPedidos(pedidosFiltrados)),
      ]);
      const merged = {
        diarios: { ...pedidosMap.diarios, ...menuMap.diarios },
        extras:  { ...pedidosMap.extras,  ...menuMap.extras  },
        tartas:  { ...pedidosMap.tartas,  ...menuMap.tartas  },
      };
      setNameMap(merged);
      setPedidos(pedidosFiltrados);
      calcularResumen(pedidosFiltrados, merged);
    } catch (err) {
      console.error("❌ Error al obtener pedidos:", err);
      enqueueSnackbar('Error al obtener pedidos', { variant: 'error' });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, [tipoMenu, filtroTiempo, usarRangoPersonalizado, fechaDesde, fechaHasta]);

  const xlPlain = (v) => {
    if (v == null) return '';
    return String(v)
      .replace(/[\u0000-\u001F]/g, ' ')
      .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
      .trim();
  };
  
  const xlNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const sheetSafeName = (s) => (xlPlain(s).replace(/[\\\/\?\*\[\]:]/g, ' ').slice(0,31).trim() || 'Hoja');

  const exportarExcelSeguro = async () => {
    const workbook = new ExcelJS.Workbook();
    const { desde, hasta } = getRangoFecha();
    const inicio = dayjs(desde).startOf('day');
    const fin = dayjs(hasta).endOf('day');
    const sufijo = `${inicio.format('YYYYMMDD')}_a_${fin.format('YYYYMMDD')}`;
    
   const diasConPedidos = new Set();
// ✅ Solo agregamos días con PLATOS (no tartas)
pedidos.forEach(p => {
  const fechas = p.pedido?.fecha_dia_por_dia || {};

  // ✅ Agregar solo fechas reales donde hay platos
  Object.values(fechas).forEach(fechaStr => {
    const fecha = dayjs(fechaStr);
    if (fecha.isValid() && fecha.isBetween(inicio, fin, 'day', '[]')) {
      diasConPedidos.add(fecha.format('YYYY-MM-DD'));
    }
  });
});

const diasOrdenados = [...diasConPedidos].sort();



    if (diasConPedidos.size === 0) {
      alert('No hay pedidos en el rango seleccionado para exportar.');
      return;
    }

   let hojas = 0;
let hayTartas = false; // 🧠 Lo agregamos acá

    
    for (const diaStr of diasOrdenados) {
      const fecha = dayjs(diaStr);
      const fechaES = fecha.locale('es');
      const titulo = `${fechaES.format('dddd').toUpperCase()} ${fechaES.format('DD/MM')}`;
      
      const norm = (s='') => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
      const wantNorm = norm(fechaES.format('dddd'));
      const wantTag = fechaES.format('DD/MM');
      
      const dataDia = {};
 
    const pedidosDelDia = [];

pedidos.forEach(p => {
  const fechasPorDia = p.pedido?.fecha_dia_por_dia || {};
  const diarios = p.pedido?.diarios || {};
  const tartas = p.pedido?.tartas || {};
  let tienePlatosEnEsteDia = false;

  // 🟢 Buscar platos diarios por fecha
  Object.entries(fechasPorDia).forEach(([diaKey, fechaStr]) => {
    const fechaDia = dayjs(fechaStr);
    if (fechaDia.isValid() && fechaDia.isSame(fecha, 'day')) {
      tienePlatosEnEsteDia = true;
    }
  });

  // 🟢 Buscar por clave "lunes", "martes", etc
  Object.keys(diarios).forEach(diaKey => {
    const diaBase = norm(String(diaKey).split(' ')[0]);
    if (diaBase === wantNorm || String(diaKey).includes(wantTag)) {
      tienePlatosEnEsteDia = true;
    }
  });

  // 🔥 NUEVO: incluir tartas
  const fechaTarta = dayjs(p.fecha_entrega_tartas || p.fecha);
  if (
    tartas && Object.keys(tartas).length > 0 &&
    fechaTarta.isValid() && fechaTarta.isSame(fecha, 'day')
  ) {
    tienePlatosEnEsteDia = true;
  }

  if (tienePlatosEnEsteDia) {
    pedidosDelDia.push(p);
  }
});
;

      const pickPlatosParaEsteDia = (diariosObj = {}) => {
        let found = Object.keys(diariosObj).find(k => 
          norm(String(k).split(' ')[0]) === wantNorm || String(k).includes(wantTag)
        );
        if (found) return diariosObj[found] || {};
        const ks = Object.keys(diariosObj);
        if (ks.length === 1) return diariosObj[ks[0]] || {};
        const merged = {};
        ks.forEach(k => {
          Object.entries(diariosObj[k] || {}).forEach(([pl, c]) => {
            const n = xlNum(c);
            if (n>0) merged[pl] = (merged[pl]||0) + n;
          });
        });
        return merged;
      };

      pedidosDelDia.forEach(p => {
        const platos = pickPlatosParaEsteDia(p.pedido?.diarios || {});
        Object.entries(platos).forEach(([plKey, c]) => {
          const n = xlNum(c);
          if (!n) return;
          const nombre = xlPlain(resolveNombrePlato(plKey, 'diarios', nameMap));
          dataDia[nombre] = (dataDia[nombre] || 0) + n;
        });
      });



      const rows = [];
      const boldAt = [];

      rows.push([titulo]);
      boldAt.push([rows.length, 1]);
      rows.push(['']);

   // ⛔️ Si SOLO hay tartas en este día, no crear hoja
const tienePlatosNoTarta = Object.keys(dataDia).some(nombrePlato => {
  return !nombrePlato.toLowerCase().includes('tarta');
});

if (!Object.keys(dataDia).length || !tienePlatosNoTarta) {
  // ⛔️ Saltar este día si no hay platos diarios ni extras
  continue;
}
 {
        const platos = Object.keys(dataDia).sort((a,b)=>a.localeCompare(b,'es',{sensitivity:'base'}));
        const mitad = Math.ceil(platos.length/2);
        const izq = platos.slice(0, mitad);
        const der = platos.slice(mitad);

  const getPedidosPorPlatoConCant = (platoHumano) => {
  const lista = pedidosDelDia.flatMap(p => {
    const resultados = [];

    // 🔍 Buscar en diarios
    const diarios = p.pedido?.diarios || {};
    const platos = pickPlatosParaEsteDia(diarios);
    for (const [plKey, c] of Object.entries(platos || {})) {
      const nombre = xlPlain(resolveNombrePlato(plKey, 'diarios', nameMap));
      const n = xlNum(c);
      if (nombre === xlPlain(platoHumano) && n > 0) {
        resultados.push({ p, cant: n });
      }
    }

    // 🔍 Buscar en tartas para este día
    const fechaTarta = dayjs(p.fecha_entrega_tartas || p.fecha);
    if (
      p.pedido?.tartas &&
      Object.keys(p.pedido.tartas).length > 0 &&
      fechaTarta.isValid() &&
      fechaTarta.isSame(fecha, 'day')
    ) {
      for (const [key, c] of Object.entries(p.pedido.tartas)) {
        const nombre = xlPlain(resolveNombrePlato(key, 'tartas', nameMap));
        const n = xlNum(c);
        if (nombre === xlPlain(platoHumano) && n > 0) {
          resultados.push({ p, cant: n });
        }
      }
    }

    return resultados;
  });

  return lista.sort((a, b) => {
    const nombreA = xlPlain(a.p?.usuario?.apellido || a.p?.apellido || '') +
                    xlPlain(a.p?.usuario?.nombre || a.p?.nombre || '');
    const nombreB = xlPlain(b.p?.usuario?.apellido || b.p?.apellido || '') +
                    xlPlain(b.p?.usuario?.nombre || b.p?.nombre || '');
    return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' });
  });
};


        const dumpBloque = (listaPlatos) => {
          const bloque = [];
          const boldLocal = [];
          listaPlatos.forEach(pl => {
            bloque.push([xlPlain(pl).toUpperCase(), 'CANT', 'NOTA ADMIN']);
            boldLocal.push([bloque.length, 1]);
            const lista = getPedidosPorPlatoConCant(pl);
            if (!lista.length) {
              bloque.push(['—', '', '']);
            } else {
              lista.forEach(({ p, cant }) => {
                const apellido = xlPlain(p?.usuario?.apellido || p?.apellido || '');
                const nombre = xlPlain(p?.usuario?.nombre || p?.nombre || '');
                const full = (apellido || nombre) ? `${apellido} ${nombre}`.trim() : '—';
                const obsUsuario = xlPlain(p.observaciones || '');
                const nombreCompleto = obsUsuario ? `${full}\n[Obs: ${obsUsuario}]` : full;
                const notaAdmin = xlPlain(p.nota_admin || '');
                bloque.push([nombreCompleto, xlNum(cant), notaAdmin]);
              });
            }
            bloque.push(['TOTAL', xlNum(dataDia[pl]), '']);
            boldLocal.push([bloque.length, 1], [bloque.length, 2]);
            bloque.push(['', '', '']);
          });
          return { bloque, boldLocal };
        };

        const L = dumpBloque(izq);
        const R = dumpBloque(der);
        const maxLen = Math.max(L.bloque.length, R.bloque.length);
        while (L.bloque.length < maxLen) L.bloque.push(['', '', '']);
        while (R.bloque.length < maxLen) R.bloque.push(['', '', '']);

        for (let i = 0; i < maxLen; i++) {
          const l = L.bloque[i], r = R.bloque[i];
          const rowStart = rows.length + 1;
          rows.push([l[0], l[1], l[2], '', r[0], r[1], r[2], '']);
          const iLocal = i + 1;
          if (L.boldLocal.some(([ri,ci]) => ri === iLocal && ci === 1)) boldAt.push([rowStart, 1]);
          if (L.boldLocal.some(([ri,ci]) => ri === iLocal && ci === 2)) boldAt.push([rowStart, 2]);
          if (R.boldLocal.some(([ri,ci]) => ri === iLocal && ci === 1)) boldAt.push([rowStart, 5]);
          if (R.boldLocal.some(([ri,ci]) => ri === iLocal && ci === 2)) boldAt.push([rowStart, 6]);
        }

        rows.push(['']);
        rows.push(['RESUMEN', '', '', '', 'RESUMEN', '']);
        boldAt.push([rows.length, 1], [rows.length, 5]);

        const pairs = Object.entries(dataDia)
          .map(([k,v]) => [xlPlain(k), xlNum(v)])
          .sort((a,b)=>a[0].localeCompare(b[0],'es',{sensitivity:'base'}));
        const half = Math.ceil(pairs.length/2);
        const leftPairs = pairs.slice(0, half);
        const rightPairs = pairs.slice(half);
        const maxR = Math.max(leftPairs.length, rightPairs.length);

        for (let i=0; i<maxR; i++) {
          const lp = leftPairs[i];
          const rp = rightPairs[i];
          rows.push([
            lp ? lp[0] : '', lp ? lp[1] : '', '', '',
            rp ? rp[0] : '', rp ? rp[1] : '', '', ''
          ]);
        }

        const totalLeft = leftPairs.reduce((a,[,n]) => a + n, 0);
        const totalRight = rightPairs.reduce((a,[,n]) => a + n, 0);
        rows.push(['TOTAL', totalLeft, '', '', 'TOTAL', totalRight, '', '']);
        boldAt.push([rows.length, 1], [rows.length, 2], [rows.length, 5], [rows.length, 6]);
        rows.push(['']);
        rows.push(['TOTAL GENERAL DE PLATOS', totalLeft + totalRight]);
        boldAt.push([rows.length, 1], [rows.length, 2]);
      }

      const sheet = workbook.addWorksheet(sheetSafeName(titulo));
      rows.forEach(r => {
        const row = r.map(v => typeof v === 'number' ? xlNum(v) : xlPlain(v));
        sheet.addRow(row);
      });

      try {
        sheet.getColumn(1).width = 30;
        sheet.getColumn(2).width = 8;
        sheet.getColumn(3).width = 30;
        sheet.getColumn(5).width = 30;
        sheet.getColumn(6).width = 8;
        sheet.getColumn(7).width = 30;
      } catch {}

      boldAt.forEach(([ri, ci]) => {
        const cell = sheet.getRow(ri).getCell(ci);
        cell.font = { bold: true };
      });

      hojas++;
    }




    // 🔥 HOJA EXTRA: TARTAS
// 🔥 HOJA EXTRA: TARTAS
const hojaTartas = workbook.addWorksheet('TARTAS');
const listaTartas = [];

pedidos.forEach(p => {
  const tartas = p.pedido?.tartas || {};
  const fechaTarta = dayjs(p.fecha_entrega_tartas || p.fecha);
  if (!fechaTarta.isValid() || !fechaTarta.isBetween(inicio, fin, 'day', '[]')) return;

  Object.entries(tartas).forEach(([tartaKey, cantidad]) => {
    const cant = xlNum(cantidad);
    if (cant <= 0) return;

    const nombreTarta = xlPlain(resolveNombrePlato(tartaKey, 'tartas', nameMap));
    const apellido = xlPlain(p?.usuario?.apellido || p?.apellido || '');
    const nombre = xlPlain(p?.usuario?.nombre || p?.nombre || '');
    const fullName = `${apellido} ${nombre}`.trim();

    listaTartas.push({
      tarta: nombreTarta,
      cantidad: cant,
      usuario: fullName
    });
  });
});

// Ordenar por nombre de tarta, luego por usuario
listaTartas.sort((a, b) => {
  const tartaCmp = a.tarta.localeCompare(b.tarta, 'es', { sensitivity: 'base' });
  if (tartaCmp !== 0) return tartaCmp;
  return a.usuario.localeCompare(b.usuario, 'es', { sensitivity: 'base' });
});

if (listaTartas.length > 0) {
  hayTartas = true; // ✅ IMPORTANTE: así evitamos el alert de error

  hojaTartas.addRow(['🥧 Tarta', 'Cantidad', 'Usuario']);
  hojaTartas.getRow(1).font = { bold: true };

  const totales = {};

  listaTartas.forEach(item => {
    hojaTartas.addRow([item.tarta, item.cantidad, item.usuario]);
    totales[item.tarta] = (totales[item.tarta] || 0) + item.cantidad;
  });

  hojaTartas.addRow([]);

  hojaTartas.addRow(['TOTAL POR TARTA']);
  hojaTartas.getRow(hojaTartas.rowCount).font = { bold: true };

  Object.entries(totales).forEach(([tarta, total]) => {
    hojaTartas.addRow([tarta, total]);
  });

  try {
    hojaTartas.getColumn(1).width = 30;
    hojaTartas.getColumn(2).width = 10;
    hojaTartas.getColumn(3).width = 30;
  } catch {}
}


    const buffer = await workbook.xlsx.writeBuffer({ useSharedStrings: false });
    if (!hojas && !hayTartas) {
  alert('No se generaron hojas. Verifica que haya datos para exportar.');
  return;
}
    saveAs(new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }), `Produccion-${sufijo}.xlsx`);
    
    enqueueSnackbar(`✅ Excel exportado: ${hojas} días`, { variant: 'success' });
  };

  const handleGuardarCambios = async (pedidoId, itemsActualizados, notaAdmin) => {
    try {
      await api.put(`/orders/${pedidoId}/update-items`, { items: itemsActualizados });
      if (notaAdmin !== undefined) {
        await api.put(`/orders/${pedidoId}/nota`, { nota_admin: notaAdmin });
      }
      enqueueSnackbar('✅ Cambios guardados correctamente', { variant: 'success' });
      await fetchPedidos();
    } catch (err) {
      console.error('❌ Error completo:', err);
      const mensaje = err.response?.data?.error || err.message || 'Error desconocido';
      enqueueSnackbar(`❌ ${mensaje}`, { variant: 'error' });
    }
  };

  const PedidosIndividuales = () => {
    if (pedidos.length === 0) {
      return (
        <Card sx={{ mt: 4, backgroundColor: '#fff3cd', border: '1px solid #ffeaa7' }}>
          <CardContent>
            <Typography variant="h6" textAlign="center" color="warning.main">
              ⚠️ No se encontraron pedidos para el rango seleccionado
            </Typography>
          </CardContent>
        </Card>
      );
    }
    return (
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h5" textAlign="center" sx={{ mb: 2 }}>
            📋 Pedidos Encontrados ({pedidos.length})
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {pedidos.slice(0, 5).map((pedido, index) => (
            <Box key={pedido._id || index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
              <Typography variant="subtitle2">
                <strong>{getNombreConEmpresa(pedido)}</strong>
              </Typography>
<Box>

{Object.entries(pedido.pedido?.diarios || {}).map(([diaCompleto, platos]) => {
  const diaBase = diaCompleto.split(' ')[0]; // "jueves"
  const fechaStr = pedido.pedido?.fecha_dia_por_dia?.[diaBase];
  const fecha = dayjs(fechaStr);

  if (!fecha.isValid()) return null;

  const claveUI = `${fecha.locale('es').format('dddd').charAt(0).toUpperCase() + fecha.locale('es').format('dddd').slice(1)} ${fecha.format('DD/MM/YYYY')}`;

  const extras = pedido.pedido?.extras?.[diaCompleto] || {};

  return (
    <Box key={diaCompleto} sx={{ mb: 1 }}>
      <Typography variant="body2" color="text.secondary">📅 {claveUI}</Typography>

      {Object.entries(platos).map(([id, cantidad]) => (
        <Typography key={id} variant="body2" sx={{ pl: 2 }}>
       
        </Typography>
      ))}

      {Object.entries(extras).map(([id, cantidad]) => (
        <Typography key={id} variant="body2" sx={{ pl: 2 }}>
          🧃 {resolveNombrePlato(id, 'extras', nameMap)} x {cantidad}
        </Typography>
      ))}
    </Box>
  );
})}

  {/* Tartas */}
  {pedido.pedido?.tartas && Object.keys(pedido.pedido.tartas).length > 0 && pedido.fecha_entrega_tartas && (
    <Box sx={{ mt: 1 }}>
      <Typography variant="body2" color="text.secondary">
        🥧 Tartas: {dayjs(pedido.fecha_entrega_tartas).locale('es').format('dddd DD/MM/YYYY')
}
      </Typography>
      {Object.entries(pedido.pedido.tartas).map(([key, cantidad]) => (
        <Typography key={key} variant="body2" sx={{ pl: 2 }}>
          🥧 {key} x {cantidad}
        </Typography>
      ))}
    </Box>
  )}

  {/* Tipo de menú */}
  {pedido.tipo_menu && (
    <Typography variant="body2" color="text.secondary">
      🍽️ {pedido.tipo_menu}
    </Typography>
  )}
</Box>


              {pedido.observaciones && (
                <Typography variant="body2" color="text.secondary">
                  💬 {pedido.observaciones}
                </Typography>
              )}
            </Box>
          ))}
          {pedidos.length > 5 && (
            <Typography textAlign="center" color="text.secondary">
              ... y {pedidos.length - 5} pedidos más
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  };

  const ResumenPorDias = () => {
    return (
      <Box sx={{ mt: 4 }}>
        {Object.entries(resumen).map(([claveDia, platosDelDia]) => {
          if (claveDia === 'TARTAS') return null;
          const obsDelDia = observaciones[claveDia] || [];
          if (Object.keys(platosDelDia).length === 0) return null;
          return (
            <Card key={claveDia} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  📅 {claveDia}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {Object.entries(platosDelDia).map(([plato, cantidad]) => (
                  <Typography key={plato} sx={{ mb: 1 }}>
                    🍽️ <strong>{plato}</strong>: {cantidad} unidades
                  </Typography>
                ))}
                {obsDelDia.length > 0 && (
                  <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      💬 Observaciones:
                    </Typography>
                    {obsDelDia.map((obs, index) => (
                      <Typography key={index} variant="body2" sx={{ fontSize: '0.85rem' }}>
                        {obs}
                      </Typography>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })}
        {resumen.TARTAS && Object.keys(resumen.TARTAS).length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: 'secondary.main' }}>
                🍰 TARTAS
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {Object.entries(resumen.TARTAS).map(([tarta, cantidad]) => (
                <Typography key={tarta} sx={{ mb: 1 }}>
                  🍰 <strong>{tarta}</strong>: {cantidad} unidades
                </Typography>
              ))}
              {observaciones.TARTAS && observaciones.TARTAS.length > 0 && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    💬 Observaciones:
                  </Typography>
                  {observaciones.TARTAS.map((obs, index) => (
                    <Typography key={index} variant="body2" sx={{ fontSize: '0.85rem' }}>
                      {obs}
                    </Typography>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    );
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
          <select value={tipoMenu} onChange={e => setTipoMenu(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="usuario">Usuarios individuales</option>
            <option value="empresa">Empresas</option>
          </select>

          <label><strong>Filtrar por:</strong></label>
          <select value={filtroTiempo} onChange={e => setFiltroTiempo(e.target.value)} disabled={usarRangoPersonalizado}>
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
              <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
            </Box>
            <Box>
              <label>Hasta:</label>
              <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
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
        <Button variant="contained" color="success" onClick={exportarExcelSeguro}>
          📘 Exportar Excel
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
          <PedidosIndividuales />

          <Card sx={{ mt: 4, backgroundColor: '#f0f0f0' }}>
            <CardContent>
              <Typography variant="h5" textAlign="center" sx={{ mb: 2 }}>
                📦 Total Producción
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {Object.keys(totalProduccion).length === 0 ? (
                <Typography textAlign="center" color="text.secondary">
                  No hay datos de producción para mostrar
                </Typography>
              ) : (
                Object.entries(totalProduccion).map(([platoKey, cantidad]) => {
                  const legible = resolveNombreAny(platoKey, 'diarios', nameMap) ||
                                  resolveNombreAny(platoKey, 'extras',  nameMap) ||
                                  resolveNombreAny(platoKey, 'tartas',  nameMap);
                  return (
                    <Typography key={platoKey} textAlign="center" sx={{ mb: 1 }}>
                      🍽️ <strong>{legible}</strong>: {cantidad}
                    </Typography>
                  );
                })
              )}
            </CardContent>
          </Card>

          <ResumenPorDias />

          <Box sx={{ mt: 6 }}>
            <ProduccionEditablePorDia
              pedidos={pedidos}
              nameMap={nameMap}
              onGuardarCambios={handleGuardarCambios}
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default ProduccionResumen;