import {
    BarElement,
    BarController,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LineController,
    LineElement,
    LinearScale,
    PointElement,
    Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatNumber } from '../utils/formatting.js';

ChartJS.register(
    BarElement,
    BarController,
    CategoryScale,
    LineController,
    LineElement,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
);

const FORECAST_COLORS = {
    investment: 'rgba(37, 99, 235, 0.5)',
    redemption: 'rgba(249, 115, 22, 0.5)',
};

const ACTUAL_COLORS = {
    investment: '#2563eb',
    redemption: '#f97316',
};

function toNegative(values) {
    return values.map((value) => -Math.abs(value ?? 0));
}

function remainingForecast(planned, realized) {
    return planned.map((value, index) =>
        Math.max((value ?? 0) - (realized[index] ?? 0), 0),
    );
}

function netInvestmentByMonth(
    labels,
    investmentPlanned,
    investmentRealized,
    redemptionPlanned,
    redemptionRealized,
) {
    const now = new Date();
    const currentMonth = `${String(now.getFullYear()).slice(-2)}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    return labels.map((label, index) => {
        const usePlanned = String(label) > currentMonth;
        const investments = usePlanned ? investmentPlanned[index] : investmentRealized[index];
        const redemptions = usePlanned ? redemptionPlanned[index] : redemptionRealized[index];
        return (investments ?? 0) - (redemptions ?? 0);
    });
}

function InvestmentPlanChart({
    labels = [],
    investmentPlanned = [],
    investmentRealized = [],
    redemptionPlanned = [],
    redemptionRealized = [],
}) {
    const lineOnTopPlugin = {
        id: 'lineOnTopInvestmentPlan',
        afterDatasetsDraw(chart) {
            chart.data.datasets.forEach((dataset, datasetIndex) => {
                if (dataset.type === 'line') {
                    chart.getDatasetMeta(datasetIndex).controller.draw();
                }
            });
        },
    };

    const hasData = [investmentPlanned, investmentRealized, redemptionPlanned, redemptionRealized].some((values) =>
        values.some((value) => Number(value) !== 0),
    );

    if (!labels.length || !hasData) {
        return (
            <div className="panel chart-panel">
                <div className="panel-header">
                    <div>
                        <p className="eyebrow">Investimentos</p>
                        <h3>Previsto x realizado</h3>
                        <p className="muted small">Não há investimentos ou resgates para exibir.</p>
                    </div>
                </div>
            </div>
        );
    }

    const data = {
        labels,
        datasets: [
            {
                label: 'Investimento Realizado',
                data: investmentRealized,
                backgroundColor: ACTUAL_COLORS.investment,
                borderRadius: 5,
                barThickness: 'flex',
                stack: 'investment-plan',
                order: 2,
            },
            {
                label: 'Investimento Previsto (restante)',
                data: remainingForecast(investmentPlanned, investmentRealized),
                backgroundColor: FORECAST_COLORS.investment,
                borderColor: '#2563eb',
                borderWidth: 1,
                borderRadius: 5,
                barThickness: 'flex',
                stack: 'investment-plan',
                order: 1,
            },
            {
                label: 'Resgate Realizado',
                data: toNegative(redemptionRealized),
                backgroundColor: ACTUAL_COLORS.redemption,
                borderRadius: 5,
                barThickness: 'flex',
                stack: 'investment-plan',
                order: 2,
            },
            {
                label: 'Resgate Previsto (restante)',
                data: toNegative(remainingForecast(redemptionPlanned, redemptionRealized)),
                backgroundColor: FORECAST_COLORS.redemption,
                borderColor: '#f97316',
                borderWidth: 1,
                borderRadius: 5,
                barThickness: 'flex',
                stack: 'investment-plan',
                order: 1,
            },
            {
                type: 'line',
                label: 'Saldo (Realizado / Previsto)',
                data: netInvestmentByMonth(
                    labels,
                    investmentPlanned,
                    investmentRealized,
                    redemptionPlanned,
                    redemptionRealized,
                ),
                borderColor: '#111827',
                backgroundColor: '#111827',
                borderWidth: 3,
                tension: 0.25,
                pointRadius: 3,
                pointHoverRadius: 5,
                pointBackgroundColor: '#111827',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 1,
                order: 11,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' },
            tooltip: {
                callbacks: {
                    label: (ctx) => `${ctx.dataset.label}: ${formatNumber(ctx.parsed.y ?? 0)}`,
                },
            },
        },
        scales: {
            x: { stacked: true },
            y: {
                beginAtZero: true,
                stacked: true,
                ticks: { callback: (value) => formatNumber(value) },
            },
        },
    };

    return (
        <div className="panel chart-panel">
            <div className="panel-header">
                <div>
                    <p className="eyebrow">Investimentos</p>
                    <h3>Previsto x realizado</h3>
                    <p className="muted small">
                        A parte sólida é o realizado; a parte clara completa o previsto. Investimentos ficam
                        positivos e resgates negativos.
                    </p>
                </div>
            </div>
            <div className="chart-wrapper">
                <Bar data={data} options={options} plugins={[lineOnTopPlugin]} />
            </div>
        </div>
    );
}

export { InvestmentPlanChart };
