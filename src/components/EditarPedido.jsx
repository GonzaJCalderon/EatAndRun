import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainApp from '../MainApp';
import api from '../api/api';
import dayjs from '../utils/day';

// 🔥 Función para normalizar días
const normalizarDia = (dia) => {
  return String(dia || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const EditarPedidoWrapper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedidoCargado, setPedidoCargado] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        // 🧾 1. Traer datos del pedido
        const res = await api.get(`/orders/${id}`);
        const pedido = res.data;

        // ⛔️ 2. Consultar si sigue siendo editable
        const editableResp = await api.get(`/orders/${id}/editable`);
        const { editable } = editableResp.data || {};

        if (!editable) {
          alert('⚠️ Este pedido ya no se puede editar.');
          navigate('/mis-pedidos');
          return;
        }

        console.log('📦 Pedido cargado para edición:', pedido);
        setPedidoCargado(pedido);
      } catch (err) {
        console.error('❌ Error al cargar pedido:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPedido();
  }, [id, navigate]);

  if (loading) return <p>Cargando pedido...</p>;
  if (!pedidoCargado) return <p>Pedido no encontrado</p>;

  // ✅ Convertir el pedido a formato que MainApp espera
  const inicial = {
    seleccionesUsuario: {},
    tartasSeleccionadas: {},
    semanaForzada: pedidoCargado.fecha || pedidoCargado.fecha_entrega,
  };

  const pedido = pedidoCargado.pedido || {};
  const fechaPorDia = pedido.fecha_dia_por_dia || {};

  // 🔥 PROCESAR DIARIOS
  Object.entries(pedido.diarios || {}).forEach(([diaCompleto, items]) => {
    const diaBase = normalizarDia(diaCompleto.split(' ')[0]);
    const fechaISO = fechaPorDia[diaBase];
    if (!fechaISO) return;

    const fecha = dayjs(fechaISO);
    if (!fecha.isValid()) return;

    const nombreDiaEs = fecha.locale('es').format('dddd');
    const fechaCorta = fecha.format('YYYY-MM-DD');
    const diaKey = `${nombreDiaEs}-${fechaCorta}`;

    if (!inicial.seleccionesUsuario[diaKey]) {
      inicial.seleccionesUsuario[diaKey] = {};
    }

    Object.entries(items).forEach(([nombre, cantidad]) => {
      const idMatch = nombre.match(/^ID:(\d+)$/i);
      const id = idMatch ? parseInt(idMatch[1]) : nombre;

      inicial.seleccionesUsuario[diaKey][`daily-${id}`] = {
        id,
        tipo: 'daily',
        cantidad: Number(cantidad),
        nombre,
      };
    });
  });

  // 🔥 PROCESAR EXTRAS
  Object.entries(pedido.extras || {}).forEach(([diaCompleto, items]) => {
    const diaBase = normalizarDia(diaCompleto.split(' ')[0]);
    const fechaISO = fechaPorDia[diaBase];
    if (!fechaISO) return;

    const fecha = dayjs(fechaISO);
    if (!fecha.isValid()) return;

    const nombreDiaEs = fecha.locale('es').format('dddd');
    const fechaCorta = fecha.format('YYYY-MM-DD');
    const diaKey = `${nombreDiaEs}-${fechaCorta}`;

    if (!inicial.seleccionesUsuario[diaKey]) {
      inicial.seleccionesUsuario[diaKey] = {};
    }

Object.entries(items).forEach(([nombre, cantidad]) => {
  const idMatch = nombre.match(/^ID:(\d+)$/i);
  const id = idMatch ? parseInt(idMatch[1]) : nombre;

  inicial.seleccionesUsuario[diaKey][`extra-${id}`] = {
    id,
    tipo: 'extra',
    cantidad: Number(cantidad),
    nombre,
    precio: 2800, // 💰 asigna el precio según ID o tipo si podés
  };
});

  });

  // 🔥 PROCESAR TARTAS
  Object.entries(pedido.tartas || {}).forEach(([tipo, cantidad]) => {
    inicial.tartasSeleccionadas[tipo] = Number(cantidad);
  });

  console.log('✅ Datos iniciales para MainApp:', inicial);

  return <MainApp edicion={inicial} pedidoId={id} />;
};

export default EditarPedidoWrapper;
