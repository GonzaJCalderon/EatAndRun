import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadFromStorage, logout, selectUser } from './store/slices/authSlice';
import PedidoConfirmado from './components/PedidoConfirmado';
import dayjs from './utils/day.js';
import LogoAnimado from './components/LogoAnimado';
import { usePreciosCompletos } from './hooks/usePreciosCompletos';
import { mapearRoleIdANombre } from './utils/roles.js';
import { Alert } from '@mui/material';


import {
  Container, Typography, Button, TextField, Box,
  CircularProgress, Tabs, Tab, Link
} from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import { useSnackbar } from 'notistack';

import AccordionMenuContainer from './components/AccordionMenuContainer';
import ResumenFinal from './components/ResumenFinal';
import TartaGallery from './components/TartaGallery';
import { tartaLabelMap } from './utils/tartaUtils';
import WhatsAppButton from './components/WhatsAppButton';
import { subirComprobanteCloudinary } from './utils/cloudinaryUpload';
import { getPrecios } from './utils/getPrecios';
import CopyText from './components/CopyText';
import { useMenuSemanal } from './hooks/useMenuSemanal.js';
import api from './api/api';

import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(tz);

const logo = '/assets/eatandrun-logo.jpg';

function MainApp({ edicion = null, pedidoId = null }) {

const modoEdicion = Boolean(pedidoId); // ✅ si hay pedidoId, estamos editando

  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const roleNombre = mapearRoleIdANombre(user?.role) || 'usuario';
const {
  menuPorDia,
  semanaActual,
  semanasDisponibles, // ✅ ahora también recibís TODAS las semanas
  tartasDisponibles,
  loading: loadingMenu
} = useMenuSemanal(roleNombre);

console.log('🍰 Tartas disponibles:', tartasDisponibles); 

  const { precios, loading: loadingPrecios } = usePreciosCompletos();

  const [cargandoUsuario, setCargandoUsuario] = useState(true);
const [seleccionesUsuario, setSeleccionesUsuario] = useState(edicion?.seleccionesUsuario || {});
  const [seleccionesEmpresa, setSeleccionesEmpresa] = useState({});
  const [activeTab, setActiveTab] = useState(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [pedidoGuardado, setPedidoGuardado] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [comprobante, setComprobante] = useState(null);
  const [tartasSeleccionadas, setTartasSeleccionadas] = useState(edicion?.tartasSeleccionadas || {});
  const [extrasDetalle, setExtrasDetalle] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const [pedidoExitoso, setPedidoExitoso] = useState(false);
  const [preciosTartaDB, setPreciosTartaDB] = useState({});
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);
  const [semanaTartaSeleccionada, setSemanaTartaSeleccionada] = useState(null);
  const [yaInicializado, setYaInicializado] = useState(false);
  

  const activeSelecciones = activeTab === 'empresa' ? seleccionesEmpresa : seleccionesUsuario;
  const setActiveSelecciones = activeTab === 'empresa' ? setSeleccionesEmpresa : setSeleccionesUsuario;

  const EXTRAS_MAP = { 1: '🍰 Postre', 2: '🥗 Ensalada', 3: '💪 Proteína' };

const buscarDatosDesdeMenuPorDia = useCallback((itemId) => {
  if (!menuPorDia || Object.keys(menuPorDia).length === 0) {
    return { nombre: null, precio: null };
  }

  for (const dia in menuPorDia) {
    const platos = menuPorDia[dia];
    for (const tipo in platos) {
      const lista = platos[tipo];
      for (const plato of lista) {
        if (plato.id === itemId || plato.item_id === itemId) {
          return {
            nombre: plato.nombre || plato.name || null,
            precio: plato.precio || null
          };
        }
      }
    }
  }
  return { nombre: null, precio: null };
}, [menuPorDia]);

// ✅ SECCIÓN DE useEffect CORRECTA PARA MainApp.jsx

// 1️⃣ Efecto para redirección después de éxito (MANTENER)
useEffect(() => {
  if (pedidoExitoso) {
    const timer = setTimeout(() => {
      setPedidoExitoso(false);
      setConfirmando(false);
      setSeleccionesUsuario({});
      setSeleccionesEmpresa({});
      setTartasSeleccionadas({});
      setObservaciones('');
      setMetodoPago('');
      setPedidoConfirmado(null);
      navigate('/app');
    }, 3000);
    return () => clearTimeout(timer);
  }
}, [pedidoExitoso, navigate]);

// 2️⃣ ⭐ ÚNICO EFECTO PARA INICIALIZAR EDICIÓN - REEMPLAZAR las líneas 130-161
useEffect(() => {
  if (modoEdicion && edicion?.seleccionesUsuario && !yaInicializado && precios?.plato) {
    const nuevasSelecciones = {};

    for (const dia in edicion.seleccionesUsuario) {
      const platos = edicion.seleccionesUsuario[dia];
      nuevasSelecciones[dia] = {};

      for (const key in platos) {
        const p = platos[key];
        const itemId = p?.item_id || p?.id;
        const datosDesdeMenu = itemId ? buscarDatosDesdeMenuPorDia(itemId) : {};

        nuevasSelecciones[dia][key] = {
          ...p,
          nombre: p.nombre || datosDesdeMenu?.nombre || `ID ${itemId || '?'}`,
          precio:
            p.tipo === 'extra'
              ? p.precio ?? precios?.extras?.[p.id] ?? datosDesdeMenu?.precio ?? 0
              : p.precio ?? datosDesdeMenu?.precio ?? precios?.plato ?? 0
        };
      }
    }

    setSeleccionesUsuario(nuevasSelecciones);
    setYaInicializado(true);
  }
}, [modoEdicion, edicion?.seleccionesUsuario, precios, yaInicializado, buscarDatosDesdeMenuPorDia]);

// 3️⃣ Resto de useEffect (MANTENER TODOS SIN CAMBIOS)
useEffect(() => {
  if (pedidoGuardado) {
    setPedidoConfirmado({ platos: activeSelecciones, tartas: tartasSeleccionadas });
    setObservaciones('');
    setMetodoPago('');
    setComprobante(null);
    setTartasSeleccionadas({});
    if (activeTab === 'empresa') setSeleccionesEmpresa({});
    else setSeleccionesUsuario({});
    setPedidoGuardado(false);
  }
}, [pedidoGuardado, activeSelecciones, tartasSeleccionadas, activeTab]);

useEffect(() => {
  if (user && !activeTab) {
    if (user.role === 99) setActiveTab('usuario');
    else if (user.role === 'empleado') setActiveTab('empresa');
    else setActiveTab(mapearRoleIdANombre(user.role) || 'usuario');
  }
}, [user, activeTab]);

useEffect(() => { 
  dispatch(loadFromStorage()); 
}, [dispatch]);

useEffect(() => {
  if (user) setCargandoUsuario(false);
  else {
    const t = setTimeout(() => setCargandoUsuario(false), 800);
    return () => clearTimeout(t);
  }
}, [user]);

useEffect(() => {
  if (!cargandoUsuario && !user) navigate('/app');
}, [cargandoUsuario, user, navigate]);

useEffect(() => {
  const fetchPreciosTarta = async () => {
    const p = await getPrecios();
    setPreciosTartaDB(p);
  };
  fetchPreciosTarta();
}, []);

useEffect(() => {
  const ahora = new Date();
  const deadline = new Date();
  deadline.setDate(ahora.getDate() + ((7 - ahora.getDay()) % 7));
  deadline.setHours(20, 0, 0, 0);
  if (ahora > deadline) setBloqueado(true);
}, []);

useEffect(() => {
  if (semanasDisponibles.length > 0 && !semanaTartaSeleccionada) {
    setSemanaTartaSeleccionada(semanasDisponibles[0].id);
  }
}, [semanasDisponibles, semanaTartaSeleccionada]);

const semanaCerrada = useMemo(() => {
  if (!semanaActual) return true;
  const habilitado = Boolean(semanaActual.habilitado);
  if (!habilitado) return true;

  const TZ = 'America/Argentina/Buenos_Aires';

  const ahora = dayjs().tz(TZ);
  const cierreStr = semanaActual.cierre || semanaActual.semana_fin;
  if (!cierreStr) return true;

  const cierre = dayjs.tz(cierreStr + ' 23:59:59', 'YYYY-MM-DD HH:mm:ss', TZ);

  const resultado = ahora.isAfter(cierre);
  console.log('🔍 Comparación:', {
    ahora: ahora.format(),
    cierre: cierre.format(),
    resultado
  });

  return resultado;
}, [semanaActual]);


  // CORREGIDO: Incluir menús especiales en el resumen
// ✅ REEMPLAZA el useMemo de resumenDias en MainApp.jsx (línea ~193)

const resumenDias = useMemo(() => {
  const resumen = Object.entries(activeSelecciones).map(([diaClave, platos]) => {
    let diaDisplay = diaClave;

    // Si tiene formato "miércoles-2025-10-23"
    const partes = diaClave.split('-');
    if (partes.length === 4) {
      const nombreDia = partes[0]; // "miércoles"
      const fechaISO = `${partes[1]}-${partes[2]}-${partes[3]}`; // "2025-10-23"
      const fecha = dayjs(fechaISO);

      if (fecha.isValid()) {
        diaDisplay = `${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)} (${fecha.format('DD/MM')})`;
      }
    } else {
      diaDisplay = diaClave.charAt(0).toUpperCase() + diaClave.slice(1);
    }

    const deseaOmitir = Object.values(platos).some(p => p.tipo === 'skip');

    const platosValidos = Object.values(platos)
      .filter(p =>
        ['daily', 'fijo', 'especial', 'company'].includes(p.tipo) && p.cantidad > 0
      );

    return {
      dia: diaDisplay,
      resumen: deseaOmitir
        ? '❌ No desea menú'
        : platosValidos.map(p => `🍽️ ${p.cantidad} x ${(p.nombre || p.name || `ID ${p.id}`)}`)
            .join(', ')
    };
  });

  const totalTartas = Object.entries(tartasSeleccionadas || {})
    .filter(([_, cantidad]) => cantidad > 0)
    .map(([tipo, cantidad]) => `🥧 ${cantidad} tarta${cantidad > 1 ? 's' : ''} de ${tartaLabelMap[tipo] || tipo}`);

  if (totalTartas.length > 0) {
    resumen.push({ dia: 'Tartas', resumen: totalTartas.join(', ') });
  }

  return resumen;
}, [activeSelecciones, tartasSeleccionadas]);


  // CORREGIDO: Incluir menús especiales en el cálculo
  const estimarTotal = () => {
    let total = 0;
    let totalPlatos = 0;
    const selecciones = activeTab === 'empresa' ? seleccionesEmpresa : seleccionesUsuario;
    const dias = Object.values(selecciones);
    const diasConPlatos = dias.filter(dia =>
      Object.values(dia).some(p => 
        ['daily', 'fijo', 'especial', 'company'].includes(p.tipo) && p.cantidad > 0
      )
    ).length;

    dias.forEach(dia => {
      Object.values(dia).forEach(p => {
        const cant = parseInt(p?.cantidad || 0);
        if (['daily', 'fijo', 'especial', 'company'].includes(p.tipo) || !p.tipo) {
          totalPlatos += cant;
          total += cant * precios.plato;
        }
        if (p.tipo === 'extra') total += cant * (p.precio || 0);
      });
    });

    total += diasConPlatos * precios.envio;

    Object.entries(tartasSeleccionadas).forEach(([tipo, cantidad]) => {
      const precio = preciosTartaDB[tipo] || 0;
      total += cantidad * precio;
    });

    let descuentoPorCantidad = 0;
    if (totalPlatos >= precios.umbral_descuento) {
      descuentoPorCantidad = totalPlatos * precios.descuento_por_plato;
      total -= descuentoPorCantidad;
    }
    return { total, descuento: descuentoPorCantidad, totalPlatos };
  };

 // ✅ REEMPLAZA el useEffect de extrasDetalle en MainApp.jsx (línea ~308)

useEffect(() => {
  const nuevoDetalle = {};
  
  Object.entries(activeSelecciones).forEach(([diaClave, items]) => {
    // 🔥 Normalizar la clave del día para el detalle
    let diaKey = diaClave;
    
    const partes = diaClave.split('-');
    if (partes.length === 4) {
      // "jueves-2025-10-23" → "jueves"
      const nombreDia = partes[0];
      const fechaISO = `${partes[1]}-${partes[2]}-${partes[3]}`;
      const fecha = dayjs(fechaISO);
      
      if (fecha.isValid()) {
        // Mantener formato legible: "Jueves (23/10)"
        diaKey = `${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)} (${fecha.format('DD/MM')})`;
      }
    } else {
      // Formato simple: capitalizar
      diaKey = diaClave.charAt(0).toUpperCase() + diaClave.slice(1);
    }
    
    const extras = Object.entries(items)
      .filter(([_, p]) => p.tipo === 'extra' && p.cantidad > 0)
      .reduce((acc, [_, p]) => {
        const nombre = EXTRAS_MAP[p.id] || `Extra ${p.id}`;
        acc[nombre] = { cantidad: p.cantidad, precio: p.precio };
        return acc;
      }, {});
      
    if (Object.keys(extras).length > 0) {
      nuevoDetalle[diaKey] = extras;
    }
  });
  
  setExtrasDetalle(nuevoDetalle);
}, [activeSelecciones]);

// 🔄 Transforma selecciones para backend
const transformarParaBackend = (selecciones, tartas, semanasDisponibles, semanaTartaSeleccionada) => {
  const items = [];

  Object.entries(selecciones).forEach(([diaClave, platos]) => {
    const partes = diaClave.split('-');
    const fechaISO = partes.length === 4 ? `${partes[1]}-${partes[2]}-${partes[3]}` : null;

    Object.values(platos).forEach(p => {
      if (parseInt(p.cantidad || 0) > 0) {
        items.push({
          item_type: p.tipo || 'daily',
          item_id: p.id || p.item_id,
          quantity: p.cantidad,
          dia: diaClave,
          fecha_dia: fechaISO,
        });
      }
    });
  });

  Object.entries(tartas || {}).forEach(([tipo, cantidad]) => {
    if (parseInt(cantidad || 0) > 0) {
      const semana = semanasDisponibles.find(s => s.id === semanaTartaSeleccionada);
      items.push({
        item_type: 'tarta',
        item_id: tipo,
        quantity: cantidad,
        dia: `tarta-${semanaTartaSeleccionada}`,
        fecha_dia: semana?.semana_inicio || null,
      });
    }
  });

  return items;
};


const handleGuardarPedido = async () => {
  try {
    setGuardando(true);

    const hayPlatos = Object.values(activeSelecciones || {}).some(dia =>
      Object.values(dia || {}).some(p =>
        ['daily', 'fijo', 'especial', 'company'].includes(p.tipo) &&
        parseInt(p.cantidad || 0) > 0
      )
    );

    const hayTartas = Object.values(tartasSeleccionadas || {}).some(c => parseInt(c || 0) > 0);

    if (!hayPlatos && !hayTartas) {
      enqueueSnackbar('⚠️ No seleccionaste ningún plato ni tarta', { variant: 'warning' });
      setGuardando(false);
      return;
    }

    const items = transformarParaBackend(
      activeSelecciones,
      tartasSeleccionadas,
      semanasDisponibles,
      semanaTartaSeleccionada
    );

    const primerItemConFecha = items.find(i => i.fecha_dia);
    if (!primerItemConFecha) {
      enqueueSnackbar('❌ No se pudo determinar la fecha de entrega', { variant: 'error' });
      setGuardando(false);
      return;
    }



    const body = {
      items,
      total,
      fecha_entrega: primerItemConFecha.fecha_dia,
      observaciones: observaciones || '',
      metodoPago: metodoPago || 'efectivo',
      tipoMenu: roleNombre,
      comprobanteUrl: null,
    };

    console.log('✅ Enviando pedido:', body);
    const res = await api.post('/orders', body);

    if (res.data?.id) {
      enqueueSnackbar('✅ Pedido confirmado correctamente', { variant: 'success' });
      setPedidoExitoso(true);
    }

  } catch (error) {
    console.error('❌ Error al guardar pedido:', error);
    enqueueSnackbar('⚠️ Error al guardar pedido', { variant: 'error' });
  } finally {
    setGuardando(false);
  }
};

const handleActualizarPedido = async () => {
  try {
    setGuardando(true);

    const items = transformarParaBackend(
      activeSelecciones,
      tartasSeleccionadas,
      semanasDisponibles,
      semanaTartaSeleccionada
    );

    const { total } = estimarTotal();

    const body = {
      items,
      total,
      observaciones: observaciones || '',
      metodoPago: metodoPago || 'efectivo'
    };

    console.log('✏️ Actualizando pedido:', body);

    // ⛔ NO: await api.put(`/orders/${pedidoId}`, body);
    // ✅ SÍ:
    const res = await api.put(`/orders/${pedidoId}/update-items`, body);

    if (res.data?.success) {
      enqueueSnackbar('✅ Pedido actualizado correctamente', { variant: 'success' });
      setPedidoExitoso(true);
    }

  } catch (error) {
    console.error('❌ Error al actualizar pedido:', error);
    enqueueSnackbar('⚠️ Error al actualizar pedido', { variant: 'error' });
  } finally {
    setGuardando(false);
  }
};


  if (loadingPrecios || !precios || loadingMenu) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <Typography align="center">Cargando datos...</Typography>
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
// ⏳ Mostrar pantalla de carga mientras se guarda el pedido


// ✅ Esto va ANTES de todos los return
const { total, totalPlatos } = estimarTotal();
const totalTartas = Object.values(tartasSeleccionadas || {}).reduce(
  (sum, cant) => sum + (parseInt(cant) || 0), 0
);

if (confirmando) {
  const { descuento } = estimarTotal();
  const preciosActualizados = getPrecios();

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
        semanaTartas={semanasDisponibles.find(s => s.id === semanaTartaSeleccionada)}
        extrasDetalle={extrasDetalle}
        loading={loadingPrecios}
        isEmpresa={activeTab === 'empresa'}
        onEditar={() => setConfirmando(false)}
        onConfirmarFinal={modoEdicion ? handleActualizarPedido : handleGuardarPedido}
        guardando={guardando}
        subtotalPlatos={totalPlatos * preciosActualizados.plato}
        subtotalExtras={Object.values(extrasDetalle).flatMap(d => Object.values(d)).reduce((sum, e) => sum + e.cantidad * e.precio, 0)}
        subtotalEnvio={Object.values(activeSelecciones).filter(dia =>
          Object.values(dia).some(p => ['daily','fijo','especial','company'].includes(p.tipo) && p.cantidad > 0)
        ).length * preciosActualizados.envio}
        subtotalTartas={Object.entries(tartasSeleccionadas).reduce((sum, [tipo, cant]) => {
          const precio = Number(preciosTartaDB[tipo]) || 0;
          return sum + precio * (Number(cant) || 0);
        }, 0)}
      />
    </Container>
  );
}


if (pedidoExitoso) {
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
   <PedidoConfirmado modoEdicion={modoEdicion} />
   
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 4 }}
        onClick={() => {
          setPedidoExitoso(false);
          setConfirmando(false);
          setSeleccionesUsuario({});
          setSeleccionesEmpresa({});
          setTartasSeleccionadas({});
          setObservaciones('');
          setMetodoPago('');
          setPedidoConfirmado(null);
          navigate('/app'); // cambia si tu ruta de inicio es otra
        }}
      >
        🛒 Hacer otro pedido
      </Button>
    </Container>
  );
}





  return (
    <>
      <Container maxWidth="sm" sx={{ mt: 4, pb: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <LogoAnimado />
          {modoEdicion && (
  <Alert severity="info" sx={{ mb: 2 }}>
    Estás editando un pedido existente. Recordá guardar los cambios para que se actualicen.
  </Alert>
)}

          <Typography variant="h5" fontWeight="bold">
  {modoEdicion ? '✏️ Editar pedido' : `¡Hola ${user.name}! 🌱`}
</Typography>
          <Typography variant="h6" fontWeight="bold" sx={{ my: 2 }}>🥗 Elegí tu comida semanal</Typography>
          {semanasDisponibles.length > 1 && (
  <Box sx={{ mb: 2 }}>
    <Typography variant="body2" fontWeight="bold">🗓️ Semanas disponibles:</Typography>
    {semanasDisponibles.map((s, i) => (
      <Typography key={s.id} variant="body2">
        Semana {i + 1}: {dayjs(s.semana_inicio).format('DD/MM')} al {dayjs(s.semana_fin).format('DD/MM')}
      </Typography>
    ))}
  </Box>
)}

        </Box>

        {user.role === 99 && (
          <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} centered sx={{ mb: 2 }}>
            <Tab label="🧍 Usuario" value="usuario" />
            <Tab label="🏢 Empresa" value="empresa" />
          </Tabs>
        )}

        {semanaActual?.habilitado && (
          <>
            <Typography variant="body2" sx={{ mb: 2 }}>
              📅 Pedidos habilitados del <strong>{dayjs(semanaActual.semana_inicio).format('DD/MM/YYYY')}</strong> al{' '}
              <strong>{dayjs(semanaActual.semana_fin).format('DD/MM/YYYY')}</strong>
            </Typography>
            {Object.entries(semanaActual.dias_habilitados || {})
              .filter(([_, habilitado]) => !habilitado)
              .map(([dia]) => (
                <Typography key={dia} variant="body2" color="error" sx={{ mb: 1 }}>
                  🚫 {dia.charAt(0).toUpperCase() + dia.slice(1)} deshabilitado para pedidos.
                </Typography>
              ))}
          </>
        )}

        <AccordionMenuContainer
          menuData={menuPorDia}
          selecciones={activeSelecciones}
          onSelect={setActiveSelecciones}
          diasHabilitados={semanaActual?.dias_habilitados || {}}
          semanaCerrada={semanaCerrada}
        />
<TartaGallery
  seleccionadas={tartasSeleccionadas}
  onChange={setTartasSeleccionadas}
  tartasDisponibles={tartasDisponibles}
  semanasDisponibles={semanasDisponibles}
  semanaSeleccionada={semanaTartaSeleccionada}
  onSemanaChange={setSemanaTartaSeleccionada}
/>

        <Typography variant="h6" sx={{ mt: 3 }}>📝 Observaciones</Typography>
        <TextField multiline rows={3} fullWidth value={observaciones} onChange={(e) => setObservaciones(e.target.value)} sx={{ mt: 1, mb: 2 }} />

<Box
  sx={{
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    bgcolor: '#fff',
    p: 2,
    borderTop: '1px solid #ddd',
    zIndex: 1200, // por encima del contenido
  }}
>
  <Box sx={{ mb: 1, textAlign: 'center' }}>
  <Typography variant="body2" fontWeight="bold">
    🍽️ {totalPlatos} plato{totalPlatos !== 1 ? 's' : ''} + 🥧 {totalTartas} tarta{totalTartas !== 1 ? 's' : ''} = ${total.toLocaleString()}
  </Typography>
</Box>

  <Button
    id="confirmar-pedido-btn"
    variant="contained"
    color="success"
    fullWidth
    disabled={
      semanaCerrada ||
      !(
        Object.values(activeSelecciones || {}).some(dia =>
          Object.values(dia || {}).some(plato =>
            plato &&
            ['daily', 'fijo', 'especial', 'company', 'extra'].includes(plato.tipo) &&
            parseInt(plato.cantidad || 0) > 0
          )
        ) ||
        Object.values(tartasSeleccionadas || {}).some(cant => parseInt(cant || 0) > 0)
      )
    }
    onClick={() => {
      if (!semanaActual?.semana_inicio) {
        enqueueSnackbar('❌ Semana inválida', { variant: 'error' });
        return;
      }

      const fechasEntregaPlatos = Object.keys(activeSelecciones)
        .filter(clave =>
          Object.values(activeSelecciones[clave]).some(p => parseInt(p.cantidad) > 0)
        )
        .map(clave => {
          const partes = clave.split('-');
          const dia = partes[0];

          if (partes.length === 4) {
            const fechaCompleta = `${partes[1]}-${partes[2]}-${partes[3]}`;
            return {
              tipo: 'plato',
              dia,
              fecha: dayjs(fechaCompleta).format('DD/MM/YYYY'),
              fechaISO: fechaCompleta
            };
          }

          const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
          const indiceDia = diasSemana.indexOf(dia);
          if (indiceDia !== -1) {
            const inicio = dayjs(semanaActual.semana_inicio);
            const fechaCalculada = inicio.add(indiceDia, 'day');
            return {
              tipo: 'plato',
              dia,
              fecha: fechaCalculada.format('DD/MM/YYYY'),
              fechaISO: fechaCalculada.format('YYYY-MM-DD')
            };
          }

          return null;
        })
        .filter(Boolean);

      let fechasEntrega = [...fechasEntregaPlatos];

      if (Object.values(tartasSeleccionadas || {}).some(c => parseInt(c) > 0)) {
        const semanaTartas = semanasDisponibles.find(s => s.id === semanaTartaSeleccionada);
        if (semanaTartas) {
          fechasEntrega.push({
            tipo: 'tarta',
            dia: 'tartas',
            fecha: dayjs(semanaTartas.semana_inicio).format('DD/MM/YYYY'),
            fechaISO: dayjs(semanaTartas.semana_inicio).format('YYYY-MM-DD')
          });
        }
      }

      console.log('📦 Pedido confirmado:', {
        fechasEntrega,
        detalleCompleto: fechasEntrega
          .map(item => `${item.tipo === 'tarta' ? '🥧 Tarta' : '🍽️'} ${item.dia} (${item.fecha})`)
          .join(', '),
        confirmadoEl: new Date().toLocaleString('es-AR')
      });

      setConfirmando(true);
    }}
  >
    {modoEdicion ? '💾 Guardar cambios' : 'Confirmar pedido'}
  </Button>
</Box>



        <Button onClick={() => dispatch(logout())} variant="outlined" fullWidth sx={{ mt: 3 }}>
          Cerrar sesión
        </Button>
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