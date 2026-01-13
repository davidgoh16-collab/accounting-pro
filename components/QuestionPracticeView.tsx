
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Question, SessionData, CaseStudyMaster, MarkedModelAnswer, PracticeMode, ChatMessage, AIFeedback, CompletedSession, AnswerSegment, AuthUser, ChatSessionLog, DraftSession } from '../types';
import { ALEVEL_UNITS, GCSE_UNITS } from '../constants';
import { MASTER_CASE_STUDIES } from '../database';
import { getHint, getMotivationalMessage, generateQuestion, generateFigure, generateModelAnswer, streamTutorResponse, generateCaseStudyApplication, markStudentAnswer, generateSessionSummary } from '../services/geminiService';
import { collection, addDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FigureDisplay, AnnotatedAnswerDisplay } from './SharedQuestionComponents';
import SessionDetailView from './SessionDetailView';

const sanitizeFirestoreData = (data: any): any => {
    if (data === undefined) return null;
    if (data === null) return null;
    if (data instanceof Date) return data;
    if (Array.isArray(data)) {
        return data.map(item => {
            const sanitizedItem = sanitizeFirestoreData(item);
            if (Array.isArray(sanitizedItem)) {
                // Firestore doesn't support nested arrays. Convert to object.
                return { ...sanitizedItem };
            }
            return sanitizedItem;
        });
    }
    if (typeof data === 'object') {
        const sanitized: any = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                let newKey = key;
                // Firestore keys cannot contain dots
                if (newKey.includes('.')) {
                    newKey = newKey.replace(/\./g, '_');
                }
                // Firestore keys cannot be empty
                if (!newKey) continue;

                sanitized[newKey] = sanitizeFirestoreData(data[key]);
            }
        }
        return sanitized;
    }
    return data;
};

// ... (keep all existing types and helper components like BuggedQuestion, StructuredPlanInput, etc.)

interface BugAnnotations {
  boxed: string[];
  underlined: string[];
}

const BuggedQuestion: React.FC<{ prompt: string; annotations: BugAnnotations, onMouseUp?: (e: React.MouseEvent) => void }> = ({ prompt, annotations, onMouseUp }) => {
    const allTerms = [...new Set([...annotations.boxed, ...annotations.underlined])].sort((a, b) => b.length - a.length);
    if (allTerms.length === 0) return <div onMouseUp={onMouseUp} className="text-stone-800 dark:text-stone-200">{prompt}</div>;

    const regex = new RegExp(`(${allTerms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const parts = prompt.split(regex);

    return (
        <div onMouseUp={onMouseUp} className="text-stone-800 dark:text-stone-200">
            {parts.map((part, index) => {
                const lowerPart = part.toLowerCase();
                const isBoxed = annotations.boxed.some(b => b.toLowerCase() === lowerPart);
                const isUnderlined = annotations.underlined.some(u => u.toLowerCase() === lowerPart);

                if (isBoxed) {
                    return <span key={index} className="border-2 border-red-500 rounded px-1 py-0.5 font-semibold">{part}</span>;
                }
                if (isUnderlined) {
                    return <span key={index} className="underline decoration-blue-500 decoration-2 underline-offset-2 font-semibold">{part}</span>;
                }
                return <span key={index}>{part}</span>;
            })}
        </div>
    );
};

const StructuredPlanInput: React.FC<{
    label: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}> = ({ label, placeholder, value, onChange }) => (
    <div>
        <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1">{label}</label>
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full p-2 appearance-none border border-stone-300 dark:border-stone-600 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 custom-scrollbar text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500"
            rows={3}
        />
    </div>
);

const StructuredPlanView: React.FC<{
    marks: number;
    planData: Record<string, string>;
    onPlanChange: (field: string, value: string) => void;
}> = ({ marks, planData, onPlanChange }) => {
    let planStructure: { key: string; label: string; placeholder: string }[] = [];

    // Adjusted for both GCSE and A-Level marks
    if (marks === 20) {
            planStructure = [
                { key: 'intro', label: 'Introduction', placeholder: 'Define key terms, state your argument, and signpost your essay.' },
                { key: 'strand1', label: 'Strand 1: Place/Environment', placeholder: 'What are the specific characteristics of your case study locations?' },
                { key: 'strand2', label: 'Strand 2: Concepts/Processes', placeholder: 'What geographical theories and processes are relevant?' },
                { key: 'strand3', label: 'Strand 3: Scale/Time', placeholder: 'How do these factors operate at different scales and change over time?' },
                { key: 'strand4', label: 'Strand 4: Links/Context', placeholder: 'Make connections between different ideas and apply them to the question.' },
                { key: 'strand5', label: 'Strand 5: Analysis/Evaluation', placeholder: 'What are the arguments for and against? What is the relative importance of different factors?' },
                { key: 'conclusion', label: 'Conclusion', placeholder: 'Summarise your arguments and provide a final, definitive judgement that answers the specific question asked.' },
            ];
    } else if (marks === 9) {
            planStructure = [
                { key: 'p1_point', label: 'Paragraph 1: Point', placeholder: 'State your first main point.' },
                { key: 'p1_evidence', label: 'Paragraph 1: Evidence', placeholder: 'Provide specific evidence/data from a case study.' },
                { key: 'p1_explain', label: 'Paragraph 1: Explain', placeholder: 'Explain how your evidence supports your point.' },
                { key: 'p1_link', label: 'Paragraph 1: Link', placeholder: 'Link this paragraph back to the question.' },
                { key: 'p2_point', label: 'Paragraph 2: Point', placeholder: 'State your second main point.' },
                { key: 'p2_evidence', label: 'Paragraph 2: Evidence', placeholder: 'Provide specific evidence/data from a case study.' },
                { key: 'p2_explain', label: 'Paragraph 2: Explain', placeholder: 'Explain how your evidence supports your point.' },
                { key: 'p2_link', label: 'Paragraph 2: Link', placeholder: 'Link this paragraph back to the question.' },
                { key: 'p3_point', label: 'Paragraph 3: Point (Optional)', placeholder: 'State your third main point (if needed).' },
                { key: 'conclusion', label: 'Conclusion', placeholder: 'A clear, concise conclusion that directly answers the question is vital.' },
            ];
    } else if (marks === 6) {
            planStructure = [
                { key: 'trend', label: 'Trend / Overview', placeholder: 'What is the overall pattern or trend in the data?' },
                { key: 'evidence', label: 'Evidence', placeholder: 'Quote specific facts, figures, and dates from the resource.' },
                { key: 'anomaly', label: 'Anomaly', placeholder: 'Point out any data that doesn\'t fit the trend.' },
                { key: 'manipulation', label: 'Manipulation/Reasoning', placeholder: 'Manipulate the data (range, %) or offer geographical reasoning if asked.' },
            ];
    } else if (marks === 4) {
            planStructure = [
                { key: 'point1', label: 'Point 1', placeholder: 'Make your first simple point (e.g., a definition or statement).' },
                { key: 'develop1', label: 'Development', placeholder: 'Develop your point by explaining it or providing an example.' },
                { key: 'point2', label: 'Point 2', placeholder: 'Make your second simple point.' },
                { key: 'develop2', label: 'Development', placeholder: 'Develop your second point with more detail or an example.' },
            ];
    } else {
            return <textarea
                value={planData.generic || ''}
                onChange={(e) => onPlanChange('generic', e.target.value)}
                placeholder="Outline your structure, paragraphs, and key case study evidence here..."
                className="w-full h-48 mt-2 p-2 appearance-none border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 custom-scrollbar bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500"
            />;
    }

    return (
        <div className="space-y-4">
            {planStructure.map(({ key, label, placeholder }) => (
                <StructuredPlanInput
                    key={key}
                    label={label}
                    placeholder={placeholder}
                    value={planData[key] || ''}
                    onChange={(e) => onPlanChange(key, e.target.value)}
                />
            ))}
        </div>
    );
};


interface QuestionPracticeViewProps {
    user: AuthUser;
    sessionToView?: CompletedSession | null;
    draftToResume?: DraftSession | null;
    onBack: () => void;
}

const QuestionPracticeView: React.FC<QuestionPracticeViewProps> = ({ user, sessionToView, draftToResume, onBack }) => {
    const availableUnits = user.level === 'GCSE' ? GCSE_UNITS : ALEVEL_UNITS;
    const [unitFilter, setUnitFilter] = useState<string>(availableUnits[1]);
    const [marksFilter, setMarksFilter] = useState<number>(user.level === 'GCSE' ? 9 : 6);
    
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [stage, setStage] = useState(1);
    const [hint, setHint] = useState<string | null>(null);
    const [isHintLoading, setIsHintLoading] = useState(false);
    const [motivation, setMotivation] = useState<string>('');
    const [hasFigureError, setHasFigureError] = useState(false);
    const [suggestedCaseStudies, setSuggestedCaseStudies] = useState<CaseStudyMaster[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStatus, setGenerationStatus] = useState('');
    const [modelAnswer, setModelAnswer] = useState<MarkedModelAnswer | null>(null);
    const [isModelAnswerLoading, setIsModelAnswerLoading] = useState(false);
    const [startTime, setStartTime] = useState('');
    
    const [practiceMode, setPracticeMode] = useState<PracticeMode>('standard');
    const [supportMode, setSupportMode] = useState<'closed' | 'open'>('closed');
    
    // Timed Mode State
    const [timerMode, setTimerMode] = useState<'stopwatch' | 'timer'>('stopwatch');
    const [time, setTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerRef = useRef<number | null>(null);
    
    // Tutor Mode State
    const [tutorMessages, setTutorMessages] = useState<ChatMessage[]>([]);
    const [tutorInput, setTutorInput] = useState('');
    const [isTutorLoading, setIsTutorLoading] = useState(false);
    const tutorMessagesEndRef = useRef<HTMLDivElement>(null);
    const [liveAnswer, setLiveAnswer] = useState<string>('');
    const [tutorSessionId, setTutorSessionId] = useState<string>(Date.now().toString());
    
    // Teacher Led & Generic Answer State
    const [structuredPlan, setStructuredPlan] = useState<Record<string, string>>({});
    const [studentAnswer, setStudentAnswer] = useState('');
    const [attachment, setAttachment] = useState<{ data: string; mimeType: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [figureNotes, setFigureNotes] = useState('');
    const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
    const [isMarking, setIsMarking] = useState(false);
    const [bugAnnotations, setBugAnnotations] = useState<BugAnnotations>({ boxed: [], underlined: [] });
    const [selectionPopover, setSelectionPopover] = useState<{ x: number; y: number; text: string } | null>(null);
    const sessionReportRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    
    const [caseStudyDetails, setCaseStudyDetails] = useState<{ [key: string]: { summary: string; application: string } }>({});
    const [loadingCaseStudy, setLoadingCaseStudy] = useState<string | null>(null);
    
    const [isSaving, setIsSaving] = useState(false);
    const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
    const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

    const isReviewMode = !!sessionToView;

    // Use Ref to store latest state for auto-save without stale closures
    const stateRef = useRef({
        studentAnswer,
        structuredPlan,
        figureNotes,
        liveAnswer,
        practiceMode,
        time,
        startTime
    });

    useEffect(() => {
        stateRef.current = {
            studentAnswer,
            structuredPlan,
            figureNotes,
            liveAnswer,
            practiceMode,
            time,
            startTime
        };
    }, [studentAnswer, structuredPlan, figureNotes, liveAnswer, practiceMode, time, startTime]);

    // Load Draft
    useEffect(() => {
        if (draftToResume && !isReviewMode) {
            setCurrentQuestion(draftToResume.question);
            setStudentAnswer(draftToResume.studentAnswer);
            setStructuredPlan(draftToResume.structuredPlan);
            setFigureNotes(draftToResume.figureNotes);
            setPracticeMode(draftToResume.practiceMode);
            setCurrentDraftId(draftToResume.id);
            if (draftToResume.startTime) setStartTime(draftToResume.startTime);
            if (draftToResume.timerState) setTime(draftToResume.timerState);
        }
    }, [draftToResume, isReviewMode]);

    const resetStatesForNewQuestion = () => {
        setStage(1);
        setHint(null);
        setModelAnswer(null);
        setPracticeMode('standard');
        setSupportMode('closed');
        setTutorMessages([]);
        setBugAnnotations({ boxed: [], underlined: [] });
        setLiveAnswer('');
        setStructuredPlan({});
        setStudentAnswer('');
        setAttachment(null);
        setFigureNotes('');
        setAiFeedback(null);
        setCaseStudyDetails({});
        setLoadingCaseStudy(null);
        setStartTime('');
        setTutorSessionId(Date.now().toString());
        setCurrentDraftId(null);
        setAutoSaveStatus('idle');
        setLastSavedTime(null);
    };

    useEffect(() => {
        if (sessionToView) {
            setCurrentQuestion(sessionToView.question);
            setStudentAnswer(sessionToView.studentAnswer);
            setAiFeedback(sessionToView.aiFeedback);
            setPracticeMode('teacher_led'); // Default to this view for review
            setHasFigureError(false);
        }
    }, [sessionToView]);


    useEffect(() => {
        if (currentQuestion && !isReviewMode && !draftToResume) {
            setHasFigureError(false);
            // Filter relevant case studies based on unit AND level
            const relevantCaseStudies = MASTER_CASE_STUDIES.filter(cs => 
                cs.aqaUnitMapping.includes(currentQuestion.unit) && 
                (cs.levels.includes(user.level || 'A-Level'))
            );
            setSuggestedCaseStudies(relevantCaseStudies);
            resetStatesForNewQuestion();
        } else if (!isReviewMode && !draftToResume) {
            setSuggestedCaseStudies([]);
        }
        
        if(currentQuestion && draftToResume) {
             const relevantCaseStudies = MASTER_CASE_STUDIES.filter(cs => 
                cs.aqaUnitMapping.includes(currentQuestion.unit) && 
                (cs.levels.includes(user.level || 'A-Level'))
             );
             setSuggestedCaseStudies(relevantCaseStudies);
        }
    }, [currentQuestion, isReviewMode, draftToResume, user.level]);

    // ... (Timer logic remains unchanged)
    useEffect(() => {
        setIsTimerRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);
        
        if (currentQuestion) {
            if (practiceMode === 'timed' || practiceMode === 'teacher_led') {
                if (!draftToResume) {
                     if (timerMode === 'stopwatch') {
                        setTime(0);
                    } else {
                        setTime(currentQuestion.marks * 60);
                    }
                }
            } else {
                setTime(0);
            }

            if (practiceMode === 'tutor' && tutorMessages.length === 0) {
                startTutorSession();
            }
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [practiceMode, currentQuestion]);

    useEffect(() => {
        if (isTimerRunning && (practiceMode === 'timed' || practiceMode === 'teacher_led')) {
            timerRef.current = window.setInterval(() => {
                if (timerMode === 'stopwatch') {
                    setTime(prevTime => prevTime + 1);
                } else {
                    setTime(prevTime => {
                        if (prevTime > 0) {
                            return prevTime - 1;
                        }
                        setIsTimerRunning(false);
                        return 0;
                    });
                }
            }, 1000);
        } else if (!isTimerRunning && timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isTimerRunning, timerMode, practiceMode]);
    
    // ... (Tutor logic remains unchanged except calling streamTutorResponse which now handles level internally via prompt)
    useEffect(() => {
      if (practiceMode === 'tutor') {
        tutorMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }, [tutorMessages, practiceMode]);

    // Save tutor conversation log
    useEffect(() => {
        if (tutorMessages.length > 0 && currentQuestion && user) {
             const saveLog = async () => {
                try {
                    const log: ChatSessionLog = {
                        id: tutorSessionId,
                        type: 'tutor',
                        timestamp: new Date().toISOString(),
                        preview: `Question: ${currentQuestion.title}`,
                        messages: tutorMessages,
                        context: `${currentQuestion.unit} - ${currentQuestion.marks} Marks (${user.level})`
                    };
                    await setDoc(doc(db, 'users', user.uid, 'tutor_logs', tutorSessionId), log);
                } catch (e) {
                    console.error("Error saving tutor log", e);
                }
            };
            saveLog();
        }
    }, [tutorMessages, tutorSessionId, currentQuestion, user]);


    const handleTimerModeChange = (mode: 'stopwatch' | 'timer') => {
        setTimerMode(mode);
        setIsTimerRunning(false);
        if (mode === 'stopwatch') {
            setTime(0);
        } else if (currentQuestion) {
            setTime(currentQuestion.marks * 60);
        }
    };

    const handleReset = () => {
        setIsTimerRunning(false);
        if (timerMode === 'stopwatch') {
            setTime(0);
        } else if (currentQuestion) {
            setTime(currentQuestion.marks * 60);
        }
    };

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
    };
    
    const processStreamedLine = (line: string, modelMessageId: string) => {
        if (line.startsWith('BUG:BOX:')) {
            const text = line.substring(8).trim();
            if(text) setBugAnnotations(prev => ({ ...prev, boxed: [...new Set([...prev.boxed, text])] }));
        } else if (line.startsWith('BUG:UNDERLINE:')) {
            const text = line.substring(14).trim();
            if(text) setBugAnnotations(prev => ({ ...prev, underlined: [...new Set([...prev.underlined, text])] }));
        } else if (line.startsWith('ANSWER:')) {
            const text = line.substring(7);
            setLiveAnswer(prev => prev + text);
        } else {
            let chatText = (line.startsWith('CHAT:') ? line.substring(5) : line).trim();
            if (chatText) {
                setTutorMessages((prev: ChatMessage[]) => prev.map(msg => 
                    msg.id === modelMessageId ? { ...msg, text: msg.text + chatText + '\n' } : msg
                ));
            }
        }
    };

    const handleStream = async (history: ChatMessage[], message: string) => {
        if (!currentQuestion) return;

        const modelMessageId = (Date.now() + 1).toString();
        setTutorMessages(prev => [...prev, { id: modelMessageId, role: 'model', text: '' }]);
        setIsTutorLoading(true);

        let unprocessedText = '';
        await streamTutorResponse(currentQuestion, history, message, (chunk) => {
            unprocessedText += chunk;
            let newlineIndex;
            while ((newlineIndex = unprocessedText.indexOf('\n')) !== -1) {
                const line = unprocessedText.substring(0, newlineIndex);
                unprocessedText = unprocessedText.substring(newlineIndex + 1);
                if (line.trim()) {
                    processStreamedLine(line, modelMessageId);
                }
            }
        });

        if (unprocessedText.trim()) {
            processStreamedLine(unprocessedText, modelMessageId);
        }

        setTutorMessages((prev: ChatMessage[]) => prev.map(msg => ({...msg, text: msg.text.trim()})))
        setIsTutorLoading(false);
    };

    const startTutorSession = async () => {
        setTutorMessages([]);
        setBugAnnotations({ boxed: [], underlined: [] });
        setLiveAnswer('');
        setTutorSessionId(Date.now().toString());
        await handleStream([], "Let's begin.");
    };

    const handleSendTutorMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tutorInput.trim() || isTutorLoading) return;

        const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: tutorInput };
        const newHistory = [...tutorMessages, userMessage];
        setTutorMessages(newHistory);
        const messageToSend = tutorInput;
        setTutorInput('');
        await handleStream(newHistory, messageToSend);
    };
    
    const fetchHint = async () => {
        if (!currentQuestion) return;
        setIsHintLoading(true);
        const fetchedHint = await getHint(currentQuestion);
        setHint(fetchedHint);
        setIsHintLoading(false);
    };

    const parsedMarkScheme = useMemo(() => {
        if (!currentQuestion?.markScheme?.content) return { guidance: '', content: '' };
        
        // Look for "Indicative Content:" or similar delimiters
        const splitRegex = /(?:Indicative Content|Notes for answers|Content|Indicative content|INDICATIVE CONTENT|Possible content):/i;
        const parts = currentQuestion.markScheme.content.split(splitRegex);
        
        if (parts.length > 1) {
            // parts[0] is guidance, parts[1] onwards is content
            return {
                guidance: parts[0].trim(),
                content: parts.slice(1).join('\n').trim()
            };
        }
        
        return {
            guidance: currentQuestion.markScheme.content,
            content: '' 
        };
    }, [currentQuestion]);

    const handleGenerateModelAnswerForSupport = async () => {
        if (!currentQuestion) return;
        setIsModelAnswerLoading(true);
        try {
            const answer = await generateModelAnswer(currentQuestion);
            setModelAnswer(answer);
        } catch (error) {
            console.error("Failed to generate support model answer", error);
        } finally {
            setIsModelAnswerLoading(false);
        }
    };

    const handleRevealSolution = async () => {
        if (!currentQuestion) return;
        setStage(4);
        setIsTimerRunning(false);
        setIsModelAnswerLoading(true); // Ensure loading state is true at start
        
        const motivationPromise = getMotivationalMessage();
        const modelAnswerPromise = generateModelAnswer(currentQuestion);

        try {
            const msg = await motivationPromise;
            setMotivation(msg);
            const answer = await modelAnswerPromise;
            setModelAnswer(answer);
        } catch (error) {
            console.error("Failed to generate model answer:", error);
            setModelAnswer({ title: "Error Generating Answer", segments: [{ text: "An error occurred while generating the model answer. Please try generating a new question.", ao: 'Generic', feedback: '' }] });
        } finally {
            setIsModelAnswerLoading(false);
        }
    };

    const handleGenerateQuestion = async () => {
        setIsGenerating(true);
        setCurrentQuestion(null);
        setHasFigureError(false);
        setGenerationStatus('');
        setCurrentDraftId(null);

        try {
            setGenerationStatus('1/2: Crafting your question...');
            // Pass user level to generation service
            const questionData = await generateQuestion({ unit: unitFilter, marks: marksFilter, level: user.level || 'A-Level' });
            
            let figures: Question['figures'] = [];
            if (questionData.figureDescription) {
                setGenerationStatus('2/2: Generating stimulus figure...');
                const imageUrl = await generateFigure(questionData.figureDescription);
                figures.push({ name: questionData.figureDescription, url: imageUrl });
            }

            const newQuestion: Question = {
                id: `gen-${Date.now()}`,
                examYear: questionData.examYear,
                questionNumber: questionData.questionNumber,
                unit: questionData.unit,
                title: questionData.title,
                prompt: questionData.prompt,
                marks: questionData.marks,
                ao: questionData.ao,
                caseStudy: questionData.caseStudy,
                markScheme: questionData.markScheme,
                figures: figures,
                level: user.level || 'A-Level'
            };
            
            setCurrentQuestion(newQuestion);

        } catch (error) {
            console.error("Failed to generate question:", error);
            setGenerationStatus('An error occurred. Please try again.');
        } finally {
            setIsGenerating(false);
            if (!generationStatus.includes('error')) {
                setGenerationStatus('');
            }
        }
    };
    
    const handleCaseStudyClick = async (e: React.MouseEvent<HTMLElement>, csName: string) => {
        const detailsElement = e.currentTarget.closest('details');
        if (!detailsElement) return;
        const isClosed = !detailsElement.open; 
        
        if (isClosed && !caseStudyDetails[csName] && currentQuestion) {
            setLoadingCaseStudy(csName);
            try {
                const details = await generateCaseStudyApplication(currentQuestion, csName);
                setCaseStudyDetails(prev => ({ ...prev, [csName]: details }));
            } catch (error) {
                 console.error("Failed to fetch case study details", error);
            } finally {
                setLoadingCaseStudy(null);
            }
        }
    };

    const handleExportPDF = async () => {
        if (!sessionReportRef.current || isExporting) return;
        setIsExporting(true);
        const { jsPDF } = (window as any).jspdf;
        const element = sessionReportRef.current;
        
        element.classList.add('exporting-pdf');

        try {
            const canvas = await (window as any).html2canvas(element, { scale: 2, useCORS: true, logging: false });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = imgWidth / imgHeight;
            const imgHeightInPdf = pdfWidth / ratio;
            let heightLeft = imgHeightInPdf;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeightInPdf;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
                heightLeft -= pdfHeight;
            }
            pdf.save(`Geo-Pro-Session-${currentQuestion?.id}.pdf`);
        } catch (error) {
            console.error("Error exporting to PDF:", error);
            alert("Sorry, an error occurred while exporting to PDF.");
        } finally {
            element.classList.remove('exporting-pdf');
            setIsExporting(false);
        }
    };

    const handleTextSelection = (e: React.MouseEvent) => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setSelectionPopover({
                x: rect.left + window.scrollX,
                y: rect.top + window.scrollY - 10,
                text: selection.toString().trim(),
            });
        } else {
            setSelectionPopover(null);
        }
    };
    
    const handleAddAnnotation = (type: 'box' | 'underline') => {
        if (selectionPopover) {
            const text = selectionPopover.text;
            if (type === 'box') {
                setBugAnnotations(prev => ({ ...prev, underlined: prev.underlined.filter(u => u !== text), boxed: [...new Set([...prev.boxed, text])] }));
            } else {
                setBugAnnotations(prev => ({ ...prev, boxed: prev.boxed.filter(b => b !== text), underlined: [...new Set([...prev.underlined, text])] }));
            }
        }
        setSelectionPopover(null);
    };

    const handleMarkAnswer = async (answerToMark: string) => {
        if (!currentQuestion || (!answerToMark.trim() && !attachment) || !user) return;
        setIsMarking(true);
        setAiFeedback(null);
        setStudentAnswer(answerToMark); 
        
        try {
            const feedback = await markStudentAnswer(currentQuestion, answerToMark, attachment || undefined);
            setAiFeedback(feedback);

            const summary = await generateSessionSummary(currentQuestion, feedback);
            
            const newSession: CompletedSession = {
                id: `session-${Date.now()}`,
                question: currentQuestion,
                studentAnswer: answerToMark,
                aiFeedback: feedback,
                completedAt: new Date().toISOString(),
                aiSummary: summary,
                level: user.level || 'A-Level'
            };

            const sessionsRef = collection(db, 'users', user.uid, 'sessions');
            await addDoc(sessionsRef, sanitizeFirestoreData(newSession));
            
            // Remove draft if it exists as we completed it
            if (currentDraftId) {
                await deleteDoc(doc(db, 'users', user.uid, 'drafts', currentDraftId));
                setCurrentDraftId(null);
            }

        } catch (error) {
            console.error("Error marking answer:", error);
        } finally {
            setIsMarking(false);
        }
    };

    const saveDraft = useCallback(async (silent: boolean = false) => {
        if (!currentQuestion || !user) return;
        if (!silent) setIsSaving(true);
        else setAutoSaveStatus('saving');

        const draftId = currentDraftId || `draft-${Date.now()}`;
        const currentState = stateRef.current;

        const draftData: DraftSession = {
            id: draftId,
            question: currentQuestion,
            studentAnswer: currentState.practiceMode === 'tutor' ? currentState.liveAnswer : currentState.studentAnswer,
            structuredPlan: currentState.structuredPlan,
            figureNotes: currentState.figureNotes,
            lastUpdated: new Date().toISOString(),
            practiceMode: currentState.practiceMode,
            timerState: currentState.time,
            startTime: currentState.startTime,
            level: user.level || 'A-Level'
        };

        try {
            await setDoc(doc(db, 'users', user.uid, 'drafts', draftId), sanitizeFirestoreData(draftData));
            if (!currentDraftId) setCurrentDraftId(draftId);
            setLastSavedTime(new Date());
            if (!silent) alert("Progress saved successfully!");
            else setAutoSaveStatus('saved');
        } catch (error) {
            console.error("Error saving draft:", error);
            if (!silent) alert("Failed to save progress.");
            else setAutoSaveStatus('error');
        } finally {
            if (!silent) setIsSaving(false);
        }
    }, [currentQuestion, user, currentDraftId]);

    // Auto-save trigger for content (Debounced)
    useEffect(() => {
        if (!currentQuestion) return;
        
        const handler = setTimeout(() => {
            saveDraft(true);
        }, 2000);

        return () => clearTimeout(handler);
    }, [studentAnswer, structuredPlan, figureNotes, liveAnswer, saveDraft]); 

    // Auto-save trigger for time (Interval)
    useEffect(() => {
        if (!currentQuestion || !isTimerRunning) return;
        const interval = setInterval(() => {
            saveDraft(true);
        }, 30000); // Save every 30s to capture timer progress
        return () => clearInterval(interval);
    }, [currentQuestion, isTimerRunning, saveDraft]);


    const renderAoBreakdown = (ao: Question['ao']) => {
        const parts = [];
        if (ao.ao1 > 0) parts.push(`AO1: ${ao.ao1}`);
        if (ao.ao2 > 0) parts.push(`AO2: ${ao.ao2}`);
        if (ao.ao3 > 0) parts.push(`AO3: ${ao.ao3}`);
        if (ao.ao4 && ao.ao4 > 0) parts.push(`AO4: ${ao.ao4}`);
        return `(${parts.join(', ')} marks)`;
    };
    
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const ModeButton: React.FC<{ mode: PracticeMode, icon: React.ReactNode, text: string }> = ({ mode, icon, text }) => (
        <button
            onClick={() => setPracticeMode(mode)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${practiceMode === mode ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20' : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100/50 dark:hover:bg-stone-800/50'}`}
        >
            {icon}
            {text}
        </button>
    );
    
    // ... (helper components like TimerWidget, StartTimeInput, FileUploadWidget remain unchanged)
    const TimerWidget = () => (
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 p-4 bg-stone-50/50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700">
            <div>
                <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">Timed Session</h2>
                <p className="text-stone-500 dark:text-stone-400 mt-1">Recommended time: {currentQuestion?.marks} minutes.</p>
                 <div className="mt-3 bg-stone-200 dark:bg-stone-700 p-1 rounded-full flex text-sm w-fit">
                    <button 
                        onClick={() => handleTimerModeChange('stopwatch')}
                        className={`px-3 py-1 rounded-full transition-colors ${timerMode === 'stopwatch' ? 'bg-white dark:bg-stone-600 text-blue-600 dark:text-blue-300 shadow' : 'text-stone-600 dark:text-stone-400'}`}>
                        Stopwatch
                    </button>
                    <button 
                        onClick={() => handleTimerModeChange('timer')}
                        className={`px-3 py-1 rounded-full transition-colors ${timerMode === 'timer' ? 'bg-white dark:bg-stone-600 text-blue-600 dark:text-blue-300 shadow' : 'text-stone-600 dark:text-stone-400'}`}>
                        Timer
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-3 bg-white dark:bg-stone-900 p-3 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700">
                <div className={`text-3xl font-bold font-mono ${timerMode === 'stopwatch' && currentQuestion && time > currentQuestion.marks * 60 ? 'text-red-500' : 'text-stone-800 dark:text-stone-100'}`}>
                    {formatTime(time)}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="px-3 py-1 text-sm font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors">{isTimerRunning ? 'Pause' : 'Start'}</button>
                    <button onClick={handleReset} className="px-3 py-1 text-sm font-semibold bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-md hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors">Reset</button>
                </div>
            </div>
        </div>
    );

    const StartTimeInput = () => (
        <div className="flex items-center gap-3 mb-4 bg-white/50 dark:bg-stone-800/50 p-2 rounded-lg border border-stone-200 dark:border-stone-700 w-fit">
            <span className="text-xl">🕒</span>
            <div className="flex flex-col">
                <label className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Start Time</label>
                <input 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-transparent border-none p-0 text-sm font-semibold text-stone-800 dark:text-stone-200 focus:ring-0 cursor-pointer"
                />
            </div>
        </div>
    );

    const FileUploadWidget = () => (
        <div className="mt-4 p-4 border border-dashed border-stone-300 dark:border-stone-600 rounded-lg bg-stone-50 dark:bg-stone-800/50">
            <p className="font-bold text-stone-700 dark:text-stone-200 mb-2">Upload Handwritten Answer</p>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">Upload a photo or PDF of your written work instead of typing.</p>
            
            {!attachment ? (
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-stone-300 dark:border-stone-600 border-dashed rounded-lg cursor-pointer bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <span className="text-2xl text-stone-400 mb-2">📷</span>
                            <p className="mb-2 text-sm text-stone-500 dark:text-stone-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-stone-500 dark:text-stone-400">PNG, JPG or PDF</p>
                        </div>
                        <input id="dropzone-file" type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileSelect} ref={fileInputRef} />
                    </label>
                </div>
            ) : (
                <div className="flex items-center justify-between bg-white dark:bg-stone-800 p-3 rounded-lg border border-stone-200 dark:border-stone-700 shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <span className="text-2xl">{attachment.mimeType.includes('image') ? '🖼️' : '📄'}</span>
                        <div className="truncate">
                            <p className="font-semibold text-stone-800 dark:text-stone-200 text-sm">File Uploaded</p>
                            <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{attachment.mimeType}</p>
                        </div>
                    </div>
                    <button onClick={removeAttachment} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                        Remove
                    </button>
                </div>
            )}
        </div>
    );

    // New Support Materials Component
    const SupportMaterialsPanel = () => (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 h-full flex flex-col overflow-hidden">
            <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-300 mb-3 flex items-center gap-2">
                <span>📚</span> Support Materials
            </h3>
            <div className="flex-grow overflow-y-auto custom-scrollbar space-y-4 pr-2">
                <div className="bg-white dark:bg-stone-900 p-3 rounded-md border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                    <h4 className="font-semibold text-indigo-700 dark:text-indigo-400 text-sm mb-1">Indicative Content (Expected Points)</h4>
                    <div className="text-sm text-stone-600 dark:text-stone-300 whitespace-pre-wrap leading-relaxed">
                        {parsedMarkScheme.content || "No specific indicative content available."}
                    </div>
                </div>
                
                <div className="bg-white dark:bg-stone-900 p-3 rounded-md border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                    <h4 className="font-semibold text-indigo-700 dark:text-indigo-400 text-sm mb-1">Mark Scheme Guidance</h4>
                    <div className="text-sm text-stone-600 dark:text-stone-300 whitespace-pre-wrap leading-relaxed">
                        {parsedMarkScheme.guidance}
                    </div>
                </div>

                <div className="bg-white dark:bg-stone-900 p-3 rounded-md border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                    <h4 className="font-semibold text-indigo-700 dark:text-indigo-400 text-sm mb-2">Model Answer</h4>
                    {modelAnswer ? (
                        <AnnotatedAnswerDisplay title="Exemplar" segments={modelAnswer.segments} />
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">Need more help? Generate a full model answer to use as a scaffold.</p>
                            <button 
                                onClick={handleGenerateModelAnswerForSupport} 
                                disabled={isModelAnswerLoading}
                                className="px-4 py-2 bg-indigo-500 text-white text-sm font-bold rounded-full hover:bg-indigo-600 transition disabled:bg-stone-300 disabled:cursor-wait"
                            >
                                {isModelAnswerLoading ? 'Generating...' : 'Generate Model Answer'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (isReviewMode && sessionToView) {
        return <SessionDetailView session={sessionToView} onBack={onBack} />;
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-transparent">
            <button 
                onClick={onBack}
                className="fixed top-24 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-stone-800/80 backdrop-blur-md border border-stone-200 dark:border-stone-700 rounded-full shadow-sm hover:bg-white dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 font-bold transition-all"
            >
                <span>&larr;</span> Back
            </button>

            {selectionPopover && (
                <div className="fixed bg-stone-800 dark:bg-stone-700 text-white rounded-lg shadow-xl p-1 flex gap-1 z-50 animate-fade-in border border-stone-600" style={{ left: selectionPopover.x, top: selectionPopover.y, transform: 'translateY(-100%)' }}>
                    <button onClick={() => handleAddAnnotation('box')} className="px-2 py-1 hover:bg-stone-700 dark:hover:bg-stone-600 rounded text-sm">Box</button>
                    <button onClick={() => handleAddAnnotation('underline')} className="px-2 py-1 hover:bg-stone-700 dark:hover:bg-stone-600 rounded text-sm">Underline</button>
                    <button onClick={() => setSelectionPopover(null)} className="px-2 py-1 hover:bg-stone-700 dark:hover:bg-stone-600 rounded"><span>❌</span></button>
                </div>
            )}
            <div className="max-w-7xl mx-auto mt-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <select value={unitFilter} onChange={e => setUnitFilter(e.target.value)} className="w-full p-3 border border-stone-300 dark:border-stone-700 rounded-lg md:col-span-1 bg-white/80 dark:bg-stone-800/80 dark:text-stone-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        {availableUnits.filter(u => u !== 'All Units').map(unit => <option key={unit} value={unit}>{unit}</option>)}
                    </select>
                    <select value={marksFilter} onChange={e => setMarksFilter(parseInt(e.target.value, 10))} className="w-full p-3 border border-stone-300 dark:border-stone-700 rounded-lg bg-white/80 dark:bg-stone-800/80 dark:text-stone-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="4">4 Marks</option>
                        <option value="6">6 Marks (AO3/Data)</option>
                        <option value="9">9 Marks</option>
                        {user.level === 'A-Level' && <option value="20">20 Marks (Essay)</option>}
                    </select>
                    <button onClick={handleGenerateQuestion} disabled={isGenerating} className="w-full md:col-span-1 p-3 bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-transform transform hover:scale-105 flex items-center justify-center gap-2 disabled:bg-stone-400 disabled:cursor-wait disabled:transform-none disabled:shadow-none">
                        <span className="text-xl">🌍</span>
                        {isGenerating ? 'Generating...' : 'Generate Question'}
                    </button>
                </div>
                
                {!currentQuestion && !isGenerating && (
                    <div className="text-center py-20 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl">
                        <span className="text-6xl mx-auto text-blue-400 animate-pulse">🌍</span>
                        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mt-4">Question Generator ({user.level})</h2>
                        <p className="text-stone-500 dark:text-stone-400 mt-2">Select a unit and mark tariff to generate a unique, exam-style question.</p>
                    </div>
                )}
                
                {isGenerating && (
                    <div className="text-center py-20 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl">
                        <div className="flex items-center justify-center space-x-2">
                           <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                           <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                           <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-stone-600 dark:text-stone-400 font-semibold mt-4">{generationStatus || 'Initializing...'}</p>
                    </div>
                )}
                
                {currentQuestion && !isGenerating && (
                <div className="space-y-8">
                    <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl p-6 sm:p-8">
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 px-3 py-1 rounded-full">{currentQuestion.unit}</span>
                             <span className="text-sm font-semibold text-stone-700 dark:text-stone-300 bg-stone-200 dark:bg-stone-800 px-3 py-1 rounded-full">{`${currentQuestion.examYear} - Q ${currentQuestion.questionNumber}`}</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 dark:text-stone-100 mt-4">{currentQuestion.title}</h1>
                        
                        {/* If NOT in Feedback mode AND NOT already revealed (stage < 4), show question text */}
                        {!aiFeedback && stage < 4 && practiceMode !== 'tutor' && practiceMode !== 'teacher_led' && (
                            <>
                                <div className="text-stone-600 dark:text-stone-300 mt-2 text-lg whitespace-pre-wrap">
                                    {currentQuestion.prompt}
                                </div>
                                <FigureDisplay figures={currentQuestion.figures} onImageError={() => setHasFigureError(true)} />
                            </>
                        )}

                        <div className="flex justify-between items-center mt-4">
                            <div>
                                <span className="font-bold text-lg text-sky-600 dark:text-sky-400">{currentQuestion.marks} Marks</span>
                                <span className="text-sm text-stone-500 dark:text-stone-400 ml-2">{renderAoBreakdown(currentQuestion.ao)}</span>
                            </div>
                            <div className="relative flex items-center gap-4">
                               {!aiFeedback && (
                                <div className="flex flex-col items-end">
                                    <button 
                                        onClick={() => saveDraft(false)} 
                                        disabled={isSaving || autoSaveStatus === 'saving'}
                                        className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition disabled:opacity-50"
                                    >
                                        <span className="text-lg">{isSaving || autoSaveStatus === 'saving' ? '⏳' : '💾'}</span>
                                        {isSaving ? 'Saving...' : 'Save Progress'}
                                    </button>
                                    {lastSavedTime && (
                                        <span className="text-xs text-stone-400 mt-1">
                                            {autoSaveStatus === 'saving' ? 'Saving...' : `Saved ${lastSavedTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                                        </span>
                                    )}
                                </div>
                               )}
                               
                               <div className="relative">
                                <button onClick={fetchHint} disabled={isHintLoading} className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-800 dark:hover:text-blue-300 transition">
                                    <span className="text-lg">💡</span>
                                    {isHintLoading ? 'Getting Hint...' : 'Need a hint?'}
                                </button>
                                {hint && (
                                    <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-100 text-xs rounded-lg shadow-lg z-10">
                                        {hint}
                                    </div>
                                )}
                               </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl p-6 sm:p-8">
                        {(!aiFeedback && stage < 4) ? (
                            <>
                                <div className="flex justify-between items-center border-b border-stone-200 dark:border-stone-700 pb-2 mb-4">
                                    <div className="flex gap-1">
                                        <ModeButton mode="standard" icon={<span>📖</span>} text="Standard" />
                                        <ModeButton mode="teacher_led" icon={<span>📊</span>} text="Teacher-Led" />
                                        <ModeButton mode="tutor" icon={<span>👥</span>} text="Tutor" />
                                        <ModeButton mode="timed" icon={<span>⏰</span>} text="Timed" />
                                    </div>
                                    
                                    {/* Open/Closed Book Toggle */}
                                    {(practiceMode === 'standard' || practiceMode === 'timed') && (
                                        <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-full border border-stone-200 dark:border-stone-700">
                                            <button 
                                                onClick={() => setSupportMode('closed')}
                                                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${supportMode === 'closed' ? 'bg-white dark:bg-stone-600 shadow text-stone-800 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`}
                                            >
                                                Closed Book
                                            </button>
                                            <button 
                                                onClick={() => setSupportMode('open')}
                                                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${supportMode === 'open' ? 'bg-white dark:bg-stone-600 shadow text-indigo-600 dark:text-indigo-400' : 'text-stone-500 dark:text-stone-400'}`}
                                            >
                                                Open Book
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 transition-all duration-500">
                                   {practiceMode === 'standard' && (
                                        <div className={supportMode === 'open' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}>
                                            <div className="flex flex-col h-full">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">Your Answer</h2>
                                                    <StartTimeInput />
                                                </div>
                                                <p className="text-stone-500 dark:text-stone-400 mt-1 mb-4">Plan and write your full answer below.</p>
                                                <textarea value={studentAnswer} onChange={(e) => setStudentAnswer(e.target.value)} placeholder="Start writing..." className="w-full flex-grow min-h-[300px] p-4 appearance-none border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow custom-scrollbar bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500"/>
                                                
                                                <FileUploadWidget />

                                                <button onClick={() => handleMarkAnswer(studentAnswer)} disabled={isMarking || (!studentAnswer.trim() && !attachment)} className="w-full mt-4 py-3 bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-transform transform hover:scale-105 disabled:bg-stone-400 disabled:cursor-wait">
                                                    {isMarking ? 'Marking...' : 'Mark My Answer'}
                                                </button>
                                                <button onClick={handleRevealSolution} className="mt-4 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-sm font-semibold underline w-full text-center">
                                                    Skip Marking & Reveal Solution
                                                </button>
                                            </div>
                                            {supportMode === 'open' && <SupportMaterialsPanel />}
                                        </div>
                                    )}

                                    {practiceMode === 'timed' && (
                                        <div className={supportMode === 'open' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}>
                                            <div className="flex flex-col h-full">
                                                <div className="flex flex-col md:flex-row gap-4 mb-4">
                                                    <div className="flex-grow"><TimerWidget /></div>
                                                    <div className="flex items-start justify-end">
                                                        <StartTimeInput />
                                                    </div>
                                                </div>
                                                <textarea value={studentAnswer} onChange={(e) => setStudentAnswer(e.target.value)} placeholder="Begin your answer when you start the timer..." className="w-full flex-grow min-h-[300px] p-4 appearance-none border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow custom-scrollbar bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500"/>
                                                
                                                <FileUploadWidget />

                                                 <button onClick={() => handleMarkAnswer(studentAnswer)} disabled={isMarking || (!studentAnswer.trim() && !attachment)} className="w-full mt-4 py-3 bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-transform transform hover:scale-105 disabled:bg-stone-400 disabled:cursor-wait">
                                                    {isMarking ? 'Marking...' : 'Mark My Answer'}
                                                </button>
                                                <button onClick={handleRevealSolution} className="mt-4 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-sm font-semibold underline w-full text-center">
                                                    Skip Marking & Reveal Solution
                                                </button>
                                            </div>
                                            {supportMode === 'open' && <SupportMaterialsPanel />}
                                        </div>
                                    )}
                                    
                                    {practiceMode === 'tutor' && (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div className="bg-stone-50/50 dark:bg-stone-800/50 p-4 rounded-lg border border-stone-200 dark:border-stone-700 flex flex-col h-[700px] max-h-[70vh] overflow-hidden">
                                                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                                                    <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">Your Workspace</h3>
                                                    <StartTimeInput />
                                                </div>
                                                
                                                <div className="flex-shrink-0 border-b border-stone-200 dark:border-stone-700 pb-4 mb-4 max-h-[45%] overflow-y-auto custom-scrollbar pr-2">
                                                    <h4 className="font-semibold text-stone-700 dark:text-stone-300">Question</h4>
                                                    <div className="text-stone-800 dark:text-stone-200 mt-2 text-base whitespace-pre-wrap">
                                                        <BuggedQuestion prompt={currentQuestion.prompt} annotations={bugAnnotations} />
                                                    </div>
                                                    <div className="mt-4">
                                                        <FigureDisplay figures={currentQuestion.figures} onImageError={() => setHasFigureError(true)} />
                                                    </div>
                                                </div>

                                                <div className="flex-grow flex flex-col min-h-0">
                                                    <h4 className="font-semibold text-stone-700 dark:text-stone-300 mb-2 flex-shrink-0">Your Answer</h4>
                                                    <div className="flex-grow whitespace-pre-wrap text-sm text-stone-800 dark:text-stone-200 p-4 overflow-y-auto custom-scrollbar border border-stone-200 dark:border-stone-700 rounded-md bg-white dark:bg-stone-900">
                                                        {liveAnswer || <p className="text-stone-400 dark:text-stone-500 italic">Your answer will be built here as you chat with your tutor...</p>}
                                                    </div>
                                                    <button onClick={() => handleMarkAnswer(liveAnswer)} disabled={isMarking || !liveAnswer.trim()} className="w-full mt-4 py-2 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 disabled:bg-stone-400">
                                                        {isMarking ? 'Marking...' : 'Mark Final Answer'}
                                                    </button>
                                                    <button onClick={handleRevealSolution} className="mt-2 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-sm font-semibold underline w-full text-center">
                                                        Skip & Reveal Solution
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="h-[700px] max-h-[70vh] flex flex-col bg-stone-50/50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700">
                                                <div className="p-3 border-b border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 rounded-t-lg flex-shrink-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl">🌍</span>
                                                        <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">Geo Pro Tutor</h3>
                                                    </div>
                                                </div>
                                                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                                                    {tutorMessages.map((msg) => ( msg.role === 'user' ? (
                                                        <div key={msg.id} className="flex justify-end mb-4"><div className="max-w-[85%] p-3 rounded-2xl shadow-sm bg-blue-500 text-white rounded-br-none"><p className="text-sm whitespace-pre-wrap">{msg.text}</p></div></div>
                                                    ) : (
                                                        <div key={msg.id} className="flex justify-start items-end gap-2 mb-4"><div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center flex-shrink-0"><span className="text-lg">🌍</span></div><div className="max-w-[85%] p-3 rounded-2xl shadow-sm bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-bl-none"><p className="text-sm whitespace-pre-wrap">{msg.text}</p></div></div>
                                                    )))}
                                                    {isTutorLoading && tutorMessages.length > 0 && tutorMessages[tutorMessages.length-1].role === 'model' && (
                                                        <div className="flex justify-start items-end gap-2 mb-4"><div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center flex-shrink-0"><span className="text-lg">🌍</span></div><div className="p-3 rounded-2xl bg-white dark:bg-stone-700 shadow-sm"><div className="flex items-center justify-center space-x-1"><span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span><span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span><span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span></div></div></div>
                                                    )}
                                                    <div ref={tutorMessagesEndRef} />
                                                </div>
                                                <div className="p-4 border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 rounded-b-lg flex-shrink-0">
                                                    <form onSubmit={handleSendTutorMessage} className="flex items-center gap-2">
                                                        <input type="text" value={tutorInput} onChange={(e) => setTutorInput(e.target.value)} placeholder="Respond to your tutor..." className="flex-1 w-full px-4 py-2 text-sm bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500" disabled={isTutorLoading} />
                                                        <button type="submit" disabled={isTutorLoading || !tutorInput.trim()} className="p-2 bg-blue-500 text-white rounded-full disabled:bg-stone-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"><span className="text-lg">⬆️</span></button>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {practiceMode === 'teacher_led' && (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div className="space-y-6">
                                                <div className="bg-stone-50/50 dark:bg-stone-800/50 p-4 rounded-lg border border-stone-200 dark:border-stone-700">
                                                    <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">1. Deconstruct the Question</h3>
                                                    <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">Select text to BUG the question (Box command words, Underline key terms).</p>
                                                    <div className="bg-white dark:bg-stone-900 p-3 rounded-md text-stone-800 dark:text-stone-200 mt-2 text-base whitespace-pre-wrap cursor-text select-text border border-stone-200 dark:border-stone-700" onMouseUp={handleTextSelection}>
                                                        <BuggedQuestion prompt={currentQuestion.prompt} annotations={bugAnnotations} onMouseUp={handleTextSelection} />
                                                    </div>
                                                    <FigureDisplay figures={currentQuestion.figures} onImageError={() => setHasFigureError(true)} />
                                                    <div className="mt-4">
                                                        <label className="font-semibold text-stone-700 dark:text-stone-300">Figure Annotation Notes</label>
                                                        <textarea value={figureNotes} onChange={(e) => setFigureNotes(e.target.value)} placeholder="Analyse the stimulus figures here..." className="w-full h-24 mt-2 p-2 appearance-none border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 custom-scrollbar bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500"/>
                                                    </div>
                                                </div>
                                                <div className="bg-stone-50/50 dark:bg-stone-800/50 p-4 rounded-lg border border-stone-200 dark:border-stone-700">
                                                    <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">2. Plan Your Answer</h3>
                                                    <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">Use this scaffold to structure your answer. Your plan is not marked, but it is key to success.</p>
                                                    <StructuredPlanView
                                                        marks={currentQuestion.marks}
                                                        planData={structuredPlan}
                                                        onPlanChange={(field, value) => setStructuredPlan(prev => ({ ...prev, [field]: value }))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="bg-stone-50/50 dark:bg-stone-800/50 p-4 rounded-lg border border-stone-200 dark:border-stone-700">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">3. Write Your Final Answer</h3>
                                                        <StartTimeInput />
                                                    </div>
                                                    
                                                    {/* Timer for Teacher Mode */}
                                                    <TimerWidget />

                                                    <textarea value={studentAnswer} onChange={(e) => setStudentAnswer(e.target.value)} placeholder="Write your full, exam-style answer here." className="w-full h-96 mt-2 p-2 appearance-none border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 custom-scrollbar bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500"/>
                                                    
                                                    <FileUploadWidget />

                                                    <button onClick={() => handleMarkAnswer(studentAnswer)} disabled={isMarking || (!studentAnswer.trim() && !attachment)} className="w-full mt-4 py-3 bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-transform transform hover:scale-105 disabled:bg-stone-400 disabled:cursor-wait">
                                                        {isMarking ? 'Marking...' : 'Mark My Answer'}
                                                    </button>
                                                    <button onClick={handleRevealSolution} className="mt-4 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-sm font-semibold underline w-full text-center">
                                                        Skip Marking & Reveal Solution
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                             <div ref={sessionReportRef} className="p-2 animate-fade-in">
                                <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-6">Session Report {aiFeedback ? '& Feedback' : ''}</h2>
                                 <div className="space-y-6">
                                     <div className="bg-stone-50/50 dark:bg-stone-800/50 p-4 rounded-lg border border-stone-200 dark:border-stone-700">
                                        <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">Your Answer</h3>
                                        <div className="mt-2 p-3 whitespace-pre-wrap text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-900 rounded-md border border-stone-200 dark:border-stone-700">{studentAnswer || "No answer provided."}</div>
                                    </div>
                                    
                                    {aiFeedback && (
                                        <div className="bg-stone-50/50 dark:bg-stone-800/50 p-4 rounded-lg border border-stone-200 dark:border-stone-700">
                                            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">Feedback</h3>
                                            <div className="animate-fade-in space-y-4">
                                                <div className="flex justify-between items-center bg-white dark:bg-stone-900 p-3 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700">
                                                    <p className="text-lg font-bold text-stone-900 dark:text-stone-100">Final Score:</p>
                                                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{aiFeedback.score} / {aiFeedback.totalMarks}</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-stone-900 dark:text-stone-100">Overall Comment:</h4>
                                                    <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">{aiFeedback.overallComment}</p>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                                        <h4 className="font-bold text-emerald-900 dark:text-emerald-300">Strengths</h4>
                                                        <ul className="list-disc list-inside text-sm text-emerald-700 dark:text-emerald-400 mt-1 space-y-1">
                                                            {(aiFeedback.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
                                                        </ul>
                                                    </div>
                                                     <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                                                        <h4 className="font-bold text-amber-900 dark:text-amber-300">Improvements</h4>
                                                        <ul className="list-disc list-inside text-sm text-amber-700 dark:text-amber-400 mt-1 space-y-1">
                                                            {(aiFeedback.improvements || []).map((s, i) => <li key={i}>{s}</li>)}
                                                        </ul>
                                                    </div>
                                                </div>
                                                <AnnotatedAnswerDisplay title="Annotated Answer" segments={aiFeedback.annotatedAnswer} />
                                                <button onClick={handleExportPDF} disabled={isExporting} className="w-full flex items-center justify-center gap-2 mt-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition disabled:bg-stone-400 hidden-for-export">
                                                    <span>📄</span>
                                                    {isExporting ? 'Exporting...' : 'Export Session to PDF'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    
                                     {stage < 4 ? (
                                        <button onClick={handleRevealSolution} className="w-full py-3 bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-transform transform hover:scale-105">
                                            Reveal Solution
                                        </button>
                                    ) : (
                                        <div className={`transition-opacity duration-700 ease-in-out ${stage === 4 ? 'opacity-100' : 'opacity-0 hidden-for-export'}`}>
                                            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4">Mark Scheme & Model Answer</h2>
                                            
                                            {motivation && (
                                                <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-lg flex items-center gap-3">
                                                    <span>✅</span>
                                                    <p><span className="font-semibold">Geo Pro says:</span> {motivation}</p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                                {/* Official Mark Scheme Guidance */}
                                                <div className="bg-stone-50/50 dark:bg-stone-800/50 p-4 rounded-lg border border-stone-200 dark:border-stone-700">
                                                    <h3 className="font-semibold text-lg text-blue-700 dark:text-blue-300 mb-2">Official Mark Scheme Guidance</h3>
                                                    <div className="prose prose-sm dark:prose-invert max-w-none text-stone-600 dark:text-stone-300 whitespace-pre-wrap">
                                                        {parsedMarkScheme.guidance}
                                                    </div>
                                                </div>

                                                {/* Suggested Indicative Content */}
                                                {parsedMarkScheme.content && (
                                                    <div className="bg-amber-50/50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800/50">
                                                        <h3 className="font-semibold text-lg text-amber-700 dark:text-amber-400 mb-2">Suggested Indicative Content</h3>
                                                        <div className="prose prose-sm dark:prose-invert max-w-none text-stone-600 dark:text-stone-300 whitespace-pre-wrap">
                                                            {parsedMarkScheme.content}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Model Answer */}
                                            {isModelAnswerLoading ? (
                                                <div className="text-center py-10 bg-stone-50/30 dark:bg-stone-800/30 rounded-lg border border-stone-200 dark:border-stone-700">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                                    </div>
                                                    <p className="text-stone-600 dark:text-stone-400 font-semibold mt-4">Generating expert model answer...</p>
                                                </div>
                                            ) : modelAnswer && (
                                                <AnnotatedAnswerDisplay title="Exemplar Model Answer" segments={modelAnswer.segments} />
                                            )}
                                        </div>
                                    )}
                                 </div>
                            </div>
                        )}

                        <details className="group border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden mt-8">
                            <summary className="p-4 bg-stone-50/50 dark:bg-stone-800/50 cursor-pointer font-bold text-stone-800 dark:text-stone-100 flex justify-between items-center group-hover:bg-stone-100/50 dark:group-hover:bg-stone-700/50 transition">
                                Stimulus / Data Hub
                                 <span className="transform transition-transform duration-300 group-open:rotate-180">&#9660;</span>
                            </summary>
                            <div className="p-4 border-t border-stone-200 dark:border-stone-700 divide-y divide-stone-200 dark:divide-stone-700">
                                <div className="pb-4">
                                    <h3 className="font-semibold text-lg text-blue-700 dark:text-blue-300">{currentQuestion.caseStudy.title}</h3>
                                    <p className="text-stone-600 dark:text-stone-300 whitespace-pre-wrap mt-2">{currentQuestion.caseStudy.content}</p>
                                    <FigureDisplay figures={currentQuestion.figures} onImageError={() => setHasFigureError(true)} />
                                </div>
                                {suggestedCaseStudies.length > 0 && (
                                    <div className="pt-4">
                                        <h3 className="font-semibold text-lg text-blue-700 dark:text-blue-300 mb-3">Suggested Case Studies</h3>
                                        <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">Consider drawing on these examples for AO1 knowledge marks. Click to see tailored details.</p>
                                        <div className="space-y-3">
                                            {suggestedCaseStudies.map(cs => (
                                                <details key={cs.name} className="group bg-white dark:bg-stone-900 border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden shadow-sm transition-all open:shadow-md open:border-blue-300 dark:open:border-blue-700">
                                                    <summary onClick={(e) => handleCaseStudyClick(e, cs.name)} className="p-4 cursor-pointer flex justify-between items-center bg-blue-50/50 dark:bg-blue-900/30 hover:bg-blue-100/50 dark:hover:bg-blue-900/50 transition-colors">
                                                        <div>
                                                            <p className="font-bold text-stone-800 dark:text-stone-200">{cs.name}</p>
                                                            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">{cs.criticalDetailExample}</p>
                                                        </div>
                                                        <span className="ml-4 flex-shrink-0 text-blue-500 dark:text-blue-400 transform transition-transform duration-300 group-open:rotate-180"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></span>
                                                    </summary>
                                                    <div className="p-4 border-t border-blue-200 dark:border-blue-800 bg-white dark:bg-stone-900 space-y-4 text-sm">
                                                        {loadingCaseStudy === cs.name ? (
                                                            <div className="flex items-center gap-3 text-stone-500 dark:text-stone-400 py-2"><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div><p>Loading tailored case study details...</p></div>
                                                        ) : caseStudyDetails[cs.name] ? (
                                                            <><div className="animate-fade-in"><h4 className="font-bold text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-2"><span>📖</span>Key Facts & Evidence</h4><p className="text-stone-700 dark:text-stone-300 whitespace-pre-wrap pl-6 border-l-2 border-blue-100 dark:border-blue-800">{caseStudyDetails[cs.name].summary}</p></div><div className="animate-fade-in"><h4 className="font-bold text-indigo-800 dark:text-indigo-300 mb-1 flex items-center gap-2"><span>💡</span>How to Apply to This Question</h4><p className="text-stone-700 dark:text-stone-300 whitespace-pre-wrap pl-6 border-l-2 border-indigo-100 dark:border-indigo-800">{caseStudyDetails[cs.name].application}</p></div></>
                                                        ) : null}
                                                    </div>
                                                </details>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </details>
                        
                    </div>
                </div>
                )}
            </div>
            <style>{`
                .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
                @keyframes fadeIn { 0% { opacity: 0; transform: translateY(5px); } 100% { opacity: 1; transform: translateY(0); } }
                
                /* Styles for PDF export */
                .exporting-pdf .group .feedback-tooltip {
                    opacity: 1 !important;
                    position: relative !important;
                    display: block !important;
                    transform: none !important;
                    width: auto !important;
                    margin-top: 4px !important;
                    margin-bottom: 8px !important;
                    pointer-events: auto !important;
                    z-index: auto !important;
                    left: auto !important;
                    bottom: auto !important;
                    background-color: #f5f5f4 !important; /* stone-100 */
                    color: #292524 !important; /* stone-800 */
                    border: 1px solid #e7e5e4 !important; /* stone-200 */
                    box-shadow: none !important;
                }
                .exporting-pdf .group .feedback-tooltip svg {
                    display: none !important;
                }
                .exporting-pdf .hidden-for-export {
                    display: none !important;
                }
            `}</style>
        </div>
    );
};

export default QuestionPracticeView;
