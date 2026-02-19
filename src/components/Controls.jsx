export default function Controls({
    isRunning,
    onPlayPause,
    onPrev,
    onNext,
    onReset,
    canPrev,
    canNext,
    isLast,
}) {
    return (
        <>
            <div className="controls">
                <button
                    className="control-btn control-btn-secondary"
                    onClick={onReset}
                    title="Reiniciar sección (R)"
                    aria-label="Reiniciar sección"
                >
                    ↻
                </button>

                <button
                    className="control-btn control-btn-nav"
                    onClick={onPrev}
                    disabled={!canPrev}
                    title="Sección anterior (←)"
                    aria-label="Sección anterior"
                >
                    ◂
                </button>
                <button
                    className="control-btn control-btn-play"
                    onClick={onPlayPause}
                    title={isRunning ? 'Pausar (Espacio)' : 'Iniciar (Espacio)'}
                    aria-label={isRunning ? 'Pausar' : 'Iniciar'}
                >
                    {isRunning ? '⏸' : '▶'}
                </button>
                <button
                    className="control-btn control-btn-nav"
                    onClick={onNext}
                    disabled={!canNext && !isLast}
                    title={isLast ? 'Finalizar y ver reporte' : 'Siguiente sección (→)'}
                    aria-label={isLast ? 'Finalizar' : 'Siguiente sección'}
                >
                    {isLast ? '🏁' : '▸'}
                </button>
            </div>
            <div className="keyboard-hints">
                <span className="keyboard-hint">
                    <kbd>Espacio</kbd> Play/Pause
                </span>
                <span className="keyboard-hint">
                    <kbd>R</kbd> Reset
                </span>
                <span className="keyboard-hint">
                    <kbd>←</kbd> Prev
                </span>
                <span className="keyboard-hint">
                    <kbd>→</kbd> {isLast ? 'Fin' : 'Next'}
                </span>
            </div>
        </>
    );
}
