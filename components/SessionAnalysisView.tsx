
import React, { useState, useEffect, useMemo } from 'react';
import { CompletedSession, AuthUser } from '../types';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import HubLayout from './HubLayout';

interface PerformanceStat {
    earned: number;
    total: number;
}

interface CalculatedStats {
    totalSessions: number;
    averageScore: number;
    performanceByUnit: Record<string, PerformanceStat>;
    performanceByMarks: Record<string, PerformanceStat>;
    performanceByAO: Record<string, PerformanceStat>;
}

interface SessionAnalysisViewProps {
    onViewSession: (session: CompletedSession) => void;
    user: AuthUser;
    onBack: () => void;
    isAdmin?: boolean;
}

const StatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700">
        <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">{title}</p>
        <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-2">{value}</p>
    </div>
);

const PerformanceBar: React.FC<{ label: string; percentage: number; valueText: string }> = ({ label, percentage, valueText }) => {
    const color = percentage >= 75 ? 'bg-emerald-500' : percentage >= 40 ? 'bg-amber-500' : 'bg-red-500';
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <p className="font-bold text-stone-700 dark:text-stone-300">{label}</p>
                <p className="text-sm font-semibold text-stone-600 dark:text-stone-400">{valueText}</p>
            </div>
            <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2.5">
                <div className="${color} h-2.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};


const SessionAnalysisView: React.FC<SessionAnalysisViewProps> = ({ onViewSession, user, onBack, isAdmin }) => {
    const [sessions, setSessions] = useState<CompletedSession[]>([]);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    const handleDeleteSession = async (session: CompletedSession, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete this session? This action cannot be undone.`)) {
            try {
                await deleteDoc(doc(db, `users/${user.uid}/completed_sessions`, session.id));
                setSessions(prev => prev.filter(s => s.id !== session.id));
            } catch (error) {
                console.error("Error deleting session:", error);
                alert("Failed to delete the session. Please try again.");
            }
        }
    };

    useEffect(() => {
        if (!user) return;

        const fetchSessions = async () => {
            try {
                const sessionsRef = collection(db, 'users', user.uid, 'sessions');
                const q = query(sessionsRef, orderBy('completedAt', 'desc'));
                const querySnapshot = await getDocs(q);
                const loadedSessions = querySnapshot.docs.map(doc => doc.data() as CompletedSession);
                setSessions(loadedSessions);
            } catch (error) {
                console.error("Error loading session data from Firestore:", error);
            }
        };

        fetchSessions();
    }, [user]);

    const stats: CalculatedStats = useMemo(() => {
        if (sessions.length === 0) {
            return { totalSessions: 0, averageScore: 0, performanceByUnit: {}, performanceByMarks: {}, performanceByAO: {} };
        }

        const performanceByUnit: Record<string, PerformanceStat> = {};
        const performanceByMarks: Record<string, PerformanceStat> = {};
        const performanceByAO: Record<string, PerformanceStat> = { AO1: { earned: 0, total: 0 }, AO2: { earned: 0, total: 0 }, AO3: { earned: 0, total: 0 } };

        let totalScoreSum = 0;

        sessions.forEach(session => {
            const { question, aiFeedback } = session;
            const score = aiFeedback.score || 0;
            const totalMarks = aiFeedback.totalMarks || 1; // Prevent division by zero
            
            totalScoreSum += (score / totalMarks);

            // By Unit
            if (!performanceByUnit[question.unit]) performanceByUnit[question.unit] = { earned: 0, total: 0 };
            performanceByUnit[question.unit].earned += score;
            performanceByUnit[question.unit].total += totalMarks;

            // By Marks
            const marksKey = `${question.marks} Marks`;
            if (!performanceByMarks[marksKey]) performanceByMarks[marksKey] = { earned: 0, total: 0 };
            performanceByMarks[marksKey].earned += score;
            performanceByMarks[marksKey].total += totalMarks;

            // By AO (estimated)
            const scorePercentage = totalMarks > 0 ? score / totalMarks : 0;
            if (question.ao && question.ao.ao1 > 0) {
                performanceByAO.AO1.earned += scorePercentage * question.ao.ao1;
                performanceByAO.AO1.total += question.ao.ao1;
            }
            if (question.ao && question.ao.ao2 > 0) {
                performanceByAO.AO2.earned += scorePercentage * question.ao.ao2;
                performanceByAO.AO2.total += question.ao.ao2;
            }
            if (question.ao && question.ao.ao3 > 0) {
                performanceByAO.AO3.earned += scorePercentage * question.ao.ao3;
                performanceByAO.AO3.total += question.ao.ao3;
            }
        });

        return {
            totalSessions: sessions.length,
            averageScore: (totalScoreSum / sessions.length) * 100,
            performanceByUnit,
            performanceByMarks,
            performanceByAO,
        };
    }, [sessions]);

    const groupedSessions = useMemo(() => {
        const groups: Record<string, CompletedSession[]> = {};
        const ungrouped: CompletedSession[] = [];

        sessions.forEach(session => {
            if (session.sessionName) {
                if (!groups[session.sessionName]) {
                    groups[session.sessionName] = [];
                }
                groups[session.sessionName].push(session);
            } else {
                ungrouped.push(session);
            }
        });

        // Sort ungrouped by date descending
        ungrouped.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

        // Sort items within each group by date ascending (so they appear in the order they were taken)
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
        });

        return { groups, ungrouped };
    }, [sessions]);

    const toggleGroup = (groupName: string) => {
        setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
    };

    const renderPerformanceSection = (title: string, data: Record<string, PerformanceStat>) => {
        const sortedEntries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
        if (sortedEntries.length === 0) return null;

        return (
             <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6">{title}</h2>
                <div className="space-y-4">
                    {sortedEntries.map(([label, stat]) => {
                        if (stat.total === 0) return null;
                        const percentage = (stat.earned / stat.total) * 100;
                        const valueText = `${stat.earned.toFixed(1)} / ${stat.total} marks`;
                        return <PerformanceBar key={label} label={label} percentage={percentage} valueText={valueText} />;
                    })}
                </div>
            </div>
        );
    };

    const SessionCard = ({ session }: { session: CompletedSession }) => (
        <div key={session.id} className="relative w-full text-left p-4 bg-stone-50/50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl hover:bg-white dark:hover:bg-stone-800 hover:shadow-md transition-all duration-300 group cursor-pointer" onClick={() => onViewSession(session)}>
            <div className="flex justify-between items-start gap-4">
                <div className="flex-grow">
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full inline-block mb-2">{session.question.unit}</p>
                    <p className="font-semibold text-stone-700 dark:text-stone-200 pr-8">{session.aiSummary}</p>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">Score: {session.aiFeedback.score}/{session.aiFeedback.totalMarks}</p>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{new Date(session.completedAt).toLocaleDateString()}</p>
                </div>
            </div>
            {isAdmin && (
                <button
                    onClick={(e) => handleDeleteSession(session, e)}
                    className="absolute top-4 right-4 p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Session"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            )}
        </div>
    );

    return (
        <HubLayout
            title="Session Performance Analysis"
            subtitle="Review your practice question history to find strengths and areas for improvement."
            gradient="bg-gradient-to-r from-green-500 to-lime-600"
            onBack={onBack}
        >
            <main className="w-full max-w-7xl mx-auto">
                 {sessions.length === 0 ? (
                     <div className="text-center py-20 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl">
                        <span className="text-7xl">🎓</span>
                        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mt-4">No Practice History Found</h2>
                        <p className="text-stone-500 dark:text-stone-400 mt-2">Complete some questions in "Question Practice" to start analyzing your performance!</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                            <StatCard title="Total Sessions Completed" value={stats.totalSessions.toString()} />
                            <StatCard title="Overall Average Score" value={`${stats.averageScore.toFixed(0)}%`} />
                        </div>

                        {renderPerformanceSection("Performance by Unit", stats.performanceByUnit)}
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {renderPerformanceSection("Performance by Question Type", stats.performanceByMarks)}
                            {renderPerformanceSection("Estimated Performance by AO", stats.performanceByAO)}
                        </div>

                        <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl p-6 sm:p-8">
                            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6">Session History</h2>
                             <div className="space-y-4">
                                {/* Grouped Sessions */}
                                {Object.entries(groupedSessions.groups).map(([groupName, groupSessions]) => {
                                    const totalScore = groupSessions.reduce((sum, s) => sum + (s.aiFeedback.score || 0), 0);
                                    const totalMarks = groupSessions.reduce((sum, s) => sum + (s.aiFeedback.totalMarks || 1), 0);
                                    const latestDate = new Date(Math.max(...groupSessions.map(s => new Date(s.completedAt).getTime())));
                                    const isExpanded = expandedGroups[groupName];

                                    return (
                                        <div key={groupName} className="border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden bg-stone-50/30 dark:bg-stone-800/20">
                                            <button
                                                onClick={() => toggleGroup(groupName)}
                                                className="w-full flex justify-between items-center p-4 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                                                        <svg className="w-5 h-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                    <div className="text-left">
                                                        <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100 flex items-center gap-2">
                                                            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                            </svg>
                                                            {groupName}
                                                        </h3>
                                                        <p className="text-sm text-stone-500">{groupSessions.length} Questions • {latestDate.toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-emerald-600 dark:text-emerald-400">Total Score: {totalScore}/{totalMarks}</p>
                                                </div>
                                            </button>

                                            {isExpanded && (
                                                <div className="p-4 pt-0 space-y-3 bg-white/50 dark:bg-stone-900/50 border-t border-stone-200 dark:border-stone-700">
                                                    {groupSessions.map(session => (
                                                        <SessionCard key={session.id} session={session} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Ungrouped Sessions */}
                                {groupedSessions.ungrouped.map(session => (
                                    <SessionCard key={session.id} session={session} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </HubLayout>
    );
};

export default SessionAnalysisView;
