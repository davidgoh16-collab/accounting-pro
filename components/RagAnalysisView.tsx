
import React, { useState, useEffect, useMemo } from 'react';
import { AuthUser, CompletedSession, GameSessionResult } from '../types';
import { AQA_UNITS, GCSE_UNITS, IGCSE_UNITS, GCSE_PAPER_MAPPING, ALEVEL_PAPER_MAPPING, IGCSE_PAPER_MAPPING } from '../constants';
import { CASE_STUDY_LOCATIONS } from '../case-study-database';
import { db } from '../firebase';
import { collection, query, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import HubLayout from './HubLayout';
import TopicSpecificationView from './TopicSpecificationView';

interface TopicMetrics {
    examScore: number; // 0-100
    examCount: number;
    gameScore: number; // 0-100
    gameCount: number;
    flashcardScore: number; // 0-100
    flashcardKnown: number;
    flashcardTotal: number;
}

interface RagResult {
    topic: string;
    masteryScore: number;
    status: 'Red' | 'Amber' | 'Green';
    metrics: TopicMetrics;
}

interface RagAnalysisViewProps {
    user: AuthUser;
    onBack: () => void;
}

const calculateMastery = (metrics: TopicMetrics): { score: number, status: 'Red' | 'Amber' | 'Green' } => {
    let totalWeight = 0;
    let weightedSum = 0;

    // Exam Weight: 50%
    if (metrics.examCount > 0) {
        weightedSum += metrics.examScore * 0.5;
        totalWeight += 0.5;
    }

    // Game Weight: 30%
    if (metrics.gameCount > 0) {
        weightedSum += metrics.gameScore * 0.3;
        totalWeight += 0.3;
    }

    // Flashcard Weight: 20%
    if (metrics.flashcardTotal > 0) {
        weightedSum += metrics.flashcardScore * 0.2;
        totalWeight += 0.2;
    }

    if (totalWeight === 0) return { score: 0, status: 'Red' };

    const finalScore = weightedSum / totalWeight;
    
    let status: 'Red' | 'Amber' | 'Green' = 'Red';
    if (finalScore >= 75) status = 'Green';
    else if (finalScore >= 50) status = 'Amber';

    return { score: finalScore, status };
};

const ManualRagGrid: React.FC<{
    topics: string[];
    ratings: Record<string, 'Red' | 'Amber' | 'Green'>;
    onRate: (topic: string, rating: 'Red' | 'Amber' | 'Green') => void;
    onSelectTopic: (topic: string) => void;
    paperMapping: Record<string, string>;
}> = ({ topics, ratings, onRate, onSelectTopic, paperMapping }) => {

    // Group topics by paper
    const groupedTopics = useMemo(() => {
        const groups: Record<string, string[]> = {};
        topics.forEach(topic => {
            const paper = paperMapping[topic] || 'Other';
            if (!groups[paper]) groups[paper] = [];
            groups[paper].push(topic);
        });

        // Sort keys to ensure Paper 1, Paper 2, Paper 3, Other order
        const sortedKeys = Object.keys(groups).sort();
        return { groups, sortedKeys };
    }, [topics, paperMapping]);

    return (
        <div className="space-y-12 animate-fade-in">
            {groupedTopics.sortedKeys.map(paper => (
                <div key={paper}>
                    <h2 className="text-2xl font-bold text-stone-700 dark:text-stone-300 mb-6 border-b border-stone-200 dark:border-stone-700 pb-2">
                        {paper}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupedTopics.groups[paper].map(topic => (
                            <div key={topic} className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-700 flex flex-col justify-between">
                                <button
                                    onClick={() => onSelectTopic(topic)}
                                    className="text-left group"
                                >
                                    <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-1 text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{topic}</h3>
                                    <p className="text-xs text-stone-400 mb-4 font-semibold group-hover:text-indigo-500 transition-colors">View Specification &rarr;</p>
                                </button>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['Red', 'Amber', 'Green'] as const).map(rating => {
                                        const isSelected = ratings[topic] === rating;
                                        const baseColor = rating === 'Red' ? 'bg-red-500' : rating === 'Amber' ? 'bg-amber-500' : 'bg-emerald-500';
                                        const opacity = isSelected ? 'opacity-100 ring-2 ring-offset-2 ring-stone-400 dark:ring-offset-stone-900' : 'opacity-30 hover:opacity-60';

                                        return (
                                            <button
                                                key={rating}
                                                onClick={() => onRate(topic, rating)}
                                                className={`h-10 rounded-lg ${baseColor} ${opacity} transition-all font-bold text-white text-xs uppercase tracking-wider`}
                                            >
                                                {rating}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const MetricBar: React.FC<{ label: string; value: number; count: number; colorClass: string }> = ({ label, value, count, colorClass }) => (
    <div className="mb-2">
        <div className="flex justify-between text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1">
            <span>{label} {count > 0 ? `(${count})` : ''}</span>
            <span>{count > 0 ? `${value.toFixed(0)}%` : 'N/A'}</span>
        </div>
        <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${count > 0 ? colorClass : 'bg-transparent'}`} style={{ width: `${value}%` }}></div>
        </div>
    </div>
);

const RagCard: React.FC<{ result: RagResult }> = ({ result }) => {
    const statusColors = {
        Red: { border: 'border-red-500', text: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', bar: 'bg-red-500' },
        Amber: { border: 'border-amber-500', text: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', bar: 'bg-amber-500' },
        Green: { border: 'border-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', bar: 'bg-emerald-500' }
    };

    const colors = statusColors[result.status];

    return (
        <div className={`bg-white dark:bg-stone-800 rounded-2xl shadow-lg border-l-8 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${colors.border}`}>
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 leading-tight max-w-[70%]">{result.topic}</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${colors.bg} ${colors.text}`}>
                    {result.masteryScore.toFixed(0)}%
                </div>
            </div>

            <div className="space-y-3">
                <MetricBar 
                    label="Exam Practice" 
                    value={result.metrics.examScore} 
                    count={result.metrics.examCount} 
                    colorClass="bg-blue-500" 
                />
                <MetricBar 
                    label="Game Accuracy" 
                    value={result.metrics.gameScore} 
                    count={result.metrics.gameCount} 
                    colorClass="bg-purple-500" 
                />
                <MetricBar 
                    label="Flashcards" 
                    value={result.metrics.flashcardScore} 
                    count={result.metrics.flashcardTotal > 0 ? 1 : 0} // Boolean-like presence
                    colorClass="bg-fuchsia-500" 
                />
            </div>
            
            {result.status === 'Red' && (
                <p className="text-xs text-red-500 mt-4 font-semibold flex items-center gap-1">
                    <span>⚠️</span> Focus needed here
                </p>
            )}
             {result.status === 'Green' && (
                <p className="text-xs text-emerald-500 mt-4 font-semibold flex items-center gap-1">
                    <span>✅</span> Strength area
                </p>
            )}
        </div>
    );
};

const RagAnalysisView: React.FC<RagAnalysisViewProps> = ({ user, onBack }) => {
    const [viewMode, setViewMode] = useState<'automated' | 'manual'>('automated');
    const [ragResults, setRagResults] = useState<RagResult[]>([]);
    const [manualRatings, setManualRatings] = useState<Record<string, 'Red' | 'Amber' | 'Green'>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

    const relevantUnits = useMemo(() => {
        if (!user.level) return [];
        if (user.level === 'IGCSE') return IGCSE_UNITS;
        return user.level === 'GCSE' ? GCSE_UNITS : AQA_UNITS;
    }, [user.level]);

    const paperMapping = useMemo(() => {
        if (user.level === 'IGCSE') return IGCSE_PAPER_MAPPING;
        return user.level === 'GCSE' ? GCSE_PAPER_MAPPING : ALEVEL_PAPER_MAPPING;
    }, [user.level]);

    const allTopics = useMemo(() => {
        const caseStudyTopics = CASE_STUDY_LOCATIONS
            .filter(cs => cs.levels.includes(user.level || 'A-Level'))
            .map(cs => cs.topic);

        return Array.from(new Set([
            ...relevantUnits.filter(u => u !== 'All Units'),
            ...caseStudyTopics
        ])).sort();
    }, [user.level, relevantUnits]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch Exam Sessions
                const sessionsRef = collection(db, 'users', user.uid, 'sessions');
                const sessionsSnap = await getDocs(sessionsRef);
                const sessions = sessionsSnap.docs.map(doc => doc.data() as CompletedSession);

                // 2. Fetch Game Results
                const gamesRef = collection(db, 'users', user.uid, 'game_results');
                const gamesSnap = await getDocs(gamesRef);
                const gameResults = gamesSnap.docs.map(doc => doc.data() as GameSessionResult);

                // 3. Fetch Flashcard Progress
                const fcRef = doc(db, 'users', user.uid, 'flashcard_progress', 'statuses');
                const fcSnap = await getDoc(fcRef);
                const fcStatuses = fcSnap.exists() ? (fcSnap.data() as Record<string, 'known' | 'unknown'>) : {};

                // 4. Fetch Manual Ratings
                const manualRef = doc(db, 'users', user.uid, 'manual_progress', 'rag_sheet');
                const manualSnap = await getDoc(manualRef);
                if (manualSnap.exists()) {
                    setManualRatings(manualSnap.data() as Record<string, 'Red' | 'Amber' | 'Green'>);
                }

                // 5. Initialize Data Structure for All Topics
                const dataMap: Record<string, TopicMetrics> = {};
                allTopics.forEach(topic => {
                    dataMap[topic] = {
                        examScore: 0, examCount: 0,
                        gameScore: 0, gameCount: 0,
                        flashcardScore: 0, flashcardKnown: 0, flashcardTotal: 0
                    };
                });

                // 6. Process Exams (Filter by level implicitly via sessions or explicitly here)
                sessions.forEach(s => {
                    // Ensure session matches user level or general
                    if (s.level === user.level && dataMap[s.question.unit]) {
                        const pct = (s.aiFeedback.score / s.aiFeedback.totalMarks) * 100;
                        // Running average calculation
                        dataMap[s.question.unit].examScore = ((dataMap[s.question.unit].examScore * dataMap[s.question.unit].examCount) + pct) / (dataMap[s.question.unit].examCount + 1);
                        dataMap[s.question.unit].examCount++;
                    }
                });

                // 7. Process Games
                gameResults.forEach(g => {
                    const topic = g.question.topic;
                    if (dataMap[topic]) {
                        dataMap[topic].gameCount++;
                        if (g.wasCorrect) dataMap[topic].gameScore++; 
                    }
                });
                // Convert game score count to percentage
                Object.values(dataMap).forEach(m => {
                    if (m.gameCount > 0) {
                        m.gameScore = (m.gameScore / m.gameCount) * 100;
                    }
                });

                // 8. Process Flashcards
                const relevantCaseStudies = CASE_STUDY_LOCATIONS.filter(cs => cs.levels.includes(user.level || 'A-Level'));
                relevantCaseStudies.forEach(cs => {
                    if (dataMap[cs.topic]) {
                        dataMap[cs.topic].flashcardTotal++;
                        if (fcStatuses[cs.name] === 'known') {
                            dataMap[cs.topic].flashcardKnown++;
                        }
                    }
                });
                Object.values(dataMap).forEach(m => {
                    if (m.flashcardTotal > 0) {
                        m.flashcardScore = (m.flashcardKnown / m.flashcardTotal) * 100;
                    }
                });

                // 9. Final RAG Calculation
                const results: RagResult[] = Object.entries(dataMap).map(([topic, metrics]) => {
                    const { score, status } = calculateMastery(metrics);
                    return { topic, metrics, masteryScore: score, status };
                });

                // Sort by status (Red first) then score (low to high)
                results.sort((a, b) => {
                    const statusOrder = { Red: 0, Amber: 1, Green: 2 };
                    if (statusOrder[a.status] !== statusOrder[b.status]) {
                        return statusOrder[a.status] - statusOrder[b.status];
                    }
                    return a.masteryScore - b.masteryScore;
                });

                setRagResults(results);

            } catch (e) {
                console.error("Error calculating RAG analysis", e);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) fetchData();
    }, [user, allTopics]); // Added allTopics to dependency array as it's a derived value

    const handleManualRate = async (itemId: string, rating: 'Red' | 'Amber' | 'Green') => {
        const newRatings = { ...manualRatings, [itemId]: rating };
        setManualRatings(newRatings);
        try {
            await setDoc(doc(db, 'users', user.uid, 'manual_progress', 'rag_sheet'), newRatings, { merge: true });
        } catch (e) {
            console.error("Error saving manual rating", e);
        }
    };

    return (
        <HubLayout
            title="Knowledge Tracker"
            subtitle={`A RAG (Red-Amber-Green) analysis of your ${user.level} accounting mastery.`}
            gradient="bg-gradient-to-r from-orange-500 via-red-500 to-rose-600"
            onBack={selectedTopic ? undefined : onBack}
        >
            <main className="w-full max-w-7xl mx-auto p-2">
                {!selectedTopic && (
                    <div className="flex justify-center mb-8">
                        <div className="bg-stone-100 dark:bg-stone-800 p-1 rounded-xl flex gap-2">
                            <button
                                onClick={() => setViewMode('automated')}
                                className={`px-4 py-2 rounded-lg font-bold transition-all ${viewMode === 'automated' ? 'bg-white dark:bg-stone-700 shadow text-rose-600 dark:text-rose-400' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
                            >
                                Automated Analysis
                            </button>
                            <button
                                onClick={() => setViewMode('manual')}
                                className={`px-4 py-2 rounded-lg font-bold transition-all ${viewMode === 'manual' ? 'bg-white dark:bg-stone-700 shadow text-rose-600 dark:text-rose-400' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
                            >
                                Manual Self-Assessment
                            </button>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="flex items-center justify-center space-x-2 mb-4">
                            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                            <div className="w-4 h-4 bg-amber-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                            <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-stone-500 font-semibold">Crunching the numbers...</p>
                    </div>
                ) : selectedTopic ? (
                    <TopicSpecificationView
                        topic={selectedTopic}
                        onBack={() => setSelectedTopic(null)}
                        ratings={manualRatings}
                        onRate={handleManualRate}
                    />
                ) : viewMode === 'manual' ? (
                    <ManualRagGrid
                        topics={allTopics}
                        ratings={manualRatings}
                        onRate={handleManualRate}
                        onSelectTopic={setSelectedTopic}
                        paperMapping={paperMapping}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                        {ragResults.map(result => (
                            <RagCard key={result.topic} result={result} />
                        ))}
                    </div>
                )}
            </main>
        </HubLayout>
    );
};

export default RagAnalysisView;
