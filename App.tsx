
import React, { useState, useEffect } from 'react';
import { Page, CompletedSession, CaseStudyLocation, AuthUser, FlashcardItem, DraftSession, UserLevel } from './types';
import { onAuthChange, signOutUser, db } from './firebase';
import { User } from 'firebase/auth';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

import LoginView from './components/LoginView';
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
import VideoLearningView from './components/VideoLearningView'; // Imported
import MocksHubView from './components/MocksHubView';
import FebMocksView from './components/FebMocksView';
import HubLayout from './components/HubLayout';
import HubCard from './components/HubCard';
import LevelSelector from './components/LevelSelector';

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
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState<Page>('dashboard');
    const [selectedGameTopic, setSelectedGameTopic] = useState<string>('All Topics');
    const [flashcardDeck, setFlashcardDeck] = useState<FlashcardItem[]>([]);
    const [sessionToView, setSessionToView] = useState<CompletedSession | null>(null);
    const [draftToResume, setDraftToResume] = useState<DraftSession | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showLevelSelector, setShowLevelSelector] = useState(false);

    const [featureFlags, setFeatureFlags] = useState({
        birdGame: true,
        blockBlast: true,
        practiceQuizzes: true,
        swipeQuizzes: false,
        aiTutor: true,
        ragAssessment: true
    });

    const checkAdmin = (email: string | null, uid: string) => {
        const adminUIDs = ['JxQuyECQcIcrx2xe3xmp6vSSt6j2', 'YEAWHlpT9vSYNkQni3OU3Sr87wd2'];
        if (adminUIDs.includes(uid)) return true;
        return email?.includes('admin') || false; 
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [page]);

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
                    level: userLevel
                };
                setUser(authUser);
                
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

    const handleLevelSelect = async (level: UserLevel) => {
        if (user) {
            await updateDoc(doc(db, 'users', user.uid), { level });
            setUser({ ...user, level });
            setShowLevelSelector(false);
        }
    };

    const handleNavigate = (newPage: Page) => {
        setPage(newPage);
        setSessionToView(null);
        setDraftToResume(null);
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
        const level = user?.level || 'A-Level';
        if (level === 'GCSE') {
            return {
                bgClass: "bg-slate-50 dark:bg-slate-950", 
                bgPattern: "bg-[url('/grid.svg')]",
                hubGradient: "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600",
                subtitle: "Your GCSE Geography Hub (AQA 8035)"
            };
        }
        return {
            bgClass: "bg-stone-100 dark:bg-stone-950", 
            bgPattern: "bg-[url('/grid.svg')]",
            hubGradient: "bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-400",
            subtitle: "Your A-Level Geography Hub"
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
            {showLevelSelector && <LevelSelector onSelect={handleLevelSelect} />}
            
            <Header user={user} onNavigate={handleNavigate} isAdmin={isAdmin} onSwitchLevel={() => setShowLevelSelector(true)} />
            
            {page === 'dashboard' && (
                <HubLayout 
                    title={`Welcome back, ${user.displayName?.split(' ')[0] || 'Geographer'}`} 
                    subtitle={theme.subtitle} 
                    gradient={theme.hubGradient}
                >
                    <div className="w-full max-w-7xl mx-auto space-y-12">
                        
                        {/* Section 1: Learning & Knowledge */}
                        <section className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-stone-700 dark:text-stone-200 mb-6 flex items-center gap-3">
                                <span className="text-3xl">🧠</span> Learning & Progress
                            </h2>
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
                            </div>
                        </section>

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
                                <HubCard
                                    icon={<span className="text-4xl">🎯</span>}
                                    title="Mocks"
                                    description="Access targeted revision materials for specific mock exam series (e.g. Feb 2026)."
                                    onClick={() => handleNavigate('mocks_hub')}
                                    shadowColor="shadow-rose-500/20"
                                    accentColor="text-rose-600 hover:text-rose-700"
                                />
                            </div>
                        </section>

                        {/* Section 3: Interactive & Future */}
                        <section className="animate-fade-in [animation-delay:0.2s]">
                            <h2 className="text-2xl font-bold text-stone-700 dark:text-stone-200 mb-6 flex items-center gap-3">
                                <span className="text-3xl">🚀</span> Interactive & Future
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <HubCard
                                    icon={<span className="text-4xl">🎙️</span>}
                                    title="Podcast Studio"
                                    description="Create custom audio deep-dives on any topic. Hosted by Alex and Sam."
                                    onClick={() => handleNavigate('podcast_studio')}
                                    shadowColor="shadow-pink-500/20"
                                    accentColor="text-pink-600 hover:text-pink-700"
                                />
                                <HubCard
                                    icon={<span className="text-4xl">🎮</span>}
                                    title="Game Zone"
                                    description="Test your knowledge with interactive games like Flappy Geo, Block Blast, and Swipe Quiz."
                                    onClick={() => handleNavigate('games_hub')}
                                    shadowColor="shadow-teal-500/20"
                                    accentColor="text-teal-600 hover:text-teal-700"
                                />
                                <HubCard
                                    icon={<span className="text-4xl">🗺️</span>}
                                    title="Case Study Explorer"
                                    description="Interactive map and detailed insights for all your core case studies."
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
            {page === 'mocks_hub' && <MocksHubView user={user} onNavigate={handleNavigate} />}
            {page === 'feb_mocks' && <FebMocksView user={user} onBack={() => handleNavigate('mocks_hub')} />}
            {page === 'question_practice_hub' && <QuestionPracticeHubView onNavigate={handleNavigate} user={user} onResumeDraft={handleResumeDraft} />}
            {page === 'question_practice' && <QuestionPracticeView user={user} sessionToView={sessionToView} draftToResume={draftToResume} onBack={() => handleNavigate('question_practice_hub')} />}
            {page === 'session_analysis' && <SessionAnalysisView user={user} onViewSession={handleViewSession} onBack={() => handleNavigate('question_practice_hub')} />}
            
            {page === 'games_hub' && <GamesHubView onNavigate={handleNavigate} onStartGame={handleStartGame} user={user} featureFlags={featureFlags} />}
            {page === 'flappy_geo' && <GameModeView topic={selectedGameTopic} user={user} onExit={() => handleNavigate('games_hub')} />}
            {page === 'block_blast' && <BlockBlastView topic={selectedGameTopic} user={user} onExit={() => handleNavigate('games_hub')} />}
            {page === 'swipe_quiz' && <SwipeQuizView topic={selectedGameTopic} user={user} onBack={() => handleNavigate('games_hub')} />}
            {page === 'game_analysis' && <GameAnalysisView user={user} onBack={() => handleNavigate('games_hub')} />}

            {page === 'flashcard_quiz_hub' && <FlashcardQuizHubView onNavigate={handleNavigate} onStartQuiz={handleStartFlashcardQuiz} user={user} />}
            {page === 'flashcards' && <FlashcardView user={user} onQuiz={handleStartFlashcardQuiz} onBack={() => handleNavigate('flashcard_quiz_hub')} />}
            {page === 'quiz_mode' && <QuizModeView initialDeck={flashcardDeck} onBack={() => handleNavigate('flashcard_quiz_hub')} />}

            {page === 'case_study_explorer' && <CaseStudyExplorerView user={user} onBack={() => handleNavigate('dashboard')} />}
            {page === 'skills_practice' && <SkillsPracticeView user={user} onBack={() => handleNavigate('dashboard')} />}
            {page === 'command_words' && <CommandWordToolkitView user={user} onBack={() => handleNavigate('dashboard')} />}
            {page === 'careers_university' && <CareersUniversityView onBack={() => handleNavigate('dashboard')} />}
            {page === 'rag_analysis' && <RagAnalysisView user={user} onBack={() => handleNavigate('dashboard')} />}
            {page === 'revision_planner' && <RevisionPlannerView user={user} onBack={() => handleNavigate('dashboard')} />}
            {page === 'podcast_studio' && <PodcastView user={user} onBack={() => handleNavigate('dashboard')} />}
            
            {page === 'admin' && isAdmin && <AdminView onImpersonate={handleImpersonate} onBack={() => handleNavigate('dashboard')} />}

            {featureFlags.aiTutor && <Chatbot />}
        </div>
    );
};

export default App;
