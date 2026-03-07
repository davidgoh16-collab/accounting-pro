
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { AuthUser, CompletedSession, Question, AIFeedback, UserLevel } from '../types';
import { ALEVEL_UNITS, GCSE_UNITS, IGCSE_UNITS } from '../constants';
import { generateSessionSummary, processMultipleQuestionsFromWork } from '../services/geminiService';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

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

    // Processing results
    status: 'processed' | 'error' | 'saved';
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

    // Form State for new upload
    const [mode, setMode] = useState<'mark_my_work' | 'record_existing'>('mark_my_work');
    const [unit, setUnit] = useState<string>('');
    const [attachment, setAttachment] = useState<{ data: string; mimeType: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Processing State
    const [isProcessing, setIsProcessing] = useState(false);
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

    const handleProcessUpload = async () => {
        if (!attachment) return;
        setIsProcessing(true);

        try {
            const results = await processMultipleQuestionsFromWork(attachment, student.level || 'A-Level', mode);

            const newQueuedItems = results.map((res, index) => {

                const tempQuestion: Question = {
                    id: `lesson-${Date.now()}-${index}`,
                    examYear: new Date().getFullYear(),
                    questionNumber: 'Lesson',
                    unit: unit,
                    title: res.questionTitle || 'Unknown Question',
                    prompt: res.questionTitle || 'Unknown Question',
                    marks: res.maxMarks || 4,
                    ao: { ao1: 0, ao2: 0, ao3: 0 },
                    caseStudy: { title: 'N/A', content: 'N/A' },
                    markScheme: { title: 'N/A', content: 'N/A' },
                    level: student.level || 'A-Level'
                };

                const feedbackObj: AIFeedback = {
                    score: res.score || 0,
                    totalMarks: res.maxMarks || 4,
                    overallComment: res.overallComment || "No comments.",
                    strengths: [],
                    improvements: [],
                    annotatedAnswer: res.annotatedAnswer || [{ text: res.studentAnswer || "No transcript", ao: 'Generic', feedback: res.overallComment || "" }]
                };

                return {
                    id: `${Date.now()}-${index}`,
                    mode,
                    unit,
                    questionTitle: res.questionTitle || `Extracted Question ${index + 1}`,
                    maxMarks: res.maxMarks || 4,
                    status: 'processed' as const,
                    result: { feedback: feedbackObj, question: tempQuestion },
                    digitizedScore: res.score || 0,
                    digitizedTotal: res.maxMarks || 4,
                    digitizedFeedback: res.overallComment || "",
                    digitizedAnswer: res.studentAnswer || "",
                    timeTaken: res.timeTaken || 0
                };
            });

            setQueue([...queue, ...newQueuedItems]);
            setAttachment(null);
            if (fileInputRef.current) fileInputRef.current.value = '';

        } catch (error) {
            console.error("Error processing work", error);
            alert("Failed to process the document. It might be too blurry or not contain clear questions.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRemoveFromQueue = (id: string) => {
        setQueue(queue.filter(q => q.id !== id));
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
                    const { feedback, question } = item.result;

                    // Always try to generate summary from AI if 'mark_my_work' or use teacher feedback
                    let summary = "Scanned Feedback";
                    if (item.mode === 'mark_my_work') {
                         summary = await generateSessionSummary(question, feedback);
                    } else {
                         summary = item.digitizedFeedback || "Teacher Feedback";
                    }

                    // Update question attributes with any manual overrides before saving
                    question.title = item.questionTitle;
                    question.prompt = item.questionTitle;
                    question.marks = item.digitizedTotal || item.maxMarks;

                    feedback.score = item.digitizedScore || 0;
                    feedback.totalMarks = item.digitizedTotal || item.maxMarks;
                    feedback.overallComment = item.digitizedFeedback || feedback.overallComment;


                    const newSession: CompletedSession = {
                        id: `lesson-session-${Date.now()}-${i}`,
                        question: question,
                        studentAnswer: item.digitizedAnswer || "Handwritten work uploaded.",
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
                        <p className="text-stone-500">Upload handwritten responses (with multiple questions per page). The AI will extract and process them automatically.</p>
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

                {/* File Upload Section */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 p-6">
                    <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-6">Upload Work</h2>

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

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Unit / Topic for these questions</label>
                        <select
                            value={unit}
                            onChange={e => setUnit(e.target.value)}
                            className="w-full p-3 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-indigo-500"
                        >
                            {availableUnits.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>

                    <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl p-6 bg-stone-50 dark:bg-stone-800/50 text-center mb-6">
                        {!attachment ? (
                            <>
                                <span className="text-4xl block mb-2">📷</span>
                                <p className="font-bold text-stone-700 dark:text-stone-300">Upload Photo/PDF</p>
                                <p className="text-sm text-stone-500 mb-4">Contains multiple questions? We'll extract them all.</p>
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
                        onClick={handleProcessUpload}
                        disabled={!attachment || isProcessing}
                        className="w-full py-4 bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-stone-900 dark:hover:bg-white transition disabled:opacity-50"
                    >
                        {isProcessing ? '🤖 Scanning and Extracting Questions...' : 'Process Uploaded Work'}
                    </button>
                </div>

                {/* Queue Display & Processing */}
                {queue.length > 0 && (
                    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 p-6">
                        <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-6">Review Extracted Questions ({queue.length})</h2>

                        <div className="space-y-6">
                            {queue.map((item, index) => (
                                <div key={item.id} className="border border-stone-200 dark:border-stone-700 rounded-xl p-4 bg-stone-50 dark:bg-stone-800/30">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-full pr-4">
                                            <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Question {index + 1} Prompt</label>
                                            <input
                                                type="text"
                                                value={item.questionTitle}
                                                onChange={e => updateQueueItem(item.id, { questionTitle: e.target.value })}
                                                className="w-full p-2 mb-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-bold"
                                            />
                                            <p className="text-sm text-stone-500">{item.unit} • {item.mode === 'mark_my_work' ? 'AI Marked' : 'Digitized Record'}</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {item.status === 'saved' && <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-full">Saved</span>}
                                            {item.status !== 'saved' && (
                                                <button onClick={() => handleRemoveFromQueue(item.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Review Area for Processed Items */}
                                    <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Score</label>
                                                <input type="number" value={item.digitizedScore || 0} onChange={e => updateQueueItem(item.id, { digitizedScore: parseInt(e.target.value) || 0 })} className="w-full p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm font-bold text-emerald-600" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Max Marks</label>
                                                <input type="number" value={item.digitizedTotal || 4} onChange={e => updateQueueItem(item.id, { digitizedTotal: parseInt(e.target.value) || 4, maxMarks: parseInt(e.target.value) || 4 })} className="w-full p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Time (Mins)</label>
                                                <input type="number" value={item.timeTaken || 0} onChange={e => updateQueueItem(item.id, { timeTaken: parseInt(e.target.value) || 0 })} className="w-full p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm" />
                                            </div>
                                            <div className="md:col-span-3">
                                                <label className="block text-xs font-bold uppercase text-stone-500 mb-1">{item.mode === 'mark_my_work' ? 'AI Assessment / Comments' : 'Teacher Feedback'}</label>
                                                <textarea value={item.digitizedFeedback || ''} onChange={e => updateQueueItem(item.id, { digitizedFeedback: e.target.value })} className="w-full p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm h-24 italic" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {queue.some(q => q.status === 'processed') && (
                            <button
                                onClick={handleSaveAll}
                                disabled={isSavingAll || isProcessing}
                                className="w-full mt-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50"
                            >
                                {isSavingAll ? 'Saving Session...' : `Save All Questions to "${sessionName || 'Session'}"`}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LessonPracticeView;
