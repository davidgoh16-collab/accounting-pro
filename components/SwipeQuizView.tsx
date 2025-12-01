
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CASE_STUDY_LOCATIONS } from '../case-study-database';
import { generateSwipeQuizItem } from '../services/geminiService';
import { SwipeQuizItem, AuthUser } from '../types';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const usePersistentState = <T,>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };
    return [storedValue, setValue];
};

const SwipeQuizView: React.FC<{ topic: string; user: AuthUser; onBack: () => void }> = ({ topic, user, onBack }) => {
    const [cards, setCards] = useState<SwipeQuizItem[]>([]);
    const [status, setStatus] = useState<'intro' | 'loading' | 'playing' | 'error'>('intro');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = usePersistentState('geo-swipe-highscore', 0);
    const [dragX, setDragX] = useState(0);
    const [swipeResult, setSwipeResult] = useState<'correct' | 'incorrect' | null>(null);
    
    const isDraggingRef = useRef(false);
    const startXRef = useRef(0);
    const loadingRef = useRef(false);
    const isMountedRef = useRef(true);

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    // Parallel fetching function
    const fetchCards = useCallback(async (count: number) => {
        if (loadingRef.current) return;
        loadingRef.current = true;

        const promises = [];
        const level = user.level || 'A-Level';
        let pool = CASE_STUDY_LOCATIONS.filter(cs => cs.levels.includes(level));
        
        if (topic !== 'All Topics') {
            pool = pool.filter(cs => cs.topic === topic);
        }
        
        // Fallback if pool is empty (shouldn't happen with proper filters)
        if (pool.length === 0) pool = CASE_STUDY_LOCATIONS.filter(cs => cs.levels.includes(level));

        for (let i = 0; i < count; i++) {
            promises.push(
                (async () => {
                    try {
                        if (!isMountedRef.current) return;
                        // Randomly select a study
                        const randomStudy = pool[Math.floor(Math.random() * pool.length)];
                        // Generate card content
                        const item = await generateSwipeQuizItem(randomStudy);
                        
                        if (isMountedRef.current) {
                            setCards(prev => {
                                const newCards = [...prev, item];
                                // If we were waiting, start playing as soon as we have 1 card
                                setStatus(curr => (curr === 'loading' && newCards.length > 0 ? 'playing' : curr));
                                return newCards;
                            });
                        }
                    } catch (e) {
                        console.warn("Failed to generate a card in background", e);
                    }
                })()
            );
        }

        // Wait for all attempted fetches to finish (success or fail) before allowing new fetches
        await Promise.allSettled(promises);
        if (isMountedRef.current) {
            loadingRef.current = false;
        }
    }, [topic, user.level]);

    // Monitor stack size and replenish buffer
    useEffect(() => {
        if (status === 'playing' && cards.length < 3 && !loadingRef.current) {
            fetchCards(3);
        }
    }, [cards.length, status, fetchCards]);

    const handleStart = () => {
        setScore(0);
        setCards([]);
        setStatus('loading');
        fetchCards(3); // Start with 3 concurrent requests
    };

    const handleSwipe = (direction: 'left' | 'right') => {
        if (cards.length === 0) return;
        
        const currentCard = cards[0];
        const isCorrect = (direction === 'right' && currentCard.correctAnswer) || (direction === 'left' && !currentCard.correctAnswer);
        
        if (isCorrect) {
            setScore(s => {
                const newScore = s + 1;
                if (newScore > highScore) setHighScore(newScore);
                return newScore;
            });
        } else {
            // Optional: Reset score on failure for true "streak" mode, or keep accumulating for session score.
            // Currently keeping session score accumulating.
        }

        // Log result silently
        try {
            addDoc(collection(db, 'users', user.uid, 'game_results'), {
                question: currentCard,
                wasCorrect: isCorrect,
                timestamp: new Date().toISOString(),
                level: user.level || 'A-Level'
            });
        } catch (e) { console.error(e); }

        // Set result state for feedback overlay
        setSwipeResult(isCorrect ? 'correct' : 'incorrect');

        // Animate out
        setDragX(direction === 'right' ? 1000 : -1000);
        
        // Remove card after animation
        setTimeout(() => {
            if (isMountedRef.current) {
                setCards(prev => prev.slice(1));
                setDragX(0);
                setSwipeResult(null);
            }
        }, 350); // Extended duration to see the feedback
    };

    // Touch/Mouse Handlers
    const onStart = (e: React.TouchEvent | React.MouseEvent) => {
        isDraggingRef.current = true;
        startXRef.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
    };

    const onMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (!isDraggingRef.current) return;
        const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        setDragX(currentX - startXRef.current);
    };

    const onEnd = () => {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;
        if (dragX > 100) handleSwipe('right');
        else if (dragX < -100) handleSwipe('left');
        else setDragX(0);
    };

    // Intro Screen
    if (status === 'intro') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white rounded-3xl p-8 text-center max-w-md w-full shadow-2xl border border-stone-200 animate-fade-in">
                    <div className="mb-6 bg-fuchsia-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-4xl">↔️</div>
                    <h1 className="text-4xl font-black text-stone-800 mb-2 tracking-tight">Geo Swipe</h1>
                    <p className="text-stone-600 mb-4 text-lg">Test your knowledge with rapid-fire questions.</p>
                    
                    <div className="mb-8 bg-fuchsia-50 p-3 rounded-lg inline-block">
                        <span className="font-bold text-fuchsia-800 text-sm">HIGH SCORE: {highScore}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                            <div className="text-red-500 font-bold text-xl mb-1">LEFT</div>
                            <div className="text-sm text-stone-500">False</div>
                        </div>
                        <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                            <div className="text-emerald-500 font-bold text-xl mb-1">RIGHT</div>
                            <div className="text-sm text-stone-500">True</div>
                        </div>
                    </div>

                    <button 
                        onClick={handleStart} 
                        className="w-full py-4 bg-fuchsia-600 text-white font-bold rounded-2xl text-xl shadow-lg shadow-fuchsia-500/30 hover:bg-fuchsia-700 hover:scale-[1.02] transition-all"
                    >
                        Start Game
                    </button>
                    
                    <button 
                        onClick={onBack}
                        className="mt-4 text-stone-500 hover:text-stone-700 underline font-semibold"
                    >
                        Back to Menu
                    </button>
                </div>
            </div>
        );
    }

    // Loading Screen (Only shown initially)
    if (status === 'loading') {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-100/90 backdrop-blur-md">
                 <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className="w-4 h-4 bg-fuchsia-600 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                    <div className="w-4 h-4 bg-fuchsia-600 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                    <div className="w-4 h-4 bg-fuchsia-600 rounded-full animate-pulse"></div>
                 </div>
                 <p className="text-stone-600 font-bold text-lg animate-pulse">Creating your deck...</p>
                 <button onClick={onBack} className="mt-8 text-stone-400 hover:text-stone-600 underline text-sm">Cancel</button>
            </div>
        );
    }

    // Main Game View
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center overflow-hidden select-none bg-stone-100">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')]"></div>

            {/* Header */}
            <div className="w-full max-w-xl p-4 flex justify-between items-center z-10 mt-2">
                <button 
                    onClick={onBack} 
                    className="px-4 py-2 bg-white rounded-full text-stone-700 font-bold shadow border border-stone-200 hover:bg-stone-50 transition"
                >
                    EXIT
                </button>
                <div className="flex gap-3">
                    <div className="px-4 py-2 bg-white/80 rounded-full shadow border border-stone-200 text-sm font-bold text-stone-500 flex items-center">
                        BEST: {highScore}
                    </div>
                    <div className="px-6 py-2 bg-white rounded-full shadow border border-stone-200 font-mono font-black text-2xl text-fuchsia-600">
                        {score}
                    </div>
                </div>
            </div>

            {/* Card Area */}
            <div className="flex-1 w-full max-w-md relative flex items-center justify-center mb-8 px-4 z-10">
                {cards.length === 0 ? (
                    <div className="text-center text-stone-500 font-bold animate-pulse bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                        Loading next card...
                    </div>
                ) : (
                    cards.slice(0, 2).reverse().map((card, index) => {
                        const isTop = index === 1; // We render 2 cards, last one is on top
                        
                        // Styles for the stack effect
                        let style: React.CSSProperties = {};
                        if (isTop) {
                            style = { 
                                transform: `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`,
                                cursor: isDraggingRef.current ? 'grabbing' : 'grab',
                                zIndex: 20
                            };
                        } else {
                            // The card behind
                            style = { 
                                transform: 'scale(0.95) translateY(12px)', 
                                opacity: 0.8,
                                zIndex: 10
                            };
                        }

                        return (
                            <div 
                                key={card.id}
                                className="absolute w-full aspect-[3/5] max-h-[70vh] bg-white rounded-3xl shadow-2xl border-2 border-stone-100 overflow-hidden flex flex-col transition-transform duration-200 ease-out"
                                style={style}
                                onMouseDown={isTop ? onStart : undefined}
                                onMouseMove={isTop ? onMove : undefined}
                                onMouseUp={isTop ? onEnd : undefined}
                                onTouchStart={isTop ? onStart : undefined}
                                onTouchMove={isTop ? onMove : undefined}
                                onTouchEnd={isTop ? onEnd : undefined}
                            >
                                {/* Image Section (Top 50%) */}
                                <div className="h-1/2 w-full relative bg-stone-200 border-b border-stone-100">
                                    <img src={card.imageUrl} className="w-full h-full object-cover pointer-events-none" alt="Quiz Visual" />
                                    
                                    {/* Dynamic Feedback Stamps during Drag (Hidden when result is shown) */}
                                    {isTop && !swipeResult && (
                                        <>
                                            <div 
                                                className="absolute top-6 left-6 border-4 border-emerald-500 bg-white/90 text-emerald-600 font-black text-3xl px-4 py-2 rounded-xl rotate-[-15deg] tracking-widest shadow-lg" 
                                                style={{ opacity: Math.max(0, dragX / 150) }}
                                            >
                                                TRUE
                                            </div>
                                            <div 
                                                className="absolute top-6 right-6 border-4 border-red-500 bg-white/90 text-red-600 font-black text-3xl px-4 py-2 rounded-xl rotate-[15deg] tracking-widest shadow-lg" 
                                                style={{ opacity: Math.max(0, -dragX / 150) }}
                                            >
                                                FALSE
                                            </div>
                                        </>
                                    )}

                                    {/* Result Overlay (Shown after swipe) */}
                                    {isTop && swipeResult && (
                                        <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center ${swipeResult === 'correct' ? 'bg-emerald-500/90' : 'bg-rose-500/90'} transition-opacity duration-200`}>
                                            <div className="text-white text-8xl mb-4 drop-shadow-lg scale-125">
                                                {swipeResult === 'correct' ? '✓' : '✕'}
                                            </div>
                                            <div className="text-white text-4xl font-black tracking-widest uppercase drop-shadow-md border-4 border-white px-8 py-3 rounded-2xl">
                                                {swipeResult === 'correct' ? 'CORRECT' : 'WRONG'}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Text Section (Bottom 50%) - Solid White for Readability */}
                                <div className="h-1/2 w-full p-6 flex flex-col items-center justify-center text-center bg-white relative">
                                    {/* Topic Badge */}
                                    <div className="absolute -top-4 bg-fuchsia-100 text-fuchsia-800 text-xs font-bold px-3 py-1 rounded-full border border-fuchsia-200 shadow-sm">
                                        {card.topic}
                                    </div>

                                    <div className="flex-1 flex flex-col justify-center overflow-y-auto custom-scrollbar w-full">
                                        <h3 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug mb-4">{card.statement}</h3>
                                    </div>
                                    
                                    <div className="mt-auto pt-4 border-t border-stone-100 w-full text-stone-400 text-sm font-semibold flex justify-between uppercase tracking-wider">
                                        <span className="flex items-center gap-1"><span className="text-red-400">←</span> False</span>
                                        <span className="flex items-center gap-1">True <span className="text-emerald-400">→</span></span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer / Instructions */}
            <div className="w-full p-4 text-center text-stone-400 text-sm z-10 mb-4">
                Swipe left for False, right for True
            </div>

            <style>{`
                .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
                @keyframes fadeIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
            `}</style>
        </div>
    );
};

export default SwipeQuizView;
