import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useTimer — drift-free timer using requestAnimationFrame + performance.now().
 *
 * Returns elapsed seconds for the current timing session.
 * The consumer is responsible for interpreting elapsed vs. remaining time.
 */
export default function useTimer() {
    const [elapsedMs, setElapsedMs] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    // Accumulated time from previous play sessions (before last pause)
    const accumulatedRef = useRef(0);
    // Timestamp of the last play() call
    const startStampRef = useRef(null);
    // RAF id
    const rafRef = useRef(null);

    const tick = useCallback(() => {
        if (startStampRef.current === null) return;
        const now = performance.now();
        const total = accumulatedRef.current + (now - startStampRef.current);
        setElapsedMs(total);
        rafRef.current = requestAnimationFrame(tick);
    }, []);

    const play = useCallback(() => {
        if (startStampRef.current !== null) return; // already running
        startStampRef.current = performance.now();
        setIsRunning(true);
        rafRef.current = requestAnimationFrame(tick);
    }, [tick]);

    const pause = useCallback(() => {
        if (startStampRef.current === null) return; // not running
        cancelAnimationFrame(rafRef.current);
        const now = performance.now();
        accumulatedRef.current += now - startStampRef.current;
        startStampRef.current = null;
        setIsRunning(false);
    }, []);

    const reset = useCallback((newElapsedMs = 0) => {
        cancelAnimationFrame(rafRef.current);
        accumulatedRef.current = newElapsedMs;
        startStampRef.current = null;
        setElapsedMs(newElapsedMs);
        setIsRunning(false);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    const elapsedSeconds = elapsedMs / 1000;

    return { elapsedSeconds, isRunning, play, pause, reset };
}
