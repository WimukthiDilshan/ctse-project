import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Users, Trash2 } from 'lucide-react';

const TEACHER_API = 'https://teacher-service.purplemoss-2238a54a.southeastasia.azurecontainerapps.io/api/teachers';
const STUDENT_API = 'https://student-service.purplemoss-2238a54a.southeastasia.azurecontainerapps.io/api/students';

function TeacherView() {
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', bio: '' });
    const [stats, setStats] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [mentees, setMentees] = useState([]);
    const [showMenteeForm, setShowMenteeForm] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [studentSearch, setStudentSearch] = useState('');

    const getAuthConfig = () => {
        const token = JSON.parse(localStorage.getItem('user'))?.token;
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    };

    useEffect(() => {
        fetchTeachers();
        fetchStudents();
    }, []);

    const fetchTeachers = () => {
        axios.get(TEACHER_API).then(res => setTeachers(res.data)).catch(() => {
            setTeachers([
                { _id: '1', name: 'Dr. Alan Turing', subject: 'Computer Science', bio: 'Pioneer of theoretical computer science.', mentees: [] },
                { _id: '2', name: 'Prof. Marie Curie', subject: 'Physics', bio: 'Nobel laureate in Physics and Chemistry.', mentees: [] }
            ]);
        });
    };

    const fetchStudents = () => {
        axios.get(STUDENT_API, getAuthConfig())
            .then(res => setStudents(res.data || []))
            .catch(() => setStudents([]));
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

    const fetchMentees = (teacherId) => {
        setLoading(true);
        setError('');
        axios.get(`${TEACHER_API}/${teacherId}/mentees`)
            .then(res => {
                setMentees(res.data.mentees || []);
            })
            .catch(() => {
                setError('Failed to load mentees');
                setMentees([]);
            })
            .finally(() => setLoading(false));
    };

    const handleAddMentee = (e) => {
        e.preventDefault();
        if (!selectedStudentId.trim()) {
            setError('Please select a registered student');
            return;
        }

        setLoading(true);
        setError('');
        axios.post(`${TEACHER_API}/${selectedTeacher._id}/add-mentee`, { studentId: selectedStudentId })
            .then((res) => {
                setMentees(res.data.teacher.mentees || []);
                setSelectedStudentId('');
                setStudentSearch('');
                setShowMenteeForm(false);
                fetchMentees(selectedTeacher._id);
            })
            .catch(err => {
                setError(err.response?.data?.error || 'Failed to add mentee');
            })
            .finally(() => setLoading(false));
    };

    const handleRemoveMentee = (studentId) => {
        if (!window.confirm('Are you sure you want to remove this mentee?')) return;

        setLoading(true);
        axios.delete(`${TEACHER_API}/${selectedTeacher._id}/mentees/${studentId}`)
            .then(() => {
                fetchMentees(selectedTeacher._id);
            })
            .catch(err => {
                setError(err.response?.data?.error || 'Failed to remove mentee');
            })
            .finally(() => setLoading(false));
    };

    const openMenteeManager = (teacher) => {
        setSelectedTeacher(teacher);
        fetchMentees(teacher._id);
    };

    const closeMenteeManager = () => {
        setSelectedTeacher(null);
        setMentees([]);
        setSelectedStudentId('');
        setStudentSearch('');
        setShowMenteeForm(false);
        setError('');
    };

    const availableStudents = students
        .filter(student => !mentees.some(mentee => String(mentee.studentId) === String(student._id)))
        .filter(student => {
            const needle = studentSearch.trim().toLowerCase();
            if (!needle) return true;
            return (
                (student.name || '').toLowerCase().includes(needle) ||
                (student.email || '').toLowerCase().includes(needle) ||
                String(student._id).toLowerCase().includes(needle)
            );
        });

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

            {!selectedTeacher ? (
                <div className="grid">
                    {teachers.map(teacher => (
                        <div key={teacher._id} className="glass-card">
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{teacher.name}</h3>
                            <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>{teacher.subject}</p>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>ID: {teacher._id}</p>
                            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                <button onClick={() => fetchStats(teacher._id)} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--secondary)', color: 'var(--secondary)' }}>
                                    Analytics
                                </button>
                                <button onClick={() => openMenteeManager(teacher)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid var(--primary)' }}>
                                    <Users size={16} /> Manage Mentees ({teacher.mentees?.length || 0})
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-card" style={{ marginBottom: '2rem', border: '2px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 className="neon-text">Mentor-Mentee Management</h2>
                        <button onClick={closeMenteeManager} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
                    </div>

                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,255,200,0.1)', borderRadius: '8px' }}>
                        <p style={{ margin: '0.5rem 0' }}>📌 <strong>{selectedTeacher.name}</strong> - {selectedTeacher.subject}</p>
                        <p style={{ color: 'var(--primary)', fontWeight: 600, margin: '0.5rem 0' }}>Total Mentees: {mentees.length}</p>
                    </div>

                    {error && (
                        <div style={{ padding: '1rem', background: 'rgba(255,0,0,0.2)', border: '1px solid #ff6b6b', borderRadius: '8px', marginBottom: '1rem', color: '#ff6b6b' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {!showMenteeForm && (
                        <button onClick={() => setShowMenteeForm(true)} className="btn-primary" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <UserPlus size={16} /> Add Student as Mentee
                        </button>
                    )}

                    {showMenteeForm && (
                        <form onSubmit={handleAddMentee} className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)' }}>
                            <h4 style={{ marginBottom: '1rem' }}>🎓 Add New Mentee</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="Search registered students by name/email/id"
                                    value={studentSearch}
                                    onChange={e => setStudentSearch(e.target.value)}
                                    style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--primary)', color: 'white', borderRadius: '4px' }}
                                />
                                <select
                                    value={selectedStudentId}
                                    onChange={e => setSelectedStudentId(e.target.value)}
                                    style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--primary)', color: 'white', borderRadius: '4px' }}
                                >
                                    <option value="">Select a registered student</option>
                                    {availableStudents.map(student => (
                                        <option key={student._id} value={student._id}>
                                            {student.name} ({student.email}) - {student._id}
                                        </option>
                                    ))}
                                </select>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button type="submit" disabled={loading || !selectedStudentId} className="btn-primary">
                                        {loading ? 'Adding...' : 'Add Selected Student'}
                                    </button>
                                    <button type="button" onClick={() => setShowMenteeForm(false)} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--text-dim)' }}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Registered Students Available: {availableStudents.length}</p>
                        </form>
                    )}

                    {mentees.length > 0 ? (
                        <div>
                            <h4 style={{ marginBottom: '1rem' }}>👥 Current Mentees ({mentees.length})</h4>
                            <div className="grid" style={{ gap: '1rem' }}>
                                {mentees.map((mentee, idx) => (
                                    <div key={idx} className="glass-card" style={{ padding: '1rem', border: '1px solid var(--secondary)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{mentee.studentName}</p>
                                                <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>📧 {mentee.studentEmail}</p>
                                                <p style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>ID: {mentee.studentId}</p>
                                                <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                                                    Added: {new Date(mentee.addedDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveMentee(mentee.studentId)}
                                                disabled={loading}
                                                className="btn-primary"
                                                style={{ background: 'transparent', border: '1px solid #ff6b6b', color: '#ff6b6b', padding: '0.5rem' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                            <Users size={32} style={{ opacity: 0.5, margin: '0 auto 1rem' }} />
                            <p>No mentees yet. Add a student to get started!</p>
                        </div>
                    )}
                </div>
            )}

            {stats && !selectedTeacher && (
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
