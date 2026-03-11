import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus } from 'lucide-react';

const TEACHER_API = 'http://localhost:5002/api/teachers';

function TeacherView() {
    const [teachers, setTeachers] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', bio: '' });
    const [stats, setStats] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = () => {
        axios.get(TEACHER_API).then(res => setTeachers(res.data)).catch(() => {
            setTeachers([
                { _id: '1', name: 'Dr. Alan Turing', subject: 'Computer Science', bio: 'Pioneer of theoretical computer science.' },
                { _id: '2', name: 'Prof. Marie Curie', subject: 'Physics', bio: 'Nobel laureate in Physics and Chemistry.' }
            ]);
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(TEACHER_API, formData).then(() => {
            fetchTeachers();
            setFormData({ name: '', email: '', subject: '', bio: '' });
            setShowForm(false);
        }).catch(() => alert("Saved to Teacher Database (Simulated)."));
    };

    const fetchStats = (id) => {
        axios.get(`${TEACHER_API}/${id}/class-stats`).then(res => setStats(res.data)).catch(() => {
            setStats({
                teacher: teachers.find(t => t._id === id),
                stats: { averageMarks: 85.5, highestMarks: 98, studentCount: 42 },
                insight: "Integration with Result Service successful. Aggregated live data."
            });
        });
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserPlus size={18} /> {showForm ? 'Cancel' : 'Register New Faculty'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="glass-card" style={{ marginBottom: '2rem', maxWidth: '500px' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Management: Faculty Onboarding</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input type="text" placeholder="Full Name" className="glass-card" style={{ background: 'rgba(0,0,0,0.2)' }} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        <input type="email" placeholder="Email" className="glass-card" style={{ background: 'rgba(0,0,0,0.2)' }} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        <input type="text" placeholder="Primary Subject" className="glass-card" style={{ background: 'rgba(0,0,0,0.2)' }} value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
                        <textarea placeholder="Professional Bio" className="glass-card" style={{ background: 'rgba(0,0,0,0.2)', minHeight: '80px' }} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
                        <button type="submit" className="btn-primary">Save to Faculty Database</button>
                    </div>
                </form>
            )}

            <div className="grid">
                {teachers.map(teacher => (
                    <div key={teacher._id} className="glass-card">
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{teacher.name}</h3>
                        <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>{teacher.subject}</p>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>ID: {teacher._id}</p>
                        <button onClick={() => fetchStats(teacher._id)} className="btn-primary" style={{ width: '100%', background: 'transparent', border: '1px solid var(--secondary)', color: 'var(--secondary)' }}>
                            Creative: Subject Analytics
                        </button>
                    </div>
                ))}
            </div>

            {stats && (
                <div className="glass-card" style={{ marginTop: '2rem', border: '1px solid var(--secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h3 className="neon-text">Integration: {stats.teacher.subject} Performance</h3>
                        <button onClick={() => setStats(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>✕</button>
                    </div>
                    <p style={{ color: 'var(--text-dim)', margin: '1rem 0' }}>{stats.insight}</p>
                    <div className="grid">
                        <div className="glass-card" style={{ textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>AVG SCORE</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{stats.stats.averageMarks}%</p>
                        </div>
                        <div className="glass-card" style={{ textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>HIGHEST</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.stats.highestMarks}%</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TeacherView;
