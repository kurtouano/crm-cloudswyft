import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidenav from "./components/sidenav/Sidenav";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Salesflow from "./pages/Salesflow";
import Accounts from "./pages/Accounts";
import Employees from "./pages/Employees";
import Communications from "./pages/Communications";
import ProtectedRoute from "./components/auth/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}

function MainLayout() {
  const location = useLocation();
  const token = localStorage.getItem("token");
  
  return (
    <div className="app-container">
      {/* ✅ Only show sidebar when the user is logged in */}
      {token && <Sidenav />}

      <Routes>
        {/* Public Route (Login Page) */}
        <Route path="/" element={<Login />} />

        {/* Protected Routes - Requires Authentication */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/sales-flow" element={<ProtectedRoute><Salesflow /></ProtectedRoute>} />
        <Route path="/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
        <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
        <Route path="/communications" element={<ProtectedRoute><Communications /></ProtectedRoute>} />

        {/* ✅ Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
