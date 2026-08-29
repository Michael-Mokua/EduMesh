import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronRight, Trophy, ArrowLeft, Star, Timer, Sparkles } from 'lucide-react';
import { db } from '../db';
import { useAuth } from '../context/AuthContext';
import { enqueue } from '../syncEngine';

interface Question {
    id: number;
    text: string;
    options: string[];
    correct: number;
}

interface QuizProps {
    quizId: number;
    onComplete: (score: number) => void;
    onBack: () => void;
}

const Quiz: React.FC<QuizProps> = ({ quizId, onComplete, onBack }) => {
    const { user } = useAuth();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/content/quizzes/${quizId}`);
                if (response.ok) {
                    const data = await response.json();
                    setQuestions(data.data_json);
                } else {
                    // Fallback to local or hardcoded for demo if not found
                    setQuestions([
                        { id: 1, text: "What is 15 + 27?", options: ["32", "42", "44", "45"], correct: 1 },
                        { id: 2, text: "If x = 5, what is 2x + 10?", options: ["15", "20", "25", "30"], correct: 1 },
                    ]);
                }
            } catch (err) {
                console.warn('Offline: Using fallback questions');
                setQuestions([
                    { id: 1, text: "What is 15 + 27?", options: ["32", "42", "44", "45"], correct: 1 },
                    { id: 2, text: "If x = 5, what is 2x + 10?", options: ["15", "20", "25", "30"], correct: 1 },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [quizId]);

    const handleOptionSelect = (index: number) => {
        if (selectedOption !== null) return;

        setSelectedOption(index);
        const correct = index === questions[currentStep].correct;
        setIsCorrect(correct);
        if (correct) setScore(s => s + 1);

        setTimeout(() => {
            if (currentStep < questions.length - 1) {
                setCurrentStep(s => s + 1);
                setSelectedOption(null);
                setIsCorrect(null);
            } else {
                setShowResults(true);
            }
        }, 1500);
    };

    const handleClaimRewards = async () => {
        if (!user) {
            onComplete(score);
            return;
        }

        try {
            // 1. Save submission locally
            await db.quiz_submissions.add({
                quiz_id: quizId,
                student_id: user.id,
                score,
                timestamp: Date.now(),
                synced: false
            });

            // 2. Queue for sync
            await enqueue('quiz_submission', {
                quiz_id: quizId,
                student_id: user.id,
                score,
                responses_json: JSON.stringify({}),
            });

            // 3. Update local stats
            const stats = await db.user_stats.get(user.id.toString());
            if (stats) {
                await db.user_stats.update(user.id.toString(), {
                    xp: stats.xp + (score * 50),
                    lastActive: Date.now()
                });
            } else {
                await db.user_stats.add({
                    id: user.id.toString(),
                    xp: score * 50,
                    level: 1,
                    streak: 1,
                    longest_streak: 1,
                    total_lessons: 0,
                    total_quizzes: 1,
                    lastActive: Date.now()
                });
            }

            onComplete(score);
        } catch (err) {
            console.error('Failed to save quiz results:', err);
            onComplete(score); // Exit anyway
        }
    };

    if (showResults) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl mx-auto p-12 bg-white rounded-[3rem] text-center shadow-xl border border-slate-50 relative overflow-hidden"
            >
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-teal-400 to-indigo-500" />
                <div className="mb-8 flex justify-center">
                    <motion.div
                        initial={{ rotate: -20, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: 'spring', damping: 10 }}
                        className="w-32 h-32 bg-amber-50 rounded-[2.5rem] flex items-center justify-center"
                    >
                        <Trophy className="w-16 h-16 text-amber-500 fill-amber-500" />
                    </motion.div>
                </div>

                <h2 className="text-4xl font-black text-slate-900 mb-2">Quiz Completed!</h2>
                <p className="text-slate-400 font-bold mb-10">You've earned some fresh knowledge XP!</p>

                <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="p-6 bg-teal-50 rounded-[2rem] border border-teal-100">
                        <div className="text-3xl font-black text-teal-600">{Math.round((score / questions.length) * 100)}%</div>
                        <div className="text-xs font-black text-teal-400 uppercase tracking-widest mt-1">Accuracy</div>
                    </div>
                    <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100">
                        <div className="text-3xl font-black text-indigo-600">+{score * 50}</div>
                        <div className="text-xs font-black text-indigo-400 uppercase tracking-widest mt-1">XP Gained</div>
                    </div>
                </div>

                <button
                    onClick={handleClaimRewards}
                    className="w-full py-5 bg-teal-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-lg shadow-teal-100 hover:scale-[1.02] transition-transform"
                >
                    Claim Rewards
                </button>
            </motion.div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center justify-between mb-2">
                <button onClick={onBack} className="text-slate-400 hover:text-teal-600 font-black flex items-center gap-2 uppercase tracking-widest text-xs transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Exit Quiz
                </button>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-50">
                        <Timer className="w-4 h-4 text-slate-400" />
                        <span className="font-black text-slate-700">02:45</span>
                    </div>
                </div>
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-[2px]">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                    className="h-full bg-teal-500 rounded-full"
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-50 relative"
                >
                    <div className="absolute -top-6 left-12 px-6 py-3 bg-teal-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-teal-100">
                        Question {currentStep + 1}
                    </div>

                    <h3 className="text-3xl font-black text-slate-900 mb-12 mt-4 leading-tight">
                        {questions[currentStep].text}
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                        {questions[currentStep].options.map((option, i) => (
                            <motion.button
                                key={i}
                                whileHover={{ x: selectedOption === null ? 8 : 0 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleOptionSelect(i)}
                                disabled={selectedOption !== null}
                                className={`
                                    w-full p-6 text-left rounded-[1.5rem] border-2 font-bold text-xl transition-all flex items-center justify-between
                                    ${selectedOption === null ? 'bg-white border-slate-100 hover:border-teal-400 hover:bg-teal-50/50 text-slate-700' : ''}
                                    ${selectedOption === i ? (isCorrect ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-rose-50 border-rose-500 text-rose-700') : ''}
                                    ${selectedOption !== null && i === questions[currentStep].correct ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : ''}
                                    ${selectedOption !== null && selectedOption !== i && i !== questions[currentStep].correct ? 'opacity-40 border-slate-50' : ''}
                                `}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-300">
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                    {option}
                                </div>

                                {selectedOption === i && (
                                    isCorrect ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />
                                )}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="grid grid-cols-3 gap-4">
                <div className="school-card p-6 flex flex-col items-center gap-2">
                    <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Bonus</span>
                </div>
                <div className="school-card p-6 flex flex-col items-center gap-2">
                    <Sparkles className="w-6 h-6 text-indigo-500" />
                    <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Streak</span>
                </div>
                <div className="school-card p-6 flex flex-col items-center gap-2">
                    <Trophy className="w-6 h-6 text-teal-500" />
                    <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Level</span>
                </div>
            </div>
        </div>
    );
};

export default Quiz;
