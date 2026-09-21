import { useEffect, useState } from 'react';
import api from '../api/api';
import dayjs from '../utils/day';

const TZ = 'America/Argentina/Buenos_Aires';
const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

// nombre del día (lunes..viernes) sin acentos
const diaKey = (dateStr) =>
  dayjs.tz(dateStr, TZ)
    .format('dddd')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const useMenuSemanal = (role = 'usuario') => {
  const [menuPorDia, setMenuPorDia] = useState({});
  const [semanaActual, setSemanaActual] = useState(null);
  const [semanasDisponibles, setSemanasDisponibles] = useState([]);
  const [tartasDisponibles, setTartasDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelado = false;

    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/semana/disponibles');
        const semanas = data?.semanas || [];

        if (semanas.length === 0) {
          console.warn('❌ No hay semanas disponibles');
          if (!cancelado) {
            setSemanaActual(null);
            setMenuPorDia({});
            setTartasDisponibles([]);
            setSemanasDisponibles([]);
          }
          return;
        }

        const semanasValidas = semanas.filter(s => s.habilitado);
        const hoy = dayjs().tz(TZ).startOf('day');

        // Ordenar por fecha de inicio
        const ordenadas = [...semanasValidas].sort((a, b) =>
          dayjs(a.semana_inicio).isAfter(dayjs(b.semana_inicio)) ? 1 : -1
        );

// 🔍 Buscar la primera semana que AÚN ESTÉ ABIERTA para pedidos
const actual = ordenadas.find(s => {
  const cierre = s.cierre
    ? dayjs(s.cierre).tz(TZ).endOf('day')
    : dayjs(s.semana_fin).tz(TZ).endOf('day');
  return hoy.isSameOrBefore(cierre);
}) || ordenadas.find(s => {
  // Si no hay ninguna abierta, caemos en la que está visualmente activa
  const inicio = dayjs(s.semana_inicio).tz(TZ).startOf('day');
  const finVisualizacion = dayjs(s.semana_fin).tz(TZ).add(2, 'day').endOf('day');
  return hoy.isBetween(inicio, finVisualizacion, null, '[]'); 
}) || ordenadas.filter(s => dayjs(s.semana_fin).tz(TZ).add(2, 'day').endOf('day').isSameOrAfter(hoy))[0];

// ✅ Filtrar semanas habilitadas que aún sean visibles (hasta el domingo posterior a la semana_fin)
const semanasUsar = ordenadas.filter(s => {
  const finVisualizacion = dayjs(s.semana_fin).tz(TZ).add(2, 'day').endOf('day');
  return hoy.isSameOrBefore(finVisualizacion);
}).slice(0, 2); // Máximo 2


        // Debug logs
        console.log('🧪 Semanas ordenadas:', ordenadas.map(s => s.semana_inicio));
        console.log('📌 Semana actual detectada:', actual?.semana_inicio);
        console.log('🟩 Semanas visibles (semanasUsar):', semanasUsar.map(s => s.semana_inicio));

        if (!cancelado) {
          setSemanaActual(actual || null);
          setSemanasDisponibles(semanasUsar);
        }

        // Obtener platos fijos
        const fijosResp = await api.get('/fixed').then(res => res.data || []);
        const fijosNormalizados = fijosResp.map(p => ({
          id: p.id,
          nombre: p.name || p.nombre || '',
          descripcion: p.description || p.descripcion || '',
          img: p.image_url || p.img || '',
          tipo: 'fijo'
        }));

        const menuCompleto = {};

        // Para cada semana activa
        for (const semana of semanasUsar) {
          const { semana_inicio, semana_fin, dias_habilitados } = semana;
          const agrupado = await api.get(`/menu/semana?id=${semana.id}`).then(res => res.data || {});
          const inicio = dayjs(semana_inicio);
          const fin = dayjs(semana_fin);

          const dayMap = {
            monday: 'lunes',
            tuesday: 'martes',
            wednesday: 'miercoles',
            thursday: 'jueves',
            friday: 'viernes'
          };

          for (let d = inicio; !d.isAfter(fin, 'day'); d = d.add(1, 'day')) {
            const fechaStr = d.format('YYYY-MM-DD');
            const key = diaKey(fechaStr);
            const diaEsp = dayMap[key];

            if (!diaEsp || !dias_habilitados?.[diaEsp]) continue;

            const especialesRaw = agrupado?.[diaEsp]?.especiales || [];
            const especialesDelDia = especialesRaw.map(p => ({
              id: p.id,
              nombre: p.name || p.nombre || '',
              descripcion: p.description || p.descripcion || '',
              img: p.image_url || p.img || '',
              tipo: 'especial',
              date: fechaStr
            }));

            const clave = `${diaEsp}-${fechaStr}`;
            menuCompleto[clave] = {
              fecha: fechaStr,
              fijos: fijosNormalizados,
              especiales: especialesDelDia,
              extras: []
            };
          }
        }

        if (!cancelado) setMenuPorDia(menuCompleto);

        // Cargar tartas
        try {
          const resT = await api.get('/tartas');
          const tartas = Array.isArray(resT.data) ? resT.data : [];
          const mapT = tartas.map(t => ({
            id: t.key,
            nombre: t.nombre,
            descripcion: t.descripcion,
            img: t.img,
            tipo: 'tarta'
          }));
          if (!cancelado) setTartasDisponibles(mapT);
        } catch {
          if (!cancelado) setTartasDisponibles([]);
        }

      } catch (e) {
        console.error('❌ Error cargando menú semanal:', e);
        if (!cancelado) {
          setMenuPorDia({});
          setSemanaActual(null);
          setTartasDisponibles([]);
          setSemanasDisponibles([]);
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();

    return () => { cancelado = true; };
  }, [role]);

  return {
    menuPorDia,
    semanaActual,
    semanasDisponibles,
    tartasDisponibles,
    loading
  };
};
