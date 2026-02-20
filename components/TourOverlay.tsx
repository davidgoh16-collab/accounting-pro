
import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, GraduationCap, PenTool, Gamepad2, Brain, Sparkles, X } from 'lucide-react';

interface TourOverlayProps {
    onComplete: () => void;
}

const TourOverlay: React.FC<TourOverlayProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            title: "Welcome to Geo Pro! 🌍",
            description: "Your personal AI-powered Geography tutor. Let's take a quick tour of the features designed to help you ace your exams.",
            icon: <Sparkles className="w-16 h-16 text-yellow-500" />,
            color: "bg-yellow-100 dark:bg-yellow-900/30",
        },
        {
            title: "Learning & Progress 🧠",
            description: "Access interactive lessons in the Learning Academy, watch curated videos, and optimize your revision schedule with the Revision Planner.",
            icon: <GraduationCap className="w-16 h-16 text-indigo-500" />,
            color: "bg-indigo-100 dark:bg-indigo-900/30",
        },
        {
            title: "Exam Training Centre ✍️",
            description: "Practice exam-style questions with instant AI marking, master command words, and track your readiness with RAG Analysis and Mock Exams.",
            icon: <PenTool className="w-16 h-16 text-rose-500" />,
            color: "bg-rose-100 dark:bg-rose-900/30",
        },
        {
            title: "Interactive & Future 🚀",
            description: "Explore careers, create custom podcasts, play geography games, and dive deep into case studies with the interactive map.",
            icon: <Gamepad2 className="w-16 h-16 text-emerald-500" />,
            color: "bg-emerald-100 dark:bg-emerald-900/30",
        },
        {
            title: "Ready to Excel? 🌟",
            description: "Your journey to a top grade starts now. Good luck!",
            icon: <Check className="w-16 h-16 text-green-500" />,
            color: "bg-green-100 dark:bg-green-900/30",
        }
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col md:flex-row relative">

                {/* Close Button (Optional, usually tours can be skipped) */}
                <button
                    onClick={onComplete}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 transition-colors z-10"
                >
                    <X size={20} />
                </button>

                {/* Left Side: Visual */}
                <div className={`w-full md:w-1/3 ${steps[currentStep].color} flex items-center justify-center p-8 transition-colors duration-500`}>
                    <div className="bg-white dark:bg-stone-800 p-6 rounded-full shadow-lg transform transition-all duration-500 hover:scale-110">
                        {steps[currentStep].icon}
                    </div>
                </div>

                {/* Right Side: Content */}
                <div className="w-full md:w-2/3 p-8 md:p-12 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             {Array.from({ length: steps.length }).map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-blue-600' : 'w-2 bg-stone-200 dark:bg-stone-700'}`}
                                />
                             ))}
                        </div>
                        <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-4 animate-slide-up">
                            {steps[currentStep].title}
                        </h2>
                        <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed animate-slide-up animation-delay-100">
                            {steps[currentStep].description}
                        </p>
                    </div>

                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-100 dark:border-stone-800">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                currentStep === 0
                                    ? 'text-stone-300 dark:text-stone-700 cursor-not-allowed'
                                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                            }`}
                        >
                            <ChevronLeft size={20} /> Back
                        </button>

                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transform hover:-translate-y-0.5 transition-all"
                        >
                            {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                            {currentStep === steps.length - 1 ? <Check size={20} /> : <ChevronRight size={20} />}
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                .animate-slide-up { animation: slideUp 0.5s ease-out forwards; opacity: 0; transform: translateY(10px); }
                .animation-delay-100 { animation-delay: 0.1s; }
                @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default TourOverlay;
