import  { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Clear any invalid residual tokens
      localStorage.removeItem("token");
    }
    setVerified(!!token);
  }, []);

  if (verified === false) {
    return <Navigate to="/" replace />;
  }

  return children;
}
