import React, { useState } from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails,
  Typography, Box, TextField, Button, Table, TableHead,
  TableRow, TableCell, TableBody, Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const diasOrdenados = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

const extraMap = {
  "1": "🍰 Postre",
  "2": "🥗 Ensalada",
  "3": "💪 Proteína"
};

const ProduccionEditablePorDia = ({ pedidos, onGuardarCambios }) => {
  const [ediciones, setEdiciones] = useState({});

  const handleChange = (pedidoId, path, value) => {
    setEdiciones(prev => ({
      ...prev,
      [pedidoId]: {
        ...prev[pedidoId],
        [path]: value
      }
    }));
  };

  const handleGuardar = (pedidoId) => {
    const cambios = ediciones[pedidoId];
    if (cambios) {
      onGuardarCambios(pedidoId, cambios);
    }
  };

  // Agrupar pedidos por día
const pedidosPorDia = {};

pedidos.forEach(p => {
  const diarios = p.pedido?.diarios || {};
  const extras = p.pedido?.extras || {};
  const fechaPorDia = p.pedido?.fecha_dia_por_dia || {};

  const diasConPedidos = new Set([...Object.keys(diarios), ...Object.keys(extras)]);

  diasConPedidos.forEach(dia => {
    const fechaStr = fechaPorDia?.[dia] || null;
    let clave = dia;

    if (fechaStr) {
      const fecha = dayjs(typeof fechaStr === 'string' ? fechaStr.split('T')[0] : fechaStr);
      const nombreDia = fecha.format('dddd');
      const fechaLegible = fecha.format('DD/MM');
      clave = `${nombreDia} ${fechaLegible}`;
    }

    if (!pedidosPorDia[clave]) pedidosPorDia[clave] = [];
    pedidosPorDia[clave].push(p);
  });
});

  const renderTablaPorDia = (dia, listaPedidos) => (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell><strong>Nombre y Apellido</strong></TableCell>
          <TableCell><strong>Platos</strong></TableCell>
          <TableCell><strong>Extras</strong></TableCell>
          <TableCell><strong>📝 Nota libre</strong></TableCell>
          <TableCell><strong>Observaciones</strong></TableCell>
          <TableCell><strong>Guardar</strong></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {listaPedidos.map(p => {
          const id = p.id || p._id;
          const usuario = p.usuario || {};
          const nombre = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();
          const platos = p.pedido?.diarios?.[dia] || {};
          const extras = p.pedido?.extras?.[dia] || {};

          return (
            <TableRow key={`${id}-${dia}`}>
              <TableCell>{nombre}</TableCell>

              <TableCell>
                {Object.entries(platos).map(([nombrePlato, cantidad]) => (
                  <Box key={nombrePlato} sx={{ mb: 1 }}>
                    <Typography>{nombrePlato}</Typography>
                    <TextField
                      size="small"
                      type="number"
                      defaultValue={cantidad}
                      onChange={(e) =>
                        handleChange(id, `diarios.${dia}.${nombrePlato}`, Number(e.target.value))
                      }
                    />
                  </Box>
                ))}
              </TableCell>

              <TableCell>
                {Object.entries(extras).map(([extraId, cantidad]) => {
                  const cleanId = extraId.replace(/^ID:/, '');
                  const nombreExtra = extraMap[cleanId] || `Extra ${cleanId}`;
                  return (
                    <Box key={extraId} sx={{ mb: 1 }}>
                      <Typography>{nombreExtra}</Typography>
                      <TextField
                        size="small"
                        type="number"
                        defaultValue={cantidad}
                        onChange={(e) =>
                          handleChange(id, `extras.${dia}.${extraId}`, Number(e.target.value))
                        }
                      />
                    </Box>
                  );
                })}
              </TableCell>

              <TableCell>
                <TextField
                  fullWidth
                  multiline
                  defaultValue={p.nota_admin || ''}
                  onChange={(e) => handleChange(id, 'nota_admin', e.target.value)}
                />
              </TableCell>

              <TableCell>
                <Typography variant="body2">{p.observaciones || '—'}</Typography>
              </TableCell>

              <TableCell>
                <Button variant="contained" onClick={() => handleGuardar(id)}>
                  Guardar
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  const renderTartas = () => {
    const conTartas = pedidos.filter(p => Object.keys(p.pedido?.tartas || {}).length > 0);

    if (conTartas.length === 0) return null;

    return (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 600 }}>🥧 TARTAS (semana)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Paper elevation={1}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Empleado</TableCell>
                  <TableCell>Tarta</TableCell>
                  <TableCell>Cantidad</TableCell>
                  <TableCell>📝 Nota libre</TableCell>
                  <TableCell>Observaciones</TableCell>
                  <TableCell>Guardar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {conTartas.map(p => {
                  const id = p.id || p._id;
                  const nombre = `${p.usuario?.nombre || ''} ${p.usuario?.apellido || ''}`.trim();
                  return Object.entries(p.pedido?.tartas || {}).map(([tarta, cantidad]) => (
                    <TableRow key={`${id}-tarta-${tarta}`}>
                      <TableCell>
                        <Typography variant="body2">{nombre}</Typography>
                        <Typography variant="caption" sx={{ color: "#7f8c8d", display: "block" }}>
                          <b>Pedido:</b> {p.created_at || p.fecha_entrega ? dayjs(typeof (p.created_at || p.fecha_entrega) === 'string' ? (p.created_at || p.fecha_entrega).split('T')[0] : (p.created_at || p.fecha_entrega)).format('DD/MM') : 'S/D'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#7f8c8d", display: "block" }}>
                          <b>Entrega:</b> {p.fecha_entrega_tartas ? dayjs(typeof p.fecha_entrega_tartas === 'string' ? p.fecha_entrega_tartas.split('T')[0] : p.fecha_entrega_tartas).format('DD/MM') : 'A coordinar'}
                        </Typography>
                      </TableCell>
                      <TableCell>{tarta}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          defaultValue={cantidad}
                          onChange={(e) =>
                            handleChange(id, `tartas.${tarta}`, Number(e.target.value))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          multiline
                          defaultValue={p.nota_admin || ''}
                          onChange={(e) => handleChange(id, 'nota_admin', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{p.observaciones || '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Button variant="contained" onClick={() => handleGuardar(id)}>
                          Guardar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ));
                })}
              </TableBody>
            </Table>
          </Paper>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Box>
      {Object.entries(pedidosPorDia).map(([claveDia, listaPedidos]) => (
  <Accordion key={claveDia} defaultExpanded>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
        📅 {claveDia.toUpperCase()}
      </Typography>
    </AccordionSummary>
    <AccordionDetails>
      {listaPedidos.length > 0 ? (
        <Paper elevation={1}>{renderTablaPorDia(claveDia, listaPedidos)}</Paper>
      ) : (
        <Typography sx={{ p: 2 }}>Sin pedidos para {claveDia}</Typography>
      )}
    </AccordionDetails>
  </Accordion>
))}


      {/* Tartas en accordion separado */}
      {renderTartas()}
    </Box>
  );
};

export default ProduccionEditablePorDia;
