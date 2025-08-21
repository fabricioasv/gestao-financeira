/* ========================================
   SISTEMA DE GESTÃO FINANCEIRA PESSOAL
   ========================================
   Arquivo: charts/cartao.js
   Descrição: Módulo do gráfico de cartão
   ======================================== */

import { validateElement, logDebug, logError } from '../utils/index.js';

// ========================================
// VARIÁVEIS GLOBAIS
// ========================================
let cartaoChart = null;

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
 * Cria o gráfico de cartão
 * @param {Object} chartData - Dados do gráfico
 */
export function createCartaoChart(chartData) {
    logDebug('createCartaoChart chamada com:', chartData);
    
    const canvas = validateElement('cartaoChart', 'createCartaoChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (cartaoChart) {
        cartaoChart.destroy();
    }

    // Preparar dados com lógica de meses futuros
    const months = chartData.months;
    const datasets = [];

    // Para meses passados e atual: usar dados realizados
    const cartaoDtiData = months.map((month, index) => {
        return isFutureMonth(month) ? 0 : chartData.cartao.cartao_dti[index];
    });
    
    datasets.push({
        label: 'Cartão dti Realizado',
        data: cartaoDtiData,
        backgroundColor: 'rgba(255, 193, 7, 0.8)',
        borderColor: 'rgba(255, 193, 7, 1)',
        borderWidth: 1
    });

    const sicrediData = months.map((month, index) => {
        return isFutureMonth(month) ? 0 : chartData.cartao.sicredi[index];
    });
    
    datasets.push({
        label: 'Sicredi Realizado',
        data: sicrediData,
        backgroundColor: 'rgba(220, 53, 69, 0.8)',
        borderColor: 'rgba(220, 53, 69, 1)',
        borderWidth: 1
    });

    const portoBankData = months.map((month, index) => {
        return isFutureMonth(month) ? 0 : chartData.cartao.porto_bank[index];
    });
    
    datasets.push({
        label: 'Porto Bank Realizado',
        data: portoBankData,
        backgroundColor: 'rgba(23, 162, 184, 0.8)',
        borderColor: 'rgba(23, 162, 184, 1)',
        borderWidth: 1
    });

    const btgData = months.map((month, index) => {
        return isFutureMonth(month) ? 0 : chartData.cartao.btg[index];
    });
    
    datasets.push({
        label: 'BTG Realizado',
        data: btgData,
        backgroundColor: 'rgba(102, 16, 242, 0.8)',
        borderColor: 'rgba(102, 16, 242, 1)',
        borderWidth: 1
    });

    // Para meses futuros: usar [C] Cartão em cinza
    const cartaoConsolidadoData = months.map((month, index) => {
        return isFutureMonth(month) ? chartData.cartao.cartao_consolidado[index] : 0;
    });
    
    datasets.push({
        label: '[C] Cartão (Futuro)',
        data: cartaoConsolidadoData,
        backgroundColor: 'rgba(108, 117, 125, 0.8)',
        borderColor: 'rgba(108, 117, 125, 1)',
        borderWidth: 1
    });

    cartaoChart = new Chart(ctx, {
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
                    text: 'Gastos com Cartão por Instituição'
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
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,
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
