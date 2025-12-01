
import React from 'react';
import { signInWithMicrosoft } from '../firebase';
import ThemeToggle from './ThemeToggle';

const LoginView: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-stone-100 dark:bg-stone-950 z-50 flex items-center justify-center p-4 transition-colors duration-300">
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>
            <div className="max-w-md w-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-800/50 rounded-3xl shadow-2xl p-8 text-center animate-fade-in">
                <span className="text-6xl">🌍</span>
                <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mt-4">Welcome to Geo Pro</h1>
                <p className="text-stone-600 dark:text-stone-400 mt-4">
                    Sign in with your Microsoft account to access your personalized dashboard and save your progress.
                </p>
                <button
                    onClick={signInWithMicrosoft}
                    className="w-full mt-6 py-3 bg-blue-600 text-white font-bold text-lg rounded-lg shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-3"
                >
                    <svg width="21" height="21" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1H10V10H1V1Z" fill="#F25022"/>
                        <path d="M11 1H20V10H11V1Z" fill="#7FBA00"/>
                        <path d="M1 11H10V20H1V11Z" fill="#00A4EF"/>
                        <path d="M11 11H20V20H11V11Z" fill="#FFB900"/>
                    </svg>
                    Sign in with Microsoft
                </button>
            </div>
             <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }`}</style>
        </div>
    );
};

export default LoginView;
