import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from 'chart.js';
import { formatNumber } from '../utils/formatting.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2'];

export function AllocationChart({ labels = [], series = [], excludeLabels = [] }) {
    const currentMonthData = useMemo(() => {
        const filteredSeries = series.filter(
            (item) => !excludeLabels.some((label) => item.label?.toLowerCase().includes(label.toLowerCase())),
        );

        if (!labels.length || !filteredSeries.length) return null;

        const now = new Date();
        const currentMonthKey = `${String(now.getFullYear()).slice(-2)}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const currentMonthIndex = labels.indexOf(currentMonthKey);

        if (currentMonthIndex === -1) return null;

        const data = filteredSeries
            .map((item) => ({
                label: item.label,
                value: Number(item.values[currentMonthIndex]) || 0,
            }))
            .filter((item) => item.value > 0)
            .sort((a, b) => b.value - a.value);

        const total = data.reduce((sum, item) => sum + item.value, 0);
        if (total <= 0) return null;

        return { month: currentMonthKey, data, total };
    }, [excludeLabels, labels, series]);

    if (!currentMonthData) {
        return (
            <div className="panel">
                <div className="panel-header">
                    <div>
                        <p className="eyebrow">Alocacao</p>
                        <h3>Alocacao atual</h3>
                        <p className="muted small">Nao ha dados de investimentos para o mes corrente.</p>
                    </div>
                </div>
            </div>
        );
    }

    const chartData = {
        labels: ['Carteira'],
        datasets: currentMonthData.data.map((item, index) => ({
            label: item.label,
            data: [(item.value / currentMonthData.total) * 100],
            rawValue: item.value,
            backgroundColor: COLORS[index % COLORS.length],
            borderRadius: index === 0 || index === currentMonthData.data.length - 1 ? 6 : 0,
            borderSkipped: false,
            barThickness: 34,
            stack: 'allocation',
        })),
    };

    const options = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    boxHeight: 12,
                },
            },
            tooltip: {
                callbacks: {
                    label: (ctx) => {
                        const value = ctx.dataset.rawValue ?? 0;
                        const percentage = ctx.parsed.x ?? 0;
                        return `${ctx.dataset.label}: ${formatNumber(value)} (${percentage.toFixed(2)}%)`;
                    },
                },
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                max: 100,
                stacked: true,
                grid: {
                    display: false,
                },
                ticks: {
                    callback: (value) => `${value}%`,
                },
            },
            y: {
                stacked: true,
                grid: {
                    display: false,
                },
                ticks: {
                    display: false,
                },
            },
        },
    };

    return (
        <div className="panel">
            <div className="panel-header">
                <div>
                    <p className="eyebrow">Alocacao</p>
                    <h3>Alocacao atual</h3>
                    <p className="muted small">Distribuicao simples no mes corrente ({currentMonthData.month}).</p>
                </div>
                <span className="pill">Total: {formatNumber(currentMonthData.total)}</span>
            </div>
            <div className="chart-wrapper allocation-strip-wrapper">
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
}
