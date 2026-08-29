import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Book,
    GraduationCap,
    Clock,
    ChevronRight,
    LogOut,
    Layout,
    Trophy,
    Flame,
    Star,
    Settings,
    Search,
    Bell,
    Map as MapIcon,
    Wifi,
    WifiOff,
    Zap,
    Shield,
    Sparkles,
    Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ContentLibrary from './ContentLibrary';
import SkillTree from './SkillTree';
import Quiz from './Quiz';
import { flushQueue } from '../syncEngine';
import { db, UserStats } from '../db';
import AdminPanel from './AdminPanel';
import { aiEngine } from '../aiPersonalization';
import { QRCodeCanvas } from 'qrcode.react';
import { generateVerificationHash } from '../utils/CertificateUtils';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [view, setView] = useState<'overview' | 'library' | 'progress' | 'quiz' | 'admin' | 'certificates'>('overview');
    const [isOnline, setIsOnline] = useState(true);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [aiInsights, setAiInsights] = useState<{ difficultyRange: number, atRiskProbability: number, message: string, color: string } | null>(null);

    React.useEffect(() => {
        if (user) {
            flushQueue();
            db.user_stats.get(user.id.toString()).then((stats: UserStats | undefined) => {
                if (stats) setUserStats(stats);
            });
            // Fetch AI Personalization Insights
            aiEngine.getInsights(user.id).then(setAiInsights);
        }
    }, [user, view]);

    const handleQuizComplete = (score: number) => {
        console.log('Quiz completed with score:', score);
        setView('overview'); // Return to dashboard
    };

    const stats = [
        { label: 'Courses', value: '12', icon: Book, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Completed', value: '4', icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'Active Hours', value: '24', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    ];

    const tasks = [
        { title: 'Algebra Quiz', subject: 'Math', time: '10 mins', color: 'border-blue-500' },
        { title: 'Cell Biology Notes', subject: 'Science', time: '15 mins', color: 'border-emerald-500' },
        { title: 'Timeline Recap', subject: 'History', time: '5 mins', color: 'border-amber-500' },
    ];

    return (
        <div className="min-h-screen bg-[#F6F9FC] flex font-['Inter']">
            {/* Sidebar */}
            <aside className="w-80 bg-white border-r border-slate-100 p-8 flex flex-col hidden lg:flex">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center transform rotate-3">
                        <Book className="w-6 h-6 text-white transform -rotate-3" />
                    </div>
                    <div>
                        <span className="text-xl font-black tracking-tight text-slate-900">EduMesh</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            {isOnline ? (
                                <><Wifi className="w-3 h-3 text-emerald-500" /><span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Online</span></>
                            ) : (
                                <><WifiOff className="w-3 h-3 text-amber-500" /><span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Offline Mode</span></>
                            )}
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {[
                        { id: 'overview', icon: Layout, label: 'Overview' },
                        { id: 'library', icon: Book, label: 'Library' },
                        { id: 'progress', icon: Trophy, label: 'Skill Tree' },
                        { id: 'certificates', icon: Star, label: 'Credentials' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id as any)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 font-bold ${view === item.id
                                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${view === item.id ? 'text-indigo-600' : ''}`} />
                            {item.label}
                        </button>
                    ))}
                    {user?.role === 'admin' && (
                        <button
                            onClick={() => setView('admin')}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 font-bold ${view === 'admin'
                                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <Shield className={`w-5 h-5 ${view === 'admin' ? 'text-indigo-600' : ''}`} />
                            Admin Panel
                        </button>
                    )}
                </nav>

                <div className="mt-8 pt-8 border-t border-slate-100 space-y-2">
                    <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors font-bold">
                        <Settings className="w-5 h-5" />
                        Settings
                    </button>
                    <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 transition-colors font-bold">
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                    {/* Dev Branding Component inserted below logout button */}
                    <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col items-center justify-center gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Engineered By</span>
                        <a href="https://mikesth3tic-dev.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group p-2 rounded-xl hover:bg-slate-50 transition-all duration-300">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                                <span className="text-white font-black text-xs">M</span>
                            </div>
                            <span className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">Mikesth3tic.dev</span>
                        </a>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto w-full">
                {/* Header */}
                <header className="bg-white/50 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-10">
                    <div className="flex items-center justify-between p-8 max-w-7xl mx-auto">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                {view === 'overview' ? `Welcome back, ${user?.username} 👋` :
                                    view === 'library' ? 'Content Library' :
                                        view === 'admin' ? 'Administration' :
                                            'Skill Tree'}
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium text-sm">Let's continue your learning journey.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative hidden md:block">
                                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search courses..."
                                    className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64 text-sm font-medium transition-all shadow-sm"
                                />
                            </div>
                            <button className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-colors relative shadow-sm">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
                            </button>
                        </div>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {view === 'overview' ? (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-8 max-w-7xl mx-auto space-y-8"
                        >
                            {/* Gamification Hub & AI Insights */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 school-card bg-gradient-to-br from-teal-600 to-emerald-700 text-white border-transparent p-10 flex flex-col md:flex-row items-center gap-10">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest text-teal-50">Level {userStats?.level || 1}</span>
                                            <div className="h-1 w-1 rounded-full bg-teal-300" />
                                            <span className="text-teal-100 font-bold text-sm">{userStats?.xp || 0} XP</span>
                                        </div>
                                        <h2 className="text-white text-4xl font-extrabold">{userStats?.level && userStats.level > 5 ? 'Grandmaster' : 'Explorer'}</h2>
                                        <div className="xp-bar-container bg-white/20">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min((userStats?.xp || 0) / 100, 100)}%` }}
                                                className="xp-bar-fill bg-white"
                                            />
                                        </div>
                                        <p className="text-teal-50 font-medium opacity-80">You're doing great! Keep going to reach the next level. ✨</p>
                                    </div>
                                    <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
                                        <Zap className="w-16 h-16 text-teal-100 fill-teal-100 animate-pulse" />
                                    </div>
                                </div>

                                <div className="school-card p-8 flex flex-col justify-between bg-white border-slate-100">
                                    <div>
                                        <h3 className="text-xl mb-2 flex items-center gap-2 font-bold text-slate-800">
                                            <Sparkles className="w-5 h-5 text-indigo-500" /> AI Insights
                                        </h3>
                                        <p className="text-sm font-medium text-slate-500 mb-6">Powered by local Edge AI</p>

                                        {aiInsights ? (
                                            <div className="space-y-4">
                                                <div className={`p-4 rounded-2xl bg-slate-50 border border-slate-100`}>
                                                    <p className={`text-sm font-bold ${aiInsights.color}`}>{aiInsights.message}</p>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between text-xs font-bold text-slate-400">
                                                        <span>Optimal Challenge</span>
                                                        <span>{Math.round(aiInsights.difficultyRange * 100)}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${aiInsights.difficultyRange * 100}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-sm text-slate-400 font-medium animate-pulse">
                                                Loading AI model...
                                            </div>
                                        )}
                                    </div>
                                    <button className="mt-6 text-sm font-black text-indigo-600 uppercase tracking-widest hover:underline text-left">View Analysis</button>
                                </div>
                            </div>

                            {/* Stats & Current Tasks */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl">Daily Mission</h2>
                                        <span className="text-slate-400 font-bold text-sm">3 Lessons left</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {tasks.map((task, i) => (
                                            <motion.div
                                                key={task.title}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className={`school-card border-l-8 ${task.color} p-6 flex items-center gap-6 hover:bg-slate-50 transition-colors shadow-sm`}
                                            >
                                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-300">
                                                    {i + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-lg font-bold text-slate-800">{task.title}</h4>
                                                    <p className="text-sm text-slate-500 font-medium">Topic • {task.subject}</p>
                                                </div>
                                                <button className="flex items-center gap-2 text-teal-600 font-bold text-sm bg-teal-50 px-4 py-2 rounded-xl hover:bg-teal-100 transition-colors">
                                                    <Timer className="w-4 h-4" />
                                                    {task.time}
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <h2 className="text-2xl">My Progress</h2>
                                    <div className="space-y-4">
                                        {stats.map((stat, idx) => (
                                            <div key={idx} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
                                                <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shadow-sm`}>
                                                    <stat.icon className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : view === 'library' ? (
                        <motion.div
                            key="library"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <ContentLibrary />
                        </motion.div>
                    ) : view === 'progress' ? (
                        <motion.div
                            key="progress"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <SkillTree />
                        </motion.div>
                    ) : view === 'admin' ? (
                        <motion.div
                            key="admin"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <AdminPanel />
                        </motion.div>
                    ) : view === 'certificates' ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-4xl font-black text-slate-900 leading-tight">National Mastery <br/> Credentials</h2>
                                    <p className="text-slate-500 font-bold mt-2 italic">Cryptographically verifiable certificates for your achievements.</p>
                                </div>
                                <div className="px-6 py-4 bg-slate-900 text-white rounded-[2rem] flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-teal-400" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Status</div>
                                        <div className="font-black text-sm uppercase">Mesh-Verified</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[
                                    { id: 'c1', subject: 'Mathematics', node: 'Basic Addition', date: '2026-03-15', score: '98%' },
                                    { id: 'c2', subject: 'Biology', node: 'Cell Structure', date: '2026-03-12', score: '92%' }
                                ].map(cert => (
                                    <motion.div 
                                        key={cert.id}
                                        whileHover={{ y: -5 }}
                                        className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
                                        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6">
                                            <Star className="w-10 h-10 text-indigo-600 fill-indigo-600" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900">{cert.node}</h3>
                                        <p className="text-slate-400 font-bold mb-8 uppercase tracking-widest text-xs">{cert.subject} Mastery</p>
                                        
                                        <div className="bg-slate-50 p-6 rounded-3xl mb-8 w-full">
                                            <QRCodeCanvas 
                                                value={generateVerificationHash(user?.id.toString() || '0', cert.id, cert.date)}
                                                size={120}
                                                level="H"
                                                includeMargin={true}
                                                className="mx-auto"
                                            />
                                            <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                Verification Hash: {generateVerificationHash(user?.id.toString() || '0', cert.id, cert.date)}
                                            </p>
                                        </div>

                                        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                            <Sparkles className="w-4 h-4" /> Download Certificate
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="quiz"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                        >
                            <Quiz quizId={1} onComplete={handleQuizComplete} onBack={() => setView('overview')} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Dashboard;
