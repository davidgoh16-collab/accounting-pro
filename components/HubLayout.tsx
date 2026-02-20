
import React from 'react';

interface HubLayoutProps {
    title: string;
    subtitle: string;
    gradient: string;
    children: React.ReactNode;
    onBack?: () => void;
    onReplayTutorial?: () => void;
}

const HubLayout: React.FC<HubLayoutProps> = ({ title, subtitle, gradient, children, onBack, onReplayTutorial }) => {
    return (
        <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-transparent flex flex-col items-center justify-center selection:bg-green-200 dark:selection:bg-green-900 relative">
            {onBack && (
                <button 
                    onClick={onBack}
                    className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-stone-800/80 backdrop-blur-md border border-stone-200 dark:border-stone-700 rounded-full shadow-sm hover:bg-white dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 font-bold transition-all z-30"
                >
                    <span>&larr;</span> Back
                </button>
            )}

            {onReplayTutorial && (
                <button
                    onClick={onReplayTutorial}
                    className="absolute top-4 right-4 sm:top-8 sm:right-8 flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-stone-800/60 backdrop-blur-md border border-stone-200 dark:border-stone-700 rounded-full hover:bg-white dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 font-medium transition-all z-30 text-xs uppercase tracking-wider hover:shadow-sm"
                >
                    <span>↺</span> Replay Tour
                </button>
            )}

            <header className="text-center mb-12 mt-12 sm:mt-0">
                <h1 className={`text-5xl font-extrabold text-stone-800 dark:text-stone-100 bg-clip-text text-transparent ${gradient}`}>
                    {title}
                </h1>
                <p className="text-lg text-stone-600 dark:text-stone-300 mt-4 max-w-2xl font-medium">{subtitle}</p>
            </header>
            {children}
        </div>
    );
};

export default HubLayout;
