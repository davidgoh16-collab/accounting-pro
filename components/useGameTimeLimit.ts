import { useState, useEffect, useRef } from 'react';

interface GameTimerData {
    periodStart: number;
    usedSeconds: number;
}

const HOUR_MS = 3_600_000;

export function useGameTimeLimit(
    userId: string | undefined,
    limitMinutes: number,
    isActive: boolean
) {
    const [remainingSeconds, setRemainingSeconds] = useState(limitMinutes * 60);
    const [isBlocked, setIsBlocked] = useState(false);
    const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const limitRef = useRef(limitMinutes);
    const keyRef = useRef<string | null>(null);

    useEffect(() => { limitRef.current = limitMinutes; }, [limitMinutes]);
    useEffect(() => { keyRef.current = userId ? `gameTimer_${userId}` : null; }, [userId]);

    function readData(): GameTimerData {
        const key = keyRef.current;
        if (!key) return { periodStart: Date.now(), usedSeconds: 0 };
        try {
            const raw = localStorage.getItem(key);
            if (raw) {
                const d: GameTimerData = JSON.parse(raw);
                if (Date.now() - d.periodStart < HOUR_MS) return d;
                const fresh = { periodStart: Date.now(), usedSeconds: 0 };
                localStorage.setItem(key, JSON.stringify(fresh));
                return fresh;
            }
        } catch { /* ignore */ }
        const fresh = { periodStart: Date.now(), usedSeconds: 0 };
        if (key) localStorage.setItem(key, JSON.stringify(fresh));
        return fresh;
    }

    function syncState(d: GameTimerData) {
        const limitS = limitRef.current * 60;
        const remaining = Math.max(0, limitS - d.usedSeconds);
        const blocked = d.usedSeconds >= limitS && Date.now() - d.periodStart < HOUR_MS;
        setRemainingSeconds(remaining);
        setIsBlocked(blocked);
        setCooldownUntil(blocked ? d.periodStart + HOUR_MS : null);
    }

    // Recompute when userId or limitMinutes changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { syncState(readData()); }, [userId, limitMinutes]);

    // Start/stop timer based on isActive
    useEffect(() => {
        if (isActive) {
            if (intervalRef.current) return;
            intervalRef.current = setInterval(() => {
                const d = readData();
                d.usedSeconds += 1;
                const key = keyRef.current;
                if (key) try { localStorage.setItem(key, JSON.stringify(d)); } catch { /* ignore */ }
                syncState(d);
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive]);

    return { remainingSeconds, isBlocked, cooldownUntil };
}
