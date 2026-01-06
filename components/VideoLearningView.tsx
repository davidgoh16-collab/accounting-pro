
import React, { useState, useEffect, useMemo } from 'react';
import { AuthUser, VideoResource, VideoQuizContent } from '../types';
import { VIDEO_LIBRARY } from '../constants';
import { generateVideoQuestions } from '../services/geminiService';
import HubLayout from './HubLayout';

interface VideoLearningViewProps {
    user: AuthUser;
    onBack: () => void;
}

const VideoLearningView: React.FC<VideoLearningViewProps> = ({ user, onBack }) => {
    const [selectedVideo, setSelectedVideo] = useState<VideoResource | null>(null);
    const [quizContent, setQuizContent] = useState<VideoQuizContent | null>(null);
    const [loadingQuiz, setLoadingQuiz] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({}); // Index -> Answer
    const [openEndedRevealed, setOpenEndedRevealed] = useState<Record<number, boolean>>({});
    const [searchTerm, setSearchTerm] = useState('');

    const filteredVideos = useMemo(() => {
        return VIDEO_LIBRARY.filter(v => 
            v.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (v.level === user.level || !v.level) // Filter by level or show if no level specified
        );
    }, [searchTerm, user.level]);

    useEffect(() => {
        let isMounted = true;
        if (selectedVideo) {
            setLoadingQuiz(true);
            setQuizContent(null);
            setQuizAnswers({});
            setOpenEndedRevealed({});
            
            generateVideoQuestions(selectedVideo.title, user.level || 'A-Level')
                .then(content => {
                    if (isMounted) setQuizContent(content);
                })
                .catch(err => {
                    console.error("Failed to generate quiz", err);
                    if (isMounted) setQuizContent(null);
                })
                .finally(() => {
                    if (isMounted) setLoadingQuiz(false);
                });
        }
        return () => { isMounted = false; };
    }, [selectedVideo, user.level]);

    const handleAnswerSelect = (qIndex: number, option: string) => {
        setQuizAnswers(prev => ({ ...prev, [qIndex]: option }));
    };

    const toggleOpenEnded = (qIndex: number) => {
        setOpenEndedRevealed(prev => ({ ...prev, [qIndex]: !prev[qIndex] }));
    };

    return (
        <HubLayout 
            title="Video Learning" 
            subtitle={`Curated video library for ${user.level} Geography with AI-powered interactive quizzes.`}
            gradient="bg-gradient-to-r from-red-600 to-rose-600"
            onBack={onBack}
        >
            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 h-[85vh]">
                {/* Left Sidebar: Video List */}
                <div className="lg:col-span-1 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50">
                        <input 
                            type="text" 
                            placeholder="Search videos..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none dark:text-white"
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                        {filteredVideos.map(video => (
                            <button
                                key={video.id}
                                onClick={() => setSelectedVideo(video)}
                                className={`w-full text-left p-3 rounded-xl transition-all border flex gap-3 ${selectedVideo?.id === video.id ? 'bg-red-50 dark:bg-red-900/20 border-red-500 ring-1 ring-red-500 shadow-md' : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'}`}
                            >
                                <div className="relative w-24 h-16 flex-shrink-0 bg-black rounded-lg overflow-hidden">
                                    <img src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold line-clamp-2 ${selectedVideo?.id === video.id ? 'text-red-700 dark:text-red-300' : 'text-stone-700 dark:text-stone-300'}`}>{video.title}</p>
                                    <span className="text-[10px] uppercase font-bold text-stone-400 mt-1 block">A-Level</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Content: Player & Quiz */}
                <div className="lg:col-span-2 flex flex-col gap-6 overflow-y-auto custom-scrollbar relative pb-20">
                    {selectedVideo ? (
                        <>
                            {/* Video Player - Sticky */}
                            <div className="sticky top-0 z-30 w-full aspect-video bg-black rounded-3xl shadow-2xl overflow-hidden border-4 border-stone-200 dark:border-stone-700 flex-shrink-0">
                                <iframe 
                                    width="100%" 
                                    height="100%" 
                                    src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&rel=0`} 
                                    title={selectedVideo.title}
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            </div>

                            {/* Interactive Session */}
                            <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl p-6 relative z-20">
                                <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4 flex items-center gap-2">
                                    <span>🧠</span> Interactive Session
                                </h2>
                                
                                {loadingQuiz ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-stone-500 dark:text-stone-400 mt-4 font-semibold">Generating questions based on this video...</p>
                                    </div>
                                ) : quizContent ? (
                                    <div className="space-y-8 animate-fade-in">
                                        {/* Multiple Choice Section */}
                                        <div className="space-y-6">
                                            <h3 className="font-bold text-lg text-red-600 dark:text-red-400 border-b border-red-200 dark:border-red-800 pb-2">Check Your Understanding</h3>
                                            {quizContent.multipleChoice && quizContent.multipleChoice.length > 0 ? (
                                                quizContent.multipleChoice.map((mcq, idx) => {
                                                    const selected = quizAnswers[idx];
                                                    const isCorrect = selected === mcq.correctAnswer;
                                                    const hasAnswered = !!selected;

                                                    return (
                                                        <div key={idx} className="bg-stone-50 dark:bg-stone-800 p-4 rounded-xl border border-stone-200 dark:border-stone-700">
                                                            <p className="font-bold text-stone-800 dark:text-stone-200 mb-3">{idx + 1}. {mcq.question}</p>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                {mcq.options && mcq.options.map(opt => (
                                                                    <button
                                                                        key={opt}
                                                                        onClick={() => !hasAnswered && handleAnswerSelect(idx, opt)}
                                                                        disabled={hasAnswered}
                                                                        className={`px-4 py-3 rounded-lg text-sm font-semibold text-left transition-all ${
                                                                            hasAnswered
                                                                                ? opt === mcq.correctAnswer
                                                                                    ? 'bg-emerald-500 text-white'
                                                                                    : opt === selected
                                                                                        ? 'bg-red-500 text-white'
                                                                                        : 'bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400 opacity-50'
                                                                                : 'bg-white dark:bg-stone-700 hover:bg-red-50 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-600'
                                                                        }`}
                                                                    >
                                                                        {opt}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                            {hasAnswered && (
                                                                <div className={`mt-3 p-3 rounded-lg text-sm ${isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'}`}>
                                                                    <p className="font-bold">{isCorrect ? 'Correct!' : 'Incorrect'}</p>
                                                                    <p>{mcq.explanation}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <p className="text-stone-500 italic">No multiple choice questions available.</p>
                                            )}
                                        </div>

                                        {/* Open Ended Section */}
                                        <div className="space-y-6">
                                            <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-400 border-b border-indigo-200 dark:border-indigo-800 pb-2">Deep Dive & Discussion</h3>
                                            {quizContent.openEnded && quizContent.openEnded.length > 0 ? (
                                                quizContent.openEnded.map((q, idx) => (
                                                    <div key={idx} className="bg-stone-50 dark:bg-stone-800 p-4 rounded-xl border border-stone-200 dark:border-stone-700">
                                                        <p className="font-bold text-stone-800 dark:text-stone-200 mb-3">Q: {q.question}</p>
                                                        <textarea 
                                                            placeholder="Type your thoughts here before revealing the model answer..."
                                                            className="w-full p-3 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-sm mb-3 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                                            rows={3}
                                                        />
                                                        <button 
                                                            onClick={() => toggleOpenEnded(idx)}
                                                            className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline flex items-center gap-1"
                                                        >
                                                            {openEndedRevealed[idx] ? 'Hide Model Answer' : 'Reveal Model Answer'}
                                                        </button>
                                                        {openEndedRevealed[idx] && (
                                                            <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg text-stone-700 dark:text-stone-300 text-sm animate-fade-in">
                                                                <span className="font-bold block mb-1">Model Answer:</span>
                                                                {q.sampleAnswer}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-stone-500 italic">No open ended questions available.</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-stone-500">
                                        <p>Unable to load quiz content.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-stone-50 dark:bg-stone-800/50 rounded-3xl border border-dashed border-stone-300 dark:border-stone-700">
                            <span className="text-6xl mb-4 grayscale opacity-50">🎬</span>
                            <h3 className="text-2xl font-bold text-stone-600 dark:text-stone-400">Select a video to begin</h3>
                            <p className="text-stone-500 mt-2">Choose from the curated list on the left to start watching and learning.</p>
                        </div>
                    )}
                </div>
            </div>
            <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
        </HubLayout>
    );
};

export default VideoLearningView;
