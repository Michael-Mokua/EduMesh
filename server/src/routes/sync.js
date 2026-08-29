const express = require('express');
const router = express.Router();

// ── JWT middleware stub (checks Authorization header) ─────────────
function auth(req, res, next) {
    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    // In production: verify JWT. For dev, just pass through.
    next();
}

// ─── ATTENDANCE ──────────────────────────────────────────────────

// Record attendance (teacher)
router.post('/attendance/record', auth, async (req, res) => {
    const db = req.app.get('db');
    const { student_id, teacher_id, date, status, note } = req.body;
    try {
        await db.run(
            `INSERT OR REPLACE INTO attendance (student_id, teacher_id, date, status, note, synced)
             VALUES (?, ?, ?, ?, ?, 1)`,
            [student_id, teacher_id, date, status, note || null]
        );
        res.status(201).json({ message: 'Attendance recorded' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get attendance for a student
router.get('/attendance/student/:id', auth, async (req, res) => {
    const db = req.app.get('db');
    try {
        const rows = await db.all(
            'SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC LIMIT 60',
            [req.params.id]
        );
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get attendance for a class on a date range (teacher)
router.get('/attendance/class', auth, async (req, res) => {
    const db = req.app.get('db');
    const { teacher_id, from, to } = req.query;
    try {
        const rows = await db.all(
            `SELECT a.*, u.username, u.display_name FROM attendance a
             JOIN users u ON u.id = a.student_id
             WHERE a.teacher_id = ? AND a.date BETWEEN ? AND ?
             ORDER BY a.date DESC`,
            [teacher_id, from, to]
        );
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── MESSAGES ────────────────────────────────────────────────────

// Send a message (queued offline)
router.post('/messages/send', auth, async (req, res) => {
    const db = req.app.get('db');
    const { sender_id, recipient_id, body, thread_id } = req.body;
    try {
        const result = await db.run(
            `INSERT INTO messages (sender_id, recipient_id, body, thread_id, synced, created_at)
             VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
            [sender_id, recipient_id, body, thread_id || null]
        );
        res.status(201).json({ id: result.lastID });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get inbox for a user
router.get('/messages/inbox/:userId', auth, async (req, res) => {
    const db = req.app.get('db');
    try {
        const rows = await db.all(
            `SELECT m.*, u.username as sender_name, u.display_name as sender_display
             FROM messages m JOIN users u ON u.id = m.sender_id
             WHERE m.recipient_id = ? ORDER BY m.created_at DESC LIMIT 50`,
            [req.params.userId]
        );
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── BADGES ──────────────────────────────────────────────────────

// Award a badge
router.post('/badges/award', auth, async (req, res) => {
    const db = req.app.get('db');
    const { user_id, badge_type, badge_level } = req.body;
    try {
        await db.run(
            `INSERT OR IGNORE INTO badges (user_id, badge_type, badge_level) VALUES (?, ?, ?)`,
            [user_id, badge_type, badge_level || 'bronze']
        );
        res.status(201).json({ message: 'Badge awarded' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get badges for a user
router.get('/badges/user/:id', auth, async (req, res) => {
    const db = req.app.get('db');
    try {
        const badges = await db.all('SELECT * FROM badges WHERE user_id = ?', [req.params.id]);
        res.json(badges);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── ANALYTICS ───────────────────────────────────────────────────

// Batch ingest analytics events
router.post('/analytics/batch', auth, async (req, res) => {
    const db = req.app.get('db');
    const { events } = req.body;
    if (!Array.isArray(events)) return res.status(400).json({ error: 'events must be array' });
    try {
        for (const e of events) {
            await db.run(
                `INSERT INTO analytics_events (user_id, event_type, payload, timestamp) VALUES (?, ?, ?, ?)`,
                [e.user_id, e.event_type, JSON.stringify(e.payload || {}), new Date(e.timestamp).toISOString()]
            );
        }
        res.json({ inserted: events.length });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Teacher analytics endpoint
router.get('/analytics/teacher', auth, async (req, res) => {
    const db = req.app.get('db');
    try {
        const studentCount = await db.get('SELECT COUNT(*) as count FROM users WHERE role = ?', ['student']);
        const submissionCount = await db.get('SELECT COUNT(*) as count FROM quiz_submissions');
        const avgScore = await db.get('SELECT AVG(score) as avg FROM quiz_submissions');
        const presentToday = await db.get(
            `SELECT COUNT(*) as count FROM attendance WHERE date = date('now') AND status = 'present'`
        );
        const totalToday = await db.get(`SELECT COUNT(*) as count FROM attendance WHERE date = date('now')`);
        const attendancePct = totalToday.count > 0
            ? Math.round((presentToday.count / totalToday.count) * 100) : null;

        res.json({
            students: studentCount.count,
            submissions: submissionCount.count,
            avgScore: Math.round(avgScore.avg || 0),
            attendance: attendancePct !== null ? `${attendancePct}%` : 'No data',
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── PROGRESS ────────────────────────────────────────────────────

// Update skill progress
router.post('/progress/update', auth, async (req, res) => {
    const db = req.app.get('db');
    const { student_id, skill_node_id, mastery_pct, xp_earned } = req.body;
    try {
        await db.run(
            `INSERT INTO skill_progress (student_id, skill_node_id, mastery_pct, xp_earned, unlocked)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(student_id, skill_node_id)
             DO UPDATE SET
               mastery_pct   = MAX(mastery_pct, excluded.mastery_pct),
               xp_earned     = MAX(xp_earned, excluded.xp_earned),
               unlocked      = (MAX(mastery_pct, excluded.mastery_pct) >= 80),
               completed_at  = CASE WHEN excluded.mastery_pct >= 80 THEN CURRENT_TIMESTAMP ELSE completed_at END`,
            [student_id, skill_node_id, mastery_pct, xp_earned, mastery_pct >= 80 ? 1 : 0]
        );
        res.json({ message: 'Progress updated' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get student's full skill progress
router.get('/progress/student/:id', auth, async (req, res) => {
    const db = req.app.get('db');
    try {
        const rows = await db.all('SELECT * FROM skill_progress WHERE student_id = ?', [req.params.id]);
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── STATS ───────────────────────────────────────────────────────

// Update user XP/stats
router.post('/stats/update', auth, async (req, res) => {
    const db = req.app.get('db');
    const { user_id, xp_delta, lesson_completed, quiz_completed } = req.body;
    try {
        await db.run(
            `INSERT INTO user_stats (user_id, xp, total_lessons, total_quizzes)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(user_id) DO UPDATE SET
               xp            = xp + excluded.xp,
               level         = ((xp + excluded.xp) / 500) + 1,
               total_lessons = total_lessons + excluded.total_lessons,
               total_quizzes = total_quizzes + excluded.total_quizzes`,
            [user_id, xp_delta || 0, lesson_completed ? 1 : 0, quiz_completed ? 1 : 0]
        );
        res.json({ message: 'Stats updated' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Quiz submission (keep backward compat)
router.post('/quiz/submit', auth, async (req, res) => {
    const db = req.app.get('db');
    const { quiz_id, student_id, score, responses_json } = req.body;
    try {
        const result = await db.run(
            `INSERT INTO quiz_submissions (quiz_id, student_id, score, responses_json, server_synced)
             VALUES (?, ?, ?, ?, 1)`,
            [quiz_id, student_id, score, JSON.stringify(responses_json || {})]
        );
        // Award XP
        await db.run(
            `INSERT INTO user_stats (user_id, xp, total_quizzes) VALUES (?, 20, 1)
             ON CONFLICT(user_id) DO UPDATE SET xp = xp + 20, total_quizzes = total_quizzes + 1`,
            [student_id]
        );
        res.status(201).json({ id: result.lastID });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
