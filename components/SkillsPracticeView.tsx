
import React, { useState, useEffect, useRef } from 'react';
import { MathsSkill, MathsProblem, ChatMessage, AuthUser, StructureGuide } from '../types';
import { MATHS_SKILLS, MATHS_PROBLEMS, STRUCTURE_GUIDES } from '../constants';
import { streamMathsTutorResponse } from '../services/geminiService';
import HubLayout from './HubLayout';
import Calculator from './Calculator';

interface SkillsPracticeViewProps {
    user: AuthUser;
    onBack: () => void;
}

type WorkStep = { type: 'step' | 'formula' | 'calculation' | 'final_answer'; content: string };
type SkillMode = 'maths' | 'structure';

const SkillsPracticeView: React.FC<SkillsPracticeViewProps> = ({ user, onBack }) => {
    const [mode, setMode] = useState<SkillMode>('maths');
    
    // Maths State
    const [selectedSkill, setSelectedSkill] = useState<MathsSkill | null>(null);
    const [currentProblem, setCurrentProblem] = useState<MathsProblem | null>(null);
    const [tutorMessages, setTutorMessages] = useState<ChatMessage[]>([]);
    const [tutorInput, setTutorInput] = useState('');
    const [isTutorLoading, setIsTutorLoading] = useState(false);
    const [liveWorkingOut, setLiveWorkingOut] = useState<WorkStep[]>([]);
    const [calculatorOpen, setCalculatorOpen] = useState(false);
    
    // Structure State
    const [selectedGuide, setSelectedGuide] = useState<StructureGuide | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const level = user.level || 'A-Level';
    const filteredMathsSkills = MATHS_SKILLS.filter(skill => skill.levels.includes(level));
    const filteredStructureGuides = STRUCTURE_GUIDES.filter(guide => guide.levels.includes(level));

    useEffect(() => {
        if (mode === 'maths') {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [tutorMessages, mode]);

    // ... (Process streamed line logic kept same)
    const processStreamedLine = (line: string, modelMessageId: string) => {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) return;

        const command = line.substring(0, colonIndex);
        const content = line.substring(colonIndex + 1).trim();
        
        if (!content) return;

        switch (command) {
            case 'STEP':
                setLiveWorkingOut(prev => [...prev, { type: 'step', content }]);
                break;
            case 'FORMULA':
                 setLiveWorkingOut(prev => [...prev, { type: 'formula', content }]);
                break;
            case 'CALCULATION':
                 setLiveWorkingOut(prev => [...prev, { type: 'calculation', content }]);
                break;
            case 'FINAL_ANSWER':
                 setLiveWorkingOut(prev => [...prev, { type: 'final_answer', content }]);
                break;
            case 'CHAT':
                setTutorMessages((prev: ChatMessage[]) => prev.map(msg => 
                    msg.id === modelMessageId ? { ...msg, text: msg.text + content + '\n' } : msg
                ));
                break;
            default:
                 setTutorMessages((prev: ChatMessage[]) => prev.map(msg => 
                    msg.id === modelMessageId ? { ...msg, text: msg.text + line + '\n' } : msg
                ));
        }
    };

    const handleSelectSkill = async (skill: MathsSkill) => {
        setSelectedSkill(skill);
        setLiveWorkingOut([]);
        setTutorMessages([]);
        
        const problems = MATHS_PROBLEMS.filter(p => p.type === skill.id && p.levels.includes(level));
        const problem = problems.length > 0 ? problems[Math.floor(Math.random() * problems.length)] : null;
        
        setCurrentProblem(problem);

        if (problem) {
            const initialId = Date.now().toString();
            const modelId = (Date.now() + 1).toString();
            
            setTutorMessages([
                { id: initialId, role: 'model', text: '' }
            ]);
            setIsTutorLoading(true);

            await streamMathsTutorResponse(problem, skill, [], "Start the session.", (chunk) => {
                const lines = chunk.split('\n');
                lines.forEach(line => {
                    if (line.trim()) processStreamedLine(line, initialId);
                });
            });
            
            setTutorMessages((prev: ChatMessage[]) => prev.map(msg => ({...msg, text: msg.text.trim()})));
            setIsTutorLoading(false);
        }
    };

    const handleSendTutorMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tutorInput.trim() || isTutorLoading || !currentProblem || !selectedSkill) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: tutorInput };
        const newHistory = [...tutorMessages, userMsg];
        setTutorMessages(newHistory);
        setTutorInput('');
        setIsTutorLoading(true);

        const modelId = (Date.now() + 1).toString();
        setTutorMessages(prev => [...prev, { id: modelId, role: 'model', text: '' }]);

        let buffer = '';
        await streamMathsTutorResponse(currentProblem, selectedSkill, newHistory, tutorInput, (chunk) => {
            buffer += chunk;
            let newlineIndex;
            while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
                const line = buffer.substring(0, newlineIndex);
                buffer = buffer.substring(newlineIndex + 1);
                if (line.trim()) {
                    processStreamedLine(line, modelId);
                }
            }
        });
        
        if (buffer.trim()) {
            processStreamedLine(buffer, modelId);
        }

        setTutorMessages((prev: ChatMessage[]) => prev.map(msg => ({...msg, text: msg.text.trim()})));
        setIsTutorLoading(false);
    };

    if (!selectedSkill && mode === 'maths') {
        return (
            <HubLayout
                title="Skills & Structure"
                subtitle={`Master essential skills for ${level} Geography.`}
                gradient="bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500"
                onBack={onBack}
            >
                <div className="flex justify-center mb-8">
                    <div className="bg-stone-100 dark:bg-stone-800 p-1 rounded-full flex border border-stone-200 dark:border-stone-700">
                        <button onClick={() => setMode('maths')} className={`px-6 py-2 rounded-full font-bold text-sm transition ${mode === 'maths' ? 'bg-white dark:bg-stone-600 shadow text-indigo-600 dark:text-indigo-300' : 'text-stone-500 dark:text-stone-400'}`}>Quantitative Skills</button>
                        <button onClick={() => setMode('structure')} className={`px-6 py-2 rounded-full font-bold text-sm transition ${mode === 'structure' ? 'bg-white dark:bg-stone-600 shadow text-indigo-600 dark:text-indigo-300' : 'text-stone-500 dark:text-stone-400'}`}>Essay Structures</button>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {filteredMathsSkills.map(skill => (
                        <button
                            key={skill.id}
                            onClick={() => handleSelectSkill(skill)}
                            className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700 hover:scale-[1.02] transition-all text-left group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 group-hover:text-indigo-600 transition-colors">{skill.name}</h3>
                                <span className="text-2xl">🧮</span>
                            </div>
                            <p className="text-sm text-stone-500 dark:text-stone-400 font-semibold uppercase tracking-wide">{skill.category}</p>
                            {skill.formula && (
                                <div className="mt-3 p-2 bg-stone-100 dark:bg-stone-800 rounded text-xs font-mono text-stone-600 dark:text-stone-300">
                                    {skill.formula}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </HubLayout>
        );
    }

    if (mode === 'structure') {
        return (
            <HubLayout
                title="Skills & Structure"
                subtitle={`Exam technique guides for ${level}.`}
                gradient="bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500"
                onBack={onBack}
            >
                <div className="flex justify-center mb-8">
                    <div className="bg-stone-100 dark:bg-stone-800 p-1 rounded-full flex border border-stone-200 dark:border-stone-700">
                        <button onClick={() => setMode('maths')} className={`px-6 py-2 rounded-full font-bold text-sm transition ${mode === 'maths' ? 'bg-white dark:bg-stone-600 shadow text-indigo-600 dark:text-indigo-300' : 'text-stone-500 dark:text-stone-400'}`}>Quantitative Skills</button>
                        <button onClick={() => setMode('structure')} className={`px-6 py-2 rounded-full font-bold text-sm transition ${mode === 'structure' ? 'bg-white dark:bg-stone-600 shadow text-indigo-600 dark:text-indigo-300' : 'text-stone-500 dark:text-stone-400'}`}>Essay Structures</button>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                    {/* List of Guides */}
                    <div className="space-y-4">
                        {filteredStructureGuides.map((guide, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setSelectedGuide(guide)}
                                className={`w-full text-left p-5 rounded-xl border transition-all ${selectedGuide === guide ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 shadow-md' : 'bg-white/80 dark:bg-stone-900/80 border-stone-200 dark:border-stone-700 hover:border-indigo-300'}`}
                            >
                                <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100">{guide.title}</h3>
                                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{guide.aoWeighting}</p>
                            </button>
                        ))}
                    </div>

                    {/* Detail View */}
                    <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm border border-stone-200 dark:border-stone-700 rounded-2xl p-6 shadow-xl min-h-[400px]">
                        {selectedGuide ? (
                            <div className="animate-fade-in">
                                <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-2">{selectedGuide.title}</h2>
                                <p className="text-stone-500 dark:text-stone-400 font-semibold mb-6 border-b border-stone-200 pb-2">{selectedGuide.aoWeighting}</p>
                                
                                <div className="space-y-6">
                                    {selectedGuide.structureComponents.map((comp, i) => (
                                        <div key={i}>
                                            <h4 className="font-bold text-stone-800 dark:text-stone-100 mb-1">{comp.title}</h4>
                                            <p className="text-stone-600 dark:text-stone-300 text-sm whitespace-pre-wrap leading-relaxed">{comp.details}</p>
                                        </div>
                                    ))}
                                </div>

                                {selectedGuide.extraTips && (
                                    <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg">
                                        <h4 className="font-bold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2"><span>💡</span> Top Tips</h4>
                                        <ul className="list-disc list-inside text-sm text-amber-800 dark:text-amber-300 space-y-1">
                                            {selectedGuide.extraTips.map((tip, i) => <li key={i}>{tip}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-stone-400 dark:text-stone-500">
                                <span className="text-4xl mb-2">📝</span>
                                <p>Select a guide to view the breakdown.</p>
                            </div>
                        )}
                    </div>
                </div>
            </HubLayout>
        );
    }

    // ... (Maths Tutor View Render - Same as before)
    return (
        <div className="flex flex-col h-screen bg-stone-100 dark:bg-stone-950">
            <Calculator isOpen={calculatorOpen} onClose={() => setCalculatorOpen(false)} />
            
            <header className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-700 p-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedSkill(null)} className="text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 font-bold flex items-center gap-1">
                        <span>&larr;</span> Skills
                    </button>
                    <h1 className="text-xl font-bold text-stone-800 dark:text-stone-100">{selectedSkill?.name}</h1>
                </div>
                <button 
                    onClick={() => setCalculatorOpen(true)}
                    className="px-4 py-2 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-200 rounded-lg font-semibold hover:bg-stone-300 dark:hover:bg-stone-700 transition flex items-center gap-2"
                >
                    <span>🔢</span> Calculator
                </button>
            </header>

            <main className="flex-grow overflow-hidden flex flex-col lg:flex-row">
                <div className="flex-1 p-4 lg:p-6 overflow-y-auto custom-scrollbar space-y-6">
                    {currentProblem ? (
                        <>
                            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-700">
                                <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-2">Problem</h2>
                                <p className="text-stone-700 dark:text-stone-300 mb-4">{currentProblem.question}</p>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                                    <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider mb-1">Data Set</p>
                                    <p className="font-mono text-indigo-900 dark:text-indigo-200">[{currentProblem.data.join(', ')}]</p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-700 min-h-[300px]">
                                <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4 flex items-center gap-2">
                                    <span>📝</span> Live Working Out
                                </h2>
                                <div className="space-y-4">
                                    {liveWorkingOut.length === 0 && (
                                        <p className="text-stone-400 italic text-sm">The tutor will demonstrate the steps here...</p>
                                    )}
                                    {liveWorkingOut.map((item, idx) => (
                                        <div key={idx} className={`p-3 rounded-lg animate-fade-in border-l-4 ${
                                            item.type === 'step' ? 'bg-stone-50 dark:bg-stone-800 border-stone-300' :
                                            item.type === 'formula' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400' :
                                            item.type === 'calculation' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 font-mono text-sm' :
                                            'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 font-bold text-lg'
                                        }`}>
                                            {item.type === 'final_answer' && <span className="text-emerald-600 dark:text-emerald-400 text-xs uppercase font-bold block mb-1">Final Answer</span>}
                                            <p className="text-stone-800 dark:text-stone-200">{item.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-12 text-stone-500">
                            No practice problem available for this skill yet.
                        </div>
                    )}
                </div>

                <div className="lg:w-[400px] bg-stone-50 dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 flex flex-col">
                    <div className="p-3 bg-indigo-600 text-white font-bold flex items-center gap-2 shadow-md">
                        <span>🤖</span> Maths Tutor
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {tutorMessages.filter(m => m.text.trim()).map(msg => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[90%] p-3 rounded-2xl text-sm whitespace-pre-wrap shadow-sm ${
                                    msg.role === 'user' 
                                    ? 'bg-indigo-500 text-white rounded-br-none' 
                                    : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-bl-none border border-stone-200 dark:border-stone-700'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTutorLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-stone-800 p-3 rounded-2xl rounded-bl-none shadow-sm border border-stone-200 dark:border-stone-700">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendTutorMessage} className="p-4 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800">
                        <div className="relative">
                            <input 
                                type="text" 
                                value={tutorInput}
                                onChange={(e) => setTutorInput(e.target.value)}
                                placeholder="Ask for help..." 
                                className="w-full pl-4 pr-12 py-3 bg-stone-100 dark:bg-stone-800 border-transparent focus:bg-white dark:focus:bg-stone-900 border focus:border-indigo-500 rounded-full text-sm transition-all outline-none text-stone-900 dark:text-stone-100 placeholder-stone-400"
                                disabled={isTutorLoading}
                            />
                            <button 
                                type="submit" 
                                disabled={!tutorInput.trim() || isTutorLoading}
                                className="absolute right-1 top-1 p-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 disabled:bg-stone-300 dark:disabled:bg-stone-700 transition-colors"
                            >
                                ⬆
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            <style>{`.animate-fade-in { animation: fadeIn 0.3s ease-out; } @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default SkillsPracticeView;
