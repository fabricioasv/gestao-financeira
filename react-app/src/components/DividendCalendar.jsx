import { DIVIDEND_MONTHS, getStockField, parseDividendMonths } from '../utils/dividendMonths.js';

export function DividendCalendar({ rows = [] }) {
    const stocks = rows.filter((row) => String(getStockField(row, 'Ticker')).trim());

    return (
        <div className="panel">
            <div className="panel-header">
                <div>
                    <p className="eyebrow">Proventos</p>
                    <h3>Calendário de anúncios de dividendos</h3>
                    <p className="muted small">Meses de divulgação informados em Ações-Carteira, coluna Anunc. Div. Cada ● indica um mês de anúncio.</p>
                </div>
            </div>
            {stocks.length === 0 ? (
                <p className="muted small">Nenhuma ação encontrada. Carregue os dados da carteira.</p>
            ) : (
                <div className="table-wrapper">
                    <table className="dividend-calendar">
                        <thead>
                            <tr>
                                <th scope="col">Ação</th>
                                <th scope="col">Anunc. Div.</th>
                                {DIVIDEND_MONTHS.map((month) => <th scope="col" key={month}>{month}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {stocks.map((row, index) => {
                                const ticker = getStockField(row, 'Ticker');
                                const announcement = getStockField(row, 'Anunc. Div.');
                                const months = parseDividendMonths(announcement);
                                return (
                                    <tr key={`${ticker}-${index}`}>
                                        <th scope="row">{ticker}</th>
                                        <td>{announcement || 'Não informado'}</td>
                                        {DIVIDEND_MONTHS.map((month, monthIndex) => (
                                            <td key={month} className={months.includes(monthIndex) ? 'dividend-month-active' : ''}
                                                aria-label={`${month}: ${months.includes(monthIndex) ? 'anúncio previsto' : 'sem anúncio indicado'}`}>
                                                {months.includes(monthIndex) ? '●' : '—'}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
