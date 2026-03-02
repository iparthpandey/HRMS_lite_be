import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ComingSoon({ title, icon }) {
    const navigate = useNavigate();

    return (
        <div className="animate-fade">
            <div className="page-header">
                <div>
                    <h1 className="page-title">{title}</h1>
                    <p className="page-subtitle">Feature currently in development</p>
                </div>
            </div>

            <div className="card" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '100px 40px',
                textAlign: 'center'
            }}>
                <div style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'var(--accent-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 24,
                    color: 'var(--accent-primary)'
                }}>
                    <span className="material-icons" style={{ fontSize: 48 }}>{icon || 'timer'}</span>
                </div>

                <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
                    Coming Soon
                </h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: 400, marginBottom: 32, lineHeight: 1.6 }}>
                    Our team is hard at work building the <strong>{title}</strong> feature. We appreciate your patience and can't wait to show you what's next!
                </p>

                <button
                    className="add-employee-btn"
                    onClick={() => navigate(-1)}
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                    <span className="material-icons" style={{ fontSize: 18 }}>arrow_back</span> Go Back
                </button>
            </div>
        </div>
    );
}
