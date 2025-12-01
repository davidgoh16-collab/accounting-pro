import React, { useState, useEffect, useRef } from 'react';
import { CaseStudyLocation } from '../types';
import { generateReelSummary, generateCaseStudyVideo } from '../services/geminiService';
import { TOPIC_COLORS } from '../case-study-database';
import SelectApiKeyView from './SelectApiKeyView';

type ReelState = {
    status: 'idle' | 'loading-summary' | 'loading-video' | 'success' | 'error';
    summary?: string;
    videoUrl?: string;
    error?: string;
    progressMessage?: string;
};

const ReelItem: React.FC<{
    study: CaseStudyLocation;
    setReelRef: (el: HTMLElement | null) => void;
    onApiKeyError: () => void;
}> = ({ study, setReelRef, onApiKeyError }) => {
    const itemRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [reelState, setReelState] = useState<ReelState>({ status: 'idle' });

    useEffect(() => {
        if (itemRef.current) setReelRef(itemRef.current);
        const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.5 });
        if (itemRef.current) observer.observe(itemRef.current);
        return () => {
            if (itemRef.current) observer.unobserve(itemRef.current);
            setReelRef(null);
        };
    }, [setReelRef]);

    useEffect(() => {
        const generate = async () => {
            setReelState({ status: 'loading-summary', progressMessage: 'Generating summary...' });
            try {
                const summary = await generateReelSummary(study);
                setReelState({ status: 'loading-video', summary, progressMessage: 'Generating your video...' });

                const videoUri = await generateCaseStudyVideo(study, summary);
                const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
                const blob = await response.blob();
                const videoUrl = URL.createObjectURL(blob);
                
                setReelState({ status: 'success', summary, videoUrl });
            } catch (error: any) {
                console.error("Error generating reel content:", error);
                if (error.message.includes("Requested entity was not found")) {
                    onApiKeyError();
                }
                setReelState({ status: 'error', error: `Failed to generate video: ${error.message}` });
            }
        };

        if (isVisible && reelState.status === 'idle') {
            generate();
        }
    }, [isVisible, study, reelState.status, onApiKeyError]);
    
    useEffect(() => {
        if(videoRef.current) {
            if(isVisible) {
                videoRef.current.play();
            } else {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
        }
    }, [isVisible]);

    return (
        <div ref={itemRef} className="w-full h-full flex-shrink-0 snap-center relative bg-stone-900 flex items-center justify-center">
            {reelState.status === 'success' && reelState.videoUrl ? (
                <>
                    <video ref={videoRef} src={reelState.videoUrl} loop muted playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 p-6 text-white w-full pointer-events-none">
                        <h3 className="text-3xl font-bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.7)' }}>{study.name}</h3>
                        <p className="text-sm font-semibold text-black px-2 py-0.5 rounded-full inline-block mt-2" style={{ backgroundColor: TOPIC_COLORS[study.topic] || '#f1f5f9' }}>
                            {study.topic}
                        </p>
                        <div className="mt-4 text-base prose prose-invert prose-sm" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                           {reelState.summary?.split('•').map((item, index) => item.trim() && <p key={index} className="!my-1.5 ml-2 relative before:content-['•'] before:absolute before:-left-3">{item.trim()}</p>)}
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center text-white p-4">
                    {(reelState.status === 'loading-summary' || reelState.status === 'loading-video') && (
                        <>
                            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
                            <p className="font-semibold mt-4">{reelState.progressMessage}</p>
                            {reelState.status === 'loading-video' && <p className="text-sm text-stone-300 mt-2">This can take a minute...</p>}
                        </>
                    )}
                     {reelState.status === 'error' && (
                        <div className="p-4 bg-red-900/50 border border-red-500/50 rounded-lg">
                            <p className="font-bold">An error occurred</p>
                            <p className="text-sm mt-1">{reelState.error}</p>
                        </div>
                    )}
                     {reelState.status === 'idle' && (
                         <p className="text-stone-400">Scroll to load reel...</p>
                     )}
                </div>
            )}
        </div>
    );
};


const CaseStudyReelFeed: React.FC<{
    caseStudies: CaseStudyLocation[];
    reelRefs: React.MutableRefObject<Map<string, HTMLElement>>;
}> = ({ caseStudies, reelRefs }) => {
    const [isKeySelected, setIsKeySelected] = useState(false);
    const [isCheckingKey, setIsCheckingKey] = useState(true);
    const [isKeyError, setIsKeyError] = useState(false);

    useEffect(() => {
        const checkKey = async () => {
            setIsCheckingKey(true);
            try {
                const hasKey = await window.aistudio?.hasSelectedApiKey();
                setIsKeySelected(!!hasKey);
            } catch (e) {
                console.error("Error checking for API key", e);
                setIsKeySelected(false);
            }
            setIsCheckingKey(false);
        };
        checkKey();
    }, []);

    const handleKeySelected = () => {
        setIsKeySelected(true);
        setIsKeyError(false);
    };

    const handleApiKeyError = () => {
        setIsKeySelected(false);
        setIsKeyError(true);
    };

    if (isCheckingKey) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-stone-900 text-white">
                <p>Checking API key status...</p>
            </div>
        );
    }
    
    if (!isKeySelected) {
        return <SelectApiKeyView onKeySelected={handleKeySelected} isErrorState={isKeyError} />;
    }

    return (
        <div className="w-full h-full overflow-y-auto snap-y snap-mandatory">
            {caseStudies.map(study => (
                <ReelItem
                    key={study.name}
                    study={study}
                    onApiKeyError={handleApiKeyError}
                    setReelRef={(el) => {
                        if (el) {
                            reelRefs.current.set(study.name, el);
                        } else {
                            reelRefs.current.delete(study.name);
                        }
                    }}
                />
            ))}
        </div>
    );
};

export default CaseStudyReelFeed;