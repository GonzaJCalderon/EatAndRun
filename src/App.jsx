import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import InstagramIcon from '@mui/icons-material/Instagram';
import { motion } from 'framer-motion';

import LoginForm from './components/LoginForm';
import TabsMenuContainer from './components/TabsMenuContainer';
import PagoSection from './components/PagoSection';
import PedidoConfirmado from './components/PedidoConfirmado';
import WhatsAppButton from './components/WhatsAppButton';

import menuSemana from './data/menusemana.json';

const logo = '/assets/eatandrun-logo.jpg';

function App() {
  const [user, setUser] = useState(null);
  const [selecciones, setSelecciones] = useState({});
  const [bloqueado, setBloqueado] = useState(false);
  const [pedidoGuardado, setPedidoGuardado] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  const [menuData, setMenuData] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [metodoPago, setMetodoPago] = useState('');
  const [extras, setExtras] = useState('');
  const [comprobante, setComprobante] = useState(null);

  useEffect(() => {
    setMenuData(menuSemana);
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

  const copiarAlPortapapeles = (texto) => {
    navigator.clipboard.writeText(texto);
  };

  const estimarTotal = () => {
    let total = 0;
    const precios = JSON.parse(localStorage.getItem('precios_eatandrun')) || {
      plato: 6300,
      envio: 900,
      postre: 2800,
      ensalada: 2800,
      proteina: 3500,
      tarta: 13500
    };
    

    const dias = Object.values(selecciones);
    dias.forEach(dia => {
      Object.values(dia).forEach(plato => {
        const cantidad = parseInt(plato?.cantidad || 0);
        total += cantidad * precios.plato;
      });
    });

    const diasConPlatos = dias.filter(dia => Object.keys(dia).length > 0).length;
    total += diasConPlatos * precios.envio;

    const texto = extras.toLowerCase();
    if (texto.includes("postre")) total += precios.postre;
    if (texto.includes("ensalada")) total += precios.ensalada;
    if (texto.includes("proteina")) total += precios.proteina;
    if (texto.includes("tarta")) total += precios.tarta;

    return total;
  };

  const handleGuardarPedido = () => {
    if (!tienePlatosSeleccionados(selecciones)) return;

    setGuardando(true);

    const leerComprobante = () => {
      return new Promise((resolve) => {
        if (!comprobante) return resolve(null);
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(comprobante);
      });
    };

    leerComprobante().then((comprobanteBase64) => {
      const pedidoCompleto = {
        usuario: user,
        pedido: selecciones,
        extras,
        metodoPago,
        comprobanteNombre: comprobante?.name || '',
        comprobanteBase64: comprobanteBase64 || '',
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
      setExtras('');
      setMetodoPago('');
      setComprobante(null);

      setTimeout(() => {
        setPedidoGuardado(false);
      }, 5000);
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('eatAndRunUser');
    setUser(null);
    setSelecciones({});
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
          <img src={logo} alt="Eat and Run Logo" style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            objectFit: 'cover',
            marginBottom: '10px'
          }} />
          <Typography variant="h5" fontWeight="bold">¡Hola {user.nombre}! 🌱</Typography>
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
            <Button onClick={() => setPedidoGuardado(false)} variant="contained" fullWidth sx={{ mt: 3 }}>
              Volver al inicio
            </Button>
          </>
        ) : (
          <>
            {bloqueado ? (
              <Typography color="error" sx={{ mb: 2 }}>
                🚫 Ya no se pueden modificar los pedidos. ¡Te esperamos la próxima semana!
              </Typography>
            ) : (
              <>
                <TabsMenuContainer
                  menuData={menuData}
                  selecciones={selecciones}
                  onSelect={handleSelect}
                />

                <Typography variant="h6" sx={{ mt: 3 }}>📝 Observaciones / Aclaraciones</Typography>
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="Escribí aquí cualquier aclaración..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  sx={{ mt: 1, mb: 2 }}
                />

                <PagoSection
                  metodoPago={metodoPago}
                  onMetodoPagoChange={setMetodoPago}
                  onExtrasChange={setExtras}
                  onComprobanteChange={setComprobante}
                />

                <Typography variant="h6" sx={{ mt: 3 }}>
                  💰 Estimación total: <strong>${estimarTotal().toLocaleString('es-AR')}</strong>
                </Typography>

                {metodoPago === 'transferencia' && (
                  <Box sx={{ my: 3, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">💳 Datos de Transferencia</Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <Typography variant="body2">Banco: <strong>Santander</strong></Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2">CBU: <strong>072006878000038359572</strong></Typography>
                      <Tooltip title="Copiar CBU">
                        <IconButton onClick={() => copiarAlPortapapeles("072006878000038359572")}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2">Alias: <strong>MOLINAGUERRA</strong></Typography>
                      <Tooltip title="Copiar alias">
                        <IconButton onClick={() => copiarAlPortapapeles("MOLINAGUERRA")}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Titular: <strong>Molina Guerra Matías Mauricio</strong>
                    </Typography>
                    <Typography variant="body2">
                      Cuenta: <strong>068-383595/7</strong> - DNI: <strong>32224452</strong>
                    </Typography>
                  </Box>
                )}

                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  disabled={!tienePlatosSeleccionados(selecciones)}
                  onClick={handleGuardarPedido}
                  sx={{ mt: 2 }}
                >
                  Confirmar pedido
                </Button>

                <Button
                  onClick={handleLogout}
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  sx={{ mt: 3 }}
                >
                  Cerrar sesión
                </Button>

                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => window.location.href = "/admin"}
                >
                  Ver pedidos (Admin)
                </Button>
              </>
            )}
          </>
        )}
      </Container>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', py: 3, backgroundColor: '#f9f9f9' }}>
        <img src={logo} alt="Logo Footer" style={{ width: '60px', borderRadius: '50%' }} />
        <Typography variant="body2" color="text.secondary">Eat & Run - Healthy Food 🍃</Typography>
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
          <InstagramIcon sx={{ color: '#E1306C' }} />
          <a href="https://www.instagram.com/eatandrun.mza/" target="_blank" rel="noopener noreferrer">
            @eatandrun.mza
          </a>
        </Box>
      </Box>

      <WhatsAppButton />
    </>
  );
}

export default App;
