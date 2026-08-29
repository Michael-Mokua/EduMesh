import { db, AnalyticsEvent } from './db';

const API_BASE = 'http://localhost:5000/api';
const MAX_RETRIES = 5;
const RETRY_DELAYS = [2_000, 5_000, 15_000, 30_000, 60_000]; // exponential backoff

// ── Connectivity detection ────────────────────────────────────────
let _isOnline = navigator.onLine;
window.addEventListener('online', () => { _isOnline = true; flushQueue(); });
window.addEventListener('offline', () => { _isOnline = false; });
export const isOnline = () => _isOnline;

// ── Auth helper ───────────────────────────────────────────────────
function authToken(): string {
    return localStorage.getItem('edumesh_token') || '';
}

async function apiPost(path: string, body: any): Promise<boolean> {
    const token = authToken();
    try {
        const res = await fetch(`${API_BASE}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
        });
        return res.ok;
    } catch {
        return false;
    }
}

// ── Queue an event for sync ───────────────────────────────────────
export async function enqueue(type: string, payload: any): Promise<void> {
    await db.sync_queue.add({ type, payload, timestamp: Date.now(), status: 'pending', retries: 0 });
    if (_isOnline) flushQueue();
}

// ── Flush the sync queue ──────────────────────────────────────────
let _flushing = false;

export async function flushQueue(): Promise<void> {
    if (_flushing || !_isOnline) return;
    _flushing = true;

    try {
        const pending = await db.sync_queue
            .where('status').anyOf(['pending', 'failed'])
            .toArray();

        for (const event of pending) {
            if (!event.id) continue;

            // Respect retry delay
            if (event.retries && event.lastAttempt) {
                const delay = RETRY_DELAYS[Math.min(event.retries - 1, RETRY_DELAYS.length - 1)];
                if (Date.now() - event.lastAttempt < delay) continue;
            }

            await db.sync_queue.update(event.id, { status: 'syncing', lastAttempt: Date.now() });

            let success = false;

            try {
                success = await routeEvent(event);
            } catch (e) {
                console.warn('[SyncEngine] Error processing event:', event.type, e);
            }

            if (success) {
                await db.sync_queue.delete(event.id);
            } else {
                const newRetries = (event.retries || 0) + 1;
                if (newRetries >= MAX_RETRIES) {
                    await db.sync_queue.update(event.id, { status: 'failed', retries: newRetries });
                } else {
                    await db.sync_queue.update(event.id, { status: 'failed', retries: newRetries, lastAttempt: Date.now() });
                }
            }
        }

        // Flush analytics events
        await flushAnalytics();

        // Flush attendance records
        await flushAttendance();

        // Flush messages
        await flushMessages();

    } finally {
        _flushing = false;
    }
}

// ── Route event to correct endpoint ──────────────────────────────
async function routeEvent(event: any): Promise<boolean> {
    switch (event.type) {
        case 'quiz_submission':
            return apiPost('/quiz/submit', event.payload);
        case 'skill_progress':
            return apiPost('/progress/update', event.payload);
        case 'user_stats':
            return apiPost('/stats/update', event.payload);
        case 'badge_earned':
            return apiPost('/badges/award', event.payload);
        case 'attendance':
            return apiPost('/attendance/record', event.payload);
        case 'message':
            return apiPost('/messages/send', event.payload);
        case 'analytics':
            return apiPost('/analytics/events', event.payload);
        default:
            console.warn('[SyncEngine] Unknown event type:', event.type);
            return true; // discard unknown events after max retries
    }
}

// ── Flush analytics events ────────────────────────────────────────
async function flushAnalytics(): Promise<void> {
    const events = await db.analytics_events.where('synced').equals(0).toArray();
    if (!events.length) return;

    const success = await apiPost('/analytics/batch', { events });
    if (success) {
        await db.analytics_events
            .where('synced').equals(0)
            .modify({ synced: true });
    }
}

// ── Flush attendance records ───────────────────────────────────────
async function flushAttendance(): Promise<void> {
    const records = await db.attendance.where('synced').equals(0).toArray();
    for (const record of records) {
        const success = await apiPost('/attendance/record', record);
        if (success && record.id) {
            await db.attendance.update(record.id, { synced: true });
        }
    }
}

// ── Flush messages ────────────────────────────────────────────────
async function flushMessages(): Promise<void> {
    const msgs = await db.messages.where('synced').equals(0).toArray();
    for (const msg of msgs) {
        const success = await apiPost('/messages/send', msg);
        if (success && msg.id) {
            await db.messages.update(msg.id, { synced: true });
        }
    }
}

// ── Periodic sync (every 30 minutes when online) ──────────────────
export function startPeriodicSync(intervalMs = 30 * 60 * 1000): void {
    setInterval(() => {
        if (_isOnline) flushQueue();
    }, intervalMs);
}

// ── Sync specific quiz submission ─────────────────────────────────
export async function syncQuizSubmission(submission: {
    quiz_id: number;
    student_id: number;
    score: number;
    responses_json?: string;
}): Promise<void> {
    // Store locally first
    await db.quiz_submissions.add({
        ...submission,
        timestamp: Date.now(),
        synced: false,
    });
    // Queue for remote sync
    await enqueue('quiz_submission', submission);
}

// ── Sync attendance record ────────────────────────────────────────
export async function syncAttendance(record: {
    student_id: number;
    teacher_id: number;
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    note?: string;
}): Promise<void> {
    await db.attendance.add({ ...record, synced: false });
    if (_isOnline) flushAttendance();
}

// ── Conflict resolution: merge skill progress ─────────────────────
export async function mergeSkillProgress(
    studentId: number,
    skillNodeId: string,
    serverData: { mastery_pct: number; xp_earned: number }
): Promise<void> {
    const local = await db.skill_progress
        .where('[student_id+skill_node_id]').equals([studentId, skillNodeId])
        .first();

    if (!local) {
        await db.skill_progress.add({
            student_id: studentId,
            skill_node_id: skillNodeId,
            mastery_pct: serverData.mastery_pct,
            unlocked: serverData.mastery_pct >= 80,
            xp_earned: serverData.xp_earned,
        });
    } else {
        // Last-write-wins with server on mastery, take max XP
        await db.skill_progress.update(local.id!, {
            mastery_pct: Math.max(local.mastery_pct, serverData.mastery_pct),
            xp_earned: Math.max(local.xp_earned, serverData.xp_earned),
            unlocked: Math.max(local.mastery_pct, serverData.mastery_pct) >= 80,
        });
    }
}

// ── Queue size reporter ───────────────────────────────────────────
export async function getPendingCount(): Promise<number> {
    return db.sync_queue.where('status').anyOf(['pending', 'failed']).count();
}

// ── Initialise on app load ────────────────────────────────────────
export function initSyncEngine(): void {
    startPeriodicSync();
    if (_isOnline) flushQueue();
    console.log('✅ EduMesh SyncEngine initialized');
}
