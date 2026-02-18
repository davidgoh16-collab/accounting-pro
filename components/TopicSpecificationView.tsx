
import React from 'react';
import { COURSE_LESSONS, ALEVEL_SPEC_TOPICS, GCSE_SPEC_TOPICS, IGCSE_SPEC_TOPICS } from '../constants';

interface TopicSpecificationViewProps {
    topic: string;
    onBack: () => void;
    ratings: Record<string, 'Red' | 'Amber' | 'Green'>;
    onRate: (itemId: string, rating: 'Red' | 'Amber' | 'Green') => void;
}

const TopicSpecificationView: React.FC<TopicSpecificationViewProps> = ({ topic, onBack, ratings, onRate }) => {
    // 1. Try to find lessons from COURSE_LESSONS (Legacy/Coursework)
    const lessons = COURSE_LESSONS.filter(lesson => lesson.chapter === topic);

    // 2. Try to find granular sub-topics from SPEC_TOPICS (New/Detailed)
    // We check both GCSE and A-Level maps.
    const specSubTopics = ALEVEL_SPEC_TOPICS[topic] || GCSE_SPEC_TOPICS[topic] || IGCSE_SPEC_TOPICS[topic] || [];

    // 3. Determine which data source to use
    // If we have granular spec topics, use them (they are more detailed).
    // If not, fall back to course lessons.
    const useSpecTopics = specSubTopics.length > 0;

    const itemsToRender = useSpecTopics
        ? specSubTopics.map((sub, idx) => ({
            id: `${topic.replace(/\s+/g, '_')}_${idx}`, // Create a stable ID for sub-topics
            title: sub,
            displayId: (idx + 1).toString()
        }))
        : lessons.map(l => ({
            id: l.id,
            title: l.title,
            displayId: l.id.replace('G-Ch', '')
        }));

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
                    <p className="text-stone-500 dark:text-stone-400 mt-2">
                        {useSpecTopics
                            ? "Detailed sub-categories from the specification."
                            : "Course lessons and key topics."}
                    </p>
                </div>

                {itemsToRender.length > 0 ? (
                    <div className="space-y-3">
                        {itemsToRender.map((item) => {
                            const currentRating = ratings[item.id];
                            return (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-700 transition-all hover:bg-white dark:hover:bg-stone-800 hover:shadow-md justify-between flex-wrap"
                                >
                                    <div className="flex gap-4 flex-1 min-w-[200px]">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                                            {item.displayId}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-stone-800 dark:text-stone-200 text-lg">{item.title}</h3>
                                        </div>
                                    </div>

                                    <div className="flex gap-1">
                                        {(['Red', 'Amber', 'Green'] as const).map(rating => {
                                            const isSelected = currentRating === rating;
                                            const baseColor = rating === 'Red' ? 'bg-red-500' : rating === 'Amber' ? 'bg-amber-500' : 'bg-emerald-500';
                                            const opacity = isSelected ? 'opacity-100 ring-2 ring-offset-2 ring-stone-400 dark:ring-offset-stone-900' : 'opacity-20 hover:opacity-50';

                                            return (
                                                <button
                                                    key={rating}
                                                    onClick={() => onRate(item.id, rating)}
                                                    className={`h-8 w-16 rounded-md ${baseColor} ${opacity} transition-all font-bold text-white text-[10px] uppercase tracking-wider`}
                                                >
                                                    {rating}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-stone-50 dark:bg-stone-900/50 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700">
                        <span className="text-4xl opacity-50">📚</span>
                        <p className="text-stone-500 font-semibold mt-4">No specific sub-topics found for this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopicSpecificationView;
