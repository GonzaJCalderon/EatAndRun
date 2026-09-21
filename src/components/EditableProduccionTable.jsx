import React, { useState, useMemo } from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails,
  Typography, Box, TextField, Button, Table, TableHead,
  TableRow, TableCell, TableBody, Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const diasOrdenados = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

const normalize = (str = '') =>
  String(str).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const findDiaKey = (obj = {}, diaUI = '') => {
  if (!obj) return null;
  if (Object.prototype.hasOwnProperty.call(obj, diaUI)) return diaUI;
  const target = normalize(diaUI);
  for (const k of Object.keys(obj)) {
    const base = normalize(k).split(' ')[0];
    if (base === target) return k;
  }
  return null;
};

// No depende de variables externas
const getLegible = (mapping, cat, key) => mapping?.[cat]?.[key] ?? key;

const  ProduccionEditablePorDiaOld = (props = {}) => {
  const {
    pedidos = [],
    // ⚠️ renombrado: ahora el padre debe pasar `mapping`
    mapping: mappingProp = {},
    onGuardarCambios
  } = props;

  const mapping = useMemo(() => mappingProp ?? {}, [mappingProp]);

  const [ediciones, setEdiciones] = useState({});

  const getNombreConEmpresa = (p = {}) => {
    const u = p.usuario || {};
    const nombre = u.nombre || p.nombre || '';
    const apellido = u.apellido || p.apellido || '';
    const empresa = p.empresa_nombre || u.empresa_nombre || u.empresa?.nombre || null;
    const nom = `${nombre} ${apellido}`.trim();
    return empresa ? `${nom} (${empresa})` : nom || '—';
  };

  const getDireccionSecundaria = (p = {}) => {
    const u = p.usuario || {};
    return u.direccion_alternativa || p.direccion_alternativa || '—';
  };

  const handleChange = (pedidoId, path, value) => {
    setEdiciones(prev => ({
      ...prev,
      [pedidoId]: { ...prev[pedidoId], [path]: value }
    }));
  };

  const handleGuardar = (pedidoId) => {
    const cambios = ediciones[pedidoId];
    if (cambios && typeof onGuardarCambios === 'function') onGuardarCambios(pedidoId, cambios);
  };

  const pedidosPorDia = useMemo(() => {
    const base = diasOrdenados.reduce((acc, dia) => ({ ...acc, [dia]: [] }), {});
    pedidos.forEach(p => {
      const diarios = p?.pedido?.diarios || {};
      diasOrdenados.forEach(dia => {
        const key = findDiaKey(diarios, dia);
        if (key) base[dia].push(p);
      });
    });
    return base;
  }, [pedidos]);

  const renderFilaPedido = (p, dia) => {
    const id = p.id ?? p._id ?? Math.random().toString(36).slice(2);
    const nombre = getNombreConEmpresa(p);

    const diarios = p?.pedido?.diarios || {};
    const extrasObj = p?.pedido?.extras || {};
    const tartas = p?.pedido?.tartas || {};

    const diaKeyDiarios = findDiaKey(diarios, dia);
    const diaKeyExtras = findDiaKey(extrasObj, dia);

    const platos = (diaKeyDiarios && typeof diarios[diaKeyDiarios] === 'object') ? diarios[diaKeyDiarios] : {};
    const extras  = (diaKeyExtras  && typeof extrasObj[diaKeyExtras] === 'object') ? extrasObj[diaKeyExtras] : {};

    return (
      <TableRow key={id}>
        <TableCell>{nombre}</TableCell>
        <TableCell>{getDireccionSecundaria(p)}</TableCell>

        <TableCell>
          {Object.entries(platos).map(([nombrePlato, cantidad]) => {
            const legible = getLegible(mapping, 'diarios', nombrePlato);
            return (
              <Box key={nombrePlato} sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>{legible}</Typography>
                <TextField
                  size="small"
                  type="number"
                  inputProps={{ min: 0 }}
                  defaultValue={Number(cantidad) || 0}
                  onChange={(e) =>
                    handleChange(id, `diarios.${diaKeyDiarios}.${nombrePlato}`, Number(e.target.value))
                  }
                />
              </Box>
            );
          })}
        </TableCell>

        <TableCell>
          {Object.entries(extras).map(([extraId, cantidad]) => {
            const legible = getLegible(mapping, 'extras', extraId);
            return (
              <Box key={extraId} sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>{legible}</Typography>
                <TextField
                  size="small"
                  type="number"
                  inputProps={{ min: 0 }}
                  defaultValue={Number(cantidad) || 0}
                  onChange={(e) =>
                    handleChange(id, `extras.${diaKeyExtras}.${extraId}`, Number(e.target.value))
                  }
                />
              </Box>
            );
          })}
        </TableCell>

        <TableCell>
          {Object.entries(tartas).map(([tarta, cantidad]) => {
            const legible = getLegible(mapping, 'tartas', tarta);
            return (
              <Box key={tarta} sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>{legible}</Typography>
                <TextField
                  size="small"
                  type="number"
                  inputProps={{ min: 0 }}
                  defaultValue={Number(cantidad) || 0}
                  onChange={(e) =>
                    handleChange(id, `tartas.${tarta}`, Number(e.target.value))
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
            minRows={2}
            defaultValue={p?.nota_admin || ''}
            onChange={(e) => handleChange(id, 'nota_admin', e.target.value)}
          />
        </TableCell>

        <TableCell>
          <Typography variant="body2">{p?.observaciones || '—'}</Typography>
        </TableCell>

        <TableCell>
          <Button variant="contained" onClick={() => handleGuardar(id)}>Guardar</Button>
        </TableCell>
      </TableRow>
    );
  };

  const renderTablaPorDia = (dia, listaPedidos) => {
    const pedidosEmpresa = {};
    const pedidosUsuarios = [];

    listaPedidos.forEach(p => {
      const usuario = p?.usuario || {};
      const rol = usuario?.rol;
      const empresa = usuario?.empresa_nombre || usuario?.empresa?.nombre;
      if ((rol === 2 || rol === 6) && empresa) {
        if (!pedidosEmpresa[empresa]) pedidosEmpresa[empresa] = [];
        pedidosEmpresa[empresa].push(p);
      } else {
        pedidosUsuarios.push(p);
      }
    });

    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell><strong>Nombre y Apellido</strong></TableCell>
            <TableCell><strong>Dir. Secundaria</strong></TableCell>
            <TableCell><strong>Platos</strong></TableCell>
            <TableCell><strong>Extras</strong></TableCell>
            <TableCell><strong>Tartas</strong></TableCell>
            <TableCell><strong>📝 Nota libre</strong></TableCell>
            <TableCell><strong>Observaciones</strong></TableCell>
            <TableCell><strong>Guardar</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(pedidosEmpresa)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([empresa, pedidosEmpresaLista]) => (
              <React.Fragment key={empresa}>
                <TableRow>
                  <TableCell colSpan={8} sx={{ backgroundColor: '#e0f7fa', fontWeight: 'bold', fontSize: '1rem', borderBottom: '2px solid #ccc' }}>
                    🏢 {empresa}
                  </TableCell>
                </TableRow>
                {pedidosEmpresaLista.map(p => renderFilaPedido(p, dia))}
              </React.Fragment>
            ))}

          {pedidosUsuarios.length > 0 && (
            <>
              <TableRow>
                <TableCell colSpan={8} sx={{ backgroundColor: '#fff8e1', fontWeight: 'bold', fontSize: '1rem', borderBottom: '2px solid #ccc' }}>
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

  const renderTartas = () => {
    const conTartas = pedidos.filter(p => Object.keys(p?.pedido?.tartas || {}).length > 0);
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
                const id = p.id ?? p._id ?? Math.random().toString(36).slice(2);
                const nombre = getNombreConEmpresa(p);
                return Object.entries(p?.pedido?.tartas || {}).map(([tarta, cantidad]) => {
                  const legible = getLegible(mapping, 'tartas', tarta);
                  const rowKey = `${id}-${tarta}`;
                  return (
                    <TableRow key={rowKey}>
                      <TableCell>{nombre}</TableCell>
                      <TableCell>{legible}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          inputProps={{ min: 0 }}
                          defaultValue={Number(cantidad) || 0}
                          onChange={(e) =>
                            handleChange(id, `tartas.${tarta}`, Number(e.target.value))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button variant="contained" onClick={() => handleGuardar(id)}>Guardar</Button>
                      </TableCell>
                    </TableRow>
                  );
                });
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
  📅 {(() => {
    const pedidosDelDia = pedidosPorDia[dia] || [];
    let fechaStr = null;

    for (const pedido of pedidosDelDia) {
      const fechaPorDia = pedido?.pedido?.fecha_dia_por_dia || {};
      const f =
        fechaPorDia[dia] ||
        fechaPorDia[normalize(dia)];
      if (f) {
        fechaStr = f;
        break;
      }
    }

    const fecha = fechaStr ? dayjs(fechaStr) : null;
    const nombreDia = dia.charAt(0).toUpperCase() + dia.slice(1);
    const fechaLegible = fecha?.isValid() ? fecha.format("DD/MM") : null;

    return fechaLegible ? `${nombreDia} ${fechaLegible}` : nombreDia;
  })()}
</Typography>

          </AccordionSummary>
          <AccordionDetails>
            {pedidosPorDia[dia]?.length > 0 ? (
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

// ProduccionEditablePorDiaOld.jsx
export const ProduccionEditablePorDiaOld

