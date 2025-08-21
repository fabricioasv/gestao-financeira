/* ========================================
   SISTEMA DE GESTÃO FINANCEIRA PESSOAL
   ========================================
   Arquivo: charts/proventos.js
   Descrição: Módulo do gráfico de proventos
   ======================================== */

import { validateElement, logDebug, logError } from '../utils/index.js';

// ========================================
// VARIÁVEIS GLOBAIS
// ========================================
let proventosChart = null;

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Filtra dados de proventos baseado no tipo de filtro
 * @param {Array} proventosData - Dados de proventos
 * @param {string} filterType - Tipo de filtro
 * @returns {Array} Dados filtrados
 */
function filterProventosData(proventosData, filterType) {
    
    if (!proventosData || proventosData.length === 0) {
        return [];
    }
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    let filteredData = [];
    
    switch (filterType) {
        case 'este-ano':
            filteredData = proventosData.filter(item => item.year === currentYear);
            break;
        
        case 'ultimos-12-meses':
            // Para os últimos 12 meses, vamos mostrar os últimos 2 anos
            filteredData = proventosData.filter(item => 
                item.year >= currentYear - 1
            );
            break;
        
        case 'desde-inicio':
        default:
            filteredData = proventosData;
            break;
    }
    
    return filteredData;
}

// ========================================
// FUNÇÕES DE GRÁFICOS
// ========================================

/**
 * Cria o gráfico de proventos
 * @param {Object} proventosData - Dados de proventos
 * @param {string} filterType - Tipo de filtro aplicado
 */
export function createProventosChart(proventosData, filterType = 'desde-inicio') {
    logDebug('createProventosChart chamada com:', proventosData, filterType);
    
    const canvas = validateElement('proventosChart', 'createProventosChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (proventosChart) {
        proventosChart.destroy();
    }

    // Aplicar filtro atual
    const filteredData = filterProventosData(proventosData, filterType);
    
    // Preparar dados para gráfico de barras com meses no eixo X
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    // Criar datasets para cada ano
    const datasets = [];
    const colors = [
        'rgba(40, 167, 69, 0.8)',   // Verde
        'rgba(23, 162, 184, 0.8)',  // Azul
        'rgba(255, 193, 7, 0.8)',   // Amarelo
        'rgba(220, 53, 69, 0.8)',   // Vermelho
        'rgba(102, 16, 242, 0.8)',  // Roxo
        'rgba(253, 126, 20, 0.8)',  // Laranja
        'rgba(32, 201, 151, 0.8)'   // Verde água
    ];
    
    filteredData.forEach((yearData, index) => {
        
        const yearValues = monthNames.map(monthName => {
            const value = yearData.months[monthName] || 0;
            return value;
        });
        
        datasets.push({
            label: `Ano ${yearData.year}`,
            data: yearValues,
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length].replace('0.8', '1'),
            borderWidth: 1
        });
    });
    
    const chartConfig = {
        type: 'bar',
        data: {
            labels: monthNames,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Evolução dos Proventos por Mês'
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
    };
    
    try {
        proventosChart = new Chart(ctx, chartConfig);
    } catch (error) {
        logError('Erro ao criar gráfico:', error);
    }
}

// ========================================
// EXPORTAÇÕES
// ========================================
