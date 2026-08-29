import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Users,
    BookOpen,
    BarChart3,
    Calendar,
    MessageSquare,
    Settings,
    LogOut,
    Search,
    Bell,
    MoreVertical,
    ArrowUpRight,
    GraduationCap,
    X,
    Plus,
    Sparkles,
    Brain,
    Wand2,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import AdminPanel from './AdminPanel';
import Marketplace from './Marketplace';

const TeacherDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [view, setView] = useState<'analytics' | 'students' | 'courses' | 'messages' | 'admin'>('analytics');
    const [realStats, setRealStats] = useState<any>(null);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [allContent, setAllContent] = useState<any[]>([]);
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [showContentModal, setShowContentModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form states
    const [newQuiz, setNewQuiz] = useState({ title: '', content_id: '', questions: [{ text: '', options: ['', '', '', ''], correct: 0 }] });
    const [newContent, setNewContent] = useState({ title: '', subject_id: '', type: 'lesson', body: '' });

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, subRes] = await Promise.all([
                    fetch('http://localhost:5000/api/content/analytics/teacher'),
                    fetch('http://localhost:5000/api/content/subjects')
                ]);
                const statsData = await statsRes.json();
                const subData = await subRes.json();
                setRealStats(statsData);
                setSubjects(subData);

                // Fetch content for all subjects to populate quiz builder
                const contentPromises = subData.map((s: any) =>
                    fetch(`http://localhost:5000/api/content/subjects/${s.id}/content`).then(r => r.json())
                );
                const contentArrays = await Promise.all(contentPromises);
                setAllContent(contentArrays.flat());
            } catch (err) {
                console.error('Failed to fetch data:', err);
            }
        };
        fetchData();
    }, []);

    const handleCreateQuiz = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/content/quizzes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content_id: parseInt(newQuiz.content_id),
                    title: newQuiz.title,
                    data_json: newQuiz.questions
                })
            });
            if (res.ok) {
                alert('Quiz created successfully!');
                setShowQuizModal(false);
                setNewQuiz({ title: '', content_id: '', questions: [{ text: '', options: ['', '', '', ''], correct: 0 }] });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateContent = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newContent)
            });
            if (res.ok) {
                alert('Content published successfully!');
                setShowContentModal(false);
                setNewContent({ title: '', subject_id: '', type: 'lesson', body: '' });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const generateAIQuiz = async () => {
        if (!newQuiz.content_id) return;
        setLoading(true);
        // Simulate AI Processing Delay
        await new Promise(r => setTimeout(r, 2000));

        const lesson = allContent.find(c => String(c.id) === String(newQuiz.content_id));
        const lessonTitle = lesson?.title || "this topic";

        // Mock AI-generated questions based on common curriculum patterns
        const aiQuestions = [
            {
                text: `What is the primary objective of ${lessonTitle}?`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correct: 0
            },
            {
                text: `Which of the following is a key component discussed in ${lessonTitle}?`,
                options: ["Component X", "Component Y", "Component Z", "Component W"],
                correct: 1
            },
            {
                text: `How does the concept of ${lessonTitle} apply in a real-world scenario?`,
                options: ["By increasing efficiency", "By reducing costs", "By improving accuracy", "All of the above"],
                correct: 3
            }
        ];

        setNewQuiz({
            ...newQuiz,
            title: `AI Generated: ${lessonTitle} Quiz`,
            questions: aiQuestions
        });
        setLoading(false);
    };

    const stats = [
        { label: 'Total Students', value: realStats?.students || '...', change: '+0%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Avg. Attendance', value: realStats?.attendance || '94%', change: '+0%', icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'Quiz Submissions', value: realStats?.submissions || '...', change: '+0%', icon: GraduationCap, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'Avg. Score', value: `${realStats?.avgScore || 0}/100`, change: '+0%', icon: BarChart3, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    ];

    const studentRoster = [
        { name: 'Alex Johnson', grade: 'A', progress: 85, lastActive: '2m ago' },
        { name: 'Sarah Williams', grade: 'B+', progress: 72, lastActive: '15m ago' },
        { name: 'Michael Chen', grade: 'A-', progress: 91, lastActive: '5m ago' },
        { name: 'Emma Davis', grade: 'C', progress: 45, lastActive: '1h ago' },
    ];

    return (
        <div className="min-h-screen bg-[#F6F9FC] flex">
            {/* Sidebar */}
            <aside className="w-80 bg-white border-r border-slate-100 p-8 flex flex-col hidden lg:flex">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-100">
                        <BarChart3 className="text-white w-6 h-6" />
                    </div>
                    <span className="font-['Poppins'] font-extrabold text-2xl text-slate-900">Command</span>
                </div>

                <nav className="flex-1 space-y-1">
                    <button
                        onClick={() => setView('analytics')}
                        className={`sidebar-link w-full ${view === 'analytics' ? 'sidebar-link-active' : ''}`}
                    >
                        <BarChart3 className="w-5 h-5" /> Analytics
                    </button>
                    <button
                        onClick={() => setView('students')}
                        className={`sidebar-link w-full ${view === 'students' ? 'sidebar-link-active' : ''}`}
                    >
                        <Users className="w-5 h-5" /> My Students
                    </button>
                    <button
                        onClick={() => setView('courses')}
                        className={`sidebar-link w-full ${view === 'courses' ? 'sidebar-link-active' : ''}`}
                    >
                        <BookOpen className="w-5 h-5" /> Course Manager
                    </button>
                    <button
                        onClick={() => setView('marketplace')}
                        className={`sidebar-link w-full ${view === 'marketplace' ? 'sidebar-link-active' : ''}`}
                    >
                        <ShoppingBag className="w-5 h-5" /> Marketplace
                    </button>
                    <button
                        onClick={() => setView('messages')}
                        className={`sidebar-link w-full ${view === 'messages' ? 'sidebar-link-active' : ''}`}
                    >
                        <MessageSquare className="w-5 h-5" /> Messages
                    </button>
                    <hr className="my-6 border-slate-100" />
                    {user?.role === 'admin' && (
                        <button
                            onClick={() => setView('admin')}
                            className={`sidebar-link w-full ${view === 'admin' ? 'sidebar-link-active' : ''}`}
                        >
                            <Settings className="w-5 h-5" /> Admin Settings
                        </button>
                    )}
                </nav>

                <div className="mt-auto">
                    <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm">
                            {user?.username?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="font-bold text-slate-900 truncate">Prof. {user?.username}</div>
                            <div className="text-xs font-bold text-slate-400">{user?.role === 'admin' ? 'System Admin' : 'Class Lead'}</div>
                        </div>
                        <button onClick={logout} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-screen overflow-y-auto p-4 lg:p-10">
                {view === 'admin' ? (
                    <AdminPanel />
                ) : view === 'marketplace' ? (
                    <Marketplace />
                ) : view === 'analytics' ? (
                    <div className="space-y-10">
                        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                            <div>
                                <h1 className="text-3xl lg:text-4xl text-slate-900">Classroom Command Center</h1>
                                <p className="text-slate-400 font-bold mt-1">Real-time performance analytics for Class 8B</p>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Mobile User Profile (Visible on < lg) */}
                                <div className="flex lg:hidden items-center gap-3 bg-white p-2 pr-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm">
                                        {user?.username?.[0]?.toUpperCase()}
                                    </div>
                                    <button onClick={logout} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="relative group hidden md:block">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search students..."
                                        className="pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl focus:border-teal-500 focus:outline-none font-bold text-sm shadow-sm"
                                    />
                                </div>
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-teal-600 border border-slate-100 shadow-sm transition-all cursor-pointer">
                                    <Bell className="w-5 h-5" />
                                </div>
                            </div>
                        </header>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="school-card p-6 border-slate-50"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                                            <stat.icon className="w-6 h-6" />
                                        </div>
                                        <div className={`text-xs font-black px-2 py-1 rounded-lg ${stat.change.startsWith('+') ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'}`}>
                                            {stat.change}
                                        </div>
                                    </div>
                                    <div className="text-3xl font-black text-slate-900 mb-1">{stat.value}</div>
                                    <div className="text-xs font-black text-slate-300 uppercase tracking-widest">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Student Roster Table */}
                            <div className="lg:col-span-2 school-card p-8 border-slate-50">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl">Student Performance</h3>
                                    <button className="text-teal-600 font-bold text-sm flex items-center gap-2 hover:underline">
                                        Full Roster <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-slate-50">
                                                <th className="pb-4 font-black">Student</th>
                                                <th className="pb-4 font-black">Grade</th>
                                                <th className="pb-4 font-black">Progress</th>
                                                <th className="pb-4 font-black">Status</th>
                                                <th className="pb-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {studentRoster.map((student) => (
                                                <tr key={student.name} className="group">
                                                    <td className="py-5 font-bold text-slate-900">{student.name}</td>
                                                    <td className="py-5">
                                                        <span className={`px-3 py-1 rounded-lg text-xs font-black ${student.grade.startsWith('A') ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                                            }`}>
                                                            {student.grade}
                                                        </span>
                                                    </td>
                                                    <td className="py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-24 h-2 bg-slate-50 rounded-full overflow-hidden">
                                                                <div className="h-full bg-teal-500" style={{ width: `${student.progress}%` }} />
                                                            </div>
                                                            <span className="text-xs font-black text-slate-400">{student.progress}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-5 text-xs font-bold text-slate-400">{student.lastActive}</td>
                                                    <td className="py-5 text-right">
                                                        <button className="p-2 text-slate-200 hover:text-slate-900 transition-colors">
                                                            <MoreVertical className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Class Activity */}
                            <div className="school-card p-8 border-slate-50">
                                <h3 className="text-xl mb-8">Active Quizzing</h3>
                                <div className="space-y-6">
                                    {[
                                        { title: 'Algebra Focus', students: 12, status: 'Live' },
                                        { title: 'Cell Structures', students: 8, status: 'Draft' },
                                        { title: 'Geography Quiz', students: 45, status: 'Marking' },
                                    ].map((quiz) => (
                                        <div key={quiz.title} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                                            <div className={`w-3 h-3 rounded-full ${quiz.status === 'Live' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                                                }`} />
                                            <div className="flex-1">
                                                <div className="font-bold text-slate-900">{quiz.title}</div>
                                                <div className="text-xs font-bold text-slate-400">{quiz.students} submissions</div>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{quiz.status}</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setShowQuizModal(true)}
                                    className="w-full mt-10 py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-teal-100 border-none cursor-pointer hover:bg-teal-700 transition-colors"
                                >
                                    Create New Quiz
                                </button>
                            </div>
                        </div>

                        {/* Quick Content Upload (Teacher Feature) */}
                        <div className="school-card p-10 bg-white border-dashed border-2 border-slate-200 flex flex-col items-center justify-center text-center gap-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                                <BookOpen className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black">Publish New Lesson</h3>
                                <p className="text-slate-400 text-sm font-bold">Upload notes, videos, or reading materials for your students.</p>
                            </div>
                            <button
                                onClick={() => setShowContentModal(true)}
                                className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors"
                            >
                                Select Material
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                            <Settings className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">Module Under Development</h2>
                        <p className="text-slate-400 font-bold max-w-md">The "{view}" module is being synchronized with the mesh network. Check back shortly.</p>
                        <button
                            onClick={() => setView('analytics')}
                            className="text-teal-600 font-black uppercase tracking-widest text-xs hover:underline"
                        >
                            Return to Analytics
                        </button>
                    </div>
                )}
            </main>

            {/* Quiz Builder Modal */}
            {showQuizModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2.5rem] p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-black text-slate-900">Quiz Builder</h2>
                            <button onClick={() => setShowQuizModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateQuiz} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Quiz Title</label>
                                <input
                                    required
                                    type="text"
                                    value={newQuiz.title}
                                    onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 font-bold"
                                    placeholder="e.g. Introduction to Fractions"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Associated Lesson</label>
                                <select
                                    required
                                    value={newQuiz.content_id}
                                    onChange={(e) => setNewQuiz({ ...newQuiz, content_id: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 font-bold appearance-none cursor-pointer"
                                >
                                    <option value="">Select a Lesson</option>
                                    {allContent.map(c => (
                                        <option key={c.id} value={c.id}>{c.title} ({subjects.find(s => s.id === c.subject_id)?.name})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                                        <Sparkles className="text-white w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-indigo-900 text-sm">AI Quiz Assistant</h4>
                                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Powered by EduMesh Intelligence</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={generateAIQuiz}
                                    disabled={!newQuiz.content_id || loading}
                                    className="px-6 py-3 bg-white text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                    Generate Questions
                                </button>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-black text-slate-900">Questions</h4>
                                    <button
                                        type="button"
                                        onClick={() => setNewQuiz({ ...newQuiz, questions: [...newQuiz.questions, { text: '', options: ['', '', '', ''], correct: 0 }] })}
                                        className="text-teal-600 font-black text-xs uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Add Question
                                    </button>
                                </div>

                                {newQuiz.questions.map((q, qIndex) => (
                                    <div key={qIndex} className="p-6 bg-slate-50 rounded-3xl space-y-4">
                                        <input
                                            required
                                            type="text"
                                            value={q.text}
                                            onChange={(e) => {
                                                const qs = [...newQuiz.questions];
                                                qs[qIndex].text = e.target.value;
                                                setNewQuiz({ ...newQuiz, questions: qs });
                                            }}
                                            className="w-full px-4 py-3 bg-white border-none rounded-xl font-bold"
                                            placeholder={`Question ${qIndex + 1}`}
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            {q.options.map((opt, oIndex) => (
                                                <input
                                                    key={oIndex}
                                                    required
                                                    type="text"
                                                    value={opt}
                                                    onChange={(e) => {
                                                        const qs = [...newQuiz.questions];
                                                        qs[qIndex].options[oIndex] = e.target.value;
                                                        setNewQuiz({ ...newQuiz, questions: qs });
                                                    }}
                                                    className={`px-4 py-3 rounded-xl font-bold transition-all border-2 ${q.correct === oIndex ? 'border-teal-500 bg-teal-50' : 'bg-white border-transparent'}`}
                                                    placeholder={`Option ${oIndex + 1}`}
                                                    onClick={() => {
                                                        const qs = [...newQuiz.questions];
                                                        qs[qIndex].correct = oIndex;
                                                        setNewQuiz({ ...newQuiz, questions: qs });
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-teal-100 hover:bg-teal-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Finalize & Publish Quiz'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Content Publisher Modal */}
            {showContentModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-black text-slate-900">Publish Content</h2>
                            <button onClick={() => setShowContentModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateContent} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Subject</label>
                                <select
                                    required
                                    value={newContent.subject_id}
                                    onChange={(e) => setNewContent({ ...newContent, subject_id: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 font-bold appearance-none cursor-pointer"
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Lesson Title</label>
                                <input
                                    required
                                    type="text"
                                    value={newContent.title}
                                    onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 font-bold"
                                    placeholder="e.g. Photosynthesis Deep Dive"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Lesson Type</label>
                                <div className="flex gap-4">
                                    {['lesson', 'video', 'reading'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setNewContent({ ...newContent, type })}
                                            className={`flex-1 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border-2 ${newContent.type === type ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Content / Body</label>
                                <textarea
                                    required
                                    value={newContent.body}
                                    onChange={(e) => setNewContent({ ...newContent, body: e.target.value })}
                                    rows={4}
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 font-bold resize-none"
                                    placeholder="Type lesson content or provide a URL for videos..."
                                />
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-slate-100 hover:bg-slate-800 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Publishing...' : 'Blast to Students'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;
