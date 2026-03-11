import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Mail, UserPlus, ShieldCheck } from 'lucide-react';

const AUTH_API = 'http://localhost:5001/api/auth';

function AuthView({ onLoginSuccess }) {
    const [isSignup, setIsSignup] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', role: 'Student' });
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        try {
            if (isSignup) {
                const res = await axios.post(`${AUTH_API}/register`, formData);
                setMessage(res.data.message);
                setIsSignup(false);
            } else {
                const res = await axios.post(`${AUTH_API}/login`, { email: formData.email, password: formData.password });
                localStorage.setItem('user', JSON.stringify(res.data));
                onLoginSuccess(res.data);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed');
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at top right, #1a1a2e, #16213e)',
            color: 'white'
        }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(0, 242, 255, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
                    }}>
                        <ShieldCheck size={32} color="var(--primary)" />
                    </div>
                    <h1 className="neon-text" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>SMS SECURE {isSignup ? 'SIGNUP' : 'LOGIN'}</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Role-Based Access Control System</p>
                </div>

                {message && <div className="glass-card" style={{ border: '1px solid #00ff88', color: '#00ff88', padding: '0.75rem', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>{message}</div>}
                {error && <div className="glass-card" style={{ border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '0.75rem', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                        <input
                            type="email" placeholder="Email Address" required className="glass-card"
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', background: 'rgba(255,255,255,0.02)' }}
                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                        <input
                            type="password" placeholder="Password" required className="glass-card"
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', background: 'rgba(255,255,255,0.02)' }}
                            value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    {isSignup && (
                        <div style={{ position: 'relative' }}>
                            <select
                                className="glass-card"
                                style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', color: 'var(--text-main)' }}
                                value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="Student">Role: Student</option>
                                <option value="Teacher">Role: Teacher</option>
                                <option value="Course Lead">Role: Course Lead</option>
                                <option value="Result Lead">Role: Result Lead</option>
                                <option value="Master Admin">Role: Master Admin</option>
                            </select>
                        </div>
                    )}

                    <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', height: '3rem' }}>
                        {isSignup ? 'Create Account' : 'Authenticate Console'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                    <p style={{ color: 'var(--text-dim)' }}>
                        {isSignup ? "Already have an account?" : "Need a new perspective?"}
                        <button
                            onClick={() => setIsSignup(!isSignup)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginLeft: '0.5rem', fontWeight: 600 }}
                        >
                            {isSignup ? 'Login here' : 'Register Service'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AuthView;
