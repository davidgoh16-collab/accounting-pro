
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CaseStudyLocation, AuthUser } from '../types';
import { CASE_STUDY_LOCATIONS, TOPIC_COLORS, ACCOUNTING_CATEGORIES } from '../case-study-database';
import { generateCaseStudyInfo } from '../services/geminiService';

// To satisfy TypeScript since we are loading Leaflet via script tag
declare const L: any;

interface CaseStudyExplorerViewProps {
    onBack: () => void;
    user: AuthUser;
}

// The Modal component, separated for clarity.
const StudyDetailModal: React.FC<{
    study: CaseStudyLocation;
    onClose: () => void;
}> = ({ study, onClose }) => {
    const [content, setContent] = useState<{ summary: string; imageUrl: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const fetchContent = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const generatedContent = await generateCaseStudyInfo(study);
                if (isMounted) {
                    setContent(generatedContent);
                }
            } catch (err) {
                console.error("Generation Error:", err);
                if (isMounted) {
                    setError('Could not generate insights for this case study. Please try again.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };
        fetchContent();
        return () => { isMounted = false; };
    }, [study]);

    return (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-stone-200 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-stone-800">{study.name}</h2>
                        <p className="text-sm font-semibold text-white px-2 py-0.5 rounded-full inline-block mt-1" style={{ backgroundColor: TOPIC_COLORS[study.topic] || '#71717a' }}>
                            {study.topic}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><span className="text-3xl">❌</span></button>
                </header>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
                            </div>
                            <p className="text-stone-600 font-semibold mt-4">Generating Insights...</p>
                        </div>
                    )}
                    {error && <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">{error}</div>}
                    {content && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                            <div>
                                <img src={content.imageUrl} alt={`Image for ${study.name}`} className="w-full h-auto rounded-lg shadow-lg border"/>
                                <div className="mt-4 p-4 bg-stone-50/80 border rounded-lg text-sm">
                                    <p className="font-bold text-stone-700">Exam Context:</p>
                                    <p className="text-stone-600 mt-1">{study.citation}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-stone-800">Summary</h3>
                                <div className="prose prose-sm max-w-none text-stone-700 whitespace-pre-wrap">{content.summary}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CaseStudyExplorerView: React.FC<CaseStudyExplorerViewProps> = ({ onBack, user }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markerClusterGroupRef = useRef<any>(null);

    const [mapReady, setMapReady] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [selectedTopic, setSelectedTopic] = useState('All');
    const [selectedStudy, setSelectedStudy] = useState<CaseStudyLocation | null>(null);

    // Filter case studies based on user level
    const levelFilteredLocations = useMemo(() => {
        return CASE_STUDY_LOCATIONS.filter(cs => cs.levels.includes(user.level || 'A-Level'));
    }, [user.level]);

    const filteredTopics = useMemo(() => {
        const allTopics = [...new Set(levelFilteredLocations.map(cs => cs.topic))];
        if (categoryFilter === 'All') return allTopics.sort();
        return [...new Set(levelFilteredLocations.filter(cs => cs.category === categoryFilter).map(cs => cs.topic))].sort();
    }, [categoryFilter, levelFilteredLocations]);

    const filteredCaseStudies = useMemo(() => {
        return levelFilteredLocations.filter(cs =>
            (categoryFilter === 'All' || cs.category === categoryFilter) &&
            (selectedTopic === 'All' || cs.topic === selectedTopic)
        ).sort((a, b) => a.name.localeCompare(b.name));
    }, [categoryFilter, selectedTopic, levelFilteredLocations]);

    // Initialize map
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            const intervalId = setInterval(() => {
                if (typeof L !== 'undefined' && L.markerClusterGroup) {
                    clearInterval(intervalId);
                    try {
                        const map = L.map(mapContainerRef.current, { center: [30, 10], zoom: 2, maxBounds: [[-90, -180], [90, 180]], minZoom: 2 });
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
                        mapRef.current = map;
                        markerClusterGroupRef.current = L.markerClusterGroup();
                        map.addLayer(markerClusterGroupRef.current);
                        setMapReady(true);
                    } catch (error) {
                        console.error("Error initializing Leaflet map:", error);
                        if (mapContainerRef.current) mapContainerRef.current.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-red-50 text-red-700">Could not load map.</div>';
                    }
                }
            }, 100);
            return () => clearInterval(intervalId);
        }
    }, []);

    // Update markers
    useEffect(() => {
        const clusterGroup = markerClusterGroupRef.current;
        if (!clusterGroup || !mapReady) return;

        clusterGroup.clearLayers();
        filteredCaseStudies.forEach(study => {
            if (!study) return;
            const lat = Number(study.lat);
            const lng = Number(study.lng);
            if (isNaN(lat) || isNaN(lng)) return;

            const color = TOPIC_COLORS[study.topic] || '#71717a';
            const iconHtml = `<div style="background-color: ${color}; width: 100%; height: 100%; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.5); box-sizing: border-box;"></div>`;
            const customIcon = L.divIcon({ html: iconHtml, className: '', iconSize: [24, 24], iconAnchor: [12, 12] });
            const marker = L.marker([lat, lng], { icon: customIcon });
            marker.bindPopup(`<b>${study.name}</b>`);
            marker.on('click', () => setSelectedStudy(study));
            clusterGroup.addLayer(marker);
        });
    }, [filteredCaseStudies, mapReady]);

    const handleSidebarItemClick = (study: CaseStudyLocation) => {
        const map = mapRef.current;
        if (!map) return;
        const lat = Number(study.lat);
        const lng = Number(study.lng);
        if (isNaN(lat) || isNaN(lng)) return;
        map.flyTo([lat, lng], 6, { animate: true, duration: 1.5 });
        setSelectedStudy(study);
    };

    return (
        <div className="flex h-screen bg-stone-100">
            <aside className="w-96 bg-white/80 backdrop-blur-sm border-r border-stone-200/50 flex flex-col shadow-lg z-10 relative">
                <header className="p-4 border-b border-stone-200 flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-stone-100 transition">
                        <span>&larr;</span>
                    </button>
                    <h1 className="text-2xl font-bold text-stone-800">Explorer ({user.level})</h1>
                </header>
                <div className="p-4 border-b border-stone-200">
                    <label className="text-sm font-semibold text-stone-600 mb-2 block">Filter by Topic:</label>
                    <select value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)} className="w-full p-2 border border-stone-300 rounded-md bg-white focus:ring-1 focus:ring-emerald-500">
                        <option value="All">All Topics</option>
                        {filteredTopics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
                    </select>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                    <ul className="space-y-2">
                        {filteredCaseStudies.map(cs => (
                            <li key={cs.name}>
                                <button onClick={() => handleSidebarItemClick(cs)} className="w-full text-left p-3 rounded-lg hover:bg-stone-200/50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <span style={{ backgroundColor: TOPIC_COLORS[cs.topic] }} className="w-2.5 h-2.5 rounded-full flex-shrink-0"></span>
                                        <div className="flex-grow"><p className="font-semibold text-stone-800 leading-tight">{cs.name}</p><p className="text-xs text-stone-500">{cs.topic}</p></div>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            <main className="flex-1 relative z-0">
                <div ref={mapContainerRef} className="w-full h-full" />
            </main>

            {selectedStudy && (
                <StudyDetailModal study={selectedStudy} onClose={() => setSelectedStudy(null)} />
            )}
             <style>{`
                .animate-fade-in { animation: fadeIn 0.3s ease-in-out; } @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
                .leaflet-popup-pane { z-index: 1000 !important; }
             `}</style>
        </div>
    );
};

export default CaseStudyExplorerView;
