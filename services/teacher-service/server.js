const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5002;
const RESULT_SERVICE_URL = process.env.RESULT_SERVICE_URL || 'http://localhost:5004';
const STUDENT_SERVICE_URL = process.env.STUDENT_SERVICE_URL || 'http://localhost:5001';

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/teacher_db')
    .then(() => console.log('Teacher DB Connected'))
    .catch(err => console.error('Teacher DB Connection Error:', err));

// Teacher Schema with Mentee Management
const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    subject: String,
    bio: String,
    mentees: [
        {
            studentId: { type: mongoose.Schema.Types.ObjectId, required: true },
            studentName: String,
            studentEmail: String,
            addedDate: { type: Date, default: Date.now }
        }
    ]
});

const Teacher = mongoose.model('Teacher', teacherSchema);

// Routes
app.get('/health', (req, res) => res.send('Teacher Service is healthy'));

// Create Teacher
app.post('/api/teachers', async (req, res) => {
    try {
        const teacher = new Teacher(req.body);
        await teacher.save();
        res.status(201).json(teacher);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get All Teachers
app.get('/api/teachers', async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Class Stats (Creative integration: Aggregates from Result Service)
app.get('/api/teachers/:id/class-stats', async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

        // Fetch aggregation stats from Result Service
        let stats = {};
        try {
            const response = await axios.get(`${RESULT_SERVICE_URL}/api/results/stats/subject/${teacher.subject}`);
            stats = response.data;
        } catch (error) {
            console.error('Error fetching stats:', error.message);
            stats = { message: 'Performance statistics currently unavailable' };
        }

        res.json({
            teacher: { name: teacher.name, subject: teacher.subject },
            stats,
            insight: `As a teacher of ${teacher.subject}, here is your class performance overview.`
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Teacher info (Used by Course Service)
app.get('/api/teachers/:id', async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
        res.json(teacher);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add Student as Mentee (Teacher registers students as mentees)
app.post('/api/teachers/:id/add-mentee', async (req, res) => {
    try {
        const { studentId } = req.body;
        if (!studentId) return res.status(400).json({ error: 'Student ID is required' });

        // Verify student exists in Student Service
        let studentData;
        try {
            const response = await axios.get(`${STUDENT_SERVICE_URL}/api/students/${studentId}`);
            studentData = response.data;
        } catch (error) {
            return res.status(404).json({ error: 'Student not found in Student Service' });
        }

        // Find teacher
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

        // Check if student is already a mentee
        const existingMentee = teacher.mentees.find(m => m.studentId.toString() === studentId);
        if (existingMentee) {
            return res.status(400).json({ error: 'Student is already a mentee of this teacher' });
        }

        // Add student as mentee
        teacher.mentees.push({
            studentId: studentData._id,
            studentName: studentData.name,
            studentEmail: studentData.email,
            addedDate: new Date()
        });

        await teacher.save();
        res.status(201).json({
            message: `${studentData.name} has been added as a mentee`,
            teacher: teacher
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Mentees of a Teacher
app.get('/api/teachers/:id/mentees', async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

        res.json({
            teacherId: teacher._id,
            teacherName: teacher.name,
            teacherSubject: teacher.subject,
            menteeCount: teacher.mentees.length,
            mentees: teacher.mentees
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Remove Student as Mentee
app.delete('/api/teachers/:id/mentees/:studentId', async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

        // Find and remove mentee
        const menteeIndex = teacher.mentees.findIndex(m => m.studentId.toString() === req.params.studentId);
        if (menteeIndex === -1) {
            return res.status(404).json({ error: 'Mentee not found' });
        }

        const removedMentee = teacher.mentees.splice(menteeIndex, 1);
        await teacher.save();

        res.json({
            message: `${removedMentee[0].studentName} has been removed as a mentee`,
            teacher: teacher
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Teacher with Mentees Dashboard
app.get('/api/teachers/:id/dashboard', async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

        // Fetch class stats
        let stats = {};
        try {
            const response = await axios.get(`${RESULT_SERVICE_URL}/api/results/stats/subject/${teacher.subject}`);
            stats = response.data;
        } catch (error) {
            stats = { message: 'Statistics unavailable' };
        }

        res.json({
            teacher: {
                id: teacher._id,
                name: teacher.name,
                email: teacher.email,
                subject: teacher.subject,
                bio: teacher.bio
            },
            mentees: teacher.mentees,
            menteeCount: teacher.mentees.length,
            classStats: stats,
            message: `Welcome ${teacher.name}! You are mentoring ${teacher.mentees.length} student(s).`
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Teacher Service running on port ${PORT}`);
});
