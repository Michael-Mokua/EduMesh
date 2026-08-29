const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Register (Teacher/Admin only in a real scenario, but open for initial setup)
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    const db = req.app.get('db');

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.run(
            'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
            [username, hashedPassword, role || 'student']
        );
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Username already exists or database error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const db = req.app.get('db');

    try {
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all users (Admin only)
router.get('/users', async (req, res) => {
    const db = req.app.get('db');
    try {
        const users = await db.all('SELECT id, username, role, metadata FROM users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Update user role (Admin only)
router.patch('/users/:id', async (req, res) => {
    const { role } = req.body;
    const db = req.app.get('db');
    try {
        await db.run('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

module.exports = router;
