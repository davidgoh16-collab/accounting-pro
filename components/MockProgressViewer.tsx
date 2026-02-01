
import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthUser, MockConfig } from '../types';
import { getMocks } from '../services/mockService';
import { generateMockSchedule, ScheduleTask, ScheduleWeek } from '../utils/mockUtils';

interface MockProgressViewerProps {
    user: AuthUser;
}

const MockProgressViewer: React.FC<MockProgressViewerProps> = ({ user }) => {
    const [mockProgress, setMockProgress] = useState<Record<string, { schedule: Record<string, boolean>, rag: Record<string, string> }>>({});
    const [allMocks, setAllMocks] = useState<MockConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMock, setSelectedMock] = useState<{ id: string, title: string } | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Get Mock Definitions
                const mocks = await getMocks();
                setAllMocks(mocks);

                // 2. Get User Progress
                const mocksCol = collection(db, 'users', user.uid, 'mocks');
                const snapshot = await getDocs(mocksCol);

                const progress: Record<string, any> = {};
                snapshot.docs.forEach(doc => {
                    progress[doc.id] = doc.data();
                });
                setMockProgress(progress);
            } catch (e) {
                console.error("Failed to load mock progress", e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user.uid]);

    // Reconstruct the full schedule for a mock to determine total items
    const getMockStats = (mock: MockConfig) => {
        const scheduleWeeks = generateMockSchedule(mock.exams);
        // Flatten to get all tasks (excluding exams themselves if we only care about revision tasks, but let's include exams for completeness or filter them)
        // Usually checklists include the tasks. The exam events are also in the schedule but user might not "tick" them off in the same way?
        // In MockDetailView, `!isExam` is used for onClick toggle. So we should count only non-exam tasks?
        // Let's count only non-exam tasks for "Revision Progress".

        const allTasks = scheduleWeeks.flatMap(w => w.days).filter(d => !d.isExam);
        const userSchedule = mockProgress[mock.id]?.schedule || {};

        const completedCount = allTasks.filter(t => userSchedule[t.id]).length;
        const totalCount = allTasks.length;

        return {
            completed: completedCount,
            total: totalCount,
            percent: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
            tasks: allTasks
        };
    };

    if (loading) return <div className="p-8 text-center text-stone-500">Loading exam progress...</div>;

    const activeUserMocks = allMocks.filter(m => mockProgress[m.id]);

    if (activeUserMocks.length === 0) {
        return (
            <div className="p-8 text-center bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                <span className="text-4xl">📝</span>
                <p className="mt-2 text-stone-600 dark:text-stone-300 font-semibold">No exam prep started yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-4">Exam Prep Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeUserMocks.map(mock => {
                    const stats = getMockStats(mock);

                    return (
                        <div
                            key={mock.id}
                            onClick={() => setSelectedMock({ id: mock.id, title: mock.title })}
                            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-stone-800 dark:text-stone-100 text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{mock.title}</h4>
                                    <p className="text-stone-500 text-xs">ID: {mock.id}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-2xl font-bold ${stats.percent === 100 ? 'text-emerald-600' : 'text-indigo-600'}`}>{stats.percent}%</span>
                                    <p className="text-xs text-stone-400">Ready</p>
                                </div>
                            </div>

                            {/* Checklist Progress Bar */}
                            <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2.5 mb-4">
                                <div className="bg-indigo-600 h-2.5 rounded-full transition-all" style={{ width: `${stats.percent}%` }}></div>
                            </div>

                            <p className="text-xs text-stone-500 text-center">Click to view details</p>
                        </div>
                    );
                })}
            </div>

            {/* Detail Modal */}
            {selectedMock && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-fade-in border border-stone-200 dark:border-stone-700">
                        <div className="p-6 border-b border-stone-200 dark:border-stone-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">{selectedMock.title} - Checklist</h3>
                            <button onClick={() => setSelectedMock(null)} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
                                ✕
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 custom-scrollbar">
                            {(() => {
                                const mock = allMocks.find(m => m.id === selectedMock.id);
                                if (!mock) return null;
                                const stats = getMockStats(mock);
                                const userSchedule = mockProgress[mock.id]?.schedule || {};

                                return (
                                    <div className="space-y-2">
                                        {stats.tasks.map((task: ScheduleTask) => {
                                            const isCompleted = userSchedule[task.id];
                                            return (
                                                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50">
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isCompleted ? 'bg-green-500 border-green-500' : 'border-stone-300 dark:border-stone-600'}`}>
                                                        {isCompleted && <span className="text-white text-xs">✓</span>}
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-medium ${isCompleted ? 'text-stone-800 dark:text-stone-200' : 'text-stone-500 dark:text-stone-400'}`}>
                                                            {task.task}
                                                        </p>
                                                        <p className="text-[10px] text-stone-400">
                                                            {task.date.toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {stats.tasks.length === 0 && <p className="text-center text-stone-500">No checklist items found.</p>}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
            <style>{`.animate-fade-in { animation: fadeIn 0.2s ease-out; } @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
        </div>
    );
};

export default MockProgressViewer;
