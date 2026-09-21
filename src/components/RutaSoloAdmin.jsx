import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const RutaSoloAdmin = ({ children }) => {
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Solo permitir si el rol es exactamente "admin"
  if (user.role !== "admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RutaSoloAdmin;
