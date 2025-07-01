import { useEffect, useState } from 'react';
import axios from 'axios';

export const useSemanaActiva = () => {
  const [semana, setSemana] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSemana = async () => {
      try {
    const res = await axios.get('https://eatandrun-back-production.up.railway.app/api/menu/semana/actual'); // ✅

        setSemana(res.data);
      } catch (err) {
        setSemana(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSemana();
  }, []);

  return { semana, loading };
};
