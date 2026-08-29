import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../db';
import {
    GraduationCap, Calendar, MessageSquare, Bell, TrendingUp,
    CheckCircle2, XCircle, Clock, Star, BookOpen, User,
    LogOut, ChevronRight, Smartphone, Wifi, WifiOff
} from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

// Mock child data (in production, fetched from API / IndexedDB)
const MOCK_CHILD = {
    name: 'Aisha Kamau',
    grade: 'Grade 6',
    school: 'Makini Primary School',
    avatar_color: 'indigo',
    xp: 1240,
    level: 4,
    streak: 7,
    subjects: [
        { name: 'Mathematics', progress: 78, color: '#3b82f6' },
        { name: 'Science', progress: 85, color: '#10b981' },
        { name: 'English', progress: 91, color: '#8b5cf6' },
        { name: 'Kiswahili', progress: 65, color: '#f59e0b' },
        { name: 'Social Studies', progress: 72, color: '#0ea5e9' },
    ],
    attendance_this_week: ['present', 'present', 'absent', 'present', 'present'],
    recent_badges: ['First Lesson', 'Quiz Master', '7-Day Streak'],
};

const MOCK_MESSAGES = [
    { id: 1, from: 'Mr. Odhiambo (Math)', body: 'Aisha did great on the algebra quiz today! She scored 90%.', time: '2h ago', unread: true },
    { id: 2, from: 'Mrs. Wanjiru (Science)', body: 'Reminder: science project due next Monday.', time: 'Yesterday', unread: true },
    { id: 3, from: 'School Admin', body: 'Term 2 report cards will be sent via SMS on Friday.', time: '3 days ago', unread: false },
];

const MOCK_ACHIEVEMENTS = [
    { title: 'Quiz Master', desc: 'Scored 90%+ on 5 quizzes', icon: '🏆', date: 'Today' },
    { title: '7-Day Streak', desc: 'Logged in 7 days in a row', icon: '🔥', date: 'Yesterday' },
    { title: 'Top of Class', desc: '#1 in Math this week', icon: '⭐', date: '3 days ago' },
];

const fadeIn = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

const ParentPortal: React.FC = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'messages' | 'achievements'>('overview');
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [replyOpen, setReplyOpen] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
    }, []);

    const attendancePct = Math.round(
        (MOCK_CHILD.attendance_this_week.filter(s => s === 'present').length / 5) * 100
    );

    const tabs = [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'progress', label: 'Progress', icon: BookOpen },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
        { id: 'achievements', label: 'Awards', icon: Star },
    ] as const;

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
                <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white text-sm font-black">E</span>
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-slate-900">Parent Portal</h1>
                            <p className="text-[10px] text-slate-400 font-medium">EduMesh · {user?.display_name || user?.username}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                            {isOnline ? 'Live' : 'Offline'}
                        </div>
                        <button onClick={logout} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-100 flex items-center justify-center text-slate-500 hover:text-red-500 transition-all">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
                {/* Child Card */}
                <motion.div {...fadeIn}
                    className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-2xl shadow-indigo-200">
                    <div className="flex items-center gap-4 mb-5">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">👧</div>
                        <div>
                            <h2 className="text-xl font-bold">{MOCK_CHILD.name}</h2>
                            <p className="text-indigo-200 text-sm font-medium">{MOCK_CHILD.grade} · {MOCK_CHILD.school}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'XP Points', value: MOCK_CHILD.xp, icon: '⚡' },
                            { label: 'Level', value: MOCK_CHILD.level, icon: '🎯' },
                            { label: 'Day Streak', value: MOCK_CHILD.streak, icon: '🔥' },
                        ].map(s => (
                            <div key={s.label} className="bg-white/15 rounded-2xl p-3 text-center">
                                <div className="text-xl mb-1">{s.icon}</div>
                                <div className="text-lg font-black">{s.value}</div>
                                <div className="text-[10px] text-indigo-200 font-medium">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Tab bar */}
                <div className="flex gap-1 bg-slate-100 rounded-2xl p-1">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button key={id} onClick={() => setActiveTab(id as any)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200
                                ${activeTab === id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                            <Icon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }}>
                        {activeTab === 'overview' && (
                            <div className="space-y-4">
                                {/* Attendance this week */}
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-indigo-500" /> This Week's Attendance
                                        </h3>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${attendancePct >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {attendancePct}%
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        {DAYS.map((day, i) => {
                                            const status = MOCK_CHILD.attendance_this_week[i];
                                            return (
                                                <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                                                        ${status === 'present' ? 'bg-emerald-100' : status === 'absent' ? 'bg-red-100' : 'bg-amber-100'}`}>
                                                        {status === 'present' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                            : status === 'absent' ? <XCircle className="w-4 h-4 text-red-500" />
                                                                : <Clock className="w-4 h-4 text-amber-500" />}
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 font-semibold">{day}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Quick progress */}
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-indigo-500" /> Subject Overview
                                    </h3>
                                    <div className="space-y-3">
                                        {MOCK_CHILD.subjects.slice(0, 3).map(s => (
                                            <div key={s.name}>
                                                <div className="flex justify-between text-xs mb-1.5">
                                                    <span className="font-semibold text-slate-700">{s.name}</span>
                                                    <span className="font-bold" style={{ color: s.color }}>{s.progress}%</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <motion.div className="h-full rounded-full" style={{ backgroundColor: s.color }}
                                                        initial={{ width: 0 }} animate={{ width: `${s.progress}%` }} transition={{ duration: 0.8, delay: 0.2 }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="mt-4 text-xs font-semibold text-indigo-600 flex items-center gap-1" onClick={() => setActiveTab('progress')}>
                                        View all subjects <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>

                                {/* Recent notification */}
                                {MOCK_MESSAGES.filter(m => m.unread).length > 0 && (
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
                                        <Bell className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-indigo-700">New message from {MOCK_MESSAGES[0].from}</p>
                                            <p className="text-xs text-indigo-600 mt-0.5 truncate">{MOCK_MESSAGES[0].body}</p>
                                        </div>
                                        <button onClick={() => setActiveTab('messages')} className="text-xs text-indigo-600 font-bold flex-shrink-0">View</button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'progress' && (
                            <div className="space-y-4">
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                                    <h3 className="font-bold text-slate-800 mb-4">Curriculum Progress</h3>
                                    <div className="space-y-4">
                                        {MOCK_CHILD.subjects.map(s => (
                                            <div key={s.name}>
                                                <div className="flex justify-between text-xs mb-1.5">
                                                    <span className="font-semibold text-slate-700">{s.name}</span>
                                                    <span style={{ color: s.color }} className="font-bold">{s.progress}% mastery</span>
                                                </div>
                                                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <motion.div className="h-full rounded-full" style={{ backgroundColor: s.color }}
                                                        initial={{ width: 0 }} animate={{ width: `${s.progress}%` }} transition={{ duration: 0.9, ease: 'easeOut' }} />
                                                </div>
                                                <p className="text-[10px] text-slate-400 mt-1 font-medium">
                                                    {s.progress >= 80 ? '✅ Mastered' : s.progress >= 60 ? '🔄 On Track' : '⚠️ Needs Support'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {!isOnline && (
                                    <p className="text-xs text-amber-600 font-medium text-center bg-amber-50 border border-amber-100 rounded-xl p-3">
                                        📴 Showing last synced data · Connect to refresh
                                    </p>
                                )}
                            </div>
                        )}

                        {activeTab === 'messages' && (
                            <div className="space-y-3">
                                {MOCK_MESSAGES.map(msg => (
                                    <div key={msg.id} className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${msg.unread ? 'border-indigo-100' : 'border-slate-100'}`}>
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {msg.unread && <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />}
                                                <span className="text-xs font-bold text-slate-800">{msg.from}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-medium">{msg.time}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed">{msg.body}</p>
                                        <button onClick={() => setReplyOpen(replyOpen === msg.id ? null : msg.id)}
                                            className="mt-3 text-xs font-semibold text-indigo-600 flex items-center gap-1">
                                            <MessageSquare className="w-3 h-3" /> Reply
                                        </button>
                                        <AnimatePresence>
                                            {replyOpen === msg.id && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
                                                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                                                        placeholder="Write your reply..."
                                                        className="w-full p-3 rounded-xl border border-slate-200 text-xs resize-none bg-slate-50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50" rows={3} />
                                                    <button className="mt-2 w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xs font-semibold">
                                                        {isOnline ? 'Send Message' : 'Queue for Later (Offline)'}
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'achievements' && (
                            <div className="space-y-4">
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                                    <h3 className="font-bold text-slate-800 mb-4">Recent Achievements 🎖️</h3>
                                    <div className="space-y-3">
                                        {MOCK_ACHIEVEMENTS.map(a => (
                                            <motion.div key={a.title} whileHover={{ x: 2 }}
                                                className="flex items-center gap-4 p-3 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl border border-indigo-50">
                                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">{a.icon}</div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm text-slate-800">{a.title}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{a.desc}</p>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">{a.date}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5">
                                    <h3 className="font-bold text-amber-800 mb-1">🎯 Encourage Learning!</h3>
                                    <p className="text-xs text-amber-700">Set a 30-minute daily learning goal with your child. Ask them what they learned today!</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ParentPortal;
