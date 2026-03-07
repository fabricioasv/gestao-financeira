import { useMemo } from 'react';
import { Chart } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Componente para exibir gráfico de alocação de investimentos (pizza/donut)
 * @param {Object} props
 * @param {Array} props.labels - Meses disponíveis
 * @param {Array} props.series - Séries de investimentos com label e values
 */
export function AllocationChart({ labels, series }) {
    const currentMonthData = useMemo(() => {
        if (!labels || labels.length === 0 || !series || series.length === 0) {
            return null;
        }

        const now = new Date();
        const year = String(now.getFullYear()).slice(-2);
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const currentMonthKey = `${year}-${month}`;
        
        const currentMonthIndex = labels.indexOf(currentMonthKey);
        
        if (currentMonthIndex === -1) {
            return null;
        }

        const data = series
            .map((s) => {
                const rawValue = s.values[currentMonthIndex];
                const numericValue = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue) || 0;
                return {
                    label: s.label,
                    value: numericValue,
                };
            })
            .filter((item) => item.value > 0);

        const total = data.reduce((sum, item) => sum + item.value, 0);

        if (total <= 0.01) {
            return null;
        }

        const dataWithPercentages = data.map((item) => ({
            ...item,
            percentage: (item.value / total) * 100,
        }));

        return {
            month: currentMonthKey,
            data: dataWithPercentages,
            total,
        };
    }, [labels, series]);

    const chartData = useMemo(() => {
        if (!currentMonthData) return null;

        return {
            labels: currentMonthData.data.map((d) => d.label),
            datasets: [
                {
                    data: currentMonthData.data.map((d) => d.value),
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',  // Azul
                        'rgba(16, 185, 129, 0.8)',  // Verde
                        'rgba(245, 158, 11, 0.8)',  // Amarelo
                        'rgba(239, 68, 68, 0.8)',   // Vermelho
                        'rgba(168, 85, 247, 0.8)',  // Roxo
                        'rgba(236, 72, 153, 0.8)',  // Rosa
                    ],
                    borderColor: [
                        'rgba(59, 130, 246, 1)',
                        'rgba(16, 185, 129, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(168, 85, 247, 1)',
                        'rgba(236, 72, 153, 1)',
                    ],
                    borderWidth: 2,
                },
            ],
        };
    }, [currentMonthData]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: '#94a3b8',
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif",
                    },
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: 'circle',
                },
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#f1f5f9',
                bodyColor: '#cbd5e1',
                borderColor: '#334155',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const percentage = ((value / currentMonthData.total) * 100).toFixed(2);
                        const formattedValue = value.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        });
                        return `${label}: R$ ${formattedValue} (${percentage}%)`;
                    },
                },
            },
        },
    };

    if (!currentMonthData) {
        return (
            <div className="panel">
                <div className="panel-header">
                    <div>
                        <p className="eyebrow">Alocação</p>
                        <h3>Distribuição de Investimentos</h3>
                        <p className="muted small">Porcentagem de alocação no mês corrente</p>
                    </div>
                </div>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p className="muted">Não há dados de investimentos para o mês corrente.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="panel">
            <div className="panel-header">
                <div>
                    <p className="eyebrow">Alocação</p>
                    <h3>Distribuição de Investimentos</h3>
                    <p className="muted small">
                        Porcentagem de alocação no mês corrente ({currentMonthData.month})
                    </p>
                </div>
                <span className="pill">
                    Total: R${' '}
                    {currentMonthData.total.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </span>
            </div>
            <div style={{ height: '400px', padding: '1rem' }}>
                <Chart type="doughnut" data={chartData} options={options} />
            </div>
            <div style={{ padding: '1.5rem', borderTop: '1px solid #1e293b' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    {currentMonthData.data.map((item, idx) => (
                        <div
                            key={idx}
                            style={{
                                padding: '1rem',
                                background: `linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)`,
                                borderRadius: '12px',
                                border: '1px solid rgba(51, 65, 85, 0.6)',
                                borderLeft: '4px solid',
                                borderLeftColor: chartData.datasets[0].backgroundColor[idx],
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                cursor: 'default',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)';
                            }}
                        >
                            <p className="eyebrow" style={{ marginBottom: '0.5rem', color: '#94a3b8' }}>
                                {item.label}
                            </p>
                            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f1f5f9', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                                {item.percentage.toFixed(2)}%
                            </p>
                            <p className="muted small" style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
                                R${' '}
                                {item.value.toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
