
import React, { useState, useEffect } from 'react';
import { AuthUser, CompletedSession, ChatSessionLog } from '../types';
import { getAllUsers, db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import SessionAnalysisView from './SessionAnalysisView';
import GameAnalysisView from './GameAnalysisView';
import SessionDetailView from './SessionDetailView';

interface AdminViewProps {
    onImpersonate: (user: AuthUser) => void;
    onBack: () => void;
}

type Tab = 'overview' | 'sessions' | 'games' | 'chats';

const StudentInspector: React.FC<{ user: AuthUser, onImpersonate: (u: AuthUser) => void }> = ({ user, onImpersonate }) => {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [viewSession, setViewSession] = useState<CompletedSession | null>(null);
    
    const TabButton = ({ id, label, icon }: { id: Tab, label: string, icon: string }) => (
        <button 
            onClick={() => { setActiveTab(id); setViewSession(null); }}
            className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === id ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
        >
            <span>{icon}</span>
            {label}
        </button>
    );

    return (
        <div className="animate-fade-in h-full flex flex-col">
             <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl p-6 mb-6 flex-shrink-0">
                <div className="flex flex-wrap gap-4 justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            {user.displayName ? user.displayName[0].toUpperCase() : '?'}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{user.displayName || 'Unknown User'}</h2>
                            <p className="text-stone-500 dark:text-stone-400 font-mono text-sm">{user.email}</p>
                            <div className="flex gap-2 mt-1">
                                <p className="text-xs text-stone-400 dark:text-stone-500 uppercase tracking-wider font-semibold">UID: {user.uid}</p>
                                {user.level && <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{user.level}</span>}
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => onImpersonate(user)}
                        className="px-6 py-3 bg-amber-400 text-black font-bold rounded-xl hover:bg-amber-500 transition shadow-md flex items-center gap-2"
                    >
                        <span>👓</span> View as Student
                    </button>
                </div>
            </div>

            <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-t-3xl shadow-xl flex-shrink-0 overflow-hidden">
                <div className="flex border-b border-stone-200 dark:border-stone-700 overflow-x-auto">
                    <TabButton id="overview" label="Overview" icon="📊" />
                    <TabButton id="sessions" label="Practice Sessions" icon="📝" />
                    <TabButton id="games" label="Game Stats" icon="🎮" />
                    <TabButton id="chats" label="Communication Logs" icon="💬" />
                </div>
            </div>

            <div className="bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm border-x border-b border-stone-200/50 dark:border-stone-700 rounded-b-3xl shadow-xl p-6 flex-grow overflow-y-auto custom-scrollbar min-h-[500px]">
                {activeTab === 'overview' && (
                    <div className="text-center py-12">
                        <h3 className="text-2xl font-bold text-stone-700 dark:text-stone-300">Student Overview</h3>
                        <p className="text-stone-500 dark:text-stone-400 mt-2">Select a tab above to inspect specific activities.</p>
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-700">
                                <p className="text-stone-500 dark:text-stone-400 font-semibold uppercase text-xs">Account Type</p>
                                <p className="text-xl font-bold text-stone-800 dark:text-stone-100 mt-1">Student</p>
                            </div>
                             <div className="p-6 bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-700">
                                <p className="text-stone-500 dark:text-stone-400 font-semibold uppercase text-xs">Access Level</p>
                                <p className="text-xl font-bold text-stone-800 dark:text-stone-100 mt-1">Standard</p>
                            </div>
                            <div className="p-6 bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-700">
                                <p className="text-stone-500 dark:text-stone-400 font-semibold uppercase text-xs">Study Level</p>
                                <p className="text-xl font-bold text-stone-800 dark:text-stone-100 mt-1">{user.level || 'Not Selected'}</p>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'sessions' && (
                    viewSession ? 
                    <SessionDetailView session={viewSession} onBack={() => setViewSession(null)} /> :
                    <SessionAnalysisView onViewSession={setViewSession} user={user} onBack={() => setActiveTab('overview')} />
                )}
                {activeTab === 'games' && <GameAnalysisView user={user} onBack={() => setActiveTab('overview')} />}
                {activeTab === 'chats' && <ChatLogViewer user={user} />}
            </div>
        </div>
    );
};

const ChatLogViewer: React.FC<{ user: AuthUser }> = ({ user }) => {
    const [logs, setLogs] = useState<ChatSessionLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState<ChatSessionLog | null>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const generalLogsRef = collection(db, 'users', user.uid, 'chat_logs');
                const tutorLogsRef = collection(db, 'users', user.uid, 'tutor_logs');
                const mathsLogsRef = collection(db, 'users', user.uid, 'maths_logs');

                const [genSnap, tutorSnap, mathsSnap] = await Promise.all([
                    getDocs(query(generalLogsRef)),
                    getDocs(query(tutorLogsRef)),
                    getDocs(query(mathsLogsRef))
                ]);

                const allLogs: ChatSessionLog[] = [
                    ...genSnap.docs.map(d => d.data() as ChatSessionLog),
                    ...tutorSnap.docs.map(d => d.data() as ChatSessionLog),
                    ...mathsSnap.docs.map(d => d.data() as ChatSessionLog)
                ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                setLogs(allLogs);
            } catch (e) {
                console.error("Error fetching chat logs", e);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [user]);

    if (loading) return <div className="text-center p-8">Loading communication history...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            <div className="lg:col-span-1 border-r border-stone-200 dark:border-stone-700 pr-4 overflow-y-auto custom-scrollbar">
                <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-4 sticky top-0 bg-stone-50 dark:bg-stone-900 p-2 z-10">Conversation History ({logs.length})</h3>
                <div className="space-y-2">
                    {logs.length === 0 && <p className="text-stone-500 text-sm">No conversations recorded.</p>}
                    {logs.map(log => (
                        <button
                            key={log.id}
                            onClick={() => setSelectedLog(log)}
                            className={`w-full text-left p-3 rounded-xl transition-all border ${selectedLog?.id === log.id ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 ring-1 ring-blue-300' : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${log.type === 'general' ? 'bg-green-100 text-green-800' : log.type === 'tutor' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                    {log.type}
                                </span>
                                <span className="text-xs text-stone-400">{new Date(log.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="font-semibold text-stone-800 dark:text-stone-200 text-sm truncate">{log.context || 'General Chat'}</p>
                            <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-1">{log.preview}</p>
                        </button>
                    ))}
                </div>
            </div>
            <div className="lg:col-span-2 flex flex-col h-full bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                {selectedLog ? (
                    <>
                        <div className="p-4 border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{selectedLog.type === 'general' ? '🌍' : selectedLog.type === 'tutor' ? '👨‍🏫' : '🧮'}</span>
                                <div>
                                    <h3 className="font-bold text-stone-800 dark:text-stone-100">{selectedLog.context || 'General Chat Session'}</h3>
                                    <p className="text-xs text-stone-500 dark:text-stone-400">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {selectedLog.messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap shadow-sm ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-bl-none'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-stone-400 dark:text-stone-500">
                        Select a conversation to view the transcript
                    </div>
                )}
            </div>
        </div>
    );
};

const AdminView: React.FC<AdminViewProps> = ({ onImpersonate, onBack }) => {
    const [users, setUsers] = useState<AuthUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState<'All' | 'GCSE' | 'A-Level'>('All');

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const userList = await getAllUsers();
                setUsers(userList);
                if (userList.length > 0 && !selectedUser) {
                    setSelectedUser(userList[0]);
                }
            } catch (error) {
                console.error("Failed to fetch users:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.displayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesLevel = levelFilter === 'All' || u.level === levelFilter;
        return matchesSearch && matchesLevel;
    });

    return (
        <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-transparent">
            <button 
                onClick={onBack}
                className="fixed top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-stone-800/80 backdrop-blur-md border border-stone-200 dark:border-stone-700 rounded-full shadow-sm hover:bg-white dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 font-bold transition-all"
            >
                <span>&larr;</span> Back
            </button>

            <div className="max-w-[95vw] mx-auto mt-12">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-stone-800 dark:text-stone-100">Admin Centre</h1>
                        <p className="text-stone-600 dark:text-stone-400 mt-2">Monitor student progress, review activity logs, and inspect performance.</p>
                    </div>
                </header>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[85vh]">
                    {/* Sidebar User List */}
                    <div className="lg:col-span-1 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-stone-200 dark:border-stone-700 bg-white/50 dark:bg-stone-800/50">
                            <input 
                                type="text" 
                                placeholder="Search students..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 bg-stone-100 dark:bg-stone-800 border-transparent focus:bg-white dark:focus:bg-stone-900 border focus:border-indigo-500 rounded-lg text-sm transition-all text-stone-800 dark:text-stone-200"
                            />
                            <div className="flex gap-2 mt-3">
                                {(['All', 'GCSE', 'A-Level'] as const).map(level => (
                                    <button
                                        key={level}
                                        onClick={() => setLevelFilter(level)}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-md border transition-colors ${
                                            levelFilter === level 
                                            ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-700' 
                                            : 'bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700'
                                        }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {isLoading ? (
                                <div className="p-4 text-center text-stone-500">Loading users...</div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="p-4 text-center text-stone-500 text-sm">No students found matching filters.</div>
                            ) : (
                                filteredUsers.map(user => (
                                    <button 
                                        key={user.uid}
                                        onClick={() => setSelectedUser(user)}
                                        className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${selectedUser?.uid === user.uid ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${selectedUser?.uid === user.uid ? 'bg-white/20 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400'}`}>
                                            {user.displayName ? user.displayName[0].toUpperCase() : '?'}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-sm truncate">{user.displayName || 'Unnamed'}</p>
                                            <div className="flex items-center gap-1">
                                                <p className={`text-xs truncate ${selectedUser?.uid === user.uid ? 'text-indigo-100' : 'text-stone-400'}`}>{user.email}</p>
                                                {user.level && (
                                                    <span className={`text-[10px] px-1.5 rounded-full font-bold ${selectedUser?.uid === user.uid ? 'bg-white/20 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-500'}`}>
                                                        {user.level}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                        <div className="p-3 bg-stone-50 dark:bg-stone-800 text-center text-xs text-stone-400 border-t border-stone-200 dark:border-stone-700">
                            {filteredUsers.length} Students Found
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 flex flex-col h-full overflow-hidden">
                         {selectedUser ? (
                            <StudentInspector user={selectedUser} onImpersonate={onImpersonate} />
                         ) : (
                            <div className="flex-1 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700 rounded-3xl shadow-xl flex flex-col items-center justify-center text-stone-400 dark:text-stone-500">
                                <span className="text-6xl mb-4 opacity-50">👋</span>
                                <p className="text-xl font-semibold">Select a student to inspect their activity.</p>
                            </div>
                         )}
                    </div>
                </div>
            </div>
             <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default AdminView;
