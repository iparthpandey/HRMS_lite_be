import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEmployees, fetchDepartments, createEmployee, updateAttendance } from '../api';
import { employees as mockEmployees, departments as mockDepartments } from '../data/mockData';
import {
    Search, Plus, X, Check, XCircle as XIcon,
    Laptop, Palette, Megaphone, Briefcase, Users, BarChart2,
    ArrowUpDown, ArrowUp, ArrowDown, CalendarDays,
} from 'lucide-react';

const DEPT_ICONS = { Laptop, Palette, Megaphone, Briefcase, HandshakeIcon: Users, BarChart2 };
function DeptIcon({ name, size = 13, color }) {
    const Icon = DEPT_ICONS[name] || Briefcase;
    return <Icon size={size} color={color} />;
}

const SORT_OPTIONS = [
    { value: 'default', label: 'Default' },
    { value: 'att_high', label: 'Attendance ↑' },
    { value: 'att_low', label: 'Attendance ↓' },
    { value: 'present', label: 'Present First' },
    { value: 'absent', label: 'Absent First' },
];

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function Employees() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('default');
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newEmp, setNewEmp] = useState({ name: '', role: '', department_id: '' });
    const [selectedDate, setSelectedDate] = useState(todayStr());
    // Local attendance overrides: { [empId]: status }
    const [attendanceMap, setAttendanceMap] = useState({});

    const loadData = async () => {
        try {
            const [empData, deptData] = await Promise.all([
                fetchEmployees(),
                fetchDepartments()
            ]);
            setEmployees(empData);
            setDepartments(deptData);
        } catch (error) {
            console.warn('API unavailable, falling back to mock data:', error);
            setEmployees(mockEmployees);
            setDepartments(mockDepartments);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        try {
            await createEmployee({
                ...newEmp,
                department_id: parseInt(newEmp.department_id),
                status: 'present'
            });
            setShowAddForm(false);
            setNewEmp({ name: '', role: '', department_id: '' });
            loadData();
        } catch (error) {
            // Mock mode: add locally
            const dept = departments.find(d => d.id === parseInt(newEmp.department_id));
            const initials = newEmp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            const newEntry = {
                id: Date.now(), name: newEmp.name, role: newEmp.role,
                department_id: parseInt(newEmp.department_id),
                avatar: initials, status: 'present',
                working_days: 0,
                leaves_taken: 0,
                total_days: 0,
            };
            setEmployees(prev => [...prev, newEntry]);
            setShowAddForm(false);
            setNewEmp({ name: '', role: '', department_id: '' });
        }
    };

    const handleMarkAttendance = async (empId, status, e) => {
        e.stopPropagation();
        try {
            await updateAttendance(empId, status);
            // Refresh local state from the mock "database"
            const updatedEmps = await fetchEmployees();
            setEmployees([...updatedEmps]);
            setAttendanceMap(prev => ({ ...prev, [`${empId}_${selectedDate}`]: status }));
        } catch (error) {
            console.error('Failed to update attendance:', error);
        }
    };

    const getStatus = (emp) => {
        return attendanceMap[`${emp.id}_${selectedDate}`] ?? emp.status;
    };

    const getAttPct = (emp) => {
        const wd = emp.workingDays ?? emp.working_days ?? 0;
        const td = emp.totalDays ?? emp.total_days ?? 1;
        return td > 0 ? Math.round((wd / td) * 100) : 0;
    };

    const getDeptId = (emp) => emp.departmentId ?? emp.department_id;

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading employees...</div>;

    let filtered = employees.filter(e => {
        const dept = departments.find(d => d.id === getDeptId(e));
        const matchesSearch =
            e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.role.toLowerCase().includes(search.toLowerCase()) ||
            (dept?.name || '').toLowerCase().includes(search.toLowerCase());
        const matchesDept = deptFilter === 'all' || getDeptId(e) === parseInt(deptFilter);
        const matchesStatus = statusFilter === 'all' || getStatus(e) === statusFilter;
        return matchesSearch && matchesDept && matchesStatus;
    });

    // Sort
    if (sortBy === 'att_high') filtered = [...filtered].sort((a, b) => getAttPct(b) - getAttPct(a));
    else if (sortBy === 'att_low') filtered = [...filtered].sort((a, b) => getAttPct(a) - getAttPct(b));
    else if (sortBy === 'present') filtered = [...filtered].sort((a, b) => (getStatus(a) === 'present' ? -1 : 1));
    else if (sortBy === 'absent') filtered = [...filtered].sort((a, b) => (getStatus(a) === 'leave' ? -1 : 1));

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Employees</h1>
                    <p className="page-subtitle">{filtered.length} of {employees.length} employees shown</p>
                </div>
                <button className="add-employee-btn" onClick={() => setShowAddForm(true)}
                    style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, cursor: 'pointer' }}>
                    <Plus size={18} /> Add Employee
                </button>
            </div>

            {showAddForm && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                    <div className="card" style={{ width: '100%', maxWidth: 450, position: 'relative', padding: 32 }}>
                        <button onClick={() => setShowAddForm(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Add New Employee</h2>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Enter employee details to add them to the system.</p>
                        <form onSubmit={handleAddEmployee}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>NAME</label>
                                <input className="search-input" style={{ width: '100%' }} placeholder="Full Name" required value={newEmp.name} onChange={e => setNewEmp({ ...newEmp, name: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>ROLE</label>
                                <input className="search-input" style={{ width: '100%' }} placeholder="e.g. Senior Designer" required value={newEmp.role} onChange={e => setNewEmp({ ...newEmp, role: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>DEPARTMENT</label>
                                <select className="search-input" style={{ width: '100%', appearance: 'auto' }} required value={newEmp.department_id} onChange={e => setNewEmp({ ...newEmp, department_id: e.target.value })}>
                                    <option value="">Select Department</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <button type="submit" style={{ width: '100%', background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '12px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                                Create Employee
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Date Picker for Attendance */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <CalendarDays size={16} color="var(--accent-primary)" />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Marking attendance for:</span>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    style={{
                        background: 'var(--bg-primary)', border: '1px solid var(--border)',
                        borderRadius: 8, padding: '6px 12px', color: 'var(--text-primary)',
                        fontSize: 13, cursor: 'pointer', outline: 'none',
                    }}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>
                    Click PRESENT / ABSENT on any card to mark for this date
                </span>
            </div>

            {/* Filters Row 1: Search + Status */}
            <div className="filters-row">
                <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
                    <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        className="search-input"
                        style={{ paddingLeft: 38, width: '100%' }}
                        placeholder="Search by name, role or department…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <button className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>All</button>
                <button className={`filter-btn ${statusFilter === 'present' ? 'active' : ''}`} onClick={() => setStatusFilter('present')}>Present</button>
                <button className={`filter-btn ${statusFilter === 'leave' ? 'active' : ''}`} onClick={() => setStatusFilter('leave')}>On Leave</button>

                {/* Sort dropdown */}
                <div style={{ position: 'relative', marginLeft: 'auto' }}>
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8,
                            color: 'var(--text-secondary)', padding: '7px 32px 7px 12px', fontSize: 13,
                            cursor: 'pointer', outline: 'none', appearance: 'none',
                        }}
                    >
                        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <ArrowUpDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                </div>
            </div>

            {/* Filters Row 2: Dept filters */}
            <div className="filters-row" style={{ marginBottom: 24 }}>
                <button className={`filter-btn ${deptFilter === 'all' ? 'active' : ''}`} onClick={() => setDeptFilter('all')}>All Depts</button>
                {departments.map((d) => (
                    <button
                        key={d.id}
                        className={`filter-btn ${deptFilter === String(d.id) ? 'active' : ''}`}
                        onClick={() => setDeptFilter(deptFilter === String(d.id) ? 'all' : String(d.id))}
                        style={deptFilter === String(d.id) ? { background: d.color, borderColor: d.color, color: 'white', display: 'flex', alignItems: 'center', gap: 5 } : { display: 'flex', alignItems: 'center', gap: 5 }}
                    >
                        <DeptIcon name={d.icon} size={12} color={deptFilter === String(d.id) ? 'white' : d.color} />
                        {d.name}
                    </button>
                ))}
            </div>

            {/* Employee Cards */}
            <div className="employees-grid">
                {filtered.map(emp => {
                    const dept = departments.find(d => d.id === getDeptId(emp));
                    const pct = getAttPct(emp);
                    const status = getStatus(emp);

                    return (
                        <div key={emp.id} className="employee-card" onClick={() => navigate(`/employees/${emp.id}`)}>
                            <div className="emp-avatar" style={{ background: `linear-gradient(135deg, ${dept?.color}66, ${dept?.color}33)`, border: `2px solid ${dept?.color}60`, color: dept?.color }}>
                                {emp.avatar}
                            </div>
                            <div className="emp-info">
                                <div className="emp-name">{emp.name}</div>
                                <div className="emp-role">{emp.role}</div>
                                <div className="emp-dept-tag" style={{ background: dept?.color + '20', color: dept?.color, display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <DeptIcon name={dept?.icon} size={11} color={dept?.color} />
                                    {dept?.name}
                                </div>
                            </div>
                            <div className="emp-stats">
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button
                                        onClick={(e) => handleMarkAttendance(emp.id, 'present', e)}
                                        style={{ cursor: 'pointer', border: 'none', background: status === 'present' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)', color: status === 'present' ? '#10b981' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, transition: 'all 0.15s' }}
                                    >
                                        <Check size={12} /> PRESENT
                                    </button>
                                    <button
                                        onClick={(e) => handleMarkAttendance(emp.id, 'leave', e)}
                                        style={{ cursor: 'pointer', border: 'none', background: status === 'leave' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.05)', color: status === 'leave' ? '#f59e0b' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, transition: 'all 0.15s' }}
                                    >
                                        <XIcon size={12} /> ABSENT
                                    </button>
                                </div>
                                <span className="emp-days">{emp.workingDays ?? emp.working_days ?? 0}/{emp.totalDays ?? emp.total_days ?? 0} days</span>
                                <div style={{ width: 52, height: 6, borderRadius: 50, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: 50, background: dept?.color }} />
                                </div>
                                <span style={{ fontSize: 11, color: dept?.color, fontWeight: 600 }}>{pct}%</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                    <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><Search size={40} strokeWidth={1.5} /></div>
                    <div style={{ fontSize: 16, color: 'var(--text-secondary)' }}>No employees match your filters</div>
                </div>
            )}
        </div>
    );
}
