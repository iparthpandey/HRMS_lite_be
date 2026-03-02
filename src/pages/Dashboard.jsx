import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { fetchEmployees, fetchDepartments } from '../api';
import { monthlyAttendance, weeklyTrend } from '../data/mockData';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '12px 16px', fontSize: 13
            }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color, margin: '3px 0' }}>
                        {p.name}: <strong>{p.value}{p.name === 'present' || p.name === 'leave' ? '%' : '%'}</strong>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function Dashboard() {
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [empData, deptData] = await Promise.all([
                    fetchEmployees(),
                    fetchDepartments()
                ]);
                setEmployees(empData);
                setDepartments(deptData);
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading dashboard...</div>;

    const totalEmployees = employees.length;
    const presentToday = employees.filter(e => e.status === 'present').length;
    const onLeave = employees.filter(e => e.status === 'leave').length;
    const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

    const deptPieData = departments.map(d => ({
        name: d.name,
        value: d.headcount,
    }));

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Real-time attendance overview across all departments</p>
                </div>
                <div className="date-badge">
                    <Clock size={14} />
                    {dateStr}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <KpiCard
                    icon="👥" iconBg="rgba(99,102,241,0.15)" iconColor="#6366f1"
                    value={totalEmployees} label="Total Employees"
                    change="+2 this month" up={true}
                />
                <KpiCard
                    icon="✅" iconBg="rgba(16,185,129,0.15)" iconColor="#10b981"
                    value={presentToday} label="Present Today"
                    change={`${attendanceRate}% attendance`} up={true}
                />
                <KpiCard
                    icon="🏖️" iconBg="rgba(245,158,11,0.15)" iconColor="#f59e0b"
                    value={onLeave} label="On Leave"
                    change="vs 3 yesterday" up={false}
                />
                <KpiCard
                    icon="📈" iconBg="rgba(139,92,246,0.15)" iconColor="#8b5cf6"
                    value={`${attendanceRate}%`} label="Avg Attendance"
                    change="+2.1% vs last month" up={true}
                />
            </div>

            {/* Charts Row 1 */}
            <div className="charts-grid">
                {/* Monthly Area Chart */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div>
                            <div className="chart-title">Monthly Attendance Trend</div>
                            <div className="chart-subtitle">Present vs Leave — last 7 months</div>
                        </div>
                        <TrendingUp size={18} color="var(--accent-primary)" />
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={monthlyAttendance} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradLeave" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="present" name="Present" stroke="#6366f1" strokeWidth={2.5}
                                fill="url(#gradPresent)" dot={{ fill: '#6366f1', strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
                            <Area type="monotone" dataKey="leave" name="Leave" stroke="#ec4899" strokeWidth={2.5}
                                fill="url(#gradLeave)" dot={{ fill: '#ec4899', strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Dept Distribution Donut */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div>
                            <div className="chart-title">Headcount Distribution</div>
                            <div className="chart-subtitle">By department</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={deptPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                                paddingAngle={4} dataKey="value">
                                {deptPieData.map((_, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(val, name) => [`${val} employees`, name]}
                                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 8 }}>
                        {departments.map((d, i) => (
                            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i], display: 'inline-block' }} />
                                {d.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Weekly Dept Attendance BarChart */}
            <div className="chart-card" style={{ marginBottom: 28 }}>
                <div className="chart-header">
                    <div>
                        <div className="chart-title">Weekly Department Attendance</div>
                        <div className="chart-subtitle">Attendance % per department this week</div>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={weeklyTrend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} domain={[70, 100]} unit="%" />
                        <Tooltip
                            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}
                            formatter={(v) => [`${v}%`]}
                        />
                        <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)', paddingTop: 12 }} />
                        {departments.map((d, i) => (
                            <Bar key={d.id} dataKey={d.name} fill={COLORS[i]} radius={[4, 4, 0, 0]} maxBarSize={14} />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Quick Employee Status */}
            <div className="chart-card">
                <div className="chart-header">
                    <div>
                        <div className="chart-title">Today's Status Snapshot</div>
                        <div className="chart-subtitle">All employees at a glance</div>
                    </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    {employees.map(emp => {
                        const dept = departments.find(d => d.id === emp.department_id);
                        return (
                            <div key={emp.id} title={`${emp.name} — ${emp.status}`}
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                    padding: '12px 10px', borderRadius: 12, minWidth: 72,
                                    background: emp.status === 'present' ? 'rgba(16,185,129,0.07)' : 'rgba(245,158,11,0.07)',
                                    border: `1px solid ${emp.status === 'present' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                                    cursor: 'default',
                                }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 10, background: dept?.color + '33',
                                    border: `2px solid ${dept?.color}`, display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontSize: 12, fontWeight: 700, color: dept?.color
                                }}>{emp.avatar}</div>
                                <span style={{ fontSize: 10, color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 64, lineHeight: 1.3 }}>
                                    {emp.name.split(' ')[0]}
                                </span>
                                <span style={{ fontSize: 9, color: emp.status === 'present' ? 'var(--success)' : 'var(--warning)', fontWeight: 700 }}>
                                    {emp.status === 'present' ? '● IN' : '● OUT'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function KpiCard({ icon, iconBg, iconColor, value, label, change, up }) {
    return (
        <div className="kpi-card">
            <div className="kpi-icon" style={{ background: iconBg }}>
                <span style={{ fontSize: 22 }}>{icon}</span>
            </div>
            <div className="kpi-value">{value}</div>
            <div className="kpi-label">{label}</div>
            <div className={`kpi-change ${up ? 'up' : 'down'}`}>
                {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {change}
            </div>
        </div>
    );
}
