// src/utils/dedupe.js

/**
 * Deduplica un array de objetos por `nombre` + `descripcion`
 * útil para platos, menús, etc.
 */
export function dedupeByContenido(arr = []) {
  const seen = new Set();

  return arr.filter((item) => {
    const nombre = item.nombre?.trim().toLowerCase() || '';
    const descripcion = item.descripcion?.trim().toLowerCase() || '';
    const key = `${nombre}|${descripcion}`;

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}


