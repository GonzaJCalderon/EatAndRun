import { useEffect, useState } from 'react';
import api from '../api/api';

export const usePreciosCompletos = () => {
  const [precios, setPrecios] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarPrecios = async () => {
      try {
        const res = await api.get('/config/precios');
        localStorage.setItem('precios_eatandrun', JSON.stringify(res.data));
        setPrecios(res.data);
        setLoading(false);
      } catch (err) {
        console.error('❌ Error al obtener precios:', err);
        setError(err);

        // fallback localStorage
        const local = localStorage.getItem('precios_eatandrun');
        if (local) {
          setPrecios(JSON.parse(local));
        } else {
          setPrecios({
            plato: 6300,
            envio: 900,
            tarta: 13500,
            postre: 2800,
            ensalada: 2800,
            proteina: 3500,
            descuento_por_plato: 200,
            umbral_descuento: 5
          });
        }

        setLoading(false);
      }
    };

    cargarPrecios();
  }, []);

  return { precios, loading, error };
};
