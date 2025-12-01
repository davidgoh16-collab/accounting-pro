
import React, { useState, useMemo } from 'react';
import { Page, FlashcardItem, AuthUser } from '../types';
import { CASE_STUDY_LOCATIONS } from '../case-study-database';
import { KEY_TERMS } from '../knowledge-database';
import HubLayout from './HubLayout';
import HubCard from './HubCard';

interface FlashcardQuizHubViewProps {
    onNavigate: (page: Page) => void;
    onStartQuiz: (deck: FlashcardItem[]) => void;
    user: AuthUser;
}

const SelectionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onStart: (mode: 'cases' | 'terms' | 'mixed', topic: string) => void;
    title: string;
    actionLabel: string;
    user: AuthUser;
}> = ({ isOpen, onClose, onStart, title, actionLabel, user }) => {
    const [mode, setMode] = useState<'cases' | 'terms' | 'mixed'>('mixed');
    const [selectedTopic, setSelectedTopic] = useState('All Topics');

    const topics = useMemo(() => {
        const level = user.level || 'A-Level';
        const caseTopics = new Set(CASE_STUDY_LOCATIONS.filter(c => c.levels.includes(level)).map(cs => cs.topic));
        const termTopics = new Set(KEY_TERMS.filter(k => k.levels.includes(level)).map(kt => kt.topic));
        return ['All Topics', ...Array.from(new Set([...caseTopics, ...termTopics]))].sort();
    }, [user.level]);

    if (!isOpen) return null;

    const handleStart = () => {
        onStart(mode, selectedTopic);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{title}</h2>
                
                <div className="mt-4">
                    <label className="font-semibold text-stone-700 dark:text-stone-300">Content Type</label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                        <button 
                            onClick={() => setMode('cases')} 
                            className={`py-2 px-1 rounded-lg text-sm font-semibold border ${mode === 'cases' ? 'bg-fuchsia-100 dark:bg-fuchsia-900/30 border-fuchsia-500 text-fuchsia-700 dark:text-fuchsia-300' : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'}`}
                        >
                            Case Studies
                        </button>
                        <button 
                            onClick={() => setMode('terms')} 
                            className={`py-2 px-1 rounded-lg text-sm font-semibold border ${mode === 'terms' ? 'bg-fuchsia-100 dark:bg-fuchsia-900/30 border-fuchsia-500 text-fuchsia-700 dark:text-fuchsia-300' : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'}`}
                        >
                            Key Terms
                        </button>
                        <button 
                            onClick={() => setMode('mixed')} 
                            className={`py-2 px-1 rounded-lg text-sm font-semibold border ${mode === 'mixed' ? 'bg-fuchsia-100 dark:bg-fuchsia-900/30 border-fuchsia-500 text-fuchsia-700 dark:text-fuchsia-300' : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'}`}
                        >
                            Mixed Deck
                        </button>
                    </div>
                </div>

                <div className="mt-4">
                    <label className="font-semibold text-stone-700 dark:text-stone-300">Topic Filter ({user.level})</label>
                    <select 
                        value={selectedTopic} 
                        onChange={e => setSelectedTopic(e.target.value)} 
                        className="w-full mt-2 p-3 border border-stone-300 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-fuchsia-500"
                    >
                        {topics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
                    </select>
                </div>

                <div className="mt-8 flex gap-4">
                    <button onClick={onClose} className="w-full py-3 bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold rounded-lg hover:bg-stone-300 dark:hover:bg-stone-600 transition">
                        Cancel
                    </button>
                    <button onClick={handleStart} className="w-full py-3 bg-fuchsia-500 text-white font-bold rounded-lg hover:bg-fuchsia-600 transition shadow-lg shadow-fuchsia-500/20">
                        {actionLabel}
                    </button>
                </div>
            </div>
            <style>{`.animate-fade-in { animation: fadeIn 0.2s ease-in-out; } @keyframes fadeIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }`}</style>
        </div>
    );
};


const FlashcardQuizHubView: React.FC<FlashcardQuizHubViewProps> = ({ onNavigate, onStartQuiz, user }) => {
    const [quizModalOpen, setQuizModalOpen] = useState(false);

    const prepareDeck = (mode: 'cases' | 'terms' | 'mixed', topic: string): FlashcardItem[] => {
        let items: FlashcardItem[] = [];
        const level = user.level || 'A-Level';
        
        if (mode === 'cases' || mode === 'mixed') {
            const relevantCases = CASE_STUDY_LOCATIONS
                .filter(c => c.levels.includes(level))
                .map(c => ({...c, type: 'case_study' as const}));
            items = [...items, ...relevantCases];
        }
        if (mode === 'terms' || mode === 'mixed') {
            const relevantTerms = KEY_TERMS.filter(k => k.levels.includes(level));
            items = [...items, ...relevantTerms];
        }

        if (topic !== 'All Topics') {
            items = items.filter(item => item.topic === topic);
        }
        
        return items;
    };

    const handleStartQuiz = (mode: 'cases' | 'terms' | 'mixed', topic: string) => {
        const deck = prepareDeck(mode, topic);
        onStartQuiz(deck);
    };

    return (
        <>
            <HubLayout
                title="Flashcard & Quiz Hub"
                subtitle={`Master ${user.level} definitions, core knowledge, and case studies.`}
                gradient="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500"
                onBack={() => onNavigate('dashboard')}
            >
                <main className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-5xl mx-auto">
                    <HubCard
                        icon={<span className="text-4xl">🗂️</span>}
                        title="Flashcard Deck"
                        description="Review Case Studies and Key Terms. Mark what you know and track your progress."
                        onClick={() => onNavigate('flashcards')} 
                        shadowColor="shadow-fuchsia-500/20"
                        accentColor="text-fuchsia-600 dark:text-fuchsia-400 hover:text-fuchsia-700 dark:hover:text-fuchsia-300"
                        actionText="Open Deck"
                    />
                    <HubCard
                        icon={<span className="text-4xl">✍️</span>}
                        title="Quiz Mode"
                        description="Generate a multiple-choice quiz. Test yourself on terms, locations, or a mix of both."
                        onClick={() => setQuizModalOpen(true)}
                        shadowColor="shadow-fuchsia-500/20"
                        accentColor="text-fuchsia-600 dark:text-fuchsia-400 hover:text-fuchsia-700 dark:hover:text-fuchsia-300"
                        actionText="Configure Quiz"
                    />
                </main>
            </HubLayout>
            
            <SelectionModal 
                isOpen={quizModalOpen}
                onClose={() => setQuizModalOpen(false)}
                onStart={handleStartQuiz}
                title="Configure Quiz"
                actionLabel="Start Quiz"
                user={user}
            />
        </>
    );
};

export default FlashcardQuizHubView;
