import { useMemo } from 'react';

// Format HH:MM:SS or MM:SS
function fmtTime(totalSeconds) {
    const abs = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(abs / 3600);
    const m = Math.floor((abs % 3600) / 60);
    const s = abs % 60;
    if (h > 0) {
        return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Format +MM:SS or -MM:SS
function fmtDiff(diffSeconds) {
    const val = Math.round(diffSeconds);
    const sign = val >= 0 ? '+' : '-';
    const abs = Math.abs(val);
    const m = Math.floor(abs / 60);
    const s = abs % 60;
    return `${sign}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function sectionPlannedSec(section) {
    return ((parseFloat(section.duration) || 0) * 60) + (parseFloat(section.seconds) || 0);
}

export default function ReportView({ config, history, onExit }) {
    const rows = useMemo(() => {
        let cumPlanned = 0;
        let cumActual = 0;

        return config.sections.map((section, index) => {
            const planned = sectionPlannedSec(section);
            const actual = history[index] || 0;
            const diff = actual - planned; // positive = longer than planned

            cumPlanned += planned;
            cumActual += actual;
            const cumDiff = cumActual - cumPlanned;

            return {
                name: section.name || `Sección ${index + 1}`,
                presenter: section.presenter || '-',
                planned,
                actual,
                diff,
                cumPlanned,
                cumActual,
                cumDiff,
            };
        });
    }, [config.sections, history]);

    const totalPlanned = rows.length > 0 ? rows[rows.length - 1].cumPlanned : 0;
    const totalActual = rows.length > 0 ? rows[rows.length - 1].cumActual : 0;
    const totalDiff = totalActual - totalPlanned;

    return (
        <div className="report-view">
            <header className="report-header">
                <h2>Resumen de la Presentación</h2>
                <div className="report-summary">
                    <div className="summary-item">
                        <span className="label">Tiempo Total</span>
                        <span className="value">{fmtTime(totalActual)}</span>
                    </div>
                    <div className={`summary-item ${totalDiff >= 0 ? 'over' : 'under'}`}>
                        <span className="label">Desviación Total</span>
                        <span className="value">{fmtDiff(totalDiff)}</span>
                    </div>
                </div>
            </header>

            <div className="table-container">
                <table className="report-table">
                    <thead>
                        <tr>
                            <th className="col-name">Sección</th>
                            <th className="col-presenter">Presentador</th>
                            <th className="col-time">Planificado</th>
                            <th className="col-time">Real</th>
                            <th className="col-diff">Desviación</th>
                            <th className="col-cum">Acumulado (Plan)</th>
                            <th className="col-cum">Acumulado (Real)</th>
                            <th className="col-diff">Desv. Acum.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i}>
                                <td className="col-name">{row.name}</td>
                                <td className="col-presenter">{row.presenter}</td>
                                <td className="col-time">{fmtTime(row.planned)}</td>
                                <td className="col-time">{fmtTime(row.actual)}</td>
                                <td className={`col-diff ${row.diff > 0 ? 'pos' : 'neg'}`}>
                                    {fmtDiff(row.diff)}
                                </td>
                                <td className="col-cum">{fmtTime(row.cumPlanned)}</td>
                                <td className="col-cum">{fmtTime(row.cumActual)}</td>
                                <td className={`col-diff ${row.cumDiff > 0 ? 'pos' : 'neg'}`}>
                                    {fmtDiff(row.cumDiff)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="2" className="total-label-cell">TOTALES</td>
                            <td className="col-time">{fmtTime(totalPlanned)}</td>
                            <td className="col-time">{fmtTime(totalActual)}</td>
                            <td className={`col-diff ${totalDiff > 0 ? 'pos' : 'neg'}`}>
                                {fmtDiff(totalDiff)}
                            </td>
                            <td colSpan="3"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="report-actions">
                <button className="btn-exit" onClick={onExit}>
                    ⟵ Volver a Configuración
                </button>
            </div>
        </div>
    );
}
