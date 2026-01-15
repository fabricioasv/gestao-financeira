import {
    Chart as ChartJS,
    BarElement,
    BarController,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
    Legend,
    Tooltip,
    Title,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatNumber } from '../utils/formatting.js';

ChartJS.register(
    BarElement,
    BarController,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
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
];

function getColor(index) {
    return COLORS[index % COLORS.length];
}

function InvestmentChart({ labels = [], series = [] }) {
    const lineOnTopPlugin = {
        id: 'lineOnTop',
        afterDatasetsDraw(chart) {
            chart.data.datasets.forEach((dataset, datasetIndex) => {
                if (dataset.type === 'line') {
                    const meta = chart.getDatasetMeta(datasetIndex);
                    meta.controller.draw();
                }
            });
        },
    };

    const totalsByMonth = labels.map((_, idx) =>
        series.reduce((sum, item) => sum + (item.values[idx] ?? 0), 0),
    );

    if (!labels.length || !series.length) {
        return (
            <div className="panel">
                <div className="panel-header">
                    <div>
                        <p className="eyebrow">Dashboard</p>
                        <h3>Investimentos</h3>
                        <p className="muted small">Nenhum dado encontrado. Envie a planilha para continuar.</p>
                    </div>
                </div>
            </div>
        );
    }

    const data = {
        labels,
        datasets: [
            ...series.map((item, idx) => ({
                label: item.label,
                data: item.values,
                backgroundColor: getColor(idx),
                borderRadius: 6,
                barThickness: 'flex',
                order: 1,
                stack: 'invest',
            })),
            {
                type: 'line',
                label: 'Total (linha)',
                data: totalsByMonth,
                borderColor: '#111827',
                backgroundColor: 'rgba(17, 24, 39, 0.4)',
                borderWidth: 3,
                tension: 0.25,
                pointRadius: 4,
                pointHoverRadius: 5,
                pointBackgroundColor: '#111827',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 1,
                yAxisID: 'y',
                fill: false,
                order: 99,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        datasets: {
            bar: {
                order: 1,
            },
            line: {
                order: 999,
            },
        },
        plugins: {
            legend: {
                position: 'bottom',
            },
            tooltip: {
                callbacks: {
                    label: (ctx) => {
                        const value = ctx.parsed.y ?? 0;
                        return `${ctx.dataset.label}: ${formatNumber(value)}`;
                    },
                    footer: (items) => {
                        if (!items?.length) return '';
                        const monthIndex = items[0].dataIndex;
                        return `Total: ${formatNumber(totalsByMonth[monthIndex])}`;
                    },
                },
            },
            title: {
                display: false,
            },
        },
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
                beginAtZero: true,
                ticks: {
                    callback: (value) => formatNumber(value),
                },
            },
        },
    };

    return (
        <div className="panel chart-panel">
            <div className="panel-header">
                <div>
                    <p className="eyebrow">Dashboard</p>
                    <h3>Investimentos</h3>
                    <p className="muted small">
                        Barras empilhadas das linhas 27-32 (aba Consolidado): Ações, Renda Fixa, Previdência,
                        Cripto, TD IPCA+7.91% e Apartamento.
                    </p>
                </div>
            </div>
            <div className="chart-wrapper">
                <Bar data={data} options={options} plugins={[lineOnTopPlugin]} />
            </div>
        </div>
    );
}

export { InvestmentChart };

