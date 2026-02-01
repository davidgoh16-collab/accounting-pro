
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthUser, ChecklistItem } from '../types';
import { getMocks } from '../services/mockService';

interface MockProgressViewerProps {
    user: AuthUser;
}

const MockProgressViewer: React.FC<MockProgressViewerProps> = ({ user }) => {
    const [mockProgress, setMockProgress] = useState<Record<string, { checklist: ChecklistItem[], rag: Record<string, string> }>>({});
    const [mockTitles, setMockTitles] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Get Mock Definitions to map IDs to Titles
                const allMocks = await getMocks();
                const titleMap: Record<string, string> = {};
                allMocks.forEach(m => titleMap[m.id] = m.title);
                setMockTitles(titleMap);

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

    if (loading) return <div className="p-8 text-center text-stone-500">Loading exam progress...</div>;

    const activeMocks = Object.keys(mockProgress);

    if (activeMocks.length === 0) {
        return (
            <div className="p-8 text-center bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                <span className="text-4xl">📝</span>
                <p className="mt-2 text-stone-600 dark:text-stone-300 font-semibold">No exam prep started yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-4">Exam Prep Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeMocks.map(mockId => {
                    const data = mockProgress[mockId];
                    const checklist = data.checklist || [];
                    const completed = checklist.filter((i: ChecklistItem) => i.completed).length;
                    const total = checklist.length;
                    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

                    return (
                        <div key={mockId} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-5 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-stone-800 dark:text-stone-100 text-lg">{mockTitles[mockId] || mockId}</h4>
                                    <p className="text-stone-500 text-xs">ID: {mockId}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-2xl font-bold ${percent === 100 ? 'text-emerald-600' : 'text-indigo-600'}`}>{percent}%</span>
                                    <p className="text-xs text-stone-400">Ready</p>
                                </div>
                            </div>

                            {/* Checklist Progress Bar */}
                            <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2.5 mb-4">
                                <div className="bg-indigo-600 h-2.5 rounded-full transition-all" style={{ width: `${percent}%` }}></div>
                            </div>

                            {/* Checklist Items Preview */}
                            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                {checklist.map((item: ChecklistItem) => (
                                    <div key={item.id} className="flex items-center gap-2 text-sm">
                                        <span className={item.completed ? "text-emerald-500" : "text-stone-300"}>
                                            {item.completed ? "✅" : "⬜"}
                                        </span>
                                        <span className={`${item.completed ? "text-stone-800 dark:text-stone-200 font-medium" : "text-stone-500 dark:text-stone-400"}`}>
                                            {item.task}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MockProgressViewer;
