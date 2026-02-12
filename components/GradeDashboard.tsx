import React, { useEffect, useState } from 'react';
import { getStudentGradeProfile } from '../services/studentPerformanceService';
import { GradeProfile, AuthUser } from '../types';

export const GradeDashboard = ({ user }: { user: AuthUser | null }) => {
    const [grades, setGrades] = useState<GradeProfile | null>(null);

    useEffect(() => {
        if (user?.email) {
            getStudentGradeProfile(user.email).then(setGrades);
        }
    }, [user?.email]);

    if (!grades) return null;

    return (
        <div className="bg-white dark:bg-stone-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-stone-800 mb-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-stone-200">Current Performance</h2>
                {grades.target !== 'N/A' && (
                    <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100 dark:border-indigo-800/30">
                        Target: {grades.target}
                    </span>
                )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <GradeCard title="Paper 1" grade={grades.paper1} />
                <GradeCard title="Paper 2" grade={grades.paper2} />
                <GradeCard title="NEA" grade={grades.nea} />
                <div className="bg-slate-900 dark:bg-stone-950 rounded-lg p-4 text-white text-center shadow-lg">
                    <div className="text-3xl font-black">{grades.overall}</div>
                    <div className="text-xs uppercase tracking-wider opacity-70 mt-1">Overall</div>
                </div>
            </div>
        </div>
    );
};

const GradeCard = ({title, grade}: {title: string, grade: string}) => (
    <div className="bg-slate-50 dark:bg-stone-800/50 rounded-lg p-4 text-center border border-slate-100 dark:border-stone-800/50">
        <div className="text-2xl font-bold text-slate-800 dark:text-stone-200">{grade}</div>
        <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-stone-400 mt-1">{title}</div>
    </div>
);
