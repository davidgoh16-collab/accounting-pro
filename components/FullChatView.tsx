
import React, { useState, useEffect, useRef } from 'react';
import { AuthUser, ChatMessage, ChatSessionLog } from '../types';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs, doc, setDoc } from 'firebase/firestore';
import { streamChatResponse } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface FullChatViewProps {
    user: AuthUser;
    onBack: () => void;
}

const FullChatView: React.FC<FullChatViewProps> = ({ user, onBack }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [researchMode, setResearchMode] = useState(false);
    const [sessionId, setSessionId] = useState<string>(Date.now().toString());
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load most recent chat or start new
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const chatsCol = collection(db, 'users', user.uid, 'chat_logs');
                const q = query(chatsCol, orderBy('timestamp', 'desc'), limit(1));
                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    const data = snapshot.docs[0].data() as ChatSessionLog;
                    setSessionId(data.id);
                    setMessages(data.messages);
                }
            } catch (e) {
                console.error("Failed to load chat history", e);
            }
        };
        loadHistory();
    }, [user.uid]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Save chat persistence
    useEffect(() => {
        if (messages.length > 0) {
            const saveChat = async () => {
                try {
                    const log: ChatSessionLog = {
                        id: sessionId,
                        type: 'general',
                        timestamp: new Date().toISOString(),
                        preview: messages[messages.length - 1].text.substring(0, 50) + '...',
                        messages: messages,
                        context: researchMode ? 'Research Mode' : 'Strict Mode'
                    };
                    await setDoc(doc(db, 'users', user.uid, 'chat_logs', sessionId), log);
                } catch (e) {
                    console.error("Error saving chat log", e);
                }
            };
            saveChat();
        }
    }, [messages, sessionId, researchMode, user.uid]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const modelMessageId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: modelMessageId, role: 'model', text: '' }]);

        const history = [...messages, userMessage];

        await streamChatResponse(
            history,
            input,
            'complex',
            user.level || 'GCSE',
            researchMode ? 'research' : 'strict',
            (chunk) => {
                setMessages(prev => prev.map(msg =>
                    msg.id === modelMessageId
                        ? { ...msg, text: msg.text + chunk }
                        : msg
                ));
            }
        );

        setIsLoading(false);
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-transparent flex flex-col items-center">
            <button
                onClick={onBack}
                className="fixed top-24 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-stone-800/80 backdrop-blur-md border border-stone-200 dark:border-stone-700 rounded-full shadow-sm hover:bg-white dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 font-bold transition-all"
            >
                <span>&larr;</span> Back
            </button>

            <div className="w-full max-w-5xl mt-12 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-2xl flex flex-col h-[80vh]">

                {/* Header */}
                <header className="p-6 border-b border-stone-200 dark:border-stone-700 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                            <span>🌍</span> Geo Pro Chat XL
                        </h1>
                        <p className="text-stone-500 dark:text-stone-400 text-sm">
                            {researchMode
                                ? "Research Mode Active: Citations & External Sources Enabled."
                                : "Strict Mode Active: AQA Specification Content Only."}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-stone-100 dark:bg-stone-800 p-1 rounded-full border border-stone-200 dark:border-stone-700">
                        <button
                            onClick={() => setResearchMode(false)}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${!researchMode ? 'bg-white dark:bg-stone-700 shadow text-green-600 dark:text-green-400' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
                        >
                            Strict
                        </button>
                        <button
                            onClick={() => setResearchMode(true)}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${researchMode ? 'bg-white dark:bg-stone-700 shadow text-blue-600 dark:text-blue-400' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
                        >
                            Research
                        </button>
                    </div>
                </header>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {messages.length === 0 && (
                        <div className="text-center py-20 opacity-50">
                            <span className="text-6xl">💬</span>
                            <h2 className="text-2xl font-bold mt-4">Start a conversation</h2>
                            <p>Switch modes above to toggle between strict specification revision and wider research.</p>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] lg:max-w-[70%] p-5 rounded-3xl text-base leading-relaxed shadow-sm ${
                                msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-bl-none border border-stone-200 dark:border-stone-700'
                            }`}>
                                <ReactMarkdown className="markdown-body whitespace-pre-wrap font-medium">
                                    {msg.text}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-stone-100 dark:bg-stone-800 p-4 rounded-3xl rounded-bl-none flex items-center gap-2">
                                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-700 rounded-b-3xl">
                    <form onSubmit={handleSendMessage} className="flex gap-4 max-w-4xl mx-auto">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={researchMode ? "Ask a research question..." : "Ask a specification question..."}
                            className="flex-1 px-6 py-4 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm text-lg"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="text-2xl">➤</span>
                        </button>
                    </form>
                    <p className="text-center text-xs text-stone-400 mt-3">
                        AI can make mistakes. Do not share personal or sensitive information. {researchMode ? 'Citations provided in text.' : 'Strictly adhering to AQA spec.'}
                    </p>
                </div>
            </div>
            <style>{`
                .markdown-body a { color: #2563eb; text-decoration: underline; }
                .dark .markdown-body a { color: #60a5fa; }
                .markdown-body ul { list-style-type: disc; margin-left: 1.5em; margin-bottom: 1em; }
                .markdown-body ol { list-style-type: decimal; margin-left: 1.5em; margin-bottom: 1em; }
            `}</style>
        </div>
    );
};

export default FullChatView;
