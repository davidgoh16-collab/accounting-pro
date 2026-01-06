
import React, { useState, useEffect, useMemo } from 'react';
import { AuthUser, CourseLesson, LessonProgress } from '../types';
import { COURSE_LESSONS, GCSE_UNITS, AQA_UNITS } from '../constants';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import HubLayout from './HubLayout';
import ActiveLessonView from './ActiveLessonView';

interface LearningHubViewProps {
    user: AuthUser;
    onBack: () => void;
}

const TopicCard: React.FC<{
    topic: string;
    lessons: CourseLesson[];
    progress: Record<string, LessonProgress>;
    onSelectLesson: (lesson: CourseLesson) => void;
    isExpanded: boolean;
    onToggle: () => void;
}> = ({ topic, lessons, progress, onSelectLesson, isExpanded, onToggle }) => {
    
    const completedCount = lessons.filter(l => progress[l.id]?.completed).length;
    const progressPercent = (completedCount / lessons.length) * 100;
    
    // Sort lessons by ID logic
    const sortedLessons = [...lessons].sort((a, b) => {
        // Handle numeric sorting for strings like "1.1", "1.10" or "G-Ch1", "G-Ch2"
        const numA = parseFloat(a.id.replace(/[^\d.]/g, ''));
        const numB = parseFloat(b.id.replace(/[^\d.]/g, ''));
        return numA - numB;
    });

    return (
        <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700 overflow-hidden mb-6 transition-all duration-300">
            <div 
                className="p-6 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                onClick={onToggle}
            >
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">{topic}</h3>
                    <span className="text-2xl text-stone-400 transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                </div>
                
                <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2.5 mt-2">
                    <div className="bg-indigo-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 font-semibold text-right">
                    {completedCount} / {lessons.length} Lessons Mastered
                </p>
            </div>

            {isExpanded && (
                <div className="border-t border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900/50 p-4 sm:p-6 space-y-4 animate-fade-in">
                    {sortedLessons.map((lesson, index) => {
                        const lessonProg = progress[lesson.id];
                        const isCompleted = lessonProg?.completed;
                        const hasStarted = !!lessonProg; 
                        
                        const previousLesson = index > 0 ? sortedLessons[index - 1] : null;
                        const isLocked = previousLesson ? !progress[previousLesson.id]?.completed : false;
                        
                        // Icon Logic: Strictly remove all non-numeric characters except dots. 
                        // "G-Ch6" -> "6", "1.1" -> "1.1"
                        const displayId = lesson.id.replace(/[^0-9.]/g, '');

                        return (
                            <button
                                key={lesson.id}
                                onClick={() => !isLocked && onSelectLesson(lesson)}
                                disabled={isLocked}
                                className={`w-full text-left p-4 rounded-xl border flex items-center justify-between group transition-all duration-200
                                    ${isCompleted 
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:shadow-md' 
                                        : isLocked 
                                            ? 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 opacity-70 cursor-not-allowed' 
                                            : hasStarted
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:shadow-md'
                                                : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 flex-shrink-0
                                        ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : hasStarted ? 'bg-blue-500 border-blue-500 text-white' : isLocked ? 'bg-stone-200 border-stone-300 text-stone-500' : 'bg-white border-indigo-500 text-indigo-600'}
                                    `}>
                                        {isCompleted ? '✓' : hasStarted ? '▶' : displayId}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold ${isLocked ? 'text-stone-500' : 'text-stone-800 dark:text-stone-200'}`}>{lesson.title}</h4>
                                        {hasStarted && !isCompleted && <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">In Progress {lessonProg.score > 0 ? `• High Score: ${lessonProg.score.toFixed(0)}%` : ''}</p>}
                                        {isCompleted && <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Mastered • Score: {lessonProg.score.toFixed(0)}%</p>}
                                    </div>
                                </div>
                                
                                {isLocked ? (
                                    <span className="text-2xl text-stone-300">🔒</span>
                                ) : (
                                    <span className={`text-2xl transition-transform group-hover:translate-x-1 ${isCompleted ? 'text-emerald-500' : 'text-indigo-500'}`}>&rarr;</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const LearningHubView: React.FC<LearningHubViewProps> = ({ user, onBack }) => {
    const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);
    const [progressData, setProgressData] = useState<Record<string, Record<string, LessonProgress>>>({});
    const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const syllabusUnits = useMemo(() => {
        if (user.level === 'GCSE') return GCSE_UNITS;
        return AQA_UNITS; 
    }, [user.level]);
    
    const lessonsByTopic = useMemo(() => {
        const groups: Record<string, CourseLesson[]> = {};
        syllabusUnits.filter(u => u !== 'All Units').forEach(unit => {
            groups[unit] = [];
        });
        COURSE_LESSONS.forEach(lesson => {
            if (groups[lesson.chapter]) {
                groups[lesson.chapter].push(lesson);
            }
        });
        return groups;
    }, [syllabusUnits]);

    const fetchProgress = async () => {
        setLoading(true);
        try {
            const newProgress: Record<string, Record<string, LessonProgress>> = {};
            await Promise.all(Object.keys(lessonsByTopic).map(async (topic) => {
                const docRef = doc(db, 'users', user.uid, 'learning_progress', topic);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    newProgress[topic] = docSnap.data() as Record<string, LessonProgress>;
                } else {
                    newProgress[topic] = {};
                }
            }));
            setProgressData(newProgress);
        } catch (error) {
            console.error("Error fetching progress:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProgress();
    }, [user]);

    const handleLessonComplete = async (score: number) => {
        await fetchProgress();
        setActiveLesson(null);
    };

    const hasLessons = Object.values(lessonsByTopic).some((arr: CourseLesson[]) => arr.length > 0);

    if (activeLesson) {
        return (
            <ActiveLessonView 
                lesson={activeLesson} 
                user={user} 
                initialProgress={progressData[activeLesson.chapter]?.[activeLesson.id]}
                onComplete={handleLessonComplete}
                onBack={() => setActiveLesson(null)}
            />
        );
    }

    return (
        <HubLayout
            title="Learning Academy"
            subtitle={`Your personal AI tutor for ${user.level || 'Geography'}. Master content lesson by lesson.`}
            gradient="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600"
            onBack={onBack}
        >
            <div className="w-full max-w-4xl mx-auto mt-8 pb-20">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-stone-500">Loading your progress...</p>
                    </div>
                ) : !hasLessons ? (
                    <div className="text-center py-20 bg-stone-50 dark:bg-stone-900 rounded-3xl border border-dashed border-stone-300 dark:border-stone-700">
                        <span className="text-6xl">📭</span>
                        <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mt-4">No Lessons Found</h3>
                        <p className="text-stone-500 mt-2">There appear to be no lessons loaded for your level ({user.level}).</p>
                        <p className="text-xs text-stone-400 mt-2">Try switching levels in the dashboard.</p>
                    </div>
                ) : (
                    Object.keys(lessonsByTopic).map(topic => {
                        const lessons = lessonsByTopic[topic];
                        if (lessons.length === 0) return null; 

                        return (
                            <TopicCard 
                                key={topic}
                                topic={topic}
                                lessons={lessons}
                                progress={progressData[topic] || {}}
                                onSelectLesson={setActiveLesson}
                                isExpanded={expandedTopic === topic}
                                onToggle={() => setExpandedTopic(expandedTopic === topic ? null : topic)}
                            />
                        );
                    })
                )}
            </div>
            <style>{`.animate-fade-in { animation: fadeIn 0.3s ease-out; } @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </HubLayout>
    );
};

export default LearningHubView;
