import React, { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Accordion, AccordionSummary, AccordionDetails,
  Typography, Box, TextField, Button, Table, TableHead,
  TableRow, TableCell, TableBody, Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import dayjs from '../utils/day';


const extraMap = {
  '1': '🍰 Postre',
  '2': '🥗 Ensalada',
  '3': '💪 Proteína',
};

const extraMapFijo = {
  '1': '🍰 Postre',
  '2': '🥗 Ensalada',
  '3': '💪 Proteína',
};

// 👈 Agregar esta constante
const manualAliases = {
  '0': '👉 DEFINIR NOMBRE PARA ID 0',
  '5': '👉 DEFINIR NOMBRE PARA ID 5', // El que estás viendo como "Plato 5"
  '8': '👉 DEFINIR NOMBRE PARA ID 8'
};


const cleanId = (id) => String(id).replace(/^ID:/, '');

// 🔧 Función mejorada para obtener la clave UI consistente
const getClaveUI = (fechaStr) => {
  if (!fechaStr) return null;
  
  const fecha = dayjs(fechaStr).locale('es'); // 👈 Asegurar locale español
  if (!fecha.isValid()) return null;
  
  const nombreDia = fecha.format('dddd');
  const fechaLegible = fecha.format('DD/MM');
  
  // Capitalizar primera letra
  const nombreDiaCapitalizado = nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1);
  
  return `${nombreDiaCapitalizado} ${fechaLegible}`;
};

const humanizar = (s = '') =>
  String(s)
    .replace(/^ID:/i, '')
    .replace(/_/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/^\w|\s\w/g, (c) => c.toUpperCase());

const resolveNombrePlato = (
  platoKey = '',
  categoria = 'diarios',
  nameMapLocal = {},
  extraMapLocal = extraMap
) => {
  const key = String(platoKey).trim();
  
  // 0️⃣ Revisar alias manual primero
  if (manualAliases[key]) return manualAliases[key];
  if (manualAliases[key.replace(/^ID:/i, '')]) {
    return manualAliases[key.replace(/^ID:/i, '')];
  }
  
  // 1️⃣ Formato "ID:29"
  const idMatch = key.match(/^ID:(\d+)$/i);
  if (idMatch) {
    const id = idMatch[1];
    if (categoria === 'extras') return extraMapLocal[id] || `Extra ${id}`;
    const catMap = nameMapLocal[categoria] || {};
    return catMap[id] || `Plato ${id}`;
  }
  
  // 2️⃣ Número puro (ej: "29")
  if (/^\d+$/.test(key)) {
    const catMap = nameMapLocal[categoria] || {};
    if (catMap[key]) return catMap[key];
    if (categoria === 'extras') return extraMapLocal[key] || `Extra ${key}`;
    return `Plato ${key}`;
  }
  
  // 3️⃣ Texto - Limpiar duplicación de "Tarta" en tartas
  const catMap = nameMapLocal[categoria] || {};
  if (catMap[key]) return catMap[key];
  
  // 🔥 Para tartas, evitar duplicar la palabra "Tarta"
  if (categoria === 'tartas') {
    const humanizado = humanizar(key);
    // Si ya empieza con "Tarta", no agregar "Tarta" de nuevo
    if (humanizado.toLowerCase().startsWith('tarta')) {
      return humanizado;
    }
    return `Tarta ${humanizado}`;
  }
  
  return humanizar(key);
};
const normalizeDiaLower = (str = '') =>
  String(str).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// 🔧 Nueva función para buscar datos por día que maneja mejor las claves inconsistentes
const buscarDataPorDia = (dataObj, diaUI, fechasPorDia = {}) => {
  if (!dataObj || !diaUI) return {};

  const diaUILower = normalizeDiaLower(diaUI);

  // 1️⃣ Buscar coincidencia directa
  const claveEncontrada = Object.keys(dataObj).find(clave => {
  return normalizeDiaLower(clave).startsWith(normalizeDiaLower(diaUI));
});

  if (claveEncontrada) {
    return Object.fromEntries(
      Object.entries(dataObj[claveEncontrada] || {}).map(([k, v]) => [cleanId(k), v])
    );
  }

  // 2️⃣ Si hay "sin_dia" y existe un match por fecha
  const matchKey = Object.entries(fechasPorDia).find(([_dia, fechaStr]) => {
    return getClaveUI(fechaStr) === diaUI;
  });

  if (matchKey && dataObj["sin_dia"]) {
    return Object.fromEntries(
      Object.entries(dataObj["sin_dia"] || {}).map(([k, v]) => [cleanId(k), v])
    );
  }

  return {};
};


const getNombrePersona = (p = {}) => {
  const u = p.usuario || {};
  const nombre = (u.nombre || p.usuario_nombre || p.nombre || '').trim();
  const apellido = (u.apellido || p.usuario_apellido || p.apellido || '').trim();
  return [nombre, apellido].filter(Boolean).join(' ') || '—';
};

const ProduccionEditablePorDia = ({ pedidos, onGuardarCambios, nameMap: nameMapLocal = {} }) => {
  const [ediciones, setEdiciones] = useState({});
  const user = useSelector((state) => state.auth.user);
  const isReadOnly = user?.role === 'moderador';

  useEffect(() => {
    setEdiciones({});
  }, [pedidos]);

  const handleChange = (pedidoId, path, value) => {
    if (isReadOnly) return;
    setEdiciones((prev) => ({
      ...prev,
      [pedidoId]: { ...prev[pedidoId], [path]: value },
    }));
  };

  const handleGuardar = async (pedidoId) => {
  if (isReadOnly) return;
  const cambios = ediciones[pedidoId];
  if (!cambios || Object.keys(cambios).length === 0) return;

  const pedidoOriginal = pedidos.find((p) => (p.id || p._id) === pedidoId);
  if (!pedidoOriginal) return;

  const itemsActualizados = [];
  const fechasPorDia = pedidoOriginal.pedido?.fecha_dia_por_dia || {};

  // 🔥 Platos diarios
// 🔥 Platos diarios
Object.entries(pedidoOriginal.pedido?.diarios || {}).forEach(([diaKey, platos]) => {
  const diaBase = normalizeDiaLower(diaKey.split(' ')[0]);
  
  const fechaDiaStr = Object.entries(fechasPorDia).find(
    ([k]) => normalizeDiaLower(k) === diaBase
  )?.[1];

  Object.entries(platos || {}).forEach(([platoKey, cantidadOriginal]) => {
    // 🔥 CRÍTICO: Limpiar el ID correctamente
    const cleanKey = cleanId(platoKey); // Quita "ID:" si existe
    const path = `diarios.${diaBase}.${cleanKey}`;
    const nuevaCantidad = cambios[path] ?? cantidadOriginal;

    if (Number(nuevaCantidad) > 0) {
      // 🔥 VALIDAR: Solo enviar si es numérico
      const itemIdNumerico = /^\d+$/.test(cleanKey) ? parseInt(cleanKey, 10) : null;
      
      if (itemIdNumerico === null) {
        console.warn(`⚠️ Plato con ID no numérico ignorado: ${platoKey}`);
        return;
      }

      itemsActualizados.push({
        item_type: 'daily',
        item_id: itemIdNumerico, // 🔥 Número puro
        dia: diaBase,
        fecha_dia: fechaDiaStr || null,
        quantity: Number(nuevaCantidad),
      });
    }
  });
});
  // 🔥 Extras - CRÍTICO: Enviar todos los extras, incluso los que no están en el pedido original
  const EXTRAS_PREDEFINIDOS = ['1', '2', '3'];
  Object.entries(fechasPorDia).forEach(([diaKey, fechaStr]) => {
    const diaBase = normalizeDiaLower(diaKey);
    const claveUI = getClaveUI(fechaStr);
    
    EXTRAS_PREDEFINIDOS.forEach((extraKey) => {
      const cleanExtra = cleanId(extraKey);
      const path = `extras.${diaBase}.${cleanExtra}`;
      
      // Buscar cantidad original
      const extrasDelDia = buscarDataPorDia(pedidoOriginal.pedido?.extras, claveUI);
      const cantidadOriginal = Number(extrasDelDia[cleanExtra] || 0);
      
      // Valor final: edición o original
      const cantidadFinal = cambios[path] !== undefined 
        ? Number(cambios[path]) 
        : cantidadOriginal;

      // 🔥 Enviar siempre, incluso si es 0 (para eliminar)
      itemsActualizados.push({
        item_type: 'extra',
        item_id: cleanExtra,
        dia: diaBase, // 🔥 SOLO el día: "viernes"
        fecha_dia: fechaStr,
        quantity: cantidadFinal,
      });
    });
  });

  // 🔥 Tartas
 // 🔥 Tartas - Permitir IDs de texto
Object.entries(pedidoOriginal.pedido?.tartas || {}).forEach(([tartaKey, cantidadOriginal]) => {
  const cleanKey = cleanId(tartaKey);
  const path = `tartas.${cleanKey}`;
  const nuevaCantidad = cambios[path] ?? cantidadOriginal;
  
  if (Number(nuevaCantidad) > 0) {
    itemsActualizados.push({
      item_type: 'tarta',
      item_id: cleanKey, // 👈 Dejar como string, no convertir a número
      quantity: Number(nuevaCantidad),
    });
  }
});

  const notaAdmin = cambios.nota_admin ?? pedidoOriginal.nota_admin;

  console.log('📤 Items finales a enviar:', JSON.stringify(itemsActualizados, null, 2));

  try {
    await onGuardarCambios?.(pedidoId, itemsActualizados, notaAdmin);
    
    // 🔥 Limpiar ediciones después de guardar exitosamente
    setEdiciones((prev) => {
      const newState = { ...prev };
      delete newState[pedidoId];
      return newState;
    });
  } catch (error) {
    console.error('❌ Error al guardar:', error);
  }
};

  // 🔧 Agrupación corregida de pedidos por día
const pedidosPorDia = useMemo(() => {
  const agrupado = {};

  (pedidos || []).forEach((p) => {
    const fechas = p.pedido?.fecha_dia_por_dia || {};


Object.entries(fechas).forEach(([diaKey, fechaStr]) => {
  const claveUI = getClaveUI(fechaStr);
  if (!claveUI) return;

  const keyPlato = Object.keys(p.pedido?.diarios || {}).find(k =>
    normalizeDiaLower(k).startsWith(normalizeDiaLower(diaKey))
  );
  const keyExtra = Object.keys(p.pedido?.extras || {}).find(k =>
    normalizeDiaLower(k).startsWith(normalizeDiaLower(diaKey))
  );

  const tienePlatos = keyPlato ? Object.keys(p.pedido.diarios[keyPlato] || {}).length > 0 : false;
  const tieneExtras = keyExtra ? Object.keys(p.pedido.extras[keyExtra] || {}).length > 0 : false;

  if (tienePlatos || tieneExtras || diaKey === 'sin_dia') {
    agrupado[claveUI] = agrupado[claveUI] || [];
    agrupado[claveUI].push(p);
  }
});

  });

  return agrupado;
}, [pedidos]);



  const pedidosConTartas = useMemo(() => {
    return (pedidos || []).filter((p) => Object.keys(p.pedido?.tartas || {}).length > 0);
  }, [pedidos]);

  const renderTablaPorDia = (diaUI, listaPedidos) => (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell><strong>Nombre y Apellido</strong></TableCell>
          <TableCell><strong>Platos</strong></TableCell>
          <TableCell><strong>Extras</strong></TableCell>
          <TableCell><strong>📝 Nota libre</strong></TableCell>
          <TableCell><strong>Observaciones</strong></TableCell>
          {!isReadOnly && <TableCell><strong>Guardar</strong></TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
     {listaPedidos.map((p, index) => {
          const id = p.id || p._id;
          const nombrePersona = getNombrePersona(p);

          // 🔧 Buscar el día correcto en fecha_dia_por_dia
          const fechaPorDia = p.pedido?.fecha_dia_por_dia || {};
          const diaKeyOriginal = Object.keys(fechaPorDia).find(
            dia => getClaveUI(fechaPorDia[dia]) === diaUI
          );
          
          const diaBaseNorm = diaKeyOriginal ? normalizeDiaLower(diaKeyOriginal) : '';

          // 🔧 Buscar platos y extras usando la clave UI
          const platos = buscarDataPorDia(p.pedido?.diarios, diaUI, p.pedido?.fecha_dia_por_dia);
         const extras = buscarDataPorDia(p.pedido?.extras, diaUI, p.pedido?.fecha_dia_por_dia);


          return (
            <TableRow key={`${id}-${diaUI}-${index}`}>
              <TableCell>{nombrePersona}</TableCell>
              
            {/* Platos */}
<TableCell>
  {Object.keys(platos).length === 0 ? (
    <Typography variant="body2" color="text.secondary">—</Typography>
  ) : (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell><strong>Plato</strong></TableCell>
          <TableCell><strong>Cant</strong></TableCell>
          <TableCell><strong>Nota</strong></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Object.entries(platos).map(([keyOriginal, cantidadOriginal]) => {
          const idLimpio = cleanId(keyOriginal);
          const pathCantidad = `diarios.${diaBaseNorm}.${idLimpio}`;
          const pathNota = `diarios.${diaBaseNorm}.${idLimpio}.nota`;
          const valorActual = ediciones[id]?.[pathCantidad] ?? cantidadOriginal;
          const notaActual = ediciones[id]?.[pathNota] ?? '';
          
          return (
            <TableRow key={keyOriginal}>
              <TableCell>
                <Typography variant="body2">
                  {resolveNombrePlato(idLimpio, 'diarios', nameMapLocal)}
                </Typography>
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={String(valorActual ?? '')}
                  disabled={isReadOnly}
                  sx={{ width: '70px' }}
                  onChange={(e) =>
                    handleChange(id, pathCantidad, e.target.value === '' ? '' : Number(e.target.value))
                  }
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  multiline
                  fullWidth
                  value={notaActual}
                  disabled={isReadOnly}
                  placeholder="Nota del plato"
                  onChange={(e) => handleChange(id, pathNota, e.target.value)}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  )}
</TableCell>
      
      {/* Extras */}
<TableCell>
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell><strong>Extra</strong></TableCell>
        <TableCell><strong>Cant</strong></TableCell>
        <TableCell><strong>Nota</strong></TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {['1', '2', '3'].map((extraKey) => {
        const cleanExtra = cleanId(extraKey);
        const pathCantidad = `extras.${diaBaseNorm}.${cleanExtra}`;
        const pathNota = `extras.${diaBaseNorm}.${cleanExtra}.nota`;
        const cantidad = Number(extras[cleanExtra] ?? 0);
        const valorActual = ediciones[id]?.[pathCantidad] ?? cantidad;
        const notaActual = ediciones[id]?.[pathNota] ?? '';
        
        return (
          <TableRow key={extraKey}>
            <TableCell>
              <Typography variant="body2">
                {resolveNombrePlato(cleanExtra, 'extras', nameMapLocal)}
              </Typography>
            </TableCell>
            <TableCell>
              <TextField
                size="small"
                type="number"
                inputProps={{ min: 0 }}
                value={String(valorActual)}
                disabled={isReadOnly}
                placeholder="0"
                sx={{ width: '70px' }}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : Number(e.target.value);
                  handleChange(id, pathCantidad, val);
                }}
              />
            </TableCell>
            <TableCell>
              <TextField
                size="small"
                multiline
                fullWidth
                value={notaActual}
                disabled={isReadOnly}
                placeholder="Nota del extra"
                onChange={(e) => handleChange(id, pathNota, e.target.value)}
              />
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
</TableCell>
              {/* Nota libre */}
            {/* Nota libre */}
<TableCell>
  {(() => {
    console.log('🔍 Renderizando nota para pedido:', {
      pedidoId: id,
      valorEnEdiciones: ediciones[id]?.nota_admin,
      valorOriginal: p.nota_admin,
      todosLosEdiciones: ediciones
    });
    return null;
  })()}
  <TextField
    fullWidth
    multiline
    size="small"
    value={ediciones[id]?.nota_admin ?? p.nota_admin ?? ''}
    disabled={isReadOnly}
    onChange={(e) => handleChange(id, 'nota_admin', e.target.value)}
  />
</TableCell>
              
              {/* Observaciones */}
              <TableCell>
                <Typography variant="body2">{p.observaciones || '—'}</Typography>
              </TableCell>
              
              {/* Botón Guardar */}
              {!isReadOnly && (
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleGuardar(id)}
                    disabled={!ediciones[id] || Object.keys(ediciones[id]).length === 0}
                  >
                    Guardar
                  </Button>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  const renderTablaTartas = (listaPedidos) => (
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell><strong>Nombre y Apellido</strong></TableCell>
        <TableCell><strong>Tartas</strong></TableCell>
        <TableCell><strong>Fecha de entrega</strong></TableCell>
        <TableCell><strong>📝 Nota libre</strong></TableCell>
        <TableCell><strong>Observaciones</strong></TableCell>
        {!isReadOnly && <TableCell><strong>Guardar</strong></TableCell>}
      </TableRow>
    </TableHead>
    <TableBody>
      {listaPedidos.map((p, index) => {
        const id = p.id || p._id;
        const nombrePersona = getNombrePersona(p);
        const tartas = p.pedido?.tartas || {};
        
        // Obtener fecha de entrega si está disponible
 const fechasPorDia = p.pedido?.fecha_dia_por_dia || {};
const fechasOrdenadas = Object.values(fechasPorDia)
  .map(f => dayjs(f))
  .filter(f => f.isValid())
  .sort((a, b) => a.valueOf() - b.valueOf());


// 📅 Obtener fecha de entrega con timezone correcto
const fechaBase = dayjs.tz(p.fecha_entrega_tartas || p.fecha, 'America/Argentina/Buenos_Aires');

let fechaEntrega = '—';

if (fechaBase.isValid()) {
  const lunes = fechaBase.startOf('week').add(1, 'day'); // lunes
  const sabado = lunes.add(5, 'day'); // sábado
  fechaEntrega = `Semana del ${lunes.format('DD/MM')} al ${sabado.format('DD/MM')}`;
}






        return (
          <TableRow key={`${id}-tartas-${index}`}>
            <TableCell>{nombrePersona}</TableCell>
            <TableCell>
              {Object.entries(tartas).map(([key, cantidad]) => {
                const cleanKey = cleanId(key);
                const path = `tartas.${cleanKey}`;
                const valorActual = ediciones[id]?.[path] ?? cantidad;
                
                return (
                  <Box key={key} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      {resolveNombrePlato(cleanKey, 'tartas', nameMapLocal)}
                    </Typography>
                    <TextField
                      size="small"
                      type="number"
                      inputProps={{ min: 0 }}
                      value={String(valorActual ?? '')}
                      disabled={isReadOnly}
                      onChange={(e) =>
                        handleChange(id, path, e.target.value === '' ? '' : Number(e.target.value))
                      }
                    />
                  </Box>
                );
              })}
            </TableCell>
            <TableCell>{fechaEntrega}</TableCell>
            <TableCell>
              <TextField
                fullWidth
                multiline
                size="small"
                value={ediciones[id]?.nota_admin ?? p.nota_admin ?? ''}
                disabled={isReadOnly}
                onChange={(e) => handleChange(id, 'nota_admin', e.target.value)}
              />
            </TableCell>
            <TableCell>
              <Typography variant="body2">{p.observaciones || '—'}</Typography>
            </TableCell>
            {!isReadOnly && (
              <TableCell>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleGuardar(id)}
                  disabled={!ediciones[id] || Object.keys(ediciones[id]).length === 0}
                >
                  Guardar
                </Button>
              </TableCell>
            )}
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);

  return (
    <Box>
      {Object.entries(pedidosPorDia)
        .sort(([diaA], [diaB]) => {
          // Ordenar por fecha
          const fechaA = dayjs(diaA.split(' ')[1], 'DD/MM');
          const fechaB = dayjs(diaB.split(' ')[1], 'DD/MM');
          return fechaA.diff(fechaB);
        })
        .map(([diaUI, pedidosDelDia]) => (
          <Accordion key={diaUI} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 600 }}>
                📅 {diaUI} ({pedidosDelDia.length} pedido{pedidosDelDia.length !== 1 ? 's' : ''})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Paper elevation={1}>{renderTablaPorDia(diaUI, pedidosDelDia)}</Paper>
            </AccordionDetails>
          </Accordion>
        ))}

      {pedidosConTartas.length > 0 && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 600 }}>
              🍰 Tartas ({pedidosConTartas.length} pedido{pedidosConTartas.length !== 1 ? 's' : ''})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Paper elevation={1}>{renderTablaTartas(pedidosConTartas)}</Paper>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
};

export default ProduccionEditablePorDia;