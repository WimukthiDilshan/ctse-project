const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;
const RESULT_SERVICE_URL = process.env.RESULT_SERVICE_URL || 'http://localhost:5004';

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_db')
    .then(() => console.log('Student DB Connected'))
    .catch(err => console.error('Student DB Connection Error:', err));

// Student Schema
const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: Number,
    grade: String,
    rank: { type: String, default: 'Bronze' } // Creative element: Rank/Badge
});

const Student = mongoose.model('Student', studentSchema);

// Routes
app.get('/health', (req, res) => res.send('Student Service is healthy'));

// Create Student
app.post('/api/students', async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).json(student);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get All Students
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Student Dashboard (Creative integration: Calls Result Service)
app.get('/api/students/:id/dashboard', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ error: 'Student not found' });

        // Fetch results from Result Service
        let academicTranscript = [];
        try {
            const response = await axios.get(`${RESULT_SERVICE_URL}/api/results/student/${req.params.id}`);
            academicTranscript = response.data;
        } catch (error) {
            console.error('Error fetching results:', error.message);
            academicTranscript = 'Results unavailable';
        }

        res.json({
            student,
            academicTranscript,
            message: `Welcome back, ${student.name}! Your current rank is ${student.rank}.`
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Rank (Called by Result Service)
app.patch('/api/students/:id/rank', async (req, res) => {
    try {
        const { rank } = req.body;
        const student = await Student.findByIdAndUpdate(req.params.id, { rank }, { new: true });
        res.json({ message: 'Rank updated', student });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Student (Internal)
app.get('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Student Service running on port ${PORT}`);
});
