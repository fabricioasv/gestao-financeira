/* ========================================
   SISTEMA DE GESTÃO FINANCEIRA PESSOAL
   ========================================
   Arquivo: charts/investimento.js
   Descrição: Módulo do gráfico de investimento
   ======================================== */

import { validateElement, logDebug, logError } from '../utils/index.js';

// ========================================
// VARIÁVEIS GLOBAIS
// ========================================
let investimentoChart = null;

// ========================================
// FUNÇÕES DE GRÁFICOS
// ========================================

/**
 * Cria o gráfico de investimento
 * @param {Object} chartData - Dados do gráfico
 */
export function createInvestimentoChart(chartData) {
    logDebug('createInvestimentoChart chamada com:', chartData);
    
    const canvas = validateElement('investimentoChart', 'createInvestimentoChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (investimentoChart) {
        investimentoChart.destroy();
    }

    investimentoChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.months,
            datasets: [
                {
                    label: 'Investimento Ações',
                    data: chartData.investimento.acoes,
                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Investimento Renda Fixa',
                    data: chartData.investimento.renda_fixa,
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Previdência Privada',
                    data: chartData.investimento.previdencia_privada,
                    backgroundColor: 'rgba(75, 192, 192, 0.8)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Investimento Cripto',
                    data: chartData.investimento.cripto,
                    backgroundColor: 'rgba(255, 206, 86, 0.8)',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Financiamento Apartamento',
                    data: chartData.investimento.financiamento_apartamento,
                    backgroundColor: 'rgba(153, 102, 255, 0.8)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Total',
                    data: chartData.investimento.total,
                    type: 'line',
                    borderColor: 'rgba(0, 0, 0, 1)',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 4,
                    fill: false,
                    tension: 0.1,
                    pointBackgroundColor: 'rgba(0, 0, 0, 1)',
                    pointBorderColor: 'rgba(0, 0, 0, 1)',
                    pointRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Evolução dos Investimentos'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += 'R$ ' + context.parsed.y.toLocaleString('pt-BR', {minimumFractionDigits: 2});
                            }
                            return label;
                        },
                        footer: function(tooltipItems) {
                            // Calcular total do mês
                            let total = 0;
                            tooltipItems.forEach(function(tooltipItem) {
                                if (tooltipItem.parsed.y !== null) {
                                    total += tooltipItem.parsed.y;
                                }
                            });
                            return 'Total: R$ ' + total.toLocaleString('pt-BR', {minimumFractionDigits: 2});
                        }
                    }
                }
            },
            onHover: function(event, elements) {
                // Mudar cursor quando passar sobre o eixo X
                if (elements.length > 0) {
                    event.native.target.style.cursor = 'pointer';
                } else {
                    event.native.target.style.cursor = 'default';
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,
                    // Não forçar beginAtZero para permitir valores negativos
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            }
        }
    });
}

// ========================================
// EXPORTAÇÕES
// ========================================
