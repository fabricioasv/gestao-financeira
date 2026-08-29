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
    redemptionRealized: '#14b8a6',
    debits: '#f97316',
    investmentRealized: '#a855f7',
    line: '#111827',
};

function FinancialChart({
    labels = [],
    credits = [],
    redemptionRealized = [],
    debits = [],
    investmentRealized = [],
    consolidated = [],
}) {
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

    const regularCredits = credits.map(
        (credit, idx) => (credit ?? 0) - (redemptionRealized[idx] ?? 0),
    );
    const regularDebits = debits.map(
        (debit, idx) => -Math.abs((debit ?? 0) - (investmentRealized[idx] ?? 0)),
    );
    const signedInvestmentRealized = investmentRealized.map((value) => -Math.abs(value ?? 0));
    const totalsByMonth = labels.map(
        (_, idx) =>
            regularCredits[idx] +
            (redemptionRealized[idx] ?? 0) +
            regularDebits[idx] +
            (signedInvestmentRealized[idx] ?? 0),
    );

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
                data: regularCredits,
                backgroundColor: COLORS.credits,
                borderRadius: 6,
                barThickness: 'flex',
                stack: 'fin',
                order: 1,
            },
            {
                label: 'Resgate Realizado',
                data: redemptionRealized,
                backgroundColor: COLORS.redemptionRealized,
                borderRadius: 6,
                barThickness: 'flex',
                stack: 'fin',
                order: 1,
            },
            {
                label: 'Débitos Realizados',
                data: regularDebits,
                backgroundColor: COLORS.debits,
                borderRadius: 6,
                barThickness: 'flex',
                stack: 'fin',
                order: 1,
            },
            {
                label: 'Investimento Realizado',
                data: signedInvestmentRealized,
                backgroundColor: COLORS.investmentRealized,
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
                        Barras empilhadas: Créditos Realizados, Resgate Realizado, Débitos Realizados e
                        Investimento Realizado.
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

