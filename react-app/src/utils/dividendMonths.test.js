import test from 'node:test';
import assert from 'node:assert/strict';
import { getStockField, parseDividendMonths } from './dividendMonths.js';

test('interpreta as variações de anúncio da carteira', () => {
    const all = Array.from({ length: 12 }, (_, index) => index);
    const cases = [
        ['jan-dez', all],
        ['mar jun set e dez', [2, 5, 8, 11]],
        ['fevereiro e agosto', [1, 7]],
        ['abr jul out e dez', [3, 6, 9, 11]],
        ['março, agosto e novembro', [2, 7, 10]],
        ['jan, abr, ago e nov', [0, 3, 7, 10]],
        ['jun set dez', [5, 8, 11]],
        ['abril e nov', [3, 10]],
        ['mar abr mai ago nov', [2, 3, 4, 7, 10]],
        ['mar abr jun set dez', [2, 3, 5, 8, 11]],
        ['jan a dezembro', all],
        ['JAN - DEZ', all],
        ['MARÇO,AGOSTO E NOVEMBRO', [2, 7, 10]],
        ['nov a fev', [0, 1, 10, 11]],
        ['jan, jan e janeiro', [0]],
        ['a confirmar', []],
        ['', []],
        [null, []],
    ];
    for (const [input, expected] of cases) {
        assert.deepEqual(parseDividendMonths(input), expected, String(input));
    }
});

test('localiza a coluna com espaços e caixa diferentes', () => {
    assert.equal(getStockField({ ' ANUNC.\n DIV. ': 'jan-dez' }, 'Anunc. Div.'), 'jan-dez');
});
