import React from 'react';
import { Question, AnswerSegment } from '../types';

export const aoStyles: { [key: string]: string } = {
    'AO1': 'bg-sky-100 border-sky-200 text-sky-900 dark:bg-sky-900/50 dark:border-sky-700 dark:text-sky-100',
    'AO2': 'bg-blue-100 border-blue-200 text-blue-900 dark:bg-blue-900/50 dark:border-blue-700 dark:text-blue-100',
    'AO3': 'bg-indigo-100 border-indigo-200 text-indigo-900 dark:bg-indigo-900/50 dark:border-indigo-700 dark:text-indigo-100',
    'Intro': 'bg-stone-100 border-stone-200 text-stone-700 dark:bg-stone-700 dark:border-stone-600 dark:text-stone-200',
    'Conclusion': 'bg-stone-100 border-stone-200 text-stone-700 dark:bg-stone-700 dark:border-stone-600 dark:text-stone-200',
    'Generic': 'bg-transparent border-transparent text-stone-800 dark:text-stone-200'
};

export const FigureDisplay: React.FC<{ figures: Question['figures'], onImageError: () => void }> = ({ figures, onImageError }) => {
    if (!figures || figures.length === 0) return null;
    return (
        <div className="mt-6">
            <h3 className="text-lg font-bold text-stone-700 dark:text-stone-200 mb-2">Stimulus Figures</h3>
            <div className={`grid grid-cols-1 ${figures.length > 1 ? 'md:grid-cols-2' : ''} gap-4`}>
                {figures.map(figure => (
                    <figure key={figure.name} className="border border-stone-200 dark:border-stone-700 rounded-lg p-2 bg-stone-50 dark:bg-stone-800">
                        <img 
                            src={figure.url} 
                            alt={figure.name} 
                            className="w-full h-auto rounded"
                            onError={onImageError}
                        />
                        <figcaption className="text-center text-sm text-stone-600 dark:text-stone-400 mt-2 px-2">{figure.name}</figcaption>
                    </figure>
                ))}
            </div>
        </div>
    );
};

export const AnnotatedAnswerDisplay: React.FC<{ title: string; segments: AnswerSegment[] }> = ({ title, segments }) => (
    <div className="mt-8">
        <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">{title}</h2>
        <div className="mt-4 p-4 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/50 rounded-lg">
            <div className="whitespace-pre-wrap leading-relaxed text-stone-800 dark:text-stone-200">
                {(segments || []).map((segment, index) => (
                    segment.ao !== 'Generic' ? (
                        <span key={index} className="relative group">
                            <span className={`px-1 py-0.5 rounded border transition-all duration-200 ease-in-out cursor-help ${aoStyles[segment.ao]}`}>
                                {segment.text}
                            </span>
                            <div className="feedback-tooltip absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-stone-800 dark:bg-black text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 border border-stone-700">
                                <p className="font-bold border-b border-stone-600 pb-1 mb-1 uppercase">{segment.ao} Feedback</p>
                                {segment.feedback}
                                <svg className="absolute text-stone-800 dark:text-black h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                            </div>
                        </span>
                    ) : (
                        <span key={index}>{segment.text}</span>
                    )
                ))}
            </div>
        </div>
    </div>
);
