import * as XLSX from 'xlsx';
import { logDebug, logError } from './logging.js';

const INVESTMENT_START_ROW = 26; // Linhas 27 a 32 (1-based) => índices 26-31
const INVESTMENT_END_ROW = 32; // slice exclusivo

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
        const sheet =
            workbook.Sheets.Consolidado || workbook.Sheets[workbook.SheetNames?.[0] || ''];

        if (!sheet) {
            throw new Error('Aba Consolidado não encontrada na planilha.');
        }

        // Matriz bruta para capturar cabeçalho e linhas específicas
        const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
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

        return {
            rows: parsedRows,
            months: monthLabels,
            totals,
            investments: {
                labels: monthLabels,
                series: investmentSeries,
            },
        };
    } catch (error) {
        logError('❌ Falha ao interpretar a planilha', error);
        throw error;
    }
}

export { parseWorkbook };

