import React, { useState, useEffect } from 'react';
import { Layout, Users, GraduationCap, BookOpen, BarChart3, PlusCircle } from 'lucide-react';
import StudentView from './components/StudentView';
import TeacherView from './components/TeacherView';
import CourseView from './components/CourseView';
import GradingPortal from './components/GradingPortal';

function App() {
    const [activeTab, setActiveTab] = useState('students');

    const navItems = [
        { id: 'students', label: 'Students', icon: Users },
        { id: 'teachers', label: 'Faculty', icon: GraduationCap },
        { id: 'courses', label: 'Curriculum', icon: BookOpen },
        { id: 'grading', label: 'Grading', icon: BarChart3 },
    ];

    return (
        <div className="app-container">
            <aside className="sidebar">
                <h1 className="neon-text" style={{ fontSize: '1.5rem', fontWeight: 700 }}>SMS DASHBOARD</h1>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {navItems.map((item) => (
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
            </aside>

            <main className="main-content">
                <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                            {navItems.find(n => n.id === activeTab).label}
                        </h2>
                        <p style={{ color: 'var(--text-dim)' }}>School Management Ecosystem v1.0</p>
                    </div>
                    <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 10px #00ff88' }}></div>
                        <span style={{ fontSize: '0.875rem' }}>All Systems Operational</span>
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
