
import React, { useState, useMemo } from 'react';
import { COMMAND_WORDS } from '../constants';
import { CommandWord, AuthUser } from '../types';
import HubLayout from './HubLayout';

interface CommandWordToolkitViewProps {
    user: AuthUser;
    onBack: () => void;
}

const CommandWordToolkitView: React.FC<CommandWordToolkitViewProps> = ({ user, onBack }) => {
    const level = user.level || 'A-Level';
    
    const filteredWords = useMemo(() => {
        return COMMAND_WORDS.filter(word => word.levels.includes(level));
    }, [level]);

    const [selectedWord, setSelectedWord] = useState<CommandWord | null>(filteredWords[0] || null);

    return (
        <HubLayout
            title="Command Word Toolkit"
            subtitle={`Master key command words for ${level} Accounting with definitions, action plans, and examples.`}
            gradient="bg-gradient-to-r from-amber-500 to-orange-600"
            onBack={onBack}
        >
            <main className="w-full max-w-7xl mx-auto">
                <div className="md:flex md:gap-8">
                    <aside className="md:w-1/4">
                        <h2 className="text-xl font-semibold mb-3 text-stone-700 dark:text-stone-200">Select a Word:</h2>
                        <ul className="space-y-2 h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                            {filteredWords.map((word, index) => (
                                <li key={`${word.word}-${index}`}>
                                    <button
                                        onClick={() => setSelectedWord(word)}
                                        className={`w-full text-left px-4 py-2.5 rounded-lg transition-all duration-200 font-semibold ${selectedWord?.word === word.word && selectedWord?.definition === word.definition ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white/80 dark:bg-stone-800 hover:bg-white dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'}`}
                                    >
                                        {word.word}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    <main className="md:w-3/4 mt-8 md:mt-0">
                        {selectedWord ? (
                            <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 p-8 rounded-3xl shadow-xl animate-fade-in">
                                <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600">{selectedWord.word}</h2>

                                <div className="mt-8">
                                    <h3 className="font-bold text-stone-800 dark:text-stone-100 text-xl">Definition</h3>
                                    <p className="mt-2 text-stone-600 dark:text-stone-300 text-base">{selectedWord.definition}</p>
                                </div>

                                <div className="mt-6">
                                    <h3 className="font-bold text-stone-800 dark:text-stone-100 text-xl">Required Action</h3>
                                    <p className="mt-2 text-stone-600 dark:text-stone-300 text-base">{selectedWord.requiredAction}</p>
                                </div>

                                <div className="mt-6">
                                    <h3 className="font-bold text-stone-800 dark:text-stone-100 text-xl">Assessment Objective (AO) Focus</h3>
                                    <p className="mt-2 text-stone-600 dark:text-stone-300 text-base">{selectedWord.aoFocus}</p>
                                </div>

                                <div className="mt-6">
                                    <h3 className="font-bold text-stone-800 dark:text-stone-100 text-xl">Top Tips</h3>
                                    <ul className="mt-3 space-y-3 text-stone-600 dark:text-stone-300">
                                        {selectedWord.tips.map((tip, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <span className="text-amber-500 mt-1">&#10003;</span>
                                                <span>{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-stone-500">Select a command word to view details.</div>
                        )}
                    </main>
                </div>
            </main>
            <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
        </HubLayout>
    );
};

export default CommandWordToolkitView;
