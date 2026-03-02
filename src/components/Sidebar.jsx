import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    Users,
    CalendarDays,
    Settings,
    Bell,
} from 'lucide-react';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
    { icon: Building2, label: 'Departments', to: '/departments' },
    { icon: Users, label: 'Employees', to: '/employees' },
    { icon: CalendarDays, label: 'Calendar', to: '/calendar' },
];

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon">📋</div>
                <div className="logo-text">
                    <span>AttendTrack</span>
                    <span>Management System</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <span className="nav-label">Main Menu</span>
                {navItems.map(({ icon: Icon, label, to }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                    >
                        <Icon className="nav-icon" size={18} />
                        {label}
                    </NavLink>
                ))}

                <span className="nav-label" style={{ marginTop: 24 }}>System</span>
                <div className="nav-item">
                    <Bell className="nav-icon" size={18} />
                    Notifications
                    <span className="badge" style={{ marginLeft: 'auto' }}>3</span>
                </div>
                <div className="nav-item">
                    <Settings className="nav-icon" size={18} />
                    Settings
                </div>
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
