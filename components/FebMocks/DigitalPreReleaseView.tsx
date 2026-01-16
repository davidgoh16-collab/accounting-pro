
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Info, Map as MapIcon } from 'lucide-react';
import rawData from './preReleaseData.json';
import { SimplePieChart, SimpleLineChart, SimpleBarChart } from './SimpleCharts';

// --- Types for Data (Mirroring extraction script output) ---
interface Section {
    type: 'heading' | 'paragraph' | 'list' | 'image_description' | 'chart_data' | 'map_data';
    content: any;
    chartType?: 'bar' | 'line' | 'pie' | 'none';
    chartData?: any[];
    styles?: { bold?: boolean; color?: string };
}

interface PageData {
    pageNumber: number;
    sections: Section[];
}

interface DigitalViewProps {
    pageIndex: number;
    onPageChange: (index: number) => void;
}

const DigitalPreReleaseView: React.FC<DigitalViewProps> = ({ pageIndex, onPageChange }) => {
    const pageNumber = pageIndex + 1;
    const data = rawData as PageData[];
    const currentPage = data.find(p => p.pageNumber === pageNumber);

    const renderSection = (section: Section, index: number) => {
        switch (section.type) {
            case 'heading':
                // Check if it's a main heading or sub heading based on style or content length
                const isMain = section.styles?.bold || section.content.length < 20;
                return (
                    <h2 key={index} className={`font-bold text-stone-800 dark:text-stone-100 my-4 ${isMain ? 'text-2xl border-b-2 border-indigo-500 pb-2 inline-block' : 'text-xl'}`}>
                        {section.content}
                    </h2>
                );
            case 'paragraph':
                return (
                    <p key={index} className="text-stone-700 dark:text-stone-300 leading-relaxed mb-4 text-lg">
                        {section.content}
                    </p>
                );
            case 'list':
                return (
                    <ul key={index} className="list-disc list-outside ml-6 space-y-2 mb-6 text-stone-700 dark:text-stone-300 text-lg">
                        {(section.content as string[]).map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                );
            case 'chart_data':
                if (!section.chartData || section.chartData.length === 0) return null;
                if (section.chartType === 'pie') {
                    return <SimplePieChart key={index} data={section.chartData} title={section.content as string} />;
                }
                if (section.chartType === 'line') {
                    return <SimpleLineChart key={index} data={section.chartData} title={section.content as string} />;
                }
                // Fallback or Bar
                return <SimpleBarChart key={index} data={section.chartData} title={section.content as string} />;

            case 'map_data':
                // Render maps as bar charts for accessibility (showing values per country)
                // Defensive check: If no data, just show the description box
                const hasMapData = section.chartData && section.chartData.length > 0;

                return (
                    <div key={index} className="my-6">
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800 mb-4 flex items-start gap-3">
                             <MapIcon className="w-6 h-6 text-indigo-600 mt-1 shrink-0" />
                             <div>
                                 <h4 className="font-bold text-indigo-800 dark:text-indigo-300">Map Data Visualized</h4>
                                 <p className="text-sm text-indigo-700 dark:text-indigo-400">{section.content}</p>
                             </div>
                        </div>
                        {hasMapData ? (
                            <SimpleBarChart data={section.chartData} />
                        ) : (
                            <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-lg text-sm text-stone-500 italic">
                                Map illustration only - no numerical data to display.
                            </div>
                        )}
                    </div>
                );

            case 'image_description':
                return (
                    <div key={index} className="my-6 bg-stone-100 dark:bg-stone-800 p-6 rounded-xl border-l-4 border-teal-500">
                        <div className="flex items-center gap-2 mb-2 text-teal-600 dark:text-teal-400 font-bold uppercase text-xs tracking-wider">
                            <Info size={16} />
                            <span>Image Description</span>
                        </div>
                        <p className="text-stone-600 dark:text-stone-400 italic">
                            {section.content}
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full bg-stone-50 dark:bg-stone-900 overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xl relative">
            {/* Header / Nav */}
            <div className="bg-white dark:bg-stone-800 p-4 border-b border-stone-200 dark:border-stone-700 flex justify-between items-center z-10 shadow-sm sticky top-0">
                <button
                    onClick={() => onPageChange(pageIndex - 1)}
                    disabled={pageIndex === 0}
                    className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-30 transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-stone-600 dark:text-stone-300" />
                </button>

                <div className="text-center">
                    <span className="text-sm font-bold text-stone-400 uppercase tracking-widest">Page {pageNumber} of {data.length}</span>
                    <h2 className="text-stone-800 dark:text-stone-100 font-bold">Paper 3 Resource Booklet</h2>
                </div>

                <button
                    onClick={() => onPageChange(pageIndex + 1)}
                    disabled={pageIndex === data.length - 1}
                    className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-30 transition-colors"
                >
                    <ChevronRight className="w-6 h-6 text-stone-600 dark:text-stone-300" />
                </button>
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12">
                <div className="max-w-3xl mx-auto bg-white dark:bg-stone-900 rounded-xl shadow-sm p-8 md:p-12 border border-stone-100 dark:border-stone-800 min-h-[60vh]">
                    {currentPage ? (
                        <div className="animate-fade-in space-y-2">
                            {currentPage.sections.map((section, idx) => renderSection(section, idx))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-stone-400">Page Not Found</div>
                    )}
                </div>

                {/* Footer Tip */}
                <div className="max-w-3xl mx-auto mt-8 text-center">
                    <p className="text-sm text-stone-400">
                        This digital version is recreated from the original exam material for better accessibility and interactivity.
                        Graphs are interactive - hover over points to see values.
                    </p>
                </div>
            </div>

            <style>{`
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; opacity: 0; transform: translateY(5px); }
                @keyframes fadeIn { to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default DigitalPreReleaseView;
