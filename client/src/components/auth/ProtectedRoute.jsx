import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  // ✅ Prevent navigating to unauthorized pages if not logged in
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
