import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const RutaPrivada = () => {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  // ❌ Si no hay token o user, redirige al login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Si está logueado, renderiza la ruta hija
  return <Outlet />;
};

export default RutaPrivada;
