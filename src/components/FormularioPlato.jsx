import React from 'react';
import {
  TextField, Button, Box, MenuItem, Select, InputLabel, FormControl, Typography
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';

const FormularioPlato = ({
  nombre, setNombre,
  descripcion, setDescripcion,
  fecha, setFecha,
  rol, setRol,
  imagen, setImagen,
  cargando,
  handleSubmit,
  platoEditando,
  resetFormulario
}) => {
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <TextField
        label="Nombre del plato"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        label="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        fullWidth
        multiline
        rows={2}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Fecha"
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        fullWidth
        required
        InputLabelProps={{ shrink: true }}
        sx={{ mb: 2 }}
      />
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Para rol</InputLabel>
        <Select
          value={rol}
          label="Para rol"
          onChange={(e) => setRol(e.target.value)}
          required
        >
          <MenuItem value="usuario">👤 Usuario</MenuItem>
          <MenuItem value="empresa">🏢 Empresa</MenuItem>
        </Select>
      </FormControl>
      <Button
        variant="outlined"
        component="label"
        startIcon={<UploadIcon />}
        sx={{ mb: 2 }}
      >
        Subir nueva imagen
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => setImagen(e.target.files[0])}
        />
      </Button>
      {imagen && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          Imagen seleccionada: <strong>{imagen.name}</strong>
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button type="submit" variant="contained" color="primary" disabled={cargando}>
          {cargando ? 'Guardando...' : platoEditando ? 'Actualizar' : 'Guardar plato'}
        </Button>
        {platoEditando && (
          <Button onClick={resetFormulario} variant="outlined" color="secondary">
            Cancelar edición
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default FormularioPlato;
