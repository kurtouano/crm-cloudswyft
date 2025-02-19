import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
  const hideSidebarRoutes = ["/"];

  return (
    <div className="app-container">
      {/* Hide Sidebar on Login Page */}
      {!hideSidebarRoutes.includes(location.pathname) && <Sidenav />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/sales-flow" element={<ProtectedRoute><Salesflow /></ProtectedRoute>} />
        <Route path="/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
        <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
        <Route path="/communications" element={<ProtectedRoute><Communications /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}
