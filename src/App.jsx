import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Departments from './pages/Departments';
import Employees from './pages/Employees';
import EmployeeDetail from './pages/EmployeeDetail';
import ComingSoon from './pages/ComingSoon';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/:id" element={<EmployeeDetail />} />
            <Route path="/calendar" element={<ComingSoon title="Calendar" icon="calendar_month" />} />
            <Route path="/notifications" element={<ComingSoon title="Notifications" icon="notifications" />} />
            <Route path="/settings" element={<ComingSoon title="Settings" icon="settings" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

