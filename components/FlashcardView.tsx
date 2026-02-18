
import React, { useState, useMemo, useEffect } from 'react';
import { CASE_STUDY_LOCATIONS } from '../case-study-database';
import { KEY_TERMS } from '../knowledge-database';
import { TOPIC_COLORS } from '../case-study-database';
import { FlashcardItem, AuthUser } from '../types';
import { db, logUserActivity } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { GCSE_SPEC_TOPICS, ALEVEL_SPEC_TOPICS, IGCSE_SPEC_TOPICS } from '../constants';
import { generateFlashcards } from '../services/geminiService';

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
    const [subTopicFilter, setSubTopicFilter] = useState('All Sub-topics');
    const [contentFilter, setContentFilter] = useState<ContentMode>('all');
    const [aiDeck, setAiDeck] = useState<FlashcardItem[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    
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

    const topics = useMemo(() => {
        let allAvailableTopics = new Set(allItems.map(i => i.topic));

        // Ensure Spec Topics are included even if no items exist for them yet (for AI generation)
        if (user.level === 'IGCSE') {
            Object.keys(IGCSE_SPEC_TOPICS).forEach(t => allAvailableTopics.add(t));
        } else if (user.level === 'GCSE') {
            Object.keys(GCSE_SPEC_TOPICS).forEach(t => allAvailableTopics.add(t));
        } else {
            Object.keys(ALEVEL_SPEC_TOPICS).forEach(t => allAvailableTopics.add(t));
        }

        return ['All Topics', ...Array.from(allAvailableTopics)].sort();
    }, [allItems, user.level]);
    
    // Derived sub-topics based on user level and selected main topic
    const subTopics = useMemo(() => {
        if (topicFilter === 'All Topics') return ['All Sub-topics'];
        let specTopics = GCSE_SPEC_TOPICS;
        if (user.level === 'A-Level') specTopics = ALEVEL_SPEC_TOPICS;
        if (user.level === 'IGCSE') specTopics = IGCSE_SPEC_TOPICS;
        return ['All Sub-topics', ...(specTopics[topicFilter] || [])];
    }, [topicFilter, user.level]);

    // Reset sub-topic when main topic changes
    useEffect(() => {
        setSubTopicFilter('All Sub-topics');
        setAiDeck([]); // Clear AI deck when switching topics
    }, [topicFilter]);

    const handleGenerate = async () => {
        if (topicFilter === 'All Topics' || subTopicFilter === 'All Sub-topics') return;

        setIsGenerating(true);
        try {
            const level = user.level || 'A-Level';
            const cards = await generateFlashcards(topicFilter, subTopicFilter, level);
            setAiDeck(cards);
            setFilter('all'); // Reset filters to show new cards
            logUserActivity(user.uid, 'generate_flashcards', { topic: topicFilter, subTopic: subTopicFilter });
        } catch (e) {
            console.error("Failed to generate flashcards", e);
            alert("Failed to generate cards. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const currentDeck = useMemo(() => {
        return aiDeck.length > 0 ? aiDeck : allItems;
    }, [aiDeck, allItems]);

    const filteredDeck = useMemo(() => {
        // If AI deck is active, we don't filter by topic/content/subtopic again because it's already specific
        // We only filter by known status
        if (aiDeck.length > 0) {
             return aiDeck.filter(item => {
                const statusMatch = filter === 'all' || (knownStatuses[item.name] || 'unknown') === filter;
                return statusMatch;
             });
        }

        return allItems.filter(item => {
            const statusMatch = filter === 'all' || (knownStatuses[item.name] || 'unknown') === filter;
            const topicMatch = topicFilter === 'All Topics' || item.topic === topicFilter;
            // Static items don't have sub-topics, so we ignore subTopicFilter for static deck
            // (User sees 'All Sub-topics' or specific ones. If specific selected, deck is empty unless AI generated)

            const contentMatch = contentFilter === 'all' || 
                                 (contentFilter === 'cases' && (item as any).type === 'case_study') ||
                                 (contentFilter === 'terms' && (item as any).type === 'term');
            
            if (subTopicFilter !== 'All Sub-topics') return false; // Hide static items when detailed subtopic selected

            return statusMatch && topicMatch && contentMatch;
        });
    }, [filter, topicFilter, subTopicFilter, contentFilter, knownStatuses, allItems, aiDeck]);

    useEffect(() => {
        setCurrentIndex(0);
        setIsFlipped(false);
    }, [filteredDeck]); // When deck changes

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

    const handleQuizUnknown = () => {
        // Filter current deck for unknown items
        const unknownItems = currentDeck.filter(item => (knownStatuses[item.name] || 'unknown') === 'unknown');
        if (unknownItems.length === 0) {
            alert("No unknown items in this deck!");
            return;
        }
        onQuiz(unknownItems);
    };
    
    const FilterButton: React.FC<{ mode: FilterMode, label: string, count: number }> = ({ mode, label, count }) => (
        <button onClick={() => setFilter(mode)} className={`px-4 py-2 rounded-full font-semibold transition-colors flex items-center gap-2 text-sm sm:text-base ${filter === mode ? 'bg-white text-fuchsia-600 shadow-md' : 'bg-fuchsia-100/50 dark:bg-fuchsia-900/30 text-fuchsia-800 dark:text-fuchsia-300 hover:bg-white/80 dark:hover:bg-stone-700'}`}>
            {label} <span className={`px-2 py-0.5 rounded-full text-xs ${filter === mode ? 'bg-fuchsia-100 text-fuchsia-700' : 'bg-fuchsia-200/80 dark:bg-fuchsia-800/50'}`}>{count}</span>
        </button>
    );

    const knownCount = useMemo(() => {
        // Only count known for items that match current content/topic filter
        if (aiDeck.length > 0) {
             return aiDeck.filter(item => knownStatuses[item.name] === 'known').length;
        }
        // For static deck, we need to respect topic/content filters but NOT status filter (since we are counting knowns vs unknowns)
        return allItems.filter(item => {
             const topicMatch = topicFilter === 'All Topics' || item.topic === topicFilter;
             const contentMatch = contentFilter === 'all' ||
                                 (contentFilter === 'cases' && (item as any).type === 'case_study') ||
                                 (contentFilter === 'terms' && (item as any).type === 'term');
             if (subTopicFilter !== 'All Sub-topics') return false;
             return topicMatch && contentMatch && knownStatuses[item.name] === 'known';
        }).length;
    }, [knownStatuses, filteredDeck, aiDeck, allItems, topicFilter, contentFilter, subTopicFilter]);
    
    // Total count of relevant items (ignoring status filter) to calc unknown
    const totalRelevantCount = useMemo(() => {
         if (aiDeck.length > 0) return aiDeck.length;
         return allItems.filter(item => {
             const topicMatch = topicFilter === 'All Topics' || item.topic === topicFilter;
             const contentMatch = contentFilter === 'all' ||
                                 (contentFilter === 'cases' && (item as any).type === 'case_study') ||
                                 (contentFilter === 'terms' && (item as any).type === 'term');
             if (subTopicFilter !== 'All Sub-topics') return false;
             return topicMatch && contentMatch;
         }).length;
    }, [aiDeck, allItems, topicFilter, contentFilter, subTopicFilter]);

    const unknownCount = totalRelevantCount - knownCount;

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

            <div className="flex flex-col gap-4 mb-8 w-full max-w-3xl">
                {/* Filters */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-3 p-4 bg-fuchsia-50 dark:bg-stone-800/50 border border-fuchsia-200/50 dark:border-stone-700 rounded-2xl">
                    <div className="flex items-center gap-2 bg-white dark:bg-stone-900 p-1 rounded-lg border border-stone-200 dark:border-stone-700">
                        <button onClick={() => setContentFilter('all')} className={`px-3 py-1 rounded-md text-sm font-semibold transition ${contentFilter === 'all' ? 'bg-fuchsia-100 dark:bg-fuchsia-900/50 text-fuchsia-800 dark:text-fuchsia-200' : 'text-stone-500 dark:text-stone-400'}`}>All</button>
                        <button onClick={() => setContentFilter('cases')} className={`px-3 py-1 rounded-md text-sm font-semibold transition ${contentFilter === 'cases' ? 'bg-fuchsia-100 dark:bg-fuchsia-900/50 text-fuchsia-800 dark:text-fuchsia-200' : 'text-stone-500 dark:text-stone-400'}`}>Cases</button>
                        <button onClick={() => setContentFilter('terms')} className={`px-3 py-1 rounded-md text-sm font-semibold transition ${contentFilter === 'terms' ? 'bg-fuchsia-100 dark:bg-fuchsia-900/50 text-fuchsia-800 dark:text-fuchsia-200' : 'text-stone-500 dark:text-stone-400'}`}>Terms</button>
                    </div>
                    
                    <div className="relative">
                        <select 
                            value={topicFilter} 
                            onChange={e => setTopicFilter(e.target.value)}
                            className="w-48 pl-4 pr-10 py-2 rounded-lg font-semibold bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 shadow-sm border border-stone-200 dark:border-stone-700 appearance-none cursor-pointer focus:ring-2 focus:ring-fuchsia-500 focus:outline-none text-sm truncate"
                        >
                            {topics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
                        </select>
                    </div>

                    {topicFilter !== 'All Topics' && (
                        <div className="relative">
                             <select
                                value={subTopicFilter}
                                onChange={e => setSubTopicFilter(e.target.value)}
                                className="w-48 pl-4 pr-10 py-2 rounded-lg font-semibold bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 shadow-sm border border-stone-200 dark:border-stone-700 appearance-none cursor-pointer focus:ring-2 focus:ring-fuchsia-500 focus:outline-none text-sm truncate"
                            >
                                {subTopics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
                            </select>
                        </div>
                    )}
                </div>
                
                {/* Status Filter */}
                <div className="flex items-center justify-center gap-2">
                    <FilterButton mode="all" label="All" count={filteredDeck.length} />
                    <FilterButton mode="unknown" label="To Learn" count={unknownCount} />
                    <FilterButton mode="known" label="Learned" count={knownCount} />
                </div>
            </div>

            {isGenerating ? (
                <div className="text-center py-20 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl w-full max-w-2xl animate-pulse">
                     <span className="text-6xl">✨</span>
                     <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mt-4">Generating Flashcards...</h2>
                     <p className="text-stone-500 dark:text-stone-400 mt-2">Creating custom cards for {subTopicFilter}...</p>
                </div>
            ) : filteredDeck.length === 0 ? (
                 <div className="text-center py-20 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl w-full max-w-2xl animate-fade-in flex flex-col items-center">
                    {subTopicFilter !== 'All Sub-topics' && aiDeck.length === 0 ? (
                        <>
                            <span className="text-6xl">🤖</span>
                            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mt-4">Generate AI Flashcards?</h2>
                            <p className="text-stone-500 dark:text-stone-400 mt-2 max-w-md">No static cards exist for this specific sub-topic. Would you like our AI to generate a custom deck for you?</p>
                            <button
                                onClick={handleGenerate}
                                className="mt-6 px-8 py-3 bg-fuchsia-600 text-white font-bold rounded-full hover:bg-fuchsia-700 transition shadow-lg"
                            >
                                ✨ Generate Cards for "{subTopicFilter}"
                            </button>
                        </>
                    ) : (
                        <>
                            <span className="text-6xl">🎉</span>
                            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mt-4">All caught up!</h2>
                            <p className="text-stone-500 dark:text-stone-400 mt-2">No cards match your current filters.</p>
                            <button onClick={() => { setFilter('all'); setTopicFilter('All Topics'); setContentFilter('all'); }} className="mt-6 text-fuchsia-600 dark:text-fuchsia-400 hover:underline">Reset Filters</button>
                        </>
                    )}
                </div>
            ) : (
                <div className="w-full max-w-2xl animate-fade-in">
                    {aiDeck.length > 0 && (
                        <div className="mb-4 text-center">
                            <span className="bg-fuchsia-100 text-fuchsia-800 text-xs font-bold px-3 py-1 rounded-full border border-fuchsia-200">
                                ✨ AI Generated Deck: {subTopicFilter}
                            </span>
                            <button onClick={() => { setAiDeck([]); setSubTopicFilter('All Sub-topics'); }} className="ml-2 text-xs text-stone-400 hover:underline">Clear</button>
                        </div>
                    )}

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

            <div className="flex flex-wrap justify-center gap-4 mt-12">
                <button onClick={() => onQuiz(filteredDeck)} disabled={filteredDeck.length === 0} className="px-8 py-3 bg-white dark:bg-stone-800 border-2 border-fuchsia-500 text-fuchsia-600 dark:text-fuchsia-400 font-bold rounded-full hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg">
                    Quiz me on this deck!
                </button>
                <button onClick={handleQuizUnknown} disabled={unknownCount === 0} className="px-8 py-3 bg-fuchsia-600 text-white font-bold rounded-full hover:bg-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg">
                    Quiz on "To Learn" ({unknownCount})
                </button>
            </div>

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
