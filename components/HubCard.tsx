
import React from 'react';

const HubCard: React.FC<{ 
    icon: React.ReactNode, 
    title: string, 
    description: string, 
    onClick: () => void, 
    shadowColor: string, 
    accentColor: string,
    actionText?: string,
    disabled?: boolean
}> = ({ icon, title, description, onClick, shadowColor, accentColor, actionText = 'Get Started', disabled = false }) => (
    <button
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={`bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl text-left transform flex flex-col items-start border border-stone-200/50 dark:border-stone-700 h-full w-full
            ${disabled ? 'cursor-not-allowed grayscale' : `hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${shadowColor}`}
        `}
    >
        <div className={`mb-4 bg-stone-100 dark:bg-stone-800 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 ${disabled ? 'opacity-50' : ''}`}>
            {icon}
        </div>
        <h3 className={`text-xl font-bold mb-2 ${disabled ? 'text-stone-500 dark:text-stone-400' : 'text-stone-800 dark:text-stone-100'}`}>{title}</h3>
        <p className={`flex-grow text-sm leading-relaxed ${disabled ? 'text-stone-400 dark:text-stone-500' : 'text-stone-600 dark:text-stone-300'}`}>{description}</p>
        <span className={`mt-6 font-bold transition-colors text-sm ${disabled ? 'text-stone-300 dark:text-stone-600' : accentColor}`}>
            {disabled ? 'Currently Unavailable' : `${actionText} \u2192`}
        </span>
    </button>
);

export default HubCard;
