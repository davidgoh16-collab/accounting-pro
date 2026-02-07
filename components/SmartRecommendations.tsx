import React, { useEffect, useState } from 'react';
import { getTeacherAssessments, TeacherAssessment } from '../services/studentPerformanceService';

const SmartRecommendations: React.FC = () => {
    const [assessments, setAssessments] = useState<TeacherAssessment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssessments = async () => {
            try {
                const data = await getTeacherAssessments();
                setAssessments(data);
            } catch (error) {
                console.error("Failed to fetch assessments", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssessments();
    }, []);

    const focusAreas = assessments.filter(a => a.percentage < 60);

    if (loading || focusAreas.length === 0) return null;

    return (
        <div className="w-full max-w-7xl mx-auto mb-8 animate-fade-in px-4 xl:px-0">
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {focusAreas.map(assessment => (
                    <div key={assessment.id} className="bg-white/90 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl shadow-sm backdrop-blur-sm">
                        <div className="flex items-start justify-between">
                             <div>
                                <h3 className="font-bold text-stone-800 dark:text-red-100 flex items-center gap-2">
                                    <span className="text-red-500">⚠️</span> Focus Required
                                </h3>
                                <p className="text-sm font-medium text-stone-600 dark:text-red-200 mt-1">{assessment.topic}</p>
                             </div>
                             <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full dark:bg-red-900 dark:text-red-300">
                                {assessment.percentage}%
                             </span>
                        </div>
                        <p className="text-sm text-stone-600 dark:text-stone-300 mt-3 line-clamp-2">
                            {assessment.feedback}
                        </p>
                         {assessment.improvementAreas && assessment.improvementAreas.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {assessment.improvementAreas.slice(0, 2).map((area, idx) => (
                                    <span key={idx} className="text-xs bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-2 py-1 rounded">
                                        {area}
                                    </span>
                                ))}
                            </div>
                         )}
                    </div>
                ))}
             </div>
        </div>
    );
};

export default SmartRecommendations;
