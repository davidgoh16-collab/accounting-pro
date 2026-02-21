
import React, { useEffect, useState } from 'react';
import { Page, AuthUser, DraftSession } from '../types';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import HubLayout from './HubLayout';
import HubCard from './HubCard';

interface QuestionPracticeHubViewProps {
    onNavigate: (page: Page) => void;
    user?: AuthUser;
    onResumeDraft?: (draft: DraftSession) => void;
}

const QuestionPracticeHubView: React.FC<QuestionPracticeHubViewProps> = ({ onNavigate, user, onResumeDraft }) => {
    const [drafts, setDrafts] = useState<DraftSession[]>([]);
    const [loadingDrafts, setLoadingDrafts] = useState(false);

    useEffect(() => {
        if (!user) return;

        const fetchDrafts = async () => {
            setLoadingDrafts(true);
            try {
                const draftsRef = collection(db, 'users', user.uid, 'drafts');
                const q = query(draftsRef, orderBy('lastUpdated', 'desc'));
                const snapshot = await getDocs(q);
                const loadedDrafts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DraftSession));
                setDrafts(loadedDrafts);
            } catch (error) {
                console.error("Error fetching drafts:", error);
            } finally {
                setLoadingDrafts(false);
            }
        };

        fetchDrafts();
    }, [user]);

    const handleDeleteDraft = async (e: React.MouseEvent, draftId: string) => {
        e.stopPropagation();
        if (!user || !window.confirm("Are you sure you want to delete this saved session?")) return;
        
        try {
            await deleteDoc(doc(db, 'users', user.uid, 'drafts', draftId));
            setDrafts(prev => prev.filter(d => d.id !== draftId));
        } catch (error) {
            console.error("Error deleting draft:", error);
        }
    };

    return (
        <HubLayout
            title="Practice Zone"
            subtitle="Generate unique questions, get instant feedback, and track your progress over time."
            gradient="bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500"
            onBack={() => onNavigate('dashboard')}
        >
            <main className="w-full max-w-6xl mx-auto space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <HubCard
                        icon={<span className="text-5xl">✏️</span>}
                        title="Start New Session"
                        description="Generate a unique, AQA-style exam question and tackle it using various practice modes, from timed challenges to interactive tutoring."
                        onClick={() => onNavigate('question_practice')}
                        shadowColor="shadow-blue-500/20"
                        accentColor="text-blue-600 hover:text-blue-700"
                    />
                    <HubCard
                        icon={<span className="text-5xl">📸</span>}
                        title="Lesson Practice"
                        description="Upload a photo of your handwritten work. Get instant AI marking or digitize your teacher's feedback for your records."
                        onClick={() => onNavigate('lesson_practice_view')}
                        shadowColor="shadow-indigo-500/20"
                        accentColor="text-indigo-600 hover:text-indigo-700"
                    />
                    <HubCard
                        icon={<span className="text-5xl">🎓</span>}
                        title="Session Analysis"
                        description="Review your performance, see topic strengths and weaknesses, and analyze your scores across different question types and AOs."
                        onClick={() => onNavigate('session_analysis')}
                        shadowColor="shadow-green-500/20"
                        accentColor="text-green-600 hover:text-green-700"
                    />
                </div>

                {/* Drafts Section */}
                {loadingDrafts ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-stone-500"></div>
                        <p className="mt-2 text-stone-500">Loading saved sessions...</p>
                    </div>
                ) : drafts.length > 0 && onResumeDraft && (
                    <section className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-stone-700 dark:text-stone-200 mb-6 flex items-center gap-3">
                            <span className="text-3xl">💾</span> Resume Progress
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {drafts.map(draft => (
                                <div 
                                    key={draft.id}
                                    onClick={() => onResumeDraft(draft)}
                                    className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-800/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-md">
                                                {draft.practiceMode.replace('_', ' ')} Mode
                                            </span>
                                            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mt-2 line-clamp-1">{draft.question.title}</h3>
                                            <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mt-1">{draft.question.unit}</p>
                                        </div>
                                        <button 
                                            onClick={(e) => handleDeleteDraft(e, draft.id)}
                                            className="text-stone-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors z-10"
                                            title="Delete Draft"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-between items-center text-sm text-stone-500 dark:text-stone-400">
                                        <span>{draft.question.marks} Marks</span>
                                        <span>Edited: {new Date(draft.lastUpdated).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </HubLayout>
    );
};

export default QuestionPracticeHubView;