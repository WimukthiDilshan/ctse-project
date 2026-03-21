const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

const PORT = process.env.PORT || 5003;
const TEACHER_SERVICE_URL = process.env.TEACHER_SERVICE_URL || 'http://localhost:5002';

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/course_db')
    .then(() => console.log('Course DB Connected'))
    .catch(err => console.error('Course DB Connection Error:', err));

// Course Schema
const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    credits: Number,
    teacherId: mongoose.Schema.Types.ObjectId
});

const Course = mongoose.model('Course', courseSchema);

// Routes
app.get('/health', (req, res) => res.send('Course Service is healthy'));

// Create Course
app.post('/api/courses', async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.status(201).json(course);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get All Courses
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Full Course Info (Creative integration: Fetches Faculty Bio from Teacher Service)
app.get('/api/courses/:id/full-info', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: 'Course not found' });

        // Fetch Teacher bio from Teacher Service
        let facultyInfo = null;
        if (course.teacherId) {
            try {
                const response = await axios.get(`${TEACHER_SERVICE_URL}/api/teachers/${course.teacherId}`);
                facultyInfo = response.data;
            } catch (error) {
                console.error('Error fetching teacher info:', error.message);
                facultyInfo = { name: 'Unknown', bio: 'Bio temporarily unavailable' };
            }
        }

        res.json({
            course,
            facultyInfo,
            curriculumNote: `This course is curated by ${facultyInfo ? facultyInfo.name : 'our expert faculty'}.`
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Course (Internal/Internal Validation)
app.get('/api/courses/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: 'Course not found' });
        res.json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Course Service running on port ${PORT}`);
});
