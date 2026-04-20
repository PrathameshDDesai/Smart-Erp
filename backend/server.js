require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
    res.send('Welcome to the College ERP API!');
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'College ERP API is running ✅' });
});

// --- Mount Routes ---
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const facultyRoutes = require('./routes/faculty');
const attendanceRoutes = require('./routes/attendance');
const marksRoutes = require('./routes/marks');
const feesRoutes = require('./routes/fees');
const deptRoutes = require('./routes/departments');
const subjectRoutes = require('./routes/subjects');
const aiRoutes = require('./routes/ai');
const examsRoutes = require('./routes/exams');

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/departments', deptRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/exams', examsRoutes);

// 404 fallback
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
