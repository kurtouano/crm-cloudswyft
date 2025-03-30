import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidenav from "./components/sidenav/Sidenav";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Salesflow from "./pages/Salesflow";
import SalesTeam from "./pages/SalesTeam";
import Accounts from "./pages/Accounts";
import Communications from "./pages/Communications";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LeadProfile from "./pages/LeadProfile"
import SalesTeam from "./pages/SalesTeam";

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}

function MainLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div className="app-container">
      {/* ✅ Sidebar only appears when authenticated */}
      {isAuthenticated && <Sidenav />}

      <div className={`content ${isAuthenticated ? "with-sidebar" : "full-width"}`}>
        <Routes>
          {/* Public Route (Login Page) */}
          <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />

          {/* Protected Routes - Requires Authentication */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/sales-flow" element={<ProtectedRoute><Salesflow /></ProtectedRoute>} />
          <Route path="/sales-team" element={<ProtectedRoute><SalesTeam /></ProtectedRoute>} />
          <Route path="/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />

          <Route path="/communications" element={<ProtectedRoute><Communications /></ProtectedRoute>} />
          <Route path="/lead-profile" element={<ProtectedRoute><LeadProfile /></ProtectedRoute>} />

          {/* Redirect unknown routes to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
