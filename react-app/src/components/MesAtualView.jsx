import { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export function MesAtualView({ data }) {
    // Separar os dados por TIPO e calcular totais
    const { consolidado, credito, debito, saldoAtual, saldoProjetado, totalCredito, totalDebito, creditoQuitado, debitoQuitado, creditoPendente, debitoPendente, totalDisponivelConsolidado } = useMemo(() => {
        if (!data || data.length === 0) {
            return { 
                consolidado: [], 
                credito: [], 
                debito: [], 
                saldoAtual: 0,
                saldoProjetado: 0,
                totalCredito: 0,
                totalDebito: 0,
                creditoQuitado: 0,
                debitoQuitado: 0,
                creditoPendente: 0,
                debitoPendente: 0,
                totalDisponivelConsolidado: 0
            };
        }

        const consolidado = [];
        const credito = [];
        const debito = [];
        let contaCorrente = 0;
        let totalDisponivelConsolidado = 0;
        let totalCredito = 0;
        let totalDebito = 0;
        let totalCreditoQuitado = 0;
        let totalDebitoQuitado = 0;

        data.forEach((row) => {
            const tipo = row['Tipo']?.trim().toLowerCase();
            const descricao = row['Descrição']?.trim() || '';
            const valor = parseFloat(row['Valor']) || 0;
            const quitadoStr = row['Quitado'];
            const quitado = quitadoStr && quitadoStr !== '-' ? parseFloat(quitadoStr) : 0;
            
            if (tipo === 'consolidado') {
                consolidado.push(row);
                
                // Saldo Atual = Consolidado - Conta Corrente
                if (descricao.toLowerCase().includes('conta corrente')) {
                    contaCorrente = valor;
                }
                
                // Saldo Projetado = Consolidado - Total disponível
                if (descricao.toLowerCase().includes('total disponível')) {
                    totalDisponivelConsolidado = valor;
                }
            } else if (tipo === 'crédito') {
                credito.push(row);
                totalCredito += valor;
                totalCreditoQuitado += quitado;
            } else if (tipo === 'débito') {
                debito.push(row);
                totalDebito += valor;
                totalDebitoQuitado += quitado;
            }
        });

        const creditoPendente = totalCredito - totalCreditoQuitado;
        const debitoPendente = totalDebito - totalDebitoQuitado;

        return { 
            consolidado, 
            credito, 
            debito,
            saldoAtual: contaCorrente,
            saldoProjetado: totalDisponivelConsolidado,
            totalCredito,
            totalDebito,
            creditoQuitado: totalCreditoQuitado,
            debitoQuitado: totalDebitoQuitado,
            creditoPendente,
            debitoPendente,
            totalDisponivelConsolidado
        };
    }, [data]);

    // Função para formatar valores monetários
    const formatCurrency = (value) => {
        if (value === null || value === undefined || value === '') return '-';
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue)) return '-';
        return numValue.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    };

    // Preparar dados para o gráfico de pizza (Crédito vs Débito)
    const pieChartData = {
        labels: ['Crédito Recebido', 'Crédito Pendente', 'Débito Pago', 'Débito Pendente'],
        datasets: [
            {
                data: [
                    creditoQuitado,
                    creditoPendente,
                    debitoQuitado,
                    debitoPendente
                ],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',   // Verde - Crédito Recebido
                    'rgba(34, 197, 94, 0.3)',   // Verde claro - Crédito Pendente
                    'rgba(239, 68, 68, 0.8)',   // Vermelho - Débito Pago
                    'rgba(239, 68, 68, 0.3)',   // Vermelho claro - Débito Pendente
                ],
                borderColor: [
                    'rgba(34, 197, 94, 1)',
                    'rgba(34, 197, 94, 0.5)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(239, 68, 68, 0.5)',
                ],
                borderWidth: 2,
            },
        ],
    };

    // Preparar dados para o gráfico de barras (Comparação)
    const barChartData = {
        labels: ['Crédito', 'Débito'],
        datasets: [
            {
                label: 'Recebido/Pago',
                data: [creditoQuitado, debitoQuitado],
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderWidth: 2,
            },
            {
                label: 'Pendente',
                data: [creditoPendente, debitoPendente],
                backgroundColor: 'rgba(251, 191, 36, 0.8)',
                borderColor: 'rgba(251, 191, 36, 1)',
                borderWidth: 2,
            },
        ],
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return 'R$ ' + value.toLocaleString('pt-BR');
                    }
                }
            }
        }
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = formatCurrency(context.parsed);
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                        return label + ': ' + value + ' (' + percentage + '%)';
                    }
                }
            }
        }
    };

    // Encontrar item "Mês Ant." no crédito
    const mesAnterior = credito.find(row => row['Descrição']?.includes('Mês Ant.'));

    return (
        <div>
            {/* Cards de Resumo */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {/* Card Saldo Atual */}
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    color: 'white',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>💰 Saldo Atual</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{formatCurrency(saldoAtual)}</p>
                    <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.5rem' }}>
                        Conta Corrente
                    </p>
                </div>

                {/* Card Crédito */}
                <div style={{
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    color: 'white',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>📈 Crédito Total</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{formatCurrency(totalCredito)}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.9 }}>
                        <span>✅ Recebido: {formatCurrency(creditoQuitado)}</span>
                        <span>⏳ Pendente: {formatCurrency(creditoPendente)}</span>
                    </div>
                </div>

                {/* Card Débito */}
                <div style={{
                    background: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    color: 'white',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>📉 Débito Total</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{formatCurrency(totalDebito)}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.9 }}>
                        <span>✅ Pago: {formatCurrency(debitoQuitado)}</span>
                        <span>⏳ Pendente: {formatCurrency(debitoPendente)}</span>
                    </div>
                </div>

                {/* Card Saldo Projetado */}
                <div style={{
                    background: saldoProjetado >= 0 
                        ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                        : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    color: 'white',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                        {saldoProjetado >= 0 ? '✨ Saldo Projetado' : '⚠️ Saldo Projetado'}
                    </p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{formatCurrency(saldoProjetado)}</p>
                    <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.5rem' }}>
                        Após todas as movimentações
                    </p>
                </div>
            </div>

            {/* Alerta Mês Anterior */}
            {mesAnterior && (
                <div style={{
                    background: 'rgba(251, 191, 36, 0.1)',
                    border: '2px solid #f59e0b',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <span style={{ fontSize: '2rem' }}>⚠️</span>
                    <div>
                        <p style={{ fontWeight: 'bold', color: '#92400e', margin: 0 }}>Débito do Mês Anterior Pendente</p>
                        <p style={{ color: '#78350f', margin: '0.25rem 0 0 0' }}>
                            {mesAnterior['Descrição']}: {formatCurrency(mesAnterior['Valor'])}
                            {mesAnterior['Quitado'] && mesAnterior['Quitado'] !== '-' && 
                                ` (Quitado: ${formatCurrency(mesAnterior['Quitado'])})`
                            }
                        </p>
                    </div>
                </div>
            )}

            {/* Gráficos */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                gap: '2rem',
                marginBottom: '2rem'
            }}>
                {/* Gráfico de Barras */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Comparação Crédito vs Débito</h3>
                    <div style={{ height: '300px' }}>
                        <Bar data={barChartData} options={barChartOptions} />
                    </div>
                </div>

                {/* Gráfico de Pizza */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Distribuição Financeira</h3>
                    <div style={{ height: '300px' }}>
                        <Pie data={pieChartData} options={pieChartOptions} />
                    </div>
                </div>
            </div>

            {/* Detalhamento em Accordion */}
            <details style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <summary style={{ 
                    cursor: 'pointer', 
                    fontWeight: 'bold', 
                    color: '#1e293b',
                    fontSize: '1.125rem',
                    marginBottom: '1rem'
                }}>
                    💰 Detalhes do Saldo Consolidado ({consolidado.length} {consolidado.length === 1 ? 'item' : 'itens'})
                </summary>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem', color: '#475569' }}>Descrição</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', fontSize: '0.875rem', color: '#475569' }}>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {consolidado.map((row, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1e293b' }}>{row['Descrição']}</td>
                                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1e293b', textAlign: 'right', fontWeight: '600' }}>
                                        {formatCurrency(row['Valor'])}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </details>

            <details style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <summary style={{ 
                    cursor: 'pointer', 
                    fontWeight: 'bold', 
                    color: '#1e293b',
                    fontSize: '1.125rem',
                    marginBottom: '1rem'
                }}>
                    📈 Detalhes dos Créditos ({credito.length} {credito.length === 1 ? 'item' : 'itens'})
                </summary>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem', color: '#475569' }}>Descrição</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', fontSize: '0.875rem', color: '#475569' }}>Valor</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', fontSize: '0.875rem', color: '#475569' }}>Quitado</th>
                                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', fontSize: '0.875rem', color: '#475569' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {credito.map((row, idx) => {
                                const isQuitado = row['Quitado'] && row['Quitado'] !== '' && row['Quitado'] !== '-';
                                const isMesAnt = row['Descrição']?.includes('Mês Ant.');
                                return (
                                    <tr 
                                        key={idx} 
                                        style={{ 
                                            borderBottom: '1px solid #e2e8f0',
                                            backgroundColor: isMesAnt ? 'rgba(251, 191, 36, 0.1)' : isQuitado ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                                            borderLeft: isMesAnt ? '3px solid #f59e0b' : isQuitado ? '3px solid #22c55e' : 'none'
                                        }}
                                    >
                                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1e293b' }}>{row['Descrição']}</td>
                                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1e293b', textAlign: 'right', fontWeight: '600' }}>
                                            {formatCurrency(row['Valor'])}
                                        </td>
                                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#22c55e', textAlign: 'right', fontWeight: '600' }}>
                                            {formatCurrency(row['Quitado'])}
                                        </td>
                                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'center' }}>
                                            {isMesAnt ? '⚠️ Mês Ant.' : isQuitado ? '✅ Recebido' : '⏳ Pendente'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </details>

            <details style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <summary style={{ 
                    cursor: 'pointer', 
                    fontWeight: 'bold', 
                    color: '#1e293b',
                    fontSize: '1.125rem',
                    marginBottom: '1rem'
                }}>
                    📉 Detalhes dos Débitos ({debito.length} {debito.length === 1 ? 'item' : 'itens'})
                </summary>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem', color: '#475569' }}>Descrição</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', fontSize: '0.875rem', color: '#475569' }}>Valor</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', fontSize: '0.875rem', color: '#475569' }}>Quitado</th>
                                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', fontSize: '0.875rem', color: '#475569' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {debito.map((row, idx) => {
                                const isQuitado = row['Quitado'] && row['Quitado'] !== '' && row['Quitado'] !== '-';
                                return (
                                    <tr 
                                        key={idx} 
                                        style={{ 
                                            borderBottom: '1px solid #e2e8f0',
                                            backgroundColor: isQuitado ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                                            borderLeft: isQuitado ? '3px solid #22c55e' : 'none'
                                        }}
                                    >
                                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1e293b' }}>{row['Descrição']}</td>
                                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1e293b', textAlign: 'right', fontWeight: '600' }}>
                                            {formatCurrency(row['Valor'])}
                                        </td>
                                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#22c55e', textAlign: 'right', fontWeight: '600' }}>
                                            {formatCurrency(row['Quitado'])}
                                        </td>
                                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'center' }}>
                                            {isQuitado ? '✅ Pago' : '⏳ Pendente'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </details>
        </div>
    );
}
