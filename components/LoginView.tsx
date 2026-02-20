
import React, { useState } from 'react';
import { signInWithMicrosoft, signInWithGoogle, signInWithEmail, signUpWithEmail } from '../firebase';
import ThemeToggle from './ThemeToggle';
import { User, Lock, ArrowLeft, Loader2 } from 'lucide-react';

const LoginView: React.FC = () => {
    const [isAlternateLogin, setIsAlternateLogin] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (isSignUp) {
                await signUpWithEmail(email, password);
            } else {
                await signInWithEmail(email, password);
            }
        } catch (err: any) {
            console.error(err);
            // Improve error messaging
            let msg = 'Authentication failed';
            if (err.code === 'auth/invalid-credential') msg = 'Invalid email or password.';
            if (err.code === 'auth/email-already-in-use') msg = 'Email already in use.';
            if (err.code === 'auth/weak-password') msg = 'Password should be at least 6 characters.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        setLoading(true);
        try {
            await signInWithGoogle();
        } catch (err: any) {
            console.error(err);
            setError('Google Sign-In failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-stone-100 dark:bg-stone-950 z-50 flex items-center justify-center p-4 transition-colors duration-300">
            {/* Top Left Icon to Toggle View */}
            <div className="absolute top-4 left-4 z-50">
                 <button
                    onClick={() => setIsAlternateLogin(!isAlternateLogin)}
                    className="p-2 bg-white/50 dark:bg-stone-800/50 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-stone-700 transition-all text-stone-600 dark:text-stone-300 shadow-sm"
                    title={isAlternateLogin ? "Back to Microsoft Login" : "More Login Options"}
                 >
                    {isAlternateLogin ? <ArrowLeft size={24} /> : <User size={24} />}
                 </button>
            </div>

            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            <div className="max-w-md w-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-800/50 rounded-3xl shadow-2xl p-8 text-center animate-fade-in relative overflow-hidden">

                {/* Main View (Microsoft) */}
                {!isAlternateLogin && (
                    <div className="animate-fade-in">
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
                )}

                {/* Alternate View (Email/Google) */}
                {isAlternateLogin && (
                    <div className="animate-fade-in">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-full">
                                <Lock className="text-stone-600 dark:text-stone-400" size={32} />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6">
                            {isSignUp ? 'Create Account' : 'Welcome Back'}
                        </h2>

                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            <div>
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-stone-100"
                                    required
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-stone-100"
                                    required
                                />
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm text-left bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-900/30">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-stone-800 dark:bg-stone-700 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-stone-900 dark:hover:bg-stone-600 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="animate-spin" size={20} />}
                                {isSignUp ? 'Sign Up' : 'Sign In'}
                            </button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-stone-300 dark:border-stone-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white/80 dark:bg-stone-900 text-stone-500 backdrop-blur-sm">Or continue with</span>
                            </div>
                        </div>

                        <button
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full py-3 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-bold border border-stone-300 dark:border-stone-700 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700 transition-all duration-300 flex items-center justify-center gap-3"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Google
                        </button>

                        <p className="mt-6 text-stone-600 dark:text-stone-400 text-sm">
                            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                            <button
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                            >
                                {isSignUp ? "Sign In" : "Sign Up"}
                            </button>
                        </p>
                    </div>
                )}
            </div>
             <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }`}</style>
        </div>
    );
};

export default LoginView;
