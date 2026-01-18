import React, { useEffect, useState } from 'react';
import { AuthUser, MockConfig } from '../types';
import { getMocks } from '../services/mockService';
import HubLayout from './HubLayout';
import HubCard from './HubCard';

interface MocksHubViewProps {
    user: AuthUser;
    yearGroup?: string;
    onNavigate: (page: any, param?: any) => void;
}

const MocksHubView: React.FC<MocksHubViewProps> = ({ user, yearGroup, onNavigate }) => {
    const [mocks, setMocks] = useState<MockConfig[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMocks = async () => {
            try {
                const data = await getMocks();
                // Filter by active, matching level AND matching year group
                const filtered = data.filter(m => {
                    const isActive = m.isActive;
                    const levelMatch = !user.level || m.level === user.level;

                    // Year Group Logic:
                    // If mock has NO yearGroups specified, assume it's global -> show it.
                    // If mock HAS yearGroups, user MUST have a yearGroup matching one of them.
                    // If user has NO yearGroup, maybe show nothing or assume something? Defaulting to show if no restrictions.
                    const mockYears = m.yearGroups || [];
                    const yearMatch = mockYears.length === 0 || (yearGroup && mockYears.includes(yearGroup));

                    return isActive && levelMatch && yearMatch;
                });
                setMocks(filtered);
            } catch (e) {
                console.error("Failed to load mocks", e);
            } finally {
                setLoading(false);
            }
        };
        fetchMocks();
    }, [user.level, yearGroup]);

    return (
        <HubLayout
            title="Exam Central"
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

                        </div>
                    )}
                </section>
            </div>
        </HubLayout>
    );
};

export default MocksHubView;
