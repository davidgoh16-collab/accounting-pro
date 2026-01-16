
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, ChevronDown, BookOpen, Brain, ArrowRight } from 'lucide-react';
import { AuthUser } from '../types';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import HubLayout from './HubLayout';

// --- Data Definitions ---

const exams = [
    {
        id: 'p2',
        title: 'Paper 2: Challenges in the Human Environment',
        date: '2026-01-30T09:15:00',
        displayDate: 'Friday 30th Jan 2026',
        time: '09:15 AM',
        duration: '1h 30m',
        color: 'bg-emerald-600',
        topics: [
            'Section A: Urban Issues & Challenges (Lagos, London, Sustainability)',
            'Section B: The Changing Economic World (Development Gap, Nigeria, UK Economy)',
            'Section C: The Challenge of Resource Management (Focus: Energy)'
        ],
        notes: 'This paper includes ALL topics.'
    },
    {
        id: 'p1',
        title: 'Paper 1: Living with the Physical Environment',
        date: '2026-02-04T11:35:00',
        displayDate: 'Wednesday 4th Feb 2026',
        time: '11:35 AM',
        duration: '1h 10m',
        color: 'bg-blue-600',
        topics: [
            'Section A: The Challenge of Natural Hazards (Tectonics, Weather, Climate Change)',
            'Section C: Physical Landscapes in the UK (Coasts & Rivers)'
        ],
        notes: 'EXCLUDES Section B: The Living World (Ecosystems/Rainforests/Deserts/Cold Env) are NOT on this mock.',
        alert: true
    },
    {
        id: 'p3',
        title: 'Paper 3: Geographical Applications',
        date: '2026-02-11T11:35:00',
        displayDate: 'Wednesday 11th Feb 2026',
        time: '11:35 AM',
        duration: '1h 15m',
        color: 'bg-amber-600',
        topics: [
            'Section A: Issue Evaluation (Energy & Morecambe Bay)',
            'Section B: Fieldwork (Unfamiliar & Familiar contexts)'
        ],
        notes: 'This paper tests your skills and application of knowledge.'
    }
];

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

const scheduleData = [
    {
        title: "Week 1: Paper 2 Focus",
        days: [
            { id: "d1", date: "Mon 19 Jan", task: "Urban Issues: Lagos & London", type: "p2" },
            { id: "d2", date: "Tue 20 Jan", task: "Economic World: Dev Gap & Nigeria", type: "p2" },
            { id: "d3", date: "Wed 21 Jan", task: "UK Economy & Post-Industrial", type: "p2" },
            { id: "d4", date: "Thu 22 Jan", task: "Resource Management: Energy", type: "p2" },
            { id: "d5", date: "Fri 23 Jan", task: "Sustainability & Urban Living", type: "p2" },
            { id: "d6", date: "Weekend", task: "Paper 2 Past Paper Questions", type: "p2" }
        ]
    },
    {
        title: "Week 2: Paper 2 Final Prep",
        days: [
            { id: "d7", date: "Mon 26 Jan", task: "Case Study Stats Recap", type: "p2" },
            { id: "d8", date: "Tue 27 Jan", task: "9-Marker Plans (Human)", type: "p2" },
            { id: "d9", date: "Wed 28 Jan", task: "Review Weak Topics", type: "p2" },
            { id: "d10", date: "Thu 29 Jan", task: "Light Revision", type: "p2" },
            { id: "exam1", date: "Fri 30 Jan", task: "PAPER 2 EXAM (09:15)", type: "exam" }
        ]
    },
    {
        title: "The Bridge: Paper 1 Focus",
        days: [
            { id: "d11", date: "Sat 31 Jan", task: "Natural Hazards: Tectonics", type: "p1" },
            { id: "d12", date: "Sun 1 Feb", task: "Weather & Climate Change", type: "p1" },
            { id: "d13", date: "Mon 2 Feb", task: "Coasts: Processes & Landforms", type: "p1" },
            { id: "d14", date: "Tue 3 Feb", task: "Rivers: Hydrographs & Mgt", type: "p1" },
            { id: "exam2", date: "Wed 4 Feb", task: "PAPER 1 EXAM (11:35)", type: "exam" }
        ]
    },
    {
        title: "Final Stretch: Paper 3",
        days: [
            { id: "d15", date: "Thu 5 Feb", task: "Fieldwork Skills (Unfamiliar)", type: "p3" },
            { id: "d16", date: "Fri 6 Feb", task: "Fieldwork (Familiar/Own)", type: "p3" },
            { id: "d17", date: "Weekend", task: "Pre-Release: Figures 1 & 2", type: "p3" },
            { id: "d18", date: "Mon 9 Feb", task: "Pre-Release: Figure 3 Decision", type: "p3" },
            { id: "d19", date: "Tue 10 Feb", task: "Stats & Graphs Review", type: "p3" },
            { id: "exam3", date: "Wed 11 Feb", task: "PAPER 3 EXAM (11:35)", type: "exam" }
        ]
    }
];

const specTopics = {
    "Paper 1: Physical (No Living World)": {
        "Natural Hazards": [
            "Plate Tectonics Theory (Distribution, Margins)",
            "Tectonic Hazards (Effects, Responses)",
            "Management of Tectonic Hazards",
            "Global Atmospheric Circulation",
            "Tropical Storms (Formation, Structure, Climate Change effects)",
            "Tropical Storm Case Study (Effects, Responses)",
            "Extreme Weather in the UK (Case Study)",
            "Climate Change (Evidence, Natural & Human Causes)",
            "Climate Change Effects & Mitigation/Adaptation"
        ],
        "Coasts (UK Landscapes)": [
            "Wave types & Weathering processes",
            "Mass movement & Erosion processes",
            "Transportation (Longshore Drift) & Deposition",
            "Erosional Landforms (Headlands, Bays, Caves, Arches, Stacks)",
            "Depositional Landforms (Beaches, Spits, Bars)",
            "Coastal Management (Hard Engineering vs Soft Engineering)",
            "Managed Retreat (Case Study)"
        ],
        "Rivers (UK Landscapes)": [
            "River Profiles (Long & Cross) & Processes",
            "Erosional Landforms (Waterfalls, Gorges, Interlocking Spurs)",
            "Erosion & Deposition Landforms (Meanders, Ox-bow lakes)",
            "Depositional Landforms (Levees, Estuaries)",
            "Flood Risk Factors (Physical & Human)",
            "Flood Hydrographs",
            "Flood Management Strategies (Hard & Soft)"
        ]
    },
    "Paper 2: Human (All Topics)": {
        "Urban Issues": [
            "Global Urbanisation Trends & Megacities",
            "Lagos: Location, Growth & Importance",
            "Lagos: Challenges (Slums/Squatter Settlements, Crime, Waste)",
            "Lagos: Urban Planning Strategies",
            "London: Location, Importance & Migration",
            "London: Opportunities (Cultural Mix, Employment, Transport)",
            "London: Challenges (Inequality, Sprawl, Waste)",
            "London: Urban Regeneration (e.g. Stratford/Docklands)",
            "Sustainable Urban Living (Water, Energy, Waste, Transport)"
        ],
        "Economic World": [
            "Measures of Development (GNI, HDI, etc.)",
            "The DTM (Demographic Transition Model)",
            "Causes of Uneven Development",
            "Strategies to Reduce the Gap (Aid, Fairtrade, Tourism)",
            "Nigeria: Industrial Structure & TNCs (e.g. Shell)",
            "Nigeria: Aid & Environmental Impacts",
            "UK Economy (De-industrialisation, Post-industrial)",
            "UK Transport Infrastructure & North-South Divide"
        ],
        "Resource Management": [
            "Global Distribution of Food, Water, Energy",
            "Provision of Food, Water, Energy in the UK",
            "Energy: Global Demand & Insecurity Factors",
            "Energy: Impacts of Insecurity",
            "Energy: Strategies to Increase Supply (Renewable/Non-renewable)",
            "Energy: Sustainable Energy (Case Study)"
        ]
    },
    "Paper 3: Skills": {
        "Fieldwork & Skills": [
            "Cartographic Skills (Maps, Grid Refs, Scale)",
            "Graphical Skills (Bar, Line, Pie, Scatter, Chloropleth)",
            "Statistical Skills (Mean, Median, Mode, Range, Quartiles)",
            "Fieldwork Enquiry Process (Hypothesis to Conclusion)",
            "Data Collection Methods (Primary vs Secondary)",
            "Data Presentation & Analysis",
            "Evaluation of Fieldwork Methods"
        ]
    }
};

// --- Sub-Components ---

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

const FebMocksExams = () => (
    <div className="grid md:grid-cols-3 gap-8 animate-fade-in">
        {exams.map((exam) => (
            <div key={exam.id} className="bg-white dark:bg-stone-900 rounded-xl shadow-xl overflow-hidden border border-stone-200 dark:border-stone-700 flex flex-col hover:shadow-2xl transition-shadow duration-300">
                <div className={`${exam.color} p-4 text-white`}>
                    <h2 className="text-lg font-bold leading-tight">{exam.title}</h2>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center gap-3 mb-4 text-stone-600 dark:text-stone-300">
                        <Calendar className="w-5 h-5 text-stone-400" />
                        <span className="font-medium">{exam.displayDate}</span>
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

                    {exam.notes && (
                        <div className={`text-sm p-3 rounded-lg mt-auto break-words ${exam.alert ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-800' : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400'}`}>
                            <strong>Note:</strong> {exam.notes}
                        </div>
                    )}
                </div>
                <div className="bg-stone-50 dark:bg-stone-800 p-4 border-t border-stone-100 dark:border-stone-700">
                    <div className="flex justify-center text-stone-600 dark:text-stone-300 text-sm font-semibold">
                        {exam.date ? <Countdown targetDate={exam.date} /> : <span>Prepare Now</span>}
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const FebMocksSchedule: React.FC<{ user: AuthUser }> = ({ user }) => {
    const [completed, setCompleted] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const docRef = doc(db, 'users', user.uid, 'mocks', 'feb2026');
        const unsubscribe = onSnapshot(docRef, (snap) => {
            if (snap.exists() && snap.data().schedule) {
                setCompleted(snap.data().schedule);
            }
        });
        return () => unsubscribe();
    }, [user]);

    const toggleDay = async (id: string) => {
        const newState = { ...completed, [id]: !completed[id] };
        setCompleted(newState);
        // Persist to Firestore
        await setDoc(doc(db, 'users', user.uid, 'mocks', 'feb2026'), { schedule: newState }, { merge: true });
    };

    return (
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 p-8 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-8">
                {scheduleData.map((week, idx) => (
                    <div key={idx} className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-5 border border-stone-100 dark:border-stone-700 h-full">
                        <h3 className="font-bold text-stone-700 dark:text-stone-300 mb-3 uppercase tracking-wide text-sm">{week.title}</h3>
                        <div className="space-y-3">
                            {week.days.map((day) => {
                                const isExam = day.type === 'exam';
                                const isCompleted = completed[day.id];

                                let borderClass = "border-l-4 border-stone-300 dark:border-stone-600";
                                if (day.type === 'p1') borderClass = "border-l-4 border-blue-500";
                                if (day.type === 'p2') borderClass = "border-l-4 border-emerald-500";
                                if (day.type === 'p3') borderClass = "border-l-4 border-amber-500";
                                if (isExam) borderClass = "border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";

                                return (
                                    <div
                                        key={day.id}
                                        onClick={() => !isExam && toggleDay(day.id)}
                                        className={`
                                            flex items-center justify-between p-3 bg-white dark:bg-stone-900 rounded shadow-sm cursor-pointer transition-all w-full
                                            ${borderClass}
                                            ${isCompleted ? 'opacity-50 grayscale' : 'hover:shadow-md'}
                                        `}
                                    >
                                        <div className="flex flex-col min-w-0 pr-2">
                                            <span className={`text-xs font-bold ${isExam ? 'text-yellow-700 dark:text-yellow-400' : 'text-stone-500 dark:text-stone-400'}`}>{day.date}</span>
                                            <span className={`text-sm font-medium break-words ${isExam ? 'text-stone-900 dark:text-stone-100 font-bold' : 'text-stone-800 dark:text-stone-200'} ${isCompleted ? 'line-through' : ''}`}>
                                                {day.task}
                                            </span>
                                        </div>
                                        {!isExam && (
                                            <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isCompleted ? 'bg-green-500 border-green-500' : 'border-stone-300 dark:border-stone-600'}`}>
                                                {isCompleted && <span className="text-white text-xs">✓</span>}
                                            </div>
                                        )}
                                        {isExam && <span className="text-2xl shrink-0">🎓</span>}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const FebMocksTopics: React.FC<{ user: AuthUser }> = ({ user }) => {
    const [ragState, setRagState] = useState<Record<string, string>>({});
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const docRef = doc(db, 'users', user.uid, 'mocks', 'feb2026');
        const unsubscribe = onSnapshot(docRef, (snap) => {
            if (snap.exists() && snap.data().rag) {
                setRagState(snap.data().rag);
            }
        });
        return () => unsubscribe();
    }, [user]);

    const handleRate = async (topic: string, subtopic: string, rating: string) => {
        const newState = { ...ragState, [`${topic}-${subtopic}`]: rating };
        setRagState(newState);
        await setDoc(doc(db, 'users', user.uid, 'mocks', 'feb2026'), { rag: newState }, { merge: true });
    };

    const toggleSection = (sectionName: string) => {
        setOpenSections(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));
    };

    const getRating = (topic: string, subtopic: string) => {
        return ragState[`${topic}-${subtopic}`] || null;
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
            {Object.entries(specTopics).map(([paper, sections]) => (
                <div key={paper} className="bg-white dark:bg-stone-900 rounded-xl shadow-lg overflow-hidden border border-stone-200 dark:border-stone-700">
                    <div className="bg-stone-800 dark:bg-stone-950 p-4 text-white flex justify-between items-center">
                        <h3 className="font-bold text-lg">{paper}</h3>
                        <span className="text-xs uppercase tracking-wider bg-white/20 px-2 py-1 rounded">Topic Tracker</span>
                    </div>
                    <div className="divide-y divide-stone-100 dark:divide-stone-800">
                        {Object.entries(sections).map(([sectionName, items]) => {
                            const isOpen = openSections[sectionName];
                            return (
                                <div key={sectionName} className="bg-white dark:bg-stone-900">
                                    <button
                                        onClick={() => toggleSection(sectionName)}
                                        className="w-full p-4 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors focus:outline-none"
                                    >
                                        <h4 className="font-bold text-teal-700 dark:text-teal-400 uppercase text-sm tracking-wide flex items-center gap-2 text-left">
                                            {sectionName}
                                        </h4>
                                        <span className={`transform transition-transform duration-300 text-stone-400 shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                                            <ChevronDown size={20} />
                                        </span>
                                    </button>

                                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="p-4 pt-0 space-y-2 border-t border-stone-50 dark:border-stone-800">
                                            {(items as string[]).map((item) => (
                                                <div key={item} className="flex items-center justify-between group p-2 rounded hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                                                    <span className="text-stone-700 dark:text-stone-300 text-sm font-medium pr-4 break-words flex-1">{item}</span>
                                                    <div className="flex gap-2 shrink-0">
                                                        <button onClick={() => handleRate(sectionName, item, 'R')} className={getBtnClass(getRating(sectionName, item), 'R')}>R</button>
                                                        <button onClick={() => handleRate(sectionName, item, 'A')} className={getBtnClass(getRating(sectionName, item), 'A')}>A</button>
                                                        <button onClick={() => handleRate(sectionName, item, 'G')} className={getBtnClass(getRating(sectionName, item), 'G')}>G</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

const FebMocksSkills = () => (
    <div className="grid lg:grid-cols-2 gap-8 animate-fade-in">
        {/* Skills Card */}
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
            {/* Resources Card */}
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

            {/* Quick Tips Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-bold mb-3">Revision Strategy</h3>
                <ul className="space-y-2 text-sm text-indigo-100">
                    <li className="flex gap-2"><span className="font-bold text-white">1.</span> Learn case study facts (numbers).</li>
                    <li className="flex gap-2"><span className="font-bold text-white">2.</span> Practice 9-mark questions.</li>
                    <li className="flex gap-2"><span className="font-bold text-white">3.</span> 'BUG' the question: Box, Underline, Glance.</li>
                </ul>
            </div>
        </div>
    </div>
);

// --- Main View ---

interface FebMocksViewProps {
    user: AuthUser;
    onBack: () => void;
}

const FebMocksView: React.FC<FebMocksViewProps> = ({ user, onBack }) => {
    const [activeTab, setActiveTab] = useState<'exams' | 'schedule' | 'topics' | 'skills'>('exams');

    return (
        <HubLayout
            title="February Mock Revision"
            subtitle="Year 11 Geography Mock Exams 2026"
            gradient="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600"
            onBack={onBack}
        >
            <div className="w-full max-w-7xl mx-auto space-y-8">

                {/* Modern Navigation Tabs */}
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 bg-white/50 dark:bg-stone-900/50 backdrop-blur-md p-2 rounded-2xl border border-stone-200 dark:border-stone-700 w-fit mx-auto shadow-sm sticky top-24 z-20">
                    {[
                        { id: 'exams', label: 'Exam Overview', icon: '📝' },
                        { id: 'schedule', label: 'Schedule', icon: '📅' },
                        { id: 'topics', label: 'Topic Tracker', icon: '✅' },
                        { id: 'skills', label: 'Skills & Info', icon: '🧠' }
                    ].map(tab => (
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

                {/* Content Area */}
                <div className="min-h-[50vh]">
                    {activeTab === 'exams' && <FebMocksExams />}
                    {activeTab === 'schedule' && <FebMocksSchedule user={user} />}
                    {activeTab === 'topics' && <FebMocksTopics user={user} />}
                    {activeTab === 'skills' && <FebMocksSkills />}
                </div>

            </div>

            <style>{`
                .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; opacity: 0; transform: translateY(10px); }
                @keyframes fadeIn { to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </HubLayout>
    );
};

export default FebMocksView;
