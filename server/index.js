const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDB } = require('./src/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting (simple in-memory)
const rateLimitMap = new Map();
app.use((req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const window = rateLimitMap.get(ip) || { count: 0, reset: now + 60_000 };
    if (now > window.reset) { window.count = 0; window.reset = now + 60_000; }
    window.count++;
    rateLimitMap.set(ip, window);
    if (window.count > 200) return res.status(429).json({ error: 'Rate limit exceeded' });
    next();
});

async function startServer() {
    try {
        const db = await initDB();
        app.set('db', db);

        // ── Core routes ───────────────────────────────────────────
        app.use('/api/auth', require('./src/routes/auth'));
        app.use('/api/content', require('./src/routes/content'));

        // ── Enterprise routes (formerly sync.js — now covers all APIs) ─
        const enterprise = require('./src/routes/sync');
        app.use('/api', enterprise); // mounts /api/attendance, /api/messages, etc.

        // ── Health check ──────────────────────────────────────────
        app.get('/api/health', (req, res) => {
            res.json({
                status: 'ok',
                platform: 'EduMesh Enterprise',
                version: '2.0.0',
                timestamp: new Date().toISOString(),
            });
        });

        // ── 404 handler ───────────────────────────────────────────
        app.use((req, res) => {
            res.status(404).json({ error: 'Endpoint not found' });
        });

        // ── Error handler ─────────────────────────────────────────
        app.use((err, req, res, _next) => {
            console.error('[Server Error]', err);
            res.status(500).json({ error: 'Internal server error' });
        });

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`\n✅ EduMesh Enterprise Server`);
            console.log(`   http://0.0.0.0:${PORT}`);
            console.log(`   API health: http://localhost:${PORT}/api/health\n`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
