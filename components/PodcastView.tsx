
import React, { useState, useEffect, useRef } from 'react';
import { AuthUser } from '../types';
import { ALEVEL_UNITS, GCSE_UNITS, IGCSE_UNITS, GCSE_SPEC_TOPICS, ALEVEL_SPEC_TOPICS, IGCSE_SPEC_TOPICS } from '../constants';
import { generatePodcastScript, generatePodcastAudio } from '../services/geminiService';
import HubLayout from './HubLayout';
import { ChevronDown, ChevronUp, Play, Download, Mic } from 'lucide-react';

interface PodcastViewProps {
    user: AuthUser;
    onBack: () => void;
}

// Helper to manually decode Raw PCM 16-bit audio to AudioBuffer
// Gemini TTS returns raw PCM at 24kHz
const pcmToAudioBuffer = (
    data: Uint8Array, 
    ctx: AudioContext, 
    sampleRate: number = 24000, 
    numChannels: number = 1
): AudioBuffer => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            // Convert Int16 to Float32 [-1.0, 1.0]
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

// WAV Header Helper
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
    setUint16(16);                                 // 16-bit

    setUint32(0x61746164);                         // "data" - chunk
    setUint32(length - pos - 4);                   // chunk length

    for(i = 0; i < abuffer.numberOfChannels; i++)
        channels.push(abuffer.getChannelData(i));

    while(pos < length) {
        for(i = 0; i < numOfChan; i++) {
            sample = Math.max(-1, Math.min(1, channels[i][offset])); 
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }

    return new Blob([buffer], {type: "audio/wav"});

    function setUint16(data: any) { view.setUint16(pos, data, true); pos += 2; }
    function setUint32(data: any) { view.setUint32(pos, data, true); pos += 4; }
}

const PodcastView: React.FC<PodcastViewProps> = ({ user, onBack }) => {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
    const [script, setScript] = useState<string | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'generating-script' | 'generating-audio' | 'ready' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');
    
    // Determine units and subtopics based on user level
    let units = GCSE_UNITS.filter(u => u !== 'All Units');
    if (user.level === 'A-Level') units = ALEVEL_UNITS.filter(u => u !== 'All Units');
    if (user.level === 'IGCSE') units = IGCSE_UNITS.filter(u => u !== 'All Units');

    let specMap = GCSE_SPEC_TOPICS;
    if (user.level === 'A-Level') specMap = ALEVEL_SPEC_TOPICS;
    if (user.level === 'IGCSE') specMap = IGCSE_SPEC_TOPICS;

    const handleGenerate = async () => {
        if (!selectedTopic) return;
        setStatus('generating-script');
        setScript(null);
        setAudioUrl(null);
        setStatusMessage('Writing a deep-dive script (this may take a minute)...');

        try {
            // 1. Generate Script
            const generatedScript = await generatePodcastScript(selectedTopic, user.level || 'A-Level');
            setScript(generatedScript);
            
            // 2. Generate Audio
            setStatus('generating-audio');
            setStatusMessage('Producing long-form audio. This processes in chunks and may take 2-4 minutes...');
            const audioBase64 = await generatePodcastAudio(generatedScript);
            
            // 3. Process Audio for Player & Download
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const binaryString = atob(audioBase64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            // Gemini returns raw PCM, not a WAV file. We must decode manually.
            const audioBuffer = pcmToAudioBuffer(bytes, audioContext, 24000);
            await audioContext.close();

            const wavBlob = bufferToWave(audioBuffer, audioBuffer.length);
            const url = URL.createObjectURL(wavBlob);
            
            setAudioUrl(url);
            setStatus('ready');

        } catch (error) {
            console.error("Podcast generation failed", error);
            setStatus('error');
            setStatusMessage('Failed to generate podcast. Please try again.');
        }
    };

    return (
        <HubLayout 
            title="Podcast Studio" 
            subtitle="Create custom deep-dive audio lessons (10+ mins) on any topic." 
            gradient="bg-gradient-to-r from-pink-500 to-rose-500"
            onBack={onBack}
        >
            <div className="max-w-4xl w-full mx-auto p-4">
                {status === 'idle' && (
                    <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-stone-200 dark:border-stone-700">
                        <div className="text-center mb-8">
                            <div className="text-6xl mb-6 animate-bounce inline-block">🎙️</div>
                            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">Select a Topic</h2>
                            <p className="text-stone-600 dark:text-stone-400">Hosts Alex and Sam are ready to record a deep-dive episode for you.</p>
                        </div>
                        
                        <div className="space-y-3 mb-8">
                            {units.map(unit => {
                                const subTopics = specMap[unit] || [];
                                const isExpanded = expandedUnit === unit;
                                const isSelected = selectedTopic === unit || subTopics.includes(selectedTopic || '');

                                return (
                                    <div key={unit} className={`rounded-xl border transition-all overflow-hidden ${isExpanded || isSelected ? 'border-pink-300 dark:border-pink-700 bg-white dark:bg-stone-800' : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-pink-200'}`}>
                                        <button
                                            onClick={() => setExpandedUnit(isExpanded ? null : unit)}
                                            className={`w-full p-4 flex justify-between items-center text-left font-bold transition-colors ${isExpanded ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300' : 'text-stone-700 dark:text-stone-200'}`}
                                        >
                                            <span className="flex items-center gap-3">
                                                {isSelected && <span className="w-2 h-2 rounded-full bg-pink-500"></span>}
                                                {unit}
                                            </span>
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>

                                        {isExpanded && (
                                            <div className="p-3 bg-stone-50 dark:bg-stone-900/50 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-pink-100 dark:border-stone-700">
                                                <button
                                                    onClick={() => setSelectedTopic(unit)}
                                                    className={`p-3 rounded-lg text-left text-sm transition-all flex items-center gap-2 ${selectedTopic === unit ? 'bg-pink-500 text-white shadow-md font-bold' : 'bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-400'}`}
                                                >
                                                    <Mic size={16} />
                                                    Full Chapter Overview
                                                </button>

                                                {subTopics.map(sub => (
                                                    <button
                                                        key={sub}
                                                        onClick={() => setSelectedTopic(sub)}
                                                        className={`p-3 rounded-lg text-left text-sm transition-all ${selectedTopic === sub ? 'bg-pink-500 text-white shadow-md font-bold' : 'bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-400'}`}
                                                    >
                                                        {sub}
                                                    </button>
                                                ))}
                                                {subTopics.length === 0 && (
                                                    <p className="col-span-2 text-center text-xs text-stone-400 italic py-2">No sub-topics available. Select Full Chapter.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={handleGenerate}
                                disabled={!selectedTopic}
                                className="px-10 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold rounded-full text-lg shadow-xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-3"
                            >
                                {selectedTopic ? `Generate Episode: ${selectedTopic.length > 30 ? selectedTopic.substring(0, 30) + '...' : selectedTopic}` : 'Select a Topic'}
                                {selectedTopic && <Play size={20} fill="currentColor" />}
                            </button>
                        </div>
                    </div>
                )}

                {(status === 'generating-script' || status === 'generating-audio') && (
                    <div className="flex flex-col items-center justify-center h-[50vh]">
                        <div className="relative w-24 h-24 mb-8">
                            <div className="absolute inset-0 border-4 border-stone-200 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-pink-500 rounded-full border-t-transparent animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-3xl">🎤</div>
                        </div>
                        <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">{status === 'generating-script' ? 'Writing Script...' : 'Recording Audio...'}</h3>
                        <p className="text-stone-500 dark:text-stone-400 max-w-md text-center">{statusMessage}</p>
                    </div>
                )}

                {status === 'ready' && audioUrl && (
                    <div className="max-w-2xl mx-auto">
                        {/* Player Card */}
                        <div className="bg-stone-900 text-white rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 to-purple-600/20 pointer-events-none"></div>
                            
                            <div className="w-32 h-32 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center text-5xl shadow-lg mb-6 relative z-10 animate-pulse-slow">
                                🎧
                            </div>
                            
                            <h2 className="text-2xl font-bold text-center mb-1 relative z-10">{selectedTopic}</h2>
                            <p className="text-pink-300 text-sm font-medium mb-8 relative z-10">Geo Pro • Deep Dive</p>

                            <audio controls src={audioUrl} className="w-full mb-6 relative z-10 custom-audio-player" />

                            <a 
                                href={audioUrl} 
                                download={`GeoPro-Podcast-${selectedTopic?.replace(/[^a-zA-Z0-9]/g, '-')}.wav`}
                                className="px-6 py-3 bg-white text-stone-900 font-bold rounded-full hover:bg-stone-200 transition flex items-center gap-2 relative z-10"
                            >
                                <Download size={18} /> Download Episode
                            </a>
                        </div>
                        <button
                            onClick={() => { setStatus('idle'); setSelectedTopic(null); setExpandedUnit(null); }}
                            className="w-full mt-4 py-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition text-sm font-semibold"
                        >
                            Create Another Episode
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-center py-20">
                        <p className="text-red-500 text-xl font-bold mb-4">⚠️ Generation Failed</p>
                        <button onClick={() => setStatus('idle')} className="text-stone-500 underline">Try Again</button>
                    </div>
                )}
            </div>
            <style>{`
                .custom-audio-player { filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.9; transform: scale(1.02); }
                }
                .animate-pulse-slow { animation: pulse-slow 3s infinite ease-in-out; }
            `}</style>
        </HubLayout>
    );
};

export default PodcastView;
