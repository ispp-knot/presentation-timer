export default function Controls({
    isRunning,
    onPlayPause,
    onPrev,
    onNext,
    canPrev,
    canNext,
}) {
    return (
        <>
            <div className="controls">
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
                    disabled={!canNext}
                    title="Siguiente sección (→)"
                    aria-label="Siguiente sección"
                >
                    ▸
                </button>
            </div>
            <div className="keyboard-hints">
                <span className="keyboard-hint">
                    <kbd>Espacio</kbd> Play / Pause
                </span>
                <span className="keyboard-hint">
                    <kbd>←</kbd> Anterior
                </span>
                <span className="keyboard-hint">
                    <kbd>→</kbd> Siguiente
                </span>
            </div>
        </>
    );
}
