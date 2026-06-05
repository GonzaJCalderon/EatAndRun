import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, Select, MenuItem,
  IconButton, Grid, FormControl, InputLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

const ModalEdicionPedido = ({ open, onClose, pedido, mapaPlatos, onSave }) => {
  const [items, setItems] = useState([]);
  const [notaAdmin, setNotaAdmin] = useState('');

  useEffect(() => {
    if (open && pedido) {
      setNotaAdmin(pedido.nota_admin || '');
      const initialItems = [];

      // Parse diarios
      const diarios = pedido.pedido?.diarios || {};
      Object.entries(diarios).forEach(([dia, platos]) => {
        Object.entries(platos).forEach(([platoId, cantidad]) => {
          initialItems.push({
            id: Math.random().toString(36).substr(2, 9),
            type: 'fijo',
            dia,
            item_id: platoId.replace('ID:', ''), // assuming fixed/daily
            quantity: cantidad
          });
        });
      });

      // Parse extras
      const extras = pedido.pedido?.extras || {};
      Object.entries(extras).forEach(([dia, ext]) => {
        Object.entries(ext).forEach(([extraId, cantidad]) => {
          initialItems.push({
            id: Math.random().toString(36).substr(2, 9),
            type: 'extra',
            dia,
            item_id: extraId.replace('ID:', ''),
            quantity: cantidad
          });
        });
      });

      // Parse tartas
      const tartas = pedido.pedido?.tartas || {};
      Object.entries(tartas).forEach(([tartaName, cantidad]) => {
        initialItems.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'tarta',
          dia: 'tartas',
          item_id: tartaName,
          quantity: cantidad
        });
      });

      setItems(initialItems);
    }
  }, [open, pedido]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    setItems([...items, { id: Math.random().toString(36).substr(2, 9), type: 'fijo', dia: 'lunes', item_id: '', quantity: 1 }]);
  };

  const handleSave = () => {
    const backendItems = items.map(it => ({
      item_type: it.type,
      item_id: it.type === 'tarta' ? it.item_id : Number(it.item_id),
      item_name: it.type === 'tarta' ? it.item_id : (mapaPlatos[`ID:${it.item_id}`] || `ID:${it.item_id}`),
      quantity: Number(it.quantity),
      dia: it.dia === 'tartas' ? null : it.dia
    }));

    onSave(pedido.id || pedido._id, backendItems, notaAdmin);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Editar Pedido de {pedido?.usuario?.nombre} {pedido?.usuario?.apellido}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          {items.map((item, index) => (
            <Grid container spacing={2} sx={{ mb: 2, alignItems: 'center' }} key={item.id}>
              <Grid item xs={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Día/Tipo</InputLabel>
                  <Select
                    value={item.dia}
                    onChange={(e) => handleItemChange(index, 'dia', e.target.value)}
                    label="Día/Tipo"
                  >
                    {DIAS_SEMANA.map(d => <MenuItem key={d} value={d}>{d.toUpperCase()}</MenuItem>)}
                    <MenuItem value="tartas">TARTA SEMANAL</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={item.type}
                    onChange={(e) => handleItemChange(index, 'type', e.target.value)}
                    label="Categoría"
                  >
                    <MenuItem value="fijo">Plato Fijo</MenuItem>
                    <MenuItem value="daily">Plato del Día</MenuItem>
                    <MenuItem value="extra">Extra</MenuItem>
                    <MenuItem value="tarta">Tarta</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                {item.type === 'extra' ? (
                  <FormControl fullWidth size="small">
                    <InputLabel>Extra</InputLabel>
                    <Select
                      value={item.item_id}
                      onChange={(e) => handleItemChange(index, 'item_id', e.target.value)}
                      label="Extra"
                    >
                      <MenuItem value="1">🍰 Postre</MenuItem>
                      <MenuItem value="2">🥗 Ensalada</MenuItem>
                      <MenuItem value="3">💪 Proteína</MenuItem>
                    </Select>
                  </FormControl>
                ) : item.type === 'tarta' ? (
                  <TextField
                    fullWidth size="small"
                    label="Nombre de Tarta"
                    value={item.item_id}
                    onChange={(e) => handleItemChange(index, 'item_id', e.target.value)}
                  />
                ) : (
                  <FormControl fullWidth size="small">
                    <InputLabel>Plato</InputLabel>
                    <Select
                      value={`ID:${item.item_id}`}
                      onChange={(e) => handleItemChange(index, 'item_id', e.target.value.replace('ID:', ''))}
                      label="Plato"
                    >
                      {Object.entries(mapaPlatos).map(([idKey, name]) => {
                        if (!idKey.startsWith('ID:')) return null;
                        return <MenuItem key={idKey} value={idKey}>{name}</MenuItem>;
                      })}
                    </Select>
                  </FormControl>
                )}
              </Grid>
              <Grid item xs={2}>
                <TextField
                  fullWidth size="small"
                  label="Cantidad"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={1}>
                <IconButton color="error" onClick={() => handleRemoveItem(index)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button startIcon={<AddCircleIcon />} onClick={handleAddItem} sx={{ mt: 1 }}>
            Añadir Plato
          </Button>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={2}
          label="Nota Admin (Visible internamente)"
          value={notaAdmin}
          onChange={(e) => setNotaAdmin(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button onClick={handleSave} variant="contained" color="primary">Guardar Pedido</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalEdicionPedido;
