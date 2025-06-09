import { Box, Typography, Select, MenuItem, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

const UserCard = ({ usuario, onVer, onEliminar, onRolChange }) => {
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
        <Typography><strong>{usuario.nombre || usuario.email}</strong></Typography>
        <Typography variant="body2" color="textSecondary">Email: {usuario.email}</Typography>
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
        </Select>

        <IconButton onClick={() => onVer(usuario)} color="primary">
          <VisibilityIcon />
        </IconButton>

        <IconButton onClick={() => onEliminar(usuario.id)} color="error">
          <DeleteIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default UserCard;
