// src/utils/tartaUtils.js

export let tartaLabelMap = {};

export const setTartaLabelMap = (dataArray) => {
  tartaLabelMap = dataArray.reduce((acc, tarta) => {
    if (tarta.key) {
      acc[tarta.key] = tarta.nombre;
    }
    return acc;
  }, {});
};
