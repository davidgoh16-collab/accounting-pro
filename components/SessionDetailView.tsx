import React, { useRef, useState } from 'react';
import { CompletedSession } from '../types';
import { FigureDisplay, AnnotatedAnswerDisplay } from './SharedQuestionComponents';

interface SessionDetailViewProps {
    session: CompletedSession;
    onBack?: () => void;
}

const SessionDetailView: React.FC<SessionDetailViewProps> = ({ session, onBack }) => {
    const question = session.question;
    const sessionReportRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleExportPDF = async () => {
        if (!sessionReportRef.current || isExporting) return;
        setIsExporting(true);
        const { jsPDF } = window.jspdf;
        const element = sessionReportRef.current;
        
        element.classList.add('exporting-pdf');

        try {
            const canvas = await window.html2canvas(element, { scale: 2, useCORS: true, logging: false });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = imgWidth / imgHeight;
            const imgHeightInPdf = pdfWidth / ratio;
            let heightLeft = imgHeightInPdf;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeightInPdf;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
                heightLeft -= pdfHeight;
            }
            pdf.save(`Geo-Pro-Session-${question?.id}.pdf`);
        } catch (error) {
            console.error("Error exporting to PDF:", error);
            alert("Sorry, an error occurred while exporting to PDF.");
        } finally {
            element.classList.remove('exporting-pdf');
            setIsExporting(false);
        }
    };

    const renderAoBreakdown = (ao: any) => {
        const parts = [];
        if (ao.ao1 > 0) parts.push(`AO1: ${ao.ao1}`);
        if (ao.ao2 > 0) parts.push(`AO2: ${ao.ao2}`);
        if (ao.ao3 > 0) parts.push(`AO3: ${ao.ao3}`);
        return `(${parts.join(', ')} marks)`;
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-transparent animate-fade-in">
            <div className="max-w-4xl mx-auto">
                {onBack && (
                    <button 
                        onClick={onBack} 
                        className="mb-6 flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors font-semibold"
                    >
                        <span>&larr;</span> Back
                    </button>
                )}

                <div ref={sessionReportRef} className="space-y-6">
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-r-lg" role="alert">
                        <p className="font-bold">Session Review</p>
                        <p>Completed on {new Date(session.completedAt).toLocaleString()}.</p>
                    </div>

                    <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl p-6 sm:p-8">
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 px-3 py-1 rounded-full">{question.unit}</span>
                            <span className="text-sm font-semibold text-stone-700 dark:text-stone-300 bg-stone-200 dark:bg-stone-800 px-3 py-1 rounded-full">{`${question.examYear} - Q ${question.questionNumber}`}</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 dark:text-stone-100 mt-4">{question.title}</h1>
                        <div className="text-stone-600 dark:text-stone-300 mt-2 text-lg whitespace-pre-wrap">{question.prompt}</div>
                        <FigureDisplay figures={question.figures} onImageError={() => {}} />
                        <div className="mt-4">
                            <span className="font-bold text-lg text-sky-600 dark:text-sky-400">{question.marks} Marks</span>
                            <span className="text-sm text-stone-500 dark:text-stone-400 ml-2">{renderAoBreakdown(question.ao)}</span>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl p-6 sm:p-8">
                        <div className="space-y-6">
                            <div className="bg-stone-50/50 dark:bg-stone-800/50 p-4 rounded-lg border border-stone-200 dark:border-stone-700">
                                <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">Student Answer</h3>
                                <div className="mt-2 p-3 whitespace-pre-wrap text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-900 rounded-md border border-stone-200 dark:border-stone-700">{session.studentAnswer}</div>
                            </div>
                            <div className="bg-stone-50/50 dark:bg-stone-800/50 p-4 rounded-lg border border-stone-200 dark:border-stone-700">
                                <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">Feedback</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-white dark:bg-stone-900 p-3 rounded-lg shadow-sm mt-2 border border-stone-200 dark:border-stone-700">
                                        <p className="text-lg font-bold text-stone-900 dark:text-stone-100">Final Score:</p>
                                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{session.aiFeedback.score} / {session.aiFeedback.totalMarks}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-stone-900 dark:text-stone-100">Overall Comment:</h4>
                                        <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">{session.aiFeedback.overallComment}</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                            <h4 className="font-bold text-emerald-900 dark:text-emerald-300">Strengths</h4>
                                            <ul className="list-disc list-inside text-sm text-emerald-700 dark:text-emerald-400 mt-1 space-y-1">
                                                {session.aiFeedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                            </ul>
                                        </div>
                                        <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                                            <h4 className="font-bold text-amber-900 dark:text-amber-300">Improvements</h4>
                                            <ul className="list-disc list-inside text-sm text-amber-700 dark:text-amber-400 mt-1 space-y-1">
                                                {session.aiFeedback.improvements.map((s, i) => <li key={i}>{s}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                    <AnnotatedAnswerDisplay title="Annotated Answer" segments={session.aiFeedback.annotatedAnswer} />
                                    
                                    <button onClick={handleExportPDF} disabled={isExporting} className="w-full flex items-center justify-center gap-2 mt-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition disabled:bg-stone-400 hidden-for-export">
                                        <span>📄</span>
                                        {isExporting ? 'Exporting...' : 'Export Session to PDF'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
             <style>{`
                .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
                @keyframes fadeIn { 0% { opacity: 0; transform: translateY(5px); } 100% { opacity: 1; transform: translateY(0); } }
                
                /* Styles for PDF export */
                .exporting-pdf .group .feedback-tooltip {
                    opacity: 1 !important;
                    position: relative !important;
                    display: block !important;
                    transform: none !important;
                    width: auto !important;
                    margin-top: 4px !important;
                    margin-bottom: 8px !important;
                    pointer-events: auto !important;
                    z-index: auto !important;
                    left: auto !important;
                    bottom: auto !important;
                    background-color: #f5f5f4 !important; /* stone-100 */
                    color: #292524 !important; /* stone-800 */
                    border: 1px solid #e7e5e4 !important; /* stone-200 */
                    box-shadow: none !important;
                }
                .exporting-pdf .group .feedback-tooltip svg {
                    display: none !important;
                }
                .exporting-pdf .hidden-for-export {
                    display: none !important;
                }
            `}</style>
        </div>
    );
};

export default SessionDetailView;
