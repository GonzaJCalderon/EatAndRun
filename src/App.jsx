import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  CircularProgress,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import InstagramIcon from '@mui/icons-material/Instagram';
import DayMenuCard from './components/DayMenuCard';
import LoginForm from './components/LoginForm';
import logo from './assets/eatandrun-logo.jpg';
import WhatsAppButton from './components/WhatsAppButton';
import PedidoConfirmado from './components/PedidoConfirmado'; // ✅ NUEVO componente

function App() {
  const [user, setUser] = useState(null);
  const [selecciones, setSelecciones] = useState({});
  const [bloqueado, setBloqueado] = useState(false);
  const [pedidoGuardado, setPedidoGuardado] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  const [menuData, setMenuData] = useState({});
  const [guardando, setGuardando] = useState(false); // Loader

  useEffect(() => {
    const data = localStorage.getItem('menu_eatandrun');
    if (data) {
      setMenuData(JSON.parse(data));
    } else {
      const menuInicial = {
        lunes: [],
        martes: [],
        miércoles: [],
        jueves: [],
        viernes: [],
      };
      localStorage.setItem('menu_eatandrun', JSON.stringify(menuInicial));
      setMenuData(menuInicial);
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('eatAndRunUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const ahora = new Date();
    const deadline = new Date();
    deadline.setDate(ahora.getDate() + ((7 - ahora.getDay()) % 7));
    deadline.setHours(20, 0, 0, 0);

    if (ahora > deadline) {
      setBloqueado(true);
    }
  }, []);

  const handleSelect = (dia, platosConCantidades) => {
    setSelecciones((prev) => ({
      ...prev,
      [dia]: platosConCantidades
    }));
  };

  const tienePlatosSeleccionados = (selecciones) => {
    return Object.values(selecciones).some(dia =>
      typeof dia === 'object' && Object.keys(dia).length > 0
    );
  };

  const handleGuardarPedido = () => {
    if (!tienePlatosSeleccionados(selecciones)) return;

    setGuardando(true);

    setTimeout(() => {
      const pedidoCompleto = {
        usuario: user,
        pedido: selecciones,
        observaciones: observaciones.trim(),
        fecha: new Date().toISOString()
      };

      const pedidosExistentes = JSON.parse(localStorage.getItem("pedidos_eatandrun")) || [];
      const pedidosFiltrados = pedidosExistentes.filter(p => p.usuario.email !== user.email);
      pedidosFiltrados.push(pedidoCompleto);

      localStorage.setItem("pedidos_eatandrun", JSON.stringify(pedidosFiltrados));
      localStorage.setItem(`pedido_${user.email}`, JSON.stringify(pedidoCompleto));

      setGuardando(false);
      setPedidoGuardado(true);
      setSelecciones({});
      setObservaciones('');

      // 🔥 Auto ocultar a los 5s
      setTimeout(() => {
        setPedidoGuardado(false);
      }, 5000);

    }, 2000); // Simula 2 segundos de carga
  };

  const handleLogout = () => {
    localStorage.removeItem('eatAndRunUser');
    setUser(null);
    setSelecciones({});
    setPedidoGuardado(false);
  };

  const handleVolverInicio = () => {
    setPedidoGuardado(false);
  };

  if (!user) {
    return (
      <Container maxWidth="sm">
        <LoginForm onLogin={setUser} />
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="sm" sx={{ mt: 4, pb: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <img
            src={logo}
            alt="Eat and Run Logo"
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              objectFit: 'cover',
              marginBottom: '10px'
            }}
          />
          <Typography variant="h5" fontWeight="bold">
            ¡Hola {user.nombre}! 🌱
          </Typography>
          <Typography variant="body1" sx={{ color: 'gray', mt: 1 }}>
            Acompañamos a quienes persiguen objetivos nutricionales y no tienen tiempo para cocinar.
          </Typography>
        </Box>

        {guardando ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 6 }}>
            <CircularProgress color="success" />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Guardando tu pedido...
            </Typography>
          </Box>
        ) : pedidoGuardado ? (
          <>
            <Box sx={{ textAlign: 'center', mt: 5 }}>
              <motion.img
                src={logo}
                alt="Logo éxito"
                initial={{ scale: 0 }}
                animate={{ rotate: [0, 10, -10, 0], scale: [0, 1.2, 1] }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  marginBottom: '20px'
                }}
              />
              <Typography variant="h5" fontWeight="bold" color="success.main" sx={{ mt: 2 }}>
                ¡Tu pedido fue registrado con éxito!
              </Typography>
            </Box>

            <PedidoConfirmado pedido={selecciones} />

            <Button
              onClick={handleVolverInicio}
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 4 }}
            >
              Volver al inicio
            </Button>
          </>
        ) : (
          <>
            {bloqueado ? (
              <Typography variant="body1" color="error" sx={{ mb: 2 }}>
                🚫 Ya no se pueden modificar los pedidos. ¡Te esperamos la próxima semana!
              </Typography>
            ) : (
              <>
                {Object.entries(menuData).map(([dia, opciones]) => (
                  <DayMenuCard
                    key={dia}
                    day={dia}
                    options={opciones}
                    selected={selecciones[dia] || ""}
                    onSelect={handleSelect}
                  />
                ))}

                <Typography variant="h6" sx={{ mt: 3 }}>
                  📝 Observaciones / Aclaraciones
                </Typography>
                <TextField
                  multiline
                  rows={3}
                  placeholder="Escribí aquí cualquier aclaración..."
                  fullWidth
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  sx={{ mt: 1, mb: 2 }}
                />

                <Button
                  onClick={handleGuardarPedido}
                  variant="contained"
                  color="success"
                  fullWidth
                  sx={{ mt: 2 }}
                  disabled={!tienePlatosSeleccionados(selecciones)}
                >
                  Confirmar pedido
                </Button>
              </>
            )}

            <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>📝 Tu pedido:</Typography>
            {tienePlatosSeleccionados(selecciones) ? (
              <ul style={{ paddingLeft: '20px' }}>
                {Object.entries(selecciones).map(([dia, platos]) => (
                  <li key={dia}>
                    <strong>{dia}:</strong> {Object.entries(platos).map(([platoKey, datos], index) => {
                      const nombreMostrar = datos?.nombreOriginal || platoKey;
                      const cantidadMostrar = typeof datos === 'object' ? datos?.cantidad ?? 0 : datos;
                      return `${nombreMostrar} x${cantidadMostrar}${index < Object.entries(platos).length - 1 ? ', ' : ''}`;
                    })}
                  </li>
                ))}
              </ul>
            ) : (
              <Typography variant="body2" color="text.secondary">No seleccionaste ningún plato aún.</Typography>
            )}

            <Button
              onClick={handleLogout}
              variant="outlined"
              color="secondary"
              fullWidth
              sx={{ mt: 4 }}
            >
              Cerrar sesión
            </Button>

            <Button
              variant="outlined"
              color="primary"
              fullWidth
              sx={{ mt: 2, mb: 8 }}
              onClick={() => window.location.href = "/admin"}
            >
              Ver pedidos (Admin)
            </Button>
          </>
        )}
      </Container>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', py: 3, backgroundColor: '#f9f9f9' }}>
        <img
          src={logo}
          alt="Logo Footer"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            objectFit: 'cover',
            marginBottom: '10px'
          }}
        />
        <Typography variant="body2" color="text.secondary">
          Eat & Run - Healthy Food 🍃
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
          <InstagramIcon sx={{ color: '#E1306C' }} />
          <a
            href="https://www.instagram.com/eatandrun.mza/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: 'none',
              color: '#555',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            @eatandrun.mza
          </a>
        </Box>
      </Box>

      {/* WhatsApp flotante */}
      <WhatsAppButton />
    </>
  );
}

export default App;
