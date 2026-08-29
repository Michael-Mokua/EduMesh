import Dexie, { Table } from 'dexie';

// ── Type Definitions ──────────────────────────────────────────────

export interface SyncEvent {
    id?: number;
    type: string;
    payload: any;
    timestamp: number;
    status: 'pending' | 'syncing' | 'failed';
    retries?: number;
    lastAttempt?: number;
}

export interface Subject {
    id: number;
    name: string;
    description: string;
    icon?: string;
    color?: string;
    grade_level?: string;
}

export interface Lesson {
    id: number;
    subject_id: number;
    title: string;
    description?: string;
    type: 'text' | 'video' | 'audio' | 'interactive' | 'quiz';
    body?: string;
    file_url?: string;
    skill_node_id?: string;
    xp_reward?: number;
    order_index?: number;
    version: number;
}

export interface Content {
    id: number;
    subject_id: number;
    title: string;
    type: string;
    body: string;
    file_url?: string;
    version: number;
}

export interface QuizSubmission {
    id?: number;
    quiz_id: number;
    student_id: number;
    score: number;
    responses_json?: string;
    timestamp: number;
    synced: boolean;
}

export interface SkillProgress {
    id?: number;
    student_id: number;
    skill_node_id: string;
    mastery_pct: number;
    unlocked: boolean;
    xp_earned: number;
    completed_at?: number;
}

export interface AttendanceRecord {
    id?: number;
    student_id: number;
    teacher_id: number;
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    note?: string;
    synced: boolean;
}

export interface Message {
    id?: number;
    sender_id: number;
    recipient_id: number;
    thread_id?: string;
    body: string;
    read_at?: number;
    synced: boolean;
    created_at: number;
}

export interface Badge {
    id?: number;
    user_id: number;
    badge_type: string;
    badge_level: 'bronze' | 'silver' | 'gold' | 'platinum';
    earned_at: number;
}

export interface UserStats {
    id: string; // user_id stringified
    xp: number;
    level: number;
    streak: number;
    longest_streak: number;
    lastActive: number;
    total_lessons: number;
    total_quizzes: number;
}

export interface AnalyticsEvent {
    id?: number;
    user_id: number;
    event_type: string;
    payload?: any;
    timestamp: number;
    synced: boolean;
}

export interface CachedUser {
    id: number;
    username: string;
    display_name?: string;
    role: string;
    school_id?: number;
    county?: string;
    avatar_color?: string;
    subjects_json?: string;
    token: string;
}

// ── Database Class ────────────────────────────────────────────────

export class EduMeshDB extends Dexie {
    sync_queue!: Table<SyncEvent>;
    subjects!: Table<Subject>;
    lessons!: Table<Lesson>;
    content!: Table<Content>;
    quiz_submissions!: Table<QuizSubmission>;
    skill_progress!: Table<SkillProgress>;
    attendance!: Table<AttendanceRecord>;
    messages!: Table<Message>;
    badges!: Table<Badge>;
    user_stats!: Table<UserStats>;
    analytics_events!: Table<AnalyticsEvent>;
    cached_users!: Table<CachedUser>;

    constructor() {
        super('edumesh');

        this.version(5).stores({
            sync_queue: '++id, type, timestamp, status',
            subjects: 'id, name',
            lessons: 'id, subject_id, skill_node_id, order_index',
            content: 'id, subject_id, title',
            quiz_submissions: '++id, quiz_id, student_id, synced, timestamp',
            skill_progress: '++id, [student_id+skill_node_id], student_id, skill_node_id',
            attendance: '++id, student_id, date, synced',
            messages: '++id, sender_id, recipient_id, thread_id, synced, created_at',
            badges: '++id, user_id, badge_type',
            user_stats: 'id',
            analytics_events: '++id, user_id, event_type, synced, timestamp',
            cached_users: 'id, username',
        });
    }
}

export const db = new EduMeshDB();

// ── Helper: Record an analytics event locally ─────────────────────
export async function trackEvent(userId: number, eventType: string, payload?: any) {
    await db.analytics_events.add({
        user_id: userId,
        event_type: eventType,
        payload,
        timestamp: Date.now(),
        synced: false,
    });
}

// ── Helper: Add XP and level up if needed ────────────────────────
export async function addXP(userId: string, amount: number): Promise<UserStats> {
    let stats = await db.user_stats.get(userId);
    if (!stats) {
        stats = { id: userId, xp: 0, level: 1, streak: 0, longest_streak: 0, lastActive: Date.now(), total_lessons: 0, total_quizzes: 0 };
    }
    stats.xp += amount;
    // Level every 500 XP
    stats.level = Math.floor(stats.xp / 500) + 1;
    stats.lastActive = Date.now();
    await db.user_stats.put(stats);
    return stats;
}

// ── Helper: Get or create user stats ────────────────────────────
export async function getUserStats(userId: string): Promise<UserStats> {
    let stats = await db.user_stats.get(userId);
    if (!stats) {
        stats = { id: userId, xp: 0, level: 1, streak: 0, longest_streak: 0, lastActive: Date.now(), total_lessons: 0, total_quizzes: 0 };
        await db.user_stats.put(stats);
    }
    return stats;
}
