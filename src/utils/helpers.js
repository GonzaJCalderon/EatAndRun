// src/utils/helpers.js

export const getPlatoKey = (plato) => {
  if (!plato) return '';
  // Si viene con id (ideal)
  if (plato.id) return String(plato.id);
  
  // Si no, generamos un slug a partir del nombre
  if (plato.nombre) {
    return plato.nombre.toLowerCase().replace(/\s+/g, '-');
  }

  // Fallback
  return JSON.stringify(plato);
};
