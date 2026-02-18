import { useState, useEffect, useCallback } from 'react';
import ConfigPanel from './components/ConfigPanel';
import PresentationView from './components/PresentationView';
import useTimer from './hooks/useTimer';

const STORAGE_KEY = 'presentation-timer-config';

const DEFAULT_CONFIG = {
    minTime: 10,
    maxTime: 15,
    presenters: ['Presentador 1'],
    sections: [
        { name: 'Introducción', duration: 3, seconds: 0, presenter: 'Presentador 1' },
        { name: 'Demo', duration: 5, seconds: 0, presenter: 'Presentador 1' },
        { name: 'Cierre', duration: 2, seconds: 0, presenter: 'Presentador 1' },
    ],
};

function loadConfig() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.sections) && Array.isArray(parsed.presenters)) {
                parsed.sections = parsed.sections.map((s) => ({
                    seconds: 0,
                    ...s,
                }));
                return parsed;
            }
        }
    } catch {
        // ignore
    }
    return DEFAULT_CONFIG;
}

function saveConfig(config) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
        // ignore
    }
}

export default function App() {
    const [config, setConfig] = useState(loadConfig);
    const [mode, setMode] = useState('config');
    const [currentIndex, setCurrentIndex] = useState(0);

    // Per-section timer — resets on section change
    const sectionTimer = useTimer();
    // Global timer — tracks real wall-clock time for the entire presentation
    const globalTimer = useTimer();

    // Persist config on change
    useEffect(() => {
        saveConfig(config);
    }, [config]);

    // --- Presentation controls ---
    const togglePlayPause = useCallback(() => {
        if (sectionTimer.isRunning) {
            sectionTimer.pause();
            globalTimer.pause();
        } else {
            sectionTimer.play();
            globalTimer.play();
        }
    }, [sectionTimer, globalTimer]);

    const goToSection = useCallback(
        (index, keepPlaying = false) => {
            if (index < 0 || index >= config.sections.length) return;
            const wasRunning = sectionTimer.isRunning;
            sectionTimer.pause();
            globalTimer.pause();
            setCurrentIndex(index);
            sectionTimer.reset(0);
            // Global timer keeps running — don't reset it
            if (keepPlaying && wasRunning) {
                setTimeout(() => {
                    sectionTimer.play();
                    globalTimer.play();
                }, 0);
            }
        },
        [config.sections.length, sectionTimer, globalTimer]
    );

    const goNext = useCallback(
        () => goToSection(currentIndex + 1, true),
        [goToSection, currentIndex]
    );
    const goPrev = useCallback(
        () => goToSection(currentIndex - 1, true),
        [goToSection, currentIndex]
    );

    const canPresent = config.sections.length > 0;

    const handleModeToggle = useCallback(() => {
        if (mode === 'config') {
            if (!canPresent) return;
            setCurrentIndex(0);
            sectionTimer.reset(0);
            globalTimer.reset(0);
            setMode('presentation');
        } else {
            sectionTimer.pause();
            sectionTimer.reset(0);
            globalTimer.pause();
            globalTimer.reset(0);
            setMode('config');
        }
    }, [mode, canPresent, sectionTimer, globalTimer]);

    return (
        <div className="app">
            <header className="app-header">
                <h1>
                    <span className="logo-icon">⏱</span>
                    Presentation Timer
                </h1>
                <button
                    className="mode-toggle-btn"
                    onClick={handleModeToggle}
                    disabled={mode === 'config' && !canPresent}
                >
                    {mode === 'config' ? '▶  Iniciar Presentación' : '✎  Configuración'}
                </button>
            </header>

            {mode === 'config' ? (
                <ConfigPanel config={config} onConfigChange={setConfig} />
            ) : (
                <PresentationView
                    sections={config.sections}
                    currentIndex={currentIndex}
                    elapsedSeconds={sectionTimer.elapsedSeconds}
                    globalElapsedSeconds={globalTimer.elapsedSeconds}
                    isRunning={sectionTimer.isRunning}
                    onPlayPause={togglePlayPause}
                    onPrev={goPrev}
                    onNext={goNext}
                    minTime={parseFloat(config.minTime) || 0}
                    maxTime={parseFloat(config.maxTime) || 0}
                />
            )}
        </div>
    );
}
