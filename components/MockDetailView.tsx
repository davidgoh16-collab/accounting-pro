import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, ChevronDown, BookOpen, Brain, ArrowRight } from 'lucide-react';
import { AuthUser, MockConfig, MockExam } from '../types';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import HubLayout from './HubLayout';
import PreReleaseView from './FebMocks/PreReleaseView';

// --- Static Data (Skills & Resources) ---
const skills = [
    { word: 'Describe', meaning: 'Set out characteristics. Say what you see (e.g., on a graph or map).', tip: 'Use data/figures if provided!' },
    { word: 'Explain', meaning: 'Set out causes or purposes. Say WHY or HOW something happens.', tip: 'Use connectives like "because", "leading to", "therefore".' },
    { word: 'Suggest', meaning: 'Present a possible case/solution.', tip: 'Use your geographical understanding to come up with reasonable ideas.' },
    { word: 'To what extent', meaning: 'Judge the importance or success of something.', tip: 'Give both sides of the argument, then a clear conclusion.' },
    { word: 'Assess', meaning: 'Weigh up options/arguments and come to a conclusion.', tip: 'Is it significant? Is it effective? Make a judgement.' },
    { word: 'Evaluate', meaning: 'Judge from available evidence.', tip: 'Look at pros and cons, costs and benefits.' }
];

const resources = [
    { title: 'Internet Geography', url: 'https://www.internetgeography.net/', desc: 'Case studies, quizzes, and revision guides.' },
    { title: 'BBC Bitesize', url: 'https://www.bbc.co.uk/bitesize/examspecs/zy3ptyc', desc: 'Concise revision notes and quizzes for AQA.' },
    { title: 'Seneca Learning', url: 'https://senecalearning.com/en-GB/seneca-certified-resources/geography-gcse-aqa/', desc: 'Interactive revision courses tailored to AQA.' },
    { title: 'AQA Assessment Resources', url: 'https://www.aqa.org.uk/subjects/geography/gcse/geography-8035/assessment-resources', desc: 'Official past papers, mark schemes and examiner reports.' }
];

// --- Components ---

const Countdown: React.FC<{ targetDate?: string }> = ({ targetDate }) => {
    if (!targetDate) return <span className="text-xl font-bold">Check Timetable</span>;

    const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = { d: 0, h: 0, m: 0, s: 0 };

        if (difference > 0) {
            timeLeft = {
                d: Math.floor(difference / (1000 * 60 * 60 * 24)),
                h: Math.floor((difference / (1000 * 60 * 60)) % 24),
                m: Math.floor((difference / 1000 / 60) % 60),
                s: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    if (Object.keys(timeLeft).length === 0 || (+new Date(targetDate) - +new Date() <= 0)) {
        return <span className="text-xl font-bold text-red-600">Exam Started!</span>;
    }

    return (
        <div className="flex gap-4 text-center">
            <div className="flex flex-col"><span className="text-2xl font-bold">{timeLeft.d}</span><span className="text-xs uppercase">Days</span></div>
            <div className="flex flex-col"><span className="text-2xl font-bold">{timeLeft.h}</span><span className="text-xs uppercase">Hrs</span></div>
            <div className="flex flex-col"><span className="text-2xl font-bold">{timeLeft.m}</span><span className="text-xs uppercase">Mins</span></div>
            <div className="flex flex-col"><span className="text-2xl font-bold">{timeLeft.s}</span><span className="text-xs uppercase">Secs</span></div>
        </div>
    );
};

const MockExamsList: React.FC<{ exams: MockExam[] }> = ({ exams }) => (
    <div className="grid md:grid-cols-3 gap-8 animate-fade-in">
        {exams.map((exam) => {
            const paperLower = exam.paper.toLowerCase();
            let color = 'bg-stone-600';
            if (paperLower.includes('paper 1')) color = 'bg-blue-600';
            if (paperLower.includes('paper 2')) color = 'bg-emerald-600';
            if (paperLower.includes('paper 3')) color = 'bg-amber-600';

            return (
                <div key={exam.id} className="bg-white dark:bg-stone-900 rounded-xl shadow-xl overflow-hidden border border-stone-200 dark:border-stone-700 flex flex-col hover:shadow-2xl transition-shadow duration-300">
                    <div className={`${color} p-4 text-white`}>
                        <h2 className="text-lg font-bold leading-tight">{exam.title}</h2>
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                        <div className="flex items-center gap-3 mb-4 text-stone-600 dark:text-stone-300">
                            <Calendar className="w-5 h-5 text-stone-400" />
                            <span className="font-medium">{new Date(exam.date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-3 mb-6 text-stone-600 dark:text-stone-300">
                            <Clock className="w-5 h-5 text-stone-400" />
                            <span className="font-medium">{exam.time} &bull; {exam.duration}</span>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-2 border-b border-stone-200 dark:border-stone-700 pb-1">Topics Included:</h3>
                            <ul className="space-y-2">
                                {exam.topics.map((topic, i) => (
                                    <li key={i} className="text-sm text-stone-600 dark:text-stone-300 flex items-start gap-2">
                                        <span className="text-teal-500 mt-1 shrink-0">✓</span>
                                        <span className="break-words">{topic}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="bg-stone-50 dark:bg-stone-800 p-4 border-t border-stone-100 dark:border-stone-700">
                        <div className="flex justify-center text-stone-600 dark:text-stone-300 text-sm font-semibold">
                            {exam.date ? <Countdown targetDate={`${exam.date}T${exam.time}`} /> : <span>Prepare Now</span>}
                        </div>
                    </div>
                </div>
            );
        })}
    </div>
);

const MockSchedule: React.FC<{ user: AuthUser, mockId: string, exams: MockExam[] }> = ({ user, mockId, exams }) => {
    const [completed, setCompleted] = useState<Record<string, boolean>>({});

    // Generate a simple schedule based on topics if not manually overridden?
    // For now, let's just show a list of topics to revise as a checklist, grouped by exam.
    // The original FebMock had a specific day-by-day schedule.
    // Dynamically generating a day-by-day schedule is hard without a start date.
    // We will list topics as "To Do" items.

    useEffect(() => {
        const docRef = doc(db, 'users', user.uid, 'mocks', mockId);
        const unsubscribe = onSnapshot(docRef, (snap) => {
            if (snap.exists() && snap.data().schedule) {
                setCompleted(snap.data().schedule);
            }
        });
        return () => unsubscribe();
    }, [user, mockId]);

    const toggleItem = async (id: string) => {
        const newState = { ...completed, [id]: !completed[id] };
        setCompleted(newState);
        await setDoc(doc(db, 'users', user.uid, 'mocks', mockId), { schedule: newState }, { merge: true });
    };

    return (
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 p-8 animate-fade-in">
             <h3 className="font-bold text-stone-700 dark:text-stone-300 mb-6 uppercase tracking-wide text-sm">Revision Checklist</h3>
             <div className="grid md:grid-cols-2 gap-8">
                {exams.map((exam) => (
                    <div key={exam.id} className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-5 border border-stone-100 dark:border-stone-700">
                        <h4 className="font-bold text-stone-800 dark:text-stone-200 mb-4 border-b border-stone-200 dark:border-stone-700 pb-2">{exam.title}</h4>
                        <div className="space-y-3">
                            {exam.topics.map((topic, idx) => {
                                const id = `${exam.id}_${idx}`;
                                const isCompleted = completed[id];
                                return (
                                    <div
                                        key={id}
                                        onClick={() => toggleItem(id)}
                                        className={`
                                            flex items-center justify-between p-3 bg-white dark:bg-stone-900 rounded shadow-sm cursor-pointer transition-all w-full
                                            border-l-4 ${isCompleted ? 'border-green-500 opacity-50 grayscale' : 'border-stone-300 hover:shadow-md'}
                                        `}
                                    >
                                        <span className="text-sm font-medium break-words text-stone-800 dark:text-stone-200">
                                            {topic}
                                        </span>
                                        <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isCompleted ? 'bg-green-500 border-green-500' : 'border-stone-300 dark:border-stone-600'}`}>
                                            {isCompleted && <span className="text-white text-xs">✓</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
             </div>
        </div>
    );
};

const MockTopicTracker: React.FC<{ user: AuthUser, mockId: string, exams: MockExam[] }> = ({ user, mockId, exams }) => {
    const [ragState, setRagState] = useState<Record<string, string>>({});
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const docRef = doc(db, 'users', user.uid, 'mocks', mockId);
        const unsubscribe = onSnapshot(docRef, (snap) => {
            if (snap.exists() && snap.data().rag) {
                setRagState(snap.data().rag);
            }
        });
        return () => unsubscribe();
    }, [user, mockId]);

    const handleRate = async (examId: string, topic: string, rating: string) => {
        const key = `${examId}-${topic}`;
        const newState = { ...ragState, [key]: rating };
        setRagState(newState);
        await setDoc(doc(db, 'users', user.uid, 'mocks', mockId), { rag: newState }, { merge: true });
    };

    const toggleSection = (id: string) => {
        setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getRating = (examId: string, topic: string) => {
        return ragState[`${examId}-${topic}`] || null;
    };

    const getBtnClass = (current: string | null, type: string) => {
        const base = "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all border-2 ";
        if (current === type) {
            if (type === 'R') return base + "bg-red-500 border-red-600 text-white scale-110 shadow-lg";
            if (type === 'A') return base + "bg-amber-400 border-amber-500 text-white scale-110 shadow-lg";
            if (type === 'G') return base + "bg-green-500 border-green-600 text-white scale-110 shadow-lg";
        }
        if (type === 'R') return base + "bg-red-100 dark:bg-red-900/30 text-red-400 border-transparent hover:bg-red-200 dark:hover:bg-red-900/50";
        if (type === 'A') return base + "bg-amber-100 dark:bg-amber-900/30 text-amber-400 border-transparent hover:bg-amber-200 dark:hover:bg-amber-900/50";
        if (type === 'G') return base + "bg-green-100 dark:bg-green-900/30 text-green-400 border-transparent hover:bg-green-200 dark:hover:bg-green-900/50";
        return base;
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {exams.map((exam) => (
                <div key={exam.id} className="bg-white dark:bg-stone-900 rounded-xl shadow-lg overflow-hidden border border-stone-200 dark:border-stone-700">
                    <div className="bg-stone-800 dark:bg-stone-950 p-4 text-white flex justify-between items-center">
                        <h3 className="font-bold text-lg">{exam.title}</h3>
                        <span className="text-xs uppercase tracking-wider bg-white/20 px-2 py-1 rounded">Topic Tracker</span>
                    </div>

                    <div className="bg-white dark:bg-stone-900">
                        <button
                            onClick={() => toggleSection(exam.id)}
                            className="w-full p-4 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors focus:outline-none"
                        >
                            <h4 className="font-bold text-teal-700 dark:text-teal-400 uppercase text-sm tracking-wide flex items-center gap-2 text-left">
                                Topics ({exam.topics.length})
                            </h4>
                            <span className={`transform transition-transform duration-300 text-stone-400 shrink-0 ${openSections[exam.id] ? 'rotate-180' : ''}`}>
                                <ChevronDown size={20} />
                            </span>
                        </button>

                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openSections[exam.id] ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="p-4 pt-0 space-y-2 border-t border-stone-50 dark:border-stone-800">
                                {exam.topics.map((topic) => (
                                    <div key={topic} className="flex items-center justify-between group p-2 rounded hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                                        <span className="text-stone-700 dark:text-stone-300 text-sm font-medium pr-4 break-words flex-1">{topic}</span>
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => handleRate(exam.id, topic, 'R')} className={getBtnClass(getRating(exam.id, topic), 'R')}>R</button>
                                            <button onClick={() => handleRate(exam.id, topic, 'A')} className={getBtnClass(getRating(exam.id, topic), 'A')}>A</button>
                                            <button onClick={() => handleRate(exam.id, topic, 'G')} className={getBtnClass(getRating(exam.id, topic), 'G')}>G</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const MockSkills = () => (
    <div className="grid lg:grid-cols-2 gap-8 animate-fade-in">
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <Brain className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">Key Exam Skills</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs uppercase tracking-wider">
                            <th className="p-3 border-b border-stone-200 dark:border-stone-700 font-bold">Command</th>
                            <th className="p-3 border-b border-stone-200 dark:border-stone-700 font-bold">Meaning</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                        {skills.map((skill, idx) => (
                            <tr key={idx} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/50 transition-colors">
                                <td className="p-3 text-sm font-bold text-indigo-700 dark:text-indigo-400 align-top">{skill.word}</td>
                                <td className="p-3 text-sm text-stone-600 dark:text-stone-300">
                                    {skill.meaning}
                                    <div className="text-stone-400 dark:text-stone-500 text-xs mt-1 italic">{skill.tip}</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        <div className="space-y-8">
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-teal-600 dark:text-teal-400">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">Additional Resources</h2>
                </div>
                <ul className="space-y-3">
                    {resources.map((res, idx) => (
                        <li key={idx}>
                            <a href={res.url} target="_blank" rel="noopener noreferrer" className="block group p-3 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-sm transition-all bg-stone-50 dark:bg-stone-800 hover:bg-white dark:hover:bg-stone-700">
                                <h4 className="font-bold text-stone-800 dark:text-stone-200 text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 flex items-center justify-between">
                                    {res.title}
                                    <ArrowRight className="w-4 h-4 text-stone-300 dark:text-stone-600 group-hover:text-teal-400 dark:group-hover:text-teal-500" />
                                </h4>
                                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{res.desc}</p>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
);

interface MockDetailViewProps {
    user: AuthUser;
    onBack: () => void;
    mockId: string;
    mockData: MockConfig;
}

const MockDetailView: React.FC<MockDetailViewProps> = ({ user, onBack, mockId, mockData }) => {
    const [activeTab, setActiveTab] = useState<'exams' | 'schedule' | 'topics' | 'skills' | 'prerelease'>('exams');

    // Filter tabs based on availability (e.g. only show pre-release if it's the specific Feb mock)
    const tabs = [
        { id: 'exams', label: 'Exam Overview', icon: '📝' },
        { id: 'schedule', label: 'Schedule', icon: '📅' },
        { id: 'topics', label: 'Topic Tracker', icon: '✅' },
        { id: 'skills', label: 'Skills & Info', icon: '🧠' }
    ];

    if (mockData.id === 'feb_mocks_2026') {
        tabs.splice(3, 0, { id: 'prerelease', label: 'Paper 3 Pre-release', icon: '🗺️' });
    }

    return (
        <HubLayout
            title={mockData.title}
            subtitle={`${mockData.level} Mock Exams`}
            gradient="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600"
            onBack={onBack}
        >
            <div className="w-full max-w-7xl mx-auto space-y-8">
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 bg-white/50 dark:bg-stone-900/50 backdrop-blur-md p-2 rounded-2xl border border-stone-200 dark:border-stone-700 w-fit mx-auto shadow-sm sticky top-24 z-20">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300
                                ${activeTab === tab.id
                                    ? 'bg-white dark:bg-stone-800 text-teal-600 dark:text-teal-400 shadow-md scale-105'
                                    : 'text-stone-500 dark:text-stone-400 hover:bg-white/50 dark:hover:bg-stone-800/50 hover:text-stone-700 dark:hover:text-stone-300'}
                            `}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="min-h-[50vh]">
                    {activeTab === 'exams' && <MockExamsList exams={mockData.exams} />}
                    {activeTab === 'schedule' && <MockSchedule user={user} mockId={mockId} exams={mockData.exams} />}
                    {activeTab === 'topics' && <MockTopicTracker user={user} mockId={mockId} exams={mockData.exams} />}
                    {activeTab === 'prerelease' && <PreReleaseView />}
                    {activeTab === 'skills' && <MockSkills />}
                </div>
            </div>

            <style>{`
                .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; opacity: 0; transform: translateY(10px); }
                @keyframes fadeIn { to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </HubLayout>
    );
};

export default MockDetailView;
