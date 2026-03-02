import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X, Check, XCircle as XIcon, Trash2 } from 'lucide-react';
import { fetchEmployees, fetchDepartments, createEmployee, updateAttendance, deleteEmployee } from '../api';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

export default function Employees() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newEmp, setNewEmp] = useState({ name: '', email: '', emp_id: '', role: '', department_id: '' });

    const loadData = async () => {
        try {
            const [empData, deptData] = await Promise.all([
                fetchEmployees(),
                fetchDepartments()
            ]);
            setEmployees(empData);
            setDepartments(deptData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        try {
            await createEmployee({
                ...newEmp,
                department_id: parseInt(newEmp.department_id),
                status: 'present'
            });
            setShowAddForm(false);
            setNewEmp({ name: '', email: '', emp_id: '', role: '', department_id: '' });
            loadData();
        } catch (error) {
            alert('Error adding employee: ' + error.message);
        }
    };

    const handleDeleteEmployee = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this employee?')) return;
        try {
            await deleteEmployee(id);
            loadData();
        } catch (error) {
            alert('Error deleting employee: ' + error.message);
        }
    };

    const handleUpdateAttendance = async (empId, status, e) => {
        e.stopPropagation();
        try {
            await updateAttendance(empId, status);
            loadData();
        } catch (error) {
            alert('Error updating attendance: ' + error.message);
        }
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading employees...</div>;

    const filtered = employees.filter(e => {
        const dept = departments.find(d => d.id === e.department_id);
        const matchesSearch =
            e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.role.toLowerCase().includes(search.toLowerCase()) ||
            (dept?.name || '').toLowerCase().includes(search.toLowerCase());
        const matchesDept = deptFilter === 'all' || e.department_id === parseInt(deptFilter);
        const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
        return matchesSearch && matchesDept && matchesStatus;
    });

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
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>EMPLOYEE ID</label>
                                <input className="search-input" style={{ width: '100%' }} placeholder="EMP001" required value={newEmp.emp_id} onChange={e => setNewEmp({ ...newEmp, emp_id: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>NAME</label>
                                <input className="search-input" style={{ width: '100%' }} placeholder="Full Name" required value={newEmp.name} onChange={e => setNewEmp({ ...newEmp, name: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>EMAIL ADDRESS</label>
                                <input className="search-input" type="email" style={{ width: '100%' }} placeholder="email@company.com" required value={newEmp.email} onChange={e => setNewEmp({ ...newEmp, email: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>ROLE</label>
                                <input className="search-input" style={{ width: '100%' }} placeholder="e.g. Senior Designer" required value={newEmp.role} onChange={e => setNewEmp({ ...newEmp, role: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>DEPARTMENT</label>
                                <select className="search-input" style={{ width: '100%', appearance: 'auto' }} required value={newEmp.department_id} onChange={e => setNewEmp({ ...newEmp, department_id: e.target.value })}>
                                    <option value="">Select Department</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" style={{ width: '100%', background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '12px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                                Create Employee
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Filters */}
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
            </div>

            <div className="filters-row" style={{ marginBottom: 24 }}>
                <button className={`filter-btn ${deptFilter === 'all' ? 'active' : ''}`} onClick={() => setDeptFilter('all')}>All Depts</button>
                {departments.map((d, i) => (
                    <button
                        key={d.id}
                        className={`filter-btn ${deptFilter === String(d.id) ? 'active' : ''}`}
                        onClick={() => setDeptFilter(deptFilter === String(d.id) ? 'all' : String(d.id))}
                        style={deptFilter === String(d.id) ? { background: d.color, borderColor: d.color } : {}}
                    >
                        {d.icon} {d.name}
                    </button>
                ))}
            </div>

            {/* Employee Cards */}
            <div className="employees-grid">
                {filtered.map(emp => {
                    const dept = departments.find(d => d.id === emp.department_id);
                    const deptIndex = departments.indexOf(dept);
                    const pct = Math.round((emp.working_days / emp.total_days) * 100);

                    return (
                        <div key={emp.id} className="employee-card" onClick={() => navigate(`/employees/${emp.id}`)}>
                            <div className="emp-avatar" style={{ background: `linear-gradient(135deg, ${dept?.color}66, ${dept?.color}33)`, border: `2px solid ${dept?.color}60`, color: dept?.color }}>
                                {emp.avatar}
                            </div>
                            <div className="emp-info">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div className="emp-name" style={{ fontSize: 15, fontWeight: 700 }}>{emp.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>ID: {emp.emp_id}</div>
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteEmployee(emp.id, e)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', opacity: 0.6, cursor: 'pointer', padding: 4 }}
                                        title="Delete Employee"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="emp-role" style={{ fontSize: 13, marginBottom: 8 }}>{emp.role}</div>
                                <div className="emp-dept-tag" style={{ background: dept?.color + '20', color: dept?.color, fontSize: 11, padding: '4px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    {dept?.icon} {dept?.name}
                                </div>
                            </div>
                            <div className="emp-stats">
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button
                                        className={`status-badge ${emp.status === 'present' ? 'present' : ''}`}
                                        onClick={(e) => handleUpdateAttendance(emp.id, 'present', e)}
                                        style={{ cursor: 'pointer', border: 'none', background: emp.status === 'present' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)', color: emp.status === 'present' ? '#10b981' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700 }}
                                    >
                                        <Check size={12} /> PRESENT
                                    </button>
                                    <button
                                        className={`status-badge ${emp.status === 'leave' ? 'leave' : ''}`}
                                        onClick={(e) => handleUpdateAttendance(emp.id, 'leave', e)}
                                        style={{ cursor: 'pointer', border: 'none', background: emp.status === 'leave' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.05)', color: emp.status === 'leave' ? '#f59e0b' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700 }}
                                    >
                                        <XIcon size={12} /> ABSENT
                                    </button>
                                </div>
                                <span className="emp-days">{emp.working_days}/{emp.total_days} days</span>
                                <div style={{
                                    width: 52, height: 6, borderRadius: 50, background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
                                }}>
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
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                    <div style={{ fontSize: 16, color: 'var(--text-secondary)' }}>No employees match your filters</div>
                </div>
            )}
        </div>
    );
}
