import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidenav from './components/sidenav/Sidenav'; // Import Sidenav
import Dashboard from './pages/Dashboard';
import Salesflow from './pages/Salesflow';
import Accounts from './pages/Accounts';
import Employees from './pages/Employees';
import Communications from './pages/Communications';

export default function App() {
  return (
    <BrowserRouter>
        <Sidenav /> 
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sales-flow" element={<Salesflow />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/communications" element={<Communications />} />
          </Routes>
    </BrowserRouter>
  );
}
