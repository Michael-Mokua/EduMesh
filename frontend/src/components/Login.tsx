import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Lock, User, Loader2, Sparkles, GraduationCap,
    PenTool, FlaskConical, ArrowRight, ArrowLeft, CheckCircle2,
    Mail, ShieldCheck, Github, Eye, EyeOff, Atom, Calculator,
    Music, Globe2, Zap, Star
} from 'lucide-react';

// ─── Animation Variants ──────────────────────────────────────────
const pageVariants = {
    initial: { opacity: 0, y: 24, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -16, scale: 0.98, transition: { duration: 0.25 } },
};

const stepVariants = {
    initial: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40, transition: { duration: 0.2 } }),
};

const floatVariant = (delay = 0, amplitude = 12) => ({
    animate: {
        y: [0, -amplitude, 0],
        transition: { duration: 4 + delay, repeat: Infinity, ease: 'easeInOut', delay },
    },
});

// ─── Background floating icons config ────────────────────────────
const BG_ICONS = [
    { Icon: GraduationCap, top: '8%', left: '6%', size: 36, delay: 0, color: '#818cf8' },
    { Icon: FlaskConical, top: '15%', right: '8%', size: 28, delay: 1.5, color: '#34d399' },
    { Icon: Calculator, bottom: '20%', left: '4%', size: 32, delay: 0.8, color: '#60a5fa' },
    { Icon: Atom, top: '55%', right: '5%', size: 40, delay: 2, color: '#f472b6' },
    { Icon: PenTool, bottom: '10%', right: '18%', size: 26, delay: 1, color: '#fbbf24' },
    { Icon: Music, top: '40%', left: '3%', size: 24, delay: 2.5, color: '#c084fc' },
    { Icon: Globe2, bottom: '35%', right: '3%', size: 30, delay: 0.5, color: '#2dd4bf' },
    { Icon: BookOpen, top: '25%', left: '10%', size: 22, delay: 3.5, color: '#f87171' },
];

// ─── Subject chips for step 3 ─────────────────────────────────────
const SUBJECTS = ['Mathematics', 'Science', 'English', 'History', 'Art', 'Music', 'Geography', 'Computer Science'];

// ─── Avatar options ────────────────────────────────────────────────
const AVATAR_COLORS = [
    { id: 'indigo', bg: 'from-indigo-500 to-violet-600', label: 'Cosmic' },
    { id: 'teal', bg: 'from-teal-400 to-cyan-600', label: 'Ocean' },
    { id: 'rose', bg: 'from-rose-400 to-pink-600', label: 'Nova' },
    { id: 'amber', bg: 'from-amber-400 to-orange-500', label: 'Solar' },
    { id: 'emerald', bg: 'from-emerald-400 to-green-600', label: 'Forest' },
    { id: 'purple', bg: 'from-purple-500 to-fuchsia-600', label: 'Galaxy' },
];

// ─── Step metadata ─────────────────────────────────────────────────
const REG_STEPS = [
    { number: 1, label: 'Your Identity', emoji: '👋', tagline: "Let's get you set up!" },
    { number: 2, label: 'Pick Your Role', emoji: '🎓', tagline: 'How will you use EduMesh?' },
    { number: 3, label: 'Interests', emoji: '💡', tagline: 'What excites you to learn?' },
    { number: 4, label: 'Your Style', emoji: '🎨', tagline: 'Make it yours!' },
];

const Login: React.FC = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);

    // Form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState<'student' | 'teacher'>('student');
    const [subjects, setSubjects] = useState<string[]>([]);
    const [avatar, setAvatar] = useState('indigo');

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const { login } = useAuth();
    const totalSteps = 4;

    const goNext = () => {
        setDirection(1);
        setStep(s => Math.min(s + 1, totalSteps));
    };

    const goBack = () => {
        setDirection(-1);
        if (step === 1) {
            setIsRegister(false);
            setStep(1);
        } else {
            setStep(s => s - 1);
        }
    };

    const toggleSubject = (s: string) => {
        setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isRegister && step < totalSteps) {
            goNext();
            return;
        }

        setLoading(true);
        setError('');

        const endpoint = isRegister ? 'register' : 'login';
        const body = isRegister ? { username, password, role } : { username, password };

        try {
            const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();

            if (res.ok) {
                if (isRegister) {
                    setSuccess(true);
                    setTimeout(() => {
                        setIsRegister(false); setStep(1); setSuccess(false);
                        setError('Account created! Please sign in.');
                    }, 2500);
                } else {
                    login(data.token, data.user);
                }
            } else {
                setError(data.error || `${isRegister ? 'Registration' : 'Login'} failed`);
            }
        } catch {
            setError('Could not reach the server. Are you online?');
        } finally {
            setLoading(false);
        }
    };

    // ─── Step Content ────────────────────────────────────────────────
    const renderStep = () => {
        if (!isRegister) {
            return (
                <div className="space-y-5">
                    {/* Username */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Username</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
                            <input
                                required type="text" value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all duration-200"
                            />
                        </div>
                    </div>
                    {/* Password */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
                            <input
                                required type={showPassword ? 'text' : 'password'} value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all duration-200"
                            />
                            <button type="button" onClick={() => setShowPassword(s => !s)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <div className="flex justify-end pt-0.5">
                            <button type="button" className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors">
                                Forgot password?
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        switch (step) {
            case 1: return (
                <div className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Username</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
                            <input required type="text" value={username} onChange={e => setUsername(e.target.value)}
                                placeholder="e.g. EinsteinJr"
                                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all duration-200" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
                            <input required type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="Make it strong!"
                                className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all duration-200" />
                            <button type="button" onClick={() => setShowPassword(s => !s)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            );
            case 2: return (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        {(['student', 'teacher'] as const).map(r => (
                            <motion.button key={r} type="button" onClick={() => setRole(r)}
                                whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                                className={`p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-3 text-left
                                    ${role === r
                                        ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100'
                                        : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'}`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${role === r ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'} transition-all duration-200`}>
                                    {r === 'student' ? <GraduationCap size={22} /> : <ShieldCheck size={22} />}
                                </div>
                                <div>
                                    <p className={`font-bold text-sm capitalize ${role === r ? 'text-indigo-700' : 'text-slate-700'}`}>{r}</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        {r === 'student' ? 'I want to learn' : 'I want to teach'}
                                    </p>
                                </div>
                                {role === r && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3">
                                        <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                                    </motion.div>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>
            );
            case 3: return (
                <div className="space-y-4">
                    <p className="text-xs text-slate-500 font-medium">Select all that interest you</p>
                    <div className="flex flex-wrap gap-2">
                        {SUBJECTS.map(s => {
                            const active = subjects.includes(s);
                            return (
                                <motion.button key={s} type="button" onClick={() => toggleSubject(s)}
                                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                    className={`px-3.5 py-2 rounded-full text-xs font-semibold border-2 transition-all duration-200
                                        ${active
                                            ? 'border-indigo-500 bg-indigo-500 text-white shadow-md shadow-indigo-200'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
                                >
                                    {s}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            );
            case 4: return (
                <div className="space-y-5">
                    <p className="text-xs text-slate-500 font-medium">Choose your EduMesh colour theme</p>
                    <div className="grid grid-cols-3 gap-3">
                        {AVATAR_COLORS.map(col => (
                            <motion.button key={col.id} type="button" onClick={() => setAvatar(col.id)}
                                whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}
                                className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-200
                                    ${avatar === col.id ? 'border-indigo-500 shadow-lg shadow-indigo-100 bg-indigo-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                            >
                                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${col.bg}`} />
                                <span className="text-[10px] font-bold text-slate-600">{col.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            );
        }
    };

    // ─── Render ──────────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 40%, #f0fdfa 100%)' }}>

            {/* ── Animated background blobs ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.12]"
                    style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)', animation: 'float-blob 22s infinite alternate' }} />
                <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.10]"
                    style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)', animation: 'float-blob 28s infinite alternate-reverse' }} />
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full opacity-[0.06]"
                    style={{ background: 'radial-gradient(circle, #0d9488, transparent 70%)', animation: 'float-blob 18s infinite' }} />
            </div>

            {/* ── Floating background icons ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {BG_ICONS.map(({ Icon, size, delay, color, ...pos }, i) => (
                    <motion.div key={i}
                        className="absolute opacity-[0.12]"
                        style={{ ...pos, color }}
                        animate={{ y: [0, -14, 0], rotate: [0, 6, 0] }}
                        transition={{ duration: 5 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
                    >
                        <Icon size={size} />
                    </motion.div>
                ))}
            </div>

            {/* ── Main card ── */}
            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as any }}
                className="w-full max-w-md relative z-10"
            >
                {/* Mascot — peeking above the card */}
                <motion.div
                    className="absolute -top-14 left-8 w-20 h-20 z-20 pointer-events-none select-none"
                    initial={{ opacity: 0, y: 20, rotate: -15 }}
                    animate={{ opacity: 1, y: [0, -8, 0], rotate: [0, 3, 0] }}
                    transition={{
                        opacity: { duration: 0.5, delay: 0.3 },
                        y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 },
                        rotate: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 },
                    }}
                >
                    <img src="/assets/mascot.png" alt="EduMesh Mascot" className="w-full h-full object-contain drop-shadow-xl" />
                </motion.div>

                {/* Card */}
                <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-xl shadow-slate-200/60 p-8">

                    {/* ── Brand header ── */}
                    <div className="flex items-center gap-3 mb-7">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 leading-tight">EduMesh</h1>
                            <p className="text-[11px] text-slate-400 font-medium">
                                {isRegister
                                    ? `${REG_STEPS[step - 1]?.emoji} ${REG_STEPS[step - 1]?.tagline}`
                                    : 'Welcome back to your classroom 👋'}
                            </p>
                        </div>
                    </div>

                    {/* ── Registration step indicator ── */}
                    <AnimatePresence>
                        {isRegister && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                className="mb-6 overflow-hidden">
                                {/* Step dots */}
                                <div className="flex items-center gap-2 mb-3">
                                    {REG_STEPS.map(s => (
                                        <div key={s.number} className="flex items-center gap-2">
                                            <motion.div
                                                animate={{ scale: step === s.number ? 1.1 : 1 }}
                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300
                                                    ${step > s.number ? 'bg-indigo-500 text-white' : step === s.number ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-400' : 'bg-slate-100 text-slate-400'}`}
                                            >
                                                {step > s.number ? '✓' : s.number}
                                            </motion.div>
                                            {s.number < totalSteps && (
                                                <div className="h-0.5 w-6 rounded-full overflow-hidden bg-slate-100">
                                                    <motion.div animate={{ width: step > s.number ? '100%' : '0%' }}
                                                        className="h-full bg-indigo-500" transition={{ duration: 0.4 }} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <span className="ml-auto text-[11px] font-semibold text-slate-400">
                                        {Math.round((step / totalSteps) * 100)}%
                                    </span>
                                </div>
                                {/* Step label */}
                                <div className="flex items-baseline gap-2">
                                    <span className="text-base font-bold text-slate-900">{REG_STEPS[step - 1]?.label}</span>
                                    <span className="text-xs text-slate-400 font-medium">Step {step} of {totalSteps}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Success screen ── */}
                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                className="flex flex-col items-center text-center py-6 gap-4">
                                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                                    <img src="/assets/celebration.png" alt="Success" className="w-40 h-40 object-contain" />
                                </motion.div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-1">You're in! 🎉</h2>
                                    <p className="text-slate-500 text-sm">Welcome to EduMesh. Your journey starts now.</p>
                                </div>
                                <div className="flex gap-1 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                                            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.form key={isRegister ? `step-${step}` : 'login'}
                                initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
                                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as any }}
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >
                                {renderStep()}

                                {/* Error */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            className="flex items-center gap-2.5 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-medium">
                                            <div className="w-4 h-4 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">!</div>
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Action buttons */}
                                <div className="flex gap-3 pt-1">
                                    {isRegister && (
                                        <motion.button type="button" onClick={goBack} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                            className="w-11 h-11 rounded-2xl border-2 border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-all flex-shrink-0">
                                            <ArrowLeft className="w-4 h-4" />
                                        </motion.button>
                                    )}
                                    <motion.button type="submit" disabled={loading}
                                        whileHover={{ y: -1, boxShadow: '0 10px 30px rgba(99,102,241,0.35)' }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 h-11 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all duration-200 shadow-lg shadow-indigo-200"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                {isRegister
                                                    ? (step < totalSteps ? 'Continue' : 'Create Account')
                                                    : 'Sign In'}
                                                {!loading && <ArrowRight className="w-4 h-4" />}
                                            </>
                                        )}
                                    </motion.button>
                                </div>

                                {/* Social login — only on login page */}
                                {!isRegister && (
                                    <div className="space-y-4 pt-2">
                                        <div className="relative flex items-center gap-3">
                                            <div className="flex-1 h-px bg-slate-100" />
                                            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">or continue with</span>
                                            <div className="flex-1 h-px bg-slate-100" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                {
                                                    label: 'Google', Icon: () => (
                                                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                        </svg>
                                                    )
                                                },
                                                { label: 'GitHub', Icon: () => <Github className="w-4 h-4" /> },
                                            ].map(({ label, Icon }) => (
                                                <motion.button key={label} type="button"
                                                    whileHover={{ y: -1, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                                                    whileTap={{ scale: 0.97 }}
                                                    className="flex items-center justify-center gap-2.5 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-700 font-medium text-sm hover:border-slate-300 transition-all duration-200"
                                                >
                                                    <Icon />
                                                    {label}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Switch mode */}
                                <div className="text-center pt-1">
                                    <span className="text-xs text-slate-500">
                                        {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                                    </span>
                                    <button type="button"
                                        onClick={() => { setIsRegister(!isRegister); setStep(1); setError(''); }}
                                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                                        {isRegister ? 'Sign In' : 'Get started free →'}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                {/* Subtle tagline below card */}
                <motion.p className="text-center text-[11px] text-slate-400 mt-5 font-medium"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                    <Zap className="inline w-3 h-3 mr-1 text-amber-400" />
                    Powered by EduMesh · Built for learners
                </motion.p>
            </motion.div>
        </div>
    );
};

export default Login;
