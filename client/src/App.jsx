import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidenav from './components/sidenav/Sidenav';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Salesflow from './pages/Salesflow';
import Accounts from './pages/Accounts';
import Employees from './pages/Employees';
import Communications from './pages/Communications';

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
      {!hideSidebarRoutes.includes(location.pathname) && <Sidenav />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sales-flow" element={<Salesflow />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/communications" element={<Communications />} />
      </Routes>
    </div>
  );
}
