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
    console.log('🔄 Transformando dados do Consolidado:', data);

    if (!Array.isArray(data) || data.length === 0) {
        console.warn('⚠️ Dados do Consolidado vazios ou inválidos');
        return {
            rows: [],
            months: [],
            totals: {},
            investments: { labels: [], series: [] },
            financial: { labels: [], credits: [], debits: [], consolidated: [] },
        };
    }

    // Extrair os meses das chaves do primeiro objeto (exceto Alias e Id)
    const firstRow = data[0];
    const monthLabels = Object.keys(firstRow)
        .filter((key) => key !== 'Alias' && key !== 'Id')
        .sort(); // Ordenar para garantir ordem cronológica

    console.log('📅 Meses encontrados:', monthLabels);

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

    // Investimentos (linhas 27 a 32, índices 26-31)
    const INVESTMENT_START_ROW = 26;
    const INVESTMENT_END_ROW = 32;
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

    console.log('✅ Consolidado transformado:', {
        rows: parsedRows.length,
        months: monthLabels.length,
        investments: investmentSeries.length,
    });

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
    console.log('🔄 Transformando dados de Proventos:', data);

    if (!Array.isArray(data) || data.length === 0) {
        return { years: [], months: [], valuesByYear: {} };
    }

    // Extrair as chaves que são datas (excluir "", "Total", "Média", "~ Mensal (Ano)", "Variação")
    const excludeKeys = ['', 'Total', 'Média', '~ Mensal (Ano)', 'Variação'];
    const firstRow = data[0];
    
    // Filtrar apenas as chaves que são datas de meses
    const monthKeys = Object.keys(firstRow)
        .filter((key) => !excludeKeys.includes(key))
        .sort((a, b) => {
            // Ordenar por mês (extrair o mês da string de data)
            const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const getMonthIndex = (dateStr) => {
                for (let i = 0; i < monthOrder.length; i++) {
                    if (dateStr.includes(monthOrder[i])) return i;
                }
                return -1;
            };
            return getMonthIndex(a) - getMonthIndex(b);
        });

    // Converter nomes das chaves para labels curtos de mês
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

    console.log('📅 Meses de proventos:', monthLabels);

    const years = [];
    const valuesByYear = {};

    data.forEach((row) => {
        const year = row[''];
        if (!year) return;
        years.push(year);
        valuesByYear[year] = monthKeys.map((monthKey) => normalizeNumber(row[monthKey]));
    });

    console.log('✅ Proventos transformado:', { years: years.length, months: monthLabels.length });

    return { years, months: monthLabels, valuesByYear };
}

/**
 * Transforma dados da aba Ações-Carteira para o formato do frontend
 * @param {Array<Array<any>>} data - Dados brutos da API (matriz)
 * @returns {Object} Dados transformados
 */
export function transformAcoesCarteira(data) {
    console.log('🔄 Transformando dados de Ações-Carteira:', data);

    if (!Array.isArray(data) || data.length === 0) {
        return { headers: [], rows: [] };
    }

    const headers = data[0].map((h) => (h ? String(h).trim() : ''));
    const dataRows = data.slice(1).filter((row) => row && row.some((cell) => cell !== '' && cell !== null));

    const rows = dataRows.map((row) => {
        const obj = {};
        headers.forEach((h, idx) => {
            obj[h || `col_${idx}`] = row[idx];
        });
        return obj;
    });

    console.log('✅ Ações-Carteira transformado:', { headers: headers.length, rows: rows.length });

    return { headers, rows };
}

/**
 * Transforma dados da aba Cartão-Detalhe para o formato do frontend
 * @param {Array<Array<any>>} data - Dados brutos da API (matriz)
 * @returns {Object} Dados transformados
 */
export function transformCartaoDetalhe(data) {
    console.log('🔄 Transformando dados de Cartão-Detalhe:', data);

    if (!Array.isArray(data) || data.length === 0) {
        return { entries: [] };
    }

    const header = data[0].map((h) => normalizeText(h));
    const faturaIdx = header.findIndex((h) => h.includes('fatura'));
    const dataIdx = header.findIndex((h) => h === 'data');
    const estabIdx = header.findIndex((h) => h.startsWith('estabelecimento') && !h.includes('fmt'));
    const valorIdx = header.findIndex((h) => h.includes('valor'));
    const grupoIdx = header.findIndex((h) => h.includes('grupo'));
    const cartaoIdx = header.findIndex((h) => h.includes('cart'));

    const parseDate = (value) => {
        if (!value) return null;
        if (value instanceof Date) return value;
        if (typeof value === 'string') {
            const d = new Date(value);
            return !isNaN(d.getTime()) ? d : null;
        }
        return null;
    };

    const entries = data.slice(1).reduce((acc, row) => {
        const faturaRaw = row[faturaIdx];
        const dataRaw = dataIdx >= 0 ? row[dataIdx] : null;
        const estabelecimento = estabIdx >= 0 ? row[estabIdx] : '';
        const valor = normalizeNumber(row[valorIdx]);
        const grupo = row[grupoIdx] ?? 'Outros';
        const cartao = row[cartaoIdx] ?? 'Cartão';

        if (!faturaRaw || Number.isNaN(valor)) {
            return acc;
        }

        const faturaDate = parseDate(faturaRaw);
        const dataCompra = parseDate(dataRaw) || faturaDate;

        if (!faturaDate) return acc;

        const label = `${String(faturaDate.getDate()).padStart(2, '0')}/${String(faturaDate.getMonth() + 1).padStart(2, '0')}/${faturaDate.getFullYear()}`;
        const monthKey = `${faturaDate.getFullYear()}-${String(faturaDate.getMonth() + 1).padStart(2, '0')}`;

        acc.push({
            fatura: label,
            faturaDate: faturaDate.toISOString(),
            data: dataCompra ? dataCompra.toISOString() : null,
            monthKey,
            estabelecimento: estabelecimento ? String(estabelecimento) : '',
            grupo: String(grupo),
            valor,
            cartao: String(cartao),
        });
        return acc;
    }, []);

    console.log('✅ Cartão-Detalhe transformado:', { entries: entries.length });

    return { entries };
}

