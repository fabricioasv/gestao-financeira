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

const INVESTMENT_ALIASES = [
    'investimento acoes',
    'investimento renda fixa',
    'previdencia privada',
    'investimento cripto',
    'td ipca+7.91%',
    'apartamento',
];

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
            investments: { labels: [], series: [], cashFlows: null },
            financial: {
                labels: [],
                credits: [],
                redemptionPlanned: [],
                redemptionRealized: [],
                debits: [],
                investmentRealized: [],
                investmentPlanned: [],
                consolidated: [],
            },
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
    const findRowValues = (aliasTargets) => {
        const targets = (Array.isArray(aliasTargets) ? aliasTargets : [aliasTargets]).map(normalizeText);
        const row = targets
            .map((target) => data.find((r) => normalizeText(r.Alias || '') === target))
            .find(Boolean);
        return monthLabels.map((month) => normalizeNumber(row ? row[month] : 0));
    };

    const financial = {
        labels: monthLabels,
        credits: findRowValues('Créditos Realizado'),
        redemptionPlanned: findRowValues('Resgate Previsto'),
        redemptionRealized: findRowValues('Resgate Realizado'),
        debits: findRowValues('Débitos Realizado'),
        investmentRealized: findRowValues('Investimento Realizado'),
        investmentPlanned: findRowValues('Investimento Previsto'),
        consolidated: findRowValues('[C] Consolidado'),
    };

    // Seleção pelo nome mantém as seis categorias corretas após inserções de linhas na planilha.
    const investmentRows = INVESTMENT_ALIASES.map((alias) =>
        data.find((row) => normalizeText(row.Alias || '') === alias),
    ).filter(Boolean);
    const investmentSeries = investmentRows
        .map((row) => ({
            label: row.Alias,
            values: monthLabels.map((month) => normalizeNumber(row[month])),
        }));

    const flowRows = data
        .filter((row) => {
            const alias = normalizeText(row.Alias || '');
            return (
                alias.includes('aporte') ||
                alias.includes('retirada') ||
                alias.includes('fluxo') ||
                alias.includes('movimentacao')
            );
        })
        .map((row) => {
            const alias = normalizeText(row.Alias || '');
            const sign = alias.includes('retirada') && !alias.includes('aporte') ? -1 : 1;
            return monthLabels.map((month) => normalizeNumber(row[month]) * sign);
        });

    const cashFlows = flowRows.length
        ? monthLabels.map((_, monthIndex) =>
              flowRows.reduce((sum, values) => sum + (values[monthIndex] ?? 0), 0),
          )
        : null;

    const investments = {
        labels: monthLabels,
        series: investmentSeries,
        cashFlows,
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
        const consumoDate = dataCompra || faturaDate;
        const consumoDayKey = `${consumoDate.getFullYear()}-${String(consumoDate.getMonth() + 1).padStart(2, '0')}-${String(consumoDate.getDate()).padStart(2, '0')}`;
        const consumoDayLabel = `${String(consumoDate.getDate()).padStart(2, '0')}/${String(consumoDate.getMonth() + 1).padStart(2, '0')}/${consumoDate.getFullYear()}`;
        const consumoMonthKey = consumoDayKey.slice(0, 7);

        acc.push({
            fatura: label,
            faturaDate: faturaDate.toISOString(),
            data: dataCompra ? dataCompra.toISOString() : null,
            monthKey,
            consumoDayKey,
            consumoDayLabel,
            consumoMonthKey,
            estabelecimento: row.Estabelecimento ? String(row.Estabelecimento) : '',
            grupo: row.Grupo ? String(row.Grupo) : 'Outros',
            valor,
            cartao: row['Cartão'] ? String(row['Cartão']) : 'Cartão',
        });
        return acc;
    }, []);

    return { entries };
}

