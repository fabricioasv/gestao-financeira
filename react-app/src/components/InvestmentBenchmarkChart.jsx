import { useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { fetchCdiMensal } from '../services/api.js';
import { formatNumber, formatSignedNumber } from '../utils/formatting.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function parseCdiValue(value) {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;
    const parsed = Number(value.replace(',', '.'));
    return Number.isNaN(parsed) ? 0 : parsed;
}

function parseBcbMonth(dateText) {
    const [day, month, year] = String(dateText || '').split('/');
    if (!day || !month || !year) return null;
    return `${year}-${month.padStart(2, '0')}`;
}

function parseInvestmentMonth(label) {
    const [year, month] = String(label || '').split('-');
    if (!year || !month) return null;
    return `20${year.padStart(2, '0')}-${month.padStart(2, '0')}`;
}

function formatPercent(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
    return `${formatNumber(value)}%`;
}

function formatSignedPercent(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
    return `${formatSignedNumber(value)}%`;
}

export function InvestmentBenchmarkChart({ labels = [], series = [], cashFlows = null }) {
    const [cdiRows, setCdiRows] = useState([]);
    const [error, setError] = useState(null);
    const [loadingCdi, setLoadingCdi] = useState(true);
    const hasExplicitCashFlow = Array.isArray(cashFlows);

    useEffect(() => {
        let cancelled = false;

        fetchCdiMensal()
            .then((rows) => {
                if (!cancelled) {
                    setCdiRows(Array.isArray(rows) ? rows : []);
                    setError(null);
                    setLoadingCdi(false);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err.message);
                    setLoadingCdi(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const benchmark = useMemo(() => {
        const investmentSeries = series.filter(
            (item) => !item.label?.toLowerCase().includes('apartamento'),
        );

        const realValues = labels.map((_, monthIndex) =>
            investmentSeries.reduce((sum, item) => sum + (Number(item.values[monthIndex]) || 0), 0),
        );

        const cdiByMonth = cdiRows.reduce((acc, row) => {
            const month = parseBcbMonth(row.data);
            if (month) acc[month] = parseCdiValue(row.valor);
            return acc;
        }, {});

        const monthlyCdiRates = labels.map((label) => cdiByMonth[parseInvestmentMonth(label)] ?? null);
        const flows = hasExplicitCashFlow ? cashFlows.map((value) => Number(value) || 0) : labels.map(() => 0);
        const monthlyPortfolioReturns = labels.map(() => null);
        const cumulativePortfolioReturns = labels.map(() => null);
        const cumulativeCdiReturns = labels.map(() => null);
        const missingCdiMonths = [];
        const startIndex = realValues.findIndex((value) => value > 0);
        let portfolioAccumulator = 0;
        let cdiAccumulator = 0;

        if (startIndex >= 0) {
            cumulativePortfolioReturns[startIndex] = 0;
            cumulativeCdiReturns[startIndex] = 0;
        }

        labels.forEach((label, monthIndex) => {
            if (startIndex < 0 || monthIndex <= startIndex) {
                return;
            }

            const previousPatrimony = realValues[monthIndex - 1] ?? 0;
            const currentPatrimony = realValues[monthIndex] ?? 0;
            const flow = flows[monthIndex] ?? 0;
            const portfolioReturn =
                previousPatrimony > 0 && currentPatrimony > 0
                    ? (currentPatrimony - previousPatrimony - flow) / previousPatrimony
                    : null;

            monthlyPortfolioReturns[monthIndex] = portfolioReturn;
            if (portfolioReturn !== null) {
                portfolioAccumulator = ((1 + portfolioAccumulator / 100) * (1 + portfolioReturn) - 1) * 100;
                cumulativePortfolioReturns[monthIndex] = portfolioAccumulator;
            }

            const cdi = monthlyCdiRates[monthIndex];
            if (cdi === null) {
                cumulativeCdiReturns[monthIndex] = null;
                missingCdiMonths.push(label);
                return;
            }

            cdiAccumulator = ((1 + cdiAccumulator / 100) * (1 + cdi / 100) - 1) * 100;
            cumulativeCdiReturns[monthIndex] = cdiAccumulator;
        });

        let finalIndex = -1;
        for (let index = labels.length - 1; index >= 0; index -= 1) {
            if (cumulativePortfolioReturns[index] !== null && cumulativeCdiReturns[index] !== null) {
                finalIndex = index;
                break;
            }
        }
        const finalReal = finalIndex >= 0 ? realValues[finalIndex] : 0;
        const initialReal = startIndex >= 0 ? realValues[startIndex] : 0;
        const finalPortfolioReturn = finalIndex >= 0 ? cumulativePortfolioReturns[finalIndex] : null;
        const finalCdiReturn = finalIndex >= 0 ? cumulativeCdiReturns[finalIndex] : null;
        const alpha = finalPortfolioReturn !== null && finalCdiReturn !== null ? finalPortfolioReturn - finalCdiReturn : null;
        const realGain = finalReal - initialReal - flows.slice(startIndex + 1, finalIndex + 1).reduce((sum, value) => sum + value, 0);

        return {
            labels,
            chartLabels: startIndex >= 0 ? labels.slice(startIndex) : labels,
            realValues,
            monthlyPortfolioReturns,
            monthlyCdiRates,
            cumulativePortfolioReturns,
            chartPortfolioReturns: startIndex >= 0 ? cumulativePortfolioReturns.slice(startIndex) : [],
            cumulativeCdiReturns,
            chartCdiReturns: startIndex >= 0 ? cumulativeCdiReturns.slice(startIndex) : [],
            initialReal,
            startIndex,
            finalReal,
            finalPortfolioReturn,
            finalCdiReturn,
            alpha,
            realGain,
            missingCdiMonths,
        };
    }, [cashFlows, cdiRows, hasExplicitCashFlow, labels, series]);

    if (!labels.length || !series.length) {
        return (
            <div className="panel">
                <div className="panel-header">
                    <div>
                        <p className="eyebrow">Benchmark</p>
                        <h3>Rentabilidade comparada com indices</h3>
                        <p className="muted small">Nenhum dado de patrimonio encontrado.</p>
                    </div>
                </div>
            </div>
        );
    }

    const chartData = {
        labels: benchmark.chartLabels,
        datasets: [
            {
                label: 'Rentabilidade',
                data: benchmark.chartPortfolioReturns,
                borderColor: '#7c9bea',
                backgroundColor: 'rgba(124, 155, 234, 0.16)',
                borderWidth: 2,
                fill: 'origin',
                pointRadius: 0,
                pointHoverRadius: 4,
                tension: 0.2,
                spanGaps: false,
            },
            {
                label: 'CDI',
                data: benchmark.chartCdiReturns,
                borderColor: '#f5b544',
                backgroundColor: 'rgba(245, 181, 68, 0.16)',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                tension: 0.25,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'bottom',
            },
            tooltip: {
                callbacks: {
                    label: (ctx) => `${ctx.dataset.label}: ${formatPercent(ctx.parsed.y)}`,
                    afterBody: (items) => {
                        const dataIndex = items[0]?.dataIndex;
                        if (dataIndex === undefined) return [];
                        const monthIndex = benchmark.startIndex + dataIndex;
                        return [
                            `Patrimonio: ${formatNumber(benchmark.realValues[monthIndex])}`,
                            `Variacao mensal: ${formatSignedPercent(
                                benchmark.monthlyPortfolioReturns[monthIndex] === null
                                    ? null
                                    : benchmark.monthlyPortfolioReturns[monthIndex] * 100,
                            )}`,
                            `CDI mensal: ${formatPercent(benchmark.monthlyCdiRates[monthIndex])}`,
                        ];
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: '#dbe3f0',
                },
                ticks: {
                    callback: (value) => formatPercent(value),
                },
            },
        },
    };

    return (
        <div className="panel chart-panel">
            <div className="panel-header">
                <div>
                    <p className="eyebrow">Benchmark</p>
                    <h3>Rentabilidade comparada com indices</h3>
                    <p className="muted small">
                        Carteira sem Apartamento comparada a 100% do CDI. A linha azul usa a variacao mensal do
                        patrimonio, ajustada por aportes e retiradas quando houver fluxo explicito.
                    </p>
                </div>
            </div>

            {!hasExplicitCashFlow ? (
                <p className="muted small benchmark-warning">
                    Sem coluna explicita de aporte/retirada. A rentabilidade da carteira usa a variacao bruta do
                    patrimonio; aportes podem aparecer como ganho e retiradas podem aparecer como perda.
                </p>
            ) : null}
            {error ? <p className="error-text">Nao foi possivel carregar o CDI: {error}</p> : null}
            {loadingCdi ? <p className="muted small benchmark-warning">Carregando serie mensal do CDI...</p> : null}
            {!loadingCdi && benchmark.missingCdiMonths.length ? (
                <p className="muted small benchmark-warning">
                    CDI indisponivel para: {benchmark.missingCdiMonths.join(', ')}.
                </p>
            ) : null}

            <div className="benchmark-summary">
                <div className="summary-card">
                    <p className="label">Carteira acumulada</p>
                    <p className="value">{formatPercent(benchmark.finalPortfolioReturn)}</p>
                </div>
                <div className="summary-card">
                    <p className="label">CDI acumulado</p>
                    <p className="value">{formatPercent(benchmark.finalCdiReturn)}</p>
                </div>
                <div className="summary-card">
                    <p className="label">Diferenca em p.p.</p>
                    <p className="value">{formatSignedPercent(benchmark.alpha)}</p>
                </div>
                <div className="summary-card">
                    <p className="label">Ganho real no periodo</p>
                    <p className="value">{formatNumber(benchmark.realGain)}</p>
                </div>
            </div>

            <div className="chart-wrapper">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
}
