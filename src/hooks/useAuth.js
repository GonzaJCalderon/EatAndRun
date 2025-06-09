import { useSelector } from 'react-redux';
import { selectUser, selectToken } from '../store/authSlice';

const useAuth = () => {
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const isAuthenticated = !!user && !!token;

  return { user, token, isAuthenticated };
};

export default useAuth;
