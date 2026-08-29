import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Filter, ShoppingBag, Star, Download, 
    ChevronRight, BookOpen, Clock, Users, Zap,
    Shield, Wallet, ArrowUpRight, TrendingUp
} from 'lucide-react';

const MARKET_ITEMS = [
    {
        id: 1,
        title: "Calculus Mastery Pack",
        author: "Dr. Sarah Kimani",
        price: 1200,
        rating: 4.9,
        reviews: 124,
        category: "Mathematics",
        modules: 12,
        studentsCount: 1450,
        icon: "📐",
        color: "bg-blue-500"
    },
    {
        id: 2,
        title: "Modern Kiswahili Literature",
        author: "Mzee Juma",
        price: 850,
        rating: 4.8,
        reviews: 89,
        category: "Languages",
        modules: 8,
        studentsCount: 2100,
        icon: "✍️",
        color: "bg-amber-500"
    },
    {
        id: 3,
        title: "Introduction to Robotics (Offline Kits)",
        author: "Tech Academy",
        price: 4500,
        rating: 5.0,
        reviews: 56,
        category: "Technology",
        modules: 15,
        studentsCount: 320,
        icon: "🤖",
        color: "bg-purple-500"
    },
    {
        id: 4,
        title: "Primary Science Experiments",
        author: "EduGrow Kenya",
        price: 500,
        rating: 4.7,
        reviews: 210,
        category: "Science",
        modules: 10,
        studentsCount: 4500,
        icon: "🧪",
        color: "bg-emerald-500"
    }
];

const CategoryChip: React.FC<{ label: string; active?: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border-2 ${
            active 
            ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' 
            : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
        }`}
    >
        {label}
    </button>
);

const Marketplace: React.FC = () => {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const categories = ["All", "Mathematics", "Science", "Languages", "Technology", "Art"];

    const filteredItems = MARKET_ITEMS.filter(item => 
        (category === 'All' || item.category === category) &&
        (item.title.toLowerCase().includes(search.toLowerCase()) || item.author.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-8 font-['Inter']">
            {/* Promo Banner */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-10 text-white"
            >
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/20 to-transparent flex items-center justify-center opacity-30">
                    <ShoppingBag className="w-64 h-64 rotate-12" />
                </div>
                <div className="relative z-10 max-w-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-indigo-500 rounded-full text-[10px] font-black uppercase tracking-widest">Teacher Hub</span>
                        <span className="text-slate-400 text-xs font-bold flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Verified Content
                        </span>
                    </div>
                    <h1 className="text-4xl font-black mb-4 leading-tight">Monetize Your <br/> Educational Expertise</h1>
                    <p className="text-slate-400 font-medium mb-8 leading-relaxed">
                        Join 2,400+ Kenyan educators selling high-quality curriculum packs. Reach students nationwide, even in offline environments.
                    </p>
                    <div className="flex gap-4">
                        <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-sm hover:scale-105 transition-transform flex items-center gap-2">
                            Sell Content <ArrowUpRight className="w-4 h-4" />
                        </button>
                        <button className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-black text-sm hover:scale-105 transition-transform border border-slate-700">
                            Creator Academy
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search for bundles, authors..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium text-sm transition-all shadow-sm"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
                    {categories.map(c => (
                        <CategoryChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item, idx) => (
                        <motion.div 
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-2xl hover:shadow-slate-200/50 transition-all cursor-pointer relative"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-${item.color.split('-')[1]}-200`}>
                                    {item.icon}
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">KSh</p>
                                    <p className="text-xl font-black text-slate-900">{item.price}</p>
                                </div>
                            </div>
                            
                            <h3 className="font-extrabold text-lg text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-sm font-bold text-slate-400 mb-6">by {item.author}</p>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-3 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Modules</p>
                                    <div className="flex items-center gap-2 font-black text-slate-700 text-sm">
                                        <BookOpen className="w-3.5 h-3.5" /> {item.modules} Units
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reach</p>
                                    <div className="flex items-center gap-2 font-black text-slate-700 text-sm">
                                        <Users className="w-3.5 h-3.5" /> {item.studentsCount}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    <span className="font-black text-sm text-slate-900">{item.rating}</span>
                                    <span className="text-[10px] font-bold text-slate-400">({item.reviews})</span>
                                </div>
                                <button className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                    <ShoppingBag className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Stats Sidebar/Bottom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-slate-100">
                <div className="bg-emerald-50 rounded-[2rem] p-8 border border-emerald-100">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-emerald-900">Trending in Kenya</h3>
                    </div>
                    <p className="text-emerald-700/70 font-bold mb-4">
                        "Agriculture for secondary schools" is seeing a 40% uptick in the Rift Valley region this month.
                    </p>
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-sm">
                        View Trends <ChevronRight className="w-4 h-4" />
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                        <Zap className="w-32 h-32" />
                    </div>
                    <h3 className="text-xl font-black mb-4">Global Content Exchange</h3>
                    <p className="text-slate-400 font-medium mb-6">
                        Exchange lesson packs with other national platforms through the EduMesh Global Bridge.
                    </p>
                    <button className="px-6 py-3 bg-white/10 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10">
                        Explore Bridge
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Marketplace;
