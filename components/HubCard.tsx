
import React from 'react';

const HubCard: React.FC<{ 
    icon: React.ReactNode, 
    title: string, 
    description: string, 
    onClick: () => void, 
    shadowColor: string, 
    accentColor: string,
    actionText?: string
}> = ({ icon, title, description, onClick, shadowColor, accentColor, actionText = 'Get Started' }) => (
    <button onClick={onClick} className={`bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 text-left transform hover:-translate-y-2 flex flex-col items-start border border-stone-200/50 dark:border-stone-700 ${shadowColor}`}>
        <div className="mb-4 bg-stone-100 dark:bg-stone-800 p-4 rounded-2xl border border-stone-200 dark:border-stone-700">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">{title}</h3>
        <p className="text-stone-600 dark:text-stone-300 flex-grow text-sm leading-relaxed">{description}</p>
        <span className={`mt-6 font-semibold transition-colors text-sm ${accentColor}`}>{actionText} &rarr;</span>
    </button>
);

export default HubCard;
