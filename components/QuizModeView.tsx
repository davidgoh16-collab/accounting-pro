
import React, { useState, useEffect, useCallback } from 'react';
import { FlashcardItem, CaseStudyQuizQuestion } from '../types';
import { generateBatchQuizQuestions } from '../services/geminiService';

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
}

interface QuizItem {
    questionData: CaseStudyQuizQuestion;
    sourceItem: FlashcardItem;
}

const QuizModeView: React.FC<QuizModeViewProps> = ({ initialDeck, onBack }) => {
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

    // Initial Load
    useEffect(() => {
        if (deck.length > 0 && questions.length === 0 && nextLoadIndex === 0) {
            loadBatch();
        }
    }, [deck, questions.length, nextLoadIndex, loadBatch]);

    // Buffer Maintenance: Load more when we are 2 questions away from the end
    useEffect(() => {
        if (!isLoadingBatch && nextLoadIndex < deck.length && questions.length - currentQuestionIndex <= 2) {
            loadBatch();
        }
    }, [currentQuestionIndex, questions.length, nextLoadIndex, deck.length, isLoadingBatch, loadBatch]);

    const handleAnswer = (answer: string) => {
        if (selectedAnswer || !questions[currentQuestionIndex]) return;
        
        const currentQ = questions[currentQuestionIndex].questionData;
        setSelectedAnswer(answer);
        const correct = answer.trim() === currentQ.correctAnswer.trim();
        setIsCorrect(correct);
        if (correct) {
            setScore(prev => prev + 1);
        }
    };
    
    const handleNext = () => {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
    };
    
    const handleRestart = () => {
        if (initialDeck) {
            setDeck(shuffleArray(initialDeck));
            setQuestions([]);
            setCurrentQuestionIndex(0);
            setNextLoadIndex(0);
            setScore(0);
            setSelectedAnswer(null);
            setIsCorrect(null);
            setError(null);
            // useEffect will trigger loadBatch
        }
    };

    // Derived States
    const currentQuizItem = questions[currentQuestionIndex];
    const isFinished = !currentQuizItem && nextLoadIndex >= deck.length && !isLoadingBatch;
    const isGlobalLoading = !currentQuizItem && isLoadingBatch;

    // --- RENDER ---

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

    if (isGlobalLoading) {
        return (
             <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-transparent flex flex-col items-center justify-center">
                 <button onClick={onBack} className="fixed top-24 left-4 px-4 py-2 bg-white/80 dark:bg-stone-800/80 backdrop-blur-md border border-stone-200 dark:border-stone-700 rounded-full shadow-sm text-stone-600 dark:text-stone-300 font-bold">Back</button>
                 <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 bg-fuchsia-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                    <div className="w-4 h-4 bg-fuchsia-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                    <div className="w-4 h-4 bg-fuchsia-500 rounded-full animate-pulse"></div>
                 </div>
                 <p className="text-stone-600 dark:text-stone-400 font-semibold mt-4">
                     {nextLoadIndex === 0 ? "Generating your quiz..." : "Loading next questions..."}
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
                    <div className="flex gap-4 justify-center">
                        <button onClick={handleRestart} className="w-full py-3 bg-fuchsia-500 text-white font-bold rounded-lg hover:bg-fuchsia-600 transition shadow-lg">Play Again</button>
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
