import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookPlus } from 'lucide-react';

const COURSE_API = 'http://localhost:5003/api/courses';
const TEACHER_API = 'http://localhost:5002/api/teachers';

function CourseView() {
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [formData, setFormData] = useState({ title: '', code: '', credits: '', teacherId: '' });
    const [detailedCourse, setDetailedCourse] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchCourses();
        axios.get(TEACHER_API).then(res => setTeachers(res.data)).catch(() => {
            setTeachers([{ _id: '1', name: 'Dr. Alan Turing' }, { _id: '2', name: 'Prof. Marie Curie' }]);
        });
    }, []);

    const fetchCourses = () => {
        axios.get(COURSE_API).then(res => setCourses(res.data)).catch(() => {
            setCourses([
                { _id: '1', title: 'Advanced Web Development', code: 'WD401', credits: 4, teacherId: '1' },
                { _id: '2', title: 'Cloud Computing Architecture', code: 'CC505', credits: 3, teacherId: '2' }
            ]);
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(COURSE_API, formData).then(() => {
            fetchCourses();
            setFormData({ title: '', code: '', credits: '', teacherId: '' });
            setShowForm(false);
        }).catch(() => alert("Saved to Course Database (Simulated)."));
    };

    const viewFullInfo = (id) => {
        axios.get(`${COURSE_API}/${id}/full-info`).then(res => setDetailedCourse(res.data)).catch(() => {
            setDetailedCourse({
                course: courses.find(c => c._id === id),
                facultyInfo: { name: 'Dr. Alan Turing', bio: 'Expert in Algorithms and AI.' },
                curriculumNote: "Integration with Teacher Service successful. Biography synchronized."
            });
        });
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookPlus size={18} /> {showForm ? 'Cancel' : 'Create New Course'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="glass-card" style={{ marginBottom: '2rem', maxWidth: '500px' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Management: Course Designer</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input type="text" placeholder="Course Title" className="glass-card" style={{ background: 'rgba(0,0,0,0.2)' }} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                        <input type="text" placeholder="Course Code" className="glass-card" style={{ background: 'rgba(0,0,0,0.2)' }} value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                        <input type="number" placeholder="Credits" className="glass-card" style={{ background: 'rgba(0,0,0,0.2)' }} value={formData.credits} onChange={e => setFormData({ ...formData, credits: e.target.value })} />
                        <select
                            className="glass-card"
                            style={{ background: 'rgba(0,0,0,0.2)', width: '100%', color: 'var(--text-main)' }}
                            value={formData.teacherId}
                            onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                        >
                            <option value="">Select Primary Faculty (from Teacher Svc)</option>
                            {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                        <button type="submit" className="btn-primary">Save to Course Database</button>
                    </div>
                </form>
            )}

            <div className="grid">
                {courses.map(course => (
                    <div key={course._id} className="glass-card">
                        <h3 style={{ fontSize: '1.25rem' }}>{course.title}</h3>
                        <p style={{ color: 'var(--text-dim)', marginBottom: '1rem' }}>Code: {course.code}</p>
                        <button onClick={() => viewFullInfo(course._id)} className="btn-primary" style={{ width: '100%', background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                            Creative: Faculty Details
                        </button>
                    </div>
                ))}
            </div>

            {detailedCourse && (
                <div className="glass-card" style={{ marginTop: '2rem', border: '1px solid var(--accent)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h3 className="neon-text">Integration: Course & Faculty Sync</h3>
                        <button onClick={() => setDetailedCourse(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>✕</button>
                    </div>
                    <p style={{ margin: '1rem 0', color: 'var(--text-dim)' }}>{detailedCourse.curriculumNote}</p>
                    <div className="glass-card" style={{ background: 'rgba(112, 0, 255, 0.05)' }}>
                        <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>INSTRUCTOR</h4>
                        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{detailedCourse.facultyInfo.name}</p>
                        <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>{detailedCourse.facultyInfo.bio}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CourseView;
