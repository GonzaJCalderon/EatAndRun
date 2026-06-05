import React, { useState } from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails,
  Typography, Box, TextField, Button, Table, TableHead,
  TableRow, TableCell, TableBody, Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const diasOrdenados = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

const ProduccionEditablePorDia = ({ pedidos, onGuardarCambios }) => {
  const [ediciones, setEdiciones] = useState({});

  const getNombreConEmpresa = (usuario = {}, empresa_nombre = null) => {
    const nombre = `${usuario?.nombre || ''} ${usuario?.apellido || ''}`.trim();
    const empresa = empresa_nombre || usuario?.empresa_nombre || usuario?.empresa?.nombre || null;
    return empresa ? `${nombre} (${empresa})` : nombre;
  };

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

  const pedidosPorDia = diasOrdenados.reduce((acc, dia) => {
    acc[dia] = [];
    return acc;
  }, {});

  pedidos.forEach(p => {
    const diarios = p.pedido?.diarios || {};
    diasOrdenados.forEach(dia => {
      if (diarios[dia]) {
        pedidosPorDia[dia].push(p);
      }
    });
  });

  const renderTablaPorDia = (dia, listaPedidos) => {
    const pedidosEmpresa = {};
    const pedidosUsuarios = [];

    listaPedidos.forEach(p => {
      const usuario = p.usuario || {};
      const rol = usuario.rol;
      const empresa = usuario.empresa_nombre || usuario.empresa?.nombre;

      // Empresa/admin empresa/empleado (rol 2 o 6) → agrupar por empresa
      if ((rol === 2 || rol === 6) && empresa) {
        if (!pedidosEmpresa[empresa]) pedidosEmpresa[empresa] = [];
        pedidosEmpresa[empresa].push(p);
      } else if (rol === 1) {
        // Usuario común
        pedidosUsuarios.push(p);
      }
      // Moderador (5) no debe tener pedidos, si viene: ignorar
    });

    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell><strong>Nombre y Apellido</strong></TableCell>
            <TableCell><strong>Platos</strong></TableCell>
            <TableCell><strong>Extras</strong></TableCell>
            <TableCell><strong>Tartas</strong></TableCell>
            <TableCell><strong>📝 Nota libre</strong></TableCell>
            <TableCell><strong>Observaciones</strong></TableCell>
            <TableCell><strong>Guardar</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* EMPRESAS */}
          {Object.entries(pedidosEmpresa)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([empresa, pedidos]) => (
              <React.Fragment key={empresa}>
                <TableRow>
                  <TableCell colSpan={7} sx={{
                    backgroundColor: '#e0f7fa',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    borderBottom: '2px solid #ccc'
                  }}>
                    🏢 {empresa}
                  </TableCell>
                </TableRow>
                {pedidos.map(p => renderFilaPedido(p, dia))}
              </React.Fragment>
            ))}

          {/* USUARIOS INDIVIDUALES */}
          {pedidosUsuarios.length > 0 && (
            <>
              <TableRow>
                <TableCell colSpan={7} sx={{
                  backgroundColor: '#fff8e1',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  borderBottom: '2px solid #ccc'
                }}>
                  👤 Usuarios individuales
                </TableCell>
              </TableRow>
              {pedidosUsuarios.map(p => renderFilaPedido(p, dia))}
            </>
          )}
        </TableBody>
      </Table>
    );
  };

  const renderFilaPedido = (p, dia) => {
    const id = p.id || p._id;
    const nombre = getNombreConEmpresa(p.usuario, p.empresa_nombre);
    const platos = p.pedido?.diarios?.[dia] || {};
    const extras = p.pedido?.extras?.[dia] || {};
    const tartas = p.pedido?.tartas || {};

    return (
      <TableRow key={id}>
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
          {Object.entries(extras).map(([extraId, cantidad]) => (
            <Box key={extraId} sx={{ mb: 1 }}>
              <Typography>{`Extra ${extraId}`}</Typography>
              <TextField
                size="small"
                type="number"
                defaultValue={cantidad}
                onChange={(e) =>
                  handleChange(id, `extras.${dia}.${extraId}`, Number(e.target.value))
                }
              />
            </Box>
          ))}
        </TableCell>
        <TableCell>
          {Object.entries(tartas).map(([tarta, cantidad]) => (
            <Box key={tarta} sx={{ mb: 1 }}>
              <Typography>{tarta}</Typography>
              <TextField
                size="small"
                type="number"
                defaultValue={cantidad}
                onChange={(e) =>
                  handleChange(id, `tartas.${tarta}`, Number(e.target.value))
                }
              />
            </Box>
          ))}
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
  };

  const renderTartas = () => {
    const conTartas = pedidos.filter(p => Object.keys(p.pedido?.tartas || {}).length > 0);
    if (conTartas.length === 0) return null;

    return (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>🥧 Tartas (Todas las semanas)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Empleado</TableCell>
                <TableCell>Tarta</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Guardar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {conTartas.map(p => {
                const id = p.id || p._id;
                const nombre = getNombreConEmpresa(p.usuario, p.empresa_nombre);
                return Object.entries(p.pedido?.tartas || {}).map(([tarta, cantidad]) => (
                  <TableRow key={`${id}-${tarta}`}>
                    <TableCell>{nombre}</TableCell>
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
                      <Button variant="contained" onClick={() => handleGuardar(id)}>
                        Guardar
                      </Button>
                    </TableCell>
                  </TableRow>
                ));
              })}
            </TableBody>
          </Table>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Box>
      {diasOrdenados.map(dia => (
        <Accordion key={dia} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
              📅 {dia.toUpperCase()}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {pedidosPorDia[dia].length > 0 ? (
              <Paper elevation={1}>{renderTablaPorDia(dia, pedidosPorDia[dia])}</Paper>
            ) : (
              <Typography sx={{ p: 2 }}>Sin pedidos para {dia}</Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
      {renderTartas()}
    </Box>
  );
};

export default ProduccionEditablePorDia;
