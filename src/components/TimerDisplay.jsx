import { useMemo } from 'react';

/**
 * Formats a number of seconds into MM:SS.
 * If negative, prepends a minus sign.
 */
function formatTime(totalSeconds) {
    const negative = totalSeconds < 0;
    const abs = Math.abs(Math.floor(totalSeconds));
    const m = Math.floor(abs / 60);
    const s = abs % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return `${negative ? '-' : ''}${mm}:${ss}`;
}

export default function TimerDisplay({ remainingSeconds }) {
    const isOvertime = remainingSeconds < 0;

    const formatted = useMemo(() => formatTime(remainingSeconds), [remainingSeconds]);

    return (
        <div
            className={`timer-display${isOvertime ? ' overtime pulse' : ''}`}
            aria-live="polite"
            aria-label={`Tiempo restante: ${formatted}`}
        >
            {formatted}
        </div>
    );
}
