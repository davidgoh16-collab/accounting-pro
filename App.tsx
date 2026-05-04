import React, { useState, useEffect, useMemo } from 'react';
import { Page, CompletedSession, CaseStudyLocation, AuthUser, FlashcardItem, DraftSession, UserLevel, MockConfig, TeacherAssessment } from './types';
import { onAuthChange, signOutUser, db, logUserActivity, updateUserTourStatus } from './firebase';
import { User } from 'firebase/auth';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, setDoc, updateDoc, onSnapshot, where } from 'firebase/firestore';
import { getMocks } from './services/mockService';
import { GradeDashboard } from './components/GradeDashboard';

import LoginView from './components/LoginView';

// 2. Create the Feedback Component
const TeacherFeedbackSection: React.FC<{ userEmail: string | null }> = ({ userEmail }) => {
    const [feedbackRecords, setFeedbackRecords] = useState<TeacherAssessment[]>([]);

    useEffect(() => {
        if (!userEmail) return;

        const feedbackRef = collection(db, 'student_performance_records');

        // Query: Filter by email, sort by newest first
        const q = query(
            feedbackRef,
            where('studentEmail', '==', userEmail),
            orderBy('timestamp', 'desc'),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const records = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as TeacherAssessment[];

            // Filter out 'OVERALL_GRADES' documents
            const filteredRecords = records.filter(r => r.type !== 'OVERALL_GRADES');
            setFeedbackRecords(filteredRecords);
        });

        return () => unsubscribe();
    }, [userEmail]);

    if (feedbackRecords.length === 0) return null;

    const latest = feedbackRecords[0];

    return (
        <div className="w-full max-w-7xl mx-auto mb-8 animate-fade-in">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl shadow-xl p-1 p-0.5 overflow-hidden">
                <div className="bg-white dark:bg-stone-900/90 rounded-[22px] p-6 relative overflow-hidden">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-2xl">👨‍🏫</span>
                                <h2 className="text-lg font-bold text-violet-700 dark:text-violet-400">
                                    Teacher Feedback
                                </h2>
                                <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2 py-0.5 rounded-full uppercase">New</span>
                            </div>
                            <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">
                                {latest.assessmentTitle || latest.topic || "Recent Assessment"}
                            </h3>
                        </div>

                        {/* Score Badge */}
                        {latest.mark !== undefined && latest.maxMarks !== undefined && (
                            <div className="flex flex-col items-end">
                                <div className="text-3xl font-black text-stone-800 dark:text-stone-100">
                                    {latest.mark}<span className="text-lg text-stone-400 font-medium">/{latest.maxMarks}</span>
                                </div>
                                {latest.percentage !== undefined && (
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${latest.percentage >= 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {latest.percentage.toFixed(0)}%
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Feedback Body */}
                    <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4 mb-4 border-l-4 border-violet-500">
                        <p className="font-medium text-stone-700 dark:text-stone-300 leading-relaxed italic">
                            "{latest.feedback}"
                        </p>
                    </div>

                    {/* Improvement Areas (Tags) */}
                    {latest.improvementAreas && latest.improvementAreas.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Focus Areas</h4>
                            <div className="flex flex-wrap gap-2">
                                {latest.improvementAreas.map((area, idx) => (
                                    <span key={idx} className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/30 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                        <span>🎯</span> {area}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
import Header from './components/Header';
import QuestionPracticeView from './components/QuestionPracticeView';
import CommandWordToolkitView from './components/CommandWordToolkitView';
import SkillsPracticeView from './components/SkillsPracticeView';
import GameModeView from './components/GameModeView';
import BlockBlastView from './components/BlockBlastView';
import GamesHubView from './components/GamesHubView';
import GameAnalysisView from './components/GameAnalysisView';
import SessionAnalysisView from './components/SessionAnalysisView';
import QuestionPracticeHubView from './components/QuestionPracticeHubView';
import LessonPracticeView from './components/LessonPracticeView';
import Chatbot from './components/Chatbot';
import CaseStudyExplorerView from './components/CaseStudyExplorerView';
import FlashcardQuizHubView from './components/FlashcardQuizHubView';
import FlashcardView from './components/FlashcardView';
import QuizModeView from './components/QuizModeView';
import SwipeQuizView from './components/SwipeQuizView';
import CareersUniversityView from './components/CareersUniversityView';
import AdminView from './components/AdminView';
import RagAnalysisView from './components/RagAnalysisView';
import RevisionPlannerView from './components/RevisionPlannerView';
import PodcastView from './components/PodcastView';
import LearningHubView from './components/LearningHubView'; 
import VideoLearningView from './components/VideoLearningView';
import MocksHubView from './components/MocksHubView';
import FebMocksView from './components/FebMocksView';
import MockDetailView from './components/MockDetailView';
import HubLayout from './components/HubLayout';
import HubCard from './components/HubCard';
import LevelSelector from './components/LevelSelector';
import FullChatView from './components/FullChatView';
import { AssessmentHubView } from './components/AssessmentHubView';
import TourOverlay from './components/TourOverlay';
import WalkingTalkingMockView from './components/WalkingTalkingMockView';
import SimulationsHubView from './components/SimulationsHubView';
import SimulationView from './components/SimulationView';
import MemoryRecallHubView from './components/MemoryRecallHubView';
import MemoryRecallActiveView from './components/MemoryRecallActiveView';
import SongGeneratorView from './components/SongGeneratorView';

const CountdownWidget: React.FC<{ mocks: MockConfig[], userLevel?: UserLevel, userYearGroup?: string }> = ({ mocks, userLevel, userYearGroup }) => {
    const nextExam = useMemo(() => {
        const relevantMocks = mocks.filter(m => {
            const levelMatch = !userLevel || m.level === userLevel;
            const yearMatch = !m.yearGroups || m.yearGroups.length === 0 || (userYearGroup && m.yearGroups.includes(userYearGroup));
            return m.isActive && levelMatch && yearMatch;
        });

        const allExams = relevantMocks.flatMap(m => m.exams);
        const now = new Date();
        const futureExams = allExams.filter(e => {
            const dateTime = new Date(`${e.date}T${e.time || '09:00'}:00`);
            return dateTime > now;
        });
        futureExams.sort((a, b) => {
            const timeA = new Date(`${a.date}T${a.time || '09:00'}:00`).getTime();
            const timeB = new Date(`${b.date}T${b.time || '09:00'}:00`).getTime();
            return timeA - timeB;
        });
        return futureExams[0];
    }, [mocks, userLevel, userYearGroup]);

    const calculateTimeLeft = () => {
        if (!nextExam) return {};
        const targetDate = new Date(`${nextExam.date}T${nextExam.time || '09:00'}:00`);
        const difference = +targetDate - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                d: Math.floor(difference / (1000 * 60 * 60 * 24)),
                h: Math.floor((difference / (1000 * 60 * 60)) % 24),
                m: Math.floor((difference / 1000 / 60) % 60),
                s: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    if (!nextExam) return null;

    const t = timeLeft as any;

    return (
        <div className="w-full max-w-7xl mx-auto mb-8 animate-fade-in px-4 xl:px-0">
             <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-6 border border-white/10">
                <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Next Upcoming Exam</h2>
                    <p className="text-2xl lg:text-3xl font-bold">{nextExam.title}</p>
                    <div className="flex gap-4 mt-2 text-sm lg:text-base opacity-90 font-medium">
                        <span>🗓️ {new Date(nextExam.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long' })}</span>
                        <span>⏰ {nextExam.time}</span>
                        <span>⏳ {nextExam.duration}</span>
                    </div>
                </div>
                <div className="bg-white/20 p-4 rounded-xl backdrop-blur-md flex gap-4 text-center min-w-[280px] justify-center">
                    <div className="flex flex-col"><span className="text-3xl font-bold">{t.d || 0}</span><span className="text-xs uppercase opacity-80">Days</span></div>
                    <div className="flex flex-col"><span className="text-3xl font-bold">{t.h || 0}</span><span className="text-xs uppercase opacity-80">Hrs</span></div>
                    <div className="flex flex-col"><span className="text-3xl font-bold">{t.m || 0}</span><span className="text-xs uppercase opacity-80">Mins</span></div>
                    <div className="flex flex-col"><span className="text-3xl font-bold">{t.s || 0}</span><span className="text-xs uppercase opacity-80">Secs</span></div>
                </div>
             </div>
        </div>
    );
};

const RecentActivity: React.FC<{ onViewSession: (session: CompletedSession) => void, userId: string } > = ({ onViewSession, userId }) => {
    const [history, setHistory] = useState<CompletedSession[]>([]);

    useEffect(() => {
        if (!userId) return;

        const fetchHistory = async () => {
            try {
                const sessionsRef = collection(db, 'users', userId, 'sessions');
                const q = query(sessionsRef, orderBy('completedAt', 'desc'), limit(3));
                const querySnapshot = await getDocs(q);
                const recentItems = querySnapshot.docs.map(doc => doc.data() as CompletedSession);
                setHistory(recentItems);
            } catch (error) {
                console.error("Could not load session history from Firestore", error);
            }
        };

        fetchHistory();
    }, [userId]);

    if (history.length === 0) {
        return null;
    }

    return (
        <div className="w-full max-w-6xl mt-12">
            <h2 className="text-2xl font-bold text-stone-700 dark:text-stone-300 mb-6 text-center">Recent Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {history.map(session => (
                    <button key={session.id} onClick={() => onViewSession(session)} className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-800/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left w-full flex flex-col">
                        <p className="text-sm font-semibold text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full inline-block">{session.question.unit}</p>
                        <p className="font-semibold text-stone-700 dark:text-stone-200 mt-3 flex-grow min-h-[4.5rem] line-clamp-3">{session.aiSummary}</p>
                        <div className="mt-3 flex justify-between items-center text-sm pt-3 border-t border-stone-200 dark:border-stone-800">
                            <p className="text-stone-500 dark:text-stone-400">{new Date(session.completedAt).toLocaleDateString()}</p>
                            <p className="font-bold text-emerald-600 dark:text-emerald-400">{session.aiFeedback.score}/{session.aiFeedback.totalMarks}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [userYearGroup, setUserYearGroup] = useState<string | null>(null); // Start null to prevent leaking defaults
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState<Page>('dashboard');
    const [selectedGameTopic, setSelectedGameTopic] = useState<string>('All Topics');
    const [flashcardDeck, setFlashcardDeck] = useState<FlashcardItem[]>([]);
    const [sessionToView, setSessionToView] = useState<CompletedSession | null>(null);
    const [draftToResume, setDraftToResume] = useState<DraftSession | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showLevelSelector, setShowLevelSelector] = useState(false);
    const [showTour, setShowTour] = useState(false);

    // Lesson Mode State
    const [isLessonMode, setIsLessonMode] = useState(false);
    const [forceLessonMode, setForceLessonMode] = useState(false);

    // Mocks State
    const [activeMocks, setActiveMocks] = useState<MockConfig[]>([]);
    const [selectedMockId, setSelectedMockId] = useState<string | null>(null);
    const [selectedSimulationId, setSelectedSimulationId] = useState<string>('break_even_analysis');

    // Memory Recall State
    const [memoryRecallSessionParams, setMemoryRecallSessionParams] = useState<{sessionId: string, topicId: string, subTopicId: string, isResume: boolean} | null>(null);

    // Question Practice State
    const [questionPracticeParams, setQuestionPracticeParams] = useState<{initialTopic: string, initialSubTopic: string, autoGenerate: boolean} | null>(null);

    const [featureFlags, setFeatureFlags] = useState({
        birdGame: true,
        blockBlast: true,
        practiceQuizzes: true,
        swipeQuizzes: false,
        aiTutor: true,
        ragAssessment: true,
        songGenerator: true
    });

    const checkAdmin = (email: string | null, uid: string) => {
        const envUIDs = import.meta.env.VITE_ADMIN_USER_IDS
            ? import.meta.env.VITE_ADMIN_USER_IDS.split(',').map((id: string) => id.trim())
            : [];
        if (envUIDs.includes(uid)) return true;
        return email?.includes('admin') || false;
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [page]);

    // Fetch Mocks
    useEffect(() => {
        const fetchMocks = async () => {
            try {
                const mocks = await getMocks();
                setActiveMocks(mocks.filter(m => m.isActive));
            } catch (e) {
                console.error("Failed to fetch active mocks", e);
            }
        };
        fetchMocks();
    }, []);

    // Updated to use onSnapshot for real-time updates
    useEffect(() => {
        const docRef = doc(db, 'settings', 'global');
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.featureToggles) {
                    setFeatureFlags(prev => ({ ...prev, ...data.featureToggles }));
                }
            }
        }, (error) => {
            console.error("Failed to listen for settings:", error);
        });

        return () => unsubscribe();
    }, []);

    // Fetch Year Group and Lesson Mode Status whenever user changes (Login or Impersonation)
    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) {
                setUserYearGroup(null);
                setForceLessonMode(false);
                setIsLessonMode(false);
                return;
            }

            // 1. Check User Level Force
            if (user.forcedLessonMode) {
                setForceLessonMode(true);
                setIsLessonMode(true);
            }

            try {
                const classesCol = collection(db, 'classes');
                const q = query(classesCol, where('studentIds', 'array-contains', user.uid));
                const classSnaps = await getDocs(q);

                let foundYear = null;
                let classForced = false;

                if (!classSnaps.empty) {
                    for (const doc of classSnaps.docs) {
                        const data = doc.data();
                        if (data.yearGroup) foundYear = data.yearGroup;
                        if (data.isLessonMode) classForced = true;
                    }
                }

                setUserYearGroup(foundYear);

                if (classForced) {
                    setForceLessonMode(true);
                    setIsLessonMode(true);
                } else if (!user.forcedLessonMode) {
                    setForceLessonMode(false);
                    // Don't auto-disable lesson mode if user manually enabled it, unless we want to reset?
                    // Let's keep it persistent if user toggled it? No, requirements imply session based or toggle.
                    // If not forced, let it be.
                }

            } catch (e) {
                console.error("Failed to fetch user class data", e);
                setUserYearGroup(null);
            }
        };

        fetchUserData();
    }, [user?.uid, user?.forcedLessonMode]);

    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            if (firebaseUser) {
                const userRef = doc(db, 'users', firebaseUser.uid);
                const userSnap = await getDoc(userRef);
                
                let userLevel: UserLevel | undefined;
                let role = 'student';

                if (!userSnap.exists()) {
                    await setDoc(userRef, {
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        createdAt: new Date().toISOString(),
                        role: 'student' 
                    });
                    setShowLevelSelector(true);
                } else {
                    const data = userSnap.data();
                    role = data.role;
                    userLevel = data.level; 
                    if (!userLevel) setShowLevelSelector(true);
                }

                const authUser: AuthUser = {
                    uid: firebaseUser.uid,
                    displayName: firebaseUser.displayName,
                    email: firebaseUser.email,
                    photoURL: firebaseUser.photoURL,
                    level: userLevel,
                    hasSeenTour: userSnap.data()?.hasSeenTour
                };
                setUser(authUser);
                logUserActivity(authUser.uid, 'login', { timestamp: new Date().toISOString() });
                
                if (role === 'admin' || checkAdmin(firebaseUser.email, firebaseUser.uid)) setIsAdmin(true);

            } else {
                setUser(null);
                setIsAdmin(false);
                setShowLevelSelector(false);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Heartbeat logger (every 5 minutes)
    useEffect(() => {
        if (!user) return;
        const interval = setInterval(() => {
            logUserActivity(user.uid, 'heartbeat', { page });
        }, 5 * 60 * 1000); // 5 minutes
        return () => clearInterval(interval);
    }, [user, page]);

    const handleLevelSelect = async (level: UserLevel) => {
        if (user) {
            await updateDoc(doc(db, 'users', user.uid), { level });
            setUser({ ...user, level });
            setShowLevelSelector(false);
        }
    };

    useEffect(() => {
        if (user && user.level && !user.hasSeenTour && !showLevelSelector) {
            setShowTour(true);
        }
    }, [user, showLevelSelector]);

    const handleTourComplete = async () => {
        if (user) {
            await updateUserTourStatus(user.uid, true);
            setUser(prev => prev ? ({ ...prev, hasSeenTour: true }) : null);
            setShowTour(false);
        }
    };

    const handleReplayTour = () => {
        setShowTour(true);
    };

    const handleNavigate = (newPage: Page, param?: any) => {
        setPage(newPage);
        setSessionToView(null);
        setDraftToResume(null);

        if (newPage === 'mock_detail' && param) {
            setSelectedMockId(param);
        }

        if (newPage === 'simulation_view' && param) {
            setSelectedSimulationId(param);
        }

        if (newPage === 'memory_recall_active' && param) {
            setMemoryRecallSessionParams(param);
        }

        if (newPage === 'question_practice' && param) {
            setQuestionPracticeParams(param);
        } else if (newPage !== 'question_practice') {
            setQuestionPracticeParams(null); // Clear when navigating away
        }
    };

    const handleStartGame = (gamePage: Page, topic: string) => {
        setSelectedGameTopic(topic);
        setPage(gamePage);
    };

    const handleStartFlashcardQuiz = (deck: FlashcardItem[]) => {
        setFlashcardDeck(deck);
        setPage('quiz_mode');
    };

    const handleViewSession = (session: CompletedSession) => {
        setSessionToView(session);
        setDraftToResume(null);
        setPage('question_practice');
    };

    const handleResumeDraft = (draft: DraftSession) => {
        setDraftToResume(draft);
        setSessionToView(null);
        setPage('question_practice');
    };

    const handleImpersonate = (impersonatedUser: AuthUser) => {
        setUser(impersonatedUser);
        setPage('dashboard');
    };

    const theme = React.useMemo(() => {
        return {
            bgClass: "bg-blue-50 dark:bg-blue-950",
            bgPattern: "bg-[url('/grid.svg')]",
            hubGradient: "bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-400",
            subtitle: "Your A-Level Accounting Hub (AQA 7127)"
        };
    }, [user?.level]);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center bg-stone-100 dark:bg-stone-950"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    if (!user) {
        return <LoginView />;
    }

    return (
        <div className={`min-h-screen ${theme.bgPattern} bg-fixed ${theme.bgClass} transition-colors duration-300`}>
            {showTour && <TourOverlay onComplete={handleTourComplete} />}
            {showLevelSelector && <LevelSelector onSelect={handleLevelSelect} />}
            
            <Header user={user} onNavigate={handleNavigate} isAdmin={isAdmin} onSwitchLevel={() => setShowLevelSelector(true)} />
            
            {page === 'dashboard' && (
                <HubLayout 
                    title={`Welcome back, ${user.displayName?.split(' ')[0] || 'Accountant'}`} 
                    subtitle={theme.subtitle} 
                    gradient={theme.hubGradient}
                    onReplayTutorial={handleReplayTour}
                    isLessonMode={isLessonMode}
                    onToggleLessonMode={setIsLessonMode}
                    forceLessonMode={forceLessonMode}
                >
                    <CountdownWidget mocks={activeMocks} userLevel={user.level} userYearGroup={userYearGroup} />

                    <div className="w-full max-w-7xl mx-auto space-y-12">
                        
                        {!isLessonMode && <TeacherFeedbackSection userEmail={user.email} />}

                        {/* Section 1: Learning & Knowledge (Hidden in Lesson Mode) */}
                        {!isLessonMode && (
                            <section className="animate-fade-in">
                                <h2 className="text-2xl font-bold text-stone-700 dark:text-stone-200 mb-6 flex items-center gap-3">
                                    <span className="text-3xl">🧠</span> Learning & Progress
                                </h2>

                                <GradeDashboard user={user} />

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <HubCard
                                        icon={<span className="text-4xl">🎓</span>}
                                        title="Learning Academy"
                                        description="Complete interactive lessons, master content with AI tutoring, and track your syllabus progress."
                                        onClick={() => handleNavigate('learning_hub')}
                                        shadowColor="shadow-indigo-500/20"
                                        accentColor="text-indigo-600 hover:text-indigo-700"
                                        actionText="Start Learning"
                                    />
                                    <HubCard
                                        icon={<span className="text-4xl">🎬</span>}
                                        title="Video Learning"
                                        description="Watch curated A-Level videos with AI-powered interactive quizzes to check understanding."
                                        onClick={() => handleNavigate('video_learning')}
                                        shadowColor="shadow-red-500/20"
                                        accentColor="text-red-600 hover:text-red-700"
                                        actionText="Watch & Learn"
                                    />
                                    <HubCard
                                        icon={<span className="text-4xl">📅</span>}
                                        title="Revision Planner"
                                        description="Optimise your memory with spaced repetition scheduling and interactive forgetting curves."
                                        onClick={() => handleNavigate('revision_planner')}
                                        shadowColor="shadow-cyan-500/20"
                                        accentColor="text-cyan-600 hover:text-cyan-700"
                                    />
                                    <HubCard
                                        icon={<span className="text-4xl">🗂️</span>}
                                        title="Flashcards & Quizzes"
                                        description="Master key terms and case studies with digital flashcards and custom quizzes."
                                        onClick={() => handleNavigate('flashcard_quiz_hub')}
                                        shadowColor="shadow-fuchsia-500/20"
                                        accentColor="text-fuchsia-600 hover:text-fuchsia-700"
                                        disabled={!featureFlags.practiceQuizzes}
                                    />
                                    <HubCard
                                        icon={<span className="text-4xl">📊</span>}
                                        title="My Assessments"
                                        description="View all your past assessment marks, teacher feedback, and overall grade profile."
                                        onClick={() => handleNavigate('assessment_hub')}
                                        shadowColor="shadow-lime-500/20"
                                        accentColor="text-lime-600 hover:text-lime-700"
                                    />
                                    <HubCard
                                        icon={<span className="text-4xl">🧠</span>}
                                        title="Memory Recall"
                                        description="Use the 'Blurting' technique to solidify your knowledge and track your progress."
                                        onClick={() => handleNavigate('memory_recall_hub')}
                                        shadowColor="shadow-emerald-500/20"
                                        accentColor="text-emerald-600 hover:text-emerald-700"
                                    />
                                </div>
                            </section>
                        )}

                        {/* Section 2: Exam Training */}
                        <section className="animate-fade-in [animation-delay:0.1s]">
                            <h2 className="text-2xl font-bold text-stone-700 dark:text-stone-200 mb-6 flex items-center gap-3">
                                <span className="text-3xl">✍️</span> Exam Training Centre
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <HubCard
                                    icon={<span className="text-4xl">📝</span>}
                                    title="Question Practice"
                                    description="Generate exam-style questions, write answers, and get instant AI marking and feedback."
                                    onClick={() => handleNavigate('question_practice_hub')}
                                    shadowColor="shadow-blue-500/20"
                                    accentColor="text-blue-600 hover:text-blue-700"
                                />
                                <HubCard
                                    icon={<span className="text-4xl">🎧</span>}
                                    title="Walking Talking Mocks"
                                    description="Experience a realistic exam simulation with step-by-step audio guidance and instant marking."
                                    onClick={() => handleNavigate('walking_talking_mock')}
                                    shadowColor="shadow-indigo-500/20"
                                    accentColor="text-indigo-600 hover:text-indigo-700"
                                />
                                <HubCard
                                    icon={<span className="text-4xl">🛠️</span>}
                                    title="Skills & Structure"
                                    description="Master command words, essay structures, and essential maths skills."
                                    onClick={() => handleNavigate('skills_practice')}
                                    shadowColor="shadow-purple-500/20"
                                    accentColor="text-purple-600 hover:text-purple-700"
                                />
                                <HubCard
                                    icon={<span className="text-4xl">🚦</span>}
                                    title="RAG Analysis"
                                    description="Track your mastery across all topics with Red-Amber-Green ratings."
                                    onClick={() => handleNavigate('rag_analysis')}
                                    shadowColor="shadow-orange-500/20"
                                    accentColor="text-orange-600 hover:text-orange-700"
                                    disabled={!featureFlags.ragAssessment}
                                />
                                {!isLessonMode && (
                                    <HubCard
                                        icon={<span className="text-4xl">🎯</span>}
                                        title="Exams"
                                        description="Access targeted revision materials for upcoming exams and mock series."
                                        onClick={() => handleNavigate('mocks_hub')}
                                        shadowColor="shadow-rose-500/20"
                                        accentColor="text-rose-600 hover:text-rose-700"
                                    />
                                )}
                            </div>
                        </section>

                        {/* Section 3: Interactive & Future */}
                        <section className="animate-fade-in [animation-delay:0.2s]">
                            <h2 className="text-2xl font-bold text-stone-700 dark:text-stone-200 mb-6 flex items-center gap-3">
                                <span className="text-3xl">🚀</span> Interactive & Future
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {!isLessonMode && (
                                    <>
                                        <HubCard
                                            icon={<span className="text-4xl">🏛️</span>}
                                            title="Careers & University"
                                            description="Explore university courses, find local opportunities, and build your CV."
                                            onClick={() => handleNavigate('careers_university')}
                                            shadowColor="shadow-amber-500/20"
                                            accentColor="text-amber-600 hover:text-amber-700"
                                        />
                                        <HubCard
                                            icon={<span className="text-4xl">🎙️</span>}
                                            title="Podcast Studio"
                                            description="Create custom audio deep-dives on any topic. Hosted by Alex and Sam."
                                            onClick={() => handleNavigate('podcast_studio')}
                                            shadowColor="shadow-pink-500/20"
                                            accentColor="text-pink-600 hover:text-pink-700"
                                        />
                                        <HubCard
                                            icon={<span className="text-4xl">🎵</span>}
                                            title="Song Generator"
                                            description="Turn your revision into catchy tunes using AI."
                                            onClick={() => handleNavigate('song_generator')}
                                            shadowColor="shadow-violet-500/20"
                                            accentColor="text-violet-600 hover:text-violet-700"
                                            disabled={!featureFlags.songGenerator}
                                        />
                                        <HubCard
                                            icon={<span className="text-4xl">🎮</span>}
                                            title="Game Zone"
                                            description="Test your knowledge with interactive games like Flappy Accounts, Block Blast, and Account Swipe."
                                            onClick={() => handleNavigate('games_hub')}
                                            shadowColor="shadow-teal-500/20"
                                            accentColor="text-teal-600 hover:text-teal-700"
                                        />
                                        <HubCard
                                            icon={<span className="text-4xl">💼</span>}
                                            title="Scenario Explorer"
                                            description="Explore interactive business scenarios to deepen your understanding of accounting concepts."
                                            onClick={() => handleNavigate('simulations_hub')}
                                            shadowColor="shadow-emerald-500/20"
                                            accentColor="text-emerald-600 hover:text-emerald-700"
                                        />
                                    </>
                                )}
                                <HubCard
                                    icon={<span className="text-4xl">📊</span>}
                                    title="Scenario Explorer"
                                    description="Interactive map and detailed insights for all your core accounting scenarios."
                                    onClick={() => handleNavigate('case_study_explorer')}
                                    shadowColor="shadow-emerald-500/20"
                                    accentColor="text-emerald-600 hover:text-emerald-700"
                                />
                            </div>
                        </section>

                    </div>
                    <RecentActivity onViewSession={handleViewSession} userId={user.uid} />
                </HubLayout>
            )}

            {page === 'learning_hub' && <LearningHubView user={user} onBack={() => handleNavigate('dashboard')} />}
            {page === 'video_learning' && <VideoLearningView user={user} onBack={() => handleNavigate('dashboard')} />} 
            {page === 'mocks_hub' && <MocksHubView user={user} yearGroup={userYearGroup} onNavigate={handleNavigate} />}
            {page === 'feb_mocks' && <FebMocksView user={user} onBack={() => handleNavigate('mocks_hub')} />}

            {page === 'mock_detail' && selectedMockId && activeMocks.find(m => m.id === selectedMockId) && (
                <MockDetailView
                    user={user}
                    onBack={() => handleNavigate('mocks_hub')}
                    mockId={selectedMockId}
                    mockData={activeMocks.find(m => m.id === selectedMockId)!}
                />
            )}

            {page === 'assessment_hub' && <AssessmentHubView user={user} onBack={() => handleNavigate('dashboard')} />}

            {page === 'walking_talking_mock' && <WalkingTalkingMockView user={user} onBack={() => handleNavigate('dashboard')} />}

            {page === 'question_practice_hub' && <QuestionPracticeHubView onNavigate={handleNavigate} user={user} onResumeDraft={handleResumeDraft} />}
            {page === 'question_practice' && <QuestionPracticeView user={user} sessionToView={sessionToView} draftToResume={draftToResume} onBack={() => handleNavigate('question_practice_hub')} initialUnitFilter={questionPracticeParams?.initialTopic} initialSubTopicFilter={questionPracticeParams?.initialSubTopic} autoGenerate={questionPracticeParams?.autoGenerate} />}
            {page === 'lesson_practice_view' && <LessonPracticeView user={user} onBack={() => handleNavigate('question_practice_hub')} />}
            {page === 'session_analysis' && <SessionAnalysisView user={user} onViewSession={handleViewSession} onBack={() => handleNavigate('question_practice_hub')} />}
            
            {page === 'games_hub' && <GamesHubView onNavigate={handleNavigate} onStartGame={handleStartGame} user={user} featureFlags={featureFlags} />}
            {page === 'flappy_accountant' && <GameModeView topic={selectedGameTopic} user={user} onExit={() => handleNavigate('games_hub')} />}
            {page === 'block_blast' && <BlockBlastView topic={selectedGameTopic} user={user} onExit={() => handleNavigate('games_hub')} />}
            {page === 'swipe_quiz' && <SwipeQuizView topic={selectedGameTopic} user={user} onBack={() => handleNavigate('games_hub')} />}
            {page === 'game_analysis' && <GameAnalysisView user={user} onBack={() => handleNavigate('games_hub')} />}

            {page === 'flashcard_quiz_hub' && <FlashcardQuizHubView onNavigate={handleNavigate} onStartQuiz={handleStartFlashcardQuiz} user={user} />}
            {page === 'flashcards' && <FlashcardView user={user} onQuiz={handleStartFlashcardQuiz} onBack={() => handleNavigate('flashcard_quiz_hub')} />}
            {page === 'quiz_mode' && <QuizModeView user={user} initialDeck={flashcardDeck} onBack={() => handleNavigate('flashcard_quiz_hub')} />}

            {page === 'case_study_explorer' && <CaseStudyExplorerView user={user} onBack={() => handleNavigate('dashboard')} />}
            {page === 'skills_practice' && <SkillsPracticeView user={user} onBack={() => handleNavigate('dashboard')} />}
            {page === 'command_words' && <CommandWordToolkitView user={user} onBack={() => handleNavigate('dashboard')} />}
            {page === 'careers_university' && <CareersUniversityView onBack={() => handleNavigate('dashboard')} />}
            {page === 'rag_analysis' && <RagAnalysisView user={user} onBack={() => handleNavigate('dashboard')} />}
            {page === 'revision_planner' && <RevisionPlannerView user={user} onBack={() => handleNavigate('dashboard')} />}
            {page === 'podcast_studio' && <PodcastView user={user} onBack={() => handleNavigate('dashboard')} />}
            
            {page === 'admin' && isAdmin && <AdminView onImpersonate={handleImpersonate} onBack={() => handleNavigate('dashboard')} />}
            {page === 'full_chat' && <FullChatView user={user} onBack={() => handleNavigate('dashboard')} />}

            {page === 'simulations_hub' && <SimulationsHubView user={user} onNavigate={handleNavigate} />}
            {page === 'simulation_view' && <SimulationView user={user} onBack={() => handleNavigate('simulations_hub')} simulationId={selectedSimulationId} />}

            {page === 'memory_recall_hub' && <MemoryRecallHubView user={user} onNavigate={handleNavigate} onBack={() => handleNavigate('dashboard')} />}
            {page === 'memory_recall_active' && memoryRecallSessionParams && <MemoryRecallActiveView user={user} {...memoryRecallSessionParams} onBack={() => handleNavigate('memory_recall_hub')} onPracticeExam={(topic, subTopic) => handleNavigate('question_practice', { initialTopic: topic, initialSubTopic: subTopic, autoGenerate: true })} />}

            {page === 'song_generator' && <SongGeneratorView user={user} onBack={() => handleNavigate('dashboard')} />}

            {featureFlags.aiTutor && user && <Chatbot user={user} onNavigate={handleNavigate} />}
        </div>
    );
};

export default App;
