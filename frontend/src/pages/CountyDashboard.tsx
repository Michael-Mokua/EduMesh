import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    BarChart3, Users, TrendingUp, School, Download, LogOut,
    MapPin, AlertTriangle, CheckCircle2, Wifi, WifiOff, ChevronDown
} from 'lucide-react';

const SCHOOLS = [
    { id: 1, name: 'Makini Primary', students: 342, attendance: 92, avg_score: 74, status: 'good' },
    { id: 2, name: 'St. Mary\'s School', students: 218, attendance: 88, avg_score: 68, status: 'good' },
    { id: 3, name: 'Jomo Kenyatta High', students: 510, attendance: 79, avg_score: 55, status: 'at_risk' },
    { id: 4, name: 'Ngong Hills Academy', students: 156, attendance: 95, avg_score: 81, status: 'excellent' },
    { id: 5, name: 'Kiserian Girls', students: 223, attendance: 84, avg_score: 63, status: 'good' },
    { id: 6, name: 'Rift Valley Primary', students: 89, attendance: 71, avg_score: 48, status: 'critical' },
];

const SUBJECT_PERFORMANCE = [
    { name: 'Mathematics', avg: 64, color: '#3b82f6' },
    { name: 'English', avg: 71, color: '#8b5cf6' },
    { name: 'Science', avg: 68, color: '#10b981' },
    { name: 'Kiswahili', avg: 79, color: '#f59e0b' },
    { name: 'Social Studies', avg: 73, color: '#0ea5e9' },
];

const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, delay } });

const statusConfig = {
    excellent: { label: 'Excellent', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    good: { label: 'Good', color: 'text-blue-600 bg-blue-50 border-blue-100' },
    at_risk: { label: 'At Risk', color: 'text-amber-600 bg-amber-50 border-amber-100' },
    critical: { label: 'Critical', color: 'text-red-600 bg-red-50 border-red-100' },
};

const CountyDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [selectedSchool, setSelectedSchool] = useState<number | null>(null);
    const [tab, setTab] = useState<'schools' | 'performance' | 'reports'>('schools');
    const [isOnline] = useState(navigator.onLine);

    const totalStudents = SCHOOLS.reduce((s, sc) => s + sc.students, 0);
    const avgAttendance = Math.round(SCHOOLS.reduce((s, sc) => s + sc.attendance, 0) / SCHOOLS.length);
    const avgScore = Math.round(SCHOOLS.reduce((s, sc) => s + sc.avg_score, 0) / SCHOOLS.length);
    const atRiskSchools = SCHOOLS.filter(sc => sc.status === 'at_risk' || sc.status === 'critical').length;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                            <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-slate-900">County Dashboard</h1>
                            <p className="text-[10px] text-slate-400">{user?.county || 'Kajiado County'} · EduMesh Platform</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                            {isOnline ? 'Live Data' : 'Last Sync'}
                        </span>
                        <button onClick={() => { }} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">
                            <Download className="w-3.5 h-3.5" /> Export
                        </button>
                        <button onClick={logout} className="w-8 h-8 bg-slate-100 hover:bg-red-100 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-500 transition-all">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
                {/* KPI cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Students', value: totalStudents.toLocaleString(), icon: Users, color: 'from-indigo-500 to-violet-600', change: '+3.2%' },
                        { label: 'Avg Attendance', value: `${avgAttendance}%`, icon: CheckCircle2, color: 'from-emerald-500 to-teal-600', change: '+1.1%' },
                        { label: 'Avg Score', value: `${avgScore}%`, icon: TrendingUp, color: 'from-amber-500 to-orange-600', change: '+5.8%' },
                        { label: 'At-Risk Schools', value: atRiskSchools, icon: AlertTriangle, color: 'from-red-500 to-rose-600', change: `-${atRiskSchools > 0 ? '0' : '1'}` },
                    ].map((kpi, i) => (
                        <motion.div key={kpi.label} {...fadeUp(i * 0.08)}
                            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 overflow-hidden relative">
                            <div className={`absolute -right-3 -top-3 w-16 h-16 rounded-full bg-gradient-to-br ${kpi.color} opacity-10`} />
                            <kpi.icon className="w-5 h-5 text-slate-400 mb-3" />
                            <p className="text-2xl font-black text-slate-900">{kpi.value}</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">{kpi.label}</p>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md mt-2 inline-block">{kpi.change}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Tab bar */}
                <div className="flex gap-1 bg-slate-200/60 rounded-2xl p-1 w-fit">
                    {(['schools', 'performance', 'reports'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all duration-200
                                ${tab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* Schools table */}
                {tab === 'schools' && (
                    <motion.div {...fadeUp()} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                <School className="w-4 h-4 text-indigo-500" /> Schools in {user?.county || 'Kajiado County'}
                            </h2>
                            <span className="text-xs text-slate-400 font-medium">{SCHOOLS.length} schools</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                                        <th className="text-left px-6 py-3">School</th>
                                        <th className="text-right px-4 py-3">Students</th>
                                        <th className="text-right px-4 py-3">Attendance</th>
                                        <th className="text-right px-4 py-3">Avg Score</th>
                                        <th className="text-right px-4 py-3">Status</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {SCHOOLS.map(sc => {
                                        const cfg = statusConfig[sc.status as keyof typeof statusConfig];
                                        return (
                                            <tr key={sc.id} className="hover:bg-slate-50 transition-colors cursor-pointer"
                                                onClick={() => setSelectedSchool(selectedSchool === sc.id ? null : sc.id)}>
                                                <td className="px-6 py-4 font-semibold text-slate-800">{sc.name}</td>
                                                <td className="px-4 py-4 text-right text-slate-600">{sc.students}</td>
                                                <td className="px-4 py-4 text-right">
                                                    <span className={`font-bold ${sc.attendance >= 85 ? 'text-emerald-600' : sc.attendance >= 70 ? 'text-amber-600' : 'text-red-500'}`}>{sc.attendance}%</span>
                                                </td>
                                                <td className="px-4 py-4 text-right font-bold text-slate-700">{sc.avg_score}%</td>
                                                <td className="px-4 py-4 text-right">
                                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${cfg.color}`}>{cfg.label}</span>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${selectedSchool === sc.id ? 'rotate-180' : ''}`} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* Performance tab */}
                {tab === 'performance' && (
                    <motion.div {...fadeUp()} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-indigo-500" /> Subject Performance — County Average
                        </h2>
                        <div className="space-y-5">
                            {SUBJECT_PERFORMANCE.map(s => (
                                <div key={s.name}>
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="font-semibold text-slate-700">{s.name}</span>
                                        <span style={{ color: s.color }} className="font-bold">{s.avg}% average</span>
                                    </div>
                                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div className="h-full rounded-full" style={{ backgroundColor: s.color }}
                                            initial={{ width: 0 }} animate={{ width: `${s.avg}%` }} transition={{ duration: 0.9, ease: 'easeOut' }} />
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        {s.avg >= 70 ? '✅ Meeting CBC targets' : '⚠️ Below CBC threshold (70%)'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Reports tab */}
                {tab === 'reports' && (
                    <motion.div {...fadeUp()} className="space-y-4">
                        {[
                            { title: 'County Term 2 Progress Report', desc: 'All schools, all subjects, attendance & scores', icon: '📊' },
                            { title: 'NEMIS Enrollment Export', desc: 'Formatted for Kenya NEMIS system upload', icon: '🏛️' },
                            { title: 'At-Risk Student Alert Report', desc: 'Students flagged for intervention', icon: '⚠️' },
                            { title: 'Teacher Performance Summary', desc: 'Lesson delivery and class mastery rates', icon: '👩‍🏫' },
                        ].map(r => (
                            <div key={r.title} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl">{r.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-slate-800">{r.title}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
                                </div>
                                <button className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-xl hover:bg-indigo-100 transition-all flex-shrink-0">
                                    <Download className="w-3.5 h-3.5" /> Export
                                </button>
                            </div>
                        ))}
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default CountyDashboard;
