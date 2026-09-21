// 📁 src/utils/getTartaPrecios.js
import api from '../api/api';

export const getTartaPrecios = async () => {
  const res = await api.get('/tartas');
  return res.data.map(tarta => ({
    id: tarta.id,
    nombre: tarta.nombre,
    precio: tarta.precio
  }));
};
