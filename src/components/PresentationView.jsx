import { useMemo, useEffect, useCallback } from 'react';
import TimerDisplay from './TimerDisplay';
import Controls from './Controls';

/**
 * Formats total seconds as MM:SS (always positive).
 */
function fmtTime(totalSeconds) {
    const abs = Math.max(0, Math.floor(totalSeconds));
    const m = Math.floor(abs / 60);
    const s = abs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Formats a signed difference in seconds as +MM:SS or -MM:SS.
 */
function fmtDiff(diffSeconds) {
    // Round to nearest integer to stabilize display
    const val = Math.round(diffSeconds);
    const sign = val >= 0 ? '+' : '-';
    const abs = Math.abs(val);
    const m = Math.floor(abs / 60);
    const s = abs % 60;
    return `${sign}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Get total duration of a section in seconds (minutes + seconds).
 */
function sectionTotalSec(section) {
    return ((parseFloat(section.duration) || 0) * 60) + (parseFloat(section.seconds) || 0);
}

export default function PresentationView({
    sections,
    currentIndex,
    elapsedSeconds,
    globalElapsedSeconds,
    isRunning,
    onPlayPause,
    onPrev,
    onNext,
    onReset,
    minTime,
    maxTime,
}) {
    const total = sections.length;
    const section = sections[currentIndex];

    // Keyboard shortcuts
    const handleKeyDown = useCallback(
        (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.code === 'Space') {
                e.preventDefault();
                onPlayPause();
            } else if (e.code === 'ArrowRight') {
                e.preventDefault();
                onNext();
            } else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                onPrev();
            }
        },
        [onPlayPause, onNext, onPrev]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // -- Calculations --
    const sectionDurationSec = sectionTotalSec(section || { duration: 0, seconds: 0 });
    const remainingSection = sectionDurationSec - elapsedSeconds;

    // Total duration in seconds (all sections)
    const totalDurationSec = useMemo(
        () => sections.reduce((s, sec) => s + sectionTotalSec(sec), 0),
        [sections]
    );

    // Total remaining = totalDuration - realElapsed (clamped to 0)
    const totalRemaining = Math.max(0, totalDurationSec - globalElapsedSeconds);

    // Progress based on real elapsed time
    const progress = totalDurationSec > 0
        ? Math.min(1, globalElapsedSeconds / totalDurationSec)
        : 0;

    // "Ideal" elapsed = sum of completed sections + min(current section elapsed, section duration)
    // This is how much time we *should* have used if on schedule
    const idealElapsed = useMemo(() => {
        let sum = 0;
        for (let i = 0; i < currentIndex; i++) {
            sum += sectionTotalSec(sections[i]);
        }
        sum += Math.min(elapsedSeconds, sectionDurationSec);
        return sum;
    }, [sections, currentIndex, elapsedSeconds, sectionDurationSec]);

    // Schedule diff: negative = behind (real time > ideal), positive = ahead
    // Round to nearest second to avoid jitter on sub-second noise
    const scheduleDiff = Math.round(idealElapsed - globalElapsedSeconds);

    const nextSection = currentIndex < total - 1 ? sections[currentIndex + 1] : null;

    // Min/Max in seconds
    const minTimeSec = minTime * 60;
    const maxTimeSec = maxTime * 60;

    const elapsedTotalColor =
        globalElapsedSeconds >= minTimeSec && globalElapsedSeconds <= maxTimeSec
            ? 'in-range'
            : globalElapsedSeconds > maxTimeSec
                ? 'over-range'
                : '';

    if (!section) {
        return (
            <div className="presentation-view">
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <p>No hay secciones configuradas.</p>
                    <p>Vuelve a Configuración para añadirlas.</p>
                </div>
            </div>
        );
    }

    const isAhead = scheduleDiff >= 0;

    const handleContainerClick = useCallback((e) => {
        // Ignore clicks on buttons or interactive elements
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a')) {
            return;
        }

        const { clientX } = e;
        const { innerWidth } = window;

        if (clientX > innerWidth / 2) {
            onNext();
        } else {
            onPrev();
        }
    }, [onNext, onPrev]);

    const isLast = currentIndex === sections.length - 1;

    return (
        <div className="presentation-view" onClick={handleContainerClick}>
            <span className="section-counter">
                SECCIÓN {currentIndex + 1} / {total}
            </span>

            <span className="current-section-label">Sección actual</span>
            <span className="current-section-name">{section.name || 'Sin nombre'}</span>
            <span className="current-presenter">
                {section.presenter || 'Sin presentador'}
            </span>

            <TimerDisplay remainingSeconds={remainingSection} />

            {nextSection && (
                <div className="next-info">
                    <span className="next-label">Siguiente</span>
                    <span className="next-value">
                        {nextSection.name || 'Sin nombre'} — {nextSection.presenter || '?'}
                    </span>
                </div>
            )}

            <div className="elapsed-total-row">
                <div className="total-remaining">
                    <span className="total-label">Tiempo restante</span>
                    <span className="total-value">{fmtTime(totalRemaining)}</span>
                </div>
                <div className={`total-remaining elapsed-total ${elapsedTotalColor}`}>
                    <span className="total-label">Tiempo real transcurrido</span>
                    <span className="total-value">
                        {fmtTime(globalElapsedSeconds)}
                        <span className="elapsed-range"> / {fmtTime(minTimeSec)}–{fmtTime(maxTimeSec)}</span>
                    </span>
                </div>
                <div className={`total-remaining schedule-diff ${isAhead ? 'ahead' : 'behind'}`}>
                    <span className="total-label">{isAhead ? 'Adelantados' : 'Atrasados'}</span>
                    <span className="total-value diff-value">{fmtDiff(scheduleDiff)}</span>
                </div>
            </div>

            <div className="progress-bar-container">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${(progress * 100).toFixed(2)}%` }}
                />
            </div>

            <Controls
                isRunning={isRunning}
                onPlayPause={onPlayPause}
                onPrev={onPrev}
                onNext={onNext}
                onReset={onReset}
                canPrev={currentIndex > 0}
                canNext={currentIndex < total - 1}
                isLast={isLast}
            />
        </div>
    );
}
