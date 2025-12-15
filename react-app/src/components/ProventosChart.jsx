import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Legend,
    Tooltip,
    Title,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useMemo, useState } from 'react';
import { formatNumber } from '../utils/formatting.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip, Title);

function ProventosChart({ years = [], months = [], valuesByYear = {} }) {
    const [selectedYear, setSelectedYear] = useState(() =>
        years.length ? String(years[years.length - 1]) : 'agrupado',
    );

    const data = useMemo(() => {
        const isGrouped = selectedYear === 'agrupado';
        if (isGrouped) {
            const annualTotals = years.map((year) =>
                (valuesByYear[year] || []).reduce((sum, val) => sum + (val ?? 0), 0),
            );
            return {
                labels: years.map(String),
                datasets: [
                    {
                        label: 'Proventos Anual (Agrupado)',
                        data: annualTotals,
                        backgroundColor: '#2563eb',
                        borderRadius: 6,
                    },
                ],
            };
        }

        const values = valuesByYear[selectedYear] || [];
        return {
            labels: months,
            datasets: [
                {
                    label: isGrouped ? 'Proventos (Agrupado)' : `Proventos ${selectedYear || ''}`,
                    data: values,
                    backgroundColor: '#2563eb',
                    borderRadius: 6,
                },
            ],
        };
    }, [months, selectedYear, valuesByYear, years]);

    if (!months.length && selectedYear !== 'agrupado') {
        return (
            <div className="panel chart-panel">
                <div className="panel-header">
                    <div>
                        <p className="eyebrow">Investimentos</p>
                        <h3>Proventos</h3>
                        <p className="muted small">Nenhum dado encontrado. Envie a planilha.</p>
                    </div>
                </div>
            </div>
        );
    }

    const isGrouped = selectedYear === 'agrupado';
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
            y: {
                beginAtZero: true,
                ticks: { callback: (value) => formatNumber(value) },
                title: { display: false },
            },
            x: {
                stacked: false,
                ticks: isGrouped
                    ? {
                          autoSkip: false,
                          maxRotation: 0,
                          minRotation: 0,
                      }
                    : {},
                title: {
                    display: true,
                    text: 'Ano',
                    color: '#0f172a',
                    font: { weight: '700' },
                },
            },
        },
    };

    return (
        <div className="panel chart-panel">
            <div className="panel-header">
                <div>
                    <p className="eyebrow">Investimentos</p>
                    <h3>Proventos</h3>
                    <p className="muted small">Gráfico por ano (aba Proventos).</p>
                </div>
                <select
                    className="select"
                    value={selectedYear ?? ''}
                    onChange={(e) => setSelectedYear(e.target.value)}
                >
                    <option value="agrupado">Agrupado</option>
                    {years.map((year) => (
                        <option key={year} value={String(year)}>
                            {year}
                        </option>
                    ))}
                </select>
            </div>
            <div className="chart-wrapper">
                <Bar data={data} options={options} />
            </div>
        </div>
    );
}

export { ProventosChart };

