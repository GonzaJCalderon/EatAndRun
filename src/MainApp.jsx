import { useAppData } from './hooks/useAppData';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadFromStorage, logout, selectUser } from './store/slices/authSlice';
import PedidoConfirmado from './components/PedidoConfirmado';
import dayjs from './utils/day.js'; // o la ruta relativa correcta
import LogoAnimado from './components/LogoAnimado';
import { usePreciosCompletos } from './hooks/usePreciosCompletos';



// dayjs configurado para español ✅



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
import AccordionMenuContainer from './components/AccordionMenuContainer';
import PagoSection from './components/PagoSection';
import ResumenFinal from './components/ResumenFinal';
import TartaGallery from './components/TartaGallery';
import { tartaLabelMap } from './utils/tartaUtils';

import WhatsAppButton from './components/WhatsAppButton';

import { subirComprobanteCloudinary } from './utils/cloudinaryUpload';
import { roleMap } from './utils/roles.js';
import { getPrecios } from './utils/getPrecios';
import CopyText from './components/CopyText';

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

  // ✅ ✅ ✅ CORRECTO USO DEL HOOK AQUÍ
  const { precios, loading: loadingPrecios } = usePreciosCompletos();

  const [cargandoUsuario, setCargandoUsuario] = useState(true);

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

  const [semanaActiva, setSemanaActiva] = useState(null);
  const [semanaCargada, setSemanaCargada] = useState(false);
 const [pedidoExitoso, setPedidoExitoso] = useState(false);
 const [preciosTartaDB, setPreciosTartaDB] = useState({});

 const [selecciones, setSelecciones] = useState({});
 const [pedidoConfirmado, setPedidoConfirmado] = useState(null);
 const { menuData, tartasDisponibles, menuListo } = useAppData(
  user,
  semanaActiva,
  menuFijosPorRol,
  setMenuFijosPorRol
);

const filteredMenuData = useMemo(() => {
  if (!menuData) return {};
  const isUserEmpresa = user?.role === 'empresa' || user?.role === 'empleado';
  
  if (!isUserEmpresa) return menuData;

  const filtered = {};
  for (const [day, data] of Object.entries(menuData)) {
    filtered[day] = {
      ...data,
      especiales: [] // Ocultar menú especial para empresas temporalmente
    };
  }
  return filtered;
}, [menuData, user]);






  const activeSelecciones = activeTab === 'usuario' ? seleccionesUsuario : seleccionesEmpresa;
  const setActiveSelecciones = activeTab === 'usuario' ? setSeleccionesUsuario : setSeleccionesEmpresa;



  const EXTRAS_MAP = {
  1: '🍰 Postre',
  2: '🥗 Ensalada',
  3: '💪 Proteína'
};



useEffect(() => {
  const fetchSemanaActiva = async () => {
    try {
      const res = await api.get('/semana/actual'); 
      setSemanaActiva(res.data);
    } catch (error) {
      console.warn("⚠️ No se pudo obtener semana activa", error);
      setSemanaActiva(null);
    } finally {
      setSemanaCargada(true);
    }
  };

  fetchSemanaActiva();
}, []);


  useEffect(() => {
  if (pedidoGuardado) {
    // Limpiar estado del pedido
    setPedidoConfirmado({
  platos: activeSelecciones,
  tartas: tartasSeleccionadas
});

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
    else if (user.role === 'empleado') setActiveTab('empresa'); // 👈 esto es lo nuevo
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
  }, [cargandoUsuario, user, navigate])

useEffect(() => {
  const fetchTartas = async () => {
    const precios = await getTartaPrecios();
    setPreciosTartaDB(precios);
  };
  fetchTartas();
}, []);


  useEffect(() => {
    const ahora = new Date();
    const deadline = new Date();
    deadline.setDate(ahora.getDate() + ((7 - ahora.getDay()) % 7));
    deadline.setHours(20, 0, 0, 0);
    if (ahora > deadline) setBloqueado(true);
  }, []);

const semanaCerrada = useMemo(() => {
  if (!semanaActiva || !semanaActiva.habilitado) return true;

  const ahora = new Date();

  return !Object.entries(semanaActiva.dias_habilitados || {}).some(([dia, habilitado]) => {
    if (!habilitado) return false;
    const diaIndex = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'].indexOf(dia.toLowerCase());
    const fechaDia = new Date(semanaActiva.semana_inicio);
    fechaDia.setDate(fechaDia.getDate() + ((diaIndex + 7 - fechaDia.getDay()) % 7));
    return fechaDia >= ahora;
  });
}, [semanaActiva]);




 const resumenDias = useMemo(() => {
  const resumen = Object.entries(activeSelecciones).map(([dia, platos]) => {
    const deseaOmitir = Object.values(platos).some(p => p.tipo === 'skip');

    return {
      dia,
      resumen: deseaOmitir
        ? '❌ No desea menú'
        : Object.values(platos)
            .filter(p => (p.tipo === 'daily' || p.tipo === 'fijo') && p.cantidad > 0)
            .map(p => {
              const nombre = p.nombre || p.name || `ID ${p.id}`;
              return `🍽️ ${p.cantidad} x ${nombre}`;
            })
            .join(', ')
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
  let totalPlatos = 0;


  const selecciones = activeTab === 'usuario' ? seleccionesUsuario : seleccionesEmpresa;
  const dias = Object.values(selecciones);

  const diasConPlatos = dias.filter(dia =>
    Object.values(dia).some(p => ['daily', 'fijo'].includes(p.tipo) && p.cantidad > 0)
  ).length;

  dias.forEach(dia => {
    Object.values(dia).forEach(p => {
      const cant = parseInt(p?.cantidad || 0);
      if (['daily', 'fijo'].includes(p.tipo) || !p.tipo) {
        totalPlatos += cant;
        total += cant * precios.plato;
      }
      if (p.tipo === 'extra') {
        total += cant * (p.precio || 0);
      }
    });
  });

  total += diasConPlatos * precios.envio;

  const totalTartas = Object.values(tartasSeleccionadas).reduce((sum, val) => sum + val, 0);
Object.entries(tartasSeleccionadas).forEach(([tipo, cantidad]) => {
  const precio = preciosTartaDB[tipo] || 0;
  total += cantidad * precio;
});


  // 💸 Aplicar descuento configurable
  let descuentoPorCantidad = 0;
  if (totalPlatos >= precios.umbral_descuento) {
    descuentoPorCantidad = totalPlatos * precios.descuento_por_plato;
    total -= descuentoPorCantidad;
  }

  return {
    total,
    descuento: descuentoPorCantidad,
    totalPlatos
  };
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
  if (!semanaActiva?.dias_habilitados?.[dia]) return; // ❌ Día deshabilitado, ignorar

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
      if (itemId === null) return;

      items.push({
        item_type: 'extra',
        item_id: itemId,
        quantity: cantidad,
        precio: p.precio,
        dia
      });
      return;
    }

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

  const diasValidos = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

const hayDiasInvalidos = items.some(item =>
  item.dia && !diasValidos.includes(item.dia.toLowerCase())
);

if (hayDiasInvalidos) {
  enqueueSnackbar('❌ Uno o más ítems tienen un día inválido', { variant: 'error' });
  return;
}



setGuardando(true);
try {
  const fechaEntregaFinal = semanaActiva?.semana_inicio;
const { total } = estimarTotal(); // usa el valor con descuento


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

if (loadingPrecios || !precios) {
  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography align="center">Cargando precios desde servidor...</Typography>
      <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 2 }} />
    </Container>
  );
}

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
  const { total, descuento, totalPlatos } = estimarTotal(); // ✅ 👈 AGREGAMOS ESTO

  const preciosActualizados = getPrecios();

            // DEBUG - Confirmar Pedido
const tienePlatosSeleccionados = Object.values(activeSelecciones).some(dia =>
  Object.values(dia).some(p => parseInt(p.cantidad) > 0)
);

const tieneTartasSeleccionadas = Object.values(tartasSeleccionadas).some(q => q > 0);

const botonDeshabilitado =
  semanaCerrada || !(tienePlatosSeleccionados || tieneTartasSeleccionadas);


  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <ResumenFinal
        precios={precios}
        resumenDias={resumenDias}
        metodoPago={metodoPago}
        onMetodoPagoChange={setMetodoPago}
        comprobante={comprobante}
        onComprobanteChange={setComprobante}
        observaciones={observaciones}
        descuento={descuento}
        tartasSeleccionadas={tartasSeleccionadas}
        extrasDetalle={extrasDetalle}
         loading={loadingPrecios} 
        isEmpresa={activeTab === 'empresa'}
        onEditar={() => setConfirmando(false)}
        onConfirmarFinal={handleGuardarPedido}
         guardando={guardando}

        // 👇 AGREGAR ESTOS CUATRO
        subtotalPlatos={totalPlatos * preciosActualizados.plato}
        subtotalExtras={Object.values(extrasDetalle)
          .flatMap(d => Object.values(d))
          .reduce((sum, e) => sum + e.precio * e.cantidad, 0)}
        subtotalEnvio={Object.values(activeSelecciones)
          .filter(dia =>
            Object.values(dia).some(p => ['daily', 'fijo'].includes(p.tipo) && p.cantidad > 0)
          ).length * preciosActualizados.envio}
        subtotalTartas={Object.values(tartasSeleccionadas)
          .reduce((sum, cant) => sum + cant * preciosActualizados.tarta, 0)}
      />
    </Container>
  );
}


if (pedidoExitoso) {
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
     <PedidoConfirmado
  pedido={pedidoConfirmado?.platos}
  tartas={pedidoConfirmado?.tartas}
  metodoPago={metodoPago}
/>


      {metodoPago === 'transferencia' && (
        <Box
          sx={{
            backgroundColor: '#f4f6f8',
            mt: 3,
            p: 2,
            border: '1px dashed #999',
            borderRadius: 2
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            🏦 Datos para Transferencia
          </Typography>
          <Typography variant="body2">Banco: <strong>Santander</strong></Typography>
          <Typography variant="body2">Tipo de cuenta: <strong>Caja de Ahorro en Pesos</strong></Typography>
          <Typography variant="body2">Titular: <strong>Molina Guerra Matias Mauricio</strong></Typography>
          <Typography variant="body2">DNI: <strong>32224452</strong></Typography>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>CBU:</strong>{' '}
              <CopyText text="0720068788000038359572" />
            </Typography>
            <Typography variant="body2">
              <strong>Alias:</strong>{' '}
              <CopyText text="MOLINAGUERRA" />
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
            📎 Recordá enviar el comprobante si aún no lo hiciste.
          </Typography>
        </Box>
      )}

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={() => setPedidoExitoso(false)}
        sx={{ mt: 4 }}
      >
        Hacer otro pedido
      </Button>
    </Container>
  );
}



return (
  
  <>
    <Container maxWidth="sm" sx={{ mt: 4, pb: 10 }}>
      {/* HEADER */}
      {/* HEADER PREMIUM */}
      <Box 
        sx={{ 
          textAlign: 'center', 
          mb: 4, 
          pt: 2,
          pb: 4,
          px: 2,
          background: 'linear-gradient(180deg, #f8fafc 0%, rgba(248, 250, 252, 0) 100%)',
          borderRadius: '0 0 32px 32px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
        }}
      >
        <LogoAnimado />
        <Typography 
          variant="h4" 
          fontWeight="800" 
          sx={{ 
            mt: 2, 
            color: '#0f172a',
            letterSpacing: '-0.5px' 
          }}
        >
          ¡Hola {user.name}! <span style={{ fontSize: '1.2em' }}>🌱</span>
        </Typography>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            mt: 1, 
            color: '#64748b',
            fontWeight: 500,
            maxWidth: '280px',
            mx: 'auto',
            lineHeight: 1.4
          }}
        >
          Prepará tu comida semanal de forma rápida y saludable.
        </Typography>
      </Box>

      {/* BLOQUEO DE PEDIDO */}
      {bloqueado ? (
        <Typography color="error" sx={{ mb: 2 }}>
          🚫 Ya no se pueden modificar los pedidos.
        </Typography>
      ) : (
        <>
          {/* TABS (si es admin) */}
          {user.role === 99 && (
            <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} centered sx={{ mb: 2 }}>
              <Tab label="🧍 Usuario" value="usuario" />
              <Tab label="🏢 Empresa" value="empresa" />
            </Tabs>
          )}

          {/* SEMANA ACTIVA PREMIUM */}
          {semanaCargada && semanaActiva?.habilitado && (
            <Box sx={{ px: 2, mb: 3 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 1.5,
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  py: 1.5,
                  px: 3,
                  borderRadius: 16,
                  boxShadow: '0 2px 10px rgba(22, 163, 74, 0.05)'
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  🗓️ Menú disponible del{' '}
                  <Box component="span" sx={{ color: '#15803d', fontWeight: 800 }}>
                    {dayjs.utc(semanaActiva.semana_inicio).format('D/M')}
                  </Box>{' '}
                  al{' '}
                  <Box component="span" sx={{ color: '#15803d', fontWeight: 800 }}>
                    {dayjs.utc(semanaActiva.semana_fin).format('D/M')}
                  </Box>
                </Typography>
              </Box>
            </Box>
          )}

          {/* 1. MENÚ POR DÍA */}
          <TabsMenuContainer
            menuData={filteredMenuData}
            selecciones={activeSelecciones}
            onSelect={setActiveSelecciones}
            semanaCerrada={semanaCerrada}
            onFinalizarDias={() => {
              const target = document.getElementById('confirmar-pedido-btn');
              if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
          />

          {/* 2. TARTAS */}
          <TartaGallery
            seleccionadas={tartasSeleccionadas}
            onChange={setTartasSeleccionadas}
            tartasDisponibles={tartasDisponibles}
          />
          

          {/* 3. OBSERVACIONES */}
          <Typography variant="h6" sx={{ mt: 3 }}>📝 Observaciones</Typography>
          <TextField
            multiline
            rows={3}
            fullWidth
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
          />

          {/* 4. MÉTODO DE PAGO */}
          {/* <PagoSection
            metodoPago={metodoPago}
            onMetodoPagoChange={setMetodoPago}
            onExtrasChange={(data) => {
              setExtras(data);
              setExtrasDetalle(data);
            }}
            onComprobanteChange={setComprobante}
          /> */}

          {/* 5. RESUMEN Y TOTAL */}
          {/* <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>📋 Resumen de selección</Typography>
         {resumenDias.map(({ dia, resumen }, idx) => {
  if (!dia || typeof dia !== 'string') return null; // 🔐 Protección

  return (
    <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
      📅 <strong>{dia.charAt(0).toUpperCase() + dia.slice(1)}:</strong> {resumen}
    </Typography>
  );
})} */}


          {/* TOTAL */}
          {/* {activeTab !== 'empresa' && (() => {
            const { total, descuento } = estimarTotal();
            return (
              <>
                {descuento > 0 && (
                  <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
                    🎉 ¡Descuento aplicado por superar 5 platos! Ahorro: <strong>${descuento.toLocaleString('es-AR')}</strong>
                  </Typography>
                )}
                <Typography variant="h6" sx={{ mt: 1 }}>
                  💰 Total estimado: <strong>${total.toLocaleString('es-AR')}</strong>
                </Typography>
              </>
            );
          })()} */}
          
          
          {/* 6. BOTÓN DE CONFIRMACIÓN */}


        <Button
  id="confirmar-pedido-btn"
  variant="contained"
  color="success"
  fullWidth
  disabled={
    semanaCerrada ||
    !(
      Object.values(activeSelecciones).some(dia =>
        Object.values(dia).some(p => parseInt(p.cantidad) > 0)
      ) ||
      Object.values(tartasSeleccionadas).some(q => q > 0)
    )
  }
  onClick={() => setConfirmando(true)}
  sx={{ mt: 2 }}
>
  
  Confirmar pedido
</Button>


          {/* CERRAR SESIÓN */}
          <Button onClick={() => dispatch(logout())} variant="outlined" fullWidth sx={{ mt: 3 }}>
            Cerrar sesión
          </Button>
        </>
      )}
    </Container>

    {/* FOOTER */}
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

    {/* WHATSAPP */}
    <WhatsAppButton />
  </>
);

}

export default MainApp;
