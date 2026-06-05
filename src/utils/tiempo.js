// src/utils/fecha.js
import dayjs from './dayjs'; // ✅ usamos el dayjs ya configurado

const HORA_CORTE = 6;

export const getFechaOperativa = () => {
  const ahora = dayjs();
  return ahora.hour() < HORA_CORTE ? ahora.subtract(1, 'day') : ahora;
};

export const getDiaOperativoNombre = () => {
  return getFechaOperativa().format('dddd'); // ej: "miércoles"
};

export const esHoyOperativo = (fecha) => {
  return dayjs(fecha).isSame(getFechaOperativa(), 'day');
};

// 🔹 Lunes de la semana actual (según fecha operativa)
export const getLunesSemanaActual = () => {
  const fecha = getFechaOperativa();
  return fecha.startOf('week').add(1, 'day'); // lunes
};

// 🔹 Lunes de la próxima semana
export const getLunesProximaSemana = () => {
  const lunesActual = getLunesSemanaActual();
  return lunesActual.add(7, 'day');
};

// 🔹 Rango de semana actual (lunes a viernes)
export const getSemanaActualRange = () => {
  const lunes = getLunesSemanaActual();
  const viernes = lunes.add(4, 'day').endOf('day');

  return {
    lunes: lunes.toDate(),
    viernes: viernes.toDate()
  };
};

export default dayjs;
