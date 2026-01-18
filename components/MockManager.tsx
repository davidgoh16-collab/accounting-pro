import React, { useState, useEffect } from 'react';
import { MockConfig, MockExam, UserLevel } from '../types';
import { getMocks, saveMock, migrateFeb2026 } from '../services/mockService';
import { parseTimetableFile } from '../services/geminiService';
import { COURSE_LESSONS } from '../constants';
import { v4 as uuidv4 } from 'uuid';

const MockManager: React.FC = () => {
    const [mocks, setMocks] = useState<MockConfig[]>([]);
    const [selectedMock, setSelectedMock] = useState<MockConfig | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [level, setLevel] = useState<UserLevel>('A-Level');
    const [isActive, setIsActive] = useState(false);
    const [exams, setExams] = useState<MockExam[]>([]);
    const [topics, setTopics] = useState<string[]>([]);

    // Topic Selection State
    const [availableTopics, setAvailableTopics] = useState<string[]>([]);
    const [topicSearch, setTopicSearch] = useState('');

    useEffect(() => {
        loadMocks();
        // Extract all unique chapters from COURSE_LESSONS as topics
        const uniqueTopics = Array.from(new Set(COURSE_LESSONS.map(l => l.chapter))).sort();
        setAvailableTopics(uniqueTopics);
    }, []);

    const loadMocks = async () => {
        const data = await getMocks();
        setMocks(data);
    };

    const handleCreateMock = () => {
        const newMock: MockConfig = {
            id: uuidv4(),
            title: 'New Mock Series',
            level: 'A-Level',
            isActive: false,
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
        setTitle(mock.title);
        setLevel(mock.level);
        setIsActive(mock.isActive);
        setExams(mock.exams || []);
        setTopics(mock.topics || []);
    };

    const handleSave = async () => {
        if (!selectedMock) return;
        setLoading(true);
        try {
            const updatedMock: MockConfig = {
                ...selectedMock,
                title,
                level,
                isActive,
                exams,
                topics
            };
            await saveMock(updatedMock);
            await loadMocks();
            setIsEditing(false);
            setSelectedMock(null);
        } catch (e) {
            console.error(e);
            alert("Failed to save mock.");
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
                // Read CSV as text
                reader.readAsText(file);
                reader.onload = async () => {
                    const text = reader.result as string;
                    // Pass as text/csv mime type, but just raw text in data for simpler handling if service supports it,
                    // or encode to base64 to match uniform interface.
                    // Let's encode to base64 for uniformity in service.
                    const base64 = btoa(text);
                    const extractedExams = await parseTimetableFile(base64, 'text/csv');
                    processExtractedExams(extractedExams);
                };
            } else {
                // Image or PDF -> Base64
                reader.readAsDataURL(file);
                reader.onload = async () => {
                    const result = reader.result as string;
                    // extract raw base64 and mime
                    // Data URL format: "data:[<mediatype>][;base64],<data>"
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
        const newExams: MockExam[] = extractedExams.map((ex: any) => ({
            id: uuidv4(),
            title: `${ex.paper} (${ex.level})`,
            paper: ex.paper,
            date: ex.date,
            time: ex.time,
            duration: ex.duration,
            topics: []
        }));
        setExams(prev => [...prev, ...newExams]);
        setLoading(false);
    };

    const handleAddExam = () => {
        const newExam: MockExam = {
            id: uuidv4(),
            title: 'New Exam',
            paper: 'Paper 1',
            date: new Date().toISOString().split('T')[0],
            time: '09:00',
            duration: '1h 30m',
            topics: []
        };
        setExams([...exams, newExam]);
    };

    const updateExam = (id: string, field: keyof MockExam, value: any) => {
        setExams(exams.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const removeExam = (id: string) => {
        setExams(exams.filter(e => e.id !== id));
    };

    const toggleTopic = (topic: string) => {
        if (topics.includes(topic)) {
            setTopics(topics.filter(t => t !== topic));
        } else {
            setTopics([...topics, topic]);
        }
    };

    // Also need to assign topics TO exams
    // For simplicity, we'll let the user select topics for the whole mock series first (Topic Tracker),
    // and then potentially assign them to specific exams?
    // The requirement says: "select from a list the topics that are going to be on each mock which will then populate the schedule and topic tracker".
    // This implies topics are per mock series OR per exam.
    // In FebMocks, topics are per Exam.
    // So let's allow assigning topics to Exams.

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

    return (
        <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl p-6 h-[85vh] flex gap-6">

            {/* Sidebar List */}
            <div className="w-1/4 border-r border-stone-200 dark:border-stone-700 pr-6 flex flex-col">
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">Mocks</h3>
                    <p className="text-xs text-stone-500">Manage exam seasons.</p>
                </div>
                <button
                    onClick={handleCreateMock}
                    className="w-full py-2 mb-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition shadow-sm"
                >
                    + New Mock Series
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
                        </div>

                        {/* Exams Section */}
                        <div className="bg-stone-50 dark:bg-stone-800/50 p-6 rounded-2xl border border-stone-200 dark:border-stone-700">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">Exams</h3>
                                <div className="flex gap-2">
                                    <label className="cursor-pointer px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-sm flex items-center gap-2">
                                        <span>📷</span> Upload Timetable (Img/PDF/CSV)
                                        <input type="file" accept="image/*,.pdf,.csv" className="hidden" onChange={handleTimetableUpload} />
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
                                            <input
                                                type="date"
                                                value={exam.date}
                                                onChange={e => updateExam(exam.id, 'date', e.target.value)}
                                                className="p-2 rounded border border-stone-300 dark:border-stone-600 text-sm"
                                            />
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
                                            <p className="text-xs font-bold text-stone-500 uppercase mb-2">Topics on this Exam:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {availableTopics.map(topic => (
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
                        <div className="flex justify-end gap-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                            <button onClick={() => { setIsEditing(false); setSelectedMock(null); }} className="px-6 py-2 text-stone-500 font-bold hover:bg-stone-100 rounded-lg">Cancel</button>
                            <button onClick={handleSave} disabled={loading} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transform transition active:scale-95 disabled:opacity-50">
                                {loading ? 'Saving...' : 'Save Mock Series'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-stone-400">
                        <span className="text-6xl mb-4">📅</span>
                        <p>Select a mock series to edit or create a new one.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MockManager;
