const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
require('dotenv').config();

const dbPath = path.resolve(__dirname, '..', process.env.DATABASE_PATH || 'edumesh.sqlite');

async function initDB() {
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    await db.exec(`PRAGMA journal_mode=WAL;`);

    // ── Core Users ─────────────────────────────────────────────────
    await db.exec(`
        CREATE TABLE IF NOT EXISTS schools (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            county TEXT,
            region TEXT,
            emis_code TEXT UNIQUE,
            metadata TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            display_name TEXT,
            role TEXT CHECK(role IN (
                'national_admin','county_admin','admin','teacher','student','parent'
            )) DEFAULT 'student',
            school_id INTEGER REFERENCES schools(id),
            county TEXT,
            avatar_color TEXT DEFAULT 'indigo',
            subjects_json TEXT,
            metadata TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_active DATETIME
        );

        CREATE TABLE IF NOT EXISTS parent_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            parent_id INTEGER NOT NULL REFERENCES users(id),
            student_id INTEGER NOT NULL REFERENCES users(id),
            UNIQUE(parent_id, student_id)
        );
    `);

    // ── Content & Curriculum ────────────────────────────────────────
    await db.exec(`
        CREATE TABLE IF NOT EXISTS subjects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            icon TEXT,
            color TEXT,
            grade_level TEXT
        );

        CREATE TABLE IF NOT EXISTS lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject_id INTEGER REFERENCES subjects(id),
            title TEXT NOT NULL,
            description TEXT,
            type TEXT CHECK(type IN ('text','video','audio','interactive','quiz')),
            body TEXT,
            file_url TEXT,
            skill_node_id TEXT,
            xp_reward INTEGER DEFAULT 10,
            order_index INTEGER DEFAULT 0,
            version INTEGER DEFAULT 1,
            created_by INTEGER REFERENCES users(id),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS content (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject_id INTEGER REFERENCES subjects(id),
            title TEXT NOT NULL,
            type TEXT,
            body TEXT,
            file_url TEXT,
            version INTEGER DEFAULT 1,
            FOREIGN KEY (subject_id) REFERENCES subjects(id)
        );

        CREATE TABLE IF NOT EXISTS quizzes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content_id INTEGER REFERENCES content(id),
            lesson_id INTEGER REFERENCES lessons(id),
            title TEXT NOT NULL,
            data_json TEXT,
            pass_score INTEGER DEFAULT 80,
            xp_reward INTEGER DEFAULT 20,
            version INTEGER DEFAULT 1,
            created_by INTEGER REFERENCES users(id),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS quiz_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quiz_id INTEGER REFERENCES quizzes(id),
            student_id INTEGER REFERENCES users(id),
            score INTEGER,
            responses_json TEXT,
            passed BOOLEAN GENERATED ALWAYS AS (score >= (
                SELECT pass_score FROM quizzes WHERE id = quiz_id
            )) STORED,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            server_synced BOOLEAN DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS skill_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER REFERENCES users(id),
            skill_node_id TEXT NOT NULL,
            mastery_pct INTEGER DEFAULT 0,
            unlocked BOOLEAN DEFAULT 0,
            xp_earned INTEGER DEFAULT 0,
            completed_at DATETIME,
            UNIQUE(student_id, skill_node_id)
        );
    `);

    // ── School Management ───────────────────────────────────────────
    await db.exec(`
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER REFERENCES users(id),
            teacher_id INTEGER REFERENCES users(id),
            date TEXT NOT NULL,
            status TEXT CHECK(status IN ('present','absent','late','excused')) NOT NULL,
            note TEXT,
            synced BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(student_id, date)
        );

        CREATE TABLE IF NOT EXISTS timetables (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            school_id INTEGER REFERENCES schools(id),
            teacher_id INTEGER REFERENCES users(id),
            subject_id INTEGER REFERENCES subjects(id),
            day_of_week TEXT,
            start_time TEXT,
            end_time TEXT,
            classroom TEXT
        );
    `);

    // ── Messaging ──────────────────────────────────────────────────
    await db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER REFERENCES users(id),
            recipient_id INTEGER REFERENCES users(id),
            thread_id TEXT,
            body TEXT NOT NULL,
            read_at DATETIME,
            synced BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // ── Gamification ───────────────────────────────────────────────
    await db.exec(`
        CREATE TABLE IF NOT EXISTS user_stats (
            id INTEGER PRIMARY KEY,
            user_id INTEGER UNIQUE REFERENCES users(id),
            xp INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            streak INTEGER DEFAULT 0,
            longest_streak INTEGER DEFAULT 0,
            last_active DATE,
            total_lessons INTEGER DEFAULT 0,
            total_quizzes INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS badges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES users(id),
            badge_type TEXT NOT NULL,
            badge_level TEXT DEFAULT 'bronze',
            earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, badge_type)
        );

        CREATE TABLE IF NOT EXISTS leaderboard_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES users(id),
            school_id INTEGER REFERENCES schools(id),
            county TEXT,
            scope TEXT CHECK(scope IN ('class','school','county','national')),
            xp INTEGER DEFAULT 0,
            rank INTEGER,
            period TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // ── Analytics & Audit ──────────────────────────────────────────
    await db.exec(`
        CREATE TABLE IF NOT EXISTS analytics_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES users(id),
            school_id INTEGER,
            event_type TEXT NOT NULL,
            payload TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            actor_id INTEGER REFERENCES users(id),
            action TEXT NOT NULL,
            target_type TEXT,
            target_id INTEGER,
            ip_address TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // ── Seed default subjects (Kenya CBC) ──────────────────────────
    await db.exec(`
        INSERT OR IGNORE INTO subjects (id, name, description, icon, color, grade_level) VALUES
            (1, 'Mathematics', 'Numbers, algebra, geometry', 'calculator', '#3b82f6', 'All'),
            (2, 'Science & Technology', 'Biology, chemistry, physics', 'flask', '#10b981', 'All'),
            (3, 'English', 'Language, literature, communication', 'book', '#8b5cf6', 'All'),
            (4, 'Kiswahili', 'Lugha ya Kiswahili na fasihi', 'globe', '#f59e0b', 'All'),
            (5, 'Social Studies', 'History, geography, citizenship', 'map', '#0ea5e9', 'All'),
            (6, 'Creative Arts', 'Visual art, music, drama', 'palette', '#ec4899', 'All'),
            (7, 'Physical Education', 'Sports, health, fitness', 'activity', '#14b8a6', 'All'),
            (8, 'ICT', 'Computer literacy, coding', 'monitor', '#6366f1', 'All');
    `);

    console.log('✅ EduMesh Enterprise Database initialized.');
    return db;
}

module.exports = { initDB };
