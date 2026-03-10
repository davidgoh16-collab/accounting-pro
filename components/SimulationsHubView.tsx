import React, { useState } from 'react';
import { Page, AuthUser } from '../types';
import HubLayout from './HubLayout';
import HubCard from './HubCard';

interface SimulationsHubViewProps {
    onNavigate: (page: Page, param?: any) => void;
    user: AuthUser;
}

const SimulationsHubView: React.FC<SimulationsHubViewProps> = ({ onNavigate, user }) => {
    // Only show Ecosystem Balance for GCSE (or all if we want, but let's stick to GCSE as requested)
    // The user requested it specifically for GCSE Living World.
    // I'll show it for all levels but maybe mark it as GCSE, or only show if level is GCSE. Let's only show if GCSE/IGCSE for now, or just show it globally. The prompt said "The first one is for GCSE living world and is an Ecosystem balance simulator".

    // I will show it globally but add a tag indicating it's for GCSE Living World, or just filter it. Let's filter it by level to be strict, or just show it. Let's show it if level is GCSE or IGCSE.
    const isGcseLevel = user.level === 'GCSE' || user.level === 'IGCSE';

    return (
        <HubLayout
            title="Simulations Hub"
            subtitle="Explore interactive simulations to deepen your understanding of complex geographical systems."
            gradient="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
            onBack={() => onNavigate('dashboard')}
        >
            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
                {isGcseLevel ? (
                    <HubCard
                        icon={<span className="text-4xl">🌿</span>}
                        title="Ecosystem Balance"
                        description="Visualise how physical forces, human intervention, and species removal disturb food webs."
                        onClick={() => onNavigate('simulation_view', 'ecosystem_balance')}
                        shadowColor="shadow-emerald-500/20"
                        accentColor="text-emerald-600 hover:text-emerald-700"
                        actionText="Start Simulation"
                    />
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-stone-200">
                        <span className="text-6xl mb-4">🌍</span>
                        <h3 className="text-2xl font-bold text-stone-800 mb-2">More Simulations Coming Soon</h3>
                        <p className="text-stone-600 text-center max-w-lg">
                            We're currently building interactive simulations for {user.level || 'your'} level. Check back later for updates!
                        </p>
                    </div>
                )}
            </main>
        </HubLayout>
    );
};

export default SimulationsHubView;