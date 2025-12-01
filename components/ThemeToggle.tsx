
import React from 'react';
import { useTheme } from './ThemeContext';

interface ThemeToggleProps {
    className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        if (theme === 'system') {
            setTheme('light');
        } else if (theme === 'light') {
            setTheme('dark');
        } else {
            setTheme('system');
        }
    };

    const getIcon = () => {
        switch (theme) {
            case 'light': return '☀️';
            case 'dark': return '🌙';
            case 'system': return '🖥️';
            default: return '🖥️';
        }
    };

    const getLabel = () => {
        switch (theme) {
            case 'light': return 'Light';
            case 'dark': return 'Dark';
            case 'system': return 'Auto';
            default: return 'Auto';
        }
    };

    return (
        <button 
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-3 py-2 rounded-full bg-stone-200/50 dark:bg-stone-800/50 hover:bg-stone-300 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-600 transition-all duration-300 group ${className || ''}`}
            title="Click to change theme"
            aria-label="Toggle Theme"
        >
            <span className="text-lg leading-none filter drop-shadow-sm">{getIcon()}</span>
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300 hidden sm:inline-block uppercase tracking-wide min-w-[3ch] text-center">
                {getLabel()}
            </span>
        </button>
    );
};

export default ThemeToggle;
