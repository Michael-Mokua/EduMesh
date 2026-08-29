const express = require('express');
const router = express.Router();

// Get all subjects
router.get('/subjects', async (req, res) => {
    const db = req.app.get('db');
    try {
        const subjects = await db.all('SELECT * FROM subjects');
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Get content for a subject
router.get('/subjects/:id/content', async (req, res) => {
    const db = req.app.get('db');
    try {
        const content = await db.all('SELECT * FROM content WHERE subject_id = ?', [req.params.id]);
        res.json(content);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Get quiz for a specific content item
router.get('/quizzes/:id', async (req, res) => {
    const db = req.app.get('db');
    try {
        const quiz = await db.get('SELECT * FROM quizzes WHERE content_id = ?', [req.params.id]);
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
        res.json({
            ...quiz,
            data_json: JSON.parse(quiz.data_json)
        });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Add new content (Teacher/Admin only)
router.post('/', async (req, res) => {
    const db = req.app.get('db');
    const { subject_id, title, type, body, file_url } = req.body;

    try {
        const result = await db.run(
            'INSERT INTO content (subject_id, title, type, body, file_url, version) VALUES (?, ?, ?, ?, ?, 1)',
            [subject_id, title, type, body, file_url]
        );
        console.log(`Content created: ${title} (ID: ${result.lastID})`);
        res.status(201).json({ id: result.lastID, message: 'Content created successfully' });
    } catch (error) {
        console.error('Content creation error:', error);
        res.status(500).json({ error: 'Failed to create content' });
    }
});

// Seed data route (Teacher/Admin only in production)
router.post('/seed', async (req, res) => {
    const db = req.app.get('db');
    try {
        const subjects = [
            ['Mathematics', 'Universal language of patterns and logic'],
            ['Science', 'Exploring the physical and natural world'],
            ['History', 'The story of humanity through the ages'],
            ['Geography', 'The world and how it works'],
            ['Arts', 'Exploration of creativity and expression']
        ];

        for (const [name, desc] of subjects) {
            await db.run('INSERT OR IGNORE INTO subjects (name, description) VALUES (?, ?)', [name, desc]);
        }

        const math = await db.get('SELECT id FROM subjects WHERE name = ?', ['Mathematics']);
        const science = await db.get('SELECT id FROM subjects WHERE name = ?', ['Science']);

        const lessons = [
            [math.id, 'Introduction to Algebra', 'lesson', 'Algebra is about finding the unknown...'],
            [math.id, 'Geometry Basics', 'lesson', 'Angles, shapes, and triangles.'],
            [science.id, 'Cell Structure', 'lesson', 'The microscopic building blocks of life.'],
            [science.id, 'Laws of Motion', 'lesson', 'Newtonian physics and gravity.']
        ];

        for (const [sid, title, type, body] of lessons) {
            await db.run('INSERT OR IGNORE INTO content (subject_id, title, type, body, version) VALUES (?, ?, ?, ?, 1)', [sid, title, type, body]);
        }

        // Add a mock quiz
        const algebra = await db.get('SELECT id FROM content WHERE title = ?', ['Introduction to Algebra']);
        if (algebra) {
            await db.run('INSERT OR IGNORE INTO quizzes (content_id, title, data_json, version) VALUES (?, ?, ?, 1)',
                [algebra.id, 'Algebra Quiz 1', JSON.stringify([
                    { text: "What is 2x + 5 = 15?", options: ["x=5", "x=10", "x=20", "x=30"], correct: 0 },
                    { text: "If y = 3x, and x = 2, what is y?", options: ["4", "5", "6", "8"], correct: 2 }
                ])]
            );
        }

        res.json({ message: 'Digital Playground seeded successfully' });
    } catch (error) {
        console.error('Seeding error:', error);
        res.status(500).json({ error: 'Failed to seed data' });
    }
});

// Teacher Analytics
router.get('/analytics/teacher', async (req, res) => {
    const db = req.app.get('db');
    try {
        const studentCount = await db.get('SELECT COUNT(*) as count FROM users WHERE role = ?', ['student']);
        const submissionCount = await db.get('SELECT COUNT(*) as count FROM quiz_submissions');
        const avgScore = await db.get('SELECT AVG(score) as avg FROM quiz_submissions');

        res.json({
            students: studentCount.count,
            submissions: submissionCount.count,
            avgScore: Math.round(avgScore.avg || 0),
            attendance: '94%' // Mocked for now as we don't have attendance table yet
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// Create new subject (Admin only)
router.post('/subjects', async (req, res) => {
    const db = req.app.get('db');
    const { name, description } = req.body;
    try {
        const result = await db.run('INSERT INTO subjects (name, description) VALUES (?, ?)', [name, description]);
        res.status(201).json({ id: result.lastID, message: 'Subject created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create subject' });
    }
});

// Create new quiz (Teacher only)
router.post('/quizzes', async (req, res) => {
    const db = req.app.get('db');
    const { content_id, title, data_json } = req.body;
    try {
        const result = await db.run(
            'INSERT INTO quizzes (content_id, title, data_json, version) VALUES (?, ?, ?, 1)',
            [content_id, title, typeof data_json === 'string' ? data_json : JSON.stringify(data_json)]
        );
        console.log(`Quiz created: ${title} (ID: ${result.lastID})`);
        res.status(201).json({ id: result.lastID, message: 'Quiz created successfully' });
    } catch (error) {
        console.error('Quiz creation error:', error);
        res.status(500).json({ error: 'Failed to create quiz' });
    }
});

module.exports = router;
