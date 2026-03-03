import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    RadialBarChart, RadialBar, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';
import { ArrowLeft, MapPin, Briefcase, CalendarCheck, CalendarX, TrendingUp, Check, XCircle as XIcon, UserX } from 'lucide-react';
import { fetchEmployeeById, fetchDepartments, updateAttendance } from '../api';

export default function EmployeeDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [emp, setEmp] = React.useState(null);
    const [departments, setDepartments] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const loadData = async () => {
            try {
                const [empData, deptData] = await Promise.all([
                    fetchEmployeeById(id),
                    fetchDepartments()
                ]);
                setEmp(empData);
                setDepartments(deptData);
            } catch (error) {
                console.error('Failed to load employee detail:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const handleUpdateAttendance = async (status) => {
        try {
            await updateAttendance(id, status);
            // Reload local data
            const empData = await fetchEmployeeById(id);
            setEmp(empData);
        } catch (error) {
            alert('Error updating attendance: ' + error.message);
        }
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading details...</div>;

    if (!emp) return (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><UserX size={48} strokeWidth={1.5} /></div>
            <div>Employee not found</div>
            <button className="back-btn" style={{ marginTop: 24 }} onClick={() => navigate('/employees')}>← Back to Employees</button>
        </div>
    );

    const dept = departments.find(d => d.id === emp.department_id);
    const deptIndex = departments.indexOf(dept);
    const attendancePct = Math.round((emp.working_days / emp.total_days) * 100);

    // Break down leaves
    const leaveDays = [
        { name: 'Working Days', value: emp.working_days, fill: dept?.color || '#6366f1' },
        { name: 'Leave Days', value: emp.leaves_taken, fill: '#ef4444' },
    ];

    const radialData = [
        { name: 'Attendance', value: attendancePct, fill: dept?.color || '#6366f1' },
    ];

    // Weekly mock for this employee
    const weeklyData = [
        { day: 'Mon', hours: 8.5, color: dept?.color },
        { day: 'Tue', hours: 7.8, color: dept?.color },
        { day: 'Wed', hours: 9.0, color: dept?.color },
        { day: 'Thu', hours: 8.2, color: dept?.color },
        { day: 'Fri', hours: 6.5, color: dept?.color },
    ];

    return (
        <div>
            <button className="back-btn" onClick={() => navigate('/employees')}>
                <ArrowLeft size={16} /> Back to Employees
            </button>

            {/* Profile Header Card */}
            <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 28 }}>
                <div style={{
                    width: 80, height: 80, borderRadius: 22, fontSize: 28, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: dept?.color,
                    background: `linear-gradient(135deg, ${dept?.color}30, ${dept?.color}10)`,
                    border: `3px solid ${dept?.color}60`, flexShrink: 0,
                }}>{emp.avatar}</div>

                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                            {emp.name}
                        </h2>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                onClick={() => handleUpdateAttendance('present')}
                                style={{ cursor: 'pointer', border: 'none', background: emp.status === 'present' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)', color: emp.status === 'present' ? '#10b981' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}
                            >
                                <Check size={14} /> MARK PRESENT
                            </button>
                            <button
                                onClick={() => handleUpdateAttendance('leave')}
                                style={{ cursor: 'pointer', border: 'none', background: emp.status === 'leave' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.05)', color: emp.status === 'leave' ? '#f59e0b' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}
                            >
                                <XIcon size={14} /> MARK ABSENT
                            </button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 24, marginTop: 10, flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                            <Briefcase size={14} color={dept?.color} /> {emp.role}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                            <span style={{ fontSize: 14 }}>{dept?.icon}</span> {dept?.name}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 16, textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ padding: '12px 20px', borderRadius: 12, background: `${dept?.color}15`, border: `1px solid ${dept?.color}30` }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: dept?.color }}>{emp.working_days}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Working Days</div>
                    </div>
                    <div style={{ padding: '12px 20px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: '#ef4444' }}>{emp.leaves_taken}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Leave Days</div>
                    </div>
                    <div style={{ padding: '12px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{emp.total_days}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Total Days</div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="emp-detail-grid">
                {/* Radial Bar / Attendance Ring */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div>
                            <div className="chart-title">Attendance Rate</div>
                            <div className="chart-subtitle">This month</div>
                        </div>
                        <TrendingUp size={18} color={dept?.color} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                        <div style={{ position: 'relative', width: 180, height: 180 }}>
                            <ResponsiveContainer width={180} height={180}>
                                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%"
                                    data={radialData} startAngle={90} endAngle={90 - 360 * (attendancePct / 100)}>
                                    <RadialBar dataKey="value" cornerRadius={12} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div style={{
                                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: 32, fontWeight: 800, color: dept?.color, letterSpacing: '-1px' }}>
                                    {attendancePct}%
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Attendance</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {[
                                { label: 'Working Days', value: emp.working_days, color: dept?.color, icon: <CalendarCheck size={14} /> },
                                { label: 'Leave Days', value: emp.leaves_taken, color: '#ef4444', icon: <CalendarX size={14} /> },
                                { label: 'Total Work Days', value: emp.total_days, color: 'var(--text-secondary)', icon: <TrendingUp size={14} /> },
                            ].map(item => (
                                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 10, background: item.color + '20',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color,
                                    }}>{item.icon}</div>
                                    <div>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: item.color, lineHeight: 1 }}>{item.value}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Leave vs Working Days BarChart */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div>
                            <div className="chart-title">Days Breakdown</div>
                            <div className="chart-subtitle">Working vs Leave days</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={leaveDays} layout="vertical" margin={{ top: 0, right: 24, left: 16, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, emp.total_days]} />
                            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
                            <Tooltip
                                formatter={(v, name) => [`${v} days`, name]}
                                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}
                            />
                            <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={36}>
                                {leaveDays.map((entry, index) => (
                                    <Cell key={index} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>

                    {/* Breakdown blocks */}
                    <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                        <div style={{
                            flex: 1, padding: '14px 16px', borderRadius: 12,
                            background: `${dept?.color}15`, border: `1px solid ${dept?.color}30`,
                        }}>
                            <div style={{ fontSize: 22, fontWeight: 800, color: dept?.color }}>{emp.working_days}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Working Days</div>
                            <div style={{ fontSize: 11, color: dept?.color, marginTop: 4, fontWeight: 600 }}>
                                {Math.round(emp.working_days / emp.total_days * 100)}% of total
                            </div>
                        </div>
                        <div style={{
                            flex: 1, padding: '14px 16px', borderRadius: 12,
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                        }}>
                            <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>{emp.leaves_taken}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Leave Days</div>
                            <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4, fontWeight: 600 }}>
                                {Math.round(emp.leaves_taken / emp.total_days * 100)}% of total
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Hours Chart */}
            <div className="chart-card">
                <div className="chart-header">
                    <div>
                        <div className="chart-title">Daily Hours This Week</div>
                        <div className="chart-subtitle">Hours logged per working day</div>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={weeklyData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 10]} unit="h" />
                        <Tooltip
                            formatter={(v) => [`${v} hrs`]}
                            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, color: 'var(--text-primary)' }}
                            itemStyle={{ color: 'var(--text-primary)' }}
                        />
                        <Bar dataKey="hours" radius={[8, 8, 0, 0]} maxBarSize={52}>
                            {weeklyData.map((entry, i) => (
                                <Cell key={i} fill={dept?.color || '#6366f1'} fillOpacity={0.7 + i * 0.06} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
