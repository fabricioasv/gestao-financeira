import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Legend,
    Tooltip,
    Title,
    LineElement,
    PointElement,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { useMemo, useState } from 'react';
import { formatNumber } from '../utils/formatting.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip, Title, LineElement, PointElement);

function FollowUpChart({ data = [] }) {
    // Extrair anos únicos dos meses
    const years = useMemo(() => {
        if (!data || data.length === 0) return [];
        
        const firstRow = data[0];
        const months = Object.keys(firstRow).filter(key => key !== 'Linha - Mês de reajuste anual');
        
        // Extrair anos únicos (formato "YY-MM")
        const uniqueYears = [...new Set(months.map(month => {
            const parts = month.split('-');
            return parts[0]; // Retorna "YY"
        }))];
        
        return uniqueYears.sort();
    }, [data]);

    // Ano corrente (formato "YY")
    const currentYear = String(new Date().getFullYear()).slice(-2);

    const [selectedYear, setSelectedYear] = useState(() => {
        // Verificar se o ano corrente está disponível nos dados
        if (years.includes(currentYear)) {
            return currentYear;
        }
        // Caso contrário, usar o último ano disponível
        return years.length ? years[years.length - 1] : 'todos';
    });

    const chartData = useMemo(() => {
        if (!data || data.length === 0) {
            return { labels: [], datasets: [] };
        }

        // Encontrar as linhas relevantes
        const totalAcumuladoRow = data.find(row => row['Linha - Mês de reajuste anual'] === 'Total acumulado');
        const baseRow = data.find(row => row['Linha - Mês de reajuste anual'] === 'Base 21/05/23');
        const previstoRealRow = data.find(row => row['Linha - Mês de reajuste anual'] === 'Previsto x Real');

        if (!totalAcumuladoRow || !baseRow) {
            return { labels: [], datasets: [] };
        }

        // Extrair os meses (todas as chaves exceto 'Linha - Mês de reajuste anual')
        let months = Object.keys(totalAcumuladoRow).filter(key => key !== 'Linha - Mês de reajuste anual');

        // Se for "acumulado", agrupar por ano
        if (selectedYear === 'acumulado') {
            // Extrair anos únicos
            const uniqueYears = [...new Set(months.map(month => month.split('-')[0]))].sort();
            
            // Para cada ano, pegar o último mês (dezembro ou último disponível)
            const yearlyData = uniqueYears.map(year => {
                const yearMonths = months.filter(m => m.startsWith(year + '-')).sort();
                return yearMonths[yearMonths.length - 1]; // Último mês do ano
            });
            
            months = yearlyData;
        } else if (selectedYear !== 'todos') {
            // Filtrar por ano específico
            months = months.filter(month => month.startsWith(selectedYear + '-'));
        }

        // Extrair os valores
        const totalAcumuladoValues = months.map(month => {
            const value = totalAcumuladoRow[month];
            return typeof value === 'number' ? value : null;
        });

        const baseValues = months.map(month => {
            const value = baseRow[month];
            return typeof value === 'number' ? value : null;
        });

        const previstoRealValues = previstoRealRow ? months.map(month => {
            const value = previstoRealRow[month];
            return typeof value === 'number' ? value : null;
        }) : [];

        const datasets = [
            {
                type: 'bar',
                label: 'Base 21/05/23',
                data: baseValues,
                backgroundColor: 'rgba(203, 213, 225, 0.8)', // Cinza claro
                borderRadius: 6,
                yAxisID: 'y',
            },
            {
                type: 'bar',
                label: 'Total acumulado',
                data: totalAcumuladoValues,
                backgroundColor: 'rgba(37, 99, 235, 0.8)', // Azul
                borderRadius: 6,
                yAxisID: 'y',
            },
        ];

        // Adicionar linha "Previsto x Real" se existir
        if (previstoRealRow) {
            datasets.push({
                type: 'line',
                label: 'Previsto x Real',
                data: previstoRealValues,
                borderColor: '#22c55e', // Verde
                backgroundColor: '#22c55e',
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: '#22c55e',
                tension: 0.3,
                yAxisID: 'y',
            });
        }

        return {
            labels: months,
            datasets,
        };
    }, [data, selectedYear]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                position: 'bottom',
                labels: {
                    padding: 15,
                    font: { size: 12 },
                },
            },
            tooltip: {
                callbacks: {
                    label: (ctx) => {
                        const value = ctx.parsed.y;
                        if (value === null) return null;
                        return `${ctx.dataset.label}: ${formatNumber(value)}`;
                    },
                },
            },
        },
        scales: {
            y: {
                type: 'linear',
                position: 'left',
                beginAtZero: true,
                ticks: { 
                    callback: (value) => formatNumber(value),
                },
                title: { 
                    display: true,
                    text: 'Valor (R$)',
                    color: '#0f172a',
                    font: { weight: '600', size: 13 },
                },
            },
            x: {
                ticks: {
                    autoSkip: true,
                    maxRotation: 45,
                    minRotation: 45,
                    font: { size: 10 },
                },
                title: {
                    display: true,
                    text: 'Mês',
                    color: '#0f172a',
                    font: { weight: '600', size: 13 },
                },
            },
        },
    };

    if (!data || data.length === 0) {
        return (
            <div className="panel chart-panel">
                <div className="panel-header">
                    <div>
                        <p className="eyebrow">Follow Up</p>
                        <h3>Acompanhamento Financeiro</h3>
                        <p className="muted small">Nenhum dado encontrado. Envie a planilha.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="panel chart-panel">
            <div className="panel-header">
                <div>
                    <p className="eyebrow">Follow Up</p>
                    <h3>Acompanhamento Financeiro</h3>
                    <p className="muted small">Comparação entre Total Acumulado, Base e Previsto x Real.</p>
                </div>
                <select
                    className="select"
                    value={selectedYear ?? ''}
                    onChange={(e) => setSelectedYear(e.target.value)}
                >
                    <option value="acumulado">Acumulado</option>
                    <option value="todos">Todos os anos</option>
                    {years.map((year) => (
                        <option key={year} value={year}>
                            20{year}
                        </option>
                    ))}
                </select>
            </div>
            <div className="chart-wrapper">
                <Chart type="bar" data={chartData} options={options} />
            </div>
        </div>
    );
}

export { FollowUpChart };

