const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    }
}));
app.use(helmet());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

const PORT = process.env.PORT || 5004;
const STUDENT_SERVICE_URL = process.env.STUDENT_SERVICE_URL || 'http://localhost:5001';

// MongoDB Connection
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/result_db')
        .then(() => console.log('Result DB Connected'))
        .catch(err => console.error('Result DB Connection Error:', err));
}

// Result Schema
const resultSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, required: true },
    marks: { type: Number, required: true },
    subject: String
});

const Result = mongoose.model('Result', resultSchema);

// Routes
app.get('/health', (req, res) => res.send('Result Service is healthy'));

// Post Result (Creative integration: Triggers Rank Update in Student Service)
app.post('/api/results', async (req, res) => {
    try {
        const { studentId, courseId, marks, subject } = req.body;
        if (!studentId || !courseId || typeof marks !== 'number' || !subject) {
            return res.status(400).json({ error: 'studentId, courseId, numeric marks, and subject are required' });
        }
        if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ error: 'studentId and courseId must be valid ObjectIds' });
        }
        if (marks < 0 || marks > 100) {
            return res.status(400).json({ error: 'marks must be between 0 and 100' });
        }

        // 1. Save result
        const result = new Result({ studentId, courseId, marks, subject });
        await result.save();

        // 2. Determine new rank based on marks (Creative Logic)
        let rank = 'Bronze';
        if (marks >= 85) rank = 'Gold';
        else if (marks >= 70) rank = 'Silver';

        // 3. Update student rank in Student Service
        try {
            await axios.patch(`${STUDENT_SERVICE_URL}/api/students/${studentId}/rank`, { rank });
        } catch (error) {
            console.error('Failed to update student rank:', error.message);
        }

        res.status(201).json({ result, message: `Result posted. Student rank updated to ${rank}.` });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get results for a student (Used by Student Service Dashboard)
app.get('/api/results/student/:studentId', async (req, res) => {
    try {
        const results = await Result.find({ studentId: req.params.studentId });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get stats for a subject (Used by Teacher Service Stats)
app.get('/api/results/stats/subject/:subject', async (req, res) => {
    try {
        const stats = await Result.aggregate([
            { $match: { subject: req.params.subject } },
            {
                $group: {
                    _id: "$subject",
                    averageMarks: { $avg: "$marks" },
                    highestMarks: { $max: "$marks" },
                    studentCount: { $sum: 1 }
                }
            }
        ]);
        res.json(stats[0] || { message: 'No data found for this subject' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Result Service running on port ${PORT}`);
    });
}

module.exports = app;
