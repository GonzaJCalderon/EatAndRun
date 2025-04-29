// src/utils/helpers.js
export const getPlatoKey = (plato) => {
    return (plato.id || plato.nombre || '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_');  // reemplaza espacios por guiones bajos
  };
  