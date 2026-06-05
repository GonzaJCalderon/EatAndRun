// utils/getTartaPrecios.js
import api from '../api/api';

export const getTartaPrecios = async () => {
  const res = await api.get('/tartas');
  const precios = {};
  res.data.forEach((tarta) => {
    precios[tarta.key] = tarta.precio;
  });
  return precios;
};
