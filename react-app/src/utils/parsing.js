import * as XLSX from 'xlsx';
import { logDebug, logError } from './logging.js';

const INVESTMENT_ALIASES = [
    'investimento acoes',
    'investimento renda fixa',
    'previdencia privada',
    'investimento cripto',
    'td ipca+7.91%',
    'apartamento',
];

const normalizeText = (value) => {
    if (typeof value !== 'string') return '';
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
};

const parseExcelDate = (value) => {
    if (value instanceof Date) return value;
    if (typeof value === 'number') {
        const parsed = XLSX.SSF.parse_date_code(value);
        if (parsed) {
            return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d || 1));
        }
    }
    if (typeof value === 'string') {
        const v = value.trim();
        const dmY = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
        if (dmY) {
            const day = Number(dmY[1]);
            const month = Number(dmY[2]) - 1;
            let year = Number(dmY[3]);
            if (year < 100) year = 2000 + year; // assumir século atual
            const d = new Date(Date.UTC(year, month, day));
            if (!Number.isNaN(d.getTime())) return d;
        }
        const d = new Date(v);
        if (!Number.isNaN(d.getTime())) {
            return d;
        }
    }
    return null;
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

function parseWorkbook(buffer) {
    console.log('🚀 parseWorkbook INICIADA');

    try {
        const workbook = XLSX.read(buffer, { type: 'array' });
        const consolidadoSheet =
            workbook.Sheets.Consolidado || workbook.Sheets[workbook.SheetNames?.[0] || ''];

        if (!consolidadoSheet) {
            throw new Error('Aba Consolidado não encontrada na planilha.');
        }

        // Matriz bruta para capturar cabeçalho e linhas específicas
        const matrix = XLSX.utils.sheet_to_json(consolidadoSheet, { header: 1, defval: null });
        if (!Array.isArray(matrix) || matrix.length === 0) {
            throw new Error('Planilha vazia ou sem dados legíveis.');
        }

        const headerRow = matrix[0];
        const monthLabels = headerRow.slice(2).filter(Boolean).map(String);

        // Demais dados para tabela
        const dataRows = matrix.slice(1).filter((row) => row.some((cell) => cell !== null));
        const parsedRows = dataRows.map((row) => {
            const months = {};
            monthLabels.forEach((month, idx) => {
                months[month] = normalizeNumber(row[idx + 2]);
            });
            return {
                alias: row[0] ?? '',
                id: row[1] ?? '',
                months,
            };
        });

        const totals = monthLabels.reduce((acc, month) => {
            acc[month] = parsedRows.reduce((sum, row) => sum + (row.months[month] ?? 0), 0);
            return acc;
        }, {});

        // Série financeira: Créditos Realizados (linha 10), Débitos Realizados (linha 26), [C] Consolidado
        const findRowValues = (aliasTargets) => {
            const targets = (Array.isArray(aliasTargets) ? aliasTargets : [aliasTargets]).map(normalizeText);
            const row = targets
                .map((target) => dataRows.find((r) => normalizeText(r[0]) === target))
                .find(Boolean);
            return monthLabels.map((_, idx) => normalizeNumber(row ? row[idx + 2] : 0));
        };

        const financialSeries = {
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
            matrix.find((row) => normalizeText(row?.[0]) === alias),
        ).filter(Boolean);
        const investmentSeries = investmentRows
            .map((row) => ({
                label: row[0],
                values: monthLabels.map((_, idx) => normalizeNumber(row[idx + 2])),
            }));

        logDebug('✅ Planilha processada', {
            linhas: parsedRows.length,
            colunasMes: monthLabels.length,
            investimentos: investmentSeries.length,
        });

        // ============================
        // Ações-Carteira (nome pode vir com encoding diferente)
        // ============================
        const carteiraSheetName =
            workbook.SheetNames.find((name) => normalizeText(name).includes('carteira')) || null;
        const carteiraSheet = carteiraSheetName ? workbook.Sheets[carteiraSheetName] : null;

        let acoesCarteira = { headers: [], rows: [] };
        if (carteiraSheet) {
            const carteiraMatrix = XLSX.utils.sheet_to_json(carteiraSheet, {
                header: 1,
                defval: '',
            });
            if (Array.isArray(carteiraMatrix) && carteiraMatrix.length > 1) {
                const headers = carteiraMatrix[0].map((h) => (h ? String(h).trim() : ''));
                const dataRows = carteiraMatrix.slice(1).filter((row) =>
                    row.some((cell) => cell !== ''),
                );
                const rows = dataRows.map((row) => {
                    const obj = {};
                    headers.forEach((h, idx) => {
                        obj[h || `col_${idx}`] = row[idx];
                    });
                    return obj;
                });
                acoesCarteira = { headers, rows };
            }
        }

        // ============================
        // Proventos (gráfico com filtro)
        // ============================
        const proventosSheet = workbook.Sheets.Proventos;
        let proventos = { years: [], months: [], valuesByYear: {} };
        if (proventosSheet) {
            const provMatrix = XLSX.utils.sheet_to_json(proventosSheet, {
                header: 1,
                defval: 0,
            });
            if (Array.isArray(provMatrix) && provMatrix.length > 1) {
                const header = provMatrix[0];
                const monthLabels = header
                    .slice(1, 13)
                    .map((val) => {
                        const d = XLSX.SSF.parse_date_code(val, { date1904: false });
                        if (d) {
                            const date = new Date(Date.UTC(d.y, d.m - 1, d.d));
                            return date.toLocaleDateString('pt-BR', { month: 'short' });
                        }
                        if (typeof val === 'string') return val;
                        return String(val ?? '');
                    })
                    .map((m) => m.replace('.', '').slice(0, 3));

                const years = [];
                const valuesByYear = {};
                provMatrix.slice(1).forEach((row) => {
                    const year = row[0];
                    if (!year) return;
                    years.push(year);
                    valuesByYear[year] = monthLabels.map((_, idx) => normalizeNumber(row[idx + 1]));
                });

                proventos = { years, months: monthLabels, valuesByYear };
            }
        }

        // ============================
        // Cartão-Detalhe (despesas por fatura)
        // ============================
        const detalheSheetName =
            workbook.SheetNames.find((name) => normalizeText(name).includes('detalhe')) || null;
        const detalheSheet = detalheSheetName ? workbook.Sheets[detalheSheetName] : null;
        let cartaoDetalhe = { entries: [] };
        if (detalheSheet) {
            const detalheMatrix = XLSX.utils.sheet_to_json(detalheSheet, { header: 1, defval: null });
            if (Array.isArray(detalheMatrix) && detalheMatrix.length > 1) {
                const header = detalheMatrix[0].map((h) => normalizeText(h));
                const faturaIdx = header.findIndex((h) => h.includes('fatura'));
                const dataIdx = header.findIndex((h) => h === 'data');
                const estabIdx = header.findIndex((h) => h.startsWith('estabelecimento') && !h.includes('fmt'));
                const valorIdx = header.findIndex((h) => h.includes('valor'));
                const grupoIdx = header.findIndex((h) => h.includes('grupo'));
                const cartaoIdx = header.findIndex((h) => h.includes('cart'));

                const entries = detalheMatrix.slice(1).reduce((acc, row) => {
                    const faturaRaw = row[faturaIdx];
                    const dataRaw = dataIdx >= 0 ? row[dataIdx] : null;
                    const estabelecimento = estabIdx >= 0 ? row[estabIdx] : '';
                    const valor = normalizeNumber(row[valorIdx]);
                    const grupo = row[grupoIdx] ?? 'Outros';
                    const cartao = row[cartaoIdx] ?? 'Cartão';

                    if (!faturaRaw || Number.isNaN(valor)) {
                        return acc;
                    }

                    const faturaDate = parseExcelDate(faturaRaw);
                    const dataCompra = parseExcelDate(dataRaw) || faturaDate;
                    if (!faturaDate) return acc;

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
                        estabelecimento: estabelecimento ? String(estabelecimento) : '',
                        grupo: String(grupo),
                        valor,
                        cartao: String(cartao),
                    });
                    return acc;
                }, []);

                cartaoDetalhe = { entries };
            }
        }

        return {
            rows: parsedRows,
            months: monthLabels,
            totals,
            investments: {
                labels: monthLabels,
                series: investmentSeries,
            },
            financial: {
                labels: monthLabels,
                ...financialSeries,
            },
            stocks: acoesCarteira,
            proventos,
            cartaoDetalhe,
        };
    } catch (error) {
        logError('❌ Falha ao interpretar a planilha', error);
        throw error;
    }
}

export { parseWorkbook };

