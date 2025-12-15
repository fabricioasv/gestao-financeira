import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Legend,
    Tooltip,
    Title,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useMemo, useState } from 'react';
import { formatNumber } from '../utils/formatting.js';

ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Legend,
    Tooltip,
    Title,
);

const COLORS = [
    '#2563eb',
    '#0ea5e9',
    '#22c55e',
    '#a855f7',
    '#f97316',
    '#f59e0b',
    '#ef4444',
    '#14b8a6',
    '#64748b',
    '#ec4899',
];

function getColor(idx) {
    return COLORS[idx % COLORS.length];
}

function CartaoChart({ entries = [] }) {
    const [monthKey, setMonthKey] = useState('todos');
    const [selectedGroup, setSelectedGroup] = useState('todos');

    const { labels, groups, datasets, totals } = useMemo(() => {
        const filtered =
            monthKey === 'todos'
                ? entries
                : entries.filter((e) => e.monthKey === monthKey);

        const filteredByGroup =
            selectedGroup === 'todos'
                ? filtered
                : filtered.filter((e) => e.grupo === selectedGroup);

        const labelsSet = new Set(filteredByGroup.map((e) => e.fatura));
        const labelsArr = Array.from(labelsSet).sort((a, b) => {
            const [da, ma, ya] = a.split('/').map(Number);
            const [db, mb, yb] = b.split('/').map(Number);
            return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
        });
        const groupsSet = new Set(filtered.map((e) => e.grupo));
        const groupsArr = Array.from(groupsSet).sort();

        const groupData = groupsArr.map((g) =>
            labelsArr.map((label) =>
                filteredByGroup
                    .filter((e) => e.fatura === label && e.grupo === g)
                    .reduce((sum, e) => sum + (e.valor ?? 0), 0),
            ),
        );

        const totals = labelsArr.map((label) =>
            filteredByGroup
                .filter((e) => e.fatura === label)
                .reduce((sum, e) => sum + (e.valor ?? 0), 0),
        );

        const datasets = [
            ...groupData.map((data, idx) => ({
                label: groupsArr[idx],
                data,
                backgroundColor: getColor(idx),
                borderRadius: 6,
                barThickness: 'flex',
                stack: 'fatura',
                order: 1,
            })),
            {
                type: 'line',
                label: 'Total da fatura',
                data: totals,
                borderColor: '#111827',
                backgroundColor: 'rgba(17, 24, 39, 0.35)',
                borderWidth: 3,
                tension: 0.25,
                pointRadius: 4,
                pointHoverRadius: 5,
                pointBackgroundColor: '#111827',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 1,
                yAxisID: 'y',
                fill: false,
                order: 999,
            },
        ];

        return { labels: labelsArr, groups: groupsArr, datasets, totals };
        return { labels: labelsArr, groups: groupsArr, datasets, totals, filteredByGroup };
    }, [entries, monthKey, selectedGroup]);

    const lineOnTopPlugin = {
        id: 'lineOnTopCartao',
        afterDatasetsDraw(chart) {
            chart.data.datasets.forEach((dataset, datasetIndex) => {
                if (dataset.type === 'line') {
                    const meta = chart.getDatasetMeta(datasetIndex);
                    meta.controller.draw();
                }
            });
        },
    };

    const meses = useMemo(() => {
        const set = new Set(
            entries.map((e) => {
                return e.monthKey || '';
            }),
        );
        const arr = Array.from(set).sort();
        return ['todos', ...arr];
    }, [entries]);

    const handleClick = (evt, elements, chart) => {
        if (!elements?.length) return;
        const { datasetIndex } = elements[0];
        const ds = chart.data.datasets[datasetIndex];
        if (ds.type === 'line') return;
        setSelectedGroup((prev) => (prev === ds.label ? 'todos' : ds.label));
    };

    const filteredTable = useMemo(() => {
        // Tabela exibe todos os registros do Excel, filtrando apenas pelo grupo clicado (se houver)
        return selectedGroup === 'todos'
            ? entries
            : entries.filter((e) => e.grupo === selectedGroup);
    }, [entries, selectedGroup]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        datasets: { bar: { order: 1 }, line: { order: 999 } },
        plugins: {
            legend: { position: 'bottom' },
            tooltip: {
                callbacks: {
                    label: (ctx) => `${ctx.dataset.label}: ${formatNumber(ctx.parsed.y ?? 0)}`,
                    footer: (items) => {
                        if (!items?.length) return '';
                        const idx = items[0].dataIndex;
                        return `Total fatura: ${formatNumber(totals[idx])}`;
                    },
                },
            },
        },
        scales: {
            x: {
                stacked: true,
                ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 },
                title: { display: true, text: 'Fatura', font: { weight: '700' } },
            },
            y: {
                stacked: true,
                beginAtZero: true,
                ticks: { callback: (value) => formatNumber(value) },
            },
        },
        onClick: handleClick,
    };

    const hasData = labels.length > 0 && groups.length > 0;

    return (
        <div className="panel chart-panel">
            <div className="panel-header">
                <div>
                    <p className="eyebrow">Cartão</p>
                    <h3>Despesas por fatura (empilhado por Grupo)</h3>
                    <p className="muted small">
                        Dados da aba Cartão-Detalhe; eixo X = data da fatura; barras = grupos; linha = total
                        por fatura.
                    </p>
                </div>
                <div className="filter-row">
                    <select className="select" value={monthKey} onChange={(e) => setMonthKey(e.target.value)}>
                        {meses.map((m) => (
                            <option key={m} value={m}>
                                {m === 'todos'
                                    ? 'Todos os meses'
                                    : `${m.slice(5, 7)}/${m.slice(0, 4)}`}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="chart-wrapper">
                {hasData ? (
                    <Bar data={{ labels, datasets }} options={options} plugins={[lineOnTopPlugin]} />
                ) : (
                    <p className="muted">Nenhum dado encontrado. Envie a planilha.</p>
                )}
            </div>
            <div className="panel">
                <div className="panel-header">
                    <div>
                        <p className="eyebrow">Cartão</p>
                        <h3>Detalhamento da fatura</h3>
                        <p className="muted small">
                            Clique em uma categoria no gráfico para filtrar; use o filtro de mês para refinar.
                        </p>
                    </div>
                    <div className="filter-row">
                        <span className="pill neutral">
                            {selectedGroup === 'todos' ? 'Todos os grupos' : `Grupo: ${selectedGroup}`}
                        </span>
                        {selectedGroup !== 'todos' && (
                            <button className="btn" onClick={() => setSelectedGroup('todos')}>
                                Limpar filtro
                            </button>
                        )}
                    </div>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Fatura</th>
                                <th>Data</th>
                                <th>Estabelecimento</th>
                                <th>Grupo</th>
                                <th>Cartão</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTable.map((row, idx) => {
                                const dataFmt = row.data
                                    ? new Date(row.data).toLocaleDateString('pt-BR')
                                    : '';
                                return (
                                    <tr key={idx}>
                                        <td>{row.fatura}</td>
                                        <td>{dataFmt}</td>
                                        <td>{row.estabelecimento || '-'}</td>
                                        <td>{row.grupo}</td>
                                        <td>{row.cartao}</td>
                                        <td>{formatNumber(row.valor)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export { CartaoChart };

