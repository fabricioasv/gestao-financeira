// Colunas visíveis na ordem desejada (nomes exatamente como vêm da API, normalizados)
const VISIBLE_COLUMNS = [
    'Ticker',
    'Amount',
    'Average Price',
    'Nota 0-7',       // API: "Nota\n0-7"
    'Margem',
    '% Div. Proj.',   // API: "% Div. Proj."
    'Div. Proj.',
    'DY Pago',
    'DY a Pagar',
    'DY em Aberto',
    '% Div. Pend.',
    'Anunc. Div.',    // API: "Anunc. Div."
];

// Mapeamento de nomes de exibição (nome normalizado da API -> nome exibido)
const DISPLAY_NAMES = {
    'Anunc. Div.': 'Anunc.',
};

// Colunas que precisam ser multiplicadas por 100 (são %)
const PERCENTAGE_COLUMNS = ['Margem', '% Div. Proj.', '% Div. Pend.'];

// Normaliza o nome da coluna (remove quebras de linha e espaços extras)
const normalize = (name) => name?.replace(/\s+/g, ' ').trim() || '';

// Retorna o nome de exibição da coluna
const getDisplayName = (header) => {
    const normalized = normalize(header);
    return DISPLAY_NAMES[normalized] || normalized;
};

// Formata o valor da célula
const formatCellValue = (value, header) => {
    if (value === undefined || value === null || value === '') return '-';
    
    const normalized = normalize(header);
    
    // Multiplicar por 100 se for coluna de porcentagem
    if (PERCENTAGE_COLUMNS.includes(normalized)) {
        const num = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
        if (!isNaN(num)) {
            return (num * 100).toFixed(2);
        }
    }
    
    return String(value);
};

// Filtra e ordena os headers conforme VISIBLE_COLUMNS
function getVisibleHeaders(headers) {
    return VISIBLE_COLUMNS.filter((col) =>
        headers.some((h) => normalize(h) === col)
    ).map((col) => headers.find((h) => normalize(h) === col));
}

function ActionsTable({ headers = [], rows = [] }) {
    const hasData = Array.isArray(rows) && rows.length > 0;
    const visibleHeaders = getVisibleHeaders(headers);

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
                            {visibleHeaders.map((h) => (
                                <th key={h || 'col'}>{getDisplayName(h)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={idx}>
                                {visibleHeaders.map((h, colIdx) => (
                                    <td key={`${idx}-${colIdx}`}>
                                        {formatCellValue(row[h], h)}
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

