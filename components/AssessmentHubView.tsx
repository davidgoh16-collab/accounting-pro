import React, { useEffect, useState } from 'react';
import { AuthUser, TeacherAssessment } from '../types';
import { getTeacherAssessments } from '../services/studentPerformanceService';
import { GradeDashboard } from './GradeDashboard';

interface AssessmentHubViewProps {
    user: AuthUser;
    onBack: () => void;
}

export const AssessmentHubView: React.FC<AssessmentHubViewProps> = ({ user, onBack }) => {
    const [assessments, setAssessments] = useState<TeacherAssessment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAssessments = async () => {
            if (user?.email) {
                const data = await getTeacherAssessments();
                setAssessments(data);
            }
            setIsLoading(false);
        };
        fetchAssessments();
    }, [user?.email]);

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 animate-fade-in pb-24">
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

            {/* Assessment History List */}
            <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2">
                        <span>📝</span> Assessment History
                    </h2>
                    <div className="bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full text-xs font-bold text-stone-500 uppercase tracking-wider">
                        {assessments.length} Records
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : assessments.length === 0 ? (
                    <div className="bg-stone-50 dark:bg-stone-900 rounded-xl p-12 text-center border border-stone-200 dark:border-stone-800 border-dashed">
                        <span className="text-4xl mb-4 block">📭</span>
                        <h3 className="text-lg font-bold text-stone-700 dark:text-stone-300">No assessments found</h3>
                        <p className="text-stone-500 dark:text-stone-400 mt-2">
                            When your teacher marks your work, it will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {assessments.map((assessment) => (
                            <AssessmentCard key={assessment.id} assessment={assessment} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

const AssessmentCard: React.FC<{ assessment: TeacherAssessment }> = ({ assessment }) => {
    return (
        <div className="bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                                {assessment.topic || "General Assessment"}
                            </span>
                            <span className="text-stone-400 text-xs">
                                {assessment.timestamp?.toDate ? assessment.timestamp.toDate().toLocaleDateString() : 'Date Unknown'}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">
                            {assessment.assessmentTitle || "Untitled Assessment"}
                        </h3>
                    </div>

                    {assessment.mark !== undefined && assessment.maxMarks !== undefined && (
                        <div className="flex items-center gap-3 bg-stone-50 dark:bg-stone-950 px-4 py-2 rounded-lg border border-stone-100 dark:border-stone-800">
                            <div className="text-right">
                                <div className="text-2xl font-black text-stone-800 dark:text-stone-100 leading-none">
                                    {assessment.mark}
                                    <span className="text-sm text-stone-400 font-medium ml-0.5">/{assessment.maxMarks}</span>
                                </div>
                                {assessment.percentage !== undefined && (
                                    <div className={`text-xs font-bold ${assessment.percentage >= 60 ? 'text-emerald-600' : assessment.percentage >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                                        {assessment.percentage.toFixed(0)}%
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-stone-50 dark:bg-stone-800/50 rounded-lg p-4 border-l-4 border-indigo-500 mb-4">
                    <p className="text-stone-700 dark:text-stone-300 italic">"{assessment.feedback}"</p>
                </div>

                {assessment.improvementAreas && assessment.improvementAreas.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {assessment.improvementAreas.map((area, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-3 py-1 rounded-full text-xs font-semibold border border-red-100 dark:border-red-800/30">
                                <span>🎯</span> {area}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
