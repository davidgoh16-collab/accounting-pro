import React from 'react';

interface SelectApiKeyViewProps {
    onKeySelected: () => void;
    isErrorState: boolean;
}

const SelectApiKeyView: React.FC<SelectApiKeyViewProps> = ({ onKeySelected, isErrorState }) => {
    const handleSelectKey = async () => {
        try {
            await window.aistudio?.openSelectKey();
            onKeySelected();
        } catch (error) {
            console.error("Error opening API key selection:", error);
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-4 bg-stone-900">
            <div className="max-w-xl w-full bg-stone-800 border border-stone-700/50 rounded-2xl p-8 text-center text-white">
                <span className="text-6xl">🎬</span>
                <h1 className="text-3xl font-bold text-white mt-4">Video Generation Requires an API Key</h1>
                
                {isErrorState && (
                    <div className="mt-4 p-4 bg-red-900/50 text-red-300 border-l-4 border-red-500 rounded-r-lg text-left">
                        <p className="font-bold">API Key Error</p>
                        <p className="text-sm">Your last request failed. This is often because the selected API key is not associated with a project that has billing enabled, or you have exceeded your quota.</p>
                    </div>
                )}

                <p className="text-stone-300 mt-4">
                    To use the video generation features, please select a Google AI API key from a project with billing enabled.
                </p>
                <p className="text-sm text-stone-400 mt-2">
                    For more information on setting up billing, please visit the official documentation.
                </p>
                <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-blue-400 hover:underline mt-2 inline-block"
                >
                    Google AI Billing Documentation
                </a>

                <button
                    onClick={handleSelectKey}
                    className="w-full mt-6 py-3 bg-blue-500 text-white font-bold text-lg rounded-lg shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition"
                >
                    {isErrorState ? 'Select a Different API Key' : 'Select API Key'}
                </button>
            </div>
        </div>
    );
};

export default SelectApiKeyView;