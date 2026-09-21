import { Box, Typography, Select, MenuItem, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";

const UserCard = ({ usuario, onVer, onEliminar, onRolChange, onEditar }) => {
  const nombreCompleto = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ') || usuario.email;
  const dirAlt = usuario.direccion_secundaria || usuario.direccion_alternativa || '';

  return (
    <Box
      key={usuario.id}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        mb: 2,
        p: 1,
        borderBottom: '1px solid #ddd'
      }}
    >
      <Box>
        <Typography><strong>{nombreCompleto}</strong></Typography>
        <Typography variant="body2" color="textSecondary">Email: {usuario.email}</Typography>
        {usuario.telefono && <Typography variant="body2">Tel: {usuario.telefono}</Typography>}
        {usuario.direccion_principal && <Typography variant="body2">Dir. principal: {usuario.direccion_principal}</Typography>}
        {dirAlt && <Typography variant="body2">Dir. alternativa: {dirAlt}</Typography>}
        <Typography variant="body2">Rol: {usuario.rol}</Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Select
          size="small"
          value={usuario.rol}
          onChange={(e) => onRolChange(usuario.id, e.target.value)}
        >
          <MenuItem value="usuario">Usuario</MenuItem>
          <MenuItem value="empresa">Empresa</MenuItem>
          <MenuItem value="delivery">Delivery</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="empleado">Empleado</MenuItem>
          <MenuItem value="moderador">Moderador</MenuItem>
        </Select>

        <IconButton
          onClick={() =>
            onVer({
              id: usuario.id,
              nombre: usuario.nombre,
              apellido: usuario.apellido,
              email: usuario.email,
              rol: usuario.rol,
              telefono: usuario.telefono,
              direccion_principal: usuario.direccion_principal,
              // 👇 enviamos ambos nombres de campo por compatibilidad
              direccion_secundaria: usuario.direccion_secundaria || usuario.direccion_alternativa || ''
            })
          }
          color="primary"
        >
          <VisibilityIcon />
        </IconButton>

        <IconButton onClick={() => onEditar(usuario)} color="info">
          <EditIcon />
        </IconButton>

        <IconButton onClick={() => onEliminar(usuario.id)} color="error">
          <DeleteIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default UserCard;
