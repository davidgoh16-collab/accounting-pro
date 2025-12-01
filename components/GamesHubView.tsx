
import React, { useState, useMemo } from 'react';
import { Page, AuthUser } from '../types';
import { CASE_STUDY_LOCATIONS } from '../case-study-database';
import { GAME_QUESTIONS } from '../game-database';
import HubLayout from './HubLayout';
import HubCard from './HubCard';

interface GamesHubViewProps {
    onNavigate: (page: Page) => void;
    onStartGame: (page: Page, topic: string) => void;
    user: AuthUser;
}

const TopicSelectionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onStart: (topic: string) => void;
    gameTitle: string;
    user: AuthUser;
}> = ({ isOpen, onClose, onStart, gameTitle, user }) => {
    const [selectedTopic, setSelectedTopic] = useState('All Topics');
    
    const topics = useMemo(() => {
        const level = user.level || 'A-Level';
        const gameTopics = new Set(GAME_QUESTIONS.filter(q => q.levels.includes(level)).map(q => q.topic));
        const caseStudyTopics = new Set(CASE_STUDY_LOCATIONS.filter(c => c.levels.includes(level)).map(cs => cs.topic));
        const allTopics = new Set(['All Topics', ...gameTopics, ...caseStudyTopics]);
        return Array.from(allTopics).sort();
    }, [user.level]);

    if (!isOpen) return null;

    const handleStart = () => {
        onStart(selectedTopic);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-stone-800">Select a Topic for {gameTitle}</h2>
                <p className="text-stone-600 mt-2 mb-4">Choose a topic to focus on, or select 'All Topics' for a mixed challenge.</p>
                
                <label htmlFor="topic-select" className="font-semibold text-stone-700">Topic ({user.level})</label>
                <select 
                    id="topic-select"
                    value={selectedTopic} 
                    onChange={e => setSelectedTopic(e.target.value)} 
                    className="w-full mt-2 p-3 border border-stone-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500"
                >
                    {topics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
                </select>

                <div className="mt-6 flex gap-4">
                    <button onClick={onClose} className="w-full py-3 bg-stone-200 text-stone-800 font-bold rounded-lg hover:bg-stone-300 transition">
                        Cancel
                    </button>
                    <button onClick={handleStart} className="w-full py-3 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600 transition">
                        Start Game
                    </button>
                </div>
            </div>
            <style>{`.animate-fade-in { animation: fadeIn 0.2s ease-in-out; } @keyframes fadeIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }`}</style>
        </div>
    );
};

const GamesHubView: React.FC<GamesHubViewProps> = ({ onNavigate, onStartGame, user }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedGame, setSelectedGame] = useState<{ page: Page, title: string } | null>(null);

    const handleOpenModal = (page: Page, title: string) => {
        setSelectedGame({ page, title });
        setModalOpen(true);
    };

    const handleStart = (topic: string) => {
        if (selectedGame) {
            onStartGame(selectedGame.page, topic);
        }
    };

    return (
        <>
            <HubLayout
                title="Game Zone"
                subtitle="Choose a game to test your geography skills in a fun and interactive way."
                gradient="bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500"
                onBack={() => onNavigate('dashboard')}
            >
                <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
                    <HubCard
                        icon={<span className="text-4xl">🐦</span>}
                        title="Flappy Geo"
                        description="Keep the globe afloat, dodge the pipes, and answer questions when you collide."
                        onClick={() => handleOpenModal('flappy_geo', 'Flappy Geo')}
                        shadowColor="shadow-teal-500/20"
                        accentColor="text-teal-600 hover:text-teal-700"
                        actionText="Play Now"
                    />
                    <HubCard
                        icon={<span className="text-4xl">🧱</span>}
                        title="Block Blast"
                        description="A strategic puzzle game. Drag and drop blocks to clear lines and score points. Answer questions to keep playing!"
                        onClick={() => handleOpenModal('block_blast', 'Block Blast')}
                        shadowColor="shadow-rose-500/20"
                        accentColor="text-rose-600 hover:text-rose-700"
                        actionText="Play Now"
                    />
                    <HubCard
                        icon={<span className="text-4xl">↔️</span>}
                        title="Geo Swipe"
                        description="A rapid-fire quiz. Swipe right for true, left for false on unique statements and images."
                        onClick={() => handleOpenModal('swipe_quiz', 'Geo Swipe')}
                        shadowColor="shadow-fuchsia-500/20"
                        accentColor="text-fuchsia-600 hover:text-fuchsia-700"
                        actionText="Play Now"
                    />
                    <div className="lg:col-span-3">
                        <HubCard
                            icon={<span className="text-4xl">📊</span>}
                            title="Game Analysis"
                            description="Review your performance across all games, see topic strengths, and practice questions you got wrong."
                            onClick={() => onNavigate('game_analysis')}
                            shadowColor="shadow-green-500/20"
                            accentColor="text-green-600 hover:text-green-700"
                            actionText="Analyze"
                        />
                    </div>
                </main>
            </HubLayout>
            <TopicSelectionModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onStart={handleStart}
                gameTitle={selectedGame?.title || ''}
                user={user}
            />
        </>
    );
};

export default GamesHubView;
