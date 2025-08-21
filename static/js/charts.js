/* ========================================
   SISTEMA DE GESTÃO FINANCEIRA PESSOAL
   ========================================
   Arquivo: charts.js
   Descrição: Módulo de funcionalidades de gráficos
   ======================================== */

import { validateElement, logDebug, logError } from './utils.js';

// ========================================
// VARIÁVEIS GLOBAIS
// ========================================
let consolidatedChart = null;
let cartaoChart = null;
let investimentoChart = null;
let proventosChart = null;
let cartaoCategoriaChart = null;

// ========================================
// FUNÇÕES DE GRÁFICOS
// ========================================

/**
 * Cria o gráfico consolidado
 * @param {Object} chartData - Dados do gráfico
 */
function createConsolidatedChart(chartData) {
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

/**
 * Cria o gráfico de cartão
 * @param {Object} chartData - Dados do gráfico
 */
function createCartaoChart(chartData) {
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

/**
 * Cria o gráfico de investimento
 * @param {Object} chartData - Dados do gráfico
 */
function createInvestimentoChart(chartData) {
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

/**
 * Cria o gráfico de proventos
 * @param {Object} proventosData - Dados de proventos
 * @param {string} filterType - Tipo de filtro aplicado
 */
function createProventosChart(proventosData, filterType = 'desde-inicio') {
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

/**
 * Cria o gráfico de cartão por categoria
 * @param {Object} cartaoData - Dados do cartão
 */
function createCartaoCategoriaChart(cartaoData) {
    console.log('🚀 createCartaoCategoriaChart INICIADA');
    logDebug('createCartaoCategoriaChart chamada com:', cartaoData);
    
    // Verificar se cartaoData é um array
    if (!Array.isArray(cartaoData)) {
        logError('❌ cartaoData não é um array:', cartaoData);
        console.error('❌ cartaoData não é um array:', cartaoData);
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
// EXPORTAÇÕES
// ========================================
export {
    createConsolidatedChart,
    createCartaoChart,
    createInvestimentoChart,
    createProventosChart,
    createCartaoCategoriaChart
};
