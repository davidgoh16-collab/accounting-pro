
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { AuthUser, CompletedSession, Question, AIFeedback, UserLevel, TeacherAssessment } from '../types';
import { ALEVEL_UNITS, GCSE_UNITS, IGCSE_UNITS } from '../constants';
import { markStudentAnswer, digitizeHandwrittenWork, generateSessionSummary, getImageLimitStatus } from '../services/geminiService';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { AnnotatedAnswerDisplay } from './SharedQuestionComponents';

interface LessonPracticeViewProps {
    user: AuthUser; // The currently logged in user
    targetUser?: AuthUser; // The student the work belongs to (if different)
    onBack: () => void;
}

interface QueuedQuestion {
    id: string;
    mode: 'mark_my_work' | 'record_existing';
    unit: string;
    questionTitle: string;
    maxMarks: number;
    attachment: { data: string; mimeType: string };

    // Processing results
    status: 'pending' | 'processing' | 'processed' | 'error' | 'saved';
    result?: any;

    // Manual overrides
    digitizedScore?: number;
    digitizedTotal?: number;
    digitizedFeedback?: string;
    digitizedAnswer?: string;
    timeTaken?: number;
}


const LessonPracticeView: React.FC<LessonPracticeViewProps> = ({ user, targetUser, onBack }) => {
    const student = targetUser || user;

    // Session State
    const [sessionName, setSessionName] = useState('');

    // Queue State
    const [queue, setQueue] = useState<QueuedQuestion[]>([]);

    // Form State for new item
    const [mode, setMode] = useState<'mark_my_work' | 'record_existing'>('mark_my_work');
    const [unit, setUnit] = useState<string>('');
    const [questionTitle, setQuestionTitle] = useState('');
    const [maxMarks, setMaxMarks] = useState<number>(4);
    const [attachment, setAttachment] = useState<{ data: string; mimeType: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Processing State
    const [isProcessingAll, setIsProcessingAll] = useState(false);
    const [isSavingAll, setIsSavingAll] = useState(false);

    const availableUnits = useMemo(() => {
        if (student.level === 'IGCSE') return IGCSE_UNITS;
        return student.level === 'GCSE' ? GCSE_UNITS : ALEVEL_UNITS;
    }, [student.level]);

    useEffect(() => {
        if (availableUnits.length > 0 && !unit) {
            setUnit(availableUnits[0]);
        }
    }, [availableUnits]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const matches = base64String.match(/^data:(.*);base64,(.*)$/);
                if (matches && matches.length === 3) {
                    setAttachment({
                        mimeType: matches[1],
                        data: matches[2]
                    });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddToQueue = () => {
        if (!attachment || !questionTitle.trim()) return;

        const newItem: QueuedQuestion = {
            id: Date.now().toString(),
            mode,
            unit,
            questionTitle,
            maxMarks,
            attachment,
            status: 'pending'
        };

        setQueue([...queue, newItem]);

        // Reset form
        setQuestionTitle('');
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRemoveFromQueue = (id: string) => {
        setQueue(queue.filter(q => q.id !== id));
    };

    const processItem = async (item: QueuedQuestion): Promise<QueuedQuestion> => {
        try {
            if (item.mode === 'mark_my_work') {
                const tempQuestion: Question = {
                    id: `lesson-${Date.now()}`,
                    examYear: new Date().getFullYear(),
                    questionNumber: 'Lesson',
                    unit: item.unit,
                    title: item.questionTitle,
                    prompt: item.questionTitle,
                    marks: item.maxMarks,
                    ao: { ao1: 0, ao2: 0, ao3: 0 },
                    caseStudy: { title: 'N/A', content: 'N/A' },
                    markScheme: { title: 'N/A', content: 'Use expert judgment.' },
                    level: student.level || 'A-Level'
                };

                const feedback = await markStudentAnswer(tempQuestion, "See attached image", item.attachment);

                let timeTaken = 0;
                if (feedback.detectedTimeTaken) {
                    const match = feedback.detectedTimeTaken.match(/(\d+)/);
                    if (match) timeTaken = parseInt(match[1]);
                }

                return {
                    ...item,
                    status: 'processed',
                    result: { feedback, question: tempQuestion },
                    timeTaken
                };

            } else {
                const data = await digitizeHandwrittenWork(`data:${item.attachment.mimeType};base64,${item.attachment.data}`, student.level || 'A-Level');

                let timeTaken = 0;
                if (data.timeTaken) {
                    const match = data.timeTaken.match(/(\d+)/);
                    if (match) timeTaken = parseInt(match[1]);
                }

                return {
                    ...item,
                    status: 'processed',
                    result: { digitized: true },
                    digitizedScore: data.score || 0,
                    digitizedTotal: data.totalMarks || item.maxMarks,
                    digitizedFeedback: data.feedback || "No feedback detected.",
                    digitizedAnswer: data.studentAnswer || "",
                    questionTitle: data.questionTitle || item.questionTitle,
                    timeTaken
                };
            }
        } catch (error) {
            console.error("Processing failed for item", item.id, error);
            return { ...item, status: 'error' };
        }
    };

    const handleProcessAll = async () => {
        setIsProcessingAll(true);

        let currentQueue = [...queue];
        for (let i = 0; i < currentQueue.length; i++) {
            if (currentQueue[i].status === 'pending' || currentQueue[i].status === 'error') {
                // Update status to processing
                currentQueue[i] = { ...currentQueue[i], status: 'processing' };
                setQueue([...currentQueue]);

                // Process
                const updatedItem = await processItem(currentQueue[i]);
                currentQueue[i] = updatedItem;
                setQueue([...currentQueue]);
            }
        }

        setIsProcessingAll(false);
    };

    const handleSaveAll = async () => {
        if (!sessionName.trim()) {
            alert("Please provide a session name.");
            return;
        }

        setIsSavingAll(true);
        const timestamp = new Date().toISOString();
        let currentQueue = [...queue];

        for (let i = 0; i < currentQueue.length; i++) {
            const item = currentQueue[i];
            if (item.status === 'processed') {
                try {
                    if (item.mode === 'mark_my_work') {
                        const { feedback, question } = item.result;
                        const summary = await generateSessionSummary(question, feedback);

                        const newSession: CompletedSession = {
                            id: `lesson-session-${Date.now()}-${i}`,
                            question: question,
                            studentAnswer: "Handwritten work uploaded.",
                            aiFeedback: feedback,
                            completedAt: timestamp,
                            aiSummary: summary,
                            level: student.level || 'A-Level',
                            practiceMode: 'lesson_practice',
                            timeTaken: item.timeTaken ? item.timeTaken * 60 : undefined,
                            sessionName: sessionName.trim()
                        };

                        await addDoc(collection(db, 'users', student.uid, 'sessions'), newSession);
                        currentQueue[i] = { ...item, status: 'saved' };
                    } else {
                        const tempQuestion: Question = {
                            id: `lesson-scan-${Date.now()}-${i}`,
                            examYear: new Date().getFullYear(),
                            questionNumber: 'Scanned',
                            unit: item.unit,
                            title: item.questionTitle,
                            prompt: item.questionTitle,
                            marks: item.digitizedTotal || item.maxMarks,
                            ao: { ao1: 0, ao2: 0, ao3: 0 },
                            caseStudy: { title: 'N/A', content: 'N/A' },
                            markScheme: { title: 'N/A', content: 'N/A' },
                            level: student.level || 'A-Level'
                        };

                        const feedbackObj: AIFeedback = {
                            score: item.digitizedScore || 0,
                            totalMarks: item.digitizedTotal || item.maxMarks,
                            overallComment: item.digitizedFeedback || "",
                            strengths: [],
                            improvements: [],
                            annotatedAnswer: [{ text: item.digitizedAnswer || "", ao: 'Generic', feedback: item.digitizedFeedback || "" }]
                        };

                        const newSession: CompletedSession = {
                            id: `lesson-session-${Date.now()}-${i}`,
                            question: tempQuestion,
                            studentAnswer: item.digitizedAnswer || "Handwritten work scanned.",
                            aiFeedback: feedbackObj,
                            completedAt: timestamp,
                            aiSummary: item.digitizedFeedback || "No summary available.",
                            level: student.level || 'A-Level',
                            practiceMode: 'lesson_practice',
                            timeTaken: item.timeTaken ? item.timeTaken * 60 : undefined,
                            sessionName: sessionName.trim()
                        };

                        await addDoc(collection(db, 'users', student.uid, 'sessions'), newSession);
                        currentQueue[i] = { ...item, status: 'saved' };
                    }
                } catch (error) {
                    console.error("Error saving item", item.id, error);
                    currentQueue[i] = { ...item, status: 'error' };
                }
            }
        }

        setQueue([...currentQueue]);
        setIsSavingAll(false);

        if (currentQueue.every(q => q.status === 'saved')) {
            alert("All items saved successfully!");
            onBack();
        }
    };

    // Updates an item in the queue (used for manual overrides)
    const updateQueueItem = (id: string, updates: Partial<QueuedQuestion>) => {
        setQueue(queue.map(q => q.id === id ? { ...q, ...updates } : q));
    };

    return (
        <div className="min-h-screen bg-stone-100 dark:bg-stone-900 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={onBack} className="p-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full transition">
                        <svg className="w-6 h-6 text-stone-600 dark:text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-stone-800 dark:text-stone-100">📝 Lesson Practice Upload</h1>
                        <p className="text-stone-500">Upload multiple handwritten responses to form a single session for {student.displayName || 'you'}.</p>
                    </div>
                </div>

                {/* Session Configuration */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 p-6">
                    <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Session Name</label>
                    <input
                        type="text"
                        value={sessionName}
                        onChange={e => setSessionName(e.target.value)}
                        placeholder="e.g., Hazards session 1"
                        className="w-full p-3 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-indigo-500 text-lg font-bold"
                    />
                </div>

                {/* Add New Item Form */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 p-6">
                    <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-6">Add Question to Queue</h2>

                    <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl mb-6">
                        <button
                            onClick={() => setMode('mark_my_work')}
                            className={`flex-1 py-2 rounded-lg font-bold text-sm transition ${mode === 'mark_my_work' ? 'bg-white dark:bg-stone-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
                        >
                            🤖 AI Mark My Work
                        </button>
                        <button
                            onClick={() => setMode('record_existing')}
                            className={`flex-1 py-2 rounded-lg font-bold text-sm transition ${mode === 'record_existing' ? 'bg-white dark:bg-stone-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
                        >
                            📸 Record Existing Mark
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Unit / Topic</label>
                            <select
                                value={unit}
                                onChange={e => setUnit(e.target.value)}
                                className="w-full p-3 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-indigo-500"
                            >
                                {availableUnits.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Max Marks</label>
                            <select
                                value={maxMarks}
                                onChange={e => setMaxMarks(parseInt(e.target.value))}
                                className="w-full p-3 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-indigo-500"
                            >
                                {[4, 6, 8, 9, 12, 20].map(m => <option key={m} value={m}>{m} Marks</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Question Title / Prompt</label>
                            <input
                                type="text"
                                value={questionTitle}
                                onChange={e => setQuestionTitle(e.target.value)}
                                placeholder="E.g. Explain the formation of a spit..."
                                className="w-full p-3 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl p-6 bg-stone-50 dark:bg-stone-800/50 text-center mb-6">
                        {!attachment ? (
                            <>
                                <span className="text-4xl block mb-2">📷</span>
                                <p className="font-bold text-stone-700 dark:text-stone-300">Upload Photo/PDF of Work</p>
                                <p className="text-sm text-stone-500 mb-4">Ensure handwriting is clear and legible.</p>
                                <label className="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer transition">
                                    Select File
                                    <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileSelect} />
                                </label>
                            </>
                        ) : (
                            <div className="flex items-center justify-between bg-white dark:bg-stone-800 p-4 rounded-lg shadow-sm">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🖼️</span>
                                    <div className="text-left">
                                        <p className="font-bold text-sm text-stone-800 dark:text-stone-200">File Attached</p>
                                        <p className="text-xs text-stone-500">{attachment.mimeType}</p>
                                    </div>
                                </div>
                                <button onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="text-red-500 hover:bg-red-50 p-2 rounded-lg font-bold text-sm">Remove</button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleAddToQueue}
                        disabled={!attachment || !questionTitle.trim()}
                        className="w-full py-3 bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 font-bold rounded-xl shadow-sm hover:bg-stone-900 dark:hover:bg-white transition disabled:opacity-50"
                    >
                        Add Question to Queue
                    </button>
                </div>

                {/* Queue Display & Processing */}
                {queue.length > 0 && (
                    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">Question Queue ({queue.length})</h2>
                            <button
                                onClick={handleProcessAll}
                                disabled={isProcessingAll || queue.every(q => q.status === 'processed' || q.status === 'saved')}
                                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition disabled:opacity-50"
                            >
                                {isProcessingAll ? 'Processing...' : 'Process All Pending'}
                            </button>
                        </div>

                        <div className="space-y-6">
                            {queue.map((item, index) => (
                                <div key={item.id} className="border border-stone-200 dark:border-stone-700 rounded-xl p-4 bg-stone-50 dark:bg-stone-800/30">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100">
                                                <span className="text-indigo-500 mr-2">Q{index + 1}.</span>
                                                {item.questionTitle}
                                            </h3>
                                            <p className="text-sm text-stone-500">{item.unit} • {item.maxMarks} Marks • {item.mode === 'mark_my_work' ? 'AI Mark' : 'Record Existing'}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {item.status === 'pending' && <span className="px-3 py-1 bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-xs font-bold rounded-full">Pending</span>}
                                            {item.status === 'processing' && <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full animate-pulse">Processing...</span>}
                                            {item.status === 'processed' && <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 text-xs font-bold rounded-full">Processed</span>}
                                            {item.status === 'error' && <span className="px-3 py-1 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">Error</span>}
                                            {item.status === 'saved' && <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-full">Saved</span>}

                                            {(item.status === 'pending' || item.status === 'error') && (
                                                <button onClick={() => handleRemoveFromQueue(item.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Review Area for Processed Items */}
                                    {item.status === 'processed' && (
                                        <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                                            {item.mode === 'mark_my_work' ? (
                                                <>
                                                    <div className="bg-white dark:bg-stone-800 rounded-lg p-3 mb-4 shadow-sm">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="font-bold text-stone-700 dark:text-stone-300">Score Awarded</span>
                                                            <span className="text-xl font-black text-emerald-600">{item.result.feedback.score} / {item.result.feedback.totalMarks}</span>
                                                        </div>
                                                        <p className="text-sm text-stone-600 dark:text-stone-400 italic">"{item.result.feedback.overallComment}"</p>
                                                    </div>
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h4 className="text-sm font-bold text-stone-700 dark:text-stone-300">Time Taken (Mins)</h4>
                                                        <input
                                                            type="number"
                                                            value={item.timeTaken || 0}
                                                            onChange={e => updateQueueItem(item.id, { timeTaken: parseInt(e.target.value) || 0 })}
                                                            className="w-20 p-1 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-center text-sm"
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Score</label>
                                                        <input type="number" value={item.digitizedScore || 0} onChange={e => updateQueueItem(item.id, { digitizedScore: parseInt(e.target.value) || 0 })} className="w-full p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Total</label>
                                                        <input type="number" value={item.digitizedTotal || 0} onChange={e => updateQueueItem(item.id, { digitizedTotal: parseInt(e.target.value) || 0 })} className="w-full p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Time (Mins)</label>
                                                        <input type="number" value={item.timeTaken || 0} onChange={e => updateQueueItem(item.id, { timeTaken: parseInt(e.target.value) || 0 })} className="w-full p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm" />
                                                    </div>
                                                    <div className="md:col-span-3">
                                                        <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Teacher Feedback</label>
                                                        <textarea value={item.digitizedFeedback || ''} onChange={e => updateQueueItem(item.id, { digitizedFeedback: e.target.value })} className="w-full p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm h-20" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {queue.some(q => q.status === 'processed') && (
                            <button
                                onClick={handleSaveAll}
                                disabled={isSavingAll || isProcessingAll}
                                className="w-full mt-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50"
                            >
                                {isSavingAll ? 'Saving Session...' : `Save All Processed to "${sessionName || 'Session'}"`}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LessonPracticeView;
