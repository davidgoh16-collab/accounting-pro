
import React, { useState, useEffect } from 'react';
import { GameSessionResult, MultipleChoiceQuestion, SwipeQuizItem, AuthUser } from '../types';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import HubLayout from './HubLayout';

interface TopicStats {
    correct: number;
    total: number;
}

// Type guard to check if a question is a MultipleChoiceQuestion
function isMultipleChoice(question: MultipleChoiceQuestion | SwipeQuizItem): question is MultipleChoiceQuestion {
    return (question as MultipleChoiceQuestion).options !== undefined;
}

interface GameAnalysisViewProps {
    user: AuthUser;
    onBack: () => void;
}

const GameAnalysisView: React.FC<GameAnalysisViewProps> = ({ user, onBack }) => {
    const [gameResults, setGameResults] = useState<GameSessionResult[]>([]);
    const [flappyAccHighScore, setFlappyAccHighScore] = useState<number>(0);
    const [blockBlastHighScore, setBlockBlastHighScore] = useState<number>(0);
    const [swipeHighScore, setSwipeHighScore] = useState<number>(0);
    const [topicStats, setTopicStats] = useState<Record<string, TopicStats>>({});
    const [incorrectQuestions, setIncorrectQuestions] = useState<(MultipleChoiceQuestion | SwipeQuizItem)[]>([]);

    useEffect(() => {
        if (!user) return;

        const fetchGameData = async () => {
            try {
                const resultsRef = collection(db, 'users', user.uid, 'game_results');
                const q = query(resultsRef, orderBy('timestamp', 'desc'));
                const querySnapshot = await getDocs(q);
                const results = querySnapshot.docs.map(doc => doc.data() as GameSessionResult);
                setGameResults(results);

                // Process stats
                const stats: Record<string, TopicStats> = {};
                const incorrect: (MultipleChoiceQuestion | SwipeQuizItem)[] = [];
                
                results.forEach(result => {
                    const topic = result.question.topic;
                    if (!stats[topic]) {
                        stats[topic] = { correct: 0, total: 0 };
                    }
                    stats[topic].total++;
                    if (result.wasCorrect) {
                        stats[topic].correct++;
                    } else {
                        incorrect.push(result.question);
                    }
                });

                setTopicStats(stats);
                setIncorrectQuestions(incorrect); // Already reversed from query

            } catch (error) {
                console.error("Error loading game analysis data from Firestore:", error);
            }
        };

        fetchGameData();

        // High scores are still simple, so we can keep them in localStorage for now
        const flappyHs = localStorage.getItem('acc-pro-flappy-highscore');
        setFlappyAccHighScore(flappyHs ? JSON.parse(flappyHs) : 0);
        
        const blastHs = localStorage.getItem('acc-pro-blast-highscore');
        setBlockBlastHighScore(blastHs ? JSON.parse(blastHs) : 0);
        
        const swipeHs = localStorage.getItem('acc-pro-swipe-highscore');
        setSwipeHighScore(swipeHs ? JSON.parse(swipeHs) : 0);

    }, [user]);

    const totalQuestions = gameResults.length;
    const correctAnswers = gameResults.filter(r => r.wasCorrect).length;
    const overallAccuracy = totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(0) : '0';

    return (
        <HubLayout
            title="Game Performance Analysis"
            subtitle="Review your game stats to pinpoint strengths and areas for improvement."
            gradient="bg-gradient-to-r from-sky-500 to-blue-600"
            onBack={onBack}
        >
            <main className="w-full max-w-7xl mx-auto">
                {totalQuestions === 0 && flappyAccHighScore === 0 && blockBlastHighScore === 0 && swipeHighScore === 0 ? (
                     <div className="text-center py-20 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl">
                        <span className="text-7xl">📊</span>
                        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mt-4">No Data Yet</h2>
                        <p className="text-stone-500 dark:text-stone-400 mt-2">Play some games to start tracking your performance!</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Overall Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <StatCard title="Flappy Accounts High Score" value={flappyAccHighScore.toString()} />
                            <StatCard title="Block Blast High Score" value={blockBlastHighScore.toString()} />
                            <StatCard title="Account Swipe High Score" value={swipeHighScore.toString()} />
                            <StatCard title="Total Questions Answered" value={totalQuestions.toString()} />
                            <StatCard title="Overall Accuracy" value={`${overallAccuracy}%`} />
                        </div>

                        {/* Topic Breakdown */}
                        <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl p-6 sm:p-8">
                            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6">Performance by Topic</h2>
                            <div className="space-y-4">
                                {Object.keys(topicStats).sort((a, b) => a.localeCompare(b)).map((topic) => {
                                    const stats = topicStats[topic];
                                    const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
                                    return <TopicPerformanceBar key={topic} topic={topic} accuracy={accuracy} correct={stats.correct} total={stats.total} />;
                                })}
                            </div>
                        </div>

                        {/* Incorrect Questions */}
                        {incorrectQuestions.length > 0 && (
                             <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl p-6 sm:p-8">
                                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6">Questions for Review</h2>
                                <div className="space-y-4">
                                    {incorrectQuestions.map((q, index) => (
                                        <div key={`${q.id}-${index}`} className="bg-red-50/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                            {isMultipleChoice(q) ? (
                                                <MultipleChoiceReviewCard question={q} />
                                            ) : (
                                                <SwipeQuizReviewCard question={q} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </HubLayout>
    );
};

const MultipleChoiceReviewCard: React.FC<{ question: MultipleChoiceQuestion }> = ({ question }) => (
    <>
        <p className="font-semibold text-stone-800 dark:text-stone-200">{question.question}</p>
        <div className="mt-3 text-sm space-y-2">
            {question.options.map(opt => (
                <div key={opt} className={`flex items-center gap-2 pl-2 border-l-4 ${opt === question.correctAnswer ? 'border-emerald-400' : 'border-red-400'}`}>
                    {opt === question.correctAnswer ? <span className="flex-shrink-0">✅</span> : <span className="flex-shrink-0">❌</span>}
                    <span className={`${opt === question.correctAnswer ? 'text-emerald-800 dark:text-emerald-400 font-semibold' : 'text-stone-600 dark:text-stone-400'}`}>{opt}</span>
                </div>
            ))}
        </div>
    </>
);

const SwipeQuizReviewCard: React.FC<{ question: SwipeQuizItem }> = ({ question }) => (
    <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-shrink-0 w-full sm:w-32 h-32">
            <img src={question.imageUrl} alt={question.caseStudyName} className="w-full h-full object-cover rounded-md" />
        </div>
        <div className="flex-grow">
            <p className="font-semibold text-stone-800 dark:text-stone-200">{question.statement}</p>
            <div className="mt-3 text-sm">
                <p className="font-bold text-stone-600 dark:text-stone-400">Correct Answer:</p>
                <div className="flex items-center gap-2 pl-2 border-l-4 border-emerald-400 mt-1">
                    <span className="flex-shrink-0">✅</span>
                    <span className="text-emerald-800 dark:text-emerald-400 font-semibold">{question.correctAnswer ? 'True' : 'False'}</span>
                </div>
            </div>
        </div>
    </div>
);

const StatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700">
        <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">{title}</p>
        <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-2">{value}</p>
    </div>
);

const TopicPerformanceBar: React.FC<{ topic: string; accuracy: number; correct: number, total: number }> = ({ topic, accuracy, correct, total }) => {
    const color = accuracy >= 75 ? 'bg-emerald-500' : accuracy >= 40 ? 'bg-amber-500' : 'bg-red-500';
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <p className="font-bold text-stone-700 dark:text-stone-300">{topic}</p>
                <p className="text-sm font-semibold text-stone-600 dark:text-stone-400">{correct} / {total} correct ({accuracy.toFixed(0)}%)</p>
            </div>
            <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2.5">
                <div className={`${color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${accuracy}%` }}></div>
            </div>
        </div>
    );
};

export default GameAnalysisView;
