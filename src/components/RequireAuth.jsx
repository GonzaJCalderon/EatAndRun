// src/components/RequireAuth.jsx
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectUser } from '../store/slices/authSlice';

const RequireAuth = ({ children }) => {
  const user = useSelector(selectUser);
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default RequireAuth;
