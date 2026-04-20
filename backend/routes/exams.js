const express = require('express');
const router = express.Router();
const db = require('../config/db');

let activeExam = null; // Mock memory database for the dynamic exam

// GET /api/exams/active
router.get('/active', (req, res) => {
    if (activeExam) {
        res.json({ success: true, exam: activeExam });
    } else {
        res.json({ success: false, message: 'No active exam.' });
    }
});

// POST /api/exams/create
router.post('/create', (req, res) => {
    const { title, duration, questions } = req.body;
    activeExam = { title, duration, questions };
    console.log(`[EXAM] New exam created: ${title}`);
    res.json({ success: true, message: 'Exam Published!' });
});

// POST /api/exams/submit
router.post('/submit', async (req, res) => {
    const { studentPrn, subject, score, aiViolations } = req.body;

    try {
        console.log(`[AI PROCTOR] Received exam submission from ${studentPrn}. Violations: ${aiViolations}`);
        // Simulate saving to DB
        // In a real system, you'd insert into an Exams table.
        res.json({ success: true, message: 'Exam submitted successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to submit exam.' });
    }
});

module.exports = router;
