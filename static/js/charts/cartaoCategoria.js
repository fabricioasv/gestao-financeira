/* ========================================
   SISTEMA DE GESTÃO FINANCEIRA PESSOAL
   ========================================
   Arquivo: charts/cartaoCategoria.js
   Descrição: Módulo do gráfico de cartão por categoria
   ======================================== */

import { validateElement, logDebug, logError } from '../utils/index.js';

// ========================================
// VARIÁVEIS GLOBAIS
// ========================================
let cartaoCategoriaChart = null;

// ========================================
// FUNÇÕES DE GRÁFICOS
// ========================================

/**
 * Cria o gráfico de cartão por categoria
 * @param {Object} cartaoData - Dados do cartão
 */
export function createCartaoCategoriaChart(cartaoData) {

    logDebug('createCartaoCategoriaChart chamada com:', cartaoData);
    
    // Verificar se cartaoData é um array
    if (!Array.isArray(cartaoData)) {
        logError('❌ cartaoData não é um array:', cartaoData);

        return;
    }
    
    if (cartaoData.length === 0) {
        logDebug('⚠️ cartaoData está vazio');
        return;
    }
    
    const canvas = validateElement('cartaoCategoriaChart', 'createCartaoCategoriaChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (cartaoCategoriaChart) {
        cartaoCategoriaChart.destroy();
    }

    // Preparar dados para gráfico de barras
    const months = Object.keys(cartaoData[0]?.months || {}).sort();
    const grupos = cartaoData.map(item => item.grupo);
    
    // Se não há meses ou grupos, não criar gráfico
    if (months.length === 0 || grupos.length === 0) {
        logDebug('⚠️ Dados insuficientes para criar gráfico');
        return;
    }
    
    const datasets = grupos.map((grupo, index) => {
        const colors = [
            'rgba(255, 99, 132, 0.8)',   // Vermelho
            'rgba(54, 162, 235, 0.8)',   // Azul
            'rgba(255, 206, 86, 0.8)',   // Amarelo
            'rgba(75, 192, 192, 0.8)',   // Verde água
            'rgba(153, 102, 255, 0.8)',  // Roxo
            'rgba(255, 159, 64, 0.8)',   // Laranja
            'rgba(199, 199, 199, 0.8)',  // Cinza
            'rgba(83, 102, 255, 0.8)',   // Azul escuro
            'rgba(78, 205, 196, 0.8)',   // Verde
            'rgba(255, 99, 132, 0.8)'    // Rosa
        ];
        
        const data = months.map(month => {
            const grupoItem = cartaoData.find(item => item.grupo === grupo);
            return grupoItem ? (grupoItem.months[month] || 0) : 0;
        });
        
        return {
            label: grupo,
            data: data,
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length].replace('0.8', '1'),
            borderWidth: 1
        };
    });

    cartaoCategoriaChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months.map(month => {
                const [year, monthNum] = month.split('-');
                const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                                  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                return `${monthNames[parseInt(monthNum) - 1]}/${year.slice(-2)}`;
            }),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Gastos por Categoria - Mês a Mês'
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
                    title: {
                        display: true,
                        text: 'Meses'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Valor (R$)'
                    },
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
