import React, { useState, useEffect } from 'react';
import { AuthUser, Page, UserLevel, MemoryRecallSession } from '../types';
import { collection, query, orderBy, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { IGCSE_UNITS, IGCSE_SPEC_TOPICS, GCSE_UNITS, GCSE_SPEC_TOPICS, ALEVEL_UNITS, ALEVEL_SPEC_TOPICS } from '../constants';

interface Props {
    user: AuthUser;
    onNavigate: (page: Page, param?: any) => void;
    onBack: () => void;
}

const MemoryRecallHubView: React.FC<Props> = ({ user, onNavigate, onBack }) => {
    const [selectedTopic, setSelectedTopic] = useState<string>('');
    const [selectedSubTopic, setSelectedSubTopic] = useState<string>('');
    const [sessions, setSessions] = useState<MemoryRecallSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const level = user.level || 'GCSE';
    const units = level === 'IGCSE' ? IGCSE_UNITS : level === 'A-Level' ? ALEVEL_UNITS : GCSE_UNITS;
    const specTopics = level === 'IGCSE' ? IGCSE_SPEC_TOPICS : level === 'A-Level' ? ALEVEL_SPEC_TOPICS : GCSE_SPEC_TOPICS;

    // Filter units that actually have topics (ignoring "All Units")
    const availableUnits = units.filter(u => u !== 'All Units' && specTopics[u]);

    useEffect(() => {
        const fetchSessions = async () => {
            if (!user) return;
            try {
                const q = query(collection(db, 'users', user.uid, 'memory_recall_sessions'), orderBy('lastAccessed', 'desc'));
                const snapshot = await getDocs(q);
                const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MemoryRecallSession));
                setSessions(loaded);
            } catch (e) {
                console.error("Failed to load memory recall sessions", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSessions();
    }, [user]);

    const handleStartSession = async (topicId: string, subTopicId: string, resumeSession?: MemoryRecallSession) => {
        if (resumeSession) {
            onNavigate('memory_recall_active', { sessionId: resumeSession.id, topicId: resumeSession.topicId, subTopicId: resumeSession.subTopicId, isResume: true });
            return;
        }

        const sessionId = `mrs_${Date.now()}`;
        const newSession: MemoryRecallSession = {
            id: sessionId,
            userId: user.uid,
            topicId,
            subTopicId,
            level,
            attempts: [],
            status: 'in_progress',
            lastAccessed: new Date().toISOString()
        };

        try {
            await setDoc(doc(db, 'users', user.uid, 'memory_recall_sessions', sessionId), newSession);
            onNavigate('memory_recall_active', { sessionId, topicId, subTopicId, isResume: false });
        } catch (e) {
            console.error("Failed to create session", e);
            alert("Failed to start session. Please try again.");
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-fade-in">
            <button onClick={onBack} className="mb-6 flex items-center text-emerald-600 hover:text-emerald-700 transition-colors">
                <span className="mr-2">←</span> Back to Dashboard
            </button>

            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-stone-800 dark:text-stone-100 tracking-tight mb-4">
                    🧠 Memory Recall <span className="text-emerald-600 dark:text-emerald-400">Mastery</span>
                </h1>
                <p className="text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto">
                    Use the "Blurting" technique to solidify your knowledge. Read the summary, write everything you can remember from memory, check your gaps, and repeat until you achieve 100% recall.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Session Creation / New Topic Selection */}
                <div className="lg:col-span-1 bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-xl border border-stone-100 dark:border-stone-800">
                    <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6 flex items-center gap-2">
                        <span className="text-2xl">➕</span> Start New Topic
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-stone-600 dark:text-stone-400 mb-2 uppercase tracking-wider">Select Unit</label>
                            <select
                                className="w-full p-3 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-stone-800 dark:text-stone-200"
                                value={selectedTopic}
                                onChange={(e) => {
                                    setSelectedTopic(e.target.value);
                                    setSelectedSubTopic('');
                                }}
                            >
                                <option value="">Choose a unit...</option>
                                {availableUnits.map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>

                        {selectedTopic && (
                            <div className="animate-fade-in">
                                <label className="block text-sm font-semibold text-stone-600 dark:text-stone-400 mb-2 uppercase tracking-wider">Select Sub-Topic</label>
                                <select
                                    className="w-full p-3 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-stone-800 dark:text-stone-200"
                                    value={selectedSubTopic}
                                    onChange={(e) => setSelectedSubTopic(e.target.value)}
                                >
                                    <option value="">Choose a sub-topic...</option>
                                    {specTopics[selectedTopic]?.map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            disabled={!selectedTopic || !selectedSubTopic}
                            onClick={() => handleStartSession(selectedTopic, selectedSubTopic)}
                            className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                        >
                            <span>🚀</span> Start Learning
                        </button>
                    </div>
                </div>

                {/* Progress & Recent Sessions */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6 flex items-center gap-2">
                        <span className="text-2xl">📈</span> Your Progress
                    </h2>

                    {sessions.length === 0 ? (
                        <div className="bg-stone-50 dark:bg-stone-800/30 rounded-3xl p-8 text-center border border-dashed border-stone-300 dark:border-stone-700">
                            <span className="text-4xl mb-3 block">🌱</span>
                            <h3 className="text-lg font-bold text-stone-700 dark:text-stone-300 mb-1">No sessions yet</h3>
                            <p className="text-stone-500 dark:text-stone-400">Select a topic to start your first memory recall exercise.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {sessions.map(session => {
                                const bestScore = session.attempts.length > 0 ? Math.max(...session.attempts.map(a => a.score)) : 0;
                                const isCompleted = session.status === 'completed' || bestScore === 100;

                                return (
                                    <div key={session.id} className="bg-white dark:bg-stone-900 rounded-2xl p-5 shadow-md border border-stone-100 dark:border-stone-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-colors">
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isCompleted ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                                    {isCompleted ? 'Completed' : 'In Progress'}
                                                </span>
                                                <span className="text-xs text-stone-500 dark:text-stone-400">Last: {new Date(session.lastAccessed).toLocaleDateString()}</span>
                                            </div>
                                            <h3 className="font-bold text-stone-800 dark:text-stone-100 text-lg leading-snug">{session.subTopicId}</h3>
                                            <p className="text-sm text-stone-500 dark:text-stone-400">{session.topicId}</p>
                                        </div>

                                        <div className="flex items-center gap-6 w-full md:w-auto">
                                            <div className="flex flex-col items-center">
                                                <span className="text-2xl font-black text-stone-800 dark:text-stone-100">{bestScore}%</span>
                                                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Best Score</span>
                                            </div>
                                            <div className="flex flex-col items-center border-l border-stone-200 dark:border-stone-800 pl-4">
                                                <span className="text-xl font-bold text-stone-600 dark:text-stone-300">{session.attempts.length}</span>
                                                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Attempts</span>
                                            </div>
                                            <button
                                                onClick={() => handleStartSession(session.topicId, session.subTopicId, session)}
                                                className={`ml-auto md:ml-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${isCompleted ? 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50'}`}
                                            >
                                                {isCompleted ? 'Review' : 'Resume'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MemoryRecallHubView;