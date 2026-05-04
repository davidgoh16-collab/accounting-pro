import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlashcardItem, CaseStudyQuizQuestion, AuthUser } from '../types';
import { generateBatchQuizQuestions, generateFlashcards } from '../services/geminiService';
import { logUserActivity, auth } from '../firebase';
import { GCSE_SPEC_TOPICS, ALEVEL_SPEC_TOPICS, IGCSE_SPEC_TOPICS } from '../constants';
import confetti from 'canvas-confetti';

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

interface QuizModeViewProps {
    initialDeck?: FlashcardItem[];
    onBack: () => void;
    user?: AuthUser; // Optional to support legacy usage but required for generation
}

interface QuizItem {
    questionData: CaseStudyQuizQuestion;
    sourceItem: FlashcardItem;
}

const QuizModeView: React.FC<QuizModeViewProps> = ({ initialDeck, onBack, user }) => {
    // --- SETUP STATE (For when no initialDeck provided) ---
    const [setupTopic, setSetupTopic] = useState('All Topics');
    const [setupSubTopic, setSetupSubTopic] = useState('All Sub-topics');
    const [isGeneratingDeck, setIsGeneratingDeck] = useState(false);

    // --- QUIZ STATE ---
    const [deck, setDeck] = useState<FlashcardItem[]>(() => {
        if (initialDeck && initialDeck.length > 0) {
            return shuffleArray(initialDeck);
        }
        return [];
    });
    
    // Queue of ready-to-play questions
    const [questions, setQuestions] = useState<QuizItem[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Tracking load progress
    const [nextLoadIndex, setNextLoadIndex] = useState(0);
    const [isLoadingBatch, setIsLoadingBatch] = useState(false);

    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Mistake tracking
    const [incorrectItems, setIncorrectItems] = useState<FlashcardItem[]>([]);
    const [feedbackStatus, setFeedbackStatus] = useState<'helpful' | 'not-helpful' | null>(null);

    const loadBatch = useCallback(async () => {
        if (isLoadingBatch || nextLoadIndex >= deck.length) return;
        
        setIsLoadingBatch(true);
        // Load in batches of 5 to keep it snappy but buffered
        const batchSize = 5;
        const batchItems = deck.slice(nextLoadIndex, nextLoadIndex + batchSize);
        
        try {
            const generatedQuestions = await generateBatchQuizQuestions(batchItems);
            
            // Map generated questions back to their source items
            // We assume the AI preserves order. If it returns fewer, we just take what we got.
            const newQuizItems: QuizItem[] = generatedQuestions.map((q, i) => ({
                questionData: q,
                sourceItem: batchItems[i] || batchItems[0] // Fallback safe
            }));

            setQuestions(prev => [...prev, ...newQuizItems]);
            setNextLoadIndex(prev => prev + batchItems.length);
        } catch (err) {
            console.error("Batch load failed", err);
            // If failed, we skip this batch to avoid being stuck
            setNextLoadIndex(prev => prev + batchItems.length);
            // Only set error if we have NO questions to show
            if (questions.length === 0) {
                setError("Could not generate questions. Please check your connection.");
            }
        } finally {
            setIsLoadingBatch(false);
        }
    }, [deck, nextLoadIndex, isLoadingBatch, questions.length]);

    // Initial Load & Logging
    useEffect(() => {
        if (deck.length > 0 && questions.length === 0 && nextLoadIndex === 0) {
            loadBatch();
            if (auth.currentUser) {
                logUserActivity(auth.currentUser.uid, 'quiz_start', { deckSize: deck.length });
            }
        }
    }, [deck, questions.length, nextLoadIndex, loadBatch]);

    // Buffer Maintenance
    useEffect(() => {
        if (!isLoadingBatch && nextLoadIndex < deck.length && questions.length - currentQuestionIndex <= 2) {
            loadBatch();
        }
    }, [currentQuestionIndex, questions.length, nextLoadIndex, deck.length, isLoadingBatch, loadBatch]);

    const handleAnswer = (answer: string) => {
        if (selectedAnswer || !questions[currentQuestionIndex]) return;
        
        const currentQ = questions[currentQuestionIndex].questionData;
        setSelectedAnswer(answer);

        // Fuzzy comparison logic
        const normalize = (str: string) => str.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
        const correct = normalize(answer) === normalize(currentQ.correctAnswer);

        setIsCorrect(correct);
        if (correct) {
            setScore(prev => prev + 1);
        } else {
            // Track mistake
            setIncorrectItems(prev => [...prev, questions[currentQuestionIndex].sourceItem]);
        }
    };
    
    const handleNext = () => {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setFeedbackStatus(null);
    };

    const handleFeedback = (type: 'helpful' | 'not-helpful') => {
        if (feedbackStatus || !auth.currentUser || !currentQuizItem) return;
        
        setFeedbackStatus(type);
        logUserActivity(auth.currentUser.uid, 'quiz_question_feedback', {
            questionId: (currentQuizItem.sourceItem as any).id || 'unknown',
            questionText: currentQuizItem.questionData.question,
            feedback: type,
            isCorrect: isCorrect
        });
    };
    
    const handleRestart = () => {
        // If we came from Setup Mode (no initialDeck), we go back to Setup
        if (!initialDeck || initialDeck.length === 0) {
             setDeck([]);
             setQuestions([]);
             setCurrentQuestionIndex(0);
             setNextLoadIndex(0);
             setScore(0);
             setSelectedAnswer(null);
             setIsCorrect(null);
             setError(null);
             setIncorrectItems([]);
             // We return to the Setup Screen naturally because deck is []
        } else {
            // If we came with an initial deck (e.g. from Flashcards), we restart that deck
            if (auth.currentUser) {
                logUserActivity(auth.currentUser.uid, 'quiz_restart', { deckSize: initialDeck.length });
            }
            setDeck(shuffleArray(initialDeck));
            setQuestions([]);
            setCurrentQuestionIndex(0);
            setNextLoadIndex(0);
            setScore(0);
            setSelectedAnswer(null);
            setIsCorrect(null);
            setError(null);
            setIncorrectItems([]);
        }
    };

    const handleRetryMistakes = () => {
        if (incorrectItems.length > 0) {
            if (auth.currentUser) {
                logUserActivity(auth.currentUser.uid, 'quiz_retry_mistakes', { deckSize: incorrectItems.length });
            }
            setDeck(shuffleArray(incorrectItems));
            setQuestions([]);
            setCurrentQuestionIndex(0);
            setNextLoadIndex(0);
            setScore(0);
            setSelectedAnswer(null);
            setIsCorrect(null);
            setError(null);
            setIncorrectItems([]); // Clear mistakes for the new round
        }
    };

    const handleGenerateDeckAndStart = async () => {
        if (!user) return;
        setIsGeneratingDeck(true);
        try {
            const level = user.level || 'A-Level';
            // Generate flashcards first to use as the base for the quiz
            // If All Topics/All Sub-topics, we might need a different strategy or just generate generic ones?
            // geminiService generateFlashcards handles specific topics well.
            // If 'All Topics' selected, maybe pick a random one? Or prompt user?
            // For now, let's assume user picks a topic. If 'All Topics', we might fail or need a generic call.
            // Actually, let's force topic selection in UI if possible, or pick random.

            let targetTopic = setupTopic;
            let targetSubTopic = setupSubTopic;

            if (targetTopic === 'All Topics') {
                // Pick a random topic
                let specTopics = GCSE_SPEC_TOPICS;
                if (level === 'A-Level') specTopics = ALEVEL_SPEC_TOPICS;
                if (level === 'IGCSE') specTopics = IGCSE_SPEC_TOPICS;

                const keys = Object.keys(specTopics);
                targetTopic = keys[Math.floor(Math.random() * keys.length)];
                targetSubTopic = 'All Sub-topics';
            }

            const cards = await generateFlashcards(targetTopic, targetSubTopic, level);
            if (cards.length === 0) {
                alert("Could not generate questions for this topic. Please try another.");
            } else {
                setDeck(cards);
                logUserActivity(user.uid, 'quiz_generated', { topic: targetTopic, subTopic: targetSubTopic });
            }
        } catch (e) {
            console.error("Failed to generate quiz deck", e);
            alert("Failed to start quiz.");
        } finally {
            setIsGeneratingDeck(false);
        }
    };

    // Derived States
    const currentQuizItem = questions[currentQuestionIndex];
    const isFinished = deck.length > 0 && !currentQuizItem && nextLoadIndex >= deck.length && !isLoadingBatch;
    const isGlobalLoading = deck.length > 0 && !currentQuizItem && isLoadingBatch;

    useEffect(() => {
        if (isFinished && auth.currentUser) {
            logUserActivity(auth.currentUser.uid, 'quiz_complete', { score, total: questions.length, mistakes: incorrectItems.length });
            
            // Celebration!
            const isPerfectScore = score === questions.length && questions.length > 0;
            const duration = isPerfectScore ? 5 * 1000 : 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { 
                startVelocity: 30, 
                spread: 360, 
                ticks: 60, 
                zIndex: 100,
                colors: isPerfectScore ? ['#FFD700', '#FFA500', '#B8860B', '#FFFACD'] : undefined
            };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval = setInterval(function() {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    clearInterval(interval);
                    return;
                }

                const particleCount = (isPerfectScore ? 100 : 50) * (timeLeft / duration);
                
                // Wide bursts
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
                
                // Extra center burst for perfect score
                if (isPerfectScore && Math.random() > 0.7) {
                    confetti({ 
                        ...defaults, 
                        particleCount: 70, 
                        scalar: 1.2,
                        origin: { x: 0.5, y: 0.5 } 
                    });
                }
            }, 250);

            return () => clearInterval(interval);
        }
    }, [isFinished, score, questions.length, incorrectItems.length]);

    // Setup Data
    const topics = useMemo(() => {
        if (!user) return ['All Topics'];
        let specTopics = GCSE_SPEC_TOPICS;
        if (user.level === 'A-Level') specTopics = ALEVEL_SPEC_TOPICS;
        if (user.level === 'IGCSE') specTopics = IGCSE_SPEC_TOPICS;
        return ['All Topics', ...Object.keys(specTopics).sort()];
    }, [user]);

    const subTopics = useMemo(() => {
        if (setupTopic === 'All Topics' || !user) return ['All Sub-topics'];
        let specTopics = GCSE_SPEC_TOPICS;
        if (user.level === 'A-Level') specTopics = ALEVEL_SPEC_TOPICS;
        if (user.level === 'IGCSE') specTopics = IGCSE_SPEC_TOPICS;
        return ['All Sub-topics', ...(specTopics[setupTopic] || [])];
    }, [setupTopic, user]);

    // Reset sub-topic when main topic changes
    useEffect(() => {
        setSetupSubTopic('All Sub-topics');
    }, [setupTopic]);


    // --- RENDER ---

    // 1. SETUP SCREEN (If no deck)
    if (deck.length === 0 && !isGlobalLoading && !error) {
        return (
            <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-transparent flex flex-col items-center">
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={onBack}
                    className="fixed top-24 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-white/40 dark:bg-stone-800/40 backdrop-blur-xl border border-white/20 dark:border-stone-700/30 rounded-full shadow-lg hover:bg-white dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 font-bold transition-all"
                >
                    <span>&larr;</span> Back
                </motion.button>

                <div className="max-w-xl w-full mt-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl font-extrabold text-stone-800 dark:text-stone-100 mb-2 tracking-tight">Adaptive Quiz</h1>
                        <p className="text-stone-600 dark:text-stone-400 mb-10 text-lg">Master your accounting concepts with AI-powered questions.</p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/40 dark:bg-stone-900/40 backdrop-blur-xl border border-white/20 dark:border-stone-700/30 rounded-[2.5rem] shadow-2xl p-10 space-y-8"
                    >
                        <div className="space-y-6">
                            <div className="text-left">
                                <label className="block text-xs uppercase tracking-widest font-black text-stone-500 dark:text-stone-400 mb-3 ml-1">Focus Topic</label>
                                <select
                                    value={setupTopic}
                                    onChange={e => setSetupTopic(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl border-2 border-stone-200 dark:border-stone-700 bg-white/80 dark:bg-stone-800/80 text-stone-800 dark:text-stone-200 font-bold focus:ring-4 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    {topics.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            {setupTopic !== 'All Topics' && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="text-left"
                                >
                                    <label className="block text-xs uppercase tracking-widest font-black text-stone-500 dark:text-stone-400 mb-3 ml-1">Sub-Topic (Optional)</label>
                                    <select
                                        value={setupSubTopic}
                                        onChange={e => setSetupSubTopic(e.target.value)}
                                        className="w-full px-5 py-4 rounded-2xl border-2 border-stone-200 dark:border-stone-700 bg-white/80 dark:bg-stone-800/80 text-stone-800 dark:text-stone-200 font-bold focus:ring-4 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        {subTopics.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </motion.div>
                            )}
                        </div>

                        <button
                            onClick={handleGenerateDeckAndStart}
                            disabled={isGeneratingDeck}
                            className="w-full py-5 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 text-white font-black text-xl rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                {isGeneratingDeck ? (
                                    <>
                                        <span className="animate-spin">⏳</span>
                                        Initializing AI Engine...
                                    </>
                                ) : (
                                    <>
                                        <span>Start Learning</span>
                                        <span className="group-hover:translate-x-1 transition-transform">✨</span>
                                    </>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (error && questions.length === 0) {
         return (
            <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-transparent flex flex-col items-center justify-center text-center">
                <motion.button 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={onBack} 
                    className="fixed top-24 left-4 px-4 py-2 bg-white/40 dark:bg-stone-800/40 backdrop-blur-md border border-white/20 dark:border-stone-700/30 rounded-full shadow-lg text-stone-600 dark:text-stone-300 font-bold"
                >
                    Back
                </motion.button>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-rose-50/50 dark:bg-rose-900/10 p-10 rounded-[2.5rem] border border-rose-200 dark:border-rose-800 backdrop-blur-xl shadow-2xl max-w-md"
                >
                    <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 text-3xl mx-auto mb-6">
                        ⚠️
                    </div>
                    <h2 className="text-2xl font-black text-rose-800 dark:text-rose-200 mb-2">Connection Issue</h2>
                    <p className="text-rose-700/80 dark:text-rose-400/80 mb-8 font-medium">{error}</p>
                    <button 
                        onClick={handleRestart} 
                        className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Try Again
                    </button>
                </motion.div>
            </div>
         );
    }

    if (isGlobalLoading || isGeneratingDeck) {
        return (
             <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-transparent flex flex-col items-center justify-center">
                 <motion.button 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={onBack} 
                    className="fixed top-24 left-4 px-4 py-2 bg-white/40 dark:bg-stone-800/40 backdrop-blur-md border border-white/20 dark:border-stone-700/30 rounded-full shadow-lg text-stone-600 dark:text-stone-300 font-bold"
                >
                    Back
                </motion.button>
                 
                 <div className="relative">
                    <div className="absolute inset-0 bg-fuchsia-500/20 blur-3xl rounded-full animate-pulse" />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative bg-white/40 dark:bg-stone-900/40 backdrop-blur-2xl border border-white/20 dark:border-stone-700/30 p-12 rounded-[3rem] shadow-2xl flex flex-col items-center"
                    >
                        <div className="flex items-center justify-center space-x-3 mb-8">
                            {[0, 1, 2].map(i => (
                                <motion.div 
                                    key={i}
                                    animate={{ 
                                        y: [0, -15, 0],
                                        opacity: [0.5, 1, 0.5]
                                    }}
                                    transition={{ 
                                        duration: 0.8, 
                                        repeat: Infinity, 
                                        delay: i * 0.15 
                                    }}
                                    className="w-4 h-4 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-full shadow-lg shadow-fuchsia-500/20"
                                />
                            ))}
                        </div>
                        <h2 className="text-2xl font-black text-stone-800 dark:text-stone-100 tracking-tight text-center">
                            {isGeneratingDeck ? "Crafting Your Experience" : "Syncing with AI"}
                        </h2>
                        <p className="text-stone-500 dark:text-stone-400 font-medium mt-2 text-center max-w-[200px]">
                            {isGeneratingDeck ? "Our AI is generating custom case study questions for you..." : "Fetching the next set of adaptive challenges..."}
                        </p>
                    </motion.div>
                 </div>
             </div>
        )
    }
    
    if (isFinished) {
        const percentage = Math.round((score / questions.length) * 100);
        
        return (
            <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-transparent flex flex-col items-center justify-center text-center">
                <motion.button 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={onBack} 
                    className="fixed top-24 left-4 px-4 py-2 bg-white/40 dark:bg-stone-800/40 backdrop-blur-md border border-white/20 dark:border-stone-700/30 rounded-full shadow-lg text-stone-600 dark:text-stone-300 font-bold"
                >
                    Back
                </motion.button>
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/40 dark:bg-stone-900/40 backdrop-blur-xl border border-white/20 dark:border-stone-700/30 rounded-[3rem] shadow-2xl p-10 md:p-12 max-w-xl w-full"
                >
                    <div className="mb-8">
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 12 }}
                            className="w-24 h-24 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-xl shadow-fuchsia-500/20"
                        >
                            🎓
                        </motion.div>
                        <h1 className="text-4xl font-black text-stone-800 dark:text-stone-100 tracking-tight">Quiz Complete!</h1>
                        <p className="text-stone-500 dark:text-stone-400 mt-2 font-medium">Here's how you performed today</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-10">
                        <div className="p-6 bg-white/50 dark:bg-stone-800/50 rounded-3xl border border-white/20 dark:border-stone-700/30">
                            <p className="text-xs uppercase tracking-widest font-black text-stone-400 mb-1">Final Score</p>
                            <p className="text-4xl font-black text-fuchsia-600 dark:text-fuchsia-400">{score} <span className="text-lg text-stone-400 font-bold">/ {questions.length}</span></p>
                        </div>
                        <div className="p-6 bg-white/50 dark:bg-stone-800/50 rounded-3xl border border-white/20 dark:border-stone-700/30">
                            <p className="text-xs uppercase tracking-widest font-black text-stone-400 mb-1">Accuracy</p>
                            <p className="text-4xl font-black text-purple-600 dark:text-purple-400">{percentage}%</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                         {incorrectItems.length > 0 && (
                            <button
                                onClick={handleRetryMistakes}
                                className="w-full py-4 bg-amber-500 text-white font-black text-lg rounded-2xl hover:bg-amber-600 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Review {incorrectItems.length} Key Areas
                            </button>
                        )}
                        <button 
                            onClick={handleRestart} 
                            className="w-full py-4 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-black text-lg rounded-2xl hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            {(!initialDeck || initialDeck.length === 0) ? 'Start New Session' : 'Try Again'}
                        </button>
                        <button 
                            onClick={onBack} 
                            className="w-full py-4 bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-black text-lg rounded-2xl hover:bg-stone-300 dark:hover:bg-stone-700 transition-all"
                        >
                            Exit to Dashboard
                        </button>
                    </div>
                </motion.div>
            </div>
        )
    }

    // Active Quiz View
    return (
        <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-transparent flex flex-col items-center">
            <button 
                onClick={onBack}
                className="fixed top-24 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-stone-800/80 backdrop-blur-md border border-stone-200 dark:border-stone-700 rounded-full shadow-sm hover:bg-white dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 font-bold transition-all"
            >
                <span>&larr;</span> Back
            </button>

            <div className="w-full max-w-3xl mt-12 space-y-6">
                {/* Progress Bar */}
                <div className="w-full h-2 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                        className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestionIndex + (selectedAnswer ? 1 : 0)) / deck.length) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </div>

                <div className="flex justify-between items-center bg-white/40 dark:bg-stone-800/40 backdrop-blur-md p-4 rounded-2xl border border-white/20 dark:border-stone-700/30 shadow-lg">
                    <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Quiz Mode</h1>
                    <div className="text-right">
                        <p className="font-bold text-fuchsia-700 dark:text-fuchsia-400 text-lg">Score: {score}</p>
                        <p className="text-sm text-stone-500 dark:text-stone-400">Question: {currentQuestionIndex + 1}</p>
                    </div>
                </div>
                <div className="relative">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl border border-white/20 dark:border-stone-700/30 rounded-[2rem] shadow-2xl p-8 md:p-10"
                        >
                            {currentQuizItem ? (
                                <div>
                                    <div className="flex items-center gap-2 mb-6">
                                        <span className="text-[10px] uppercase tracking-wider font-black bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300 px-3 py-1 rounded-full">{currentQuizItem.sourceItem.topic}</span>
                                        <span className="text-[10px] uppercase tracking-wider font-black bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-3 py-1 rounded-full">{(currentQuizItem.sourceItem as any).type === 'term' ? 'Key Term' : 'Case Study'}</span>
                                    </div>
                                    
                                    <h2 className="text-2xl md:text-3xl font-bold text-stone-800 dark:text-stone-100 leading-tight mb-8">
                                        {currentQuizItem.questionData.question}
                                    </h2>
                                    
                                    <div className="space-y-4">
                                        {currentQuizItem.questionData.options.map((option, idx) => {
                                            const isSelected = selectedAnswer === option;
                                            const isTheCorrectAnswer = option === currentQuizItem.questionData.correctAnswer;
                                            
                                            let buttonStyles = 'bg-white/50 dark:bg-stone-800/50 hover:bg-white dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border-stone-200/50 dark:border-stone-700/50';
                                            
                                            if(selectedAnswer) {
                                                if(isTheCorrectAnswer) {
                                                    buttonStyles = 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20';
                                                } else if (isSelected) {
                                                    buttonStyles = 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20';
                                                } else {
                                                    buttonStyles = 'bg-stone-100/50 dark:bg-stone-800/30 text-stone-400 dark:text-stone-500 border-transparent opacity-50';
                                                }
                                            }

                                            return (
                                                 <motion.button 
                                                    key={option} 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    onClick={() => handleAnswer(option)}
                                                    disabled={!!selectedAnswer}
                                                    whileHover={!selectedAnswer ? { scale: 1.02, x: 5 } : {}}
                                                    whileTap={!selectedAnswer ? { scale: 0.98 } : {}}
                                                    className={`w-full p-5 rounded-2xl font-bold text-left transition-all border-2 flex items-center gap-4 text-lg group ${buttonStyles}`}
                                                >
                                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border-2 transition-colors ${
                                                        selectedAnswer 
                                                            ? (isTheCorrectAnswer ? 'bg-white/20 border-white text-white' : isSelected ? 'bg-white/20 border-white text-white' : 'bg-transparent border-stone-300 dark:border-stone-600')
                                                            : 'bg-stone-100 dark:bg-stone-900 border-stone-200 dark:border-stone-700 group-hover:border-fuchsia-400 text-stone-500'
                                                    }`}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </span>
                                                    <span>{option}</span>
                                                    {selectedAnswer && isTheCorrectAnswer && <span className="ml-auto">✨</span>}
                                                </motion.button>
                                            )
                                        })}
                                    </div>

                            {selectedAnswer && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-8 p-6 bg-fuchsia-50/50 dark:bg-fuchsia-900/10 rounded-2xl border border-fuchsia-100 dark:border-fuchsia-900/30"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                            {isCorrect ? '✓' : '!'}
                                        </div>
                                        <p className={`text-xl font-bold ${isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                                            {isCorrect ? 'Excellent Work!' : 'Learning Opportunity'}
                                        </p>
                                    </div>
                                    <p className="text-stone-700 dark:text-stone-300 leading-relaxed italic">
                                        {currentQuizItem.questionData.explanation}
                                    </p>

                                    <div className="mt-4 flex items-center justify-between border-t border-fuchsia-100 dark:border-fuchsia-900/30 pt-4">
                                        <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">
                                            {feedbackStatus ? 'Thank you for your feedback!' : 'Was this helpful?'}
                                        </span>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleFeedback('helpful')}
                                                disabled={!!feedbackStatus}
                                                className={`p-2 rounded-lg transition-all text-lg ${feedbackStatus === 'helpful' ? 'bg-emerald-500 text-white' : 'hover:bg-emerald-100 dark:hover:bg-emerald-900/30 opacity-70 hover:opacity-100'}`}
                                                title="Helpful"
                                            >
                                                👍
                                            </button>
                                            <button 
                                                onClick={() => handleFeedback('not-helpful')}
                                                disabled={!!feedbackStatus}
                                                className={`p-2 rounded-lg transition-all text-lg ${feedbackStatus === 'not-helpful' ? 'bg-rose-500 text-white' : 'hover:bg-rose-100 dark:hover:bg-rose-900/30 opacity-70 hover:opacity-100'}`}
                                                title="Not Helpful"
                                            >
                                                👎
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 flex justify-center">
                                        <button 
                                            onClick={handleNext} 
                                            className="px-10 py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                                        >
                                            Next Question &rarr;
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                                </div>
                            ) : null}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
            <style>{`.animate-fade-in { animation: fadeIn 0.3s ease-in-out; } @keyframes fadeIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }`}</style>
        </div>
    );
};

export default QuizModeView;
