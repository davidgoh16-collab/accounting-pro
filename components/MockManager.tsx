import React, { useState, useEffect } from 'react';
import { MockConfig, MockExam, UserLevel } from '../types';
import { getMocks, saveMock, deleteMock, migrateFeb2026 } from '../services/mockService';
import { parseTimetableFile } from '../services/geminiService';
import { COURSE_LESSONS } from '../constants';
import { v4 as uuidv4 } from 'uuid';

// --- Topic & Paper Mappings ---
// Hardcoded mapping for topic filtering based on paper
// Keys match COURSE_LESSONS chapter names or GCSE_SPEC_TOPICS keys
const GCSE_PAPER_MAP: Record<string, string[]> = {
    'Paper 1': [
        'The Challenge of Natural Hazards',
        'The Living World',
        'Physical Landscapes in the UK'
    ],
    'Paper 2': [
        'Urban Issues and Challenges',
        'The Changing Economic World',
        'The Challenge of Resource Management'
    ],
    'Paper 3': [
        'Geographical Applications'
    ]
};

const ALEVEL_PAPER_MAP: Record<string, string[]> = {
    'Paper 1': [
        'Water and Carbon Cycles',
        'Coastal Systems and Landscapes',
        'Hazards',
        'Ecosystems Under Stress',
        'Cold Environments',
        'Hot Desert Systems'
    ],
    'Paper 2': [
        'Global Systems and Global Governance',
        'Changing Places',
        'Contemporary Urban Environments',
        'Population and the Environment',
        'Resource Security'
    ]
};

const MockManager: React.FC = () => {
    const [mocks, setMocks] = useState<MockConfig[]>([]);
    const [selectedMock, setSelectedMock] = useState<MockConfig | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [level, setLevel] = useState<UserLevel>('A-Level');
    const [isActive, setIsActive] = useState(false);
    const [yearGroups, setYearGroups] = useState<string[]>([]);
    const [exams, setExams] = useState<MockExam[]>([]);
    const [topics, setTopics] = useState<string[]>([]); // Global topic pool for this series (optional usage)

    // Topic Selection State
    const [availableTopics, setAvailableTopics] = useState<string[]>([]);

    useEffect(() => {
        loadMocks();
    }, []);

    // Filter available topics whenever Level changes
    useEffect(() => {
        let relevantLessons = COURSE_LESSONS;
        if (level === 'GCSE') {
            relevantLessons = COURSE_LESSONS.filter(l => l.id.startsWith('G-'));
        } else if (level === 'A-Level') {
            relevantLessons = COURSE_LESSONS.filter(l => !l.id.startsWith('G-'));
        }

        const uniqueTopics = Array.from(new Set(relevantLessons.map(l => l.chapter))).sort();
        setAvailableTopics(uniqueTopics);
    }, [level]);

    const loadMocks = async () => {
        const data = await getMocks();
        setMocks(data);
    };

    const handleCreateMock = () => {
        const newMock: MockConfig = {
            id: uuidv4(),
            title: 'New Exam Series',
            level: 'A-Level',
            isActive: false,
            yearGroups: ['11'], // Default
            exams: [],
            topics: [],
            createdAt: new Date().toISOString()
        };
        setSelectedMock(newMock);
        populateForm(newMock);
        setIsEditing(true);
    };

    const handleEditMock = (mock: MockConfig) => {
        setSelectedMock(mock);
        populateForm(mock);
        setIsEditing(true);
    };

    const populateForm = (mock: MockConfig) => {
        setTitle(mock.title || '');
        setLevel(mock.level || 'A-Level');
        setIsActive(mock.isActive || false);
        setYearGroups(mock.yearGroups || []);
        setExams(mock.exams || []);
        setTopics(mock.topics || []);
    };

    const handleSave = async () => {
        if (!selectedMock) return;
        if (!title.trim()) {
            alert("Title is required.");
            return;
        }

        setLoading(true);
        try {
            const updatedMock: MockConfig = {
                ...selectedMock,
                title: title || 'Untitled Exam Series',
                level: level || 'A-Level',
                isActive: !!isActive,
                yearGroups: yearGroups,
                exams: exams || [],
                topics: topics || []
            };
            await saveMock(updatedMock);
            await loadMocks();
            setIsEditing(false);
            setSelectedMock(null);
        } catch (e) {
            console.error(e);
            alert("Failed to save exam series.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedMock) return;
        if (!confirm(`Are you sure you want to delete "${selectedMock.title}"? This cannot be undone.`)) return;

        setLoading(true);
        try {
            await deleteMock(selectedMock.id);
            await loadMocks();
            setIsEditing(false);
            setSelectedMock(null);
        } catch (e) {
            console.error(e);
            alert("Failed to delete exam series.");
        } finally {
            setLoading(false);
        }
    };

    const handleTimetableUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const reader = new FileReader();

            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                reader.readAsText(file);
                reader.onload = async () => {
                    const text = reader.result as string;
                    const base64 = btoa(text);
                    const extractedExams = await parseTimetableFile(base64, 'text/csv');
                    processExtractedExams(extractedExams);
                };
            } else {
                reader.readAsDataURL(file);
                reader.onload = async () => {
                    const result = reader.result as string;
                    const [prefix, data] = result.split(',');
                    const mimeType = prefix.match(/:(.*?);/)?.[1] || file.type;
                    const extractedExams = await parseTimetableFile(result, mimeType);
                    processExtractedExams(extractedExams);
                };
            }
        } catch (err) {
            console.error(err);
            alert("Failed to parse timetable.");
            setLoading(false);
        }
    };

    const processExtractedExams = (extractedExams: any[]) => {
        const currentYear = new Date().getFullYear();
        const newExams: MockExam[] = extractedExams.map((ex: any) => {
            // Ensure date has a year if parsing failed to add it, or override logic
            // Gemini usually returns YYYY-MM-DD.
            // If we want to enforce current year:
            let dateStr = ex.date;
            try {
                const d = new Date(ex.date);
                d.setFullYear(currentYear); // Force current year default
                dateStr = d.toISOString().split('T')[0];
            } catch (e) { /* keep original if fail */ }

            return {
                id: uuidv4(),
                title: `${ex.paper} (${ex.level})`,
                paper: ex.paper,
                date: dateStr,
                time: ex.time,
                duration: ex.duration,
                topics: []
            };
        });
        setExams(prev => [...prev, ...newExams]);
        setLoading(false);
    };

    const handleAddExam = () => {
        const currentYear = new Date().getFullYear();
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        const newExam: MockExam = {
            id: uuidv4(),
            title: 'New Exam',
            paper: 'Paper 1',
            date: `${currentYear}-${month}-${day}`,
            time: '09:00',
            duration: '1h 30m',
            topics: []
        };
        setExams([...exams, newExam]);
    };

    const updateExam = (id: string, field: keyof MockExam, value: any) => {
        setExams(exams.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const updateExamYear = (id: string, year: number) => {
        setExams(exams.map(e => {
            if (e.id === id && e.date) {
                const parts = e.date.split('-');
                if (parts.length === 3) {
                    // YYYY-MM-DD
                    const newDate = `${year}-${parts[1]}-${parts[2]}`;
                    return { ...e, date: newDate };
                }
            }
            return e;
        }));
    };

    const removeExam = (id: string) => {
        setExams(exams.filter(e => e.id !== id));
    };

    const toggleExamTopic = (examId: string, topic: string) => {
        setExams(exams.map(e => {
            if (e.id === examId) {
                const currentTopics = e.topics || [];
                const newTopics = currentTopics.includes(topic)
                    ? currentTopics.filter(t => t !== topic)
                    : [...currentTopics, topic];
                return { ...e, topics: newTopics };
            }
            return e;
        }));
    };

    // --- Helper to get filtered topics for a specific exam ---
    const getFilteredTopicsForExam = (examPaper: string) => {
        let paperTopics: string[] = [];

        if (level === 'GCSE') {
            paperTopics = GCSE_PAPER_MAP[examPaper] || [];
        } else {
            paperTopics = ALEVEL_PAPER_MAP[examPaper] || [];
        }

        // Return topics that are in availableTopics AND match the paper map
        // (Intersection logic)
        // Note: availableTopics is already filtered by level.

        if (paperTopics.length === 0) return availableTopics; // Fallback: show all if no mapping found

        return availableTopics.filter(t => paperTopics.includes(t));
    };

    return (
        <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl p-6 h-[85vh] flex gap-6">

            {/* Sidebar List */}
            <div className="w-1/4 border-r border-stone-200 dark:border-stone-700 pr-6 flex flex-col">
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">Exams</h3>
                    <p className="text-xs text-stone-500">Manage exam seasons.</p>
                </div>
                <button
                    onClick={handleCreateMock}
                    className="w-full py-2 mb-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition shadow-sm"
                >
                    + New Exam Series
                </button>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                    {mocks.map(mock => (
                        <button
                            key={mock.id}
                            onClick={() => handleEditMock(mock)}
                            className={`w-full text-left p-3 rounded-xl border transition-all ${selectedMock?.id === mock.id ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-700' : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:bg-stone-50'}`}
                        >
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-stone-800 dark:text-stone-200 block truncate">{mock.title}</span>
                                {mock.isActive && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Active</span>}
                            </div>
                            <span className="text-xs text-stone-500">{mock.level} • {mock.exams?.length || 0} Exams</span>
                        </button>
                    ))}
                </div>
                <button onClick={migrateFeb2026} className="mt-4 text-xs text-stone-400 hover:text-indigo-500 underline">
                    Migrate Feb 2026 Defaults
                </button>
            </div>

            {/* Main Edit Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isEditing && selectedMock ? (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6">Editing: {selectedMock.title}</h2>

                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        className="w-full p-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Level</label>
                                    <select
                                        value={level}
                                        onChange={e => setLevel(e.target.value as UserLevel)}
                                        className="w-full p-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800"
                                    >
                                        <option value="GCSE">GCSE</option>
                                        <option value="A-Level">A-Level</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={e => setIsActive(e.target.checked)}
                                        className="w-5 h-5 rounded border-stone-300 text-indigo-600"
                                    />
                                    <span className="font-bold text-stone-700 dark:text-stone-300">Is Active?</span>
                                </div>
                            </div>

                            {/* Year Groups Selector */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Target Year Groups</label>
                                <div className="flex flex-wrap gap-4 mb-2">
                                    {['10', '11', '12', '13'].map(yg => (
                                        <label key={yg} className="flex items-center gap-2 cursor-pointer select-none bg-white dark:bg-stone-800 px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-indigo-400 transition-all">
                                            <input
                                                type="checkbox"
                                                checked={yearGroups.includes(yg)}
                                                onChange={e => {
                                                    if (e.target.checked) setYearGroups([...yearGroups, yg]);
                                                    else setYearGroups(yearGroups.filter(y => y !== yg));
                                                }}
                                                className="w-4 h-4 text-indigo-600 rounded border-stone-300 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Year {yg}</span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                                    Visible to: {yearGroups.length > 0 ? `Year ${yearGroups.sort().join(', ')}` : 'All Years (Unrestricted)'}
                                </p>
                            </div>
                        </div>

                        {/* Exams Section */}
                        <div className="bg-stone-50 dark:bg-stone-800/50 p-6 rounded-2xl border border-stone-200 dark:border-stone-700">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">Exams</h3>
                                <div className="flex gap-2">
                                    <label className="cursor-pointer px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-sm flex items-center gap-2">
                                        <span>📷</span> Upload Timetable (Img/PDF/CSV/Excel)
                                        <input type="file" accept="image/*,.pdf,.csv,.xlsx,.xls" className="hidden" onChange={handleTimetableUpload} />
                                    </label>
                                    <button onClick={handleAddExam} className="px-3 py-1.5 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-700 dark:text-stone-200 text-xs font-bold rounded-lg transition">
                                        + Manual Add
                                    </button>
                                </div>
                            </div>

                            {loading && <div className="text-center p-4 text-indigo-600 font-bold animate-pulse">Processing Timetable with AI...</div>}

                            <div className="space-y-4">
                                {exams.map((exam, idx) => (
                                    <div key={exam.id} className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <input
                                                type="text"
                                                value={exam.title}
                                                onChange={e => updateExam(exam.id, 'title', e.target.value)}
                                                className="col-span-2 p-2 rounded border border-stone-300 dark:border-stone-600 text-sm font-bold"
                                                placeholder="Exam Title"
                                            />

                                            {/* Date and Year */}
                                            <div className="flex gap-2">
                                                <input
                                                    type="date"
                                                    value={exam.date}
                                                    onChange={e => updateExam(exam.id, 'date', e.target.value)}
                                                    className="w-2/3 p-2 rounded border border-stone-300 dark:border-stone-600 text-sm"
                                                />
                                                <input
                                                    type="number"
                                                    value={parseInt(exam.date.split('-')[0]) || new Date().getFullYear()}
                                                    onChange={e => updateExamYear(exam.id, parseInt(e.target.value))}
                                                    className="w-1/3 p-2 rounded border border-stone-300 dark:border-stone-600 text-sm font-bold text-center"
                                                    placeholder="YYYY"
                                                />
                                            </div>

                                            <input
                                                type="time"
                                                value={exam.time}
                                                onChange={e => updateExam(exam.id, 'time', e.target.value)}
                                                className="p-2 rounded border border-stone-300 dark:border-stone-600 text-sm"
                                            />
                                            <input
                                                type="text"
                                                value={exam.duration}
                                                onChange={e => updateExam(exam.id, 'duration', e.target.value)}
                                                className="p-2 rounded border border-stone-300 dark:border-stone-600 text-sm"
                                                placeholder="Duration (e.g. 1h 30m)"
                                            />
                                            <select
                                                value={exam.paper}
                                                onChange={e => updateExam(exam.id, 'paper', e.target.value)}
                                                className="p-2 rounded border border-stone-300 dark:border-stone-600 text-sm"
                                            >
                                                <option value="Paper 1">Paper 1</option>
                                                <option value="Paper 2">Paper 2</option>
                                                <option value="Paper 3">Paper 3</option>
                                            </select>
                                        </div>

                                        {/* Topic Assignment for Exam */}
                                        <div className="mb-4">
                                            <p className="text-xs font-bold text-stone-500 uppercase mb-2">Topics on this Exam ({level} - {exam.paper}):</p>
                                            <div className="flex flex-wrap gap-2">
                                                {getFilteredTopicsForExam(exam.paper).map(topic => (
                                                    <button
                                                        key={topic}
                                                        onClick={() => toggleExamTopic(exam.id, topic)}
                                                        className={`px-2 py-1 text-[10px] rounded-full border transition-colors ${
                                                            (exam.topics || []).includes(topic)
                                                                ? 'bg-indigo-100 border-indigo-300 text-indigo-700 font-bold'
                                                                : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
                                                        }`}
                                                    >
                                                        {topic}
                                                    </button>
                                                ))}
                                                {getFilteredTopicsForExam(exam.paper).length === 0 && (
                                                    <p className="text-xs text-stone-400 italic">No topics found for this paper level.</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <button onClick={() => removeExam(exam.id)} className="text-red-500 text-xs hover:underline">Remove Exam</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Save Actions */}
                        <div className="flex justify-between items-center pt-4 border-t border-stone-200 dark:border-stone-700">
                            <button onClick={handleDelete} disabled={loading} className="px-4 py-2 text-red-600 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition text-sm">
                                Delete Series
                            </button>
                            <div className="flex gap-4">
                                <button onClick={() => { setIsEditing(false); setSelectedMock(null); }} className="px-6 py-2 text-stone-500 font-bold hover:bg-stone-100 rounded-lg">Cancel</button>
                                <button onClick={handleSave} disabled={loading} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transform transition active:scale-95 disabled:opacity-50">
                                    {loading ? 'Saving...' : 'Save Exam Series'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-stone-400">
                        <span className="text-6xl mb-4">📅</span>
                        <p>Select an exam series to edit or create a new one.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MockManager;
