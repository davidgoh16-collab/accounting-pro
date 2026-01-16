
import React from 'react';
import { AuthUser } from '../types';
import HubLayout from './HubLayout';
import HubCard from './HubCard';

interface MocksHubViewProps {
    user: AuthUser;
    onNavigate: (page: any) => void;
}

const MocksHubView: React.FC<MocksHubViewProps> = ({ user, onNavigate }) => {
    return (
        <HubLayout
            title="Mocks Central"
            subtitle="Prepare for your upcoming examinations."
            gradient="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-600"
            backAction={() => onNavigate('dashboard')}
        >
            <div className="w-full max-w-7xl mx-auto space-y-12">
                <section className="animate-fade-in">
                    <h2 className="text-2xl font-bold text-stone-700 dark:text-stone-200 mb-6 flex items-center gap-3">
                        <span className="text-3xl">📅</span> Upcoming Assessment Windows
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <HubCard
                            icon={<span className="text-4xl">❄️</span>}
                            title="February Mocks 2026"
                            description="Full revision schedules, topic checklists, and key resources for the Year 11 Feb Mocks."
                            onClick={() => onNavigate('feb_mocks')}
                            shadowColor="shadow-rose-500/20"
                            accentColor="text-rose-600 hover:text-rose-700"
                            actionText="Enter Mock Zone"
                        />
                        <HubCard
                            icon={<span className="text-4xl">☀️</span>}
                            title="Summer 2026"
                            description="Official GCSE Examination revision materials. Coming soon."
                            onClick={() => {}}
                            shadowColor="shadow-stone-500/20"
                            accentColor="text-stone-400"
                            disabled={true}
                            actionText="Coming Soon"
                        />
                    </div>
                </section>
            </div>
        </HubLayout>
    );
};

export default MocksHubView;
