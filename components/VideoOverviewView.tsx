
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AuthUser, VideoLessonPlan, VideoLessonSegment } from '../types';
import { ALEVEL_UNITS, GCSE_UNITS } from '../constants';
import { generateLessonPlan, generateSlideImage, generateSlideAudio } from '../services/geminiService';
import HubLayout from './HubLayout';

interface VideoOverviewViewProps {
    user: AuthUser;
    onBack: () => void;
}

// Helper to write WAV file
function bufferToWave(abuffer: AudioBuffer, len: number) {
  const numOfChan = abuffer.numberOfChannels;
  const length = len * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels: Float32Array[] = [];
  let i = 0;
  let sample = 0;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952);                         // "RIFF"
  setUint32(length - 8);                         // file length - 8
  setUint32(0x45564157);                         // "WAVE"

  setUint32(0x20746d66);                         // "fmt " chunk
  setUint32(16);                                 // length = 16
  setUint16(1);                                  // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2);                      // block-align
  setUint16(16);                                 // 16-bit (hardcoded in this example)

  setUint32(0x61746164);                         // "data" - chunk
  setUint32(length - pos - 4);                   // chunk length

  // write interleaved data
  for(i = 0; i < abuffer.numberOfChannels; i++)
    channels.push(abuffer.getChannelData(i));

  while(pos < length) {
    for(i = 0; i < numOfChan; i++) {             // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
      view.setInt16(pos, sample, true);          // write 16-bit sample
      pos += 2;
    }
    offset++                                     // next source sample
  }

  return new Blob([buffer], {type: "audio/wav"});

  function setUint16(data: any) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: any) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}

const VideoOverviewView: React.FC<VideoOverviewViewProps> = ({ user, onBack }) => {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [lessonPlan, setLessonPlan] = useState<VideoLessonPlan | null>(null);
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loadingPlan, setLoadingPlan] = useState(false);
    const [segments, setSegments] = useState<VideoLessonSegment[]>([]);
    
    // Audio Handling
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const startTimeRef = useRef<number>(0);
    const pauseTimeRef = useRef<number>(0); // Track where we paused
    
    // Export State
    const [isExportingAudio, setIsExportingAudio] = useState(false);
    const [isExportingPDF, setIsExportingPDF] = useState(false);

    const units = user.level === 'GCSE' ? GCSE_UNITS : ALEVEL_UNITS;

    useEffect(() => {
        setSelectedTopic(null);
        setLessonPlan(null);
    }, [user.level]);

    // Initialization
    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        return () => {
            if (audioContextRef.current?.state !== 'closed') {
                audioContextRef.current?.close();
            }
        };
    }, []);

    const handleSelectTopic = async (topic: string) => {
        setSelectedTopic(topic);
        setLoadingPlan(true);
        try {
            const plan = await generateLessonPlan(topic, user.level || 'A-Level');
            setLessonPlan(plan);
            setSegments(plan.segments.map(s => ({ ...s, isLoading: true })));
            setLoadingPlan(false);
            
            // Start generating the first segment immediately
            generateSegmentAssets(plan.segments[0], 0);
        } catch (error) {
            console.error("Failed to generate lesson plan", error);
            setLoadingPlan(false);
            alert("Could not generate lesson plan. Please try again.");
        }
    };

    const generateSegmentAssets = async (segment: VideoLessonSegment, index: number) => {
        // Don't regenerate if already done/doing
        if (segments[index] && segments[index].imageUrl && segments[index].audioBuffer) return;

        try {
            // Parallel generation for speed
            const [image, audio] = await Promise.all([
                generateSlideImage(segment.imagePrompt),
                generateSlideAudio(segment.script)
            ]);

            setSegments(prev => {
                const newSegments = [...prev];
                newSegments[index] = { 
                    ...newSegments[index], 
                    imageUrl: image, 
                    audioBuffer: audio,
                    isLoading: false 
                };
                return newSegments;
            });

            // Pre-fetch next segment if exists
            if (index + 1 < segments.length) {
                generateSegmentAssets(segments[index + 1], index + 1);
            }

        } catch (error) {
            console.error(`Error generating assets for segment ${index}`, error);
        }
    };

    const playSegment = useCallback((index: number) => {
        if (!audioContextRef.current) return;
        
        // Stop previous
        if (sourceNodeRef.current) {
            try { sourceNodeRef.current.stop(); } catch (e) {}
        }

        const segment = segments[index];
        
        // If assets not ready, trigger generation and wait (UI will show loading)
        if (!segment || !segment.audioBuffer || !segment.imageUrl) {
            // If it's not already loading, trigger it
            if (segment && !segment.isLoading) {
                generateSegmentAssets(segment, index);
            }
            setIsPlaying(true); // Keep intent to play
            return;
        }

        const source = audioContextRef.current.createBufferSource();
        source.buffer = segment.audioBuffer;
        source.connect(audioContextRef.current.destination);
        
        source.onended = () => {
            if (index < segments.length - 1 && isPlaying) {
                setCurrentSegmentIndex(index + 1);
                // playSegment is triggered by effect
            } else {
                setIsPlaying(false);
            }
        };

        source.start(0, pauseTimeRef.current); // Resume from pause point or 0
        startTimeRef.current = audioContextRef.current.currentTime - pauseTimeRef.current;
        sourceNodeRef.current = source;
        setIsPlaying(true);
    }, [segments]); // Added isPlaying dependency might cause loops, handle via effect instead

    // Effect to handle auto-play when index changes or assets become available
    useEffect(() => {
        if (isPlaying) {
            const segment = segments[currentSegmentIndex];
            if (segment && segment.audioBuffer && segment.imageUrl && !sourceNodeRef.current) {
                // Only start if not already playing (sourceNode check)
                // Use a timeout to avoid immediate state update collision
                setTimeout(() => playSegment(currentSegmentIndex), 0);
            }
        }
    }, [currentSegmentIndex, isPlaying, segments, playSegment]);

    // Effect to trigger play when index changes manually
    useEffect(() => {
        pauseTimeRef.current = 0; // Reset pause time on slide change
        if (sourceNodeRef.current) {
             try { sourceNodeRef.current.stop(); } catch(e) {}
             sourceNodeRef.current = null;
        }
        
        if (segments.length > 0 && segments[currentSegmentIndex]) {
             // Ensure assets are being fetched for current
             if (!segments[currentSegmentIndex].audioBuffer) {
                 generateSegmentAssets(segments[currentSegmentIndex], currentSegmentIndex);
             }
        }
    }, [currentSegmentIndex]);

    const togglePlay = () => {
        if (isPlaying) {
            if (audioContextRef.current && sourceNodeRef.current) {
                pauseTimeRef.current = audioContextRef.current.currentTime - startTimeRef.current;
                sourceNodeRef.current.stop();
                sourceNodeRef.current = null;
            }
            setIsPlaying(false);
        } else {
            playSegment(currentSegmentIndex);
        }
    };

    const handleSeek = (index: number) => {
        setCurrentSegmentIndex(index);
        setIsPlaying(true);
        pauseTimeRef.current = 0; // Reset play head
    };

    // Download Functions
    const isDownloadReady = segments.length > 0 && segments.every(s => s.audioBuffer && s.imageUrl);

    const handleDownloadAudio = async () => {
        if (!isDownloadReady || isExportingAudio) return;
        setIsExportingAudio(true);

        try {
            const buffers = segments.map(s => s.audioBuffer!);
            const totalLength = buffers.reduce((acc, b) => acc + b.length, 0);
            const sampleRate = buffers[0].sampleRate;
            
            // Use OfflineAudioContext to render the sequence
            const offlineCtx = new OfflineAudioContext(1, totalLength, sampleRate);
            let offset = 0;
            
            buffers.forEach(buffer => {
                const source = offlineCtx.createBufferSource();
                source.buffer = buffer;
                source.connect(offlineCtx.destination);
                source.start(offset);
                offset += buffer.duration;
            });

            const renderedBuffer = await offlineCtx.startRendering();
            const wavBlob = bufferToWave(renderedBuffer, totalLength);
            const url = URL.createObjectURL(wavBlob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `GeoPro-Podcast-${lessonPlan?.topic.replace(/\s+/g, '-')}.wav`;
            a.click();
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Audio export failed:", error);
            alert("Failed to create audio file.");
        } finally {
            setIsExportingAudio(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!isDownloadReady || isExportingPDF) return;
        setIsExportingPDF(true);

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
            const width = doc.internal.pageSize.getWidth();
            const height = doc.internal.pageSize.getHeight();

            // Title Page
            doc.setFontSize(24);
            doc.text(lessonPlan?.topic || "Geography Lesson", width / 2, height / 2 - 20, { align: 'center' });
            doc.setFontSize(16);
            doc.text(`Level: ${user.level}`, width / 2, height / 2, { align: 'center' });
            doc.text("Generated by Geo Pro AI", width / 2, height / 2 + 15, { align: 'center' });

            for (let i = 0; i < segments.length; i++) {
                doc.addPage();
                const seg = segments[i];
                
                // Header
                doc.setFontSize(18);
                doc.setTextColor(40, 40, 40);
                doc.text(`Segment ${i+1}: ${seg.title}`, 10, 15);

                // Image (Left side)
                if (seg.imageUrl) {
                    doc.addImage(seg.imageUrl, 'PNG', 10, 25, 130, 73); // 16:9 approx
                }

                // Script (Right side)
                doc.setFontSize(10);
                doc.setTextColor(60, 60, 60);
                const splitText = doc.splitTextToSize(seg.script, 130);
                doc.text(splitText, 150, 25);
            }

            doc.save(`GeoPro-Lesson-${lessonPlan?.topic.replace(/\s+/g, '-')}.pdf`);

        } catch (error) {
            console.error("PDF export failed:", error);
            alert("Failed to create PDF.");
        } finally {
            setIsExportingPDF(false);
        }
    };

    if (!selectedTopic) {
        return (
            <HubLayout 
                title="Video Overviews" 
                subtitle={`Deep Dive Podcast Mode. Select a topic to generate a 7-10 minute audio-visual lesson (${user.level}).`}
                gradient="bg-gradient-to-r from-violet-600 to-fuchsia-600"
                onBack={onBack}
            >
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                    {units.filter(u => u !== 'All Units').map(unit => (
                        <button 
                            key={unit}
                            onClick={() => handleSelectTopic(unit)}
                            className="p-6 bg-white/80 dark:bg-stone-900/80 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 hover:scale-[1.02] transition-transform text-left group"
                        >
                            <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 group-hover:text-violet-600 transition-colors">{unit}</h3>
                            <p className="text-stone-500 dark:text-stone-400 mt-2 text-sm">Generate deep dive lesson &rarr;</p>
                        </button>
                    ))}
                </div>
            </HubLayout>
        );
    }

    if (loadingPlan) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-stone-100 dark:bg-stone-950">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce">🎧</div>
                    <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Curating your Deep Dive...</h2>
                    <p className="text-stone-600 dark:text-stone-400 mt-2">Writing script, designing slides, and preparing hosts.</p>
                    <div className="mt-6 w-64 h-2 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden mx-auto">
                        <div className="h-full bg-violet-600 animate-pulse w-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    const currentSegment = segments[currentSegmentIndex];
    const isCurrentLoading = !currentSegment?.imageUrl || !currentSegment?.audioBuffer;

    return (
        <div className="h-screen flex flex-col bg-stone-900 text-white overflow-hidden">
            {/* Top Bar */}
            <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-stone-900/90 backdrop-blur z-10">
                <button onClick={() => setSelectedTopic(null)} className="text-sm font-semibold text-stone-400 hover:text-white flex items-center gap-2">
                    <span>&larr;</span> Back to Topics
                </button>
                <h1 className="font-bold text-lg truncate max-w-md">{lessonPlan?.topic}</h1>
                <div className="flex gap-2">
                    <button 
                        onClick={handleDownloadAudio} 
                        disabled={!isDownloadReady || isExportingAudio}
                        className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded text-xs font-bold transition disabled:opacity-50 disabled:cursor-wait"
                        title={isDownloadReady ? "Download as Podcast" : "Wait for full generation..."}
                    >
                        {isExportingAudio ? 'Saving...' : '⬇️ Podcast'}
                    </button>
                    <button 
                        onClick={handleDownloadPDF} 
                        disabled={!isDownloadReady || isExportingPDF}
                        className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded text-xs font-bold transition disabled:opacity-50 disabled:cursor-wait"
                        title={isDownloadReady ? "Download Slides PDF" : "Wait for full generation..."}
                    >
                        {isExportingPDF ? 'Saving...' : '⬇️ Slides'}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Main Player Area */}
                <div className="flex-1 relative flex flex-col items-center justify-center bg-black">
                    {isCurrentLoading ? (
                        <div className="text-center p-8">
                            <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-stone-300 font-medium">Generating Segment {currentSegmentIndex + 1}...</p>
                            <p className="text-stone-500 text-sm mt-2">Creating custom visuals and audio.</p>
                        </div>
                    ) : (
                        <img 
                            src={currentSegment.imageUrl} 
                            alt={currentSegment.title} 
                            className="max-w-full max-h-full object-contain shadow-2xl animate-fade-in"
                        />
                    )}
                    
                    {/* Overlay Controls */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                        <h2 className="text-2xl font-bold mb-2 shadow-black drop-shadow-md">{currentSegment?.title}</h2>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => handleSeek(Math.max(0, currentSegmentIndex - 1))}
                                className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition"
                                disabled={currentSegmentIndex === 0}
                            >
                                ⏮
                            </button>
                            <button 
                                onClick={togglePlay}
                                className="p-4 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg transition transform hover:scale-105"
                            >
                                {isPlaying && !isCurrentLoading ? "⏸" : "▶"}
                            </button>
                            <button 
                                onClick={() => handleSeek(Math.min(segments.length - 1, currentSegmentIndex + 1))}
                                className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition"
                                disabled={currentSegmentIndex === segments.length - 1}
                            >
                                ⏭
                            </button>
                            <div className="flex-1 h-1.5 bg-stone-700 rounded-full ml-4 overflow-hidden">
                                <div 
                                    className="h-full bg-violet-500 transition-all duration-300" 
                                    style={{ width: `${((currentSegmentIndex + 1) / segments.length) * 100}%` }}
                                ></div>
                            </div>
                            <span className="text-xs font-mono text-stone-400">{currentSegmentIndex + 1} / {segments.length}</span>
                        </div>
                    </div>
                </div>

                {/* Sidebar / Transcript */}
                <div className="lg:w-96 bg-stone-900 border-l border-stone-800 flex flex-col h-[40vh] lg:h-auto">
                    <div className="p-4 border-b border-stone-800 font-bold text-stone-300 uppercase tracking-wider text-xs flex justify-between items-center">
                        <span>Lesson Outline</span>
                        {!isDownloadReady && <span className="text-orange-400 animate-pulse">Generating...</span>}
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {segments.map((seg, idx) => (
                            <button 
                                key={idx}
                                onClick={() => handleSeek(idx)}
                                className={`w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3 ${currentSegmentIndex === idx ? 'bg-stone-800 border border-stone-700' : 'hover:bg-stone-800/50 border border-transparent'}`}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0 ${currentSegmentIndex === idx ? 'bg-violet-600 text-white' : 'bg-stone-700 text-stone-400'} ${seg.isLoading ? 'animate-pulse' : ''}`}>
                                    {idx + 1}
                                </div>
                                <div>
                                    <p className={`text-sm font-semibold ${currentSegmentIndex === idx ? 'text-white' : 'text-stone-400'}`}>
                                        {seg.title}
                                    </p>
                                    {currentSegmentIndex === idx && (
                                        <p className="text-xs text-stone-500 mt-1 line-clamp-2 italic">
                                            {isPlaying ? "Now Playing..." : "Paused"}
                                        </p>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="p-4 bg-stone-800/50 border-t border-stone-800 max-h-48 overflow-y-auto">
                        <p className="text-xs font-bold text-stone-500 mb-2 uppercase">Transcript</p>
                        <p className="text-sm text-stone-300 leading-relaxed whitespace-pre-wrap">
                            {currentSegment?.script}
                        </p>
                    </div>
                </div>
            </div>
            <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }`}</style>
        </div>
    );
};

export default VideoOverviewView;
