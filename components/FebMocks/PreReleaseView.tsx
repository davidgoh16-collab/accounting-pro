
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle, FileQuestion, Send, ZoomIn, ZoomOut, Maximize, LayoutTemplate, Image as ImageIcon } from 'lucide-react';
import { chatWithPreRelease, generatePreReleaseQuestion } from '../../services/geminiService';
import { ChatMessage, GeneratedQuestionData } from '../../types';
import DigitalPreReleaseView from './DigitalPreReleaseView';

const PRE_RELEASE_PAGES = [
    '/assets/prerelease/page1.jpg',
    '/assets/prerelease/page2.jpg',
    '/assets/prerelease/page3.jpg',
    '/assets/prerelease/page4.jpg',
    '/assets/prerelease/page5.jpg',
    '/assets/prerelease/page6.jpg',
    '/assets/prerelease/page7.jpg',
];

const PreReleaseView: React.FC = () => {
    const [pageIndex, setPageIndex] = useState(0);
    const [viewMode, setViewMode] = useState<'original' | 'digital'>('original');
    const [mode, setMode] = useState<'chat' | 'question'>('chat');
    const [zoom, setZoom] = useState(1);

    // Chat State
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: "I'm ready to help with this page of the Pre-release. What would you like to know?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Question State
    const [generatedQuestion, setGeneratedQuestion] = useState<GeneratedQuestionData | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showMarkScheme, setShowMarkScheme] = useState(false);

    // Image Data
    const [imageBase64, setImageBase64] = useState<string | null>(null);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Load Image as Base64 for AI
    useEffect(() => {
        const convertImage = async () => {
            try {
                const response = await fetch(PRE_RELEASE_PAGES[pageIndex]);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImageBase64(reader.result as string);
                };
                reader.readAsDataURL(blob);
            } catch (e) {
                console.error("Failed to load image for AI", e);
            }
        };
        convertImage();
        // Reset zoom on page change
        setZoom(1);
    }, [pageIndex]);

    // Scroll chat to bottom
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSendMessage = async () => {
        if (!input.trim() || !imageBase64) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsTyping(true);

        try {
            let aiResponse = "";
            await chatWithPreRelease(messages, userMsg, imageBase64, (chunk) => {
                aiResponse += chunk;
                // Live update logic if needed, for now we just wait or could update last message
            });
            setMessages(prev => [...prev, { role: 'model', text: aiResponse }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I couldn't process that. Please try again." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleGenerateQuestion = async () => {
        if (!imageBase64) return;
        setIsGenerating(true);
        setGeneratedQuestion(null);
        setShowMarkScheme(false);
        try {
            const q = await generatePreReleaseQuestion(imageBase64);
            setGeneratedQuestion(q);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-6 h-[85vh]">
            {/* Left: Content Viewer */}
            <div className="flex flex-col gap-4 h-full min-h-0">
                {/* View Mode Toggle */}
                <div className="bg-white/50 dark:bg-stone-900/50 backdrop-blur-md p-1.5 rounded-xl border border-stone-200 dark:border-stone-700 self-center flex gap-2 shadow-sm">
                    <button
                        onClick={() => setViewMode('original')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${viewMode === 'original' ? 'bg-white dark:bg-stone-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
                    >
                        <ImageIcon size={16} />
                        Original Booklet
                    </button>
                    <button
                        onClick={() => setViewMode('digital')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${viewMode === 'digital' ? 'bg-white dark:bg-stone-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
                    >
                        <LayoutTemplate size={16} />
                        Digital Interactive
                    </button>
                </div>

                {viewMode === 'digital' ? (
                    <DigitalPreReleaseView pageIndex={pageIndex} onPageChange={setPageIndex} />
                ) : (
                    <div className="bg-stone-900 rounded-2xl overflow-hidden relative flex flex-col shadow-2xl h-full border border-stone-700">
                        <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-white text-sm font-bold">
                            Page {pageIndex + 1} / {PRE_RELEASE_PAGES.length}
                        </div>

                        <div className="absolute top-4 right-4 z-10 flex gap-2">
                            <button onClick={() => setZoom(z => Math.max(1, z - 0.5))} className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70"><ZoomOut size={16} /></button>
                            <button onClick={() => setZoom(z => Math.min(3, z + 0.5))} className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70"><ZoomIn size={16} /></button>
                        </div>

                        <div className="flex-1 overflow-auto flex items-center justify-center bg-stone-900 p-4 custom-scrollbar">
                            <div style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s' }} className="origin-center">
                                <img
                                    src={PRE_RELEASE_PAGES[pageIndex]}
                                    alt={`Page ${pageIndex + 1}`}
                                    className="max-w-full max-h-full object-contain shadow-lg"
                                />
                            </div>
                        </div>

                        <div className="bg-stone-800 p-4 flex justify-between items-center z-10 border-t border-stone-700">
                            <button
                                onClick={() => setPageIndex(p => Math.max(0, p - 1))}
                                disabled={pageIndex === 0}
                                className="p-2 rounded-lg bg-stone-700 text-stone-300 disabled:opacity-50 hover:bg-stone-600 transition"
                            >
                                <ChevronLeft />
                            </button>
                            <span className="text-stone-400 text-sm font-mono">GCSE PAPER 3 INSERT</span>
                            <button
                                onClick={() => setPageIndex(p => Math.min(PRE_RELEASE_PAGES.length - 1, p + 1))}
                                disabled={pageIndex === PRE_RELEASE_PAGES.length - 1}
                                className="p-2 rounded-lg bg-stone-700 text-stone-300 disabled:opacity-50 hover:bg-stone-600 transition"
                            >
                                <ChevronRight />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Interaction Panel */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 flex flex-col overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-stone-200 dark:border-stone-700">
                    <button
                        onClick={() => setMode('chat')}
                        className={`flex-1 p-4 flex items-center justify-center gap-2 font-bold transition-colors ${mode === 'chat' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500' : 'text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
                    >
                        <MessageCircle size={20} />
                        AI Chat
                    </button>
                    <button
                        onClick={() => setMode('question')}
                        className={`flex-1 p-4 flex items-center justify-center gap-2 font-bold transition-colors ${mode === 'question' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500' : 'text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
                    >
                        <FileQuestion size={20} />
                        Exam Generator
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden relative flex flex-col">
                    {mode === 'chat' ? (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatContainerRef}>
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                                            msg.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                            : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-tl-none border border-stone-200 dark:border-stone-700'
                                        }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-stone-100 dark:bg-stone-800 p-3 rounded-2xl rounded-tl-none border border-stone-200 dark:border-stone-700">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" />
                                                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-100" />
                                                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-200" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Ask about this page..."
                                        className="flex-1 bg-stone-100 dark:bg-stone-800 border-0 rounded-full px-4 py-3 focus:ring-2 focus:ring-indigo-500 text-stone-800 dark:text-stone-200"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!input.trim() || isTyping}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full disabled:opacity-50 transition"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
                            {!generatedQuestion && !isGenerating && (
                                <div className="text-center mt-12">
                                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-6 rounded-full inline-block mb-4 text-indigo-600 dark:text-indigo-400">
                                        <FileQuestion size={48} />
                                    </div>
                                    <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">Practice Questions</h3>
                                    <p className="text-stone-500 dark:text-stone-400 max-w-xs mx-auto mb-8">
                                        Generate a GCSE-style exam question based specifically on the resource shown on the left.
                                    </p>
                                    <button
                                        onClick={handleGenerateQuestion}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition"
                                    >
                                        Generate Question
                                    </button>
                                </div>
                            )}

                            {isGenerating && (
                                <div className="flex flex-col items-center justify-center mt-20 space-y-4">
                                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-stone-500 animate-pulse">Analyzing resource & generating question...</p>
                                </div>
                            )}

                            {generatedQuestion && (
                                <div className="w-full max-w-lg space-y-6">
                                    <div className="bg-white dark:bg-stone-800 p-6 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-sm font-bold text-stone-400">Question {generatedQuestion.questionNumber}</span>
                                            <span className="text-sm font-bold bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded text-stone-600 dark:text-stone-300">
                                                [{generatedQuestion.marks} marks]
                                            </span>
                                        </div>
                                        <p className="text-lg font-medium text-stone-800 dark:text-stone-100 leading-relaxed">
                                            {generatedQuestion.prompt}
                                        </p>
                                    </div>

                                    <div className="border-t border-stone-200 dark:border-stone-700 pt-6">
                                        <button
                                            onClick={() => setShowMarkScheme(!showMarkScheme)}
                                            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                                        >
                                            {showMarkScheme ? 'Hide Mark Scheme' : 'Show Mark Scheme'}
                                        </button>

                                        {showMarkScheme && (
                                            <div className="mt-4 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800">
                                                <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-2 text-sm uppercase">Examiner's Notes</h4>
                                                <p className="text-emerald-700 dark:text-emerald-400 text-sm whitespace-pre-wrap">
                                                    {generatedQuestion.markScheme.content}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleGenerateQuestion}
                                        className="w-full py-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 font-bold rounded-lg transition"
                                    >
                                        Generate Another
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PreReleaseView;
