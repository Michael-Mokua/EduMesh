import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db, getUserStats, addXP, UserStats } from '../db';
import { Lock, Star, Zap, Trophy, CheckCircle2, BookOpen, ArrowLeft, Flame } from 'lucide-react';

// ── Type Definitions ─────────────────────────────────────────────
interface SkillNode {
    id: string;
    label: string;
    subject: string;
    emoji: string;
    xp: number;
    x: number;
    y: number;
    requires: string[];
    description: string;
    type: 'core' | 'elective' | 'challenge' | 'boss';
}

// ── Skill Tree Data (CBC-Aligned) ─────────────────────────────────
const SKILL_TREE: SkillNode[] = [
    // Root
    { id: 'start', label: 'Learner', subject: 'All', emoji: '🌱', xp: 0, x: 400, y: 60, requires: [], description: 'Begin your learning journey!', type: 'core' },

    // Mathematics branch
    { id: 'math-1', label: 'Number Sense', subject: 'Math', emoji: '🔢', xp: 20, x: 160, y: 160, requires: ['start'], description: 'Understand numbers and counting.', type: 'core' },
    { id: 'math-2', label: 'Arithmetic', subject: 'Math', emoji: '➕', xp: 30, x: 80, y: 280, requires: ['math-1'], description: 'Master addition, subtraction, multiplication and division.', type: 'core' },
    { id: 'math-3', label: 'Algebra', subject: 'Math', emoji: '🧮', xp: 40, x: 120, y: 400, requires: ['math-2'], description: 'Solve equations and find unknowns.', type: 'core' },
    { id: 'math-4', label: 'Geometry', subject: 'Math', emoji: '📐', xp: 40, x: 200, y: 400, requires: ['math-2'], description: 'Shapes, angles, and spatial reasoning.', type: 'elective' },
    { id: 'math-boss', label: 'Math Champion', subject: 'Math', emoji: '🏆', xp: 100, x: 160, y: 520, requires: ['math-3', 'math-4'], description: 'Prove your mastery across all maths!', type: 'boss' },

    // Science branch
    { id: 'sci-1', label: 'Observation', subject: 'Science', emoji: '🔬', xp: 20, x: 400, y: 180, requires: ['start'], description: 'The scientific method begins with curiosity.', type: 'core' },
    { id: 'sci-2', label: 'Biology', subject: 'Science', emoji: '🧬', xp: 35, x: 320, y: 300, requires: ['sci-1'], description: 'Cells, organisms, ecosystems.', type: 'core' },
    { id: 'sci-3', label: 'Chemistry', subject: 'Science', emoji: '⚗️', xp: 35, x: 400, y: 300, requires: ['sci-1'], description: 'Elements, reactions, and matter.', type: 'elective' },
    { id: 'sci-4', label: 'Physics', subject: 'Science', emoji: '⚡', xp: 40, x: 480, y: 300, requires: ['sci-1'], description: 'Forces, energy, and the universe.', type: 'elective' },
    { id: 'sci-boss', label: 'Scientist', subject: 'Science', emoji: '👩‍🔬', xp: 100, x: 400, y: 420, requires: ['sci-2', 'sci-3'], description: 'The complete scientist!', type: 'boss' },

    // English branch
    { id: 'eng-1', label: 'Reading', subject: 'English', emoji: '📖', xp: 20, x: 620, y: 160, requires: ['start'], description: 'Comprehension and fluency.', type: 'core' },
    { id: 'eng-2', label: 'Writing', subject: 'English', emoji: '✍️', xp: 30, x: 680, y: 280, requires: ['eng-1'], description: 'Express yourself through words.', type: 'core' },
    { id: 'eng-3', label: 'Grammar', subject: 'English', emoji: '📝', xp: 30, x: 580, y: 280, requires: ['eng-1'], description: 'The rules of language.', type: 'elective' },
    { id: 'eng-4', label: 'Literature', subject: 'English', emoji: '📚', xp: 50, x: 640, y: 400, requires: ['eng-2', 'eng-3'], description: 'Explore stories, poems, and plays.', type: 'challenge' },
    { id: 'eng-boss', label: 'Author', subject: 'English', emoji: '🖊️', xp: 100, x: 640, y: 520, requires: ['eng-4'], description: 'Master storyteller!', type: 'boss' },

    // Kiswahili elective
    { id: 'sw-1', label: 'Kiswahili', subject: 'Kiswahili', emoji: '🌍', xp: 25, x: 760, y: 280, requires: ['eng-1'], description: 'Jifunze Kiswahili!', type: 'elective' },
    { id: 'sw-2', label: 'Fasihi', subject: 'Kiswahili', emoji: '📜', xp: 40, x: 760, y: 400, requires: ['sw-1'], description: 'Ushairi na hadithi.', type: 'elective' },
];

// ── Color maps ────────────────────────────────────────────────────
const SUBJECT_COLORS: Record<string, { bg: string; stroke: string; text: string }> = {
    Math: { bg: '#eff6ff', stroke: '#3b82f6', text: '#1d4ed8' },
    Science: { bg: '#ecfdf5', stroke: '#10b981', text: '#065f46' },
    English: { bg: '#f5f3ff', stroke: '#8b5cf6', text: '#5b21b6' },
    Kiswahili: { bg: '#fffbeb', stroke: '#f59e0b', text: '#92400e' },
    All: { bg: '#fdf4ff', stroke: '#d946ef', text: '#86198f' },
};

const TYPE_BADGE: Record<string, string> = {
    boss: '👑', elective: '✨', challenge: '🔥', core: '',
};

// ── Confetti Component ────────────────────────────────────────────
const Confetti: React.FC<{ onDone: () => void }> = ({ onDone }) => {
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#a855f7'];
    useEffect(() => { const t = setTimeout(onDone, 2000); return () => clearTimeout(t); }, [onDone]);
    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {Array.from({ length: 48 }).map((_, i) => (
                <motion.div key={i}
                    className="absolute w-2.5 h-2.5 rounded-sm"
                    style={{
                        backgroundColor: colors[i % colors.length],
                        left: `${Math.random() * 100}%`,
                        top: '-20px',
                    }}
                    animate={{
                        y: ['0vh', '110vh'],
                        x: [`${(Math.random() - 0.5) * 200}px`, `${(Math.random() - 0.5) * 400}px`],
                        rotate: [0, Math.random() * 720 - 360],
                        opacity: [1, 1, 0],
                    }}
                    transition={{ duration: 2, delay: Math.random() * 0.8, ease: 'easeIn' }}
                />
            ))}
        </div>
    );
};

// ── Badges List ───────────────────────────────────────────────────
const ALL_BADGES = [
    { id: 'first_lesson', label: 'First Step', desc: 'Complete your first lesson', icon: '🎯', color: '#6366f1' },
    { id: 'quiz_master', label: 'Quiz Master', desc: 'Score 100% on any quiz', icon: '🏆', color: '#f59e0b' },
    { id: 'streak_7', label: '7-Day Streak', desc: 'Learn 7 days in a row', icon: '🔥', color: '#ef4444' },
    { id: 'math_champ', label: 'Math Champion', desc: 'Unlock Math Boss node', icon: '🧮', color: '#3b82f6' },
    { id: 'scientist', label: 'Scientist', desc: 'Unlock Scientist node', icon: '👩‍🔬', color: '#10b981' },
    { id: 'author', label: 'Author', desc: 'Unlock Author node', icon: '🖊️', color: '#8b5cf6' },
    { id: 'explorer', label: 'Explorer', desc: 'Unlock 5 elective nodes', icon: '🌍', color: '#0ea5e9' },
    { id: 'speedster', label: 'Speedster', desc: 'Complete 3 lessons in a day', icon: '⚡', color: '#fbbf24' },
    { id: 'xp_1000', label: 'XP Hero', desc: 'Earn 1000 XP total', icon: '⭐', color: '#ec4899' },
];

// ── Main SkillTree Component ──────────────────────────────────────
const SkillTree: React.FC = () => {
    const { user } = useAuth();
    const svgRef = useRef<SVGSVGElement>(null);

    const [stats, setStats] = useState<UserStats | null>(null);
    const [progress, setProgress] = useState<Record<string, number>>({}); // nodeId → mastery%
    const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
    const [confettiNode, setConfettiNode] = useState<string | null>(null);
    const [view, setView] = useState<'tree' | 'badges'>('tree');
    const [earnedBadges, setEarnedBadges] = useState<string[]>(['first_lesson', 'quiz_master']);
    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const lastPos = useRef({ x: 0, y: 0 });

    const userId = String(user?.id || '1');

    useEffect(() => {
        getUserStats(userId).then(setStats);
        db.skill_progress.where('student_id').equals(Number(userId)).toArray().then(rows => {
            const map: Record<string, number> = {};
            rows.forEach(r => { map[r.skill_node_id] = r.mastery_pct; });
            // Always unlock start
            map['start'] = 100;
            setProgress(map);
        });
    }, [userId]);

    const isUnlocked = (node: SkillNode): boolean => {
        if (node.requires.length === 0) return true;
        return node.requires.every(req => (progress[req] || 0) >= 80);
    };

    const masteryOf = (id: string) => progress[id] || 0;

    const handleNodeClick = (node: SkillNode) => {
        if (selectedNode?.id === node.id) { setSelectedNode(null); return; }
        setSelectedNode(node);
    };

    const handlePractice = async () => {
        if (!selectedNode) return;
        const newPct = Math.min((masteryOf(selectedNode.id) || 0) + 25, 100);
        const newProgress = { ...progress, [selectedNode.id]: newPct };
        setProgress(newProgress);

        await db.skill_progress.put({
            student_id: Number(userId), skill_node_id: selectedNode.id,
            mastery_pct: newPct, unlocked: newPct >= 80, xp_earned: selectedNode.xp,
        });

        if (newPct >= 80 && (progress[selectedNode.id] || 0) < 80) {
            // Unlock! Award XP + confetti
            await addXP(userId, selectedNode.xp);
            const updated = await getUserStats(userId);
            setStats(updated);
            setConfettiNode(selectedNode.id);
        }
        setSelectedNode(null);
    };

    // ── Zoom / pan handlers ───────────────────────────────────────
    const onWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        setScale(s => Math.max(0.4, Math.min(2.0, s - e.deltaY * 0.001)));
    };

    const onMouseDown = (e: React.MouseEvent) => {
        setDragging(true);
        lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!dragging) return;
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        setPan(p => ({ x: p.x + dx, y: p.y + dy }));
        lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => setDragging(false);

    const unlocked = SKILL_TREE.filter(n => masteryOf(n.id) >= 80).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col">
            {/* Header */}
            <header className="bg-black/30 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                    <button onClick={() => window.history.back()} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="font-bold text-lg">Skill Tree</h1>
                        <p className="text-xs text-white/50">{unlocked}/{SKILL_TREE.length} nodes unlocked</p>
                    </div>
                </div>

                {/* Stats bar */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 rounded-xl px-3 py-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-sm font-bold text-amber-300">{stats?.xp || 0} XP</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-3 py-1.5">
                        <Star className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-300">Lv {stats?.level || 1}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-orange-500/20 border border-orange-500/30 rounded-xl px-3 py-1.5">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        <span className="text-sm font-bold text-orange-300">{stats?.streak || 0}d</span>
                    </div>
                </div>
            </header>

            {/* View toggle */}
            <div className="flex gap-1 mx-6 mt-4 bg-white/5 border border-white/10 rounded-2xl p-1 w-fit">
                {(['tree', 'badges'] as const).map(v => (
                    <button key={v} onClick={() => setView(v)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${view === v ? 'bg-indigo-600 text-white' : 'text-white/50 hover:text-white'}`}>
                        {v === 'tree' ? '🌳 Skill Tree' : '🏆 Badges'}
                    </button>
                ))}
            </div>

            {/* Confetti */}
            <AnimatePresence>
                {confettiNode && <Confetti key={confettiNode} onDone={() => setConfettiNode(null)} />}
            </AnimatePresence>

            {/* BADGES VIEW ─────────────────────────────────────── */}
            {view === 'badges' && (
                <div className="flex-1 px-6 py-6 overflow-y-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl">
                        {ALL_BADGES.map(badge => {
                            const earned = earnedBadges.includes(badge.id);
                            return (
                                <motion.div key={badge.id} whileHover={{ y: -4 }}
                                    className={`rounded-2xl p-4 border text-center transition-all ${earned ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/5 opacity-40 grayscale'}`}>
                                    <div className="text-4xl mb-2 leading-none">{badge.icon}</div>
                                    <p className="font-bold text-sm text-white mb-0.5">{badge.label}</p>
                                    <p className="text-[10px] text-white/50">{badge.desc}</p>
                                    {earned && <div className="mt-2 text-[10px] font-bold text-emerald-400">✓ Earned</div>}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TREE VIEW ──────────────────────────────────────── */}
            {view === 'tree' && (
                <div className="flex-1 relative overflow-hidden">
                    <svg
                        ref={svgRef}
                        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none"
                        onWheel={onWheel}
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={onMouseUp}
                        onMouseLeave={onMouseUp}
                    >
                        <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
                            {/* ─ Draw edges ─ */}
                            {SKILL_TREE.map(node =>
                                node.requires.map(reqId => {
                                    const from = SKILL_TREE.find(n => n.id === reqId);
                                    if (!from) return null;
                                    const bothUnlocked = masteryOf(reqId) >= 80 && masteryOf(node.id) >= 80;
                                    return (
                                        <line key={`${reqId}-${node.id}`}
                                            x1={from.x} y1={from.y} x2={node.x} y2={node.y}
                                            stroke={bothUnlocked ? '#6366f1' : '#334155'}
                                            strokeWidth={bothUnlocked ? 3 : 1.5}
                                            strokeDasharray={bothUnlocked ? undefined : '6 4'}
                                            strokeLinecap="round"
                                            style={{ filter: bothUnlocked ? 'drop-shadow(0 0 6px #6366f1)' : undefined }}
                                        />
                                    );
                                })
                            )}

                            {/* ─ Draw nodes ─ */}
                            {SKILL_TREE.map(node => {
                                const unlockable = isUnlocked(node);
                                const mastery = masteryOf(node.id);
                                const done = mastery >= 80;
                                const colors = SUBJECT_COLORS[node.subject] || SUBJECT_COLORS['All'];
                                const nodeSize = node.type === 'boss' ? 46 : node.type === 'challenge' ? 38 : 32;
                                const isSelected = selectedNode?.id === node.id;

                                return (
                                    <g key={node.id}
                                        transform={`translate(${node.x}, ${node.y})`}
                                        onClick={() => unlockable && handleNodeClick(node)}
                                        style={{ cursor: unlockable ? 'pointer' : 'not-allowed' }}
                                    >
                                        {/* Glow ring on selected */}
                                        {isSelected && (
                                            <motion.circle r={nodeSize + 10} fill="none"
                                                stroke="#818cf8" strokeWidth={2}
                                                animate={{ r: [nodeSize + 8, nodeSize + 14, nodeSize + 8] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                strokeDasharray="4 4"
                                            />
                                        )}

                                        {/* Unlock glow */}
                                        {done && (
                                            <circle r={nodeSize + 6} fill={colors.stroke} opacity={0.15} />
                                        )}

                                        {/* Main node circle */}
                                        <circle r={nodeSize}
                                            fill={done ? colors.bg : unlockable ? '#1e293b' : '#0f172a'}
                                            stroke={done ? colors.stroke : unlockable ? '#475569' : '#1e293b'}
                                            strokeWidth={done ? 3 : 1.5}
                                            style={{ filter: done ? `drop-shadow(0 0 8px ${colors.stroke})` : undefined }}
                                        />

                                        {/* Progress arc */}
                                        {unlockable && !done && mastery > 0 && (
                                            <circle r={nodeSize}
                                                fill="none" stroke={colors.stroke} strokeWidth={3}
                                                strokeDasharray={`${(mastery / 100) * 2 * Math.PI * nodeSize} ${2 * Math.PI * nodeSize}`}
                                                strokeLinecap="round"
                                                transform="rotate(-90)"
                                            />
                                        )}

                                        {/* Emoji */}
                                        <text textAnchor="middle" dominantBaseline="middle"
                                            fontSize={node.type === 'boss' ? 22 : 16}
                                            style={{ userSelect: 'none' }} fill={unlockable ? 'currentcolor' : '#334155'}>
                                            {unlockable ? node.emoji : '🔒'}
                                        </text>

                                        {/* Label */}
                                        <text y={nodeSize + 16} textAnchor="middle" fontSize={11}
                                            fill={done ? colors.stroke : unlockable ? '#94a3b8' : '#475569'}
                                            fontWeight={done ? 'bold' : 'normal'}
                                            style={{ userSelect: 'none' }}>
                                            {node.label}
                                        </text>

                                        {/* Mastery % */}
                                        {unlockable && mastery > 0 && (
                                            <text y={nodeSize + 30} textAnchor="middle" fontSize={9}
                                                fill={done ? colors.stroke : '#64748b'}
                                                style={{ userSelect: 'none' }}>
                                                {mastery}%
                                            </text>
                                        )}

                                        {/* Done checkmark */}
                                        {done && (
                                            <g transform={`translate(${nodeSize - 10}, ${-nodeSize + 10})`}>
                                                <circle r={10} fill={colors.stroke} />
                                                <text textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="white">✓</text>
                                            </g>
                                        )}

                                        {/* Type badge */}
                                        {TYPE_BADGE[node.type] && unlockable && (
                                            <text x={nodeSize - 6} y={-nodeSize + 6} textAnchor="middle" dominantBaseline="middle" fontSize={12}>
                                                {TYPE_BADGE[node.type]}
                                            </text>
                                        )}
                                    </g>
                                );
                            })}
                        </g>
                    </svg>

                    {/* Node detail panel */}
                    <AnimatePresence>
                        {selectedNode && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                                className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-3xl p-5 mx-4 shadow-2xl"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="text-4xl">{selectedNode.emoji}</div>
                                    <div>
                                        <h3 className="font-bold text-white">{selectedNode.label}</h3>
                                        <p className="text-xs text-white/50 font-medium">{selectedNode.subject}</p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-1.5 bg-amber-500/20 rounded-xl px-3 py-1.5">
                                        <Zap className="w-3 h-3 text-amber-400" />
                                        <span className="text-xs font-bold text-amber-300">+{selectedNode.xp} XP</span>
                                    </div>
                                </div>
                                <p className="text-sm text-white/70 mb-4">{selectedNode.description}</p>

                                {/* Mastery bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs text-white/50 mb-1.5">
                                        <span>Mastery</span>
                                        <span>{masteryOf(selectedNode.id)}%</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                                            animate={{ width: `${masteryOf(selectedNode.id)}%` }} />
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={() => setSelectedNode(null)}
                                        className="flex-1 py-3 rounded-2xl border border-white/10 text-white/60 text-sm font-semibold hover:bg-white/10 transition-all">
                                        Close
                                    </button>
                                    <button onClick={handlePractice}
                                        className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl text-white text-sm font-bold shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2">
                                        <BookOpen className="w-4 h-4" />
                                        {masteryOf(selectedNode.id) >= 80 ? 'Review' : 'Practice'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Zoom controls */}
                    <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                        {[{ label: '+', delta: 0.2 }, { label: '−', delta: -0.2 }, { label: '⌖', delta: 0 }].map(({ label, delta }) => (
                            <button key={label} onClick={() => {
                                if (delta === 0) { setScale(1); setPan({ x: 0, y: 0 }); }
                                else setScale(s => Math.max(0.4, Math.min(2, s + delta)));
                            }}
                                className="w-9 h-9 bg-black/50 border border-white/10 rounded-xl text-white text-sm font-bold hover:bg-white/10 transition-all">
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="absolute top-4 right-4 bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-[10px] text-white/50 space-y-1.5">
                        <p className="font-bold text-white/70 mb-2 text-[11px]">Legend</p>
                        <p>🔒 Locked  ✓ Mastered</p>
                        <p>👑 Boss  ✨ Elective  🔥 Challenge</p>
                        <p className="text-[9px] mt-2 text-white/30">Scroll to zoom · Drag to pan</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkillTree;
