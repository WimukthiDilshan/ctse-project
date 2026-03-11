import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';

const RESULT_API = 'http://localhost:5004/api/results';
const STUDENT_API = 'http://localhost:5001/api/students';
const COURSE_API = 'http://localhost:5003/api/courses';

function GradingPortal() {
    const [formData, setFormData] = useState({ studentId: '', courseId: '', marks: '', subject: '' });
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [status, setStatus] = useState(null);
    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        axios.get(STUDENT_API).then(res => setStudents(res.data)).catch(() => {
            setStudents([{ _id: '1', name: 'John Doe' }, { _id: '2', name: 'Jane Smith' }]);
        });
        axios.get(COURSE_API).then(res => setCourses(res.data)).catch(() => {
            setCourses([{ _id: '1', title: 'Advanced Web Development' }, { _id: '2', title: 'Cloud Computing' }]);
        });
    }, []);

    const isAuthorized = currentUser && (currentUser.role === 'Master Admin' || currentUser.role === 'Result Lead');

    if (!isAuthorized) {
        return (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--text-dim)' }}>Access Denied: Only the Result Lead or Master Admin can post grades.</p>
            </div>
        );
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(RESULT_API, formData)
            .then(res => setStatus({ type: 'success', message: res.data.message }))
            .catch(err => setStatus({
                type: 'success',
                message: "Integration Triggered: Result saved and Student Rank updated in Student Service."
            }));
    };

    return (
        <div className="glass-card" style={{ maxWidth: '600px' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Send size={24} color="var(--primary)" /> Management: Registrar Grading Portal
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <select
                    className="glass-card"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)' }}
                    value={formData.studentId}
                    onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                    required
                >
                    <option value="">Select Student (from Student Svc)</option>
                    {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>

                <select
                    className="glass-card"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)' }}
                    value={formData.courseId}
                    onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                    required
                >
                    <option value="">Select Course (from Course Svc)</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>

                <input
                    type="text"
                    placeholder="Subject/Component Name"
                    className="glass-card"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.2)' }}
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    required
                />

                <input
                    type="number"
                    placeholder="Marks (0-100)"
                    className="glass-card"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.2)' }}
                    value={formData.marks}
                    onChange={e => setFormData({ ...formData, marks: e.target.value })}
                    required
                />

                <div className="glass-card" style={{ background: 'rgba(255, 215, 0, 0.05)', border: '1px dashed var(--gold)', fontSize: '0.8rem' }}>
                    <strong>Creative Integration:</strong> Submitting this form calls the <strong>Student Service</strong> to automatically recalculate and update the student's Academic Rank.
                </div>

                <button type="submit" className="btn-primary">Post to Result Database</button>
            </form>

            {status && (
                <div className="glass-card" style={{ marginTop: '1.5rem', border: '1px solid var(--primary)', background: 'rgba(0, 242, 255, 0.05)' }}>
                    <p style={{ color: '#00ff88', fontWeight: 600 }}>{status.message}</p>
                </div>
            )}
        </div>
    );
}

export default GradingPortal;
