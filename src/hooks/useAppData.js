// src/hooks/useMenusPorFecha.js
import { useEffect, useState } from 'react';
import api from '../api/api';
import dayjs from '../utils/day';

const TZ = 'America/Argentina/Buenos_Aires';

export const useMenusPorFecha = () => {
  const [menusPorFecha, setMenusPorFecha] = useState({});
  const [tartasDisponibles, setTartasDisponibles] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // 🗓️ 1. Traer semanas activas
        const resSemanas = await api.get('/semana/activas');
        const semanas = resSemanas.data.semanas || [];

        const mapa = {};

        semanas.forEach((semana) => {
          const start = dayjs.utc(semana.fecha_inicio).tz(TZ);
          const end = dayjs.utc(semana.fecha_fin).tz(TZ);

          for (let d = start; d.isSameOrBefore(end); d = d.add(1, 'day')) {
            const fecha = d.format('YYYY-MM-DD');
            const nombreDia = d.format('dddd').toLowerCase();

            if (semana.dias_habilitados?.[nombreDia]) {
              mapa[fecha] = {
                semanaId: semana.id,
                fecha,
                nombreDia,
                fijos: semana.fijos || [],
                especiales: semana.especiales?.[nombreDia] || [],
                extras: semana.extras?.[nombreDia] || []
              };
            }
          }
        });

        setMenusPorFecha(mapa);

        // 🧁 2. Traer tartas
        const resTartas = await api.get('/tartas');
        const tartasRaw = resTartas.data;

        const tartasMapeadas = Array.isArray(tartasRaw)
          ? tartasRaw.reduce((acc, tarta) => {
              acc[tarta.key] = {
                label: tarta.nombre,
                descripcion: tarta.descripcion,
                img: tarta.img
              };
              return acc;
            }, {})
          : {};

        setTartasDisponibles(tartasMapeadas);
      } catch (err) {
        console.error('❌ Error al cargar menú por fecha:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  return {
    menusPorFecha,
    tartasDisponibles,
    loading
  };
};
