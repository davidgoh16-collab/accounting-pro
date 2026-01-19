import React, { useState, useCallback } from 'react';
import { GeographyCareer, UniversityCourseInfo, TransferableSkill, CVSuggestions, JobOpportunity } from '../types';
import { generateCareerInfo, generateUniversityCourseInfo, generateTransferableSkillInfo, generateCVSuggestions, generateTopUKUniversityInfo, generateLocalOpportunities } from '../services/geminiService';
import HubLayout from './HubLayout';

interface CareersUniversityViewProps {
    onBack: () => void;
}

const CAREER_CATEGORIES = [
    { name: 'Environmental & Sustainability', icon: '🌳' },
    { name: 'GIS & Data Science', icon: '🛰️' },
    { name: 'Urban & Regional Planning', icon: '🏙️' },
    { name: 'Physical Geography & Hazards', icon: '🌋' },
    { name: 'Human & Economic Geography', icon: '📈' },
    { name: 'Travel, Tourism & Culture', icon: '✈️' },
];

const TRANSFERABLE_SKILLS = [
    'Quantitative Skills', 'Qualitative Analysis', 'GIS & Cartography', 'Fieldwork & Observation', 
    'Problem Solving', 'Critical Thinking', 'Communication', 'Project Management'
];

type ActiveTab = 'careers' | 'university' | 'local_opportunities' | 'skills' | 'cv_builder';

const LoadingSpinner: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex flex-col items-center justify-center text-center p-8">
        <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
            <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
            <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse"></div>
        </div>
        <p className="text-stone-600 font-semibold mt-4">{text}</p>
    </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
        <p className="font-bold">An error occurred</p>
        <p>{message}</p>
    </div>
);

const SkillModal: React.FC<{ skill: string; onClose: () => void }> = ({ skill, onClose }) => {
    const [data, setData] = useState<TransferableSkill | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        generateTransferableSkillInfo(skill)
            .then(setData)
            .catch(err => {
                console.error(err);
                setError('Could not load skill details.');
            })
            .finally(() => setIsLoading(false));
    }, [skill]);

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-stone-800">{skill}</h2>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><span className="text-3xl">❌</span></button>
                </div>
                <div className="mt-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                    {isLoading && <LoadingSpinner text={`Loading details for ${skill}...`} />}
                    {error && <ErrorDisplay message={error} />}
                    {data && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-bold text-rose-700">What is it & How do you develop it?</h3>
                                <p className="text-stone-600 mt-1">{data.description}</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-rose-700">Application in Careers</h3>
                                <p className="text-stone-600 mt-1">{data.applicationInCareers}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CareersExplorer: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [careers, setCareers] = useState<GeographyCareer[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSelectCategory = useCallback((category: string) => {
        setSelectedCategory(category);
        setIsLoading(true);
        setError(null);
        setCareers([]);
        generateCareerInfo(category)
            .then(setCareers)
            .catch(err => {
                console.error(err);
                setError('Could not load career information. Please try again.');
            })
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-3">
                {CAREER_CATEGORIES.map(cat => (
                    <button
                        key={cat.name}
                        onClick={() => handleSelectCategory(cat.name)}
                        className={`w-full text-left p-4 rounded-xl transition-all font-semibold flex items-center gap-4 ${selectedCategory === cat.name ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-white hover:bg-rose-50/80 text-stone-700'}`}
                    >
                        <span className="text-3xl">{cat.icon}</span>
                        <span>{cat.name}</span>
                    </button>
                ))}
            </div>
            <div className="md:col-span-2 bg-white/50 backdrop-blur-sm p-6 rounded-2xl border min-h-[400px]">
                {isLoading && <LoadingSpinner text={`Loading careers for ${selectedCategory}...`} />}
                {error && <ErrorDisplay message={error} />}
                {careers.length > 0 && (
                    <div className="space-y-4">
                        {careers.map((career => (
                            <div key={career.title} className="p-4 bg-white rounded-lg border animate-fade-in">
                                <h3 className="text-lg font-bold text-stone-800">{career.title}</h3>
                                <p className="text-sm text-stone-600 mt-1">{career.description}</p>
                                <p className="text-sm font-semibold text-rose-800 mt-2">Salary Range: {career.salaryRange}</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {(career.keySkills || []).map(skill => (
                                        <span key={skill} className="text-xs font-semibold bg-rose-100 text-rose-800 px-2 py-1 rounded-full">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        )))}
                    </div>
                )}
                {!isLoading && !error && !selectedCategory && (
                    <div className="text-center p-8 flex flex-col items-center justify-center h-full">
                        <span className="text-5xl">🎓</span>
                        <p className="text-stone-600 mt-4">Select a category to explore related careers.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const LocalOpportunities: React.FC = () => {
    const [location, setLocation] = useState('');
    const [radius, setRadius] = useState('10 miles');
    const [level, setLevel] = useState<'GCSE' | 'A-Level'>('GCSE');
    const [opportunities, setOpportunities] = useState<JobOpportunity[]>([]);
    const [sources, setSources] = useState<{ uri: string; title: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!location.trim()) return;
        setIsLoading(true);
        setError(null);
        setOpportunities([]);
        setSources([]);

        generateLocalOpportunities(location, level, radius)
            .then(({ opportunities, sources }) => {
                setOpportunities(opportunities);
                setSources(sources);
            })
            .catch(err => {
                console.error(err);
                setError('Could not fetch opportunities. Please try again.');
            })
            .finally(() => setIsLoading(false));
    };

    return (
        <div>
             <p className="text-stone-600 mb-6">Find geography-related apprenticeships and job opportunities near you.</p>
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-3 mb-6 p-4 bg-white/50 backdrop-blur-sm border rounded-2xl">
                 <div className="flex-grow w-full md:w-auto space-y-2 md:space-y-0 md:flex md:gap-3">
                    <input
                        type="text"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="Enter your town or postcode (e.g., Manchester)"
                        className="flex-grow w-full px-4 py-2 text-base bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <select
                        value={level}
                        onChange={e => setLevel(e.target.value as 'GCSE' | 'A-Level')}
                        className="w-full md:w-32 px-4 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                        <option value="GCSE">GCSE (16+)</option>
                        <option value="A-Level">A-Level (18+)</option>
                    </select>
                     <select
                        value={radius}
                        onChange={e => setRadius(e.target.value)}
                        className="w-full md:w-32 px-4 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                        <option value="5 miles">5 miles</option>
                        <option value="10 miles">10 miles</option>
                        <option value="20 miles">20 miles</option>
                        <option value="50 miles">50 miles</option>
                    </select>
                 </div>
                <button type="submit" disabled={isLoading || !location.trim()} className="w-full md:w-auto px-6 py-2 bg-rose-500 text-white font-bold rounded-lg hover:bg-rose-600 transition disabled:bg-stone-400">
                    Find Jobs
                </button>
            </form>

            {isLoading && <LoadingSpinner text="Searching for local opportunities..." />}
            {error && <ErrorDisplay message={error} />}

            {opportunities.length > 0 && (
                <div className="space-y-4">
                    {(opportunities || []).map((opp, index) => (
                        <div key={index} className="p-4 bg-white rounded-lg border animate-fade-in hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-bold text-stone-800">{opp.title}</h3>
                            <div className="flex flex-wrap gap-2 mt-2 mb-3">
                                <span className="text-xs font-semibold bg-stone-100 text-stone-700 px-2 py-1 rounded">{opp.company}</span>
                                <span className="text-xs font-semibold bg-stone-100 text-stone-700 px-2 py-1 rounded">{opp.location}</span>
                                <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-1 rounded">{opp.type}</span>
                            </div>
                            <p className="text-sm text-stone-600 mb-3">{opp.description}</p>
                            {opp.url && (
                                <a href={opp.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-semibold text-rose-600 hover:text-rose-700">
                                    View Opportunity <span className="ml-1">&rarr;</span>
                                </a>
                            )}
                        </div>
                    ))}
                     {sources.length > 0 && (
                        <div className="mt-6 text-xs text-stone-500">
                            <p className="font-semibold">Sources:</p>
                            <ul className="list-disc list-inside">
                                {(sources || []).map((source, i) => (
                                    <li key={i}><a href={source.uri} target="_blank" rel="noopener noreferrer" className="hover:underline">{source.title}</a></li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

             {!isLoading && !error && opportunities.length === 0 && location && (
                <div className="text-center py-8 text-stone-500">
                    No opportunities found. Try increasing the search radius or checking the location spelling.
                </div>
            )}
        </div>
    );
};

const UniversityFinder: React.FC = () => {
    const [interests, setInterests] = useState('');
    const [location, setLocation] = useState('');
    const [courses, setCourses] = useState<UniversityCourseInfo[]>([]);
    const [sources, setSources] = useState<{ uri: string; title: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!interests.trim()) return;
        setIsLoading(true);
        setError(null);
        setCourses([]);
        setSources([]);

        generateUniversityCourseInfo(interests, location)
            .then(({ courses, sources }) => {
                setCourses(courses);
                setSources(sources);
            })
            .catch(err => {
                console.error(err);
                setError('Could not fetch university course information. Please try again.');
            })
            .finally(() => setIsLoading(false));
    };

    const handleTopUnis = () => {
        setIsLoading(true);
        setError(null);
        setCourses([]);
        setSources([]);
        setInterests('');
        setLocation('');
        generateTopUKUniversityInfo()
            .then(({ courses, sources }) => {
                setCourses(courses);
                setSources(sources);
            })
            .catch(err => {
                console.error(err);
                setError('Could not fetch top university information. Please try again.');
            })
            .finally(() => setIsLoading(false));
    };

    return (
        <div>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3 mb-6 p-4 bg-white/50 backdrop-blur-sm border rounded-2xl">
                 <div className="flex-grow w-full md:w-auto space-y-2 md:space-y-0 md:flex md:gap-3">
                    <input
                        type="text"
                        value={interests}
                        onChange={e => setInterests(e.target.value)}
                        placeholder="e.g., climate change, urban planning..."
                        className="flex-grow w-full px-4 py-2 text-base bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <input
                        type="text"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="Location (Optional)"
                        className="w-full md:w-48 px-4 py-2 text-base bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button type="submit" disabled={isLoading || !interests.trim()} className="flex-1 sm:flex-none px-6 py-2 bg-rose-500 text-white font-bold rounded-lg hover:bg-rose-600 transition disabled:bg-stone-400">
                        Find Courses
                    </button>
                    <button type="button" onClick={handleTopUnis} disabled={isLoading} className="flex-1 sm:flex-none px-6 py-2 bg-stone-500 text-white font-bold rounded-lg hover:bg-stone-600 transition disabled:bg-stone-400">
                        Top 5 UK Unis
                    </button>
                </div>
            </form>

            {isLoading && <LoadingSpinner text="Searching for university courses..." />}
            {error && <ErrorDisplay message={error} />}

            {courses.length > 0 && (
                <div className="space-y-4">
                    {(courses || []).map((course, index) => (
                        <div key={index} className="p-4 bg-white rounded-lg border animate-fade-in">
                            <h3 className="text-lg font-bold text-stone-800">{course.courseTitle}</h3>
                            <p className="text-sm text-stone-600 mt-1">{course.description}</p>
                            <p className="text-sm mt-2"><span className="font-semibold text-rose-800">Entry Requirements:</span> {course.entryRequirements}</p>
                            {course.url && <a href={course.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-1 inline-block">Visit Course Page &rarr;</a>}
                        </div>
                    ))}
                    {sources.length > 0 && (
                        <div className="mt-6 text-xs text-stone-500">
                            <p className="font-semibold">Sources:</p>
                            <ul className="list-disc list-inside">
                                {(sources || []).map((source, i) => (
                                    <li key={i}><a href={source.uri} target="_blank" rel="noopener noreferrer" className="hover:underline">{source.title}</a></li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const SkillsSpotlight: React.FC = () => {
    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

    return (
        <div>
            {selectedSkill && <SkillModal skill={selectedSkill} onClose={() => setSelectedSkill(null)} />}
            <p className="text-stone-600 mb-6">A-Level Geography equips you with a powerful set of transferable skills. Click on a skill to learn more about how you develop it and where it can take you.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {TRANSFERABLE_SKILLS.map(skill => (
                    <button
                        key={skill}
                        onClick={() => setSelectedSkill(skill)}
                        className="p-4 bg-white rounded-lg border text-center font-semibold text-stone-700 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-800 transition-all shadow-sm hover:shadow-md"
                    >
                        {skill}
                    </button>
                ))}
            </div>
        </div>
    );
};

const CVBuilder: React.FC = () => {
    const [jobTitle, setJobTitle] = useState('');
    const [suggestions, setSuggestions] = useState<CVSuggestions | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!jobTitle.trim()) return;
        setIsLoading(true);
        setError(null);
        setSuggestions(null);
        generateCVSuggestions(jobTitle)
            .then(setSuggestions)
            .catch(err => {
                console.error(err);
                setError('Could not generate CV suggestions. Please try again.');
            })
            .finally(() => setIsLoading(false));
    };

    return (
        <div>
            <p className="text-stone-600 mb-4">Enter a job title you're interested in to get tailored CV suggestions based on your A-Level Geography skills.</p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 mb-6 p-4 bg-white/50 backdrop-blur-sm border rounded-2xl">
                <input
                    type="text"
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    placeholder="e.g., Environmental Consultant, GIS Analyst..."
                    className="flex-grow w-full px-4 py-2 text-base bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button type="submit" disabled={isLoading || !jobTitle.trim()} className="w-full sm:w-auto px-6 py-2 bg-rose-500 text-white font-bold rounded-lg hover:bg-rose-600 transition disabled:bg-stone-400">
                    Generate Suggestions
                </button>
            </form>

            {isLoading && <LoadingSpinner text="Building your CV suggestions..." />}
            {error && <ErrorDisplay message={error} />}

            {suggestions && (
                <div className="space-y-6 animate-fade-in">
                    <div className="p-4 bg-white rounded-lg border">
                        <h3 className="text-lg font-bold text-stone-800">Personal Statement</h3>
                        <p className="text-stone-600 mt-1">{suggestions.personalStatement}</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border">
                        <h3 className="text-lg font-bold text-stone-800">Key Skills</h3>
                        <ul className="mt-2 space-y-3">
                            {(suggestions.keySkills || []).map(item => (
                                <li key={item.skill}>
                                    <p className="font-semibold text-rose-800">{item.skill}</p>
                                    <p className="text-sm text-stone-600">{item.justification}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="p-4 bg-white rounded-lg border">
                        <h3 className="text-lg font-bold text-stone-800">Education Section Enhancement</h3>
                        <p className="text-stone-600 mt-1">{suggestions.educationEnhancements}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const CareersUniversityView: React.FC<CareersUniversityViewProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('careers');

    const TabButton: React.FC<{ tab: ActiveTab; label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-lg focus:outline-none transition-colors ${activeTab === tab ? 'border-rose-500 text-rose-600' : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'}`}
        >
            {label}
        </button>
    );

    return (
        <HubLayout
            title="Careers & University"
            subtitle="Explore where your geography qualification can take you."
            gradient="bg-gradient-to-r from-rose-500 to-red-600"
            onBack={onBack}
        >
            <main className="w-full max-w-7xl mx-auto bg-white/80 backdrop-blur-sm border border-stone-200/50 rounded-3xl shadow-xl p-6 sm:p-8">
                <div className="border-b border-stone-200 mb-8 overflow-x-auto">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <TabButton tab="careers" label="Careers Explorer" />
                        <TabButton tab="local_opportunities" label="Local Opportunities" />
                        <TabButton tab="university" label="University Finder" />
                        <TabButton tab="skills" label="Skills Spotlight" />
                        <TabButton tab="cv_builder" label="CV Builder" />
                    </nav>
                </div>

                <div className="min-h-[500px]">
                    {activeTab === 'careers' && <CareersExplorer />}
                    {activeTab === 'local_opportunities' && <LocalOpportunities />}
                    {activeTab === 'university' && <UniversityFinder />}
                    {activeTab === 'skills' && <SkillsSpotlight />}
                    {activeTab === 'cv_builder' && <CVBuilder />}
                </div>
            </main>
            <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
        </HubLayout>
    );
};

export default CareersUniversityView;