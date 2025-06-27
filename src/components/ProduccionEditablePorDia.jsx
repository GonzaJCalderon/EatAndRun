import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Box,
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState, useEffect } from 'react';

const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

const extraMap = {
  "1": "🍰 Postre",
  "2": "🥗 Ensalada",
  "3": "💪 Proteína",
  "ID:1": "🍰 Postre",
  "ID:2": "🥗 Ensalada",
  "ID:3": "💪 Proteína"
};

const ProduccionEditablePorDia = ({ pedidos, onGuardarCambios, onResumenEditado }) => {
  const [edit, setEdit] = useState({});

  const isDirty = (pedidoId) => !!edit[pedidoId];

  const handleCantidadChange = (pedidoId, dia, tipo, nombre, nuevaCantidad) => {
    setEdit(prev => {
      const updated = {
        ...prev,
        [pedidoId]: {
          ...(prev[pedidoId] || {}),
          [dia]: {
            ...(prev[pedidoId]?.[dia] || {}),
            [tipo]: {
              ...(prev[pedidoId]?.[dia]?.[tipo] || {}),
              [nombre]: nuevaCantidad
            }
          }
        }
      };
      return updated;
    });
  };

  const handleObservacionChange = (pedidoId, value) => {
    setEdit(prev => ({
      ...prev,
      [pedidoId]: {
        ...(prev[pedidoId] || {}),
        observaciones: value
      }
    }));
  };

  const handleNotaPorFila = (pedidoId, dia, nota) => {
    setEdit(prev => ({
      ...prev,
      [pedidoId]: {
        ...(prev[pedidoId] || {}),
        notas: {
          ...(prev[pedidoId]?.notas || {}),
          [dia]: nota
        }
      }
    }));
  };

  const handleGuardar = (pedidoId) => {
    const cambios = edit[pedidoId];
    if (!cambios) return;
    onGuardarCambios(pedidoId, cambios);
    setEdit(prev => {
      const nuevo = { ...prev };
      delete nuevo[pedidoId];
      return nuevo;
    });
  };

  // 🧠 Generador de resumen actualizado en base a datos + edición
  const calcularResumenActual = () => {
    const resumen = {};
    const observaciones = {};
    const total = {};

    pedidos.forEach(pedido => {
      const id = pedido.id;
      const usuario = pedido.usuario || {};
      const nombreUsuario = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();

      diasSemana.forEach(dia => {
        const platos = pedido.pedido?.diarios?.[dia] || {};
        const extras = pedido.pedido?.extras?.[dia] || {};
        const tartas = pedido.pedido?.tartas || {};

        const editPedido = edit[id]?.[dia] || {};

        const editPlatos = editPedido.platos || {};
        const editExtras = editPedido.extras || {};
        const editTartas = edit[id]?.[dia]?.tartas || {};

        const platosFinal = { ...platos, ...editPlatos };
        const extrasFinal = { ...extras, ...editExtras };
        const tartasFinal = { ...tartas, ...editTartas };

        const keyDia = dia.toUpperCase();
        if (!resumen[keyDia]) resumen[keyDia] = {};
        if (!observaciones[keyDia]) observaciones[keyDia] = [];

        Object.entries(platosFinal).forEach(([nombre, cantidad]) => {
          const cantidadNum = Number(cantidad);
          resumen[keyDia][nombre] = (resumen[keyDia][nombre] || 0) + cantidadNum;
          total[nombre] = (total[nombre] || 0) + cantidadNum;
        });

        Object.entries(extrasFinal).forEach(([nombre, cantidad]) => {
          const cantidadNum = Number(cantidad);
          const idNorm = nombre.replace(/^ID:/, '');
          const nombrePlato = extraMap[nombre] || extraMap[idNorm] || `Extra ${idNorm}`;
          resumen[keyDia][nombrePlato] = (resumen[keyDia][nombrePlato] || 0) + cantidadNum;
          total[nombrePlato] = (total[nombrePlato] || 0) + cantidadNum;
        });

        Object.entries(tartasFinal).forEach(([nombre, cantidad]) => {
          const cantidadNum = Number(cantidad);
          if (!resumen["TARTAS"]) resumen["TARTAS"] = {};
          resumen["TARTAS"][nombre] = (resumen["TARTAS"][nombre] || 0) + cantidadNum;
          total[nombre] = (total[nombre] || 0) + cantidadNum;
        });

        const obs = edit[id]?.observaciones || pedido.observaciones;
        if (obs) {
          if (Object.keys(tartasFinal).length > 0) {
            if (!observaciones["TARTAS"]) observaciones["TARTAS"] = [];
            observaciones["TARTAS"].push(`• ${nombreUsuario}: ${obs}`);
          } else {
            observaciones[keyDia].push(`• ${nombreUsuario}: ${obs}`);
          }
        }
      });
    });

    onResumenEditado?.({ resumen, observaciones, total });
  };

  // ⚙️ Recalcular automáticamente al editar
  useEffect(() => {
    calcularResumenActual();
  }, [edit, pedidos]);

  return (
    <Box>
      {diasSemana.map(dia => {
        const pedidosDia = pedidos.filter(p => p?.pedido?.diarios?.[dia]);

        return (
          <Accordion key={dia} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">📅 {dia.toUpperCase()}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Nombre</strong></TableCell>
                    <TableCell><strong>Apellido</strong></TableCell>
                    <TableCell><strong>Platos</strong></TableCell>
                    <TableCell><strong>Extras</strong></TableCell>
                    <TableCell><strong>Tartas</strong></TableCell>
                    <TableCell><strong>📝 Nota libre</strong></TableCell>
                    <TableCell><strong>Observaciones</strong></TableCell>
                    <TableCell><strong>Guardar</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pedidosDia.map(pedido => {
                    const usuario = pedido.usuario || {};
                    const platos = pedido.pedido?.diarios?.[dia] || {};
                    const extras = pedido.pedido?.extras?.[dia] || {};
                    const tartas = pedido.pedido?.tartas || {};
                    const observacionActual = edit[pedido.id]?.observaciones ?? pedido.observaciones ?? '';
                    const notaLibre = edit[pedido.id]?.notas?.[dia] ?? '';

                    return (
                      <TableRow key={pedido.id} sx={isDirty(pedido.id) ? { backgroundColor: '#fff9c4' } : {}}>
                        <TableCell>{usuario.nombre}</TableCell>
                        <TableCell>{usuario.apellido}</TableCell>

                        {/* PLATOS */}
                        <TableCell>
                          {Object.entries(platos).map(([nombre, cantidad]) => {
                            const value = edit[pedido.id]?.[dia]?.platos?.[nombre] ?? cantidad;
                            return (
                              <Box key={nombre} mb={1}>
                                <Typography variant="body2">{nombre}</Typography>
                                <TextField
                                  type="number"
                                  size="small"
                                  value={value}
                                  onChange={(e) =>
                                    handleCantidadChange(pedido.id, dia, 'platos', nombre, Number(e.target.value))
                                  }
                                  inputProps={{ min: 0 }}
                                />
                              </Box>
                            );
                          })}
                        </TableCell>

                        {/* EXTRAS */}
                        <TableCell>
                          {Object.entries(extras).map(([extraKey, qty]) => {
                            const id = extraKey.replace(/^ID:/, '');
                            const nombre = extraMap[extraKey] || extraMap[id] || `Extra ${id}`;
                            const value = edit[pedido.id]?.[dia]?.extras?.[extraKey] ?? qty;

                            return (
                              <Box key={extraKey} mb={1}>
                                <Typography variant="body2">{nombre}</Typography>
                                <TextField
                                  type="number"
                                  size="small"
                                  value={value}
                                  onChange={(e) =>
                                    handleCantidadChange(pedido.id, dia, 'extras', extraKey, Number(e.target.value))
                                  }
                                  inputProps={{ min: 0 }}
                                />
                              </Box>
                            );
                          })}
                        </TableCell>

                        {/* TARTAS */}
                        <TableCell>
                          {Object.entries(tartas).map(([nombre, cantidad]) => {
                            const value = edit[pedido.id]?.[dia]?.tartas?.[nombre] ?? cantidad;
                            return (
                              <Box key={nombre} mb={1}>
                                <Typography variant="body2">{nombre}</Typography>
                                <TextField
                                  type="number"
                                  size="small"
                                  value={value}
                                  onChange={(e) =>
                                    handleCantidadChange(pedido.id, dia, 'tartas', nombre, Number(e.target.value))
                                  }
                                  inputProps={{ min: 0 }}
                                />
                              </Box>
                            );
                          })}
                        </TableCell>

                        {/* NOTA LIBRE */}
                        <TableCell>
                          <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            placeholder="✍️ Nota libre para producción"
                            value={notaLibre}
                            onChange={(e) => handleNotaPorFila(pedido.id, dia, e.target.value)}
                          />
                        </TableCell>

                        {/* OBSERVACIONES */}
                        <TableCell>
                          <TextField
                            multiline
                            fullWidth
                            minRows={2}
                            value={observacionActual}
                            onChange={(e) => handleObservacionChange(pedido.id, e.target.value)}
                          />
                        </TableCell>

                        {/* GUARDAR */}
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleGuardar(pedido.id)}
                          >
                            Guardar
                          </Button>
                          {isDirty(pedido.id) && (
                            <Typography variant="caption" color="warning.main" display="block">
                              🟡 Cambios sin guardar
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default ProduccionEditablePorDia;
