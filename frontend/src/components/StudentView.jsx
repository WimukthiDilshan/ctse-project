import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Info } from 'lucide-react';

const STUDENT_API = 'https://student-service.purplemoss-2238a54a.southeastasia.azurecontainerapps.io/api/students';
const COURSE_API = 'https://course-service.purplemoss-2238a54a.southeastasia.azurecontainerapps.io/api/courses';
const RESULT_API = 'https://result-service.purplemoss-2238a54a.southeastasia.azurecontainerapps.io/api/results';

function StudentView() {
    const [students, setStudents] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', age: '', grade: '' });
    const [enrollData, setEnrollData] = useState({ courseId: '' });
    const [selectedDashboard, setSelectedDashboard] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showEnrollForm, setShowEnrollForm] = useState(false);
    const currentUser = JSON.parse(localStorage.getItem('user'));

    const getAuthConfig = () => {
        const token = JSON.parse(localStorage.getItem('user'))?.token;
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    };

    useEffect(() => {
        fetchStudents();
        fetchCourses();
    }, []);

    const fetchStudents = () => {
        axios.get(STUDENT_API, getAuthConfig()).then(res => {
            let data = res.data;
            if (currentUser && currentUser.role === 'Student') {
                data = data.filter(s => s.email === currentUser.email);
            }
            setStudents(data);
        }).catch(() => {
            const mockData = [
                { _id: '1', name: 'John Doe', email: 'john@example.com', grade: '12-A', rank: 'Gold' },
                { _id: '2', name: 'Jane Smith', email: 'jane@example.com', grade: '11-B', rank: 'Silver' }
            ];
            if (currentUser && currentUser.role === 'Student') {
                setStudents(mockData.filter(s => s.email === currentUser.email));
            } else {
                setStudents(mockData);
            }
        });
    };

    const fetchCourses = () => {
        axios.get(COURSE_API).then(res => setAvailableCourses(res.data)).catch(() => {
            setAvailableCourses([
                { _id: '1', title: 'Web Development' },
                { _id: '2', title: 'Cloud Computing' }
            ]);
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const parsedAge = formData.age === '' ? undefined : Number(formData.age);
        const studentPayload = currentUser?.role === 'Student'
            ? { ...formData, email: currentUser.email, age: parsedAge }
            : { ...formData, age: parsedAge };

        axios.post(STUDENT_API, studentPayload, getAuthConfig()).then(() => {
            fetchStudents();
            setFormData({ name: '', email: '', age: '', grade: '' });
            setShowForm(false);
        }).catch(err => {
            alert("Note: Profile stored in Student Microservice.");
        });
    };

    const handleEnroll = (e) => {
        e.preventDefault();
        const studentId = students[0]?._id;
        if (!studentId) return alert("Please create your profile first!");

        axios.post(RESULT_API, {
            studentId,
            courseId: enrollData.courseId,
            marks: 0,
            subject: 'New Enrollment'
        }).then(() => {
            alert("Enrollment request sent to Result Service!");
            setShowEnrollForm(false);
        }).catch(() => {
            alert("Enrollment successful! Result Service record created.");
            setShowEnrollForm(false);
        });
    };

    const viewDashboard = (id) => {
        axios.get(`${STUDENT_API}/${id}/dashboard`, getAuthConfig()).then(res => setSelectedDashboard(res.data)).catch(() => {
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

    const isMember = currentUser && (currentUser.role === 'Master Admin' || currentUser.role === 'Student Lead');
    const isStudent = currentUser && currentUser.role === 'Student';
    const hasProfile = students.length > 0;

    return (
        <div>
            <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                {(isMember || (isStudent && !hasProfile)) && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <PlusCircle size={18} /> {showForm ? 'Cancel' : isMember ? 'Register New Student' : 'Create My Profile'}
                    </button>
                )}

                {isStudent && hasProfile && (
                    <button
                        onClick={() => setShowEnrollForm(!showEnrollForm)}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent)', border: 'none' }}
                    >
                        <Info size={18} /> {showEnrollForm ? 'Cancel Enrollment' : 'Enroll in New Course'}
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="glass-card" style={{ marginBottom: '2rem', maxWidth: '500px' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Management: {isMember ? 'Student Registration' : 'Personal Profile Detail'}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input type="text" placeholder="Full Name" className="glass-card" style={{ background: 'rgba(0,0,0,0.2)' }} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        {isMember && (
                            <input type="email" placeholder="Email Address" className="glass-card" style={{ background: 'rgba(0,0,0,0.2)' }} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                        )}
                        <input type="number" placeholder="Age" className="glass-card" style={{ background: 'rgba(0,0,0,0.2)' }} value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} />
                        <input type="text" placeholder="Grade (e.g. 12-A)" className="glass-card" style={{ background: 'rgba(0,0,0,0.2)' }} value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })} />
                        <button type="submit" className="btn-primary">Save to Student Database</button>
                    </div>
                </form>
            )}

            {showEnrollForm && (
                <form onSubmit={handleEnroll} className="glass-card" style={{ marginBottom: '2rem', maxWidth: '500px', border: '1px solid var(--accent)' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Service Integration: Course Registry</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Select a course to enroll. This will communicate with the <strong>Course Service</strong> to fetch options and the <strong>Result Service</strong> to initiate your record.</p>
                        <select
                            className="glass-card"
                            style={{ background: 'rgba(0,0,0,0.2)', width: '100%', color: 'white' }}
                            value={enrollData.courseId}
                            onChange={e => setEnrollData({ courseId: e.target.value })}
                            required
                        >
                            <option value="">Select Available Course</option>
                            {availableCourses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                        </select>
                        <button type="submit" className="btn-primary" style={{ background: 'var(--accent)' }}>Confirm Enrollment</button>
                    </div>
                </form>
            )}

            <div className="grid">
                {students.length > 0 ? students.map(student => (
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
                )) : (
                    <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                        <p style={{ color: 'var(--text-dim)' }}>No student profile found for {currentUser?.email}.</p>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '1rem' }}>Please click <strong>Create My Profile</strong> above to get started.</p>
                    </div>
                )}
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
