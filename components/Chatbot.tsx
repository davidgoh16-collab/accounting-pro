
import React, { useState, useRef, useEffect } from 'react';
import { streamChatResponse } from '../services/geminiService';
import { ChatMessage, ChatSessionLog } from '../types';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'fast' | 'complex'>('fast');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string>(Date.now().toString());

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Save chat to firestore whenever messages update (debounced slightly by nature of updates)
  useEffect(() => {
    if (messages.length > 0 && auth.currentUser) {
        const saveChat = async () => {
            try {
                const log: ChatSessionLog = {
                    id: sessionId,
                    type: 'general',
                    timestamp: new Date().toISOString(),
                    preview: messages[0].text.substring(0, 50) + '...',
                    messages: messages,
                    context: 'General Help'
                };
                await setDoc(doc(db, 'users', auth.currentUser!.uid, 'chat_logs', sessionId), log);
            } catch (e) {
                console.error("Error saving chat log", e);
            }
        };
        saveChat();
    }
  }, [messages, sessionId]);
  
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

    await streamChatResponse(history, input, mode, (chunk) => {
        setMessages(prev => prev.map(msg => 
            msg.id === modelMessageId 
                ? { ...msg, text: msg.text + chunk } 
                : msg
        ));
    });
    
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-green-500 text-white w-16 h-16 flex items-center justify-center rounded-full shadow-lg shadow-green-500/30 hover:bg-green-600 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 z-50"
        aria-label="Open Chat"
      >
        <span className="text-3xl">🌍</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[90vw] max-w-md h-[70vh] max-h-[600px] bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-2xl flex flex-col z-50 transition-all duration-300 ease-in-out">
      <header className="flex items-center justify-between p-4 bg-stone-50/80 dark:bg-stone-800/80 border-b border-stone-200/80 dark:border-stone-700 rounded-t-3xl">
        <div className="flex items-center gap-2">
            <span className="text-3xl">🌍</span>
            <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">Geo Pro Chat</h2>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
            <span className="text-2xl">❌</span>
        </button>
      </header>
      
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {messages.length === 0 && (
            <div className="text-center text-stone-500 dark:text-stone-400 mt-10">
                <p>👋 Hi! I'm Geo Pro.</p>
                <p className="text-sm">Ask me about definitions, case studies, or exam tips.</p>
            </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-green-500 text-white rounded-br-none' : 'bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-bl-none'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length-1].role === 'model' && (
             <div className="flex justify-start mb-4">
                 <div className="max-w-[80%] p-3 rounded-2xl bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-bl-none">
                     <div className="flex items-center justify-center space-x-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                     </div>
                 </div>
             </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <footer className="p-4 border-t border-stone-200/80 dark:border-stone-700 bg-white/80 dark:bg-stone-900/80 rounded-b-3xl">
        <div className="flex items-center justify-center mb-2">
            <div className="bg-stone-100 dark:bg-stone-800 p-1 rounded-full flex text-sm border border-stone-200 dark:border-stone-700">
                <button 
                    onClick={() => setMode('fast')}
                    className={`px-3 py-1 rounded-full transition-colors ${mode === 'fast' ? 'bg-white dark:bg-stone-600 text-green-600 dark:text-green-400 shadow' : 'text-stone-600 dark:text-stone-400'}`}>
                    Fast
                </button>
                <button 
                    onClick={() => setMode('complex')}
                    className={`px-3 py-1 rounded-full transition-colors flex items-center gap-2 ${mode === 'complex' ? 'bg-white dark:bg-stone-600 text-green-600 dark:text-green-400 shadow' : 'text-stone-600 dark:text-stone-400'}`}>
                    <span>🧠</span> Thinking Mode
                </button>
            </div>
        </div>
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 w-full px-4 py-2 text-sm bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()} className="p-2 bg-green-500 text-white rounded-full disabled:bg-stone-300 disabled:cursor-not-allowed hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            <span className="text-lg">⬆️</span>
          </button>
        </form>
      </footer>
    </div>
  );
};

export default Chatbot;
