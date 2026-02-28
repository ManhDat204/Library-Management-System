import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  // Nếu không có token, chuyển về trang login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có token, hiển thị component con
  return children;
};

export default ProtectedRoute;