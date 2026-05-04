
import React from 'react';
import { User } from 'firebase/auth';
import { signOutUser } from '../firebase';
import { Page, AuthUser, UserLevel } from '../types';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
    user: User | AuthUser;
    onNavigate: (page: Page) => void;
    isAdmin: boolean;
    onSwitchLevel: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onNavigate, isAdmin, onSwitchLevel }) => {
    const level = (user as AuthUser).level || 'A-Level';

    return (
        <header className="bg-white/50 dark:bg-stone-900/80 backdrop-blur-sm border-b border-stone-200/50 dark:border-stone-700 sticky top-0 z-40 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="flex justify-between items-center h-16">
                    <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 text-2xl font-bold text-stone-800 dark:text-stone-100">
                        <span className="text-3xl">🧮</span>
                        <span>Accounting Pro</span>
                    </button>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onSwitchLevel}
                            className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700 transition"
                            title="Switch Level"
                        >
                            {level}
                        </button>

                        <ThemeToggle />

                        {isAdmin && (
                            <button 
                                onClick={() => onNavigate('admin')}
                                className="px-4 py-2 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition-colors text-sm"
                            >
                                Admin
                            </button>
                        )}
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-stone-700 dark:text-stone-200">{user.displayName}</p>
                            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">{user.email}</p>
                        </div>
                        <button 
                            onClick={signOutUser}
                            className="px-4 py-2 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-colors text-sm shadow-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
