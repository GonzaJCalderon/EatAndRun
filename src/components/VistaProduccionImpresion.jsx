import React from 'react';
import { Box, Typography, Grid, Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';
import dayjs from '../utils/day';

const normalizeDia = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

const extraMap = {
  "1": "🍰 Postre",
  "2": "🥗 Ensalada",
  "3": "💪 Proteína"
};

const getNombreConEmpresa = (usuario = {}, empresa_nombre = null) => {
  const nombre = `${usuario?.nombre || ''} ${usuario?.apellido || ''}`.trim();
  const empresa = empresa_nombre || usuario?.empresa_nombre || null;
  return empresa ? `${nombre} (${empresa})` : nombre;
};

const VistaProduccionImpresion = ({ pedidos, resumen, semanaActual }) => {
  const diasSemana = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES'];
  
  const getPedidosPorDiaYPlato = (dia, platoBuscado) => {
    return pedidos.filter(p => {
      const targetPlato = platoBuscado.toLowerCase().trim();
      const diarios = p.pedido?.diarios?.[dia.toLowerCase()] || {};
      const extras = p.pedido?.extras?.[dia.toLowerCase()] || {};

      for (const [nombrePlato, cantidad] of Object.entries(diarios)) {
        if (nombrePlato.toLowerCase().trim() === targetPlato && cantidad > 0) return true;
      }

      for (const [idExtra, cantidad] of Object.entries(extras)) {
        const cleanId = idExtra.replace(/^ID:/, '');
        const nombreExtra = extraMap[cleanId] || `Extra ${cleanId}`;
        if (nombreExtra.toLowerCase().trim() === targetPlato && cantidad > 0) return true;
      }
      return false;
    });
  };

  const lunes = dayjs(semanaActual.lunes);

  return (
    <Box className="vista-impresion" sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {diasSemana.map((dia, index) => {
        const key = normalizeDia(dia);
        const dataDia = resumen[key] || {};
        const fechaDia = lunes.add(index, 'day').format('DD/MM');
        
        if (Object.keys(dataDia).length === 0) return null;

        const platos = Object.keys(dataDia);
        const mitad = Math.ceil(platos.length / 2);
        const platosIzq = platos.slice(0, mitad);
        const platosDer = platos.slice(mitad);

        const renderColumna = (listaPlatos) => (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {listaPlatos.map(plato => {
              const usuarios = getPedidosPorDiaYPlato(dia, plato);
              return (
                <Table size="small" key={plato} sx={{ border: '1px solid #ccc' }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#a5d6a7' }}>
                      <TableCell colSpan={2} sx={{ fontWeight: 'bold', fontSize: '1.1rem', py: 0.5 }}>
                        {plato.toUpperCase()}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuarios.map(p => (
                      <TableRow key={p.id}>
                        <TableCell sx={{ py: 0.5, borderBottom: '1px solid #eee' }}>
                          {getNombreConEmpresa(p.usuario, p.empresa_nombre)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              );
            })}
          </Box>
        );

        return (
          <Paper key={dia} elevation={3} sx={{ p: 3, pageBreakAfter: 'always' }}>
            <Typography variant="h5" align="center" fontWeight="bold" sx={{ mb: 3, backgroundColor: '#c8e6c9', py: 1 }}>
              {dia} {fechaDia}
            </Typography>

            <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
              {renderColumna(platosIzq)}
              {renderColumna(platosDer)}
            </Box>

            <Table size="small" sx={{ width: '50%', border: '1px solid #ccc' }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                  <TableCell><strong>Plato</strong></TableCell>
                  <TableCell align="right"><strong>Cantidad</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(dataDia).map(([plato, cantidad]) => (
                  <TableRow key={plato}>
                    <TableCell sx={{ py: 0.5 }}>{plato}</TableCell>
                    <TableCell align="right" sx={{ py: 0.5 }}><strong>{cantidad}</strong></TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ backgroundColor: '#dcedc8' }}>
                  <TableCell sx={{ py: 0.5 }}><strong>TOTAL DEL DÍA</strong></TableCell>
                  <TableCell align="right" sx={{ py: 0.5 }}>
                    <Typography variant="h6" fontWeight="bold" color="error">
                      {Object.values(dataDia).reduce((acc, n) => acc + n, 0)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        );
      })}
    </Box>
  );
};

export default VistaProduccionImpresion;
