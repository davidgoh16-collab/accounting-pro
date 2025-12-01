
import React from 'react';
import { UserLevel } from '../types';

interface LevelSelectorProps {
    onSelect: (level: UserLevel) => void;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({ onSelect }) => {
    return (
        <div className="fixed inset-0 bg-stone-900/90 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-stone-800 rounded-3xl shadow-2xl max-w-2xl w-full p-8 border border-stone-200 dark:border-stone-700 text-center">
                <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-2">Welcome to Geo Pro</h1>
                <p className="text-stone-600 dark:text-stone-400 mb-8 text-lg">Select your study level to personalize your experience.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button 
                        onClick={() => onSelect('GCSE')}
                        className="group relative overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-600 p-1 rounded-2xl shadow-lg hover:shadow-emerald-500/30 transition-all hover:-translate-y-1"
                    >
                        <div className="bg-white dark:bg-stone-900 h-full w-full rounded-xl p-6 flex flex-col items-center justify-center group-hover:bg-opacity-90 transition">
                            <span className="text-5xl mb-4">🏫</span>
                            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 group-hover:text-emerald-600 transition">GCSE</h2>
                            <p className="text-stone-500 dark:text-stone-400 mt-2 text-sm">Key Stage 4 (AQA 8035)</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => onSelect('A-Level')}
                        className="group relative overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-600 p-1 rounded-2xl shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-1"
                    >
                        <div className="bg-white dark:bg-stone-900 h-full w-full rounded-xl p-6 flex flex-col items-center justify-center group-hover:bg-opacity-90 transition">
                            <span className="text-5xl mb-4">🎓</span>
                            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 group-hover:text-indigo-600 transition">A-Level</h2>
                            <p className="text-stone-500 dark:text-stone-400 mt-2 text-sm">Key Stage 5 (AQA)</p>
                        </div>
                    </button>
                </div>
            </div>
            <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-out; } @keyframes fadeIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }`}</style>
        </div>
    );
};

export default LevelSelector;
