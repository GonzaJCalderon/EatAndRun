// src/utils/nombres.js

const extraMap = {
  "1": "🍰 Postre",
  "2": "🥗 Ensalada",
  "3": "💪 Proteína",
  "ID:1": "🍰 Postre",
  "ID:2": "🥗 Ensalada",
  "ID:3": "💪 Proteína"
};

const manualAliases = {
  '0': '👉 DEFINIR NOMBRE PARA ID 0',
  '8': '👉 DEFINIR NOMBRE PARA ID 8'
};

const humanizar = (s = '') =>
  String(s)
    .replace(/^ID:/i, '')
    .replace(/_/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/^\w|\s\w/g, c => c.toUpperCase());

export const resolveNombrePlato = (
  platoKey = '',
  categoria = 'diarios',
  nameMapLocal = {},
  extraMapLocal = extraMap
) => {
  const key = String(platoKey).trim();

  if (manualAliases[key]) return manualAliases[key];
  if (manualAliases[key.replace(/^ID:/i, '')]) {
    return manualAliases[key.replace(/^ID:/i, '')];
  }

  const idMatch = key.match(/^ID:(\d+)$/i);
  if (idMatch) {
    const id = idMatch[1];
    if (categoria === 'extras') return extraMapLocal[id] || `Extra ${id}`;
    const catMap = nameMapLocal[categoria] || {};
    return catMap[id] || `Plato ${id}`;
  }

  if (/^\d+$/.test(key)) {
    const catMap = nameMapLocal[categoria] || {};
    if (catMap[key]) return catMap[key];
    if (categoria === 'extras') return extraMapLocal[key] || `Extra ${key}`;
    return `Plato ${key}`;
  }

  const catMap = nameMapLocal[categoria] || {};
  if (catMap[key]) return catMap[key];
  return humanizar(key);
};
