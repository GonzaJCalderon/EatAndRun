// src/components/PrivateRoute.jsx
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectToken } from '../store/authSlice';

const PrivateRoute = ({ children }) => {
  const token = useSelector(selectToken);
  return token ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
