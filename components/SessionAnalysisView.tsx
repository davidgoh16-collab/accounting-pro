
import React, { useState, useEffect, useMemo } from 'react';
import { CompletedSession, AuthUser } from '../types';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
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
                <div className={`${color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};


const SessionAnalysisView: React.FC<SessionAnalysisViewProps> = ({ onViewSession, user, onBack }) => {
    const [sessions, setSessions] = useState<CompletedSession[]>([]);

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
            const score = aiFeedback.score;
            const totalMarks = aiFeedback.totalMarks;
            
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
            if (question.ao.ao1 > 0) {
                performanceByAO.AO1.earned += scorePercentage * question.ao.ao1;
                performanceByAO.AO1.total += question.ao.ao1;
            }
            if (question.ao.ao2 > 0) {
                performanceByAO.AO2.earned += scorePercentage * question.ao.ao2;
                performanceByAO.AO2.total += question.ao.ao2;
            }
            if (question.ao.ao3 > 0) {
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
                                {sessions.map(session => (
                                    <button key={session.id} onClick={() => onViewSession(session)} className="w-full text-left p-4 bg-stone-50/50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl hover:bg-white dark:hover:bg-stone-800 hover:shadow-md transition-all duration-300">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-grow">
                                                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full inline-block mb-2">{session.question.unit}</p>
                                                <p className="font-semibold text-stone-700 dark:text-stone-200">{session.aiSummary}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">Score: {session.aiFeedback.score}/{session.aiFeedback.totalMarks}</p>
                                                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{new Date(session.completedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </button>
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
