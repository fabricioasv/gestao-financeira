export const DIVIDEND_MONTHS = [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

const fullNames = [
    'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

const normalize = (value) => String(value ?? '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

export function getStockField(row, name) {
    const key = Object.keys(row).find((key) =>
        normalize(key).replace(/\s+/g, ' ') === normalize(name));
    return key === undefined ? '' : row[key];
}

// Match whole tokens so unrelated words cannot accidentally become months.
// Ranges include both endpoints and can cross the end of the year.
export function parseDividendMonths(value) {
    const tokens = normalize(value).replace(/[–—]/g, '-').match(/[a-z]+|-/g) || [];
    const months = new Set();
    const monthIndex = (token) => {
        const abbreviated = DIVIDEND_MONTHS.indexOf(token);
        return abbreviated >= 0 ? abbreviated : fullNames.indexOf(token);
    };
    for (let index = 0; index < tokens.length; index += 1) {
        const start = monthIndex(tokens[index]);
        if (start < 0) continue;
        months.add(start);
        if (tokens[index + 1] === '-' || tokens[index + 1] === 'a') {
            const end = monthIndex(tokens[index + 2]);
            if (end >= 0) {
                for (let month = start; month !== end; month = (month + 1) % 12) {
                    months.add(month);
                }
                months.add(end);
            }
        }
    }
    return [...months].sort((a, b) => a - b);
}
