import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  // Prevent accessing login page if already logged in
  if (token && location.pathname === "/") {
    return <Navigate to="/dashboard" replace />;
  }

  // Prevent accessing dashboard without login
  return token ? children : <Navigate to="/" replace />;
}
