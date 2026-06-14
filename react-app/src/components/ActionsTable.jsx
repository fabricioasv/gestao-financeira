// Colunas visíveis na ordem desejada (nomes exatamente como vêm da API, normalizados)
const VISIBLE_COLUMNS = [
    'Ticker',
    'Amount',
    'Average Price',
    'Nota 0-7',       // API: "Nota\n0-7"
    'Margem',
    '% Div. Proj.',   // API: "% Div. Proj."
    'Div. Proj.',
    'Luc. x Cotação',
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
const DECIMAL_COLUMNS = ['Average Price', 'Div. Proj.', 'Luc. x Cotação', 'DY Pago', 'DY a Pagar', 'DY em Aberto'];
const ANNOUNCEMENT_COLUMN = 'Anunc. Div.';
const MONTH_ALIASES = [
    ['jan', 'janeiro'],
    ['fev', 'fevereiro'],
    ['mar', 'marco', 'março'],
    ['abr', 'abril'],
    ['mai', 'maio'],
    ['jun', 'junho'],
    ['jul', 'julho'],
    ['ago', 'agosto'],
    ['set', 'setembro'],
    ['out', 'outubro'],
    ['nov', 'novembro'],
    ['dez', 'dezembro'],
];

// Normaliza o nome da coluna (remove quebras de linha e espaços extras)
const normalize = (name) => name?.replace(/\s+/g, ' ').trim() || '';
const normalizeText = (value) =>
    String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

const parseNumber = (value) => {
    if (typeof value === 'number') return value;
    const raw = String(value ?? '').replace('%', '').trim();
    const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? null : parsed;
};

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

    if (DECIMAL_COLUMNS.includes(normalized)) {
        const num = parseNumber(value);
        if (num !== null) {
            return num.toFixed(2);
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

function getAnnouncementStatus(row) {
    const announcementEntry = Object.entries(row).find(([key]) => normalize(key) === ANNOUNCEMENT_COLUMN);
    const announcementText = normalizeText(announcementEntry?.[1]);

    if (!announcementText) return null;

    const currentMonth = new Date().getMonth();
    const nextMonth = (currentMonth + 1) % 12;
    const thirdMonth = (currentMonth + 2) % 12;
    const matchesMonth = (monthIndex) => MONTH_ALIASES[monthIndex].some((month) => announcementText.includes(month));

    if (matchesMonth(currentMonth) || matchesMonth(nextMonth)) return 'near';
    if (matchesMonth(thirdMonth)) return 'soon';
    return null;
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
                        {rows.map((row, idx) => {
                            const announcementStatus = getAnnouncementStatus(row);
                            const rowStyle =
                                announcementStatus === 'near'
                                    ? { backgroundColor: 'rgba(34, 197, 94, 0.14)' }
                                    : announcementStatus === 'soon'
                                      ? { backgroundColor: 'rgba(245, 158, 11, 0.16)' }
                                      : {};

                            return (
                                <tr key={idx} style={rowStyle}>
                                    {visibleHeaders.map((h, colIdx) => (
                                        <td key={`${idx}-${colIdx}`}>
                                            {formatCellValue(row[h], h)}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export { ActionsTable };

