import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user ,loading} = useAuth();

  if (loading)  return null;

 if (!user || !user.token) {
    return <Navigate to="/home" />;
  }

  if (role === "ROLE_ADMIN" && user.role !== "ROLE_ADMIN" && user.role !== "ROLE_STAFF") {
    return <Navigate to="/home" />;
  }

  if (role && role !== "ROLE_ADMIN" && user.role !== role) {
    return <Navigate to="/home" />;
  }

  return children;
};

export default ProtectedRoute;