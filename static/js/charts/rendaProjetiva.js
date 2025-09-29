/* ========================================
   SISTEMA DE GESTÃO FINANCEIRA PESSOAL
   ========================================
   Arquivo: charts/rendaProjetiva.js
   Descrição: Módulo do gráfico de renda projetiva
   ======================================== */

import { validateElement, logDebug, logError } from '../utils/index.js';

// ========================================
// FUNÇÕES DE GRÁFICOS DE RENDA PROJETIVA
// ========================================

/**
 * Cria o gráfico de expectativa da renda passiva
 * @param {Array} rendaProjetivaData - Dados da renda projetiva
 */
export function createRendaProjetivaChart(rendaProjetivaData) {
    console.log('🚀 createRendaProjetivaChart INICIADA');
    logDebug('🔍 Dados da renda projetiva:', rendaProjetivaData);
    
    const canvas = validateElement('rendaProjetivaChart', 'createRendaProjetivaChart');
    if (!canvas) {
        logError('❌ Canvas do gráfico de renda projetiva não encontrado');
        return;
    }

    if (!rendaProjetivaData || rendaProjetivaData.length === 0) {
        logDebug('⚠️ Dados de renda projetiva não disponíveis');
        return;
    }

    // Destruir gráfico existente se houver
    if (window.rendaProjetivaChartInstance) {
        window.rendaProjetivaChartInstance.destroy();
    }

    // Processar dados para o gráfico
    const chartData = processarDadosRendaProjetiva(rendaProjetivaData);
    
    if (!chartData || chartData.labels.length === 0) {
        logDebug('⚠️ Dados processados vazios para gráfico de renda projetiva');
        return;
    }

    // Configuração do gráfico
    const config = {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [
                {
                    label: 'Renda Anual Total (R$)',
                    data: chartData.rendaAnualTotal,
                    backgroundColor: 'rgba(75, 192, 192, 0.8)',
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Renda Mensal Total (R$)',
                    data: chartData.rendaMensalTotal,
                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Taxa de Crescimento Média (%)',
                    data: chartData.taxaCrescimentoMedia,
                    type: 'line',
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: 'rgb(54, 162, 235)',
                    pointBorderColor: 'rgb(54, 162, 235)',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    tension: 0.1,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Expectativa de Renda Passiva e Taxa de Crescimento',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.datasetIndex === 2) { // Taxa de crescimento
                                label += context.parsed.y.toFixed(2) + '%';
                            } else {
                                label += 'R$ ' + context.parsed.y.toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Ano'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Valor (R$)'
                    },
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            });
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Taxa de Crescimento (%)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(1) + '%';
                        }
                    }
                }
            }
        }
    };

    // Criar o gráfico
    const ctx = canvas.getContext('2d');
    window.rendaProjetivaChartInstance = new Chart(ctx, config);
    
    logDebug('✅ Gráfico de renda projetiva criado com sucesso');
}

/**
 * Processa os dados da renda projetiva para o gráfico
 * @param {Array} rendaProjetivaData - Dados brutos da renda projetiva
 * @returns {Object} Dados processados para o gráfico
 */
function processarDadosRendaProjetiva(rendaProjetivaData) {
    console.log('🚀 processarDadosRendaProjetiva INICIADA');
    
    // Agrupar dados por ano
    const dadosPorAno = {};
    
    rendaProjetivaData.forEach(item => {
        if (!dadosPorAno[item.ano]) {
            dadosPorAno[item.ano] = {
                rendaAnual: 0,
                rendaMensal: 0,
                taxasCrescimento: [],
                tickers: new Set()
            };
        }
        
        dadosPorAno[item.ano].rendaAnual += item.renda_anual || 0;
        dadosPorAno[item.ano].rendaMensal += item.renda_mensal || 0;
        
        if (item.taxa_crescimento && item.taxa_crescimento !== 0) {
            dadosPorAno[item.ano].taxasCrescimento.push(item.taxa_crescimento);
        }
        
        dadosPorAno[item.ano].tickers.add(item.ticker);
    });
    
    // Ordenar anos
    const anos = Object.keys(dadosPorAno).map(Number).sort((a, b) => a - b);
    
    // Preparar dados para o gráfico
    const labels = anos.map(ano => ano.toString());
    const rendaAnualTotal = anos.map(ano => dadosPorAno[ano].rendaAnual);
    const rendaMensalTotal = anos.map(ano => dadosPorAno[ano].rendaMensal);
    const taxaCrescimentoMedia = anos.map(ano => {
        const taxas = dadosPorAno[ano].taxasCrescimento;
        if (taxas.length === 0) return 0;
        return taxas.reduce((sum, taxa) => sum + taxa, 0) / taxas.length;
    });
    
    const resultado = {
        labels,
        rendaAnualTotal,
        rendaMensalTotal,
        taxaCrescimentoMedia
    };
    
    logDebug('🔍 Dados processados:', resultado);
    return resultado;
}

/**
 * Cria uma tabela resumo da renda projetiva
 * @param {Array} rendaProjetivaData - Dados da renda projetiva
 */
export function createRendaProjetivaTable(rendaProjetivaData) {
    console.log('🚀 createRendaProjetivaTable INICIADA');
    logDebug('🔍 Dados da renda projetiva para tabela:', rendaProjetivaData);
    
    const tableBody = validateElement('rendaProjetivaTableBody', 'createRendaProjetivaTable');
    if (!tableBody) {
        logError('❌ Elemento da tabela de renda projetiva não encontrado');
        return;
    }

    if (!rendaProjetivaData || rendaProjetivaData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted">
                    <i class="fas fa-info-circle me-2"></i>
                    Nenhum dado de renda projetiva encontrado.
                </td>
            </tr>
        `;
        return;
    }

    // Agrupar dados por ano e somar os valores
    const dadosPorAno = {};
    rendaProjetivaData.forEach(item => {
        const ano = item.ano;
        if (!dadosPorAno[ano]) {
            dadosPorAno[ano] = {
                ano: ano,
                renda_anual: 0,
                renda_mensal: 0,
                taxa_crescimento: 0,
                count: 0
            };
        }
        
        dadosPorAno[ano].renda_anual += item.renda_anual || 0;
        dadosPorAno[ano].renda_mensal += item.renda_mensal || 0;
        dadosPorAno[ano].taxa_crescimento += item.taxa_crescimento || 0;
        dadosPorAno[ano].count++;
    });

    // Calcular média da taxa de crescimento
    Object.keys(dadosPorAno).forEach(ano => {
        if (dadosPorAno[ano].count > 0) {
            dadosPorAno[ano].taxa_crescimento = dadosPorAno[ano].taxa_crescimento / dadosPorAno[ano].count;
        }
    });

    // Ordenar por ano e criar linhas da tabela
    const anosOrdenados = Object.keys(dadosPorAno).sort((a, b) => parseInt(a) - parseInt(b));
    let tableHTML = '';
    
    anosOrdenados.forEach(ano => {
        const dados = dadosPorAno[ano];
        tableHTML += `
            <tr>
                <td class="text-center fw-bold">${dados.ano}</td>
                <td class="text-end">R$ ${dados.renda_anual.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td class="text-end">R$ ${dados.renda_mensal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td class="text-end">${dados.taxa_crescimento.toLocaleString('pt-BR', {minimumFractionDigits: 1, maximumFractionDigits: 1})}%</td>
            </tr>
        `;
    });

    tableBody.innerHTML = tableHTML;
    
    logDebug('✅ Tabela de renda projetiva criada com sucesso');
}

// ========================================
// EXPORTAÇÕES
// ========================================
