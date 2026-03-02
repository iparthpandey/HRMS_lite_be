import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
    { icon: 'dashboard', label: 'Dashboard', to: '/' },
    { icon: 'business', label: 'Departments', to: '/departments' },
    { icon: 'people', label: 'Employees', to: '/employees' },
    { icon: 'calendar_today', label: 'Calendar', to: '/calendar' },
];

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon">
                    <span className="material-icons" style={{ fontSize: 24, color: '#fff' }}>fingerprint</span>
                </div>
                <div className="logo-text">
                    <span>HRMS</span>
                    <span>Management System</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <span className="nav-label">Main Menu</span>
                {navItems.map(({ icon, label, to }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                    >
                        <span className="material-icons" style={{ fontSize: 20 }}>{icon}</span>
                        {label}
                    </NavLink>
                ))}

                <span className="nav-label" style={{ marginTop: 24 }}>System</span>
                <NavLink to="/notifications" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                    <span className="material-icons" style={{ fontSize: 20 }}>notifications</span>
                    Notifications
                    <span className="badge" style={{ marginLeft: 'auto' }}>3</span>
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                    <span className="material-icons" style={{ fontSize: 20 }}>settings</span>
                    Settings
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <div className="user-card">
                    <div className="user-avatar">AD</div>
                    <div className="user-info">
                        <span>Admin User</span>
                        <span>Administrator</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
