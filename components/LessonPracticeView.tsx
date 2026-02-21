
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

const LessonPracticeView: React.FC<LessonPracticeViewProps> = ({ user, targetUser, onBack }) => {
    const student = targetUser || user;
    const [mode, setMode] = useState<'mark_my_work' | 'record_existing'>('mark_my_work');

    // Form State
    const [unit, setUnit] = useState<string>('');
    const [questionTitle, setQuestionTitle] = useState('');
    const [maxMarks, setMaxMarks] = useState<number>(4);
    const [attachment, setAttachment] = useState<{ data: string; mimeType: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Processing State
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [result, setResult] = useState<any>(null); // To store intermediate result before saving
    const [isSaved, setIsSaved] = useState(false);

    // "Record Existing" specific state (for manual adjustment after digitization)
    const [digitizedScore, setDigitizedScore] = useState<number>(0);
    const [digitizedTotal, setDigitizedTotal] = useState<number>(0);
    const [digitizedFeedback, setDigitizedFeedback] = useState('');
    const [digitizedAnswer, setDigitizedAnswer] = useState('');

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

    const removeAttachment = () => {
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setResult(null);
        setIsSaved(false);
    };

    const handleProcess = async () => {
        if (!attachment || !questionTitle.trim()) return;
        setIsProcessing(true);
        setStatusMessage(mode === 'mark_my_work' ? 'AI is marking your work...' : 'Digitizing your marked paper...');
        setResult(null);

        try {
            if (mode === 'mark_my_work') {
                // Construct a temporary Question object for the AI context
                const tempQuestion: Question = {
                    id: `lesson-${Date.now()}`,
                    examYear: new Date().getFullYear(),
                    questionNumber: 'Lesson',
                    unit: unit,
                    title: questionTitle,
                    prompt: questionTitle, // Assuming title is the prompt for lesson practice
                    marks: maxMarks,
                    ao: { ao1: 0, ao2: 0, ao3: 0 }, // Generic
                    caseStudy: { title: 'N/A', content: 'N/A' },
                    markScheme: { title: 'N/A', content: 'Use expert judgment.' },
                    level: student.level || 'A-Level'
                };

                // Use 'Lesson Answer' as text if only image is provided (the AI will OCR it internally in markStudentAnswer?)
                // Actually markStudentAnswer takes studentAnswer string. If blank, it relies on attachment.
                // But markStudentAnswer prompt says: ${attachment ? ... }.
                // Let's pass "See attached image" as text.
                const feedback = await markStudentAnswer(tempQuestion, "See attached image", attachment);
                setResult({ feedback, question: tempQuestion });

            } else {
                // Record Existing
                const data = await digitizeHandwrittenWork(`data:${attachment.mimeType};base64,${attachment.data}`, student.level || 'A-Level');

                // Set state for manual review
                setDigitizedScore(data.score || 0);
                setDigitizedTotal(data.totalMarks || maxMarks); // Fallback to user input if not found
                setDigitizedFeedback(data.feedback || "No feedback detected.");
                setDigitizedAnswer(data.studentAnswer || "");
                if (data.questionTitle && !questionTitle) setQuestionTitle(data.questionTitle); // Auto-fill if empty

                setResult({ digitized: true }); // Flag to show review UI
            }
        } catch (error) {
            console.error("Processing failed", error);
            alert("Failed to process the image. Please try again.");
        } finally {
            setIsProcessing(false);
            setStatusMessage('');
        }
    };

    const handleSave = async () => {
        if (!result) return;
        setIsProcessing(true);
        setStatusMessage('Saving to your profile...');

        try {
            const timestamp = new Date().toISOString();

            if (mode === 'mark_my_work') {
                // Save as CompletedSession
                const { feedback, question } = result;
                const summary = await generateSessionSummary(question, feedback);

                const newSession: CompletedSession = {
                    id: `lesson-session-${Date.now()}`,
                    question: question,
                    studentAnswer: "Handwritten work uploaded.",
                    aiFeedback: feedback,
                    completedAt: timestamp,
                    aiSummary: summary,
                    level: student.level || 'A-Level',
                    practiceMode: 'lesson_practice'
                };

                await addDoc(collection(db, 'users', student.uid, 'sessions'), newSession);

            } else {
                // Save as TeacherAssessment (or CompletedSession?)
                // The prompt says "feeds into the session analysis".
                // Session Analysis reads from 'sessions' collection (CompletedSession).
                // TeacherFeedbackSection reads from 'student_performance_records' (TeacherAssessment).
                // If we want it in Session Analysis, it MUST be a CompletedSession.

                const tempQuestion: Question = {
                    id: `lesson-scan-${Date.now()}`,
                    examYear: new Date().getFullYear(),
                    questionNumber: 'Scanned',
                    unit: unit,
                    title: questionTitle,
                    prompt: questionTitle,
                    marks: digitizedTotal,
                    ao: { ao1: 0, ao2: 0, ao3: 0 },
                    caseStudy: { title: 'N/A', content: 'N/A' },
                    markScheme: { title: 'N/A', content: 'N/A' },
                    level: student.level || 'A-Level'
                };

                const feedbackObj: AIFeedback = {
                    score: digitizedScore,
                    totalMarks: digitizedTotal,
                    overallComment: digitizedFeedback,
                    strengths: [],
                    improvements: [],
                    annotatedAnswer: [{ text: digitizedAnswer, ao: 'Generic', feedback: digitizedFeedback }]
                };

                const newSession: CompletedSession = {
                    id: `lesson-scan-${Date.now()}`,
                    question: tempQuestion,
                    studentAnswer: digitizedAnswer, // The transcribed text
                    aiFeedback: feedbackObj,
                    completedAt: timestamp,
                    aiSummary: `Uploaded work for ${unit}: ${digitizedScore}/${digitizedTotal}`,
                    level: student.level || 'A-Level',
                    practiceMode: 'lesson_practice'
                };

                await addDoc(collection(db, 'users', student.uid, 'sessions'), newSession);
            }

            setIsSaved(true);
            setStatusMessage('Saved successfully!');
            setTimeout(() => {
                if (targetUser) {
                    // If admin, maybe stay or show success?
                    alert("Uploaded successfully for " + student.displayName);
                    onBack();
                } else {
                    onBack();
                }
            }, 1000);

        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to save.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-4 md:p-8 animate-fade-in">
            <button
                onClick={onBack}
                className="mb-6 flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full shadow-sm hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 font-bold transition-all"
            >
                <span>&larr;</span> Back
            </button>

            <div className="max-w-3xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-3">
                        <span className="text-4xl">📝</span> Lesson Practice
                    </h1>
                    <p className="text-stone-600 dark:text-stone-400 mt-2">
                        Upload your handwritten work {targetUser ? `for ${targetUser.displayName}` : ''}. The AI can mark it for you, or you can record a mark you've already received.
                    </p>
                </header>

                <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 p-6 md:p-8 space-y-8">

                    {/* Mode Toggle */}
                    <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
                        <button
                            onClick={() => { setMode('mark_my_work'); setResult(null); }}
                            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${mode === 'mark_my_work' ? 'bg-white dark:bg-stone-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'}`}
                        >
                            🤖 AI Mark My Work
                        </button>
                        <button
                            onClick={() => { setMode('record_existing'); setResult(null); }}
                            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${mode === 'record_existing' ? 'bg-white dark:bg-stone-700 shadow text-emerald-600 dark:text-emerald-400' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'}`}
                        >
                            📸 Record Existing Mark
                        </button>
                    </div>

                    {/* Form Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Unit / Topic</label>
                            <select
                                value={unit}
                                onChange={e => setUnit(e.target.value)}
                                className="w-full p-3 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="" disabled>Select Unit</option>
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

                    {/* File Upload */}
                    <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl p-6 bg-stone-50 dark:bg-stone-800/50 text-center">
                        {!attachment ? (
                            <>
                                <span className="text-4xl block mb-2">📷</span>
                                <p className="font-bold text-stone-700 dark:text-stone-300">Upload Photo of Work</p>
                                <p className="text-sm text-stone-500 mb-4">Ensure handwriting is clear and legible.</p>
                                <label className="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer transition">
                                    Select Image
                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                                </label>
                            </>
                        ) : (
                            <div className="flex items-center justify-between bg-white dark:bg-stone-800 p-4 rounded-lg shadow-sm">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🖼️</span>
                                    <div className="text-left">
                                        <p className="font-bold text-sm text-stone-800 dark:text-stone-200">Image Attached</p>
                                        <p className="text-xs text-stone-500">{attachment.mimeType}</p>
                                    </div>
                                </div>
                                <button onClick={removeAttachment} className="text-red-500 hover:bg-red-50 p-2 rounded-lg font-bold text-sm">Remove</button>
                            </div>
                        )}
                    </div>

                    {/* Process Button */}
                    {!result && (
                        <button
                            onClick={handleProcess}
                            disabled={isProcessing || !attachment || !questionTitle.trim()}
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:transform-none"
                        >
                            {isProcessing ? statusMessage : 'Process & Analyze'}
                        </button>
                    )}

                    {/* Results Area */}
                    {result && (
                        <div className="animate-fade-in border-t border-stone-200 dark:border-stone-800 pt-8">
                            <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4">
                                {mode === 'mark_my_work' ? 'AI Assessment' : 'Confirm Details'}
                            </h3>

                            {mode === 'mark_my_work' ? (
                                <>
                                    <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-4 mb-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-stone-700 dark:text-stone-300">Score Awarded</span>
                                            <span className="text-2xl font-black text-emerald-600">{result.feedback.score} / {result.feedback.totalMarks}</span>
                                        </div>
                                        <p className="text-stone-600 dark:text-stone-400 italic">"{result.feedback.overallComment}"</p>
                                    </div>
                                    <AnnotatedAnswerDisplay title="Detailed Feedback" segments={result.feedback.annotatedAnswer} />
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Score</label>
                                            <input type="number" value={digitizedScore} onChange={e => setDigitizedScore(parseInt(e.target.value))} className="w-full p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-bold" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Total</label>
                                            <input type="number" value={digitizedTotal} onChange={e => setDigitizedTotal(parseInt(e.target.value))} className="w-full p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-bold" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Teacher Feedback</label>
                                        <textarea value={digitizedFeedback} onChange={e => setDigitizedFeedback(e.target.value)} className="w-full p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm h-24" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Digitized Answer Text</label>
                                        <textarea value={digitizedAnswer} onChange={e => setDigitizedAnswer(e.target.value)} className="w-full p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm h-32" />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 mt-8">
                                <button onClick={() => setResult(null)} className="flex-1 py-3 border border-stone-300 dark:border-stone-700 rounded-xl font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition">
                                    Try Again / Edit
                                </button>
                                <button onClick={handleSave} disabled={isSaved || isProcessing} className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50">
                                    {isSaved ? 'Saved!' : 'Save Result'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LessonPracticeView;
