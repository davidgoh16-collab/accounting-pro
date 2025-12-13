
import React, { useState, useEffect, useRef } from 'react';
import { AuthUser } from '../types';
import { ALEVEL_UNITS, GCSE_UNITS } from '../constants';
import { generatePodcastScript, generatePodcastAudio } from '../services/geminiService';
import HubLayout from './HubLayout';

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
    const [script, setScript] = useState<string | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'generating-script' | 'generating-audio' | 'ready' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');
    
    const topics = user.level === 'GCSE' ? GCSE_UNITS.filter(u => u !== 'All Units') : ALEVEL_UNITS.filter(u => u !== 'All Units');

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
                    <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-stone-200 dark:border-stone-700 text-center">
                        <div className="text-6xl mb-6 animate-bounce">🎙️</div>
                        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">Select a Topic</h2>
                        <p className="text-stone-600 dark:text-stone-400 mb-8">Hosts Alex and Sam are ready to record a deep-dive episode for you.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                            {topics.map(topic => (
                                <button 
                                    key={topic}
                                    onClick={() => setSelectedTopic(topic)}
                                    className={`p-4 rounded-xl border transition-all ${selectedTopic === topic ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-500 ring-2 ring-pink-200 dark:ring-pink-800' : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-pink-300'}`}
                                >
                                    <span className="font-semibold text-stone-800 dark:text-stone-200">{topic}</span>
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={handleGenerate} 
                            disabled={!selectedTopic}
                            className="mt-8 px-8 py-3 bg-pink-600 text-white font-bold rounded-full text-lg shadow-lg hover:bg-pink-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-transform active:scale-95"
                        >
                            Generate Episode
                        </button>
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
                            
                            <div className="w-32 h-32 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center text-5xl shadow-lg mb-6 relative z-10">
                                🎧
                            </div>
                            
                            <h2 className="text-2xl font-bold text-center mb-1 relative z-10">{selectedTopic}</h2>
                            <p className="text-pink-300 text-sm font-medium mb-8 relative z-10">Geo Pro • Deep Dive</p>

                            <audio controls src={audioUrl} className="w-full mb-6 relative z-10 custom-audio-player" />

                            <a 
                                href={audioUrl} 
                                download={`GeoPro-Podcast-${selectedTopic?.replace(/\s+/g, '-')}.wav`}
                                className="px-6 py-3 bg-white text-stone-900 font-bold rounded-full hover:bg-stone-200 transition flex items-center gap-2 relative z-10"
                            >
                                <span>⬇️</span> Download Episode
                            </a>
                        </div>
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
            `}</style>
        </HubLayout>
    );
};

export default PodcastView;
