import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import dayjs from '../utils/day';

const CountdownBanner = () => {
  const [timeLeft, setTimeLeft] = useState('');
  const [cerrado, setCerrado] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const TZ = 'America/Argentina/Buenos_Aires';
      const ahora = dayjs().tz(TZ);

      // Siguiente sábado a las 20:00 hs
      let proximoSabado = ahora.day(6).set('hour', 20).set('minute', 0).set('second', 0);
      if (ahora.isAfter(proximoSabado)) {
        proximoSabado = proximoSabado.add(1, 'week');
      }

      const diffSec = proximoSabado.diff(ahora, 'second');
      if (diffSec <= 0) {
        setCerrado(true);
        setTimeLeft('Cierre de pedidos alcanzado');
        return;
      }

      const dias = Math.floor(diffSec / (3600 * 24));
      const horas = Math.floor((diffSec % (3600 * 24)) / 3600);
      const minutos = Math.floor((diffSec % 3600) / 60);
      const segundos = diffSec % 60;

      setCerrado(false);
      setTimeLeft(`${dias > 0 ? `${dias}d ` : ''}${horas}h ${minutos}m ${segundos}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: cerrado ? '#b71c1c' : '#2e5b27',
        color: '#ffffff',
        py: 0.8,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        borderBottom: '1px solid rgba(255,255,255,0.15)'
      }}
    >
      <TimerIcon sx={{ fontSize: 16, color: '#a7f3d0' }} />
      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#ffffff', letterSpacing: '0.2px' }}>
        {cerrado
          ? '🔒 Pedidos de la semana cerrados. Realizá tu pedido para la próxima semana.'
          : `⏱️ Tenés hasta el Sábado a las 20:00 hs para pedir o editar tu vianda (Quedan: ${timeLeft})`}
      </Typography>
    </Box>
  );
};

export default CountdownBanner;
