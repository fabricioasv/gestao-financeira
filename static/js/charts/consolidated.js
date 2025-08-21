/* ========================================
   SISTEMA DE GESTÃO FINANCEIRA PESSOAL
   ========================================
   Arquivo: charts/consolidated.js
   Descrição: Módulo do gráfico consolidado
   ======================================== */

import { validateElement, logDebug, logError } from '../utils/index.js';

// ========================================
// VARIÁVEIS GLOBAIS
// ========================================
let consolidatedChart = null;

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Função para obter o mês atual
 * @returns {string} Mês atual no formato "25-MM"
 */
function getCurrentMonth() {
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `25-${month}`;
}

/**
 * Função para verificar se o mês é futuro
 * @param {string} monthStr - String do mês no formato "25-MM"
 * @returns {boolean} True se o mês é futuro
 */
function isFutureMonth(monthStr) {
    const currentMonth = getCurrentMonth();
    return monthStr > currentMonth; // Maior que o mês atual (não igual)
}

// ========================================
// FUNÇÕES DE GRÁFICOS
// ========================================

/**
 * Cria o gráfico consolidado
 * @param {Object} chartData - Dados do gráfico
 */
export function createConsolidatedChart(chartData) {
    logDebug('createConsolidatedChart chamada com:', chartData);
    
    const canvas = validateElement('consolidatedChart', 'createConsolidatedChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (consolidatedChart) {
        consolidatedChart.destroy();
    }

    // Preparar dados com cores baseadas no mês
    const months = chartData.months;
    const currentMonth = getCurrentMonth();
    
    const datasets = [
        {
            label: 'Crédito Realizado',
            data: chartData.consolidated.credito_realizado,
            backgroundColor: 'rgba(40, 167, 69, 0.8)',
            borderColor: 'rgba(40, 167, 69, 1)',
            borderWidth: 1
        }
    ];

    // Adicionar Débitos Realizado (meses passados)
    const debitosRealizadoData = months.map((month, index) => {
        return isFutureMonth(month) ? 0 : chartData.consolidated.debitos_realizado[index];
    });
    
    datasets.push({
        label: 'Débitos Realizado',
        data: debitosRealizadoData,
        backgroundColor: 'rgba(220, 53, 69, 0.8)',
        borderColor: 'rgba(220, 53, 69, 1)',
        borderWidth: 1
    });

    // Adicionar Débitos Previsto (meses futuros) em cinza
    const debitosPrevistoData = months.map((month, index) => {
        return isFutureMonth(month) ? chartData.consolidated.debitos_previsto[index] : 0;
    });
    
    datasets.push({
        label: 'Débitos Previsto',
        data: debitosPrevistoData,
        backgroundColor: 'rgba(108, 117, 125, 0.8)',
        borderColor: 'rgba(108, 117, 125, 1)',
        borderWidth: 1
    });

    // Adicionar linha consolidada
    datasets.push({
        label: '[C] Consolidado',
        data: chartData.consolidated.consolidado,
        type: 'line',
        borderColor: 'rgba(0, 123, 255, 1)',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.1
    });

    consolidatedChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Evolução Financeira Consolidada'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += 'R$ ' + context.parsed.y.toLocaleString('pt-BR');
                            }
                            return label;
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
        }
    });
}

// ========================================
// EXPORTAÇÕES
// ========================================
