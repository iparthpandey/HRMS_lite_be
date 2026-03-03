import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Bell, Settings } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Departments from './pages/Departments';
import Employees from './pages/Employees';
import EmployeeDetail from './pages/EmployeeDetail';

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
            <Route path="/notifications" element={<ComingSoon title="Notifications" Icon={Bell} />} />
            <Route path="/settings" element={<ComingSoon title="Settings" Icon={Settings} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function ComingSoon({ title, Icon }) {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">{title} management — coming soon</p>
        </div>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '20px',
            background: 'rgba(99, 102, 241, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent-primary)'
          }}>
            <Icon size={40} />
          </div>
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-secondary)' }}>{title} page coming soon</div>
      </div>
    </div>
  );
}
