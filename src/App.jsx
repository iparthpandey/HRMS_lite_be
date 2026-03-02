import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
            <Route path="/calendar" element={<Calendar />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function Calendar() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">Attendance calendar view — coming soon</p>
        </div>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>📅</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-secondary)' }}>Calendar view coming soon</div>
      </div>
    </div>
  );
}
