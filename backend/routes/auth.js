const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { userId: user.user_id, role: user.role },
            process.env.JWT_SECRET || 'supersecretjwtkey_12345',
            { expiresIn: '1d' }
        );
        res.json({ token, role: user.role, userId: user.user_id, email: user.email });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/auth/register (Admin only — create any user type)
router.post('/register', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    const { email, password, role } = req.body;
    if (!['ADMIN', 'FACULTY', 'STUDENT'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Must be ADMIN, FACULTY, or STUDENT' });
    }
    try {
        const hash = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            'INSERT INTO Users (email, password_hash, role) VALUES (?, ?, ?)',
            [email, hash, role]
        );
        res.status(201).json({ message: 'User registered', userId: result.insertId });
    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/auth/me — get current user info
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT user_id, email, role, created_at FROM Users WHERE user_id = ?',
            [req.user.userId]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
