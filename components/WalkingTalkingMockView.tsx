import React, { useState, useEffect, useRef } from 'react';
import { AuthUser, WalkingTalkingSession, Question, AIFeedback, UserLevel } from '../types';
import { EXAM_STRUCTURES, ExamStructure, ExamSection } from '../data/examStructures';
import { generateQuestion, markStudentAnswer, generateFigure } from '../services/geminiService';
import { doc, setDoc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { v4 as uuidv4 } from 'uuid';
import { FigureDisplay } from './SharedQuestionComponents';

interface WalkingTalkingMockViewProps {
    user: AuthUser;
    onBack: () => void;
}

type Step = 'setup' | 'briefing' | 'answering' | 'marking' | 'feedback' | 'summary';

const WalkingTalkingMockView: React.FC<WalkingTalkingMockViewProps> = ({ user, onBack }) => {
    // --- State ---
    const [step, setStep] = useState<Step>('setup');
    const [selectedPaper, setSelectedPaper] = useState<ExamStructure | null>(null);
    const [duration, setDuration] = useState<number>(0); // minutes
    const [session, setSession] = useState<WalkingTalkingSession | null>(null);
    const [resumeSessionData, setResumeSessionData] = useState<WalkingTalkingSession | null>(null);

    // Generation & Loading
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // Current Question State
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [studentAnswer, setStudentAnswer] = useState('');
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerRef = useRef<number | null>(null);

    // Audio / TTS
    const [isSpeaking, setIsSpeaking] = useState(false);
    const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

    // --- Effects ---

    // Load existing session if any
    useEffect(() => {
        const checkResume = async () => {
            try {
                const q = query(
                    collection(db, 'users', user.uid, 'walking_talking_sessions'),
                    where('isComplete', '==', false),
                    orderBy('startTime', 'desc'),
                    limit(1)
                );
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    const found = snapshot.docs[0].data() as WalkingTalkingSession;
                    setResumeSessionData(found);
                }
            } catch (e) {
                console.error("Failed to check for resume session", e);
            }
        };
        checkResume();

        return () => {
            stopSpeaking();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [user.uid]);

    // Timer Logic
    useEffect(() => {
        if (isTimerRunning && timer > 0) {
            timerRef.current = window.setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        setIsTimerRunning(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timer === 0 && isTimerRunning) {
            setIsTimerRunning(false);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isTimerRunning, timer]);

    // --- Helpers ---

    const stopSpeaking = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    const speak = (text: string) => {
        stopSpeaking();
        if (!text) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Try to select a British voice if available
        const voices = window.speechSynthesis.getVoices();
        const gbVoice = voices.find(v => v.lang.includes('GB') || v.name.includes('UK'));
        if (gbVoice) utterance.voice = gbVoice;

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        synthesisRef.current = utterance;
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // --- Core Logic ---

    const handlePaperSelect = (paper: ExamStructure) => {
        setSelectedPaper(paper);
        setDuration(paper.defaultDuration);
    };

    const generateSessionPlan = async () => {
        if (!selectedPaper || !user) return;
        setIsGenerating(true);
        setLoadingMessage('Creating your Walking Talking Mock plan...');

        try {
            // 1. Determine Target Marks based on Duration
            const ratio = duration / selectedPaper.defaultDuration;
            const targetMarks = Math.round(selectedPaper.totalMarks * ratio);

            // 2. Select Questions (Subset Logic)
            let selectedQuestions: { sectionTitle: string; qConfig: any }[] = [];
            let currentTotalMarks = 0;

            // Simple strategy: Iterate sections, pick questions to maintain spread
            // We want to roughly match the ratio for each section too?
            // Or just pick sequentially?
            // Let's pick 1 from each section in round-robin until we hit target marks.

            const availableQs = selectedPaper.sections.map(s => ({
                sectionTitle: s.title,
                questions: [...s.questions] // Copy
            }));

            let sectionIndex = 0;
            let attempts = 0;
            // Loop until we reach target marks or run out of questions
            while (currentTotalMarks < targetMarks && attempts < 100) {
                const section = availableQs[sectionIndex];
                if (section.questions.length > 0) {
                    // Pick the next question from this section
                    // Prefer larger questions? Or usually start small?
                    // Exam order is usually small -> large. So shift().
                    const qConfig = section.questions.shift();
                    if (qConfig) {
                         // Check if adding this exceeds target significantly?
                         // Allow small overshoot (e.g. +5 marks)
                         if (currentTotalMarks + qConfig.marks <= targetMarks + 5) {
                             selectedQuestions.push({ sectionTitle: section.sectionTitle, qConfig });
                             currentTotalMarks += qConfig.marks;
                         }
                    }
                }
                sectionIndex = (sectionIndex + 1) % availableQs.length;
                attempts++;
            }

            // If we have NO questions (e.g. extremely short duration), force at least one.
            if (selectedQuestions.length === 0 && availableQs[0].questions.length > 0) {
                 selectedQuestions.push({ sectionTitle: availableQs[0].sectionTitle, qConfig: availableQs[0].questions[0] });
            }

            // 3. Generate Content for the FIRST question immediately?
            // Or just set up the structure.
            // Let's generate the first question to start.
            setLoadingMessage('Generating Question 1...');

            const firstQItem = selectedQuestions[0];
            const firstQData = await generateQuestion({
                unit: firstQItem.sectionTitle, // "Section A: Hazards"
                marks: firstQItem.qConfig.marks,
                level: user.level || 'GCSE',
                questionType: firstQItem.qConfig.type,
                includeFigure: firstQItem.qConfig.type.includes('Figure') || Math.random() > 0.7 // Chance of figure
            });

            // If figure needed
            let figures: Question['figures'] = [];
            if (firstQData.figureDescription) {
                 setLoadingMessage('Creating resource...');
                 const img = await generateFigure(firstQData.figureDescription);
                 figures.push({ name: 'Resource', url: img });
            }

            const firstQuestion: Question = {
                id: uuidv4(),
                examYear: 2024,
                questionNumber: '1',
                unit: firstQItem.sectionTitle,
                title: firstQData.title || `Question 1`,
                prompt: firstQData.prompt,
                marks: firstQData.marks,
                ao: firstQData.ao,
                caseStudy: firstQData.caseStudy,
                markScheme: firstQData.markScheme,
                figures,
                level: user.level || 'GCSE'
            };

            // Create Session Object
            const newSession: WalkingTalkingSession = {
                id: uuidv4(),
                userId: user.uid,
                structureId: selectedPaper.title,
                startTime: new Date().toISOString(),
                currentQuestionIndex: 0,
                questions: selectedQuestions.map((item, idx) => ({
                    id: uuidv4(),
                    sectionTitle: item.sectionTitle,
                    // We only have the full question for the first one for now
                    question: idx === 0 ? firstQuestion : {
                        id: 'pending',
                        title: 'Pending...',
                        prompt: 'Loading question content...',
                        marks: item.qConfig.marks, // Correct marks
                        figures: [], // No figures yet
                        examYear: 2024,
                        questionNumber: (idx + 1).toString(),
                        unit: item.sectionTitle,
                        ao: { ao1: 0, ao2: 0, ao3: 0 },
                        caseStudy: { title: '', content: '' },
                        markScheme: { title: '', content: '' },
                        level: user.level || 'GCSE'
                    },
                    status: idx === 0 ? 'active' : 'pending',
                    // Store the config to generate later
                    _config: item.qConfig
                } as any)),
                isComplete: false
            };

            // Save initial state
            await setDoc(doc(db, 'users', user.uid, 'walking_talking_sessions', newSession.id), newSession);

            setSession(newSession);
            setStep('briefing');

            // Trigger Briefing Speech
            handleBriefingStart(newSession.questions[0].question);

        } catch (e) {
            console.error(e);
            alert("Failed to generate session. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const generateNextQuestion = async (index: number) => {
        if (!session || !user) return null;
        const targetQ = session.questions[index];
        const config = (targetQ as any)._config; // hidden config

        if (!config) return targetQ.question; // Already generated?

        try {
            const qData = await generateQuestion({
                unit: targetQ.sectionTitle,
                marks: config.marks,
                level: user.level || 'GCSE',
                questionType: config.type,
                includeFigure: config.type.includes('Figure') || Math.random() > 0.7
            });

            let figures: Question['figures'] = [];
            if (qData.figureDescription) {
                 const img = await generateFigure(qData.figureDescription);
                 figures.push({ name: 'Resource', url: img });
            }

            const fullQuestion: Question = {
                id: uuidv4(),
                examYear: 2024,
                questionNumber: (index + 1).toString(),
                unit: targetQ.sectionTitle,
                title: qData.title || `Question ${index + 1}`,
                prompt: qData.prompt,
                marks: qData.marks,
                ao: qData.ao,
                caseStudy: qData.caseStudy,
                markScheme: qData.markScheme,
                figures,
                level: user.level || 'GCSE'
            };
            return fullQuestion;
        } catch (e) {
            console.error("BG Gen failed", e);
            return null;
        }
    };

    // --- Flow Handlers ---

    const handleBriefingStart = (q: Question) => {
        // Generate a briefing script based on the question
        // Simple heuristic for now, or could call AI?
        // Let's use a heuristic to save tokens/time.

        const strategy = `Question ${q.questionNumber}. This is a ${q.marks} mark question on ${q.unit}. ` +
                         `Read the command word carefully. ` +
                         (q.marks >= 6 ? `For ${q.marks} marks, remember to include specific evidence and evaluation. ` : `Keep your answer concise. `) +
                         (q.figures?.length ? `Use the figure provided to support your answer. ` : ``) +
                         `You have ${Math.ceil(q.marks * 1.5)} minutes. Good luck!`;

        speak(strategy);
    };

    const startAnswering = () => {
        stopSpeaking();
        if (!session) return;
        const currentQ = session.questions[currentQIndex].question;

        // Timer: 1.25 mins per mark? Or 1.5? Standard is ~1 min/mark + reading time.
        // Let's give 1.5 mins per mark.
        const timeAllowed = Math.ceil(currentQ.marks * 1.5 * 60);
        setTimer(timeAllowed);
        setIsTimerRunning(true);
        setStep('answering');
    };

    const submitAnswer = async () => {
        setIsTimerRunning(false);
        stopSpeaking();
        if (!session || !user) return;

        setStep('marking');
        setLoadingMessage('Marking your answer...');

        const currentQItem = session.questions[currentQIndex];
        const feedback = await markStudentAnswer(currentQItem.question, studentAnswer);

        // Update Session
        const updatedQuestions = [...session.questions];
        updatedQuestions[currentQIndex] = {
            ...currentQItem,
            status: 'completed',
            studentAnswer,
            feedback,
            timeTaken: (timerRef.current ? Math.abs(timer - (currentQItem.question.marks * 1.5 * 60)) : 0) // rough calc
        };

        setSession({ ...session, questions: updatedQuestions });
        setLoadingMessage('');
        setStep('feedback');

        // Verbal Feedback
        const verbalFeedback = `You scored ${feedback.score} out of ${feedback.totalMarks}. ${feedback.overallComment}`;
        speak(verbalFeedback);

        // Save to Firestore (Background)
        try {
            const sessionRef = doc(db, 'users', user.uid, 'walking_talking_sessions', session.id);
            await setDoc(sessionRef, { ...session, questions: updatedQuestions });
        } catch (e) {
            console.error("Failed to save session", e);
        }
    };

    const nextQuestion = async () => {
        stopSpeaking();
        if (!session) return;
        setStudentAnswer('');

        const nextIndex = currentQIndex + 1;

        // Save progress before moving on
        const updatedSession = { ...session, currentQuestionIndex: nextIndex };
        if (nextIndex >= session.questions.length) {
            updatedSession.isComplete = true;
        }

        try {
            await setDoc(doc(db, 'users', user.uid, 'walking_talking_sessions', session.id), updatedSession);
        } catch (e) {
            console.error("Save failed", e);
        }

        if (nextIndex >= session.questions.length) {
            setSession(updatedSession);
            setStep('summary');
            return;
        }

        setSession(updatedSession);
        setCurrentQIndex(nextIndex);
        setStep('briefing');
        setLoadingMessage('Preparing next question...');

        // Check if next question is ready
        let nextQ = session.questions[nextIndex].question;
        if (nextQ.id === 'pending') {
            const genQ = await generateNextQuestion(nextIndex);
            if (genQ) {
                const updatedQuestions = [...session.questions];
                updatedQuestions[nextIndex].question = genQ;
                updatedQuestions[nextIndex].status = 'active';
                setSession({ ...session, questions: updatedQuestions });
                nextQ = genQ;
            } else {
                alert("Failed to load next question.");
                return;
            }
        }

        setLoadingMessage('');
        handleBriefingStart(nextQ);
    };

    // --- Renderers ---

    const handleResume = () => {
        if (resumeSessionData) {
            // Find the correct paper structure
            const paper = EXAM_STRUCTURES.find(p => p.title === resumeSessionData.structureId);
            if (paper) setSelectedPaper(paper);

            setSession(resumeSessionData);
            setCurrentQIndex(resumeSessionData.currentQuestionIndex);

            // Determine step based on status
            const currentQ = resumeSessionData.questions[resumeSessionData.currentQuestionIndex];
            if (currentQ.status === 'completed') {
                setStep('feedback'); // Or should we move to next immediately? Feedback lets them see where they left off.
            } else {
                setStep('briefing'); // Default restart at briefing for that question
            }
        }
    };

    if (step === 'setup') {
        const availablePapers = EXAM_STRUCTURES.filter(p => !user.level || p.level === user.level);
        return (
            <div className="max-w-4xl mx-auto mt-8 animate-fade-in p-6">
                <button onClick={onBack} className="mb-6 text-stone-500 hover:text-stone-700 font-bold flex items-center gap-2">← Back to Hub</button>

                <h1 className="text-3xl font-extrabold text-stone-800 dark:text-stone-100 mb-2">Walking Talking Mock</h1>
                <p className="text-stone-600 dark:text-stone-400 mb-8">Select a paper and duration. The AI will guide you through a realistic exam simulation with audio strategy briefings and instant marking.</p>

                {resumeSessionData && (
                    <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl flex justify-between items-center animate-fade-in">
                        <div>
                            <h3 className="font-bold text-indigo-900 dark:text-indigo-300">Resume Incomplete Session</h3>
                            <p className="text-sm text-indigo-700 dark:text-indigo-400">
                                {resumeSessionData.structureId} • {new Date(resumeSessionData.startTime).toLocaleDateString()}
                            </p>
                        </div>
                        <button
                            onClick={handleResume}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm"
                        >
                            Resume
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2 uppercase tracking-wide">Select Paper</label>
                        <div className="space-y-3">
                            {availablePapers.map(paper => (
                                <button
                                    key={paper.title}
                                    onClick={() => handlePaperSelect(paper)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedPaper?.title === paper.title ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-200' : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-indigo-300'}`}
                                >
                                    <div className="font-bold text-stone-800 dark:text-stone-200">{paper.title}</div>
                                    <div className="text-sm text-stone-500">{paper.sections.length} Sections • {paper.totalMarks} Marks • {paper.defaultDuration} mins</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedPaper && (
                        <div className="animate-fade-in">
                            <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2 uppercase tracking-wide">Select Duration</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[selectedPaper.defaultDuration, 60, 45, 30].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDuration(d)}
                                        className={`p-4 rounded-xl border-2 font-bold transition-all ${duration === d ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'}`}
                                    >
                                        {d} Minutes
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-stone-500 mt-2 italic">
                                *Choosing a shorter duration will generate a representative subset of questions (approx {Math.round(selectedPaper.totalMarks * (duration / selectedPaper.defaultDuration))} marks).
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={generateSessionPlan}
                        disabled={!selectedPaper || duration === 0 || isGenerating}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-full shadow-lg transform transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <span className="animate-spin text-xl">⏳</span>
                                {loadingMessage || 'Generating...'}
                            </>
                        ) : (
                            <>
                                <span>🚀</span> Start Mock Exam
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    if (!session) return <div className="text-center p-20">Loading...</div>;

    const currentQItem = session.questions[currentQIndex];
    const q = currentQItem.question;
    const progressPercent = ((currentQIndex) / session.questions.length) * 100;

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col">
            {/* Header */}
            <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 p-4 sticky top-0 z-10 shadow-sm">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="text-stone-400 hover:text-stone-600">✕ Exit</button>
                        <div>
                            <h2 className="font-bold text-stone-800 dark:text-stone-100">{selectedPaper?.title}</h2>
                            <div className="flex items-center gap-2 text-xs text-stone-500">
                                <div className="w-32 h-2 bg-stone-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                                </div>
                                <span>Question {currentQIndex + 1} of {session.questions.length}</span>
                            </div>
                        </div>
                    </div>
                    {step === 'answering' && (
                        <div className={`text-2xl font-mono font-bold ${timer < 60 ? 'text-red-500 animate-pulse' : 'text-stone-700 dark:text-stone-300'}`}>
                            {formatTime(timer)}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 flex flex-col">

                {/* Briefing Phase */}
                {step === 'briefing' && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in max-w-2xl mx-auto relative">
                        {loadingMessage ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-sm z-10">
                                <div className="animate-spin text-4xl mb-4">⏳</div>
                                <p className="font-bold text-stone-600 dark:text-stone-300">{loadingMessage}</p>
                            </div>
                        ) : null}

                        <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-lg">
                            🎧
                        </div>
                        <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-4">Strategy Briefing</h2>
                        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 mb-8">
                            <p className="text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
                                "This is a <span className="font-bold text-indigo-600">{q.marks} mark</span> question on <span className="font-bold">{q.unit}</span>.
                                Pay attention to the command word. Check for any figures."
                            </p>
                            <div className="mt-4 flex justify-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Audio Active</span>
                                <div className="flex gap-1 items-end h-4">
                                    <div className="w-1 bg-indigo-500 animate-pulse h-2"></div>
                                    <div className="w-1 bg-indigo-500 animate-pulse h-4 delay-75"></div>
                                    <div className="w-1 bg-indigo-500 animate-pulse h-3 delay-150"></div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={startAnswering}
                            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold rounded-full shadow-xl transform transition hover:scale-105 active:scale-95"
                        >
                            Start Question
                        </button>
                    </div>
                )}

                {/* Answering Phase */}
                {step === 'answering' && (
                    <div className="animate-fade-in flex flex-col md:flex-row gap-8 h-full">
                        {/* Question Side */}
                        <div className="md:w-1/2 overflow-y-auto custom-scrollbar bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800">
                            <div className="mb-4">
                                <span className="inline-block bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-bold px-2 py-1 rounded mb-2">
                                    {currentQItem.sectionTitle}
                                </span>
                                <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">
                                    {q.title} <span className="text-indigo-600 text-base ml-2">({q.marks} Marks)</span>
                                </h3>
                                <p className="text-stone-700 dark:text-stone-300 text-lg whitespace-pre-wrap">{q.prompt}</p>
                            </div>
                            <FigureDisplay figures={q.figures} onImageError={() => {}} />
                        </div>

                        {/* Answer Side */}
                        <div className="md:w-1/2 flex flex-col">
                            <textarea
                                value={studentAnswer}
                                onChange={e => setStudentAnswer(e.target.value)}
                                placeholder="Type your answer here..."
                                className="flex-1 w-full p-4 rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 focus:ring-2 focus:ring-indigo-500 resize-none font-medium text-stone-800 dark:text-stone-200"
                            />
                            <button
                                onClick={submitAnswer}
                                className="mt-4 w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg transition"
                            >
                                Submit Answer
                            </button>
                        </div>
                    </div>
                )}

                {/* Marking Phase (Loading) */}
                {step === 'marking' && (
                    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in py-20">
                        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                        <h2 className="text-2xl font-bold text-stone-700 dark:text-stone-300">Marking your answer...</h2>
                        <p className="text-stone-500 dark:text-stone-400">The AI examiner is reviewing your points against the mark scheme.</p>
                    </div>
                )}

                {/* Feedback Phase */}
                {step === 'feedback' && currentQItem.feedback && (
                    <div className="animate-fade-in flex flex-col h-full overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Feedback</h2>
                            <button
                                onClick={nextQuestion}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg flex items-center gap-2"
                            >
                                Next Question <span>→</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
                            {/* Score Card */}
                            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-y-auto custom-scrollbar">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-sm font-bold text-stone-500 uppercase">Score</p>
                                        <p className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                            {currentQItem.feedback.score} <span className="text-lg text-stone-400">/ {currentQItem.feedback.totalMarks}</span>
                                        </p>
                                    </div>
                                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-3xl">
                                        {currentQItem.feedback.score / currentQItem.feedback.totalMarks >= 0.7 ? '🌟' : '📝'}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <p className="font-medium text-stone-700 dark:text-stone-300 italic">"{currentQItem.feedback.overallComment}"</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                                        <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-2">Strengths</h4>
                                        <ul className="list-disc list-inside text-sm text-emerald-700 dark:text-emerald-400 space-y-1">
                                            {currentQItem.feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800">
                                        <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-2">Improvements</h4>
                                        <ul className="list-disc list-inside text-sm text-amber-700 dark:text-amber-400 space-y-1">
                                            {currentQItem.feedback.improvements.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Annotated Answer */}
                            <div className="bg-stone-50 dark:bg-stone-900/50 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-y-auto custom-scrollbar">
                                <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-4">Annotated Answer</h3>
                                <div className="space-y-2">
                                    {currentQItem.feedback.annotatedAnswer.map((seg, i) => (
                                        <span key={i} className={`inline px-1 rounded hover:bg-opacity-80 cursor-help group relative ${
                                            seg.ao.includes('AO1') ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100' :
                                            seg.ao.includes('AO2') ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-900 dark:text-purple-100' :
                                            seg.ao.includes('AO3') ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-900 dark:text-orange-100' :
                                            'bg-transparent text-stone-800 dark:text-stone-200'
                                        }`}>
                                            {seg.text}
                                            {seg.feedback && (
                                                <span className="hidden group-hover:block absolute bottom-full left-0 w-64 p-3 bg-stone-800 text-white text-xs rounded shadow-xl z-20 mb-1">
                                                    <span className="font-bold block mb-1">{seg.ao}</span>
                                                    {seg.feedback}
                                                </span>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary Phase */}
                {step === 'summary' && session && (
                    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in text-center max-w-2xl mx-auto">
                        <div className="text-6xl mb-6">🏆</div>
                        <h2 className="text-4xl font-extrabold text-stone-800 dark:text-stone-100 mb-4">Exam Complete!</h2>
                        <p className="text-xl text-stone-600 dark:text-stone-400 mb-8">
                            You've completed the Walking Talking Mock for <span className="font-bold text-indigo-600">{selectedPaper?.title}</span>.
                        </p>

                        <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-lg border border-stone-200 dark:border-stone-800 w-full mb-8">
                            <div className="grid grid-cols-3 divide-x divide-stone-200 dark:divide-stone-700">
                                <div>
                                    <p className="text-sm font-bold text-stone-500 uppercase mb-1">Total Score</p>
                                    <p className="text-4xl font-bold text-stone-800 dark:text-stone-100">
                                        {session.questions.reduce((acc, q) => acc + (q.feedback?.score || 0), 0)}
                                        <span className="text-lg text-stone-400"> / {session.questions.reduce((acc, q) => acc + (q.question.marks || 0), 0)}</span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-stone-500 uppercase mb-1">Questions</p>
                                    <p className="text-4xl font-bold text-stone-800 dark:text-stone-100">{session.questions.length}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-stone-500 uppercase mb-1">Avg %</p>
                                    <p className="text-4xl font-bold text-stone-800 dark:text-stone-100">
                                        {Math.round((session.questions.reduce((acc, q) => acc + (q.feedback?.score || 0), 0) / session.questions.reduce((acc, q) => acc + (q.question.marks || 0), 0)) * 100)}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onBack}
                            className="px-8 py-4 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-full shadow-lg transition"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
};

export default WalkingTalkingMockView;
