
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthUser } from '../types';

interface ActivityLogViewerProps {
    user: AuthUser;
}

interface ActivityLog {
    id: string;
    type: string;
    timestamp: string;
    [key: string]: any;
}

const ActivityLogViewer: React.FC<ActivityLogViewerProps> = ({ user }) => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const logsCol = collection(db, 'users', user.uid, 'activity_logs');
                const q = query(logsCol, orderBy('timestamp', 'desc'), limit(50));
                const snapshot = await getDocs(q);
                setLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ActivityLog)));
            } catch (e) {
                console.error("Failed to fetch activity logs", e);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [user.uid]);

    if (loading) return <div className="p-8 text-center text-stone-500">Loading activity logs...</div>;

    if (logs.length === 0) {
        return (
            <div className="p-8 text-center bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                <span className="text-4xl">📉</span>
                <p className="mt-2 text-stone-600 dark:text-stone-300 font-semibold">No recent activity recorded.</p>
                <p className="text-xs text-stone-400">Activity logging is enabled for new sessions.</p>
            </div>
        );
    }

    const getIcon = (type: string) => {
        if (type.includes('login')) return '🔑';
        if (type.includes('quiz')) return '📝';
        if (type.includes('flashcard')) return '🗂️';
        if (type.includes('video')) return '🎬';
        return '📌';
    };

    const formatType = (type: string) => {
        return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-4">Recent Activity Stream</h3>
            <div className="overflow-hidden rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 font-semibold">
                        <tr>
                            <th className="p-4 w-12"></th>
                            <th className="p-4">Event</th>
                            <th className="p-4">Details</th>
                            <th className="p-4 text-right">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                                <td className="p-4 text-xl">{getIcon(log.type)}</td>
                                <td className="p-4 font-bold text-stone-700 dark:text-stone-300">
                                    {formatType(log.type)}
                                </td>
                                <td className="p-4 text-stone-600 dark:text-stone-400">
                                    {Object.entries(log)
                                        .filter(([k]) => !['id', 'type', 'timestamp'].includes(k))
                                        .map(([k, v]) => (
                                            <span key={k} className="mr-3 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded text-xs">
                                                <span className="font-semibold opacity-70">{k}:</span> {String(v)}
                                            </span>
                                        ))
                                    }
                                </td>
                                <td className="p-4 text-right text-stone-400 text-xs whitespace-nowrap">
                                    {new Date(log.timestamp).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ActivityLogViewer;
