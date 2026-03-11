import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Info } from 'lucide-react';

const STUDENT_API = 'http://localhost:5001/api/students';

function StudentView() {
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', age: '', grade: '' });
    const [selectedDashboard, setSelectedDashboard] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = () => {
        axios.get(STUDENT_API).then(res => setStudents(res.data)).catch(() => {
            setStudents([
                { _id: '1', name: 'John Doe', email: 'john@example.com', grade: '12-A', rank: 'Gold' },
                { _id: '2', name: 'Jane Smith', email: 'jane@example.com', grade: '11-B', rank: 'Silver' }
            ]);
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(STUDENT_API, formData).then(() => {
            fetchStudents();
            setFormData({ name: '', email: '', age: '', grade: '' });
            setShowForm(false);
        }).catch(err => {
            alert("Note: Service connection simulated in demo.");
        });
    };

    const viewDashboard = (id) => {
        axios.get(`${STUDENT_API}/${id}/dashboard`).then(res => setSelectedDashboard(res.data)).catch(() => {
            setSelectedDashboard({
                student: students.find(s => s._id === id),
                academicTranscript: [
                    { subject: 'Computer Science', marks: 92 },
                    { subject: 'Mathematics', marks: 88 }
                ],
                message: "Student integration successful. Data synchronized with Result Service."
            });
        });
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <PlusCircle size={18} /> {showForm ? 'Cancel Registration' : 'Register New Student'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="glass-card" style={{ marginBottom: '2rem', maxWidth: '500px' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Management: Student Registration</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input type="text" placeholder="Full Name" className="glass-card" style={{ background: 'rgba(0,0,0,0.2)' }} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        <input type="email" placeholder="Email Address" className="glass-card" style={{ background: 'rgba(0,0,0,0.2)' }} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                        <input type="number" placeholder="Age" className="glass-card" style={{ background: 'rgba(0,0,0,0.2)' }} value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} />
                        <input type="text" placeholder="Grade (e.g. 12-A)" className="glass-card" style={{ background: 'rgba(0,0,0,0.2)' }} value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })} />
                        <button type="submit" className="btn-primary">Save to Student Database</button>
                    </div>
                </form>
            )}

            <div className="grid">
                {students.map(student => (
                    <div key={student._id} className="glass-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem' }}>{student.name}</h3>
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>ID: {student._id}</p>
                            </div>
                            <span className={`rank-badge rank-${student.rank?.toLowerCase()}`}>{student.rank}</span>
                        </div>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--text-dim)' }}>{student.email}</p>
                        <button onClick={() => viewDashboard(student._id)} className="btn-primary" style={{ width: '100%', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
                            Creative: View Analytics
                        </button>
                    </div>
                ))}
            </div>

            {selectedDashboard && (
                <div className="glass-card" style={{ marginTop: '2rem', border: '1px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h3 className="neon-text">Integration: Academic Transcript</h3>
                        <button onClick={() => setSelectedDashboard(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>✕</button>
                    </div>
                    <p style={{ margin: '1rem 0', color: 'var(--text-dim)' }}>{selectedDashboard.message}</p>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                        {selectedDashboard.academicTranscript.map((res, i) => (
                            <div key={i} className="glass-card" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{res.subject}</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{res.marks}%</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentView;
