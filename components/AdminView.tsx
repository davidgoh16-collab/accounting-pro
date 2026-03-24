
import React, { useState, useEffect, useMemo } from 'react';
import { AuthUser, CompletedSession, ChatSessionLog, LessonProgress, ClassGroup } from '../types';
import { getAllUsers, db, getClasses, createClass, addClassMember, removeClassMember, updateClassDetails, addClassMembers, updateUserRole, deleteClass, deleteUserAccount } from '../firebase';
import { collection, getDocs, query, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import SessionAnalysisView from './SessionAnalysisView';
import GameAnalysisView from './GameAnalysisView';
import SessionDetailView from './SessionDetailView';
import RevisionPlannerContent from './RevisionPlannerContent';
import MockManager from './MockManager';
import ActivityLogViewer from './ActivityLogViewer';
import MockProgressViewer from './MockProgressViewer';
import SafeguardingViewer from './SafeguardingViewer';
import AdminAssistant from './AdminAssistant';
import LessonPracticeView from './LessonPracticeView';
import { COURSE_LESSONS, IGCSE_UNITS, IGCSE_SPEC_TOPICS, GCSE_UNITS, GCSE_SPEC_TOPICS, ALEVEL_UNITS, ALEVEL_SPEC_TOPICS } from '../constants';
import { generateAndSaveMemoryRecallSummary } from '../services/geminiService';

interface AdminViewProps {
    onImpersonate: (user: AuthUser) => void;
    onBack: () => void;
}

type Tab = 'overview' | 'sessions' | 'games' | 'chats' | 'learning' | 'planner' | 'logs' | 'exams';

interface TopicProgressStats {
    total: number;
    completed: number;
    avgScore: number;
}

const FeatureSettingsPanel: React.FC = () => {
    const [limit, setLimit] = useState<number>(50);
    const [imageLimit, setImageLimit] = useState<number>(5);
    const [toggles, setToggles] = useState({
        birdGame: true,
        blockBlast: true,
        practiceQuizzes: true,
        swipeQuizzes: false,
        aiTutor: true,
        ragAssessment: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'settings', 'global');
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data();
                    setLimit(data.dailyRequestLimit ?? 50);
                    setImageLimit(data.dailyImageLimit ?? 5);
                    setToggles(prev => ({ ...prev, ...data.featureToggles }));
                }
            } catch (e) {
                console.error("Failed to load settings", e);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'settings', 'global'), {
                dailyRequestLimit: limit,
                dailyImageLimit: imageLimit,
                featureToggles: toggles
            }, { merge: true });
            alert("Settings saved successfully!");
        } catch (e) {
            console.error("Failed to save settings", e);
            alert("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    const toggleFeature = (key: keyof typeof toggles) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl p-8 max-w-4xl mx-auto animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Feature Control & Limits</h2>
                    <p className="text-stone-500 dark:text-stone-400">Manage feature availability and cost controls.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="space-y-6">
                {/* Cost Control */}
                <div className="bg-stone-50 dark:bg-stone-800 p-6 rounded-2xl border border-stone-200 dark:border-stone-700">
                    <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2 mb-4">
                        <span>💰</span> Cost Control
                    </h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-stone-700 dark:text-stone-200">Daily AI Request Limit (Per User)</p>
                            <p className="text-sm text-stone-500 dark:text-stone-400">Limits the number of AI interactions (Tutor, Marking, Hints) a student can make per day. Set to -1 for unlimited.</p>
                        </div>
                        <input
                            type="number"
                            value={limit}
                            onChange={(e) => setLimit(parseInt(e.target.value))}
                            className="w-24 p-2 text-center rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 font-bold"
                        />
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                        <div>
                            <p className="font-semibold text-stone-700 dark:text-stone-200">Daily Figure Generation Limit</p>
                            <p className="text-sm text-stone-500 dark:text-stone-400">Separate limit for image/diagram generations. (Default: 5)</p>
                        </div>
                        <input
                            type="number"
                            value={imageLimit}
                            onChange={(e) => setImageLimit(parseInt(e.target.value))}
                            className="w-24 p-2 text-center rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 font-bold"
                        />
                    </div>
                </div>

                {/* Memory Recall Content Generation */}
                <div className="bg-stone-50 dark:bg-stone-800 p-6 rounded-2xl border border-stone-200 dark:border-stone-700 mt-6">
                    <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2 mb-6">
                        <span>🧠</span> Memory Recall Content Generator
                    </h3>
                    <p className="text-sm text-stone-500 mb-4">Select a specific topic to pre-generate and save the AI summary and dual-coding images to Firestore. This makes them instantly available for students.</p>
                    <AdminMemoryRecallGenerator />
                </div>

                {/* Feature Toggles */}
                <div className="bg-stone-50 dark:bg-stone-800 p-6 rounded-2xl border border-stone-200 dark:border-stone-700">
                    <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2 mb-6">
                        <span>⚙️</span> Feature Toggles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { key: 'birdGame', label: 'T&T Bird Game', desc: 'Arcade style revision game.' },
                            { key: 'blockBlast', label: 'Block Blast Game', desc: 'Tetris style revision game.' },
                            { key: 'practiceQuizzes', label: 'Practice Quizzes', desc: 'Standard multiple choice quizzes.' },
                            { key: 'swipeQuizzes', label: 'Swipe Quizzes', desc: 'Tinder-style True/False quizzes.' },
                            { key: 'aiTutor', label: 'AI Tutor & Feedback', desc: 'Gemini-powered feedback and hints.' },
                            { key: 'ragAssessment', label: 'RAG Self-Assessment', desc: 'Topic confidence tracking.' },
                        ].map((feature) => (
                            <div key={feature.key} className="flex items-center justify-between p-4 bg-white dark:bg-stone-700 rounded-xl border border-stone-200 dark:border-stone-600">
                                <div>
                                    <p className="font-bold text-stone-800 dark:text-stone-100">{feature.label}</p>
                                    <p className="text-xs text-stone-500 dark:text-stone-400">{feature.desc}</p>
                                </div>
                                <button
                                    onClick={() => toggleFeature(feature.key as keyof typeof toggles)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${toggles[feature.key as keyof typeof toggles] ? 'bg-blue-600' : 'bg-stone-300 dark:bg-stone-500'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${toggles[feature.key as keyof typeof toggles] ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminMemoryRecallGenerator: React.FC = () => {
    const [level, setLevel] = useState<'GCSE' | 'IGCSE' | 'A-Level'>('GCSE');
    const [topic, setTopic] = useState('');
    const [subTopic, setSubTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const units = level === 'IGCSE' ? IGCSE_UNITS : level === 'A-Level' ? ALEVEL_UNITS : GCSE_UNITS;
    const specTopics = level === 'IGCSE' ? IGCSE_SPEC_TOPICS : level === 'A-Level' ? ALEVEL_SPEC_TOPICS : GCSE_SPEC_TOPICS;
    const availableUnits = units.filter(u => u !== 'All Units' && specTopics[u]);

    const handleGenerate = async () => {
        if (!topic || !subTopic) return;
        setIsGenerating(true);
        try {
            await generateAndSaveMemoryRecallSummary(topic, subTopic, level);
            alert(`Successfully generated and saved summary for: ${subTopic}`);
            setSubTopic(''); // Reset to encourage next one
        } catch (e) {
            console.error("Failed to generate memory recall summary", e);
            alert("Failed to generate summary. Check console.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 bg-white dark:bg-stone-700 p-4 rounded-xl border border-stone-200 dark:border-stone-600">
            <div className="flex flex-wrap gap-4">
                <select
                    value={level}
                    onChange={e => { setLevel(e.target.value as any); setTopic(''); setSubTopic(''); }}
                    className="p-2 border rounded-md"
                >
                    <option value="GCSE">GCSE</option>
                    <option value="IGCSE">IGCSE</option>
                    <option value="A-Level">A-Level</option>
                </select>

                <select
                    value={topic}
                    onChange={e => { setTopic(e.target.value); setSubTopic(''); }}
                    className="p-2 border rounded-md min-w-[200px]"
                >
                    <option value="">Select Topic</option>
                    {availableUnits.map(u => <option key={u} value={u}>{u}</option>)}
                </select>

                <select
                    value={subTopic}
                    onChange={e => setSubTopic(e.target.value)}
                    className="p-2 border rounded-md min-w-[250px]"
                    disabled={!topic}
                >
                    <option value="">Select Sub-Topic</option>
                    {topic && specTopics[topic]?.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <button
                    onClick={handleGenerate}
                    disabled={!topic || !subTopic || isGenerating}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-md disabled:opacity-50 transition-colors ml-auto"
                >
                    {isGenerating ? 'Generating...' : 'Generate & Save'}
                </button>
            </div>
            {isGenerating && <p className="text-sm text-emerald-600 font-semibold animate-pulse">This process takes 10-30 seconds. Do not close the window.</p>}
        </div>
    );
};

const ClassManager: React.FC<{
    classes: ClassGroup[],
    allUsers: AuthUser[],
    onRefreshClasses: () => void
}> = ({ classes, allUsers, onRefreshClasses }) => {
    const [selectedClass, setSelectedClass] = useState<ClassGroup | null>(null);
    const [newClassName, setNewClassName] = useState('');
    const [newYearGroup, setNewYearGroup] = useState(''); // Force explicit selection
    const [isCreating, setIsCreating] = useState(false);
    const [studentSearch, setStudentSearch] = useState('');

    // Edit Class Details State
    const [isEditingName, setIsEditingName] = useState(false);
    const [editingName, setEditingName] = useState('');
    const [editingYear, setEditingYear] = useState('11');

    // Bulk Add State
    const [selectedStudentsToAdd, setSelectedStudentsToAdd] = useState<string[]>([]);

    useEffect(() => {
        if (selectedClass) {
            setEditingName(selectedClass.name);
            setEditingYear(selectedClass.yearGroup || '11');
            setIsEditingName(false);
            setSelectedStudentsToAdd([]);
        }
    }, [selectedClass]);

    const handleCreateClass = async () => {
        if (!newClassName.trim()) return;
        setIsCreating(true);
        try {
            await createClass(newClassName, newYearGroup);
            setNewClassName('');
            onRefreshClasses();
        } catch (e) {
            console.error(e);
            alert("Failed to create class");
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdateClassDetails = async () => {
        if (!selectedClass || !editingName.trim()) return;
        try {
            await updateClassDetails(selectedClass.id, editingName, editingYear);
            onRefreshClasses();
            setSelectedClass(prev => prev ? ({...prev, name: editingName, yearGroup: editingYear}) : null);
            setIsEditingName(false);
        } catch (e) {
            console.error(e);
            alert("Failed to update class details");
        }
    };

    const toggleClassLessonMode = async () => {
        if (!selectedClass) return;
        const newStatus = !selectedClass.isLessonMode;
        try {
            await updateDoc(doc(db, 'classes', selectedClass.id), { isLessonMode: newStatus });
            onRefreshClasses();
            setSelectedClass(prev => prev ? ({ ...prev, isLessonMode: newStatus }) : null);
        } catch (e) {
            console.error(e);
            alert("Failed to toggle lesson mode");
        }
    };

    const handleDeleteClass = async () => {
        if (!selectedClass) return;
        if (!confirm(`Are you sure you want to delete "${selectedClass.name}"? This cannot be undone.`)) return;
        try {
            await deleteClass(selectedClass.id);
            onRefreshClasses();
            setSelectedClass(null);
        } catch (e) {
            console.error(e);
            alert("Failed to delete class");
        }
    };

    const handleRemoveStudent = async (studentId: string) => {
        if (!selectedClass) return;
        if (!confirm("Remove student from class?")) return;
        try {
            await removeClassMember(selectedClass.id, studentId);
            onRefreshClasses();
            setSelectedClass(prev => prev ? ({...prev, studentIds: prev.studentIds.filter(id => id !== studentId)}) : null);
        } catch (e) {
            console.error(e);
            alert("Failed to remove student");
        }
    };

    const handleBulkAdd = async () => {
        if (!selectedClass || selectedStudentsToAdd.length === 0) return;
        try {
            await addClassMembers(selectedClass.id, selectedStudentsToAdd);
            onRefreshClasses();
            setSelectedClass(prev => prev ? ({...prev, studentIds: [...prev.studentIds, ...selectedStudentsToAdd]}) : null);
            setSelectedStudentsToAdd([]);
        } catch (e) {
            console.error(e);
            alert("Failed to add students");
        }
    };

    const toggleStudentSelection = (uid: string) => {
        setSelectedStudentsToAdd(prev =>
            prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
        );
    };

    const filteredStudentsToAdd = allUsers.filter(u =>
        !(selectedClass?.studentIds || []).includes(u.uid) &&
        ((u.displayName?.toLowerCase() || '').includes(studentSearch.toLowerCase()) ||
         (u.email?.toLowerCase() || '').includes(studentSearch.toLowerCase()))
    );

    return (
        <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl p-6 h-[85vh] flex gap-6">
            {/* List of Classes */}
            <div className="w-1/3 flex flex-col border-r border-stone-200 dark:border-stone-700 pr-6">
                <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4">Classes</h3>
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newClassName}
                        onChange={e => setNewClassName(e.target.value)}
                        placeholder="New Class Name"
                        className="flex-1 px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-sm"
                    />
                    <select
                        value={newYearGroup}
                        onChange={e => setNewYearGroup(e.target.value)}
                        className={`px-2 py-2 rounded-lg border text-sm font-bold ${!newYearGroup ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800'}`}
                    >
                        <option value="">Select Year</option>
                        <option value="10">Y10</option>
                        <option value="11">Y11</option>
                        <option value="12">Y12</option>
                        <option value="13">Y13</option>
                    </select>
                    <button
                        onClick={handleCreateClass}
                        disabled={isCreating || !newClassName.trim() || !newYearGroup}
                        className="px-3 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm disabled:opacity-50"
                    >
                        +
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                    {classes.map(cls => (
                        <button
                            key={cls.id}
                            onClick={() => setSelectedClass(cls)}
                            className={`w-full text-left p-3 rounded-xl transition-all border ${selectedClass?.id === cls.id ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-700' : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700'}`}
                        >
                            <div className="flex justify-between items-center">
                                <p className="font-bold text-stone-800 dark:text-stone-200">{cls.name}</p>
                                <span className="text-[10px] font-bold bg-stone-100 dark:bg-stone-700 px-1.5 py-0.5 rounded text-stone-500">Y{cls.yearGroup}</span>
                            </div>
                            <p className="text-xs text-stone-500">{(cls.studentIds || []).length} Students</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Class Details */}
            <div className="flex-1 flex flex-col">
                {selectedClass ? (
                    <>
                        <div className="mb-6 flex justify-between items-start">
                            <div>
                                {isEditingName ? (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="text"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                className="text-2xl font-bold text-stone-800 dark:text-stone-100 bg-transparent border-b border-stone-400 focus:border-indigo-500 outline-none"
                                            />
                                            <select
                                                value={editingYear}
                                                onChange={e => setEditingYear(e.target.value)}
                                                className="text-lg font-bold bg-transparent border-b border-stone-400 outline-none"
                                            >
                                                <option value="10">Year 10</option>
                                                <option value="11">Year 11</option>
                                                <option value="12">Year 12</option>
                                                <option value="13">Year 13</option>
                                            </select>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={handleUpdateClassDetails} className="text-green-600 hover:text-green-700 text-sm font-bold">Save</button>
                                            <button onClick={() => setIsEditingName(false)} className="text-stone-400 hover:text-stone-600 text-sm">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-2 items-center">
                                        <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{selectedClass.name}</h3>
                                        <span className="text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full font-bold">Year {selectedClass.yearGroup}</span>
                                        <button onClick={() => setIsEditingName(true)} className="text-stone-400 hover:text-indigo-500 transition">
                                            ✏️
                                        </button>
                                    </div>
                                )}
                                <p className="text-stone-500 text-sm mt-1">{(selectedClass.studentIds || []).length} Students Enrolled</p>

                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase text-stone-500">Lesson Mode:</span>
                                    <button
                                        onClick={toggleClassLessonMode}
                                        className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${selectedClass.isLessonMode ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500'}`}
                                    >
                                        {selectedClass.isLessonMode ? 'Enforced' : 'Disabled'}
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={handleDeleteClass}
                                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg transition self-start"
                            >
                                Delete Class
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                            {/* Enrolled Students */}
                            <div className="flex-1 bg-stone-50 dark:bg-stone-800 rounded-2xl p-4 overflow-y-auto custom-scrollbar">
                                <h4 className="font-bold text-stone-700 dark:text-stone-300 mb-3 text-sm uppercase">Enrolled Students</h4>
                                {(selectedClass.studentIds || []).length === 0 && <p className="text-stone-400 text-sm italic">No students yet.</p>}
                                <div className="space-y-2">
                                    {(selectedClass.studentIds || []).map(sid => {
                                        const student = allUsers.find(u => u.uid === sid);
                                        return (
                                            <div key={sid} className="flex justify-between items-center p-2 bg-white dark:bg-stone-700 rounded-lg shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                                        {student?.displayName?.[0] || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-stone-800 dark:text-stone-200">{student?.displayName || 'Unknown User'}</p>
                                                        <p className="text-[10px] text-stone-500">{student?.email}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleRemoveStudent(sid)} className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 rounded bg-red-50 dark:bg-red-900/20">Remove</button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Add Student */}
                            <div className="bg-white dark:bg-stone-800 rounded-2xl p-4 border border-stone-200 dark:border-stone-700 flex flex-col h-[40%]">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-bold text-stone-700 dark:text-stone-300 text-sm uppercase">Add Students</h4>
                                    {selectedStudentsToAdd.length > 0 && (
                                        <button
                                            onClick={handleBulkAdd}
                                            className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm transition-all"
                                        >
                                            Add {selectedStudentsToAdd.length} Selected
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search student name or email..."
                                    value={studentSearch}
                                    onChange={e => setStudentSearch(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-900 text-sm mb-3"
                                />
                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                                    {filteredStudentsToAdd.map(u => {
                                        const isSelected = selectedStudentsToAdd.includes(u.uid);
                                        return (
                                            <button
                                                key={u.uid}
                                                onClick={() => toggleStudentSelection(u.uid)}
                                                className={`w-full text-left flex justify-between items-center p-2 rounded-lg transition-all border ${isSelected ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-900/30 dark:border-indigo-700' : 'hover:bg-stone-100 dark:hover:bg-stone-700 border-transparent'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-stone-400'}`}>
                                                        {isSelected && <span className="text-white text-[10px]">✓</span>}
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="font-bold text-stone-800 dark:text-stone-200">{u.displayName}</span>
                                                        <span className="text-stone-400 text-xs ml-2">{u.email}</span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                    {filteredStudentsToAdd.length === 0 && <p className="text-xs text-stone-400 p-2">No matching students found.</p>}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-stone-400">
                        Select a class to manage
                    </div>
                )}
            </div>
        </div>
    );
};

const LearningProgressViewer: React.FC<{ user: AuthUser }> = ({ user }) => {
    const [progressData, setProgressData] = useState<Record<string, Record<string, LessonProgress>>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            setLoading(true);
            try {
                // Get all unique chapters relevant to the user's level, or all if undefined
                const relevantLessons = user.level 
                    ? COURSE_LESSONS // In a real scenario, we might filter COURSE_LESSONS by level here if ids overlapped, but mostly they are distinct enough or we check chapters.
                    : COURSE_LESSONS; 
                
                const allTopics = Array.from(new Set(relevantLessons.map(l => l.chapter)));
                
                const newProgress: Record<string, Record<string, LessonProgress>> = {};
                
                await Promise.all(allTopics.map(async (topic) => {
                    const docRef = doc(db, 'users', user.uid, 'learning_progress', topic);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        newProgress[topic] = docSnap.data() as Record<string, LessonProgress>;
                    }
                }));
                setProgressData(newProgress);
            } catch (error) {
                console.error("Error fetching learning progress:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, [user]);

    const stats = useMemo(() => {
        let totalLessons = 0;
        let completedLessons = 0;
        let totalScore = 0;
        let scoreCount = 0;
        
        // Filter lessons by user level if present to calculate total available correctly
        // (Assuming COURSE_LESSONS contains everything, we rely on chapter matching)
        const userLessons = user.level === 'GCSE' 
            ? COURSE_LESSONS.filter(l => l.id.startsWith('G-')) 
            : user.level === 'A-Level' 
                ? COURSE_LESSONS.filter(l => !l.id.startsWith('G-'))
                : COURSE_LESSONS;

        const topicStats: Record<string, TopicProgressStats> = {};

        userLessons.forEach(lesson => {
            if (!topicStats[lesson.chapter]) {
                topicStats[lesson.chapter] = { total: 0, completed: 0, avgScore: 0 };
            }
            topicStats[lesson.chapter].total++;
            totalLessons++;

            const lessonProg = progressData[lesson.chapter]?.[lesson.id];
            if (lessonProg?.completed) {
                completedLessons++;
                topicStats[lesson.chapter].completed++;
                
                totalScore += lessonProg.score;
                scoreCount++;
                // Accumulate score for topic average calculation later if needed, 
                // but simpler to just use scoreCount per topic loop if we wanted strict topic avgs.
            }
        });

        const overallAvg = scoreCount > 0 ? totalScore / scoreCount : 0;

        return {
            totalLessons,
            completedLessons,
            overallAvg,
            topicStats
        };
    }, [progressData, user.level]);

    if (loading) return <div className="text-center p-8 text-stone-500">Loading learning progress...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-700">
                    <p className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase">Course Progress</p>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{stats.completedLessons}</span>
                        <span className="text-lg text-stone-400 mb-1">/ {stats.totalLessons}</span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2 mt-3">
                        <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${(stats.completedLessons / stats.totalLessons) * 100}%` }}></div>
                    </div>
                </div>
                <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-700">
                    <p className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase">Average Score</p>
                    <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{stats.overallAvg.toFixed(0)}%</p>
                    <p className="text-xs text-stone-400 mt-2">Across completed lessons</p>
                </div>
                <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-700">
                    <p className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase">Active Topics</p>
                    <p className="text-4xl font-bold text-amber-500 mt-2">
                        {Object.values(stats.topicStats).filter((t: TopicProgressStats) => t.completed > 0).length}
                    </p>
                    <p className="text-xs text-stone-400 mt-2">Chapters started</p>
                </div>
            </div>

            {/* Topic Breakdown */}
            <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-700 p-6">
                <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-6">Topic Breakdown</h3>
                <div className="space-y-6">
                    {Object.entries(stats.topicStats)
                        .sort(([, a], [, b]) => (b as TopicProgressStats).completed - (a as TopicProgressStats).completed) // Sort by most active
                        .map(([topic, data]) => {
                            const statsData = data as TopicProgressStats;
                            if (statsData.total === 0) return null;
                            const percent = (statsData.completed / statsData.total) * 100;
                            return (
                                <div key={topic}>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-stone-700 dark:text-stone-300 text-sm">{topic}</h4>
                                        <span className="text-xs font-bold text-stone-500">{statsData.completed}/{statsData.total}</span>
                                    </div>
                                    <div className="w-full bg-stone-100 dark:bg-stone-700 rounded-full h-3">
                                        <div 
                                            className={`h-full rounded-full transition-all ${percent === 100 ? 'bg-emerald-500' : percent > 0 ? 'bg-indigo-500' : 'bg-stone-300 dark:bg-stone-600'}`} 
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                    {/* Expandable Lesson Details could go here */}
                                    {statsData.completed > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {Object.entries(progressData[topic] || {}).map(([lessonId, prog]) => {
                                                const progress = prog as LessonProgress;
                                                return (
                                                <span key={lessonId} className={`text-[10px] px-2 py-1 rounded border ${progress.completed ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' : 'bg-stone-50 border-stone-200 text-stone-500'}`}>
                                                    {lessonId.replace(/[^0-9.]/g, '')}: {progress.score.toFixed(0)}%
                                                </span>
                                            )})}
                                        </div>
                                    )}
                                </div>
                            );
                    })}
                </div>
            </div>
        </div>
    );
};

const StudentInspector: React.FC<{ user: AuthUser, onImpersonate: (u: AuthUser) => void, onDeleteUser: (uid: string) => void, onUploadWork: (u: AuthUser) => void, onUpdateUser: (updatedUser: AuthUser) => void }> = ({ user, onImpersonate, onDeleteUser, onUploadWork, onUpdateUser }) => {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [viewSession, setViewSession] = useState<CompletedSession | null>(null);
    const [roleLoading, setRoleLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const TabButton = ({ id, label, icon }: { id: Tab, label: string, icon: string }) => (
        <button 
            onClick={() => { setActiveTab(id); setViewSession(null); }}
            className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === id ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
        >
            <span>{icon}</span>
            {label}
        </button>
    );

    const handleRoleUpdate = async () => {
        const newRole = user.role === 'admin' ? 'student' : 'admin';
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

        setRoleLoading(true);
        try {
            await updateUserRole(user.uid, newRole);
            alert(`User role updated to ${newRole}.`);
            onUpdateUser({...user, role: newRole});
        } catch (e) {
            console.error(e);
            alert("Failed to update role");
        } finally {
            setRoleLoading(false);
        }
    };

    const handleToggleLessonMode = async () => {
        const newStatus = !user.forcedLessonMode;
        try {
            await updateDoc(doc(db, 'users', user.uid), { forcedLessonMode: newStatus });
            onUpdateUser({ ...user, forcedLessonMode: newStatus });
        } catch (e) {
            console.error(e);
            alert("Failed to toggle lesson mode.");
        }
    };

    const handleDeleteUser = async () => {
        if (!confirm(`DANGER: Are you sure you want to DELETE user "${user.displayName}"?\n\nThis will remove them from all classes and delete their data permanently. This cannot be undone.`)) return;

        setIsDeleting(true);
        try {
            await deleteUserAccount(user.uid);
            onDeleteUser(user.uid);
        } catch (e) {
            console.error(e);
            alert("Failed to delete user.");
            setIsDeleting(false);
        }
    };

    return (
        <div className="animate-fade-in h-full flex flex-col">
             <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl p-6 mb-6 flex-shrink-0">
                <div className="flex flex-wrap gap-4 justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            {user.displayName ? user.displayName[0].toUpperCase() : '?'}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{user.displayName || 'Unknown User'}</h2>
                            <p className="text-stone-500 dark:text-stone-400 font-mono text-sm">{user.email}</p>
                            <div className="flex gap-2 mt-1">
                                <p className="text-xs text-stone-400 dark:text-stone-500 uppercase tracking-wider font-semibold">UID: {user.uid}</p>
                                {user.level && <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{user.level}</span>}
                                {user.role === 'admin' && <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Admin</span>}
                                {user.forcedLessonMode && <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Lesson Mode</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleToggleLessonMode}
                            className={`px-3 py-3 rounded-xl font-bold transition shadow-sm border text-xs ${user.forcedLessonMode ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-stone-100 text-stone-600 border-stone-200'}`}
                        >
                            {user.forcedLessonMode ? 'Disable Lesson Mode' : 'Enable Lesson Mode'}
                        </button>
                        <button
                            onClick={() => onUploadWork(user)}
                            className="px-3 py-3 bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-xl hover:bg-blue-200 transition shadow-sm text-xs"
                        >
                            📤 Upload Work
                        </button>
                        <button
                            onClick={handleRoleUpdate}
                            disabled={roleLoading}
                            className={`px-4 py-3 rounded-xl font-bold transition shadow-sm border ${user.role === 'admin' ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'}`}
                        >
                            {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                        </button>
                        <button
                            onClick={() => onImpersonate(user)}
                            className="px-6 py-3 bg-amber-400 text-black font-bold rounded-xl hover:bg-amber-500 transition shadow-md flex items-center gap-2"
                        >
                            <span>👓</span> View
                        </button>
                        <button
                            onClick={handleDeleteUser}
                            disabled={isDeleting}
                            className="px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-md disabled:opacity-50"
                            title="Delete User Account"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-t-3xl shadow-xl flex-shrink-0 overflow-hidden">
                <div className="flex border-b border-stone-200 dark:border-stone-700 overflow-x-auto">
                    <TabButton id="overview" label="Overview" icon="📊" />
                    <TabButton id="logs" label="Activity" icon="📋" />
                    <TabButton id="exams" label="Exam Prep" icon="📝" />
                    <TabButton id="learning" label="Academy" icon="🎓" />
                    <TabButton id="planner" label="Planner" icon="📅" />
                    <TabButton id="sessions" label="Sessions" icon="📝" />
                    <TabButton id="games" label="Games" icon="🎮" />
                    <TabButton id="chats" label="Chats" icon="💬" />
                </div>
            </div>

            <div className="bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm border-x border-b border-stone-200/50 dark:border-stone-700 rounded-b-3xl shadow-xl p-6 flex-grow overflow-y-auto custom-scrollbar min-h-[500px]">
                {activeTab === 'overview' && (
                    <div className="text-center py-12">
                        <h3 className="text-2xl font-bold text-stone-700 dark:text-stone-300">Student Overview</h3>
                        <p className="text-stone-500 dark:text-stone-400 mt-2">Select a tab above to inspect specific activities.</p>
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-700">
                                <p className="text-stone-500 dark:text-stone-400 font-semibold uppercase text-xs">Account Type</p>
                                <p className="text-xl font-bold text-stone-800 dark:text-stone-100 mt-1">Student</p>
                            </div>
                             <div className="p-6 bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-700">
                                <p className="text-stone-500 dark:text-stone-400 font-semibold uppercase text-xs">Access Level</p>
                                <p className="text-xl font-bold text-stone-800 dark:text-stone-100 mt-1">Standard</p>
                            </div>
                            <div className="p-6 bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-700">
                                <p className="text-stone-500 dark:text-stone-400 font-semibold uppercase text-xs">Study Level</p>
                                <p className="text-xl font-bold text-stone-800 dark:text-stone-100 mt-1">{user.level || 'Not Selected'}</p>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'logs' && <ActivityLogViewer user={user} />}
                {activeTab === 'exams' && <MockProgressViewer user={user} />}
                {activeTab === 'learning' && <LearningProgressViewer user={user} />}
                {activeTab === 'planner' && <RevisionPlannerContent user={user} />}
                {activeTab === 'sessions' && (
                    viewSession ? 
                    <SessionDetailView session={viewSession} onBack={() => setViewSession(null)} /> :
                    <SessionAnalysisView onViewSession={setViewSession} user={user} onBack={() => setActiveTab('overview')} isAdmin={true} />
                )}
                {activeTab === 'games' && <GameAnalysisView user={user} onBack={() => setActiveTab('overview')} />}
                {activeTab === 'chats' && <ChatLogViewer user={user} />}
            </div>
        </div>
    );
};

const ChatLogViewer: React.FC<{ user: AuthUser }> = ({ user }) => {
    const [logs, setLogs] = useState<ChatSessionLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState<ChatSessionLog | null>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const generalLogsRef = collection(db, 'users', user.uid, 'chat_logs');
                const tutorLogsRef = collection(db, 'users', user.uid, 'tutor_logs');
                const mathsLogsRef = collection(db, 'users', user.uid, 'maths_logs');

                const [genSnap, tutorSnap, mathsSnap] = await Promise.all([
                    getDocs(query(generalLogsRef)),
                    getDocs(query(tutorLogsRef)),
                    getDocs(query(mathsLogsRef))
                ]);

                const allLogs: ChatSessionLog[] = [
                    ...genSnap.docs.map(d => d.data() as ChatSessionLog),
                    ...tutorSnap.docs.map(d => d.data() as ChatSessionLog),
                    ...mathsSnap.docs.map(d => d.data() as ChatSessionLog)
                ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                setLogs(allLogs);
            } catch (e) {
                console.error("Error fetching chat logs", e);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [user]);

    if (loading) return <div className="text-center p-8">Loading communication history...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            <div className="lg:col-span-1 border-r border-stone-200 dark:border-stone-700 pr-4 overflow-y-auto custom-scrollbar">
                <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-4 sticky top-0 bg-stone-50 dark:bg-stone-900 p-2 z-10">Conversation History ({logs.length})</h3>
                <div className="space-y-2">
                    {logs.length === 0 && <p className="text-stone-500 text-sm">No conversations recorded.</p>}
                    {logs.map(log => (
                        <button
                            key={log.id}
                            onClick={() => setSelectedLog(log)}
                            className={`w-full text-left p-3 rounded-xl transition-all border ${selectedLog?.id === log.id ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 ring-1 ring-blue-300' : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${log.type === 'general' ? 'bg-green-100 text-green-800' : log.type === 'tutor' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                    {log.type}
                                </span>
                                <span className="text-xs text-stone-400">{new Date(log.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="font-semibold text-stone-800 dark:text-stone-200 text-sm truncate">{log.context || 'General Chat'}</p>
                            <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-1">{log.preview}</p>
                        </button>
                    ))}
                </div>
            </div>
            <div className="lg:col-span-2 flex flex-col h-full bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                {selectedLog ? (
                    <>
                        <div className="p-4 border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{selectedLog.type === 'general' ? '🌍' : selectedLog.type === 'tutor' ? '👨‍🏫' : '🧮'}</span>
                                <div>
                                    <h3 className="font-bold text-stone-800 dark:text-stone-100">{selectedLog.context || 'General Chat Session'}</h3>
                                    <p className="text-xs text-stone-500 dark:text-stone-400">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {selectedLog.messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap shadow-sm ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-bl-none'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-stone-400 dark:text-stone-500">
                        Select a conversation to view the transcript
                    </div>
                )}
            </div>
        </div>
    );
};

const AdminView: React.FC<AdminViewProps> = ({ onImpersonate, onBack }) => {
    const [viewMode, setViewMode] = useState<'students' | 'settings' | 'classes' | 'mocks' | 'safeguarding' | 'assistant' | 'upload_work'>('students');
    const [users, setUsers] = useState<AuthUser[]>([]);
    const [classes, setClasses] = useState<ClassGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
    const [uploadTargetUser, setUploadTargetUser] = useState<AuthUser | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState<'All' | 'GCSE' | 'A-Level'>('All');
    const [classFilter, setClassFilter] = useState<string>('All');
    const [showAdmins, setShowAdmins] = useState(false);

    const fetchClasses = async () => {
        try {
            const cls = await getClasses();
            setClasses(cls);
        } catch (e) {
            console.error("Failed to fetch classes", e);
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const userList = await getAllUsers();
                setUsers(userList);
                if (userList.length > 0 && !selectedUser) {
                    setSelectedUser(userList[0]);
                }
            } catch (error) {
                console.error("Failed to fetch users:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
        fetchClasses();
    }, []);

    const handleUserUpdate = (updatedUser: AuthUser) => {
        setUsers(prev => prev.map(u => u.uid === updatedUser.uid ? updatedUser : u));
        if (selectedUser?.uid === updatedUser.uid) {
            setSelectedUser(updatedUser);
        }
    };

    const handleUploadWork = (user: AuthUser) => {
        setUploadTargetUser(user);
        setViewMode('upload_work');
    };

    if (viewMode === 'upload_work' && uploadTargetUser) {
        // Pass uploadTargetUser as both so LessonPracticeView behaves as if it's the student
        return <LessonPracticeView user={uploadTargetUser} targetUser={uploadTargetUser} onBack={() => { setViewMode('students'); setUploadTargetUser(null); }} />;
    }

    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.displayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        if (showAdmins) {
            return matchesSearch && u.role === 'admin';
        }

        const matchesLevel = levelFilter === 'All' || u.level === levelFilter;
        const matchesClass = classFilter === 'All' || classes.find(c => c.id === classFilter)?.studentIds.includes(u.uid);
        // Exclude admins from the student list
        return matchesSearch && matchesLevel && matchesClass && u.role !== 'admin';
    });

    return (
        <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-transparent">
            <button 
                onClick={() => {
                    if (viewMode === 'assistant') {
                        setViewMode('students');
                    } else {
                        onBack();
                    }
                }}
                className="fixed top-24 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-stone-800/80 backdrop-blur-md border border-stone-200 dark:border-stone-700 rounded-full shadow-sm hover:bg-white dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 font-bold transition-all"
            >
                <span>&larr;</span> {viewMode === 'assistant' ? 'Admin Dashboard' : 'Back'}
            </button>

            <div className="max-w-[95vw] mx-auto mt-12">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-stone-800 dark:text-stone-100">Admin Centre</h1>
                        <p className="text-stone-600 dark:text-stone-400 mt-2">Monitor student progress, review activity logs, and inspect performance.</p>
                    </div>
                    <div className="flex gap-2 bg-white/80 dark:bg-stone-800/80 p-1 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700">
                        <button
                            onClick={() => setViewMode('students')}
                            className={`px-4 py-2 rounded-lg font-bold transition-all ${viewMode === 'students' ? 'bg-indigo-500 text-white shadow-md' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700'}`}
                        >
                            Students
                        </button>
                         <button
                            onClick={() => setViewMode('classes')}
                            className={`px-4 py-2 rounded-lg font-bold transition-all ${viewMode === 'classes' ? 'bg-indigo-500 text-white shadow-md' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700'}`}
                        >
                            Classes
                        </button>
                        <button
                            onClick={() => setViewMode('mocks')}
                            className={`px-4 py-2 rounded-lg font-bold transition-all ${viewMode === 'mocks' ? 'bg-indigo-500 text-white shadow-md' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700'}`}
                        >
                            Exams
                        </button>
                        <button
                            onClick={() => setViewMode('safeguarding')}
                            className={`px-4 py-2 rounded-lg font-bold transition-all ${viewMode === 'safeguarding' ? 'bg-red-500 text-white shadow-md' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700'}`}
                        >
                            Safeguarding
                        </button>
                        <button
                            onClick={() => setViewMode('assistant')}
                            className={`px-4 py-2 rounded-lg font-bold transition-all ${viewMode === 'assistant' ? 'bg-indigo-500 text-white shadow-md' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700'}`}
                        >
                            AI Analyst
                        </button>
                        <button
                            onClick={() => setViewMode('settings')}
                            className={`px-4 py-2 rounded-lg font-bold transition-all ${viewMode === 'settings' ? 'bg-indigo-500 text-white shadow-md' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700'}`}
                        >
                            Settings
                        </button>
                    </div>
                </header>
                
                {viewMode === 'settings' ? (
                    <FeatureSettingsPanel />
                ) : viewMode === 'mocks' ? (
                    <MockManager />
                ) : viewMode === 'safeguarding' ? (
                    <SafeguardingViewer />
                ) : viewMode === 'assistant' ? (
                    <div className="h-[85vh]">
                        <AdminAssistant users={users} classes={classes} />
                    </div>
                ) : viewMode === 'classes' ? (
                    <ClassManager classes={classes} allUsers={users} onRefreshClasses={fetchClasses} />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[85vh]">
                        {/* Sidebar User List */}
                        <div className="lg:col-span-1 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-stone-200 dark:border-stone-700 bg-white/50 dark:bg-stone-800/50">
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2 bg-stone-100 dark:bg-stone-800 border-transparent focus:bg-white dark:focus:bg-stone-900 border focus:border-indigo-500 rounded-lg text-sm transition-all text-stone-800 dark:text-stone-200"
                                />

                                <div className="flex gap-2 mt-3 p-1 bg-stone-100 dark:bg-stone-900 rounded-lg">
                                    <button
                                        onClick={() => setShowAdmins(false)}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${!showAdmins ? 'bg-white dark:bg-stone-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
                                    >
                                        Students
                                    </button>
                                    <button
                                        onClick={() => setShowAdmins(true)}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${showAdmins ? 'bg-white dark:bg-stone-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
                                    >
                                        Admins
                                    </button>
                                </div>

                                {!showAdmins && (
                                    <>
                                        <div className="flex gap-2 mt-3">
                                            {(['All', 'GCSE', 'A-Level'] as const).map(level => (
                                                <button
                                                    key={level}
                                                    onClick={() => setLevelFilter(level)}
                                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md border transition-colors ${
                                                        levelFilter === level
                                                        ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-700'
                                                        : 'bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700'
                                                    }`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                        <select
                                            value={classFilter}
                                            onChange={(e) => setClassFilter(e.target.value)}
                                            className="w-full mt-2 p-1.5 rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-bold text-stone-600 dark:text-stone-300 focus:ring-1 focus:ring-indigo-500 outline-none"
                                        >
                                            <option value="All">All Classes</option>
                                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </>
                                )}
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                                {isLoading ? (
                                    <div className="p-4 text-center text-stone-500">Loading users...</div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="p-4 text-center text-stone-500 text-sm">
                                        {showAdmins ? 'No admin accounts found.' : 'No students found matching filters.'}
                                    </div>
                                ) : (
                                    filteredUsers.map(user => (
                                        <button
                                            key={user.uid}
                                            onClick={() => setSelectedUser(user)}
                                            className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${selectedUser?.uid === user.uid ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${selectedUser?.uid === user.uid ? 'bg-white/20 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400'}`}>
                                                {user.displayName ? user.displayName[0].toUpperCase() : '?'}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-bold text-sm truncate">{user.displayName || 'Unnamed'}</p>
                                                <div className="flex items-center gap-1">
                                                    <p className={`text-xs truncate ${selectedUser?.uid === user.uid ? 'text-indigo-100' : 'text-stone-400'}`}>{user.email}</p>
                                                    {user.level && (
                                                        <span className={`text-[10px] px-1.5 rounded-full font-bold ${selectedUser?.uid === user.uid ? 'bg-white/20 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-500'}`}>
                                                            {user.level}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                            <div className="p-3 bg-stone-50 dark:bg-stone-800 text-center text-xs text-stone-400 border-t border-stone-200 dark:border-stone-700">
                                {filteredUsers.length} {showAdmins ? 'Admins' : 'Students'} Found
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-3 flex flex-col h-full overflow-hidden">
                             {selectedUser ? (
                                <StudentInspector
                                    user={selectedUser}
                                    onImpersonate={onImpersonate}
                                    onDeleteUser={(uid) => {
                                        setUsers(prev => prev.filter(u => u.uid !== uid));
                                        setSelectedUser(null);
                                    }}
                                    onUploadWork={handleUploadWork}
                                    onUpdateUser={handleUserUpdate}
                                />
                             ) : (
                                <div className="flex-1 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl flex flex-col items-center justify-center text-stone-400 dark:text-stone-500">
                                    <span className="text-6xl mb-4 opacity-50">👋</span>
                                    <p className="text-xl font-semibold">Select a student to inspect their activity.</p>
                                </div>
                             )}
                        </div>
                    </div>
                )}
            </div>
             <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>

             {/* Floating AI Assistant (Visible when NOT in full AI mode) */}
             {viewMode !== 'assistant' && (
                 <AdminAssistant users={users} classes={classes} isFloating={true} />
             )}
        </div>
    );
};

export default AdminView;
