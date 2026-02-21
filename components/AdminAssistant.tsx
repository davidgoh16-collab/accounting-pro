import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { AuthUser, ChatMessage, ClassGroup } from '../types';
import { streamAdminChat } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import { Send, Minimize2, Maximize2, X, MessageSquare, Loader2 } from 'lucide-react';

interface ChartData {
    type: 'bar' | 'pie' | 'line' | 'area';
    title: string;
    data: any[];
    xKey: string;
    yKey: string;
    fill?: string;
}

interface AdminAssistantProps {
    users: AuthUser[];
    classes: ClassGroup[];
    isFloating?: boolean;
    onClose?: () => void;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const ChartRenderer: React.FC<{ chart: ChartData }> = ({ chart }) => {
    return (
        <div className="my-4 p-4 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm w-full h-[300px]">
            <h4 className="text-sm font-bold text-center mb-4 text-stone-700 dark:text-stone-300">{chart.title}</h4>
            <ResponsiveContainer width="100%" height="100%">
                {chart.type === 'bar' ? (
                    <BarChart data={chart.data}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey={chart.xKey} style={{ fontSize: '10px' }} />
                        <YAxis style={{ fontSize: '10px' }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Legend />
                        <Bar dataKey={chart.yKey} fill={chart.fill || '#6366f1'} radius={[4, 4, 0, 0]} />
                    </BarChart>
                ) : chart.type === 'pie' ? (
                    <PieChart>
                        <Pie
                            data={chart.data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey={chart.yKey}
                            nameKey={chart.xKey}
                            label
                        >
                            {chart.data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                ) : chart.type === 'line' ? (
                    <LineChart data={chart.data}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey={chart.xKey} style={{ fontSize: '10px' }} />
                        <YAxis style={{ fontSize: '10px' }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey={chart.yKey} stroke={chart.fill || '#6366f1'} strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                ) : (
                    <AreaChart data={chart.data}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey={chart.xKey} style={{ fontSize: '10px' }} />
                        <YAxis style={{ fontSize: '10px' }} />
                        <Tooltip />
                        <Area type="monotone" dataKey={chart.yKey} stroke={chart.fill || '#6366f1'} fill={chart.fill || '#6366f1'} fillOpacity={0.3} />
                    </AreaChart>
                )}
            </ResponsiveContainer>
        </div>
    );
};

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isModel = message.role === 'model';

    // Parse for charts
    const parts = message.text.split(/```json-chart([\s\S]*?)```/);

    return (
        <div className={`flex ${isModel ? 'justify-start' : 'justify-end'} mb-4`}>
            <div className={`max-w-[90%] md:max-w-[80%] rounded-2xl p-4 shadow-sm ${
                isModel
                ? 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-100 dark:border-stone-700 rounded-bl-none'
                : 'bg-indigo-600 text-white rounded-br-none'
            }`}>
                {parts.map((part, index) => {
                    if (index % 2 === 1) {
                        // This is the chart JSON block
                        try {
                            const chartData = JSON.parse(part) as ChartData;
                            return <ChartRenderer key={index} chart={chartData} />;
                        } catch (e) {
                            return <div key={index} className="text-red-500 text-xs p-2 border border-red-200 rounded">Error rendering chart</div>;
                        }
                    } else {
                        // Text block
                        if (!part.trim()) return null;
                        return (
                            <div key={index} className={`prose dark:prose-invert max-w-none text-sm ${!isModel && 'text-white'}`}>
                                <ReactMarkdown>{part}</ReactMarkdown>
                            </div>
                        );
                    }
                })}
            </div>
        </div>
    );
};

const AdminAssistant: React.FC<AdminAssistantProps> = ({ users, classes, isFloating = false, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', role: 'model', text: "Hello! I'm your AI Data Analyst. I can help you analyze student engagement, class performance, and platform usage. Ask me anything!" }
    ]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [isOpen, setIsOpen] = useState(!isFloating); // If not floating, always open initially (or controlled by parent)
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isStreaming) return;

        const userMsg: ChatMessage = { id: uuidv4(), role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsStreaming(true);

        const modelMsgId = uuidv4();
        setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '' }]);

        let fullText = '';
        try {
            await streamAdminChat(
                messages, // Send history
                userMsg.text,
                { users, classes },
                (chunk) => {
                    fullText += chunk;
                    setMessages(prev => prev.map(m => m.id === modelMsgId ? { ...m, text: fullText } : m));
                }
            );
        } catch (e) {
            console.error(e);
            setMessages(prev => prev.map(m => m.id === modelMsgId ? { ...m, text: fullText + "\n\n*[System Error: Failed to complete response]*" } : m));
        } finally {
            setIsStreaming(false);
        }
    };

    if (isFloating) {
        if (!isOpen) {
            return (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 z-50 animate-bounce-in"
                >
                    <MessageSquare size={24} />
                </button>
            );
        }

        return (
            <div className="fixed bottom-6 right-6 w-[400px] h-[600px] max-h-[80vh] max-w-[90vw] bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-2xl flex flex-col z-50 animate-slide-up overflow-hidden">
                {/* Header */}
                <div className="p-4 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                            AI
                        </div>
                        <div>
                            <h3 className="font-bold text-stone-800 dark:text-stone-100 text-sm">Data Analyst</h3>
                            <p className="text-[10px] text-stone-500">Gemini 3 Flash</p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg text-stone-500">
                            <Minimize2 size={16} />
                        </button>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-stone-50 dark:bg-stone-900" ref={scrollRef}>
                    {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
                    {isStreaming && <div className="text-xs text-stone-400 animate-pulse ml-2">Thinking...</div>}
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 shrink-0">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about students, classes, or stats..."
                            className="flex-1 px-4 py-2 bg-stone-100 dark:bg-stone-700 border-transparent focus:bg-white dark:focus:bg-stone-600 border focus:border-indigo-500 rounded-xl text-sm outline-none transition-all"
                            disabled={isStreaming}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isStreaming}
                            className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-stone-300 text-white rounded-xl transition-colors"
                        >
                            {isStreaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Full Mode (Embedded in a View)
    return (
        <div className="flex flex-col h-full bg-stone-50 dark:bg-stone-900/50 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
             <div className="p-4 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm">
                        ✨
                    </div>
                    <div>
                        <h3 className="font-bold text-stone-800 dark:text-stone-100">AI Data Analyst</h3>
                        <p className="text-xs text-stone-500">Powered by Gemini 3 Flash • Analyzing {users.length} Users & {classes.length} Classes</p>
                    </div>
                </div>
                {onClose && (
                     <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg text-stone-500">
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6" ref={scrollRef}>
                {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
                {isStreaming && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-stone-800 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin text-indigo-500" />
                            <span className="text-sm text-stone-500">Analyzing data...</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 shrink-0">
                <div className="max-w-4xl mx-auto flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="Ask a question like 'How many Year 11 students are there?' or 'Show me the distribution of user levels'..."
                        className="flex-1 px-5 py-3 bg-stone-100 dark:bg-stone-700 border-transparent focus:bg-white dark:focus:bg-stone-600 border focus:border-indigo-500 rounded-xl text-base outline-none transition-all shadow-inner"
                        disabled={isStreaming}
                        autoFocus
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isStreaming}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-stone-300 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
                    >
                        {isStreaming ? 'Thinking...' : <><span>Send</span> <Send size={18} /></>}
                    </button>
                </div>
                <p className="text-center text-xs text-stone-400 mt-2">
                    AI can make mistakes. Verify important data.
                </p>
            </div>
        </div>
    );
};

export default AdminAssistant;
