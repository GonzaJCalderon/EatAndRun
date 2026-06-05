// src/components/EmpresaOnlyRoute.jsx
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectUser } from '../store/slices/authSlice';

const EmpresaOnlyRoute = ({ children }) => {
  const user = useSelector(selectUser);
  console.log("👉 EmpresaOnlyRoute: user", user);

  if (!user) {
    console.warn("🔐 No hay usuario, redirigiendo a login...");
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'empresa') {
    console.warn("⛔ Usuario no es EMPRESA, role:", user.role);
    return <Navigate to="/app" replace />;
  }

  return children;
};

export default EmpresaOnlyRoute;
