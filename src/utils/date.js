// src/utils/date.js

export const getSemanaActualRange = () => {
  const hoy = new Date();
  const dia = hoy.getDay(); // 0 = domingo, 1 = lunes...

  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - ((dia + 6) % 7));
  lunes.setHours(0, 0, 0, 0);

  const viernes = new Date(lunes);
  viernes.setDate(lunes.getDate() + 4);
  viernes.setHours(23, 59, 59, 999);

  return { lunes, viernes };
};
