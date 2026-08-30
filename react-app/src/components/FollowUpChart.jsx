import {
    Chart as ChartJS, BarElement, CategoryScale, LinearScale, Legend, Tooltip, Title, LineElement, PointElement,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { useMemo, useState } from 'react';
import { formatNumber } from '../utils/formatting.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip, Title, LineElement, PointElement);

const MONTH_KEY = /^\d{2}-\d{2}$/;

function normalized(value) {
    return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

function findLabelColumn(rows) {
    return Object.keys(rows[0] ?? {}).find((key) => normalized(key).startsWith('linha - mes'));
}

function toNumber(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (typeof value !== 'string') return null;

    const number = Number(value.replace(/R\$\s*/gi, '').replace(/\./g, '').replace(',', '.').trim());
    return Number.isFinite(number) ? number : null;
}

function FollowUpChart({ data = [] }) {
    const model = useMemo(() => {
        const rows = Array.isArray(data) ? data : [];
        const labelColumn = findLabelColumn(rows);
        const months = labelColumn
            ? Object.keys(rows.find((row) => Object.keys(row).some((key) => MONTH_KEY.test(key))) ?? {})
                .filter((key) => MONTH_KEY.test(key)).sort()
            : [];

        const totalIndex = labelColumn
            ? rows.findIndex((row) => normalized(row[labelColumn]) === 'total acumulado')
            : -1;

        return {
            labelColumn,
            months,
            total: totalIndex >= 0 ? rows[totalIndex] : undefined,
            projectedVsActual: labelColumn
                ? rows.find((row) => normalized(row[labelColumn]).startsWith('prev. real base 21/05/23'))
                : undefined,
        };
    }, [data]);

    const years = useMemo(() => [...new Set(model.months.map((month) => month.slice(0, 2)))].sort(), [model.months]);
    const currentYear = String(new Date().getFullYear()).slice(-2);
    const [selectedYear, setSelectedYear] = useState(null);
    const activeYear = selectedYear === 'todos' || selectedYear === 'acumulado' || years.includes(selectedYear)
        ? selectedYear
        : (years.includes(currentYear) ? currentYear : (years.at(-1) ?? 'todos'));

    const chartData = useMemo(() => {
        if (!model.total) return { labels: [], datasets: [] };

        let months = model.months;
        if (activeYear === 'acumulado') {
            months = years.map((year) => months.filter((month) => month.startsWith(`${year}-`)).at(-1));
        } else if (activeYear !== 'todos') {
            months = months.filter((month) => month.startsWith(`${activeYear}-`));
        }
        months = months.filter(Boolean);

        const totalValues = months.map((month) => toNumber(model.total[month]));
        const monthlyVariation = totalValues.map((value, index) => {
            const previousValue = totalValues[index - 1];
            return index === 0 || value === null || previousValue === null || previousValue === 0
                ? null
                : ((value - previousValue) / previousValue) * 100;
        });

        const datasets = [
            {
                type: 'bar', label: 'Total acumulado', data: totalValues,
                backgroundColor: 'rgba(37, 99, 235, 0.88)', borderRadius: 6, yAxisID: 'y', order: 2,
            },
            ...(model.projectedVsActual ? [{
                type: 'bar', label: model.projectedVsActual[model.labelColumn],
                data: months.map((month) => toNumber(model.projectedVsActual[month])),
                backgroundColor: 'rgba(100, 116, 139, 0.75)', borderRadius: 6, yAxisID: 'y', order: 2,
            }] : []),
            {
                type: 'line', label: 'Variação mensal (%)', data: monthlyVariation,
                borderColor: '#000000', backgroundColor: '#000000', borderWidth: 3, pointRadius: 4,
                pointBackgroundColor: '#000000', tension: 0.25, yAxisID: 'yVariation', order: 1,
            },
        ];

        return { labels: months, datasets };
    }, [model, activeYear, years]);

    const options = {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { padding: 15, font: { size: 12 } } },
            tooltip: {
                callbacks: {
                    label: (ctx) => ctx.parsed.y === null
                        ? null
                        : `${ctx.dataset.label}: ${formatNumber(ctx.parsed.y)}${ctx.dataset.yAxisID === 'yVariation' ? '%' : ''}`,
                },
            },
        },
        scales: {
            y: {
                type: 'linear', position: 'left', beginAtZero: true, ticks: { callback: (value) => formatNumber(value) },
                title: { display: true, text: 'Valor (R$)', color: '#0f172a', font: { weight: '600', size: 13 } },
            },
            yVariation: {
                type: 'linear', position: 'right', grid: { drawOnChartArea: false },
                ticks: { callback: (value) => `${formatNumber(value)}%` },
                title: { display: true, text: 'Variação mensal (%)', color: '#000000', font: { weight: '600', size: 13 } },
            },
            x: {
                ticks: { autoSkip: true, maxRotation: 45, minRotation: 45, font: { size: 10 } },
                title: { display: true, text: 'Mês', color: '#0f172a', font: { weight: '600', size: 13 } },
            },
        },
    };

    if (!model.total) {
        return (
            <div className="panel chart-panel"><div className="panel-header"><div>
                <p className="eyebrow">Follow Up</p>
                <h3>Acompanhamento Financeiro</h3>
                <p className="muted small">Não foi encontrada a linha “Total acumulado” na planilha.</p>
            </div></div></div>
        );
    }

    return (
        <div className="panel chart-panel">
            <div className="panel-header">
                <div>
                    <p className="eyebrow">Follow Up</p>
                    <h3>Acompanhamento Financeiro</h3>
                    <p className="muted small">Total acumulado, previsto x realizado e variação percentual mensal.</p>
                </div>
                <select className="select" value={activeYear} onChange={(event) => setSelectedYear(event.target.value)}>
                    <option value="acumulado">Acumulado</option>
                    <option value="todos">Todos os anos</option>
                    {years.map((year) => <option key={year} value={year}>20{year}</option>)}
                </select>
            </div>
            <div className="chart-wrapper"><Chart type="bar" data={chartData} options={options} /></div>
        </div>
    );
}

export { FollowUpChart };
