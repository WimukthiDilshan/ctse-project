const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

const PORT = process.env.PORT || 5001;
const RESULT_SERVICE_URL = process.env.RESULT_SERVICE_URL || 'http://localhost:5004';
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || '';

function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

function requireServiceToken(req, res, next) {
    if (!INTERNAL_SERVICE_TOKEN) {
        return next();
    }

    const serviceToken = req.headers['x-service-token'];
    if (serviceToken !== INTERNAL_SERVICE_TOKEN) {
        return res.status(401).json({ error: 'Invalid service token' });
    }

    return next();
}

// MongoDB Connection
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_db')
        .then(() => console.log('Student DB Connected'))
        .catch(err => console.error('Student DB Connection Error:', err));
}

// Student Schema
const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: Number,
    grade: String,
    rank: { type: String, default: 'Bronze' } // Creative element: Rank/Badge
});

const Student = mongoose.model('Student', studentSchema);

// User Schema (Shared Auth Hub)
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Master Admin', 'Student', 'Teacher', 'Course Lead', 'Result Lead'], default: 'Student' }
});

const User = mongoose.model('User', userSchema);

// Routes
app.get('/health', (req, res) => res.send('Student Service is healthy'));

// Authentication Endpoints
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || password.length < 8) {
            return res.status(400).json({ error: 'Valid email and password (min 8 chars) are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, role });
        await user.save();
        res.status(201).json({ message: 'Registration Successful! You can now login.' });
    } catch (err) {
        res.status(400).json({ error: 'User already exists or invalid data' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ email: user.email, role: user.role, id: user._id, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Student
app.post('/api/students', authenticateJWT, async (req, res) => {
    try {
        const { name, email, age } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: 'name and email are required' });
        }
        if (age !== undefined && (typeof age !== 'number' || age < 0)) {
            return res.status(400).json({ error: 'age must be a non-negative number' });
        }

        const student = new Student(req.body);
        await student.save();
        res.status(201).json(student);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get All Students
app.get('/api/students', authenticateJWT, async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Student Dashboard (Creative integration: Calls Result Service)
app.get('/api/students/:id/dashboard', authenticateJWT, async (req, res) => {
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
app.patch('/api/students/:id/rank', requireServiceToken, async (req, res) => {
    try {
        const { rank } = req.body;
        const allowedRanks = ['Bronze', 'Silver', 'Gold'];
        if (!allowedRanks.includes(rank)) {
            return res.status(400).json({ error: 'rank must be one of Bronze, Silver, Gold' });
        }

        const student = await Student.findByIdAndUpdate(req.params.id, { rank }, { new: true });
        res.json({ message: 'Rank updated', student });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Student (Internal)
app.get('/api/students/:id', requireServiceToken, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Student Service running on port ${PORT}`);
    });
}

module.exports = app;
