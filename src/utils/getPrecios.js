// src/utils/getPrecios.js

export const getPrecios = () => {
  const guardado = localStorage.getItem('precios_eatandrun');

  return guardado
    ? JSON.parse(guardado)
    : {
        plato: 6300,
        envio: 900,
        tarta: 13500,
        postre: 2800,
        ensalada: 2800,
        proteina: 3500,
        descuento_por_plato: 200, // 💸 nuevo campo
        umbral_descuento: 5       // 💡 nuevo campo
      };
};
