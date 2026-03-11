import React, { useState, useEffect } from 'react';
import { Layout, Users, GraduationCap, BookOpen, BarChart3, PlusCircle } from 'lucide-react';
import StudentView from './components/StudentView';
import TeacherView from './components/TeacherView';
import CourseView from './components/CourseView';
import GradingPortal from './components/GradingPortal';
import AuthView from './components/AuthView';
import { LogOut } from 'lucide-react';

function App() {
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [activeTab, setActiveTab] = useState('students');

    const allNavItems = [
        { id: 'students', label: 'Student Hub', icon: Users, roles: ['Master Admin', 'Student'] },
        { id: 'teachers', label: 'Teacher Command', icon: GraduationCap, roles: ['Master Admin', 'Teacher'] },
        { id: 'courses', label: 'Course Navigator', icon: BookOpen, roles: ['Master Admin', 'Course Lead'] },
        { id: 'grading', label: 'Grading Portal', icon: BarChart3, roles: ['Master Admin', 'Result Lead'] },
    ];

    const filteredNav = allNavItems.filter(item =>
        currentUser && (currentUser.role === 'Master Admin' || item.roles.includes(currentUser.role))
    );

    useEffect(() => {
        if (filteredNav.length > 0 && !filteredNav.find(n => n.id === activeTab)) {
            setActiveTab(filteredNav[0].id);
        }
    }, [currentUser]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setCurrentUser(null);
    };

    if (!currentUser) {
        return <AuthView onLoginSuccess={(user) => setCurrentUser(user)} />;
    }

    return (
        <div className="app-container">
            <aside className="sidebar">
                <h1 className="neon-text" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>SMS CONSOLE</h1>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {filteredNav.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`glass-card`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                border: activeTab === item.id ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                                background: activeTab === item.id ? 'rgba(0, 242, 255, 0.05)' : 'transparent',
                                textAlign: 'left',
                                width: '100%',
                                cursor: 'pointer',
                                borderRadius: '1rem',
                                padding: '1rem'
                            }}
                        >
                            <item.icon size={20} color={activeTab === item.id ? 'var(--primary)' : 'var(--text-dim)'} />
                            <span style={{ color: activeTab === item.id ? 'var(--text-main)' : 'var(--text-dim)' }}>
                                {item.label}
                            </span>
                        </button>
                    ))}
                </nav>

                <button
                    onClick={handleLogout}
                    className="glass-card"
                    style={{
                        marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '1rem', width: '100%', cursor: 'pointer', border: '1px solid rgba(255,77,77,0.3)'
                    }}
                >
                    <LogOut size={20} color="#ff4d4d" />
                    <span style={{ color: '#ff4d4d' }}>Logout</span>
                </button>
            </aside>

            <main className="main-content">
                <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                            {allNavItems.find(n => n.id === activeTab)?.label}
                        </h2>
                        <p style={{ color: 'var(--text-dim)' }}>Authenticated as: <span style={{ color: 'var(--primary)' }}>{currentUser.email}</span> ({currentUser.role})</p>
                    </div>
                    <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 10px #00ff88' }}></div>
                        <span style={{ fontSize: '0.875rem' }}>Security Layer Active</span>
                    </div>
                </header>

                {activeTab === 'students' && <StudentView />}
                {activeTab === 'teachers' && <TeacherView />}
                {activeTab === 'courses' && <CourseView />}
                {activeTab === 'grading' && <GradingPortal />}
            </main>
        </div>
    );
}

export default App;
