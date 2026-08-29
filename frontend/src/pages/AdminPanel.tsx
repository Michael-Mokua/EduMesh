import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    Users, Shield, BookOpen, AlertCircle, CheckCircle2, 
    LogOut, Settings, BarChart3, Layout, Bell, Search,
    Activity, Database, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Marketplace from './Marketplace';

const AdminPanel: React.FC = () => {
    const { user, logout } = useAuth();
    const [view, setView] = useState<'users' | 'system' | 'logs' | 'marketplace'>('users');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const menuItems = [
        { id: 'users', label: 'User Registry', icon: Users },
        { id: 'system', label: 'System Health', icon: Shield },
        { id: 'marketplace', label: 'Marketplace', icon: Globe },
        { id: 'logs', label: 'Audit Logs', icon: Database },
    ];

    useEffect(() => {
        fetch('http://localhost:5000/api/auth/users')
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(err => console.error('Failed to fetch users:', err))
            .finally(() => setLoading(false));
    }, []);

    const updateUserRole = async (userId: number, newRole: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/auth/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });
            if (res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            }
        } catch (err) {
            console.error('Failed to update role:', err);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-['Inter']">
            {/* Sidebar */}
            <aside className="w-80 bg-slate-900 text-white p-8 flex flex-col hidden lg:flex">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <span className="text-xl font-black tracking-tight">EduMesh</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Core Admin</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id as any)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 font-bold ${
                                view === item.id 
                                ? 'bg-white/10 text-white shadow-sm' 
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 ${view === item.id ? 'text-indigo-400' : ''}`} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-8 pt-8 border-t border-white/10 space-y-2">
                    <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-colors font-bold">
                        <Settings className="w-5 h-5" />
                        Settings
                    </button>
                    <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-colors font-bold">
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto w-full">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-6">
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Infrastructure</h1>
                            <p className="text-slate-500 mt-1 font-medium text-sm">Welcome back, Super Admin.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative hidden md:block">
                                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search nodes..."
                                    className="pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64 text-sm font-medium transition-all"
                                />
                            </div>
                            <button className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-50 relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-3 right-3 w-2 h-2 bg-indigo-500 border-2 border-white rounded-full" />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        {view === 'users' ? (
                            <motion.div
                                key="users"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-8"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                                        <Users className="w-6 h-6 text-indigo-500" /> User Registry
                                    </h2>
                                    <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                                        + Manual Provision
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {users.map(u => (
                                        <div key={u.id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-bold">
                                                    {u.username[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-extrabold text-slate-900">{u.username}</div>
                                                    <div className="text-xs font-black text-indigo-500 uppercase tracking-widest mt-1">{u.role}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => updateUserRole(u.id, 'teacher')}
                                                    className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-xs font-black hover:bg-teal-600 hover:text-white transition-all border border-slate-100"
                                                >
                                                    Set Teacher
                                                </button>
                                                <button
                                                    onClick={() => updateUserRole(u.id, 'admin')}
                                                    className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-xs font-black hover:bg-indigo-600 hover:text-white transition-all border border-slate-100"
                                                >
                                                    Set Admin
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : view === 'system' ? (
                            <motion.div
                                key="system"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-8"
                            >
                                <div className="school-card p-10 bg-slate-900 text-white border-transparent">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                            <Shield className="w-6 h-6 text-teal-300" />
                                        </div>
                                        <h2 className="text-2xl font-black">Node Status</h2>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold opacity-60 italic">Local Intelligence Lake</span>
                                            <span className="flex items-center gap-2 text-emerald-400 font-black"><CheckCircle2 className="w-4 h-4" /> Healthy</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold opacity-60">P2P Mesh Engine</span>
                                            <span className="flex items-center gap-2 text-emerald-400 font-black"><CheckCircle2 className="w-4 h-4" /> Active</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold opacity-60 italic">National Auth Hub</span>
                                            <span className="flex items-center gap-2 text-amber-400 font-black"><AlertCircle className="w-4 h-4" /> Delayed</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4">
                                            <Activity className="w-12 h-12 text-indigo-50/50" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 mb-4">Security Audit</h3>
                                        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                                            Infrastructure is currently monitoring 4 active school nodes. Average sync latency: 142ms.
                                        </p>
                                        <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-colors">
                                            Initialize Protocol
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : view === 'marketplace' ? (
                            <motion.div key="marketplace" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="mb-8 flex items-center justify-between">
                                    <h2 className="text-xl font-black text-slate-800">Global Marketplace Management</h2>
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold">Review Payouts</button>
                                        <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Platform Settings</button>
                                    </div>
                                </div>
                                <Marketplace />
                            </motion.div>
                        ) : (
                            <motion.div key="logs" className="flex items-center justify-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                                <div className="text-center">
                                    <Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-400 font-bold">Audit logs are currently encrypted.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;
