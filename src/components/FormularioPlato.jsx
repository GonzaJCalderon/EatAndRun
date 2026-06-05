import React from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress
} from '@mui/material';

const FormularioPlato = ({
  nombre,
  setNombre,
  descripcion,
  setDescripcion,
  fecha,
  setFecha,
  imagen,
  setImagen,
  cargando,
  handleSubmit,
  platoEditando,
  resetFormulario
}) => {
  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 3,
        border: '1px solid #ccc',
        borderRadius: 2,
        mt: 2,
        backgroundColor: '#fafafa'
      }}
    >
      <Typography variant="h6">
        {platoEditando ? '✏️ Editar plato del día' : '➕ Crear nuevo plato del día'}
      </Typography>

      <TextField
        label="🍽️ Nombre del plato"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
        fullWidth
      />

      <TextField
        label="📝 Descripción (opcional)"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        multiline
        rows={3}
        fullWidth
      />

      <TextField
        label="📅 Fecha de entrega"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        required
        fullWidth
      />

      <Button variant="outlined" component="label">
        📤 Subir imagen
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => setImagen(e.target.files[0])}
        />
      </Button>

      {imagen && (
        <Typography variant="body2" color="text.secondary">
          📎 Imagen seleccionada: {imagen.name}
        </Typography>
      )}

      <Box display="flex" gap={2} mt={2}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={cargando}
          startIcon={cargando && <CircularProgress size={16} />}
        >
          {platoEditando ? 'Actualizar' : 'Crear'}
        </Button>

        {platoEditando && (
          <Button
            variant="outlined"
            onClick={resetFormulario}
            disabled={cargando}
          >
            Cancelar edición
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default FormularioPlato;
