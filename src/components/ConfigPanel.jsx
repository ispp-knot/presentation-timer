import { useMemo, useRef, useState } from 'react';

export default function ConfigPanel({
    config,
    onConfigChange,
}) {
    const { minTime, maxTime, presenters, sections } = config;

    // --- Drag state ---
    const [dragIndex, setDragIndex] = useState(null);
    const [overIndex, setOverIndex] = useState(null);
    const dragNode = useRef(null);

    /**
     * Compute total duration in minutes from sections that store
     * { duration: minutes, seconds: seconds }
     */
    const totalDuration = useMemo(
        () =>
            sections.reduce((sum, s) => {
                const mins = parseFloat(s.duration) || 0;
                const secs = parseFloat(s.seconds) || 0;
                return sum + mins + secs / 60;
            }, 0),
        [sections]
    );

    const isValid =
        totalDuration >= (parseFloat(minTime) || 0) &&
        totalDuration <= (parseFloat(maxTime) || 0) &&
        (parseFloat(minTime) || 0) <= (parseFloat(maxTime) || 0);

    // --- Helpers ---
    const update = (patch) => onConfigChange({ ...config, ...patch });

    const updatePresenter = (index, value) => {
        const next = [...presenters];
        next[index] = value;
        update({ presenters: next });
    };

    const addPresenter = () => update({ presenters: [...presenters, ''] });

    const removePresenter = (index) => {
        const name = presenters[index];
        const next = presenters.filter((_, i) => i !== index);
        const updatedSections = sections.map((s) =>
            s.presenter === name ? { ...s, presenter: '' } : s
        );
        update({ presenters: next, sections: updatedSections });
    };

    const updateSection = (index, patch) => {
        const next = [...sections];
        next[index] = { ...next[index], ...patch };
        update({ sections: next });
    };

    const addSection = () =>
        update({
            sections: [
                ...sections,
                { name: '', duration: 5, seconds: 0, presenter: presenters[0] || '' },
            ],
        });

    const removeSection = (index) =>
        update({ sections: sections.filter((_, i) => i !== index) });

    // --- Drag handlers ---
    const handleDragStart = (e, index) => {
        dragNode.current = e.target;
        setDragIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        // Make the drag image slightly transparent
        setTimeout(() => {
            if (dragNode.current) dragNode.current.style.opacity = '0.4';
        }, 0);
    };

    const handleDragEnter = (e, index) => {
        e.preventDefault();
        if (index !== dragIndex) {
            setOverIndex(index);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, index) => {
        e.preventDefault();
        if (dragIndex === null || dragIndex === index) return;
        const next = [...sections];
        const [moved] = next.splice(dragIndex, 1);
        next.splice(index, 0, moved);
        update({ sections: next });
    };

    const handleDragEnd = () => {
        if (dragNode.current) dragNode.current.style.opacity = '1';
        dragNode.current = null;
        setDragIndex(null);
        setOverIndex(null);
    };

    const formatTotalDuration = (mins) => {
        const totalMins = Math.floor(mins);
        const totalSecs = Math.round((mins - totalMins) * 60);
        if (totalSecs > 0) return `${totalMins} min ${totalSecs} s`;
        return `${totalMins} min`;
    };

    return (
        <div className="config-panel">
            {/* Time Range */}
            <div className="config-section">
                <h2>Rango de tiempo total</h2>
                <div className="time-range-row">
                    <div className="form-group">
                        <label>Mínimo (min)</label>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            value={minTime}
                            onChange={(e) => update({ minTime: e.target.value })}
                            placeholder="0"
                        />
                    </div>
                    <div className="form-group">
                        <label>Máximo (min)</label>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            value={maxTime}
                            onChange={(e) => update({ maxTime: e.target.value })}
                            placeholder="0"
                        />
                    </div>
                </div>
            </div>

            {/* Presenters */}
            <div className="config-section">
                <h2>Presentadores</h2>
                <div className="presenter-list">
                    {presenters.map((name, i) => (
                        <div className="presenter-item" key={i}>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => updatePresenter(i, e.target.value)}
                                placeholder={`Presentador ${i + 1}`}
                            />
                            <button
                                className="btn-icon btn-icon-delete"
                                onClick={() => removePresenter(i)}
                                title="Eliminar presentador"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
                <button className="btn-add" onClick={addPresenter}>
                    + Añadir presentador
                </button>
            </div>

            {/* Sections */}
            <div className="config-section">
                <h2>Secciones</h2>
                <p className="section-hint">Arrastra ☰ para reordenar</p>
                <div className="section-list">
                    {sections.map((section, i) => (
                        <div
                            className={`section-item${overIndex === i && dragIndex !== i ? ' drag-over' : ''}${dragIndex === i ? ' dragging' : ''}`}
                            key={i}
                            draggable
                            onDragStart={(e) => handleDragStart(e, i)}
                            onDragEnter={(e) => handleDragEnter(e, i)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, i)}
                            onDragEnd={handleDragEnd}
                        >
                            <span className="drag-handle" title="Arrastrar para reordenar">☰</span>
                            <span className="section-number">{i + 1}</span>
                            <input
                                className="section-name-input"
                                type="text"
                                value={section.name}
                                onChange={(e) => updateSection(i, { name: e.target.value })}
                                placeholder="Nombre de la sección"
                            />
                            <div className="section-time-group">
                                <input
                                    className="section-duration-input"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={section.duration}
                                    onChange={(e) => updateSection(i, { duration: e.target.value })}
                                />
                                <span className="duration-label">min</span>
                                <input
                                    className="section-duration-input section-seconds-input"
                                    type="number"
                                    min="0"
                                    max="59"
                                    step="1"
                                    value={section.seconds || 0}
                                    onChange={(e) => updateSection(i, { seconds: e.target.value })}
                                />
                                <span className="duration-label">seg</span>
                            </div>
                            <select
                                value={section.presenter}
                                onChange={(e) => updateSection(i, { presenter: e.target.value })}
                            >
                                <option value="">— Presentador —</option>
                                {presenters
                                    .filter((p) => p.trim() !== '')
                                    .map((p, pi) => (
                                        <option key={pi} value={p}>
                                            {p}
                                        </option>
                                    ))}
                            </select>
                            <button
                                className="btn-icon btn-icon-delete"
                                onClick={() => removeSection(i)}
                                title="Eliminar sección"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
                <button className="btn-add" onClick={addSection}>
                    + Añadir sección
                </button>
            </div>

            {/* Validation */}
            <div className={`validation-bar ${isValid ? 'valid' : 'invalid'}`}>
                <span className="validation-icon">{isValid ? '✓' : '⚠'}</span>
                <span>
                    Duración total: <strong>{formatTotalDuration(totalDuration)}</strong>
                    {' — '}
                    {isValid
                        ? `Dentro del rango (${minTime}–${maxTime} min)`
                        : totalDuration < (parseFloat(minTime) || 0)
                            ? `Faltan ${((parseFloat(minTime) || 0) - totalDuration).toFixed(1)} min para alcanzar el mínimo`
                            : totalDuration > (parseFloat(maxTime) || 0)
                                ? `Excede el máximo por ${(totalDuration - (parseFloat(maxTime) || 0)).toFixed(1)} min`
                                : `El mínimo debe ser ≤ máximo`}
                </span>
            </div>
        </div>
    );
}
