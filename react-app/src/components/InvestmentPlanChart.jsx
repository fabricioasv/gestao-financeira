import {
    BarElement,
    BarController,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatNumber } from '../utils/formatting.js';

ChartJS.register(BarElement, BarController, CategoryScale, LinearScale, Tooltip, Legend);

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

function InvestmentPlanChart({
    labels = [],
    investmentPlanned = [],
    investmentRealized = [],
    redemptionPlanned = [],
    redemptionRealized = [],
}) {
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
                <Bar data={data} options={options} />
            </div>
        </div>
    );
}

export { InvestmentPlanChart };
