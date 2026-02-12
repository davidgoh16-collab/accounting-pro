import React, { useEffect, useState, useMemo } from 'react';
import { AuthUser, TeacherAssessment } from '../types';
import { getTeacherAssessments } from '../services/studentPerformanceService';
import { GradeDashboard } from './GradeDashboard';

interface AssessmentHubViewProps {
    user: AuthUser;
    onBack: () => void;
}

// Helper to determine Paper
const getPaper = (assessment: TeacherAssessment): 'Paper 1' | 'Paper 2' | 'NEA' | 'Other' => {
    // If explicitly set (hypothetically)
    // if (assessment.paper) return assessment.paper;

    const text = (assessment.assessmentTitle + ' ' + assessment.topic).toLowerCase();

    if (text.includes('paper 1') || text.includes('physical') || text.includes('coasts') || text.includes('hazards') || text.includes('water') || text.includes('carbon')) return 'Paper 1';
    if (text.includes('paper 2') || text.includes('human') || text.includes('urban') || text.includes('places') || text.includes('global') || text.includes('resource')) return 'Paper 2';
    if (text.includes('nea') || text.includes('coursework') || text.includes('investigation')) return 'NEA';

    return 'Other';
};

// Helper to determine Type
const getType = (assessment: TeacherAssessment): 'Mock' | 'End of Unit' | 'Other' => {
    // If explicitly set
    if (assessment.type === 'Mock') return 'Mock';

    const text = (assessment.assessmentTitle + ' ' + assessment.topic + ' ' + (assessment.type || '')).toLowerCase();

    if (text.includes('mock')) return 'Mock';
    if (text.includes('end of unit') || text.includes('eou') || text.includes('topic test')) return 'End of Unit';

    return 'Other';
};

export const AssessmentHubView: React.FC<AssessmentHubViewProps> = ({ user, onBack }) => {
    const [assessments, setAssessments] = useState<TeacherAssessment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPaper, setFilterPaper] = useState<'All' | 'Paper 1' | 'Paper 2' | 'NEA'>('All');
    const [filterType, setFilterType] = useState<'All' | 'Mock' | 'End of Unit'>('All');

    // Selected Assessment for Modal
    const [selectedAssessment, setSelectedAssessment] = useState<TeacherAssessment | null>(null);

    useEffect(() => {
        const fetchAssessments = async () => {
            if (user?.email) {
                const data = await getTeacherAssessments(user.email);

                // Deduplicate logic: Map by ID first
                const uniqueMap = new Map();
                data.forEach(item => {
                    // Use ID if available, otherwise create a signature
                    const key = item.id || `${item.assessmentTitle}-${item.timestamp?.seconds}-${item.mark}`;
                    if (!uniqueMap.has(key)) {
                        uniqueMap.set(key, item);
                    }
                });

                setAssessments(Array.from(uniqueMap.values()));
            }
            setIsLoading(false);
        };
        fetchAssessments();
    }, [user?.email]);

    // Filter Logic
    const filteredAssessments = useMemo(() => {
        return assessments.filter(a => {
            const paper = getPaper(a);
            const type = getType(a);
            const matchesSearch = (a.assessmentTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  (a.topic || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPaper = filterPaper === 'All' || paper === filterPaper;
            const matchesType = filterType === 'All' || type === filterType;

            return matchesSearch && matchesPaper && matchesType;
        });
    }, [assessments, searchQuery, filterPaper, filterType]);

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 animate-fade-in pb-24 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition-colors mb-2 font-medium"
                    >
                        <span>←</span> Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-3">
                        <span className="text-4xl">📊</span> My Assessments
                    </h1>
                    <p className="text-stone-500 dark:text-stone-400 mt-2 max-w-2xl">
                        View your overall grade profile, track your progress across papers, and review detailed teacher feedback.
                    </p>
                </div>
            </div>

            {/* Overall Grades Section */}
            <section className="mb-12">
                <h2 className="text-xl font-bold text-stone-700 dark:text-stone-300 mb-4 flex items-center gap-2">
                    <span>🏆</span> Overall Performance
                </h2>
                <GradeDashboard user={user} />
            </section>

            {/* Assessment Table Section */}
            <section>
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2">
                        <span>📝</span> Assessment History
                        <span className="bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full text-xs font-bold text-stone-500 uppercase tracking-wider ml-2">
                            {filteredAssessments.length} Records
                        </span>
                    </h2>

                    {/* Filters Toolbar */}
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-grow md:flex-grow-0">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">🔍</span>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm w-full md:w-48 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <select
                            value={filterPaper}
                            onChange={(e) => setFilterPaper(e.target.value as any)}
                            className="px-4 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="All">All Papers</option>
                            <option value="Paper 1">Paper 1</option>
                            <option value="Paper 2">Paper 2</option>
                            <option value="NEA">NEA</option>
                        </select>

                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                            className="px-4 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="All">All Types</option>
                            <option value="Mock">Mocks</option>
                            <option value="End of Unit">End of Unit</option>
                        </select>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredAssessments.length === 0 ? (
                    <div className="bg-stone-50 dark:bg-stone-900 rounded-xl p-12 text-center border border-stone-200 dark:border-stone-800 border-dashed">
                        <span className="text-4xl mb-4 block">📭</span>
                        <h3 className="text-lg font-bold text-stone-700 dark:text-stone-300">No assessments found</h3>
                        <p className="text-stone-500 dark:text-stone-400 mt-2">
                            Try adjusting your filters or search query.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold">
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Assessment</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Paper</th>
                                        <th className="px-6 py-4 text-right">Mark</th>
                                        <th className="px-6 py-4 text-center">Grade</th>
                                        <th className="px-6 py-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                    {filteredAssessments.map((assessment) => (
                                        <tr
                                            key={assessment.id}
                                            onClick={() => setSelectedAssessment(assessment)}
                                            className="group hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 cursor-pointer transition-colors"
                                        >
                                            <td className="px-6 py-4 text-sm text-stone-500 dark:text-stone-400 whitespace-nowrap">
                                                {assessment.timestamp?.toDate ? assessment.timestamp.toDate().toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-stone-800 dark:text-stone-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                                                    {assessment.assessmentTitle || "Untitled"}
                                                </div>
                                                <div className="text-xs text-stone-400 mt-0.5">{assessment.topic}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs px-2 py-1 rounded font-medium border ${
                                                    getType(assessment) === 'Mock'
                                                    ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800/30 dark:text-purple-300'
                                                    : getType(assessment) === 'End of Unit'
                                                    ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/30 dark:text-blue-300'
                                                    : 'bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400'
                                                }`}>
                                                    {getType(assessment)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-stone-600 dark:text-stone-300">
                                                {getPaper(assessment)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-sm">
                                                {assessment.mark !== undefined && assessment.maxMarks !== undefined ? (
                                                    <span>
                                                        <span className="font-bold text-stone-800 dark:text-stone-200">{assessment.mark}</span>
                                                        <span className="text-stone-400">/{assessment.maxMarks}</span>
                                                        <div className={`text-xs font-bold mt-0.5 ${assessment.percentage !== undefined && assessment.percentage >= 60 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                            {assessment.percentage?.toFixed(0)}%
                                                        </div>
                                                    </span>
                                                ) : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {assessment.grade ? (
                                                    <span className="inline-block w-8 h-8 leading-8 text-center rounded-full bg-stone-100 dark:bg-stone-800 font-black text-stone-800 dark:text-stone-100 text-sm border border-stone-200 dark:border-stone-700">
                                                        {assessment.grade}
                                                    </span>
                                                ) : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline">
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>

            {/* Assessment Detail Modal */}
            {selectedAssessment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-stone-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-start bg-stone-50/50 dark:bg-stone-950/50">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                                        {selectedAssessment.timestamp?.toDate ? selectedAssessment.timestamp.toDate().toLocaleDateString() : 'Date Unknown'}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                        {getPaper(selectedAssessment)}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 leading-tight">
                                    {selectedAssessment.assessmentTitle || "Untitled Assessment"}
                                </h2>
                                <p className="text-stone-500 dark:text-stone-400 mt-1">{selectedAssessment.topic}</p>
                            </div>
                            <button
                                onClick={() => setSelectedAssessment(null)}
                                className="p-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full transition-colors text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto">
                            {/* Score Banner */}
                            {(selectedAssessment.mark !== undefined || selectedAssessment.grade) && (
                                <div className="flex items-center justify-between bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4 mb-6 border border-stone-100 dark:border-stone-800">
                                    <div className="flex items-center gap-4">
                                        {selectedAssessment.grade && (
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-stone-400 uppercase">Grade</span>
                                                <span className="text-3xl font-black text-violet-600 dark:text-violet-400">{selectedAssessment.grade}</span>
                                            </div>
                                        )}
                                        {selectedAssessment.mark !== undefined && (
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-stone-400 uppercase">Mark</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-3xl font-black text-stone-800 dark:text-stone-100">{selectedAssessment.mark}</span>
                                                    <span className="text-stone-400 font-medium">/{selectedAssessment.maxMarks}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {selectedAssessment.percentage !== undefined && (
                                        <div className={`px-4 py-2 rounded-lg font-bold text-lg ${
                                            selectedAssessment.percentage >= 80 ? 'bg-emerald-100 text-emerald-700' :
                                            selectedAssessment.percentage >= 60 ? 'bg-teal-100 text-teal-700' :
                                            selectedAssessment.percentage >= 40 ? 'bg-amber-100 text-amber-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {selectedAssessment.percentage.toFixed(0)}%
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Feedback */}
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <span>💬</span> Teacher Feedback
                                </h3>
                                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-xl border-l-4 border-indigo-500 text-stone-700 dark:text-stone-300 leading-relaxed italic">
                                    "{selectedAssessment.feedback}"
                                </div>
                            </div>

                            {/* Improvement Areas */}
                            {selectedAssessment.improvementAreas && selectedAssessment.improvementAreas.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <span>🎯</span> Focus Areas
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedAssessment.improvementAreas.map((area, idx) => (
                                            <span key={idx} className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-800/30 text-sm font-medium flex items-center gap-2">
                                                <span>•</span> {area}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex justify-end">
                            <button
                                onClick={() => setSelectedAssessment(null)}
                                className="px-6 py-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg font-bold transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
