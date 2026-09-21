import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const RutaAdminOModerador = ({ children }) => {
  const user = useSelector((state) => state.auth.user);

  // unificar
  const rawRole = user?.role ?? user?.rol; // usa el que haya
  const role = typeof rawRole === 'number'
    ? { 4: 'admin', 5: 'moderador' }[rawRole]
    : rawRole;

  if (!user) return <Navigate to="/login" />;
  if (!['admin', 'moderador'].includes(role)) return <Navigate to="/unauthorized" />;

  return children;
};

export default RutaAdminOModerador;
