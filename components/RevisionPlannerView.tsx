
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AuthUser, RevisionSession, RevisionMethod } from '../types';
import { ALEVEL_UNITS, GCSE_UNITS, COURSE_LESSONS } from '../constants';
import HubLayout from './HubLayout';
import { db } from '../firebase';
import { collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';

interface RevisionPlannerViewProps {
    user: AuthUser;
    onBack: () => void;
}

interface GraphDataPoint {
    dayIndex: number;
    dateLabel: string;
    retention: number;
    isReview: boolean;
    stability: number;
}

// Helper to get YYYY-MM-DD string in local time to avoid timezone offset issues
const toLocalISOString = (date: Date | string) => {
    const d = new Date(date);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
};

const getMemoryColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-emerald-500 text-emerald-600';
    if (percentage >= 50) return 'bg-amber-500 text-amber-600';
    return 'bg-red-500 text-red-600';
};

const RevisionPlannerView: React.FC<RevisionPlannerViewProps> = ({ user, onBack }) => {
    const [sessions, setSessions] = useState<RevisionSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTopic, setSelectedTopic] = useState<string>('');
    const [selectedSubTopic, setSelectedSubTopic] = useState<string | null>(null);
    
    // Form State
    const [newTopic, setNewTopic] = useState('');
    const [newSubTopic, setNewSubTopic] = useState('');
    const [newDate, setNewDate] = useState(toLocalISOString(new Date()));
    const [newMethod, setNewMethod] = useState<RevisionMethod>('Flashcards');
    const [newDuration, setNewDuration] = useState(30);
    const [newNotes, setNewNotes] = useState('');

    const availableTopics = user.level === 'GCSE' ? GCSE_UNITS.filter(u => u !== 'All Units') : ALEVEL_UNITS.filter(u => u !== 'All Units');

    // Get granular lessons for the current user level
    const relevantLessons = useMemo(() => {
        if (user.level === 'GCSE') return COURSE_LESSONS.filter(l => l.id.startsWith('G-'));
        return COURSE_LESSONS.filter(l => !l.id.startsWith('G-'));
    }, [user.level]);

    // Filter available subtopics based on selected unit (newTopic) for the form
    const formSubTopics = useMemo(() => {
        return relevantLessons.filter(l => l.chapter === newTopic);
    }, [newTopic, relevantLessons]);

    // Subtopics for the currently viewed unit (Analysis)
    const viewSubTopics = useMemo(() => {
        return relevantLessons.filter(l => l.chapter === selectedTopic);
    }, [selectedTopic, relevantLessons]);

    useEffect(() => {
        if (!selectedTopic && availableTopics.length > 0) {
            setSelectedTopic(availableTopics[0]);
        }
    }, [availableTopics, selectedTopic]);

    // Reset view subtopic when unit changes
    useEffect(() => {
        setSelectedSubTopic(null);
    }, [selectedTopic]);

    // Reset form subtopic when form unit changes
    useEffect(() => {
        setNewSubTopic('');
    }, [newTopic]);

    // Fetch Sessions
    useEffect(() => {
        const fetchSessions = async () => {
            if (!user) return;
            try {
                const q = query(collection(db, 'users', user.uid, 'revision_sessions'), orderBy('date', 'asc'));
                const querySnapshot = await getDocs(q);
                const loadedSessions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RevisionSession));
                setSessions(loadedSessions);
            } catch (error) {
                console.error("Error fetching revision sessions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, [user]);

    const handleAddSession = async () => {
        if (!newTopic || !newDate) return;
        
        const newSession: Omit<RevisionSession, 'id'> = {
            topic: newTopic,
            subTopic: newSubTopic,
            date: newDate,
            method: newMethod,
            durationMinutes: newDuration,
            notes: newNotes,
            status: 'planned',
            level: user.level || 'A-Level'
        };

        try {
            const docRef = await addDoc(collection(db, 'users', user.uid, 'revision_sessions'), newSession);
            setSessions(prev => [...prev, { ...newSession, id: docRef.id }].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
            setNewNotes('');
            setNewSubTopic('');
        } catch (error) {
            console.error("Error adding session:", error);
        }
    };

    const handleToggleStatus = async (session: RevisionSession) => {
        const newStatus = session.status === 'planned' ? 'completed' : 'planned';
        // Optimistic update for UI responsiveness
        setSessions(prev => prev.map(s => s.id === session.id ? { ...s, status: newStatus } : s));
        
        try {
            await updateDoc(doc(db, 'users', user.uid, 'revision_sessions', session.id), { status: newStatus });
        } catch (error) {
            console.error("Error updating session:", error);
            // Revert on error
            setSessions(prev => prev.map(s => s.id === session.id ? { ...s, status: session.status } : s));
        }
    };

    const handleDeleteSession = async (id: string) => {
        if (!window.confirm("Delete this session?")) return;
        try {
            await deleteDoc(doc(db, 'users', user.uid, 'revision_sessions', id));
            setSessions(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error("Error deleting session:", error);
        }
    };

    // --- Core Memory Calculation Helper ---
    const calculateRetentionStats = (relevantSessions: RevisionSession[]) => {
        const completed = relevantSessions
            .filter(s => s.status === 'completed')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (completed.length === 0) {
            return { percentage: 0, stability: 0 };
        }

        const today = new Date();
        const lastSessionDate = new Date(completed[completed.length - 1].date);
        const daysSinceLastReview = (today.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24);
        
        // Stability grows exponentially with number of reviews: 2, 5, 12.5, 31...
        const stability = 2 * Math.pow(2.5, completed.length - 1);
        
        let retention = 100 * Math.exp(-Math.max(0, daysSinceLastReview) / stability);
        retention = Math.max(0, Math.min(100, retention));

        return { percentage: retention, stability };
    };

    // --- Unit Stats ---
    const topicStats = useMemo(() => {
        const stats: Record<string, { percentage: number, stability: number }> = {};
        availableTopics.forEach(topic => {
            const topicSessions = sessions.filter(s => s.topic === topic);
            stats[topic] = calculateRetentionStats(topicSessions);
        });
        return stats;
    }, [sessions, availableTopics]);

    // --- SubTopic Stats (for the selected topic) ---
    const lessonStats = useMemo(() => {
        const stats: Record<string, { percentage: number, stability: number }> = {};
        viewSubTopics.forEach(lesson => {
            // Filter strictly by subTopic name
            const lessonSessions = sessions.filter(s => s.subTopic === lesson.title);
            stats[lesson.title] = calculateRetentionStats(lessonSessions);
        });
        return stats;
    }, [sessions, viewSubTopics]);

    // --- Graph Data Generation ---
    const ForgettingCurveGraph = () => {
        const [hoveredPoint, setHoveredPoint] = useState<GraphDataPoint | null>(null);
        const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
        const svgRef = useRef<SVGSVGElement>(null);

        const dataPoints = useMemo<GraphDataPoint[]>(() => {
            const completedSessions = sessions
                .filter(s => {
                    // Filter logic: If selectedSubTopic exists, use it. Otherwise use selectedTopic.
                    const isCompleted = s.status === 'completed';
                    if (!isCompleted) return false;
                    
                    if (selectedSubTopic) {
                        return s.subTopic === selectedSubTopic;
                    }
                    return s.topic === selectedTopic;
                })
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            const todayStr = toLocalISOString(new Date());
            
            // Start graph 2 days before first review, or today if no reviews
            let start = new Date();
            if (completedSessions.length > 0) {
                start = new Date(completedSessions[0].date);
                start.setDate(start.getDate() - 2); 
            }
            // End graph 30 days from today
            const end = new Date();
            end.setDate(end.getDate() + 30);

            const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            const points: GraphDataPoint[] = [];

            // Simulation Variables
            let currentStability = 2; // Default stability (days until retention drops to 36%)
            let lastReviewTime: number | null = null;
            let reviewCount = 0;

            // Map of Review Dates
            const reviewDates = new Set(completedSessions.map(s => s.date));

            for (let i = 0; i <= totalDays; i++) {
                const d = new Date(start);
                d.setDate(start.getDate() + i);
                const dateStr = toLocalISOString(d);
                const isReview = reviewDates.has(dateStr);

                let retention = 0;

                if (isReview) {
                    retention = 100;
                    lastReviewTime = d.getTime();
                    // Increase stability for next decay phase
                    if (reviewCount > 0) {
                        currentStability *= 2.5; 
                    }
                    reviewCount++;
                } else if (lastReviewTime !== null) {
                    const daysElapsed = (d.getTime() - lastReviewTime) / (1000 * 60 * 60 * 24);
                    retention = 100 * Math.exp(-daysElapsed / currentStability);
                }

                points.push({
                    dayIndex: i,
                    dateLabel: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    retention: Math.max(0, Math.min(100, retention)),
                    isReview,
                    stability: currentStability
                });
            }
            return points;
        }, [sessions, selectedTopic, selectedSubTopic]);

        const width = 800;
        const height = 300;
        const padding = { top: 20, right: 20, bottom: 40, left: 50 };
        const graphWidth = width - padding.left - padding.right;
        const graphHeight = height - padding.top - padding.bottom;

        if (dataPoints.length === 0) return (
            <div className="h-[300px] flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-800 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-700">
                <span className="text-4xl mb-2">📉</span>
                <p className="text-stone-500 dark:text-stone-400 font-semibold">
                    {selectedSubTopic 
                        ? `No completed sessions for "${selectedSubTopic}" yet.` 
                        : `No completed sessions for "${selectedTopic}" yet.`}
                </p>
            </div>
        );

        const xScale = (i: number) => padding.left + (i / (dataPoints.length - 1)) * graphWidth;
        const yScale = (val: number) => padding.top + (1 - val / 100) * graphHeight;

        let pathD = `M ${xScale(0)} ${yScale(dataPoints[0].retention)}`;
        dataPoints.forEach((p, i) => { if (i > 0) pathD += ` L ${xScale(i)} ${yScale(p.retention)}`; });

        const handleMouseMove = (e: React.MouseEvent) => {
            if (!svgRef.current) return;
            const rect = svgRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const relativeX = Math.max(0, Math.min(x - padding.left, graphWidth));
            const index = Math.round((relativeX / graphWidth) * (dataPoints.length - 1));
            
            if (dataPoints[index]) {
                setHoveredPoint(dataPoints[index]);
                setMousePos({ x: xScale(index), y: yScale(dataPoints[index].retention) });
            }
        };

        const todayIndex = dataPoints.findIndex(p => p.dateLabel === new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));

        return (
            <div className="relative w-full h-auto">
                <svg 
                    ref={svgRef}
                    viewBox={`0 0 ${width} ${height}`} 
                    className="w-full h-auto bg-white dark:bg-stone-900 rounded-xl shadow-inner select-none cursor-crosshair"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoveredPoint(null)}
                >
                    <defs>
                        <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Y-Axis Grid */}
                    {[0, 25, 50, 75, 100].map(val => (
                        <g key={val}>
                            <line x1={padding.left} y1={yScale(val)} x2={width - padding.right} y2={yScale(val)} stroke="#e5e7eb" className="dark:stroke-stone-700" strokeDasharray="4 4" />
                            <text x={padding.left - 10} y={yScale(val) + 4} textAnchor="end" className="text-[10px] fill-stone-400 font-mono">{val}%</text>
                        </g>
                    ))}

                    {/* Today Line */}
                    {todayIndex !== -1 && (
                        <line x1={xScale(todayIndex)} y1={padding.top} x2={xScale(todayIndex)} y2={height - padding.bottom} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />
                    )}

                    {/* The Curve */}
                    <path d={pathD} fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d={`${pathD} L ${xScale(dataPoints.length - 1)} ${height - padding.bottom} L ${xScale(0)} ${height - padding.bottom} Z`} fill="url(#curveGradient)" />

                    {/* Interactive Dot */}
                    {hoveredPoint && (
                        <g>
                            <line x1={mousePos.x} y1={padding.top} x2={mousePos.x} y2={height - padding.bottom} stroke="#64748b" strokeWidth="1" />
                            <circle cx={mousePos.x} cy={mousePos.y} r="6" fill="#0ea5e9" stroke="white" strokeWidth="2" />
                        </g>
                    )}
                </svg>

                {hoveredPoint && (
                    <div 
                        className="absolute bg-stone-800 text-white text-xs rounded-lg p-2 shadow-xl pointer-events-none z-10 -translate-x-1/2 -translate-y-full mb-2 w-32"
                        style={{ left: `${(mousePos.x / width) * 100}%`, top: `${(mousePos.y / height) * 100}%` }}
                    >
                        <p className="font-bold text-center border-b border-stone-600 pb-1 mb-1">{hoveredPoint.dateLabel}</p>
                        <div className="flex justify-between"><span>Retention:</span> <span className="font-mono text-sky-300">{hoveredPoint.retention.toFixed(0)}%</span></div>
                        <div className="flex justify-between"><span>Stability:</span> <span className="font-mono text-emerald-300">{hoveredPoint.stability.toFixed(1)}d</span></div>
                        {hoveredPoint.isReview && <div className="mt-1 text-center bg-emerald-600 rounded text-[10px] font-bold py-0.5">REVIEW DONE</div>}
                    </div>
                )}
            </div>
        );
    };

    // --- Weekly Schedule Component ---
    const WeeklySchedule = () => {
        const [filterTopic, setFilterTopic] = useState('All');
        
        // State to track the Monday of the currently viewed week
        const [currentWeekStart, setCurrentWeekStart] = useState(() => {
            const today = new Date();
            const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
            const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            const monday = new Date(today);
            monday.setDate(today.getDate() + diffToMon);
            monday.setHours(0, 0, 0, 0);
            return monday;
        });

        const jumpToToday = () => {
            const today = new Date();
            const dayOfWeek = today.getDay();
            const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            const monday = new Date(today);
            monday.setDate(today.getDate() + diffToMon);
            monday.setHours(0, 0, 0, 0);
            setCurrentWeekStart(monday);
        };

        const changeWeek = (offset: number) => {
            const newDate = new Date(currentWeekStart);
            newDate.setDate(newDate.getDate() + (offset * 7));
            setCurrentWeekStart(newDate);
        };

        const weekDays = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(currentWeekStart);
            d.setDate(currentWeekStart.getDate() + i);
            return d;
        });

        return (
            <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-stone-200 dark:border-stone-700 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                        <span>📅</span> Schedule
                    </h3>
                    <select 
                        value={filterTopic} 
                        onChange={(e) => setFilterTopic(e.target.value)}
                        className="text-xs p-1 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 focus:ring-1 focus:ring-blue-500 outline-none max-w-[120px]"
                    >
                        <option value="All">All Topics</option>
                        {availableTopics.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-md transition text-stone-600 dark:text-stone-300 border border-stone-300 dark:border-stone-600">
                        &larr;
                    </button>
                    <button onClick={jumpToToday} className="flex-1 py-1.5 px-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition">
                        Today
                    </button>
                    <button onClick={() => changeWeek(1)} className="p-2 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-md transition text-stone-600 dark:text-stone-300 border border-stone-300 dark:border-stone-600">
                        &rarr;
                    </button>
                </div>
                
                <div className="text-center text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2">
                    Week of {currentWeekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2 max-h-[500px]">
                    {weekDays.map((day) => {
                        const dateKey = toLocalISOString(day);
                        const todayStr = toLocalISOString(new Date());
                        const isToday = dateKey === todayStr;
                        const isPast = dateKey < todayStr;
                        
                        // Filter by date AND topic if selected
                        const daySessions = sessions.filter(s => 
                            s.date === dateKey && (filterTopic === 'All' || s.topic === filterTopic)
                        );

                        return (
                            <div key={dateKey} className={`p-3 rounded-xl border transition-colors ${isToday ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : isPast ? 'bg-stone-100/50 dark:bg-stone-800/30 border-stone-200 dark:border-stone-700 opacity-80' : 'bg-transparent border-stone-200 dark:border-stone-800'}`}>
                                <h4 className={`text-sm font-bold mb-2 flex justify-between ${isToday ? 'text-blue-700 dark:text-blue-300' : 'text-stone-600 dark:text-stone-400'}`}>
                                    <span>{day.toLocaleDateString(undefined, { weekday: 'long' })} <span className="font-normal opacity-75">{day.getDate()}</span></span>
                                    {isToday && <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 px-2 py-0.5 rounded-full">Today</span>}
                                </h4>
                                {daySessions.length === 0 ? (
                                    <p className="text-xs text-stone-400 italic pl-1">Nothing planned{filterTopic !== 'All' ? ` for ${filterTopic}` : ''}.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {daySessions.map(session => (
                                            <div key={session.id} className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${session.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-stone-800 border-stone-100 dark:border-stone-700 shadow-sm'}`}>
                                                <button 
                                                    onClick={() => handleToggleStatus(session)}
                                                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${session.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-transparent border-stone-300 dark:border-stone-600 hover:border-emerald-400'}`}
                                                >
                                                    {session.status === 'completed' && <span className="text-xs font-bold">✓</span>}
                                                </button>
                                                <div className="flex-grow min-w-0">
                                                    <p className={`text-sm font-bold truncate ${session.status === 'completed' ? 'text-stone-500 line-through' : 'text-stone-800 dark:text-stone-200'}`}>
                                                        {session.subTopic || session.topic}
                                                    </p>
                                                    <p className="text-xs text-stone-500 truncate">
                                                        {session.subTopic ? session.topic : ''} {session.subTopic ? '•' : ''} {session.method} • {session.durationMinutes}m
                                                    </p>
                                                </div>
                                                <button onClick={() => handleDeleteSession(session.id)} className="text-stone-300 hover:text-red-400 px-2 text-lg">×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <HubLayout 
            title="Revision Planner" 
            subtitle="Optimise your memory with spaced repetition." 
            gradient="bg-gradient-to-r from-cyan-500 to-blue-500"
            onBack={onBack}
        >
            <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COLUMN: Scheduler */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Add Session Form */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-3xl p-6 shadow-lg">
                        <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4">Quick Add</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-stone-500 uppercase">Date</label>
                                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full mt-1 p-2 rounded-lg bg-stone-100 dark:bg-stone-800 border-none focus:ring-2 focus:ring-cyan-500 text-sm text-stone-800 dark:text-stone-200" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-stone-500 uppercase">Unit / Broad Topic</label>
                                <select value={newTopic} onChange={e => setNewTopic(e.target.value)} className="w-full mt-1 p-2 rounded-lg bg-stone-100 dark:bg-stone-800 border-none focus:ring-2 focus:ring-cyan-500 text-sm text-stone-800 dark:text-stone-200">
                                    <option value="" disabled>Select unit...</option>
                                    {availableTopics.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            
                            {/* Sub Topic Selection */}
                            <div className={`transition-all duration-300 ${formSubTopics.length > 0 ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                <label className="text-xs font-bold text-stone-500 uppercase">Lesson / Specific Topic</label>
                                <select 
                                    value={newSubTopic} 
                                    onChange={e => setNewSubTopic(e.target.value)} 
                                    className="w-full mt-1 p-2 rounded-lg bg-stone-100 dark:bg-stone-800 border-none focus:ring-2 focus:ring-cyan-500 text-sm text-stone-800 dark:text-stone-200"
                                    disabled={formSubTopics.length === 0}
                                >
                                    <option value="">{formSubTopics.length > 0 ? 'Select specific lesson...' : 'Select a unit first'}</option>
                                    {formSubTopics.map(l => <option key={l.id} value={l.title}>{l.title}</option>)}
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-stone-500 uppercase">Method</label>
                                    <select value={newMethod} onChange={e => setNewMethod(e.target.value as RevisionMethod)} className="w-full mt-1 p-2 rounded-lg bg-stone-100 dark:bg-stone-800 border-none focus:ring-2 focus:ring-cyan-500 text-sm text-stone-800 dark:text-stone-200">
                                        {['Flashcards', 'Practice Question', 'Video Lesson', 'Mind Map', 'Textbook'].map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div className="w-20">
                                    <label className="text-xs font-bold text-stone-500 uppercase">Mins</label>
                                    <input type="number" value={newDuration} onChange={e => setNewDuration(Number(e.target.value))} className="w-full mt-1 p-2 rounded-lg bg-stone-100 dark:bg-stone-800 border-none focus:ring-2 focus:ring-cyan-500 text-sm text-stone-800 dark:text-stone-200" />
                                </div>
                            </div>
                            <button onClick={handleAddSession} disabled={!newTopic} className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                                + Add to Schedule
                            </button>
                        </div>
                    </div>

                    {/* Weekly Schedule */}
                    <WeeklySchedule />
                </div>

                {/* RIGHT COLUMN: Visualization */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* Topic Health Overview */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-3xl p-6 shadow-lg">
                        <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4 flex items-center gap-2">
                            <span>🧠</span> Memory Health (By Unit)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
                            {availableTopics.map(topic => {
                                const { percentage } = topicStats[topic] || { percentage: 0 };
                                const colorClass = getMemoryColor(percentage);
                                const isSelected = selectedTopic === topic;
                                
                                return (
                                    <button 
                                        key={topic} 
                                        onClick={() => setSelectedTopic(topic)}
                                        className={`text-left p-2.5 rounded-xl transition-all border ${isSelected ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-300 dark:border-cyan-700 ring-1 ring-cyan-400' : 'bg-transparent border-transparent hover:bg-stone-50 dark:hover:bg-stone-800'}`}
                                    >
                                        <div className="flex justify-between text-xs font-bold mb-1.5">
                                            <span className={`truncate mr-2 ${isSelected ? 'text-cyan-800 dark:text-cyan-200' : 'text-stone-600 dark:text-stone-400'}`}>{topic}</span>
                                            <span className={colorClass.split(' ')[1]}>{percentage.toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2 overflow-hidden">
                                            <div className={`h-full transition-all duration-1000 ${colorClass.split(' ')[0]}`} style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Lesson Breakdown (New Section) */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-3xl p-6 shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                                <span>📚</span> Lesson Breakdown: {selectedTopic}
                            </h3>
                            {selectedSubTopic && (
                                <button onClick={() => setSelectedSubTopic(null)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                    Show Unit Overview
                                </button>
                            )}
                        </div>
                        
                        <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
                            {viewSubTopics.length === 0 ? (
                                <p className="text-sm text-stone-500 italic">No specific lessons found for this unit.</p>
                            ) : (
                                viewSubTopics.map(lesson => {
                                    const { percentage } = lessonStats[lesson.title] || { percentage: 0 };
                                    const isSelected = selectedSubTopic === lesson.title;
                                    const colorClass = getMemoryColor(percentage);

                                    return (
                                        <button 
                                            key={lesson.id} 
                                            onClick={() => setSelectedSubTopic(lesson.title)}
                                            className={`flex-shrink-0 w-40 p-3 rounded-xl border text-left transition-all ${isSelected ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-300 ring-1 ring-cyan-400' : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'}`}
                                        >
                                            <div className="text-xs font-bold text-stone-700 dark:text-stone-300 truncate mb-2" title={lesson.title}>
                                                {lesson.title}
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className={`text-xs font-bold ${colorClass.split(' ')[1]}`}>{percentage.toFixed(0)}%</div>
                                                <div className="w-12 h-1.5 bg-stone-200 dark:bg-stone-600 rounded-full overflow-hidden">
                                                    <div className={`h-full ${colorClass.split(' ')[0]}`} style={{ width: `${percentage}%` }}></div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Forgetting Curve Graph */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-3xl p-6 shadow-lg">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">Forgetting Curve: {selectedSubTopic || selectedTopic}</h3>
                                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                                    Current Stability: <span className="font-bold text-emerald-600">
                                        {(selectedSubTopic ? lessonStats[selectedSubTopic]?.stability : topicStats[selectedTopic]?.stability)?.toFixed(1) || '0.0'} days
                                    </span>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {(selectedSubTopic ? lessonStats[selectedSubTopic]?.percentage : topicStats[selectedTopic]?.percentage)?.toFixed(0) || '0'}%
                                </p>
                                <p className="text-xs font-bold uppercase text-stone-400 tracking-wider">Retention</p>
                            </div>
                        </div>
                        
                        <ForgettingCurveGraph />
                        
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 flex items-start gap-3">
                            <span className="text-xl">💡</span>
                            <div>
                                <p className="text-sm font-bold text-blue-800 dark:text-blue-300">How this works</p>
                                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1 leading-relaxed">
                                    Every time you complete a review, your memory <strong>stability</strong> increases (multiplying by 2.5x). This flattens the curve, meaning you forget slower and can wait longer before the next review.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </HubLayout>
    );
};

export default RevisionPlannerView;
