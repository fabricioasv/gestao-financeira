import { formatNumber } from '../utils/formatting.js';

function DataTable({ rows, months }) {
    const hasData = Array.isArray(rows) && rows.length > 0;

    return (
        <div className="panel">
            <div className="panel-header">
                <div>
                    <p className="eyebrow">Dados brutos</p>
                    <h3>Linhas carregadas da planilha</h3>
                    <p className="muted small">
                        A tabela abaixo reflete exatamente as colunas da planilha (Alias, Id e meses).
                    </p>
                </div>
                <span className="pill">{rows.length} itens</span>
            </div>

            {!hasData ? (
                <p className="muted">Envie um arquivo Excel para visualizar os dados.</p>
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Alias</th>
                                <th>Id</th>
                                {months.map((month) => (
                                    <th key={month}>{month}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr key={`${row.alias}-${index}`}>
                                    <td>{row.alias || '-'}</td>
                                    <td>{row.id || '-'}</td>
                                    {months.map((month) => (
                                        <td key={`${month}-${index}`}>{formatNumber(row.months[month])}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export { DataTable };

