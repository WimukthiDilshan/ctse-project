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

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/teacher_db')
    .then(() => console.log('Teacher DB Connected'))
    .catch(err => console.error('Teacher DB Connection Error:', err));

// Teacher Schema
const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    subject: String,
    bio: String
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

app.listen(PORT, () => {
    console.log(`Teacher Service running on port ${PORT}`);
});
