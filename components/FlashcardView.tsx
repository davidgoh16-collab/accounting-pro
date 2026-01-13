
import React, { useState, useMemo, useEffect } from 'react';
import { CASE_STUDY_LOCATIONS } from '../case-study-database';
import { KEY_TERMS } from '../knowledge-database';
import { TOPIC_COLORS } from '../case-study-database';
import { FlashcardItem, AuthUser } from '../types';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

type KnownStatus = 'known' | 'unknown';
type FilterMode = 'all' | KnownStatus;
type ContentMode = 'all' | 'cases' | 'terms';

interface FlashcardViewProps {
    onQuiz: (deck: FlashcardItem[]) => void;
    user: AuthUser;
    onBack: () => void;
}

const FlashcardView: React.FC<FlashcardViewProps> = ({ onQuiz, user, onBack }) => {
    const [knownStatuses, setKnownStatuses] = useState<Record<string, KnownStatus>>({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [filter, setFilter] = useState<FilterMode>('all');
    const [topicFilter, setTopicFilter] = useState('All Topics');
    const [contentFilter, setContentFilter] = useState<ContentMode>('all');
    
    useEffect(() => {
        if (!user) return;
        const fetchStatuses = async () => {
            const docRef = doc(db, 'users', user.uid, 'flashcard_progress', 'statuses');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setKnownStatuses(docSnap.data() || {});
            }
        };
        fetchStatuses();
    }, [user]);

    const allItems = useMemo(() => {
        const level = user.level || 'A-Level';
        const cases: FlashcardItem[] = CASE_STUDY_LOCATIONS
            .filter(c => c.levels.includes(level))
            .map(c => ({...c, type: 'case_study' as const}));
        const terms: FlashcardItem[] = KEY_TERMS.filter(k => k.levels.includes(level)); 
        return [...cases, ...terms].sort((a, b) => a.name.localeCompare(b.name));
    }, [user.level]);

    const topics = useMemo(() => ['All Topics', ...new Set(allItems.map(i => i.topic))].sort(), [allItems]);
    
    const filteredDeck = useMemo(() => {
        return allItems.filter(item => {
            const statusMatch = filter === 'all' || (knownStatuses[item.name] || 'unknown') === filter;
            const topicMatch = topicFilter === 'All Topics' || item.topic === topicFilter;
            const contentMatch = contentFilter === 'all' || 
                                 (contentFilter === 'cases' && (item as any).type === 'case_study') ||
                                 (contentFilter === 'terms' && (item as any).type === 'term');
            
            return statusMatch && topicMatch && contentMatch;
        });
    }, [filter, topicFilter, contentFilter, knownStatuses, allItems]);

    useEffect(() => {
        setCurrentIndex(0);
        setIsFlipped(false);
    }, [filter, topicFilter, contentFilter]);

    const currentCard = filteredDeck[currentIndex];
    const isTerm = currentCard && (currentCard as any).type === 'term';
    
    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex(prev => (prev + 1) % filteredDeck.length), 150);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex(prev => (prev - 1 + filteredDeck.length) % filteredDeck.length), 150);
    };

    const handleMark = async (status: KnownStatus) => {
        if (!currentCard || !user) return;
        const newStatuses = { ...knownStatuses, [currentCard.name]: status };
        setKnownStatuses(newStatuses);
        
        try {
            const docRef = doc(db, 'users', user.uid, 'flashcard_progress', 'statuses');
            await setDoc(docRef, newStatuses, { merge: true });
        } catch (e) {
            console.error("Failed to save flashcard progress", e);
        }
        
        handleNext();
    };
    
    const FilterButton: React.FC<{ mode: FilterMode, label: string, count: number }> = ({ mode, label, count }) => (
        <button onClick={() => setFilter(mode)} className={`px-4 py-2 rounded-full font-semibold transition-colors flex items-center gap-2 text-sm sm:text-base ${filter === mode ? 'bg-white text-fuchsia-600 shadow-md' : 'bg-fuchsia-100/50 dark:bg-fuchsia-900/30 text-fuchsia-800 dark:text-fuchsia-300 hover:bg-white/80 dark:hover:bg-stone-700'}`}>
            {label} <span className={`px-2 py-0.5 rounded-full text-xs ${filter === mode ? 'bg-fuchsia-100 text-fuchsia-700' : 'bg-fuchsia-200/80 dark:bg-fuchsia-800/50'}`}>{count}</span>
        </button>
    );

    const knownCount = useMemo(() => {
        // Only count known for items that match current content/topic filter
        return filteredDeck.filter(item => knownStatuses[item.name] === 'known').length;
    }, [knownStatuses, filteredDeck]);
    
    const unknownCount = filteredDeck.length - knownCount;

    return (
        <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-transparent flex flex-col items-center">
            <button 
                onClick={onBack}
                className="fixed top-24 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-stone-800/80 backdrop-blur-md border border-stone-200 dark:border-stone-700 rounded-full shadow-sm hover:bg-white dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 font-bold transition-all"
            >
                <span>&larr;</span> Back
            </button>

            <header className="text-center mb-6 w-full max-w-4xl mt-12">
                <h1 className="text-3xl lg:text-4xl font-bold text-stone-800 dark:text-stone-100">Knowledge Deck ({user.level})</h1>
                <p className="mt-2 text-base text-stone-600 dark:text-stone-400">Master terms, concepts, and case studies.</p>
            </header>

            <div className="flex flex-col gap-4 mb-8 w-full max-w-2xl">
                {/* Filters */}
                <div className="flex flex-wrap items-center justify-center gap-3 p-4 bg-fuchsia-50 dark:bg-stone-800/50 border border-fuchsia-200/50 dark:border-stone-700 rounded-2xl">
                    <div className="flex items-center gap-2 bg-white dark:bg-stone-900 p-1 rounded-lg border border-stone-200 dark:border-stone-700">
                        <button onClick={() => setContentFilter('all')} className={`px-3 py-1 rounded-md text-sm font-semibold transition ${contentFilter === 'all' ? 'bg-fuchsia-100 dark:bg-fuchsia-900/50 text-fuchsia-800 dark:text-fuchsia-200' : 'text-stone-500 dark:text-stone-400'}`}>All</button>
                        <button onClick={() => setContentFilter('cases')} className={`px-3 py-1 rounded-md text-sm font-semibold transition ${contentFilter === 'cases' ? 'bg-fuchsia-100 dark:bg-fuchsia-900/50 text-fuchsia-800 dark:text-fuchsia-200' : 'text-stone-500 dark:text-stone-400'}`}>Cases</button>
                        <button onClick={() => setContentFilter('terms')} className={`px-3 py-1 rounded-md text-sm font-semibold transition ${contentFilter === 'terms' ? 'bg-fuchsia-100 dark:bg-fuchsia-900/50 text-fuchsia-800 dark:text-fuchsia-200' : 'text-stone-500 dark:text-stone-400'}`}>Terms</button>
                    </div>
                    
                    <div className="relative">
                        <select 
                            value={topicFilter} 
                            onChange={e => setTopicFilter(e.target.value)}
                            className="pl-4 pr-10 py-2 rounded-lg font-semibold bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 shadow-sm border border-stone-200 dark:border-stone-700 appearance-none cursor-pointer focus:ring-2 focus:ring-fuchsia-500 focus:outline-none text-sm"
                        >
                            {topics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
                        </select>
                    </div>
                </div>
                
                {/* Status Filter */}
                <div className="flex items-center justify-center gap-2">
                    <FilterButton mode="all" label="All" count={filteredDeck.length} />
                    <FilterButton mode="unknown" label="To Learn" count={unknownCount} />
                    <FilterButton mode="known" label="Learned" count={knownCount} />
                </div>
            </div>

            {filteredDeck.length === 0 ? (
                 <div className="text-center py-20 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl w-full max-w-2xl animate-fade-in">
                    <span className="text-6xl">🎉</span>
                    <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mt-4">All caught up!</h2>
                    <p className="text-stone-500 dark:text-stone-400 mt-2">No cards match your current filters.</p>
                    <button onClick={() => { setFilter('all'); setTopicFilter('All Topics'); setContentFilter('all'); }} className="mt-6 text-fuchsia-600 dark:text-fuchsia-400 hover:underline">Reset Filters</button>
                </div>
            ) : (
                <div className="w-full max-w-2xl animate-fade-in">
                    <div className="perspective-1000">
                        <div 
                            className={`relative w-full h-80 transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            {/* Front */}
                            <div className="absolute w-full h-full backface-hidden bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 text-center cursor-pointer group hover:border-fuchsia-300 dark:hover:border-fuchsia-700 transition-colors">
                                <div className="absolute top-6 flex flex-col gap-2 items-center">
                                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{isTerm ? 'Key Term' : 'Case Study'}</span>
                                    <p className="text-xs font-semibold text-white px-3 py-1 rounded-full" style={{ backgroundColor: TOPIC_COLORS[currentCard.topic] || '#a8a29e' }}>{currentCard.topic}</p>
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-stone-800 dark:text-stone-100 group-hover:scale-105 transition-transform duration-300">{currentCard.name}</h2>
                                <p className="absolute bottom-6 text-sm text-stone-400 animate-pulse">Tap to flip</p>
                            </div>
                            {/* Back */}
                            <div className="absolute w-full h-full backface-hidden bg-fuchsia-50/90 dark:bg-stone-800/90 backdrop-blur-sm border border-fuchsia-200/50 dark:border-fuchsia-900/30 rounded-3xl shadow-2xl p-8 overflow-y-auto custom-scrollbar rotate-y-180 cursor-pointer flex flex-col">
                                <div>
                                    <h3 className="font-bold text-fuchsia-900 dark:text-fuchsia-300 text-lg mb-2 border-b border-fuchsia-200 dark:border-fuchsia-800 pb-2">{isTerm ? 'Definition' : 'Key Details'}</h3>
                                    <p className="text-stone-700 dark:text-stone-300 text-lg leading-relaxed">{currentCard.details}</p>
                                </div>
                                
                                <div className="mt-6 pt-4 border-t border-fuchsia-200 dark:border-fuchsia-800">
                                    <h3 className="font-bold text-fuchsia-900 dark:text-fuchsia-300 text-lg mb-2">{isTerm ? 'Example / Context' : 'Exam Context'}</h3>
                                    <p className="text-stone-600 dark:text-stone-400 italic">{currentCard.citation}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-6 text-stone-600 dark:text-stone-400 font-semibold select-none">
                        <button onClick={handlePrev} className="px-4 py-2 hover:text-stone-900 dark:hover:text-stone-200 transition">&larr; Prev</button>
                        <span>{currentIndex + 1} / {filteredDeck.length}</span>
                        <button onClick={handleNext} className="px-4 py-2 hover:text-stone-900 dark:hover:text-stone-200 transition">Next &rarr;</button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <button onClick={() => handleMark('unknown')} className="w-full py-4 bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold text-lg rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400 transition-all transform active:scale-95 border border-transparent hover:border-rose-300 dark:hover:border-rose-700">
                            Still Learning
                        </button>
                        <button onClick={() => handleMark('known')} className="w-full py-4 bg-emerald-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-transform transform active:scale-95 hover:scale-[1.02]">
                            Got It!
                        </button>
                    </div>
                </div>
            )}
             <button onClick={() => onQuiz(filteredDeck)} disabled={filteredDeck.length === 0} className="mt-12 px-8 py-3 bg-white dark:bg-stone-800 border-2 border-fuchsia-500 text-fuchsia-600 dark:text-fuchsia-400 font-bold rounded-full hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg">
                Quiz me on this deck!
            </button>
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
            `}</style>
        </div>
    );
};

export default FlashcardView;
