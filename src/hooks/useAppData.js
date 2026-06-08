import { useEffect, useState, useMemo } from 'react';
import { mapearRoleIdANombre } from '../utils/roles';
import { dedupeByContenido } from '../utils/dedupe';
import api from '../api/api';

import dayjs from '../utils/day';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');

export const useAppData = (user, semanaActiva, menuFijosPorRol, setMenuFijosPorRol) => {
  const [menuData, setMenuData] = useState({});
  const [tartasDisponibles, setTartasDisponibles] = useState([]);
  const [menuListo, setMenuListo] = useState(false);

  const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

  // 📦 1. Cargar menú semanal agrupado desde /daily/semanal
  const [especialesPorDia, setEspecialesPorDia] = useState({});

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const res = await api.get('/daily/semanal');
        const data = res.data;

        const agrupado = {};

        for (const dia of dias) {
          agrupado[dia] = (data[dia]?.especiales || []).map(p => ({
            ...p,
            nombre: p.name,
            descripcion: p.description,
            img: p.image_url,
            cantidad: 0,
            id: p.id?.toString(),
            tipo: 'daily',
            dia
          }));
        }

        setEspecialesPorDia(agrupado);
      } catch (err) {
        console.error('❌ Error al cargar menú semanal:', err);
      }
    };

    load();
  }, [user]);

  // 📦 2. Cargar Platos Fijos
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const res = await api.get('/fixed');
        const platos = Array.isArray(res.data)
          ? res.data.map(p => ({
              nombre: p.name,
              descripcion: p.description,
              img: p.image_url,
              cantidad: 0,
              id: p.id?.toString() || p._id?.toString(),
              tipo: 'fijo',
              available_days: p.available_days || ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']
            }))
          : [];

        setMenuFijosPorRol({ usuario: platos, empresa: platos });
      } catch (err) {
        console.error('❌ Error al cargar menú fijo:', err);
      }
    };

    load();
  }, [user]);

  // 🧁 3. Cargar Tartas
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const res = await api.get('/tartas');
        const data = res.data;

        const mapped = Array.isArray(data)
          ? data.reduce((acc, tarta) => {
              acc[tarta.key] = {
                label: tarta.nombre,
                descripcion: tarta.descripcion,
                img: tarta.img
              };
              return acc;
            }, {})
          : {};
        setTartasDisponibles(mapped);
      } catch (err) {
        console.error('❌ Error al cargar tartas:', err);
      }
    };

    load();
  }, [user]);

  // 🧠 4. Armar menuData final
  useEffect(() => {
    if (!user || !semanaActiva || !menuFijosPorRol) return;

    const roleName = mapearRoleIdANombre(user.role);
    const fijosRol =
      roleName === 'admin'
        ? dedupeByContenido([
            ...(menuFijosPorRol.usuario || []).map(p => ({ ...p, rol: 'usuario' })),
            ...(menuFijosPorRol.empresa || []).map(p => ({ ...p, rol: 'empresa' }))
          ])
        : menuFijosPorRol[roleName] || [];

    const nuevoMenuData = {};

    dias.forEach(dia => {
      const habilitado = semanaActiva.dias_habilitados?.[dia] ?? false;

      const especialesDia = especialesPorDia[dia] || [];

      const especialesCombinados = especialesDia.map(p => ({
        ...p,
        nombre: p.nombre?.trim(),
        descripcion: p.descripcion?.trim() || '',
        img: p.img || null,
        tipo: 'daily',
        id: p.id?.toString()
      }));

      const especialesSinDuplicados = dedupeByContenido(especialesCombinados);

      nuevoMenuData[dia] = {
        habilitado,
        fijos: habilitado ? fijosRol.filter(p => p.available_days && p.available_days.includes(dia)).map(p => ({ ...p, tipo: 'fijo' })) : [],
        especiales: habilitado ? especialesSinDuplicados : []
      };
    });

    setMenuData(nuevoMenuData);
    setMenuListo(true);
  }, [especialesPorDia, menuFijosPorRol, semanaActiva]);

  return {
    menuData,
    tartasDisponibles,
    menuListo
  };
};
