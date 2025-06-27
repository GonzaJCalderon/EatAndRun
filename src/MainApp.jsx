
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadFromStorage, logout, selectUser } from './store/slices/authSlice';

import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  CircularProgress,
  Tabs,
  Tab,
  Link
} from '@mui/material';

import InstagramIcon from '@mui/icons-material/Instagram';
import { useSnackbar } from 'notistack';

import TabsMenuContainer from './components/TabsMenuContainer';
import PagoSection from './components/PagoSection';
import ResumenFinal from './components/ResumenFinal';
import TartaGallery, { tartaLabelMap } from './components/TartaGallery';
import WhatsAppButton from './components/WhatsAppButton';

import { subirComprobanteCloudinary } from './utils/cloudinaryUpload';
import { roleMap } from './utils/roles.js';
import api from './api/api';

const logo = '/assets/eatandrun-logo.jpg';

const mapearRoleIdANombre = (roleId) => {
  if (typeof roleId === 'string') return roleId;
  return roleMap[roleId] || null;
};

function MainApp() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [cargandoUsuario, setCargandoUsuario] = useState(true);
  const [menuDelDia, setMenuDelDia] = useState([]);
  const [menuFijosPorRol, setMenuFijosPorRol] = useState({ usuario: [], empresa: [] });
  const [seleccionesUsuario, setSeleccionesUsuario] = useState({});
  const [seleccionesEmpresa, setSeleccionesEmpresa] = useState({});
  const [activeTab, setActiveTab] = useState(null);

  const [bloqueado, setBloqueado] = useState(false);
  const [pedidoGuardado, setPedidoGuardado] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [extras, setExtras] = useState('');
  const [comprobante, setComprobante] = useState(null);
  const [tartasSeleccionadas, setTartasSeleccionadas] = useState({});
  const [extrasDetalle, setExtrasDetalle] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [menuEspecialEmpresa, setMenuEspecialEmpresa] = useState([]);
  const [semanaActiva, setSemanaActiva] = useState(null);
  const [semanaCargada, setSemanaCargada] = useState(false);
 const [pedidoExitoso, setPedidoExitoso] = useState(false);


  const activeSelecciones = activeTab === 'usuario' ? seleccionesUsuario : seleccionesEmpresa;
  const setActiveSelecciones = activeTab === 'usuario' ? setSeleccionesUsuario : setSeleccionesEmpresa;

  const [menuData, setMenuData] = useState({
    lunes: { fijos: [], especiales: [] },
    martes: { fijos: [], especiales: [] },
    miercoles: { fijos: [], especiales: [] },
    jueves: { fijos: [], especiales: [] },
    viernes: { fijos: [], especiales: [] }
  });

  const EXTRAS_MAP = {
  1: '🍰 Postre',
  2: '🥗 Ensalada',
  3: '💪 Proteína'
};


  useEffect(() => {
const fetchSemanaActiva = async () => {
  try {
    const res = await fetch('http://localhost:4000/api/menu/semana/actual');
    const data = await res.json();

    // 🔥 ESTA LÍNEA CAMBIA:
    setSemanaActiva(data.semana || data); // por compatibilidad con ambas respuestas
  } catch {
    console.warn("⚠️ No se pudo obtener semana activa");
  } finally {
    setSemanaCargada(true);
  }
};


    fetchSemanaActiva();
  }, []);

  useEffect(() => {
  if (pedidoGuardado) {
    // Limpiar estado del pedido
    setObservaciones('');
    setMetodoPago('');
    setComprobante(null);
    setTartasSeleccionadas({});
    if (activeTab === 'usuario') setSeleccionesUsuario({});
    if (activeTab === 'empresa') setSeleccionesEmpresa({});
    setPedidoGuardado(false); // evitar que se repita
  }
}, [pedidoGuardado]);


  useEffect(() => {
    if (user && !activeTab) {
      if (user.role === 99) setActiveTab('usuario');
      else setActiveTab(mapearRoleIdANombre(user.role));
    }
  }, [user, activeTab]);

  useEffect(() => {
    dispatch(loadFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setCargandoUsuario(false);
    } else {
      const timer = setTimeout(() => setCargandoUsuario(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  useEffect(() => {
    if (!cargandoUsuario && !user) navigate('/app');
  }, [cargandoUsuario, user, navigate]);

  useEffect(() => {
    const fetchEspecial = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('http://localhost:4000/api/menu/daily/empresa/especial', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        const formatted = data.map(p => {
          const fecha = new Date(p.date);
          const diaSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][fecha.getDay()];
          return {
            ...p,
            nombre: p.name,
            descripcion: p.description,
            img: p.image_url,
            cantidad: 0,
            id: p.id?.toString(),
            tipo: 'daily',
            dia: diaSemana
          };
        }).filter(p => ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].includes(p.dia));

        setMenuEspecialEmpresa(formatted);
      } catch (err) {
        console.error("❌ Error al cargar menú especial:", err);
      }
    };

    if (user && ['empresa', 'admin'].includes(mapearRoleIdANombre(user.role))) fetchEspecial();
  }, [user]);

  const fetchMenuFijo = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const roleName = mapearRoleIdANombre(user?.role);
      if (!token || !roleName) return;

      const format = (data) => data.map(p => ({
        nombre: p.name,
        descripcion: p.description,
        img: p.image_url,
        cantidad: 0,
        id: p.id || p._id,
        tipo: 'fijo'
      }));

      if (roleName === 'admin') {
        const [usuarioRes, empresaRes] = await Promise.all([
          fetch(`http://localhost:4000/api/menu/fixed/by-role?role=usuario`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://localhost:4000/api/menu/fixed/by-role?role=empresa`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const usuarioData = await usuarioRes.json();
        const empresaData = await empresaRes.json();
        setMenuFijosPorRol({ usuario: format(usuarioData), empresa: format(empresaData) });
      } else {
        const res = await fetch(`http://localhost:4000/api/menu/fixed/by-role?role=${roleName}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setMenuFijosPorRol(prev => ({ ...prev, [roleName]: format(data) }));
      }
    } catch (err) {
      console.error('❌ Error al cargar menú fijo:', err);
    }
  };

  useEffect(() => {
    if (user) fetchMenuFijo();
  }, [user]);

  useEffect(() => {
    const fetchMenuDelDia = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('http://localhost:4000/api/menu/daily', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setMenuDelDia(data);
      } catch (err) {
        console.error('❌ Error al cargar menú del día:', err);
      }
    };

    if (user) fetchMenuDelDia();
  }, [user]);

  const agruparPorDiaSemana = (platos) => {
    const resultado = { lunes: [], martes: [], miercoles: [], jueves: [], viernes: [] };
    platos.forEach(plato => {
      const fecha = new Date(plato.date);
      const dia = fecha.getDay();
      const diasMap = { 1: 'lunes', 2: 'martes', 3: 'miercoles', 4: 'jueves', 5: 'viernes' };
      const diaSemana = diasMap[dia];
      if (diaSemana) {
        resultado[diaSemana].push({
          nombre: plato.name,
          descripcion: plato.description,
          img: plato.image_url,
          cantidad: 0,
          id: plato.id,
          tipo: 'daily'
        });
      }
    });
    return resultado;
  };

  useEffect(() => {
    if (!user) return;

    const roleName = mapearRoleIdANombre(user.role);
    const fijosRol = menuFijosPorRol[roleName] || [];
    const especialesAgrupados = agruparPorDiaSemana(menuDelDia);

    const nuevoMenuData = {};

    ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].forEach((dia) => {
      const especialesEmpresaFiltrados = menuEspecialEmpresa.filter(p => p.dia === dia);
      nuevoMenuData[dia] = {
        fijos: fijosRol.map(p => ({ ...p, tipo: 'fijo' })),
        especiales: [
          ...(especialesAgrupados[dia] || []),
          ...especialesEmpresaFiltrados
        ]
      };
    });

    setMenuData(nuevoMenuData);
  }, [menuDelDia, menuFijosPorRol, menuEspecialEmpresa, user]);

  useEffect(() => {
    const ahora = new Date();
    const deadline = new Date();
    deadline.setDate(ahora.getDate() + ((7 - ahora.getDay()) % 7));
    deadline.setHours(20, 0, 0, 0);
    if (ahora > deadline) setBloqueado(true);
  }, []);

  const semanaCerrada = useMemo(() => {
    if (!semanaActiva || !semanaActiva.habilitado) return true;
    if (!semanaActiva.cierre) return false;
    const cierre = new Date(semanaActiva.cierre);
    const ahora = new Date();
    return ahora > cierre;
  }, [semanaActiva]);

  const resumenDias = useMemo(() => {
    const resumen = Object.entries(activeSelecciones).map(([dia, platos]) => {
      const totalPlatos = Object.values(platos)
        .filter(p => ['daily', 'fijo'].includes(p.tipo) || !p.tipo)
        .reduce((sum, p) => sum + (p.cantidad || 0), 0);

      const totalExtras = Object.values(platos)
        .filter(p => p.tipo === 'extra')
        .reduce((sum, p) => sum + (p.cantidad || 0), 0);

      const deseaOmitir = Object.values(platos).some(p => p.tipo === 'skip');

      return {
        dia,
        resumen: deseaOmitir
          ? '❌ No desea menú'
          : `${totalPlatos ? `${totalPlatos} plato${totalPlatos > 1 ? 's' : ''}` : ''}${totalExtras ? ` + ${totalExtras} extra${totalExtras > 1 ? 's' : ''}` : ''}`
      };
    });

    const totalTartas = Object.entries(tartasSeleccionadas || {})
      .filter(([_, cantidad]) => cantidad > 0)
      .map(([tipo, cantidad]) => `🥧 ${cantidad} tarta${cantidad > 1 ? 's' : ''} de ${tartaLabelMap[tipo] || tipo}`);

    if (totalTartas.length > 0) {
      resumen.push({ dia: 'tartas', resumen: totalTartas.join(', ') });
    }

    return resumen;
  }, [activeSelecciones, tartasSeleccionadas]);

useEffect(() => {
  const nuevoDetalle = {};

  Object.entries(activeSelecciones).forEach(([dia, items]) => {
    const extras = Object.entries(items)
      .filter(([_, p]) => p.tipo === 'extra' && p.cantidad > 0)
      .reduce((acc, [key, p]) => {
        const nombre = EXTRAS_MAP[p.id] || `Extra ${p.id}`;
        acc[nombre] = {
          cantidad: p.cantidad,
          precio: p.precio
        };
        return acc;
      }, {});

    if (Object.keys(extras).length > 0) {
      nuevoDetalle[dia] = extras;
    }
  });

  setExtrasDetalle(nuevoDetalle);
}, [activeSelecciones]);



  const estimarTotal = () => {
    let total = 0;

    const precios = JSON.parse(localStorage.getItem('precios_eatandrun')) || {
      plato: 6300,
      envio: 900,
      tarta: 13500
    };

    const selecciones = activeTab === 'usuario' ? seleccionesUsuario : seleccionesEmpresa;
    const dias = Object.values(selecciones);

    const diasConPlatos = dias.filter(dia =>
      Object.values(dia).some(p => ['daily', 'fijo'].includes(p.tipo) && p.cantidad > 0)
    ).length;

    dias.forEach(dia => {
      Object.values(dia).forEach(p => {
        const cant = parseInt(p?.cantidad || 0);
        if (['daily', 'fijo'].includes(p.tipo) || !p.tipo) {
          total += cant * precios.plato;
        }
        if (p.tipo === 'extra') {
          total += cant * (p.precio || 0);
        }
      });
    });

    total += diasConPlatos * precios.envio;

    const totalTartas = Object.values(tartasSeleccionadas).reduce((sum, val) => sum + val, 0);
    total += totalTartas * precios.tarta;

    return total;
  };

const handleGuardarPedido = async () => {
  if (!semanaActiva?.habilitado) {
    enqueueSnackbar('🚫 Semana no habilitada', { variant: 'error' });
    return;
  }

  if (semanaCerrada) {
    enqueueSnackbar('⏰ El plazo ya cerró', { variant: 'error' });
    return;
  }

  const items = [];

  const parseItemId = (key, p) => {
    if (typeof p?.id === 'number') return p.id;
    if (!p?.id && key.startsWith('extra-')) {
      return Number(key.replace('extra-', ''));
    }
    const parsed = Number(p?.id || key);
    return isNaN(parsed) ? null : parsed;
  };

  Object.entries(activeSelecciones).forEach(([dia, platos]) => {
    Object.entries(platos).forEach(([key, p]) => {
      if (!p || parseInt(p.cantidad) <= 0) return;

      const cantidad = parseInt(p.cantidad);
      const tipo = p.tipo || 'daily';

      if (tipo === 'skip') {
        items.push({
          item_type: 'skip',
          item_id: null,
          quantity: 1,
          dia
        });
        return;
      }

      if (tipo === 'extra') {
        const itemId = parseItemId(key, p);
        if (itemId === null) {
          console.warn('❌ Extra con ID inválido:', key, p);
          return;
        }

        items.push({
          item_type: 'extra',
          item_id: itemId,
          quantity: cantidad,
          precio: p.precio,
          dia
        });
        return;
      }

      // tipo 'daily' o 'fijo'
      items.push({
        item_type: tipo,
        item_id: p.id || key,
        quantity: cantidad,
        dia
      });
    });
  });

  Object.entries(tartasSeleccionadas).forEach(([tipo, cantidad]) => {
    if (cantidad > 0) {
      items.push({
        item_type: 'tarta',
        item_id: tartaLabelMap[tipo] || tipo,
        quantity: cantidad
      });
    }
  });

  const hayItemsValidos = items.some(i => i.quantity > 0 && i.item_type !== 'skip');
  if (!hayItemsValidos) {
    enqueueSnackbar('❌ No seleccionaste nada válido para guardar', { variant: 'warning' });
    return;
  }

  console.log("🧾 Payload items:", items); // ✅ DEBUG antes de enviar

  setGuardando(true);
  try {
    const fechaEntregaFinal = semanaActiva?.semana_inicio;
    const total = estimarTotal();

    const res = await api.post('/orders', {
      items,
      total,
      fecha_entrega: fechaEntregaFinal,
      observaciones,
      metodoPago
    });

    const orderId = res.data.id;

    if (metodoPago === 'transferencia' && comprobante) {
      const imageUrl = await subirComprobanteCloudinary(comprobante);
 await api.post(`/orders/${orderId}/comprobante`, { comprobanteUrl: imageUrl });
    }

    enqueueSnackbar('✅ Pedido guardado con éxito', { variant: 'success' });
    setPedidoGuardado(true);
    setConfirmando(false);
    setPedidoExitoso(true);
  } catch (err) {
    console.error('❌ Error al guardar pedido:', err?.response?.data || err);
    enqueueSnackbar('❌ Error al enviar el pedido', { variant: 'error' });
  } finally {
    setGuardando(false);
  }
};


  if (cargandoUsuario) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <Typography align="center">Cargando usuario...</Typography>
        <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 2 }} />
      </Container>
    );
  }

  if (!user) return null;

 if (confirmando) {
  console.log("🧂 EXTRAS DETALLE PASADO AL RESUMEN FINAL:", extrasDetalle);
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <ResumenFinal
        resumenDias={resumenDias}
        total={estimarTotal()}
        metodoPago={metodoPago}
        observaciones={observaciones}
        tartasSeleccionadas={tartasSeleccionadas}
        precios={{ plato: 6300, envio: 900, tarta: 13500 }}
        extrasDetalle={extrasDetalle}
        onEditar={() => setConfirmando(false)}
        onConfirmarFinal={handleGuardarPedido}
      />
    </Container>
  );
}

if (pedidoExitoso) {
  return (
    <Container maxWidth="sm" sx={{ mt: 6, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>🎉 ¡Pedido realizado con éxito!</Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Gracias por tu pedido. En breve recibirás la confirmación por WhatsApp 📱
      </Typography>
      <Button variant="contained" color="primary" onClick={() => setPedidoExitoso(false)}>
        Hacer otro pedido
      </Button>
    </Container>
  );
}

  return (
    <>
      <Container maxWidth="sm" sx={{ mt: 4, pb: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <img src={logo} alt="Eat and Run Logo" style={{ width: '90px', height: '90px', borderRadius: '50%' }} />
          <Typography variant="h5" fontWeight="bold">¡Hola {user.name}! 🌱</Typography>
        </Box>

        {bloqueado ? (
          <Typography color="error" sx={{ mb: 2 }}>
            🚫 Ya no se pueden modificar los pedidos.
          </Typography>
        ) : (
          <>
            {user.role === 99 && (
              <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} centered sx={{ mb: 2 }}>
                <Tab label="🧍 Usuario" value="usuario" />
                <Tab label="🏢 Empresa" value="empresa" />
              </Tabs>
            )}

            {semanaCargada && (
              semanaActiva?.habilitado ? (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  📅 Pedidos habilitados del{' '}
                  <strong>{new Date(semanaActiva.semana_inicio).toLocaleDateString('es-AR')}</strong> al{' '}
                  <strong>{new Date(semanaActiva.semana_fin).toLocaleDateString('es-AR')}</strong>
                </Typography>
              ) : (
                <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                  🚫 Semana no habilitada para pedidos.
                </Typography>
              )
            )}

            <TabsMenuContainer
              menuData={menuData}
              selecciones={activeSelecciones}
              onSelect={setActiveSelecciones}
            />

            <TartaGallery seleccionadas={tartasSeleccionadas} onChange={setTartasSeleccionadas} />

            <Typography variant="h6" sx={{ mt: 3 }}>📝 Observaciones</Typography>
            <TextField
              multiline
              rows={3}
              fullWidth
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              sx={{ mt: 1, mb: 2 }}
            />

            <PagoSection
              metodoPago={metodoPago}
              onMetodoPagoChange={setMetodoPago}
              onExtrasChange={(data) => {
                setExtras(data);
                setExtrasDetalle(data);
              }}
              onComprobanteChange={setComprobante}
            />

            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>📋 Resumen de selección</Typography>
            {resumenDias.map(({ dia, resumen }) => (
              <Typography key={dia} variant="body2" sx={{ mb: 0.5 }}>
                📅 <strong>{dia.charAt(0).toUpperCase() + dia.slice(1)}:</strong> {resumen}
              </Typography>
            ))}

            <Typography variant="h6" sx={{ mt: 3 }}>
              💰 Total estimado: <strong>${estimarTotal().toLocaleString('es-AR')}</strong>
            </Typography>

            <Button
              variant="contained"
              color="success"
              fullWidth
              disabled={!Object.values(activeSelecciones).some(d => Object.keys(d).length > 0) || semanaCerrada}
              onClick={() => setConfirmando(true)}
              sx={{ mt: 2 }}
            >
              Confirmar pedido
            </Button>

            <Button onClick={() => dispatch(logout())} variant="outlined" fullWidth sx={{ mt: 3 }}>
              Cerrar sesión
            </Button>
          </>
        )}
      </Container>

      <Box sx={{ textAlign: 'center', py: 3, backgroundColor: '#f9f9f9' }}>
        <img src={logo} alt="Logo Footer" style={{ width: '60px', borderRadius: '50%' }} />
        <Typography variant="body2" color="text.secondary">Eat & Run - Healthy Food 🍃</Typography>
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
          <InstagramIcon sx={{ color: '#E1306C' }} />
          <Link href="https://www.instagram.com/eatandrun.mza/" target="_blank" rel="noopener noreferrer" underline="hover" variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            @eatandrun.mza
          </Link>
        </Box>
      </Box>

      <WhatsAppButton />
    </>
  );
}

export default MainApp;
