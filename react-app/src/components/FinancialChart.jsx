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

const COLORS = {
    credits: '#2563eb',
    debits: '#f97316',
    line: '#111827',
};

function FinancialChart({ labels = [], credits = [], debits = [], consolidated = [] }) {
    const lineOnTopPlugin = {
        id: 'lineOnTopFinancial',
        afterDatasetsDraw(chart) {
            chart.data.datasets.forEach((dataset, datasetIndex) => {
                if (dataset.type === 'line') {
                    const meta = chart.getDatasetMeta(datasetIndex);
                    meta.controller.draw();
                }
            });
        },
    };

    const signedDebits = debits.map((v) => -Math.abs(v ?? 0));
    const totalsByMonth = labels.map((_, idx) => (credits[idx] ?? 0) + (signedDebits[idx] ?? 0));

    if (!labels.length) {
        return (
            <div className="panel chart-panel">
                <div className="panel-header">
                    <div>
                        <p className="eyebrow">Dashboard</p>
                        <h3>Créditos x Débitos</h3>
                        <p className="muted small">
                            Nenhum dado encontrado. Envie a planilha para continuar.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const data = {
        labels,
        datasets: [
            {
                label: 'Créditos Realizados',
                data: credits,
                backgroundColor: COLORS.credits,
                borderRadius: 6,
                barThickness: 'flex',
                stack: 'fin',
                order: 1,
            },
            {
                label: 'Débitos Realizados',
                data: signedDebits,
                backgroundColor: COLORS.debits,
                borderRadius: 6,
                barThickness: 'flex',
                stack: 'fin',
                order: 1,
            },
            {
                type: 'line',
                label: '[C] Consolidado (linha)',
                data: consolidated,
                borderColor: COLORS.line,
                backgroundColor: 'rgba(17, 24, 39, 0.3)',
                borderWidth: 3,
                tension: 0.25,
                pointRadius: 4,
                pointHoverRadius: 5,
                pointBackgroundColor: COLORS.line,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 1,
                yAxisID: 'y',
                fill: false,
                order: 999,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        datasets: {
            bar: { order: 1 },
            line: { order: 999 },
        },
        plugins: {
            legend: { position: 'bottom' },
            tooltip: {
                callbacks: {
                    label: (ctx) => {
                        const value = ctx.parsed.y ?? 0;
                        return `${ctx.dataset.label}: ${formatNumber(value)}`;
                    },
                    footer: (items) => {
                        if (!items?.length) return '';
                        const monthIndex = items[0].dataIndex;
                        return `Total barras: ${formatNumber(totalsByMonth[monthIndex])}`;
                    },
                },
            },
            title: { display: false },
        },
        scales: {
            x: { stacked: true },
            y: {
                stacked: true,
                beginAtZero: true,
                ticks: { callback: (value) => formatNumber(value) },
            },
        },
    };

    return (
        <div className="panel chart-panel">
            <div className="panel-header">
                <div>
                    <p className="eyebrow">Dashboard</p>
                    <h3>Créditos x Débitos</h3>
                    <p className="muted small">
                        Barras empilhadas: Créditos Realizados (linha 10) e Débitos Realizados (linha 26).
                        Linha: [C] Consolidado.
                    </p>
                </div>
            </div>
            <div className="chart-wrapper">
                <Bar data={data} options={options} plugins={[lineOnTopPlugin]} />
            </div>
        </div>
    );
}

export { FinancialChart };

