// utils/fechas.js
import dayjs from './day';

export const obtenerFechaDia = (pedido, diaTexto) => {
  const fechaPorDia = pedido?.fecha_dia_por_dia || {};
  let fechaStr = fechaPorDia[diaTexto.toLowerCase()] || fechaPorDia[diaTexto];

  if (fechaStr) return dayjs(fechaStr);

  const fechaBase = dayjs(pedido?.fecha || pedido?.fecha_entrega || pedido?.created_at);
  if (!fechaBase.isValid()) return null;

  const diasSemana = {
    'domingo': 0, 'lunes': 1, 'martes': 2, 'miércoles': 3, 'miercoles': 3,
    'jueves': 4, 'viernes': 5, 'sábado': 6, 'sabado': 6
  };

  const diaObjetivo = diasSemana[diaTexto.toLowerCase()];
  if (diaObjetivo === undefined) return fechaBase;

  const diaDelPedido = fechaBase.day();
  const diferencia = diaObjetivo - diaDelPedido;

  return fechaBase.add(diferencia, 'day');
};
