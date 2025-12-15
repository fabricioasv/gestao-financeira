import { formatNumber } from '../utils/formatting.js';

function SummaryCards({ totals, months, rowCount }) {
    if (!months || months.length === 0) {
        return null;
    }

    return (
        <div className="panel">
            <div className="panel-header">
                <div>
                    <p className="eyebrow">Visão geral</p>
                    <h3>Totais por mês</h3>
                    <p className="muted small">
                        Valores somados para {rowCount || 0} linhas carregadas.
                    </p>
                </div>
                <span className="pill">{rowCount || 0} linhas</span>
            </div>
            <div className="summary-grid">
                {months.map((month) => (
                    <div key={month} className="summary-card">
                        <p className="label">{month}</p>
                        <p className="value">{formatNumber(totals[month])}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export { SummaryCards };

