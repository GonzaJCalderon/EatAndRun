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
  IconButton,
  TextField,
  Box,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useState } from 'react';

const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

const EditableProduccionTable = ({ pedidos, onGuardar }) => {
  const [edicion, setEdicion] = useState({});
  const [filaLibre, setFilaLibre] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (pedidoId, campo, valor) => {
    setEdicion(prev => ({
      ...prev,
      [pedidoId]: {
        ...prev[pedidoId],
        [campo]: valor,
      },
    }));
  };

  const handleContador = (pedidoId, dia, plato, delta) => {
    const cantidadActual =
      edicion[pedidoId]?.[dia]?.[plato] ??
      pedidos.find(p => p.id === pedidoId)?.pedido?.diarios?.[dia]?.[plato] ??
      0;

    const nuevaCantidad = Math.max(0, cantidadActual + delta);

    setEdicion(prev => ({
      ...prev,
      [pedidoId]: {
        ...(prev[pedidoId] || {}),
        [dia]: {
          ...(prev[pedidoId]?.[dia] || {}),
          [plato]: nuevaCantidad,
        },
      },
    }));
  };

  const handleGuardar = (pedidoId) => {
    const campos = edicion[pedidoId];
    if (!campos) return;
    onGuardar(pedidoId, campos);
    setEdicion(prev => {
      const copia = { ...prev };
      delete copia[pedidoId];
      return copia;
    });
  };

  return (
    <Box sx={{ mt: 4 }}>
      {diasSemana.map(dia => {
        const pedidosDia = pedidos.filter(p =>
          p.pedido?.diarios?.[dia] ||
          p.pedido?.extras?.[dia] ||
          Object.keys(p.pedido?.tartas || {}).length > 0
        );

        return (
          <Accordion key={dia} sx={{ width: '100%', maxWidth: '100vw' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">📅 {dia.toUpperCase()}</Typography>
            </AccordionSummary>

            <AccordionDetails
              sx={{
                overflowX: 'auto',
                width: '100%',
                display: 'block',
                padding: 0,
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Table size="small" sx={{ minWidth: 1100 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Usuario</strong></TableCell>
                      <TableCell><strong>Dirección</strong></TableCell>
                      <TableCell><strong>Email</strong></TableCell>
                      <TableCell><strong>Teléfono</strong></TableCell>
                      <TableCell><strong>Plato</strong></TableCell>
                      <TableCell><strong>Cantidad</strong></TableCell>
                      <TableCell><strong>Extras</strong></TableCell>
                      <TableCell><strong>Tartas</strong></TableCell>
                      <TableCell><strong>Observaciones</strong></TableCell>
                      <TableCell><strong>Guardar</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pedidosDia.map(pedido => {
                      const { usuario, pedido: contenido } = pedido;
                      const platos = contenido?.diarios?.[dia] || {};
                      const extras = contenido?.extras?.[dia] || {};
                      const tartas = contenido?.tartas || {};

                      return (
                        <TableRow key={pedido.id}>
                          <TableCell>{usuario.nombre} {usuario.apellido}</TableCell>
                          <TableCell>{usuario.direccion}</TableCell>
                          <TableCell>{usuario.email}</TableCell>
                          <TableCell>{usuario.telefono}</TableCell>
                          <TableCell>
                            {Object.keys(platos).map(plato => (
                              <Box key={plato} display="flex" alignItems="center" gap={1}>
                                {plato}
                                <IconButton onClick={() => handleContador(pedido.id, dia, plato, -1)}>
                                  <RemoveIcon fontSize="small" />
                                </IconButton>
                                <Typography>
                                  {edicion[pedido.id]?.[dia]?.[plato] ?? platos[plato]}
                                </Typography>
                                <IconButton onClick={() => handleContador(pedido.id, dia, plato, 1)}>
                                  <AddIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            ))}
                          </TableCell>
                          <TableCell>
                            {Object.keys(platos).reduce((total, key) => {
                              return total + (edicion[pedido.id]?.[dia]?.[key] ?? platos[key]);
                            }, 0)}
                          </TableCell>
                          <TableCell>
                            {Object.entries(extras).map(([extra, cantidad]) => (
                              <Typography key={extra}>
                                {extra}: {cantidad}
                              </Typography>
                            ))}
                          </TableCell>
                          <TableCell>
                            {Object.entries(tartas).map(([tarta, cantidad]) => (
                              <Typography key={tarta}>
                                {tarta}: {cantidad}
                              </Typography>
                            ))}
                          </TableCell>
                          <TableCell>
                            <TextField
                              multiline
                              fullWidth
                              minRows={2}
                              value={(edicion[pedido.id]?.observaciones ?? pedido.observaciones) || ''}
                              onChange={(e) =>
                                handleChange(pedido.id, 'observaciones', e.target.value)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Button onClick={() => handleGuardar(pedido.id)}>💾</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>

              {/* Nota libre común */}
              <Box mt={2} px={2}>
                <TextField
                  fullWidth
                  label="✍️ Nota libre (uso interno)"
                  placeholder="Escribir comentario, resumen o anotación..."
                  value={filaLibre[dia] || ''}
                  onChange={(e) =>
                    setFilaLibre(prev => ({ ...prev, [dia]: e.target.value }))
                  }
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default EditableProduccionTable;
