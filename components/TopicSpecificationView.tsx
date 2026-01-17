
import React from 'react';
import { COURSE_LESSONS } from '../constants';

interface TopicSpecificationViewProps {
    topic: string;
    onBack: () => void;
}

const TopicSpecificationView: React.FC<TopicSpecificationViewProps> = ({ topic, onBack }) => {
    // Filter lessons that belong to the selected topic (chapter)
    const lessons = COURSE_LESSONS.filter(lesson => lesson.chapter === topic);

    return (
        <div className="animate-fade-in space-y-6">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition-colors font-bold mb-4"
            >
                <span>&larr;</span> Back to Overview
            </button>

            <div className="bg-white dark:bg-stone-800 rounded-3xl p-8 shadow-xl border border-stone-200 dark:border-stone-700">
                <div className="border-b border-stone-200 dark:border-stone-700 pb-6 mb-6">
                    <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100">{topic}</h2>
                    <p className="text-stone-500 dark:text-stone-400 mt-2">Detailed specification points for this topic.</p>
                </div>

                {lessons.length > 0 ? (
                    <div className="space-y-3">
                        {lessons.map((lesson) => (
                            <div
                                key={lesson.id}
                                className="flex items-start gap-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-700 transition-all hover:bg-white dark:hover:bg-stone-800 hover:shadow-md"
                            >
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                                    {lesson.id}
                                </div>
                                <div>
                                    <h3 className="font-bold text-stone-800 dark:text-stone-200 text-lg">{lesson.title}</h3>
                                    {/* In a real app, we might have descriptions or sub-points here */}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-stone-50 dark:bg-stone-900/50 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700">
                        <span className="text-4xl opacity-50">📚</span>
                        <p className="text-stone-500 font-semibold mt-4">No specific lessons found for this topic in the database.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopicSpecificationView;
