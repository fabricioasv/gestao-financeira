function ActionsTable({ headers = [], rows = [] }) {
    const hasData = Array.isArray(rows) && rows.length > 0;

    if (!hasData) {
        return (
            <div className="panel">
                <div className="panel-header">
                    <div>
                        <p className="eyebrow">Investimentos</p>
                        <h3>Tabela de Ações</h3>
                        <p className="muted small">Nenhum dado encontrado. Envie a planilha.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="panel">
            <div className="panel-header">
                <div>
                    <p className="eyebrow">Investimentos</p>
                    <h3>Tabela de Ações (aba Ações-Carteira)</h3>
                    <p className="muted small">Mostra os dados brutos da aba Ações-Carteira.</p>
                </div>
                <span className="pill">{rows.length} ativos</span>
            </div>
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            {headers.map((h) => (
                                <th key={h || 'col'}>{h || '-'}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={idx}>
                                {headers.map((h, colIdx) => (
                                    <td key={`${idx}-${colIdx}`}>
                                        {row[h || `col_${colIdx}`] !== undefined
                                            ? String(row[h || `col_${colIdx}`])
                                            : '-'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export { ActionsTable };

