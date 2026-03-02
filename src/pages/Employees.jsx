import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEmployees, fetchDepartments, createEmployee, updateAttendance, deleteEmployee, fetchAttendanceByDate } from '../api';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

export default function Employees() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('name_asc');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [dailyAttendance, setDailyAttendance] = useState({});

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newEmp, setNewEmp] = useState({ name: '', email: '', emp_id: '', role: '', department_id: '' });

    const loadData = async () => {
        try {
            const [empData, deptData, attendanceData] = await Promise.all([
                fetchEmployees(),
                fetchDepartments(),
                fetchAttendanceByDate(selectedDate)
            ]);
            setEmployees(empData);
            setDepartments(deptData);
            setDailyAttendance(attendanceData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedDate]);

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
            const currentDayStatus = dailyAttendance[empId] || employees.find(e => e.id === empId)?.status;
            if (currentDayStatus === status) return;

            await updateAttendance(empId, status, selectedDate);

            // Optimistic update
            setDailyAttendance(prev => ({ ...prev, [empId]: status }));

            setEmployees(prev => prev.map(emp => {
                if (emp.id === empId) {
                    let newWorkingDays = emp.working_days;
                    if (status === 'present' && (currentDayStatus === 'leave' || !currentDayStatus)) {
                        newWorkingDays = Math.min(emp.total_days, emp.working_days + 1);
                    } else if (status === 'leave' && currentDayStatus === 'present') {
                        newWorkingDays = Math.max(0, emp.working_days - 1);
                    }

                    const updatedEmp = { ...emp, working_days: newWorkingDays };
                    if (selectedDate === new Date().toISOString().split('T')[0]) {
                        updatedEmp.status = status;
                    }
                    return updatedEmp;
                }
                return emp;
            }));
        } catch (error) {
            alert('Error updating attendance: ' + error.message);
        }
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading employees...</div>;

    // Filter, Sort, Paginate
    let filtered = employees.filter(e => {
        const dept = departments.find(d => d.id === e.department_id);
        const matchesSearch =
            e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.role.toLowerCase().includes(search.toLowerCase()) ||
            (dept?.name || '').toLowerCase().includes(search.toLowerCase());
        const matchesDept = deptFilter === 'all' || e.department_id === parseInt(deptFilter);

        const currentStatus = dailyAttendance[e.id] || e.status;
        const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;

        return matchesSearch && matchesDept && matchesStatus;
    });

    // Sorting
    filtered.sort((a, b) => {
        if (sortOrder === 'name_asc') return a.name.localeCompare(b.name);
        if (sortOrder === 'attendance_desc') return (b.working_days / b.total_days) - (a.working_days / a.total_days);
        if (sortOrder === 'attendance_asc') return (a.working_days / a.total_days) - (b.working_days / b.total_days);
        return 0;
    });

    // Pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Employees</h1>
                    <p className="page-subtitle">{filtered.length} of {employees.length} employees shown</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div className="date-badge" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
                        <span className="material-icons" style={{ fontSize: 16 }}>calendar_today</span>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: 13, cursor: 'pointer' }}
                        />
                    </div>
                    <button className="add-employee-btn" onClick={() => setShowAddForm(true)}
                        style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, cursor: 'pointer' }}>
                        <span className="material-icons" style={{ fontSize: 18 }}>add</span> Add Employee
                    </button>
                </div>
            </div>

            {showAddForm && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                    <div className="card" style={{ width: '100%', maxWidth: 450, position: 'relative', padding: 32 }}>
                        <button onClick={() => setShowAddForm(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <span className="material-icons">close</span>
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
                                        <option key={d.id} value={String(d.id)}>{d.name}</option>
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
                    <span className="material-icons" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18 }}>search</span>
                    <input
                        className="search-input"
                        style={{ paddingLeft: 38, width: '100%' }}
                        placeholder="Search employees…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                    <select
                        className="filter-btn"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        style={{ appearance: 'auto', paddingRight: 30 }}
                    >
                        <option value="name_asc">Name (A-Z)</option>
                        <option value="attendance_desc">Highest Attendance</option>
                        <option value="attendance_asc">Lowest Attendance</option>
                    </select>

                    <button className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>All</button>
                    <button className={`filter-btn ${statusFilter === 'present' ? 'active' : ''}`} onClick={() => setStatusFilter('present')}>Present</button>
                    <button className={`filter-btn ${statusFilter === 'leave' ? 'active' : ''}`} onClick={() => setStatusFilter('leave')}>Absent</button>
                </div>
            </div>

            <div className="filters-row" style={{ marginBottom: 24 }}>
                <button className={`filter-btn ${deptFilter === 'all' ? 'active' : ''}`} onClick={() => { setDeptFilter('all'); setCurrentPage(1); }}>All Depts</button>
                {departments.map((d, i) => (
                    <button
                        key={d.id}
                        className={`filter-btn ${deptFilter === String(d.id) ? 'active' : ''}`}
                        onClick={() => { setDeptFilter(deptFilter === String(d.id) ? 'all' : String(d.id)); setCurrentPage(1); }}
                        style={deptFilter === String(d.id) ? { background: d.color, borderColor: d.color, display: 'flex', alignItems: 'center', gap: 6 } : { display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        <span className="material-icons" style={{ fontSize: 16 }}>{d.icon}</span> {d.name}
                    </button>
                ))}
            </div>

            {/* Employee Cards */}
            <div className="employees-grid">
                {paginated.map(emp => {
                    const dept = departments.find(d => d.id === emp.department_id);
                    const pct = Math.round((emp.working_days / emp.total_days) * 100);
                    const currentStatus = dailyAttendance[emp.id] || emp.status;

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
                                        <span className="material-icons" style={{ fontSize: 18 }}>delete</span>
                                    </button>
                                </div>
                                <div className="emp-role" style={{ fontSize: 13, marginBottom: 8 }}>{emp.role}</div>
                                <div className="emp-dept-tag" style={{ background: dept?.color + '20', color: dept?.color, fontSize: 11, padding: '4px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    <span className="material-icons" style={{ fontSize: 12 }}>{dept?.icon}</span> {dept?.name}
                                </div>
                            </div>
                            <div className="emp-stats">
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button
                                        className={`status-badge ${currentStatus === 'present' ? 'present' : ''}`}
                                        onClick={(e) => handleUpdateAttendance(emp.id, 'present', e)}
                                        style={{ cursor: 'pointer', border: 'none', background: currentStatus === 'present' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)', color: currentStatus === 'present' ? '#10b981' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700 }}
                                    >
                                        <span className="material-icons" style={{ fontSize: 14 }}>check</span> PRESENT
                                    </button>
                                    <button
                                        className={`status-badge ${currentStatus === 'leave' ? 'leave' : ''}`}
                                        onClick={(e) => handleUpdateAttendance(emp.id, 'leave', e)}
                                        style={{ cursor: 'pointer', border: 'none', background: currentStatus === 'leave' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.05)', color: currentStatus === 'leave' ? '#f59e0b' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700 }}
                                    >
                                        <span className="material-icons" style={{ fontSize: 14 }}>close</span> ABSENT
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
                    <div style={{ marginBottom: 16, color: 'var(--accent-primary)', display: 'flex', justifyContent: 'center' }}>
                        <span className="material-icons" style={{ fontSize: 48 }}>search</span>
                    </div>
                    <div style={{ fontSize: 16, color: 'var(--text-secondary)' }}>No employees match your filters</div>
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 40, padding: '20px 0' }}>
                    <button
                        className="filter-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        style={{ opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                        <span className="material-icons" style={{ fontSize: 18 }}>chevron_left</span> Prev
                    </button>
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>Page {currentPage} of {totalPages}</span>
                    <button
                        className="filter-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        style={{ opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                        Next <span className="material-icons" style={{ fontSize: 18 }}>chevron_right</span>
                    </button>
                </div>
            )}
        </div>
    );
}
