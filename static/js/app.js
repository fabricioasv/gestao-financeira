/* ========================================
   SISTEMA DE GESTÃO FINANCEIRA PESSOAL
   ========================================
   Arquivo: app.js
   Descrição: Módulo principal da aplicação
   ======================================== */

// ========================================
// IMPORTAÇÕES
// ========================================
import { 
    createConsolidatedChart, 
    createCartaoChart, 
    createInvestimentoChart, 
    createProventosChart, 
    createCartaoCategoriaChart
} from './charts.js';

import {
    createFinancialTable,
    createAcoesTableDashboard,
    createProventosTable,
    createCartaoDetalheTable,
    populateCartaoFilters
} from './tables.js';

// ========================================
// VARIÁVEIS GLOBAIS
// ========================================
let currentData = null;
let currentProventosFilter = 'desde-inicio';

// ========================================
// FUNÇÕES PRINCIPAIS
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
 * @returns {boolean} True se o mês for futuro
 */
function isFutureMonth(monthStr) {
    const currentMonth = getCurrentMonth();
    return monthStr > currentMonth; // Maior que o mês atual (não igual)
}

/**
 * Função para exibir dados na interface
 * @param {Object} data - Dados recebidos do backend
 */
function displayData(data) {
    
    currentData = data;
    
    // Atualizar dados globais no HTML
    if (window.updateGlobalData) {
        window.updateGlobalData(data);
    }
    
    // Display data section
    document.getElementById('dataSection').style.display = 'block';
    
    // Create charts
    createConsolidatedChart(data.chart_data);
    createCartaoChart(data.chart_data);
    createInvestimentoChart(data.chart_data);
    
    // Create table
    createFinancialTable(data.table_data, data.chart_data.months);
    
    // Create ações table
    if (data.acoes_data) {

        createAcoesTableDashboard(data.acoes_data);
    } else {

    }
    
         // Create proventos chart and table
     if (data.proventos_data) {
         
         createProventosChart(data.proventos_data);
         createProventosTable(data.proventos_data);
     } else {
 
     }
    
         // Create cartão detalhado chart and table
     if (data.cartao_data && data.cartao_detalhe_data) {
         
         
         createCartaoCategoriaChart(data.cartao_data);
         createCartaoDetalheTable(data.cartao_detalhe_data);
         populateCartaoFilters(data.cartao_data, data.cartao_detalhe_data);
         
         // Expor função do gráfico globalmente para filtros
         window.createCartaoCategoriaChart = createCartaoCategoriaChart;
         
         // Expor dados originais do cartão para filtros
         window.originalCartaoData = data.cartao_data;
     } else {
 
     }
}

/**
 * Função para mostrar/esconder indicador de carregamento
 * @param {boolean} show - True para mostrar, false para esconder
 */
function showLoading(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (show) {
        loadingIndicator.classList.add('show');
    } else {
        loadingIndicator.classList.remove('show');
    }
}

// ========================================
// FUNÇÕES DE UPLOAD E CARREGAMENTO
// ========================================

/**
 * Função para lidar com arquivo selecionado
 * @param {File} file - Arquivo selecionado
 */
function handleFile(file) {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
        alert('Por favor, selecione um arquivo Excel válido (.xlsx ou .xls)');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    showLoading(true);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        showLoading(false);
        if (data.success) {
            displayData(data);
        } else {
            alert('Erro ao processar arquivo: ' + data.error);
        }
    })
    .catch(error => {
        showLoading(false);
        alert('Erro ao fazer upload: ' + error.message);
    });
}

/**
 * Função para carregar dados padrão
 */
function loadDefaultData() {
    showLoading(true);
    
    fetch('/load_default')
    .then(response => response.json())
    .then(data => {
        showLoading(false);
        if (data.success) {
            displayData(data);
        } else {
            alert('Erro ao carregar dados padrão: ' + data.error);
        }
    })
    .catch(error => {
        showLoading(false);
        alert('Erro ao carregar dados: ' + error.message);
    });
}



// ========================================
// INICIALIZAÇÃO
// ========================================

// Auto-load default data on page load
window.addEventListener('load', () => {
    loadDefaultData();
});

// ========================================
// EXPORTAÇÃO DO MÓDULO
// ========================================
export {
    getCurrentMonth,
    isFutureMonth,
    displayData,
    showLoading,
    handleFile,
    loadDefaultData,
    currentData,
    currentProventosFilter
};
