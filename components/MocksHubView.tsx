import React, { useEffect, useState } from 'react';
import { AuthUser, MockConfig } from '../types';
import { getMocks } from '../services/mockService';
import HubLayout from './HubLayout';
import HubCard from './HubCard';

interface MocksHubViewProps {
    user: AuthUser;
    onNavigate: (page: any, param?: any) => void;
}

const MocksHubView: React.FC<MocksHubViewProps> = ({ user, onNavigate }) => {
    const [mocks, setMocks] = useState<MockConfig[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMocks = async () => {
            try {
                const data = await getMocks();
                // Filter by active and matching level (or show all if no level set?)
                // User level filtering is good UX.
                const filtered = data.filter(m => m.isActive && (!user.level || m.level === user.level));
                setMocks(filtered);
            } catch (e) {
                console.error("Failed to load mocks", e);
            } finally {
                setLoading(false);
            }
        };
        fetchMocks();
    }, [user.level]);

    return (
        <HubLayout
            title="Mocks Central"
            subtitle="Prepare for your upcoming examinations."
            gradient="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-600"
            onBack={() => onNavigate('dashboard')}
        >
            <div className="w-full max-w-7xl mx-auto space-y-12">
                <section className="animate-fade-in">
                    <h2 className="text-2xl font-bold text-stone-700 dark:text-stone-200 mb-6 flex items-center gap-3">
                        <span className="text-3xl">📅</span> Upcoming Assessment Windows
                    </h2>

                    {loading ? (
                        <div className="text-center p-8 text-stone-500">Loading assessments...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {mocks.map(mock => (
                                <HubCard
                                    key={mock.id}
                                    icon={<span className="text-4xl">📝</span>}
                                    title={mock.title}
                                    description={`Revision schedule and topic tracker for ${mock.level}. ${mock.exams.length} exams scheduled.`}
                                    onClick={() => onNavigate('mock_detail', mock.id)}
                                    shadowColor="shadow-rose-500/20"
                                    accentColor="text-rose-600 hover:text-rose-700"
                                    actionText="Enter Mock Zone"
                                />
                            ))}

                            {mocks.length === 0 && (
                                <div className="col-span-full text-center p-8 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700">
                                    <p className="text-stone-500 dark:text-stone-400">No upcoming mocks scheduled for your level ({user.level}).</p>
                                </div>
                            )}

                            {/* Legacy/Future Placeholder if needed */}
                             <HubCard
                                icon={<span className="text-4xl">☀️</span>}
                                title="Summer 2026"
                                description="Official Examination revision materials. Coming soon."
                                onClick={() => {}}
                                shadowColor="shadow-stone-500/20"
                                accentColor="text-stone-400"
                                disabled={true}
                                actionText="Coming Soon"
                            />
                        </div>
                    )}
                </section>
            </div>
        </HubLayout>
    );
};

export default MocksHubView;
