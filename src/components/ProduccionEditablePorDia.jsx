import React, { useState } from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails,
  Typography, Box, TextField, Button, Table, TableHead,
  TableRow, TableCell, TableBody, Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import dayjs from '../utils/day';
import ModalEdicionPedido from './ModalEdicionPedido';

const diasOrdenados = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

const extraMap = {
  "1": "🍰 Postre",
  "2": "🥗 Ensalada",
  "3": "💪 Proteína"
};

const ProduccionEditablePorDia = ({ pedidos, mapaPlatos = {}, platosDelDia = [], semanaActual, onGuardarCambios }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  const handleOpenModal = (p) => {
    setPedidoSeleccionado(p);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setPedidoSeleccionado(null);
  };

  const handleGuardarDesdeModal = (pedidoId, nuevosItems, notaAdmin) => {
    onGuardarCambios(pedidoId, nuevosItems);
    handleCloseModal();
  };

  // Agrupar pedidos por día
const pedidosPorDia = {};

pedidos.forEach(p => {
  const diarios = p.pedido?.diarios || {};
  const extras = p.pedido?.extras || {};
  const fechaPorDia = p.pedido?.fecha_dia_por_dia || {};

  const diasConPedidos = new Set([...Object.keys(diarios), ...Object.keys(extras)]);

  diasConPedidos.forEach(dia => {
    let fechaStr = fechaPorDia?.[dia] || null;
    let clave = dia;

    // Si no hay fechaStr en la base de datos, la calculamos usando semanaActual
    if (!fechaStr && semanaActual?.lunes) {
      const idx = diasOrdenados.indexOf(dia.toLowerCase());
      if (idx !== -1) {
        fechaStr = dayjs(semanaActual.lunes).add(idx, 'day').toISOString();
      }
    }

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
          <TableCell><strong>Resumen de Platos</strong></TableCell>
          <TableCell><strong>Resumen Extras</strong></TableCell>
          <TableCell><strong>Observaciones / Notas</strong></TableCell>
          <TableCell><strong>Acción</strong></TableCell>
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
                {Object.keys(platos).length === 0 ? <Typography variant="caption" color="textSecondary">Ninguno</Typography> : 
                  Object.entries(platos).map(([nombrePlato, cantidad]) => {
                    const nombreMostrar = mapaPlatos[nombrePlato] || nombrePlato;
                    return <Typography key={nombrePlato} variant="body2">• {cantidad}x {nombreMostrar}</Typography>;
                  })
                }
              </TableCell>

              <TableCell>
                {Object.keys(extras).length === 0 ? <Typography variant="caption" color="textSecondary">Ninguno</Typography> : 
                  Object.entries(extras).map(([extraId, cantidad]) => {
                    const cleanId = extraId.replace(/^ID:/, '');
                    const nombreExtra = extraMap[cleanId] || `Extra ${cleanId}`;
                    return <Typography key={extraId} variant="body2">• {cantidad}x {nombreExtra}</Typography>;
                  })
                }
              </TableCell>

              <TableCell>
                {p.observaciones && <Typography variant="body2"><strong>Obs:</strong> {p.observaciones}</Typography>}
                {p.nota_admin && <Typography variant="body2" color="primary"><strong>Nota:</strong> {p.nota_admin}</Typography>}
              </TableCell>

              <TableCell>
                <Button variant="outlined" startIcon={<EditIcon />} onClick={() => handleOpenModal(p)}>
                  Editar Pedido
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
                      <TableCell>{cantidad}</TableCell>
                      <TableCell>{p.nota_admin || '—'}</TableCell>
                      <TableCell>{p.observaciones || '—'}</TableCell>
                      <TableCell>
                        <Button variant="outlined" startIcon={<EditIcon />} onClick={() => handleOpenModal(p)}>
                          Editar Pedido
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

  const clavesOrdenadas = Object.keys(pedidosPorDia).sort((a, b) => {
    const normalize = str => str.toLowerCase().split(' ')[0].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const diasNorm = diasOrdenados.map(normalize);
    const indexA = diasNorm.indexOf(normalize(a));
    const indexB = diasNorm.indexOf(normalize(b));
    return indexA - indexB;
  });

  return (
    <Box>
      {clavesOrdenadas.map((claveDia) => {
        const listaPedidos = pedidosPorDia[claveDia];
        return (
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
        );
      })}


      {renderTartas()}

      <ModalEdicionPedido
        open={modalOpen}
        onClose={handleCloseModal}
        pedido={pedidoSeleccionado}
        mapaPlatos={mapaPlatos}
        platosDelDia={platosDelDia}
        semanaActual={semanaActual}
        onSave={handleGuardarDesdeModal}
      />
    </Box>
  );
};

export default ProduccionEditablePorDia;
