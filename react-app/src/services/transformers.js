/**
 * Transformadores para converter dados da API para o formato do frontend
 */

const normalizeText = (value) => {
    if (typeof value !== 'string') return '';
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
};

const normalizeNumber = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const numeric = Number(value.replace(',', '.'));
        return Number.isNaN(numeric) ? 0 : numeric;
    }
    return 0;
};

/**
 * Transforma dados da aba Consolidado para o formato do frontend
 * A API retorna array de objetos com: { Alias, Id, "25-01": valor, "25-02": valor, ... }
 * @param {Array<Object>} data - Dados da API (array de objetos)
 * @returns {Object} Dados transformados
 */
export function transformConsolidado(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return {
            rows: [],
            months: [],
            totals: {},
            investments: { labels: [], series: [] },
            financial: { labels: [], credits: [], debits: [], consolidated: [] },
        };
    }

    const firstRow = data[0];
    const monthLabels = Object.keys(firstRow)
        .filter((key) => key !== 'Alias' && key !== 'Id')
        .sort();

    // Converter objetos para o formato esperado pelo frontend
    const parsedRows = data.map((row) => {
        const months = {};
        monthLabels.forEach((month) => {
            months[month] = normalizeNumber(row[month]);
        });
        return {
            alias: row.Alias ?? '',
            id: row.Id ?? '',
            months,
        };
    });

    // Totais por mês
    const totals = monthLabels.reduce((acc, month) => {
        acc[month] = parsedRows.reduce((sum, row) => sum + (row.months[month] ?? 0), 0);
        return acc;
    }, {});

    // Séries financeiras
    const findRowValues = (aliasTarget) => {
        const target = normalizeText(aliasTarget);
        const row = data.find((r) => normalizeText(r.Alias || '') === target);
        return monthLabels.map((month) => normalizeNumber(row ? row[month] : 0));
    };

    const financial = {
        labels: monthLabels,
        credits: findRowValues('Créditos Realizado'),
        debits: findRowValues('Débitos Realizado'),
        consolidated: findRowValues('[C] Consolidado'),
    };

    // Investimentos (linhas 27 a 32 do Excel = índices 25-30 na API, pois API não inclui header)
    const INVESTMENT_START_ROW = 25;
    const INVESTMENT_END_ROW = 31;
    const investmentRows = data.slice(INVESTMENT_START_ROW, INVESTMENT_END_ROW);
    const investmentSeries = investmentRows
        .filter((row) => row && row.Alias)
        .map((row) => ({
            label: row.Alias,
            values: monthLabels.map((month) => normalizeNumber(row[month])),
        }));

    const investments = {
        labels: monthLabels,
        series: investmentSeries,
    };

    return {
        rows: parsedRows,
        months: monthLabels,
        totals,
        investments,
        financial,
    };
}

/**
 * Transforma dados da aba Proventos para o formato do frontend
 * A API retorna objetos com: { "": ano, "Wed Jan 01...": valor, ... , "Total": x, "Média": y }
 * @param {Array<Object>} data - Dados da API (array de objetos)
 * @returns {Object} Dados transformados
 */
export function transformProventos(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return { years: [], months: [], valuesByYear: {} };
    }

    const excludeKeys = ['', 'Total', 'Média', '~ Mensal (Ano)', 'Variação'];
    const firstRow = data[0];
    
    const monthKeys = Object.keys(firstRow)
        .filter((key) => !excludeKeys.includes(key))
        .sort((a, b) => {
            const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const getMonthIndex = (dateStr) => {
                for (let i = 0; i < monthOrder.length; i++) {
                    if (dateStr.includes(monthOrder[i])) return i;
                }
                return -1;
            };
            return getMonthIndex(a) - getMonthIndex(b);
        });

    const monthLabels = monthKeys.map((key) => {
        const monthMap = {
            'Jan': 'jan', 'Feb': 'fev', 'Mar': 'mar', 'Apr': 'abr',
            'May': 'mai', 'Jun': 'jun', 'Jul': 'jul', 'Aug': 'ago',
            'Sep': 'set', 'Oct': 'out', 'Nov': 'nov', 'Dec': 'dez'
        };
        for (const [eng, pt] of Object.entries(monthMap)) {
            if (key.includes(eng)) return pt;
        }
        return key.slice(0, 3);
    });

    const years = [];
    const valuesByYear = {};

    data.forEach((row) => {
        const year = row[''];
        if (!year) return;
        years.push(year);
        valuesByYear[year] = monthKeys.map((monthKey) => normalizeNumber(row[monthKey]));
    });

    return { years, months: monthLabels, valuesByYear };
}

/**
 * Transforma dados da aba Ações-Carteira para o formato do frontend
 * A API retorna objetos com: { Ticker, Amount, "Average Price", ... }
 * @param {Array<Object>} data - Dados da API (array de objetos)
 * @returns {Object} Dados transformados
 */
export function transformAcoesCarteira(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return { headers: [], rows: [] };
    }

    const headers = Object.keys(data[0]);

    const rows = data.filter((row) => row.Ticker && row.Ticker !== '');

    return { headers, rows };
}

/**
 * Transforma dados da aba Cartão-Detalhe para o formato do frontend
 * A API retorna objetos com: { Fatura, Mês, Estabelecimento, Valor, Cartão, "Estabelecimento Fmt", Grupo }
 * @param {Array<Object>} data - Dados da API (array de objetos)
 * @returns {Object} Dados transformados
 */
export function transformCartaoDetalhe(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return { entries: [] };
    }

    const parseDate = (value) => {
        if (!value) return null;
        if (value instanceof Date) return value;
        if (typeof value === 'string') {
            const d = new Date(value);
            return !isNaN(d.getTime()) ? d : null;
        }
        return null;
    };

    const entries = data.reduce((acc, row) => {
        // Pular linhas sem fatura
        if (!row.Fatura) return acc;

        const faturaDate = parseDate(row.Fatura);
        const dataCompra = parseDate(row['Mês']) || faturaDate;
        const valor = normalizeNumber(row.Valor);

        if (!faturaDate || isNaN(valor)) return acc;

        const label = `${String(faturaDate.getDate()).padStart(2, '0')}/${String(faturaDate.getMonth() + 1).padStart(2, '0')}/${faturaDate.getFullYear()}`;
        const monthKey = `${faturaDate.getFullYear()}-${String(faturaDate.getMonth() + 1).padStart(2, '0')}`;

        acc.push({
            fatura: label,
            faturaDate: faturaDate.toISOString(),
            data: dataCompra ? dataCompra.toISOString() : null,
            monthKey,
            estabelecimento: row.Estabelecimento ? String(row.Estabelecimento) : '',
            grupo: row.Grupo ? String(row.Grupo) : 'Outros',
            valor,
            cartao: row['Cartão'] ? String(row['Cartão']) : 'Cartão',
        });
        return acc;
    }, []);

    return { entries };
}

