
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface SafeguardingAlert {
    id: string;
    uid: string;
    displayName?: string; // Added displayName
    message: string;
    timestamp: string;
    status: 'unresolved' | 'resolved';
    notes?: string;
}

const SafeguardingViewer: React.FC = () => {
    const [alerts, setAlerts] = useState<SafeguardingAlert[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const col = collection(db, 'safeguarding_alerts');
            const q = query(col, orderBy('timestamp', 'desc'), limit(50));
            const snap = await getDocs(q);

            // Map basic alert data
            const rawAlerts = snap.docs.map(d => ({ id: d.id, ...d.data() } as SafeguardingAlert));

            // Enrich with user display names
            const enrichedAlerts = await Promise.all(rawAlerts.map(async (alert) => {
                try {
                    const userDoc = await getDoc(doc(db, 'users', alert.uid));
                    if (userDoc.exists()) {
                        return { ...alert, displayName: userDoc.data().displayName || 'Unknown User' };
                    }
                } catch (e) {
                    console.error(`Failed to fetch user name for ${alert.uid}`, e);
                }
                return { ...alert, displayName: 'Unknown User' };
            }));

            setAlerts(enrichedAlerts);
        } catch (e) {
            console.error("Failed to fetch safeguarding alerts", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const handleResolve = async (id: string) => {
        if (!confirm("Mark this alert as resolved? Ensure you have followed safeguarding protocols.")) return;
        try {
            await updateDoc(doc(db, 'safeguarding_alerts', id), { status: 'resolved' });
            fetchAlerts();
        } catch (e) {
            console.error("Failed to resolve alert", e);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading safeguarding alerts...</div>;

    return (
        <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl p-8 max-w-4xl mx-auto h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-red-600 flex items-center gap-2">
                    <span>🚨</span> Safeguarding Alerts
                </h2>
                <button onClick={fetchAlerts} className="px-4 py-2 text-sm bg-stone-100 hover:bg-stone-200 rounded-lg transition">Refresh</button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                {alerts.length === 0 && (
                    <div className="text-center py-20 text-stone-500">
                        <span className="text-4xl">✅</span>
                        <p className="mt-4">No active safeguarding alerts found.</p>
                    </div>
                )}

                {alerts.map(alert => (
                    <div key={alert.id} className={`p-4 rounded-xl border-l-4 ${alert.status === 'unresolved' ? 'bg-red-50 border-red-500' : 'bg-stone-50 border-green-500 opacity-75'}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                                    {new Date(alert.timestamp).toLocaleString()}
                                </p>
                                <p className="text-sm font-semibold text-stone-800 dark:text-stone-700 mt-1">
                                    User: <span className="text-indigo-600">{alert.displayName}</span> <span className="text-stone-400 text-xs">({alert.uid})</span>
                                </p>
                                <p className="font-bold text-stone-800 mt-2 bg-white p-2 rounded border border-stone-200">"{alert.message}"</p>
                            </div>
                            {alert.status === 'unresolved' ? (
                                <button
                                    onClick={() => handleResolve(alert.id)}
                                    className="px-3 py-1 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50"
                                >
                                    Resolve
                                </button>
                            ) : (
                                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">Resolved</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SafeguardingViewer;
