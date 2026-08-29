import React, { useState, useEffect } from 'react';
import { db, Content, Subject } from '../db';
import { Book, ChevronRight, Search, Filter, Play, FileText, Download, GraduationCap, ArrowLeft, Star, Sparkles, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ContentLibrary: React.FC = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [content, setContent] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/content/subjects');
            const data = await response.json();
            setSubjects(data);
            await db.subjects.bulkPut(data);
        } catch (err) {
            const localSubjects = await db.subjects.toArray();
            setSubjects(localSubjects);
        } finally {
            setLoading(false);
        }
    };

    const fetchContent = async (subject_id: number) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/content/subjects/${subject_id}/content`);
            const data = await response.json();
            setContent(data);
            await db.content.bulkPut(data);
        } catch (err) {
            const localContent = await db.content.where('subject_id').equals(subject_id).toArray();
            setContent(localContent);
        } finally {
            setLoading(false);
        }
    };

    const getSubjectTheme = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('math')) return 'theme-math';
        if (n.includes('sci')) return 'theme-science';
        if (n.includes('history')) return 'theme-history';
        if (n.includes('geo')) return 'theme-geography';
        if (n.includes('comp') || n.includes('it')) return 'theme-computer';
        if (n.includes('art')) return 'theme-art';
        if (n.includes('eng')) return 'theme-english';
        return '';
    };

    const handleSubjectClick = (subject: Subject) => {
        setSelectedSubject(subject);
        fetchContent(subject.id);
    };

    const filteredSubjects = subjects.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && subjects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-16 h-16 border-8 border-teal-50 border-t-teal-600 rounded-full mb-6"
                />
                <p className="text-slate-400 font-extrabold text-lg animate-pulse">Building your learning world...</p>
            </div>
        );
    }

    return (
        <div className={`space-y-8 pb-20 ${selectedSubject ? getSubjectTheme(selectedSubject.name) : ''}`}>
            <AnimatePresence mode="wait">
                {!selectedSubject ? (
                    <motion.div
                        key="subject-list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                    >
                        {/* Playful Search */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-600 transition-colors w-6 h-6" />
                                <input
                                    type="text"
                                    placeholder="Which subject world shall we explore?"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-14 pr-6 py-5 rounded-[2rem] bg-white border-2 border-slate-50 focus:border-teal-100 transition-all outline-none font-bold text-lg shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
                            {filteredSubjects.map((subject, i) => (
                                <motion.div
                                    key={subject.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ y: -10, rotate: 1 }}
                                    onClick={() => handleSubjectClick(subject)}
                                    className={`school-card p-10 flex flex-col items-center text-center group ${getSubjectTheme(subject.name)}`}
                                >
                                    <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-12 transition-all" style={{ backgroundColor: 'var(--subject-bg)' }}>
                                        <BookOpen className="w-10 h-10" style={{ color: 'var(--subject-color)' }} />
                                    </div>
                                    <h3 className="text-2xl font-black mb-3">{subject.name}</h3>
                                    <p className="text-slate-400 font-bold text-sm leading-relaxed mb-8 line-clamp-2">
                                        {subject.description}
                                    </p>
                                    <div className="mt-auto flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em] text-slate-300 group-hover:text-teal-600 transition-colors">
                                        Enter World <ChevronRight className="w-4 h-4" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content-view"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-10"
                    >
                        <button
                            onClick={() => setSelectedSubject(null)}
                            className="flex items-center gap-4 text-slate-400 font-black uppercase tracking-widest text-sm hover:text-teal-600 transition-colors group"
                        >
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-50 group-hover:border-teal-100 transition-all">
                                <ArrowLeft className="w-5 h-5" />
                            </div>
                            Back to All Worlds
                        </button>

                        <div className="school-card p-12 bg-white relative overflow-hidden flex flex-col md:flex-row items-center gap-12 border-slate-100">
                            <div className="relative z-10 flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="subject-accent h-8" />
                                    <span className="font-black text-slate-300 uppercase tracking-[0.3em] text-xs">Subject World</span>
                                </div>
                                <h1 className="text-5xl lg:text-6xl font-black mb-6" style={{ color: 'var(--subject-color)' }}>{selectedSubject.name}</h1>
                                <p className="text-xl text-slate-400 font-bold max-w-2xl leading-relaxed">{selectedSubject.description}</p>

                                <div className="flex items-center gap-6 mt-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center"><Star className="w-5 h-5 text-amber-500 fill-amber-500" /></div>
                                        <span className="font-black text-slate-900">4.8 Rating</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center"><Sparkles className="w-5 h-5 text-emerald-500" /></div>
                                        <span className="font-black text-slate-900">{content.length} Lessons</span>
                                    </div>
                                </div>
                            </div>

                            <div className="w-48 h-48 rounded-[3rem] flex items-center justify-center relative scale-125 lg:scale-150 rotate-6" style={{ backgroundColor: 'var(--subject-bg)' }}>
                                <div className="absolute inset-0 bg-white opacity-20 blur-2xl animate-pulse" />
                                <Book className="w-24 h-24 relative z-10" style={{ color: 'var(--subject-color)' }} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <h2 className="text-2xl px-2">Learning Path</h2>
                            {content.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ x: 10 }}
                                    className="school-card p-8 flex flex-col md:flex-row md:items-center gap-8 group"
                                >
                                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all ${item.type === 'video' ? 'bg-rose-50 text-rose-500 shadow-rose-50' : 'bg-emerald-50 text-emerald-500 shadow-emerald-50'
                                        } group-hover:scale-110`}>
                                        {item.type === 'video' ? <Play className="w-8 h-8 fill-rose-500" /> : <FileText className="w-8 h-8" />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black text-slate-800 mb-2 truncate">{item.title}</h3>
                                        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-300">
                                            <span>{item.type}</span>
                                            <div className="w-1 h-1 rounded-full bg-slate-100" />
                                            <span>15-20 Mins</span>
                                            <div className="w-1 h-1 rounded-full bg-slate-100" />
                                            <span className="text-emerald-500">+50 XP</span>
                                        </div>
                                    </div>
                                    <button className="px-10 py-4 bg-slate-50 text-slate-500 hover:bg-teal-600 hover:text-white rounded-[1.2rem] font-black uppercase tracking-widest text-sm transition-all group-hover:shadow-lg group-hover:shadow-teal-100 shadow-sm border border-slate-100">
                                        Learn
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ContentLibrary;
