import * as XLSX from 'xlsx';
import { logDebug, logError } from './logging.js';

const INVESTMENT_START_ROW = 26; // Linhas 27 a 32 (1-based) => índices 26-31
const INVESTMENT_END_ROW = 32; // slice exclusivo

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

        const totals = monthLabels.reduce((acc, month, idx) => {
            acc[month] = parsedRows.reduce((sum, row) => sum + (row.months[month] ?? 0), 0);
            return acc;
        }, {});

        // Série financeira: Créditos Realizados (linha 10), Débitos Realizados (linha 26), [C] Consolidado
        const findRowValues = (aliasTarget) => {
            const target = normalizeText(aliasTarget);
            const row = dataRows.find((r) => normalizeText(r[0]) === target);
            return monthLabels.map((_, idx) => normalizeNumber(row ? row[idx + 2] : 0));
        };

        const financialSeries = {
            credits: findRowValues('Créditos Realizado'),
            debits: findRowValues('Débitos Realizado'),
            consolidated: findRowValues('[C] Consolidado'),
        };

        // Dados de investimentos (linhas 27 a 32, 1-based)
        const investmentRows = matrix.slice(INVESTMENT_START_ROW, INVESTMENT_END_ROW);
        const investmentSeries = investmentRows
            .filter((row) => row && row[0])
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
                const valorIdx = header.findIndex((h) => h.includes('valor'));
                const grupoIdx = header.findIndex((h) => h.includes('grupo'));
                const cartaoIdx = header.findIndex((h) => h.includes('cart'));

                const entries = detalheMatrix.slice(1).reduce((acc, row) => {
                    const faturaRaw = row[faturaIdx];
                    const valor = normalizeNumber(row[valorIdx]);
                    const grupo = row[grupoIdx] ?? 'Outros';
                    const cartao = row[cartaoIdx] ?? 'Cartão';

                    if (!faturaRaw || Number.isNaN(valor)) {
                        return acc;
                    }

                    const faturaDate = parseExcelDate(faturaRaw);
                    if (!faturaDate) return acc;

                    const label = `${String(faturaDate.getDate()).padStart(2, '0')}/${String(faturaDate.getMonth() + 1).padStart(2, '0')}/${faturaDate.getFullYear()}`;
                    const monthKey = `${faturaDate.getFullYear()}-${String(faturaDate.getMonth() + 1).padStart(2, '0')}`;

                    acc.push({
                        fatura: label,
                        faturaDate: faturaDate.toISOString(),
                        monthKey,
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

