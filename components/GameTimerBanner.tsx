import React from 'react';

interface Props {
    remainingSeconds: number;
    isVisible: boolean;
}

function formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

const GameTimerBanner: React.FC<Props> = ({ remainingSeconds, isVisible }) => {
    if (!isVisible) return null;

    const isLow = remainingSeconds <= 60;
    const isVeryLow = remainingSeconds <= 30;

    return (
        <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg font-bold text-white text-lg transition-colors ${
                isVeryLow
                    ? 'bg-red-600 animate-pulse'
                    : isLow
                    ? 'bg-orange-500'
                    : 'bg-emerald-600'
            }`}
            title="Game time remaining this hour"
        >
            <span>⏱</span>
            <span>{formatTime(remainingSeconds)}</span>
        </div>
    );
};

export default GameTimerBanner;
