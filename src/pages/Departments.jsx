import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
    PieChart, Pie, Cell, Tooltip
} from 'recharts';
import { fetchDepartments, fetchEmployees } from '../api';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

export default function Departments() {
    const navigate = useNavigate();
    const [selected, setSelected] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [deptData, empData] = await Promise.all([
                    fetchDepartments(),
                    fetchEmployees()
                ]);
                setDepartments(deptData);
                setEmployees(empData);
            } catch (error) {
                console.error('Failed to load departments:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading departments...</div>;

    const dept = selected ? departments.find(d => d.id === selected) : null;
    const deptEmployees = dept ? employees.filter(e => e.department_id === dept.id) : [];

    const radarData = departments.map(d => ({
        dept: d.name.slice(0, 3),
        attendance: d.avg_attendance,
    }));

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Departments</h1>
                    <p className="page-subtitle">Overview of all {departments.length} departments</p>
                </div>
            </div>

            {/* Two-column: Dept List + Chart */}
            <div className="charts-grid" style={{ marginBottom: 28 }}>
                {/* Radar Chart */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div>
                            <div className="chart-title">Attendance by Department</div>
                            <div className="chart-subtitle">Average attendance rate (%)</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.08)" />
                            <PolarAngleAxis dataKey="dept" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <Radar name="Attendance" dataKey="attendance" stroke="#6366f1" fill="#6366f1"
                                fillOpacity={0.2} strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
                            <Tooltip
                                formatter={(v) => [`${v}%`, 'Attendance']}
                                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Donut with legend */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div>
                            <div className="chart-title">Headcount Split</div>
                            <div className="chart-subtitle">Total employees per department</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={departments.map(d => ({ name: d.name, value: d.headcount }))}
                                cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                                {departments.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                            </Pie>
                            <Tooltip
                                formatter={(v, n) => [`${v} people`, n]}
                                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 0' }}>
                        {departments.map((d, i) => (
                            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                                <span style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i], flexShrink: 0 }} />
                                <span>{d.name}</span>
                                <span style={{ color: 'var(--text-primary)', fontWeight: 600, marginLeft: 'auto', paddingRight: 16 }}>{d.headcount}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Department Cards */}
            <div className="departments-grid">
                {departments.map((d, i) => (
                    <div
                        key={d.id}
                        className="dept-card"
                        onClick={() => setSelected(selected === d.id ? null : d.id)}
                        style={{
                            borderColor: selected === d.id ? d.color + '80' : undefined,
                            boxShadow: selected === d.id ? `0 0 32px ${d.color}20` : undefined,
                        }}
                    >
                        <div className="dept-card" style={{
                            position: 'absolute', top: -35, left: 0, right: 0, height: 3,
                            background: d.color, borderRadius: 'var(--radius) var(--radius) 0 0',
                            zIndex: 1,
                        }} />
                        <div className="dept-top">
                            <div className="dept-icon" style={{ background: d.color + '20' }}>
                                {d.icon}
                            </div>
                            <div className="dept-headcount">
                                <div className="number">{d.headcount}</div>
                                <div className="label">employees</div>
                            </div>
                        </div>
                        <div className="dept-name">{d.name}</div>
                        <div className="dept-desc">{d.description}</div>

                        <div className="dept-attendance-bar">
                            <div className="dept-attendance-fill"
                                style={{ width: `${d.avg_attendance}%`, background: d.color }} />
                        </div>
                        <div className="dept-attendance-label">
                            <span>Avg Attendance</span>
                            <span style={{ color: d.color, fontWeight: 600 }}>{d.avg_attendance}%</span>
                        </div>

                        {selected === d.id && (
                            <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600 }}>
                                    TEAM MEMBERS
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {employees.filter(e => e.department_id === d.id).map(emp => (
                                        <div key={emp.id}
                                            onClick={ev => { ev.stopPropagation(); navigate(`/employees/${emp.id}`); }}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
                                                borderRadius: 8, background: 'var(--bg-primary)', border: '1px solid var(--border)',
                                                fontSize: 12, cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.2s',
                                            }}>
                                            <span style={{
                                                width: 22, height: 22, borderRadius: 6, background: d.color + '33',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 9, fontWeight: 700, color: d.color,
                                            }}>{emp.avatar}</span>
                                            {emp.name.split(' ')[0]}
                                            <span style={{ color: emp.status === 'present' ? 'var(--success)' : 'var(--warning)', fontSize: 10 }}>
                                                ●
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
