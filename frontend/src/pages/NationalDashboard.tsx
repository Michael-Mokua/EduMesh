import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    Globe2, Users, TrendingUp, BarChart3, Download, LogOut,
    MapPin, AlertTriangle, CheckCircle2, School, Zap, BookOpen,
    Shield, Activity, ChevronRight
} from 'lucide-react';

const COUNTIES = [
    { name: 'Nairobi', schools: 412, students: 189_430, avgScore: 72, attendance: 91, trend: '+2.1%' },
    { name: 'Kiambu', schools: 287, students: 134_210, avgScore: 74, attendance: 89, trend: '+3.5%' },
    { name: 'Mombasa', schools: 198, students: 98_700, avgScore: 68, attendance: 85, trend: '+1.2%' },
    { name: 'Kisumu', schools: 234, students: 112_450, avgScore: 65, attendance: 83, trend: '+4.1%' },
    { name: 'Nakuru', schools: 318, students: 148_900, avgScore: 71, attendance: 88, trend: '+2.8%' },
    { name: 'Kajiado', schools: 142, students: 67_320, avgScore: 63, attendance: 80, trend: '+5.2%' },
    { name: 'Kakamega', schools: 276, students: 129_800, avgScore: 61, attendance: 78, trend: '+6.3%' },
    { name: 'Turkana', schools: 89, students: 41_200, avgScore: 48, attendance: 62, trend: '+11.4%' },
];

const NATIONAL_STATS = {
    total_students: 8_420_000,
    total_teachers: 312_000,
    total_schools: 23_400,
    counties_active: 47,
    avg_attendance: 84,
    avg_score: 67,
    at_risk_students: 142_000,
    top_subject: 'Kiswahili',
};

const POLICY_TEMPLATES = [
    { title: 'CBC Curriculum Alignment 2024', status: 'active', schools_applied: 18_420 },
    { title: 'Digital Literacy Programme Q2', status: 'active', schools_applied: 12_300 },
    { title: 'NEMIS Data Sync Protocol v3', status: 'pending', schools_applied: 0 },
    { title: 'Inclusive Education Guidelines', status: 'draft', schools_applied: 0 },
];

const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay } });

const NationalDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [tab, setTab] = useState<'overview' | 'counties' | 'policy' | 'reports'>('overview');

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <header className="border-b border-slate-800 sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-xl">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-white">National Education Dashboard</h1>
                            <p className="text-[11px] text-slate-400 font-medium">Ministry of Education · EduMesh Platform · Kenya</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900/40 border border-emerald-800 rounded-xl text-[11px] font-bold text-emerald-400">
                            <Activity className="w-3 h-3" /> Live
                        </div>
                        <button onClick={() => { }} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all">
                            <Download className="w-3.5 h-3.5" /> Export
                        </button>
                        <button onClick={logout} className="w-8 h-8 bg-slate-800 hover:bg-red-900 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-400 transition-all">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                {/* National KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Students Enrolled', value: '8.42M', subval: 'nationwide', icon: Users, color: 'from-indigo-500 to-violet-600' },
                        { label: 'Teachers Active', value: '312K', subval: 'certified staff', icon: BookOpen, color: 'from-teal-500 to-cyan-600' },
                        { label: 'Schools on Platform', value: '23,400', subval: `of 47 counties`, icon: School, color: 'from-amber-500 to-orange-600' },
                        { label: 'At-Risk Students', value: '142K', subval: 'need intervention', icon: AlertTriangle, color: 'from-red-500 to-rose-600' },
                    ].map((kpi, i) => (
                        <motion.div key={kpi.label} {...fadeUp(i * 0.08)}
                            className="bg-slate-800 rounded-2xl p-5 border border-slate-700 overflow-hidden relative">
                            <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full bg-gradient-to-br ${kpi.color} opacity-15`} />
                            <kpi.icon className="w-5 h-5 text-slate-400 mb-3" />
                            <p className="text-2xl font-black text-white">{kpi.value}</p>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">{kpi.label}</p>
                            <p className="text-[10px] text-slate-500 mt-1">{kpi.subval}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Secondary stats */}
                <motion.div {...fadeUp(0.3)} className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'National Avg Attendance', value: `${NATIONAL_STATS.avg_attendance}%`, icon: CheckCircle2, ok: true },
                        { label: 'National Avg Score', value: `${NATIONAL_STATS.avg_score}%`, icon: TrendingUp, ok: NATIONAL_STATS.avg_score >= 70 },
                        { label: 'Top Subject', value: NATIONAL_STATS.top_subject, icon: Zap, ok: true },
                    ].map(m => (
                        <div key={m.label} className="bg-slate-800 rounded-2xl p-4 border border-slate-700 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.ok ? 'bg-emerald-900/50' : 'bg-amber-900/50'}`}>
                                <m.icon className={`w-5 h-5 ${m.ok ? 'text-emerald-400' : 'text-amber-400'}`} />
                            </div>
                            <div>
                                <p className="text-lg font-black text-white">{m.value}</p>
                                <p className="text-[11px] text-slate-400 font-medium">{m.label}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Tab bar */}
                <div className="flex gap-1 bg-slate-800 rounded-2xl p-1 w-fit border border-slate-700">
                    {(['overview', 'counties', 'policy', 'reports'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all duration-200
                                ${tab === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* Overview tab — county heatmap table */}
                {tab === 'overview' && (
                    <motion.div {...fadeUp()} className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-700">
                            <h2 className="font-bold text-white flex items-center gap-2"><Globe2 className="w-4 h-4 text-amber-400" /> Counties Overview</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-700">
                                        <th className="text-left px-6 py-3">County</th>
                                        <th className="text-right px-4 py-3">Schools</th>
                                        <th className="text-right px-4 py-3">Students</th>
                                        <th className="text-right px-4 py-3">Attendance</th>
                                        <th className="text-right px-4 py-3">Avg Score</th>
                                        <th className="text-right px-4 py-3">Growth</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {COUNTIES.map(c => (
                                        <tr key={c.name} className="hover:bg-slate-700/40 transition-colors">
                                            <td className="px-6 py-3.5 font-semibold text-white flex items-center gap-2">
                                                <MapPin className="w-3.5 h-3.5 text-slate-500" /> {c.name}
                                            </td>
                                            <td className="px-4 py-3.5 text-right text-slate-300">{c.schools}</td>
                                            <td className="px-4 py-3.5 text-right text-slate-300">{c.students.toLocaleString()}</td>
                                            <td className="px-4 py-3.5 text-right">
                                                <span className={`font-bold ${c.attendance >= 85 ? 'text-emerald-400' : c.attendance >= 70 ? 'text-amber-400' : 'text-red-400'}`}>{c.attendance}%</span>
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${c.avgScore}%` }} />
                                                    </div>
                                                    <span className="text-slate-300 font-bold w-8 text-right">{c.avgScore}%</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-right text-emerald-400 font-bold text-xs">{c.trend}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* Counties detail */}
                {tab === 'counties' && (
                    <motion.div {...fadeUp()} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {COUNTIES.map(c => (
                            <div key={c.name} className="bg-slate-800 rounded-2xl p-5 border border-slate-700 hover:border-indigo-700 transition-colors cursor-pointer">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-white">{c.name} County</h3>
                                        <p className="text-xs text-slate-400 font-medium">{c.schools} schools · {c.students.toLocaleString()} students</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-500" />
                                </div>
                                <div className="space-y-2.5">
                                    {[
                                        { label: 'Attendance', value: c.attendance, color: '#10b981' },
                                        { label: 'Avg Score', value: c.avgScore, color: '#6366f1' },
                                    ].map(m => (
                                        <div key={m.label}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-slate-400 font-medium">{m.label}</span>
                                                <span className="font-bold text-white">{m.value}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                <motion.div className="h-full rounded-full" style={{ backgroundColor: m.color }}
                                                    initial={{ width: 0 }} animate={{ width: `${m.value}%` }} transition={{ duration: 0.8 }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-3 text-xs text-emerald-400 font-bold">{c.trend} growth this term</div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* Policy templates */}
                {tab === 'policy' && (
                    <motion.div {...fadeUp()} className="space-y-4">
                        <div className="bg-amber-900/20 border border-amber-800 rounded-2xl p-4 flex items-start gap-3">
                            <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-300 font-medium">Policy templates are distributed from the national level to all county and school admins for curriculum compliance. Changes propagate on next sync.</p>
                        </div>
                        {POLICY_TEMPLATES.map(p => (
                            <div key={p.title} className="bg-slate-800 rounded-2xl p-5 border border-slate-700 flex items-center gap-4">
                                <div className={`w-3 h-10 rounded-full flex-shrink-0 ${p.status === 'active' ? 'bg-emerald-500' : p.status === 'pending' ? 'bg-amber-500' : 'bg-slate-600'}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white text-sm">{p.title}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {p.status === 'active' ? `Active · ${p.schools_applied.toLocaleString()} schools applied` : p.status === 'pending' ? 'Pending approval' : 'Draft — not published'}
                                    </p>
                                </div>
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize
                                    ${p.status === 'active' ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-800' : p.status === 'pending' ? 'bg-amber-900/60 text-amber-400 border border-amber-800' : 'bg-slate-700 text-slate-400 border border-slate-600'}`}>
                                    {p.status}
                                </span>
                            </div>
                        ))}
                        <button className="w-full py-3 border-2 border-dashed border-slate-700 rounded-2xl text-xs font-semibold text-slate-400 hover:border-indigo-600 hover:text-indigo-400 transition-all">
                            + Create New Policy Template
                        </button>
                    </motion.div>
                )}

                {/* Reports tab */}
                {tab === 'reports' && (
                    <motion.div {...fadeUp()} className="space-y-4">
                        {[
                            { title: 'National Progress Report Q2 2024', desc: 'All 47 counties, all schools, CBC alignment', icon: '📊', size: '4.2MB' },
                            { title: 'NEMIS National Enrollment Data', desc: 'Formatted for Ministry NEMIS upload', icon: '🏛️', size: '18.7MB' },
                            { title: 'At-Risk Student National Register', desc: '142,000 students flagged for intervention', icon: '⚠️', size: '2.1MB' },
                            { title: 'Digital Literacy Programme Report', desc: 'Device distribution and usage metrics', icon: '💻', size: '1.8MB' },
                            { title: 'Teacher Deployment Audit', desc: 'Teacher-to-student ratios per county', icon: '👩‍🏫', size: '3.4MB' },
                        ].map(r => (
                            <div key={r.title} className="bg-slate-800 rounded-2xl p-5 border border-slate-700 flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-2xl">{r.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-white">{r.title}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{r.desc}</p>
                                    <p className="text-[10px] text-slate-500 mt-1">{r.size}</p>
                                </div>
                                <button className="flex items-center gap-1.5 px-3 py-2 bg-indigo-800/60 text-indigo-300 text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-all flex-shrink-0 border border-indigo-700">
                                    <Download className="w-3.5 h-3.5" /> Export
                                </button>
                            </div>
                        ))}
                    </motion.div>
                )}

                <div className="text-center pb-4">
                    <p className="text-[11px] text-slate-600 font-medium">EduMesh National Platform · Ministry of Education Kenya · Data as of {new Date().toLocaleDateString()}</p>
                </div>
            </main>
        </div>
    );
};

export default NationalDashboard;
