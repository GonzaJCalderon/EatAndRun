// src/components/RequireRole.jsx
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectUser } from '../store/slices/authSlice';

const RequireRole = ({ role, children }) => {
  const user = useSelector(selectUser);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return children;
};

export default RequireRole;
