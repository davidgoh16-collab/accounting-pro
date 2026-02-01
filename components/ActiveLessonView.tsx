
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CourseLesson, LessonContent, AuthUser, LessonBlock, KeyTerm, LessonProgress } from '../types';
import { generateLessonContent, generateSlideImage } from '../services/geminiService';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { KEY_TERMS } from '../knowledge-database';

interface ActiveLessonViewProps {
    lesson: CourseLesson;
    user: AuthUser;
    initialProgress?: LessonProgress;
    onComplete: (score: number) => void;
    onBack: () => void;
}

// Helper to escape regex characters
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Fisher-Yates shuffle
const shuffleArray = (array: string[]) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

// Levenshtein Distance for fuzzy matching
const levenshteinDistance = (a: string, b: string): number => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                );
            }
        }
    }
    return matrix[b.length][a.length];
};

const isFuzzyMatch = (userAnswer: string, correctAnswer: string): boolean => {
    const normUser = userAnswer.trim().toLowerCase().replace(/[.,!?;:]/g, '');
    const normCorrect = correctAnswer.trim().toLowerCase().replace(/[.,!?;:]/g, '');

    if (!normUser || !normCorrect) return false;

    // 1. Exact Match (Normalized)
    if (normUser === normCorrect) return true;

    // 2. Contains Match (if correct answer is long enough, e.g. sentence)
    if (normCorrect.length > 10 && normUser.includes(normCorrect)) return true;
    if (normUser.length > 10 && normCorrect.includes(normUser)) return true;

    // 3. Levenshtein Fuzzy Match
    const distance = levenshteinDistance(normUser, normCorrect);
    // Allow 1 error per 5 characters, max 3 errors
    const allowedErrors = Math.min(3, Math.floor(normCorrect.length / 5));

    return distance <= allowedErrors;
};

const DefinitionModal: React.FC<{ term: KeyTerm; onClose: () => void }> = ({ term, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
        <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-stone-200 dark:border-stone-700 relative" onClick={e => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition">
                <span className="text-2xl">×</span>
            </button>
            <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-1 block">Key Term</span>
                <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{term.name}</h3>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 mb-4">
                <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-medium">{term.details}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                <span>📚</span>
                <span className="italic">{term.citation}</span>
            </div>
        </div>
    </div>
);

const ImageModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in" onClick={onClose}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition p-2">
            <span className="text-4xl">×</span>
        </button>
        <img 
            src={imageUrl} 
            alt="Zoomed diagram" 
            className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()} 
        />
        <p className="absolute bottom-4 left-0 right-0 text-center text-white/50 text-sm">Click anywhere outside to close</p>
    </div>
);

const ActiveLessonView: React.FC<ActiveLessonViewProps> = ({ lesson, user, initialProgress, onComplete, onBack }) => {
    const [content, setContent] = useState<LessonContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentBlockIndex, setCurrentBlockIndex] = useState(initialProgress?.lastBlockIndex || 0);
    const [blockImages, setBlockImages] = useState<Record<number, string>>({}); 
    
    // Activity States
    const [userAnswer, setUserAnswer] = useState<string>(''); // For text/MCQ
    const [fillBlanksAnswers, setFillBlanksAnswers] = useState<string[]>([]); // For Fill Blank
    const [sortedItems, setSortedItems] = useState<string[]>([]); // For Sorting
    const [matchedLabels, setMatchedLabels] = useState<Record<number, string>>({}); // For Diagram Match { 1: "Label A", 2: "Label B" }
    
    const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [score, setScore] = useState(initialProgress?.rawScore || 0);
    const [totalActivities, setTotalActivities] = useState(0);
    
    const [selectedTerm, setSelectedTerm] = useState<KeyTerm | null>(null);
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);
    
    const isMounted = useRef(true);

    // Initial Load
    useEffect(() => {
        isMounted.current = true;
        const fetchContent = async () => {
            setLoading(true);
            setError(null);
            try {
                // If we have saved content, load it to ensure consistency
                let data: LessonContent;
                if (initialProgress?.savedContent) {
                    data = initialProgress.savedContent;
                } else {
                    await setDoc(doc(db, 'users', user.uid, 'learning_progress', lesson.chapter), {
                        [lesson.id]: {
                            completed: false,
                            score: 0,
                            lastAccessed: new Date().toISOString()
                        }
                    }, { merge: true });
                    data = await generateLessonContent(lesson.title, lesson.chapter, user.level || 'A-Level', lesson.id);
                }
                
                if (isMounted.current) {
                    setContent(data);
                    const activities = data.blocks.filter(b => b.type !== 'info').length;
                    setTotalActivities(activities);
                    
                    const preLoadedImages: Record<number, string> = {};
                    data.blocks.forEach((block, idx) => {
                        if ((block.type === 'info' || block.type === 'diagram_match') && block.staticImageUrl) {
                            preLoadedImages[idx] = block.staticImageUrl;
                        }
                    });
                    setBlockImages(preLoadedImages);
                    setLoading(false);

                    // Initialize state for current block (whether it's 0 or restored index)
                    initializeBlockState(data.blocks[currentBlockIndex]);

                    const needsGenerationIndices = data.blocks
                        .map((b, i) => ((b.type === 'info' || b.type === 'diagram_match') && b.imagePrompt && !b.staticImageUrl) ? i : -1)
                        .filter(i => i !== -1);
                    
                    if (needsGenerationIndices.length > 0) {
                        needsGenerationIndices.forEach((idx) => {
                            const block = data.blocks[idx];
                            if (block.imagePrompt) {
                                generateSlideImage(block.imagePrompt).then(url => {
                                    if (isMounted.current) {
                                        setBlockImages(prev => ({ ...prev, [idx]: url }));
                                    }
                                }).catch(err => console.error("Image gen failed", err));
                            }
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to load lesson:", error);
                if (isMounted.current) {
                    setError("Failed to load lesson content. The AI might be busy or the topic is too specific. Please try again.");
                    setLoading(false);
                }
            }
        };
        fetchContent();
        return () => { isMounted.current = false; };
    }, [lesson, user, initialProgress]); // initialProgress only used on mount logic

    const initializeBlockState = (block: LessonBlock) => {
        setUserAnswer('');
        setIsAnswerSubmitted(false);
        setIsCorrect(false);
        setFillBlanksAnswers([]);
        setSortedItems([]);
        setMatchedLabels({});

        if (block?.type === 'sorting' && block.items) {
            setSortedItems(shuffleArray(block.items));
        }
        if (block?.type === 'fill_in_blank' && block.correctBlanks) {
            setFillBlanksAnswers(new Array(block.correctBlanks.length).fill(''));
        }
    };

    useEffect(() => {
        if (content && content.blocks[currentBlockIndex]) {
            initializeBlockState(content.blocks[currentBlockIndex]);
        }
    }, [currentBlockIndex, content]);

    const lessonTerms = useMemo(() => {
        if (!lesson) return [];
        return KEY_TERMS.filter(term => 
            (term.topic === lesson.chapter || lesson.chapter.includes(term.topic)) && 
            term.levels.includes(user.level || 'A-Level')
        ).sort((a, b) => b.name.length - a.name.length);
    }, [lesson, user.level]);

    const renderInteractiveText = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            let isBold = false;
            let cleanText = part;
            if (part.startsWith('**') && part.endsWith('**')) {
                isBold = true;
                cleanText = part.slice(2, -2);
            }
            if (!cleanText) return null;
            if (lessonTerms.length === 0) return isBold ? <strong key={i} className="text-indigo-600 dark:text-indigo-400 font-bold">{cleanText}</strong> : <span key={i}>{cleanText}</span>;

            const pattern = new RegExp(`\\b(${lessonTerms.map(t => escapeRegExp(t.name)).join('|')})\\b`, 'gi');
            const subParts = cleanText.split(pattern);

            return (
                <span key={i}>
                    {subParts.map((subPart, j) => {
                        const matchedTerm = lessonTerms.find(t => t.name.toLowerCase() === subPart.toLowerCase());
                        if (matchedTerm) {
                            return <span key={j} onClick={(e) => { e.stopPropagation(); setSelectedTerm(matchedTerm); }} className="cursor-pointer border-b-2 border-indigo-400/50 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold transition-colors" title="Click for definition">{subPart}</span>;
                        }
                        return isBold ? <strong key={j} className="text-indigo-900 dark:text-indigo-100 font-bold">{subPart}</strong> : subPart;
                    })}
                </span>
            );
        });
    };

    const handleSave = async () => {
        if (!content) return;
        setIsSaving(true);
        try {
            await setDoc(doc(db, 'users', user.uid, 'learning_progress', lesson.chapter), {
                [lesson.id]: {
                    completed: false, // Incomplete if saving mid-way
                    score: totalActivities > 0 ? (score / totalActivities) * 100 : 0, // Current rough percentage
                    lastAccessed: new Date().toISOString(),
                    lastBlockIndex: currentBlockIndex,
                    rawScore: score,
                    savedContent: content // Save content to ensure consistency on resume
                }
            }, { merge: true });
            alert("Progress saved! You can resume this lesson later.");
        } catch (e) {
            console.error("Error saving progress", e);
            alert("Failed to save progress.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleNext = () => {
        if (!content) return;
        if (currentBlockIndex >= content.blocks.length - 1) {
            handleFinish();
            return;
        }
        setCurrentBlockIndex(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    const handleFinish = async () => {
        const finalPercentage = totalActivities > 0 ? (score / totalActivities) * 100 : 100;
        const passed = finalPercentage >= 60; 
        try {
            await setDoc(doc(db, 'users', user.uid, 'learning_progress', lesson.chapter), {
                [lesson.id]: {
                    completed: passed, 
                    score: finalPercentage,
                    completedAt: new Date().toISOString(),
                    lastBlockIndex: 0, // Reset for next time
                    rawScore: 0,
                    // We can keep savedContent or remove it depending on whether we want re-generation
                }
            }, { merge: true });
            onComplete(finalPercentage);
        } catch (e) {
            console.error("Error saving completion", e);
        }
    };

    const checkAnswer = () => {
        if (!content) return;
        const block = content.blocks[currentBlockIndex];
        let correct = false;

        if (block.type === 'sorting' && block.items) {
            correct = block.items.every((val, index) => val === sortedItems[index]);
        } else if (block.type === 'fill_in_blank' && block.correctBlanks) {
            correct = block.correctBlanks.every((val, index) => 
                // Use fuzzy match for blanks too
                isFuzzyMatch(fillBlanksAnswers[index] || '', val)
            );
        } else if (block.type === 'diagram_match' && block.items) {
            correct = block.items.every((item, index) => matchedLabels[index + 1] === item);
        } else if (block.type === 'text_input') {
            const userText = userAnswer.trim();
            const correctText = block.correctAnswer?.trim() || "";

            if (block.keywords && block.keywords.length > 0) {
                // If keywords are present, check if user answer contains most of them
                const matchingCount = block.keywords.filter(keyword => isFuzzyMatch(userText, keyword)).length;
                // Require 50% of keywords, or if only 1, require it.
                correct = matchingCount >= Math.ceil(block.keywords.length / 2);

                // Also do a direct fuzzy match against the "correctAnswer" if provided, just in case keywords fail but intent is right
                if (!correct && correctText) {
                    correct = isFuzzyMatch(userText, correctText);
                }
            } else {
                correct = isFuzzyMatch(userText, correctText);
            }
        } else {
            correct = userAnswer === block.correctAnswer;
        }

        setIsCorrect(correct);
        if (correct) setScore(prev => prev + 1);
        setIsAnswerSubmitted(true);
    };

    const moveSortItem = (fromIndex: number, toIndex: number) => {
        if (toIndex < 0 || toIndex >= sortedItems.length) return;
        const newItems = [...sortedItems];
        const [moved] = newItems.splice(fromIndex, 1);
        newItems.splice(toIndex, 0, moved);
        setSortedItems(newItems);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">Preparing Lesson...</h2>
                <p className="text-stone-500 dark:text-stone-400">Our AI teacher is structuring your content.</p>
                {initialProgress?.savedContent && <p className="text-xs text-indigo-500 mt-2">Resuming your previous session...</p>}
            </div>
        );
    }

    if (error || !content) {
        return (
            <div className="p-8 text-center flex flex-col items-center justify-center h-[50vh]">
                <span className="text-4xl mb-4">⚠️</span>
                <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">Something went wrong</h3>
                <p className="text-stone-600 dark:text-stone-400 mb-6">{error || "Failed to load content."}</p>
                <button onClick={onBack} className="px-6 py-2 bg-stone-200 dark:bg-stone-700 rounded-lg font-bold">Go Back</button>
            </div>
        );
    }

    const currentBlock = content.blocks[currentBlockIndex];
    const progress = ((currentBlockIndex) / content.blocks.length) * 100;

    return (
        <div className="max-w-3xl mx-auto flex flex-col min-h-[85vh]">
            {selectedTerm && <DefinitionModal term={selectedTerm} onClose={() => setSelectedTerm(null)} />}
            {zoomedImage && <ImageModal imageUrl={zoomedImage} onClose={() => setZoomedImage(null)} />}

            <div className="flex flex-col gap-2 mb-6">
                <div className="flex justify-between items-center">
                    <button onClick={onBack} className="text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 font-bold text-sm">
                        &larr; Exit Lesson
                    </button>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleSave} 
                            disabled={isSaving}
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : '💾 Save Progress'}
                        </button>
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                            Block {currentBlockIndex + 1} of {content.blocks.length}
                        </span>
                    </div>
                </div>
                <div className="w-full h-2 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-6 animate-fade-in">
                {currentBlock.type === 'info' ? (
                    <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                        <div className="p-8 pb-4">
                            <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-2">{currentBlock.heading}</h2>
                        </div>
                        {blockImages[currentBlockIndex] ? (
                            <div className="w-full bg-white dark:bg-stone-800 border-y border-stone-100 dark:border-stone-700 relative group cursor-zoom-in flex justify-center py-4" onClick={() => setZoomedImage(blockImages[currentBlockIndex])}>
                                <img src={blockImages[currentBlockIndex]} alt="Lesson diagram" className="max-h-[350px] w-auto object-contain p-2 animate-fade-in" />
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="bg-white/80 dark:bg-black/80 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow-sm flex items-center gap-1"><span>🔍</span> Click to Zoom</span>
                                </div>
                            </div>
                        ) : currentBlock.imagePrompt && (
                            <div className="w-full h-64 bg-stone-50 dark:bg-stone-800/50 flex flex-col items-center justify-center border-y border-stone-100 dark:border-stone-800 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stone-200/20 dark:via-stone-700/20 to-transparent animate-shimmer" style={{ transform: 'skewX(-20deg) translateX(-150%)' }}></div>
                                <div className="flex items-center gap-3 bg-white/50 dark:bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm shadow-sm z-10"><div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div><span className="text-xs font-bold text-stone-500 dark:text-stone-400">Drawing Diagram...</span></div>
                            </div>
                        )}
                        <div className="p-8 pt-6">
                            <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed text-stone-700 dark:text-stone-300">
                                {currentBlock.content?.split('\n\n').map((para, i) => <p key={i} className="mb-4">{renderInteractiveText(para)}</p>)}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-indigo-50 dark:bg-stone-800/80 rounded-3xl shadow-xl border border-indigo-100 dark:border-indigo-900/30 p-8 flex flex-col justify-center min-h-[400px]">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase text-xs tracking-widest mb-4">Knowledge Check</span>
                        <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-8">{currentBlock.question}</h3>
                        
                        {/* Multiple Choice & True/False */}
                        {(currentBlock.type === 'multiple_choice' || currentBlock.type === 'true_false') && (
                            <div className={`grid gap-3 ${currentBlock.type === 'true_false' ? 'grid-cols-2' : ''}`}>
                                {(currentBlock.type === 'true_false' ? ['True', 'False'] : currentBlock.options)?.map((opt, idx) => {
                                    let btnClass = "p-4 text-left rounded-xl border-2 font-medium transition-all ";
                                    if (isAnswerSubmitted) {
                                        if (opt === currentBlock.correctAnswer) btnClass += "bg-emerald-100 border-emerald-500 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200";
                                        else if (opt === userAnswer) btnClass += "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:text-red-200";
                                        else btnClass += "bg-white dark:bg-stone-700 border-stone-200 dark:border-stone-600 opacity-50";
                                    } else {
                                        btnClass += userAnswer === opt ? "bg-indigo-100 border-indigo-500 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-200" : "bg-white dark:bg-stone-700 border-stone-200 dark:border-stone-600 hover:border-indigo-300 dark:hover:border-indigo-500 text-stone-700 dark:text-stone-200";
                                    }
                                    return <button key={idx} onClick={() => !isAnswerSubmitted && setUserAnswer(opt)} disabled={isAnswerSubmitted} className={btnClass}>{opt}</button>;
                                })}
                            </div>
                        )}

                        {/* Text Input */}
                        {currentBlock.type === 'text_input' && (
                            <div>
                                <textarea value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} disabled={isAnswerSubmitted} placeholder="Type your explanation..." className={`w-full p-4 text-lg rounded-xl border-2 outline-none transition-all h-32 ${isAnswerSubmitted ? isCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-900/30" : "border-red-500 bg-red-50 text-red-900 dark:bg-red-900/30" : "border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 focus:border-indigo-500"}`}/>
                                <p className="text-[10px] text-stone-400 mt-1">Do not enter personal or sensitive information.</p>
                                {isAnswerSubmitted && !isCorrect && <p className="mt-2 text-stone-500 dark:text-stone-400 text-sm">Suggested answer: <span className="font-bold text-stone-800 dark:text-stone-200">{currentBlock.correctAnswer}</span></p>}
                            </div>
                        )}

                        {/* Fill in the Blank */}
                        {currentBlock.type === 'fill_in_blank' && (
                            <div className="bg-white dark:bg-stone-700 p-6 rounded-xl border-2 border-stone-200 dark:border-stone-600 text-lg leading-loose">
                                {currentBlock.textWithBlanks?.split('[blank]').map((part, i, arr) => (
                                    <React.Fragment key={i}>
                                        <span className="text-stone-800 dark:text-stone-200">{part}</span>
                                        {i < arr.length - 1 && (
                                            <input type="text" value={fillBlanksAnswers[i] || ''} onChange={(e) => { const newAns = [...fillBlanksAnswers]; newAns[i] = e.target.value; setFillBlanksAnswers(newAns); }} disabled={isAnswerSubmitted} className={`mx-1 px-2 py-1 border-b-2 outline-none w-32 text-center font-bold ${isAnswerSubmitted ? isFuzzyMatch(fillBlanksAnswers[i], currentBlock.correctBlanks?.[i] || '') ? "border-emerald-500 text-emerald-600 bg-emerald-50" : "border-red-500 text-red-600 bg-red-50" : "border-indigo-300 focus:border-indigo-600 bg-indigo-50 dark:bg-stone-800 dark:text-white"}`}/>
                                        )}
                                    </React.Fragment>
                                ))}
                                {isAnswerSubmitted && !isCorrect && (<div className="mt-4 text-sm text-stone-500">Correct words: {currentBlock.correctBlanks?.map((word, i) => <span key={i} className="font-bold mr-2 text-stone-800 dark:text-stone-200">{i+1}. {word}</span>)}</div>)}
                            </div>
                        )}

                        {/* Sorting */}
                        {currentBlock.type === 'sorting' && (
                            <div className="space-y-2">
                                <p className="text-sm text-stone-500 dark:text-stone-400 mb-2">Drag or use arrows to reorder.</p>
                                {sortedItems.map((item, index) => (
                                    <div key={index} className={`flex items-center gap-3 p-3 rounded-lg border-2 bg-white dark:bg-stone-700 transition-colors ${isAnswerSubmitted ? (isCorrect ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200') : 'border-stone-200 dark:border-stone-600'}`}>
                                        <div className="flex flex-col gap-1">
                                            <button onClick={() => !isAnswerSubmitted && moveSortItem(index, index - 1)} disabled={index === 0 || isAnswerSubmitted} className="text-stone-400 hover:text-indigo-500 disabled:opacity-30">▲</button>
                                            <button onClick={() => !isAnswerSubmitted && moveSortItem(index, index + 1)} disabled={index === sortedItems.length - 1 || isAnswerSubmitted} className="text-stone-400 hover:text-indigo-500 disabled:opacity-30">▼</button>
                                        </div>
                                        <span className="font-medium text-stone-800 dark:text-stone-200">{item}</span>
                                    </div>
                                ))}
                                {isAnswerSubmitted && !isCorrect && (<div className="mt-4 p-4 bg-stone-100 dark:bg-stone-800 rounded-lg"><p className="font-bold text-stone-600 dark:text-stone-400 text-xs uppercase mb-2">Correct Order:</p><ol className="list-decimal list-inside text-sm text-stone-800 dark:text-stone-200 space-y-1">{currentBlock.items?.map((item, i) => <li key={i}>{item}</li>)}</ol></div>)}
                            </div>
                        )}

                        {/* Diagram Match */}
                        {currentBlock.type === 'diagram_match' && (
                            <div className="space-y-6">
                                <div className="relative rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700">
                                    {blockImages[currentBlockIndex] ? (
                                        <img src={blockImages[currentBlockIndex]} alt="Diagram to label" className="w-full h-auto object-contain bg-stone-100" />
                                    ) : (
                                        <div className="w-full h-48 bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400">Loading diagram...</div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {currentBlock.items?.map((_, idx) => {
                                        const labelNum = idx + 1;
                                        return (
                                            <div key={labelNum} className="flex items-center gap-3">
                                                <span className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center font-bold text-stone-600 dark:text-stone-300">{labelNum}</span>
                                                <select
                                                    value={matchedLabels[labelNum] || ''}
                                                    onChange={(e) => setMatchedLabels(prev => ({ ...prev, [labelNum]: e.target.value }))}
                                                    disabled={isAnswerSubmitted}
                                                    className={`flex-1 p-2 rounded-lg border-2 outline-none bg-white dark:bg-stone-800 dark:text-white ${isAnswerSubmitted ? (matchedLabels[labelNum] === currentBlock.items?.[idx] ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50') : 'border-stone-200 dark:border-stone-600 focus:border-indigo-500'}`}
                                                >
                                                    <option value="">Select label...</option>
                                                    {currentBlock.items?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                                {isAnswerSubmitted && matchedLabels[labelNum] !== currentBlock.items?.[idx] && (
                                                    <span className="text-xs text-stone-500">({currentBlock.items?.[idx]})</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Feedback Area */}
                        {isAnswerSubmitted && (
                            <div className={`mt-6 p-4 rounded-xl border ${isCorrect ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-stone-100 border-stone-200 dark:bg-stone-800 dark:border-stone-700'} animate-fade-in`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">{isCorrect ? '🎉' : '💡'}</span>
                                    <span className={`font-bold ${isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-stone-700 dark:text-stone-300'}`}>{isCorrect ? 'Correct!' : 'Explanation'}</span>
                                </div>
                                <p className="text-stone-700 dark:text-stone-300">{currentBlock.explanation}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="py-6 mt-4 border-t border-stone-200 dark:border-stone-700">
                {currentBlock.type === 'info' ? (
                    <button onClick={handleNext} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 transition-transform active:scale-95 text-lg">Continue &rarr;</button>
                ) : (
                    !isAnswerSubmitted ? (
                        <button 
                            onClick={checkAnswer} 
                            disabled={
                                (currentBlock.type === 'text_input' && !userAnswer) || 
                                (currentBlock.type === 'fill_in_blank' && fillBlanksAnswers.some(a => !a)) ||
                                (currentBlock.type === 'diagram_match' && Object.keys(matchedLabels).length !== (currentBlock.items?.length || 0))
                            } 
                            className="w-full py-4 bg-stone-800 dark:bg-stone-700 hover:bg-stone-900 dark:hover:bg-stone-600 text-white font-bold rounded-2xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                        >
                            Check Answer
                        </button>
                    ) : (
                        <button onClick={handleNext} className={`w-full py-4 font-bold rounded-2xl shadow-lg transition-transform active:scale-95 text-lg text-white ${isCorrect ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'}`}>
                            {currentBlockIndex >= content.blocks.length - 1 ? 'Finish Lesson' : 'Next Block →'}
                        </button>
                    )
                )}
            </div>
            
            <style>{`.animate-fade-in { animation: fadeIn 0.4s ease-out; } 
                     .animate-shimmer { animation: shimmer 2s infinite linear; }
                     @keyframes shimmer { from { transform: skewX(-20deg) translateX(-150%); } to { transform: skewX(-20deg) translateX(150%); } }
                     @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default ActiveLessonView;
