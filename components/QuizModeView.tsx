
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FlashcardItem, CaseStudyQuizQuestion, AuthUser } from '../types';
import { generateBatchQuizQuestions, generateFlashcards } from '../services/geminiService';
import { logUserActivity, auth } from '../firebase';
import { GCSE_SPEC_TOPICS, ALEVEL_SPEC_TOPICS, IGCSE_SPEC_TOPICS } from '../constants';

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
                <button
                    onClick={onBack}
                    className="fixed top-24 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-stone-800/80 backdrop-blur-md border border-stone-200 dark:border-stone-700 rounded-full shadow-sm hover:bg-white dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 font-bold transition-all"
                >
                    <span>&larr;</span> Back
                </button>

                <div className="max-w-xl w-full mt-20 text-center">
                    <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-2">Custom Quiz</h1>
                    <p className="text-stone-600 dark:text-stone-400 mb-8">Select a topic to generate a unique quiz.</p>

                    <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl p-8 space-y-6">
                        <div>
                            <label className="block text-left text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Topic</label>
                            <select
                                value={setupTopic}
                                onChange={e => setSetupTopic(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold focus:ring-2 focus:ring-fuchsia-500 outline-none"
                            >
                                {topics.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        {setupTopic !== 'All Topics' && (
                            <div className="animate-fade-in">
                                <label className="block text-left text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Sub-Topic (Optional)</label>
                                <select
                                    value={setupSubTopic}
                                    onChange={e => setSetupSubTopic(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold focus:ring-2 focus:ring-fuchsia-500 outline-none"
                                >
                                    {subTopics.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        )}

                        <button
                            onClick={handleGenerateDeckAndStart}
                            disabled={isGeneratingDeck}
                            className="w-full py-4 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGeneratingDeck ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin text-xl">⏳</span> Generating...
                                </span>
                            ) : (
                                "Start Quiz ✨"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (error && questions.length === 0) {
         return (
            <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-transparent flex flex-col items-center justify-center text-center">
                <button onClick={onBack} className="fixed top-24 left-4 px-4 py-2 bg-white/80 dark:bg-stone-800/80 backdrop-blur-md border border-stone-200 dark:border-stone-700 rounded-full shadow-sm text-stone-600 dark:text-stone-300 font-bold">Back</button>
                <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-3xl border border-red-200 dark:border-red-800">
                    <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">Error</h2>
                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                    <button onClick={handleRestart} className="px-6 py-2 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 rounded-lg font-bold">Try Again</button>
                </div>
            </div>
         );
    }

    if (isGlobalLoading || isGeneratingDeck) {
        return (
             <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-transparent flex flex-col items-center justify-center">
                 <button onClick={onBack} className="fixed top-24 left-4 px-4 py-2 bg-white/80 dark:bg-stone-800/80 backdrop-blur-md border border-stone-200 dark:border-stone-700 rounded-full shadow-sm text-stone-600 dark:text-stone-300 font-bold">Back</button>
                 <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 bg-fuchsia-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                    <div className="w-4 h-4 bg-fuchsia-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                    <div className="w-4 h-4 bg-fuchsia-500 rounded-full animate-pulse"></div>
                 </div>
                 <p className="text-stone-600 dark:text-stone-400 font-semibold mt-4">
                     {isGeneratingDeck ? "Generating quiz questions..." : (nextLoadIndex === 0 ? "Preparing your quiz..." : "Loading next questions...")}
                 </p>
             </div>
        )
    }
    
    if (isFinished) {
        return (
            <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-transparent flex flex-col items-center justify-center text-center">
                <button onClick={onBack} className="fixed top-24 left-4 px-4 py-2 bg-white/80 dark:bg-stone-800/80 backdrop-blur-md border border-stone-200 dark:border-stone-700 rounded-full shadow-sm text-stone-600 dark:text-stone-300 font-bold">Back</button>
                <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl p-8 max-w-lg w-full">
                    <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">Quiz Complete!</h1>
                    <p className="text-xl text-stone-600 dark:text-stone-300 mt-4">Your final score is:</p>
                    <p className="text-6xl font-bold text-fuchsia-600 dark:text-fuchsia-400 my-6">{score} / {questions.length}</p>
                    <div className="flex flex-col gap-4 justify-center">
                         {incorrectItems.length > 0 && (
                            <button
                                onClick={handleRetryMistakes}
                                className="w-full py-3 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition shadow-lg"
                            >
                                Retry {incorrectItems.length} Mistakes
                            </button>
                        )}
                        <button onClick={handleRestart} className="w-full py-3 bg-fuchsia-500 text-white font-bold rounded-lg hover:bg-fuchsia-600 transition shadow-lg">
                            {(!initialDeck || initialDeck.length === 0) ? 'New Quiz (Setup)' : 'Play Again'}
                        </button>
                        <button onClick={onBack} className="w-full py-3 bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold rounded-lg hover:bg-stone-300 dark:hover:bg-stone-600 transition">Exit</button>
                    </div>
                </div>
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

            <div className="w-full max-w-3xl mt-12">
                <div className="flex justify-between items-center bg-white/50 dark:bg-stone-800/50 backdrop-blur-sm p-4 rounded-xl border border-stone-200 dark:border-stone-700 mb-6">
                    <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Quiz Mode</h1>
                    <div className="text-right">
                        <p className="font-bold text-fuchsia-700 dark:text-fuchsia-400 text-lg">Score: {score}</p>
                        <p className="text-sm text-stone-500 dark:text-stone-400">Question: {currentQuestionIndex + 1}</p>
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl p-8">
                     {currentQuizItem ? (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xs font-bold bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-800 dark:text-fuchsia-300 px-2 py-1 rounded-full">{currentQuizItem.sourceItem.topic}</span>
                                <span className="text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-2 py-1 rounded-full">{(currentQuizItem.sourceItem as any).type === 'term' ? 'Key Term' : 'Case Study'}</span>
                            </div>
                            
                            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{currentQuizItem.questionData.question}</h2>
                            <div className="mt-6 space-y-3">
                                {currentQuizItem.questionData.options.map(option => {
                                    const isSelected = selectedAnswer === option;
                                    const isTheCorrectAnswer = option === currentQuizItem.questionData.correctAnswer;
                                    
                                    let buttonClass = 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200';
                                    if(selectedAnswer) {
                                        if(isTheCorrectAnswer) {
                                            buttonClass = 'bg-emerald-500 text-white';
                                        } else if (isSelected) {
                                            buttonClass = 'bg-rose-500 text-white';
                                        } else {
                                            buttonClass = 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 opacity-60';
                                        }
                                    }

                                    return (
                                         <button 
                                            key={option} 
                                            onClick={() => handleAnswer(option)}
                                            disabled={!!selectedAnswer}
                                            className={`w-full p-4 rounded-lg font-semibold text-left transition-all duration-300 flex items-center gap-4 text-lg ${buttonClass}`}
                                        >
                                            {selectedAnswer && (isTheCorrectAnswer ? '✅' : isSelected ? '❌' : ' ')}
                                            <span>{option}</span>
                                        </button>
                                    )
                                })}
                            </div>

                            {selectedAnswer && (
                                <div className="mt-6 text-center animate-fade-in">
                                    <p className={`text-xl font-bold ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {isCorrect ? 'Correct!' : 'Not quite!'}
                                    </p>
                                    <button onClick={handleNext} className="mt-4 px-8 py-3 bg-fuchsia-500 text-white font-bold rounded-lg hover:bg-fuchsia-600 transition shadow-lg">
                                        Next Question &rarr;
                                    </button>
                                </div>
                            )}
                        </div>
                     ) : (
                         <div className="text-center text-stone-500 dark:text-stone-400">Loading...</div>
                     )}
                </div>
            </div>
             <style>{`.animate-fade-in { animation: fadeIn 0.3s ease-in-out; } @keyframes fadeIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }`}</style>
        </div>
    );
};

export default QuizModeView;
