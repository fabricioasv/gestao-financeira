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
    createCartaoCategoriaChart,
    createRendaProjetivaChart,
    createRendaProjetivaTable
} from './charts/index.js';

import {
    createFinancialTable,
    createAcoesTableDashboard,
    createProventosTable,
    createCartaoDetalheTable,
    createAcoesCarteiraTable
} from './tables/index.js';

import { populateCartaoFilters } from './filters/cartao.js';

// Importar funções utilitárias
import { logDebug, logError } from './utils/index.js';

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
    console.log('🚀 displayData chamada com:', data);  // Debug log
    
    currentData = data;
    
    // Atualizar dados globais no HTML
    if (window.updateGlobalData) {
        window.updateGlobalData(data);
    }
    
    // Display data section
    document.getElementById('dataSection').style.display = 'block';
    
    // Create charts
    console.log('🎨 Criando gráficos...');  // Debug log
    try {
        createConsolidatedChart(data.chart_data);
        console.log('✅ Gráfico consolidado criado');  // Debug log
    } catch (error) {
        console.error('❌ Erro ao criar gráfico consolidado:', error);  // Debug log
    }
    
    try {
        createCartaoChart(data.chart_data);
        console.log('✅ Gráfico de cartão criado');  // Debug log
    } catch (error) {
        console.error('❌ Erro ao criar gráfico de cartão:', error);  // Debug log
    }
    
    try {
        createInvestimentoChart(data.chart_data);
        console.log('✅ Gráfico de investimento criado');  // Debug log
    } catch (error) {
        console.error('❌ Erro ao criar gráfico de investimento:', error);  // Debug log
    }
    
    // Create table
    console.log('📊 Criando tabelas...');  // Debug log
    try {
        createFinancialTable(data.table_data, data.chart_data.months);
        console.log('✅ Tabela financeira criada');  // Debug log
    } catch (error) {
        console.error('❌ Erro ao criar tabela financeira:', error);  // Debug log
    }
    
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
     
     // Create ações carteira table
     if (data.acoes_carteira_data && data.proventos_recebidos_data) {
         console.log('📊 Criando tabela de ações da carteira...');
         try {
             createAcoesCarteiraTable(data.acoes_carteira_data, data.proventos_recebidos_data, data.proventos_a_receber_data);
             console.log('✅ Tabela de ações da carteira criada');
         } catch (error) {
             console.error('❌ Erro ao criar tabela de ações da carteira:', error);
         }
     } else {
         console.log('⚠️ Dados de ações da carteira ou proventos recebidos não disponíveis');
     }
     
     // Create renda projetiva chart and table
     if (data.renda_projetiva_data) {
         console.log('📊 Criando gráfico e tabela de renda projetiva...');
         try {
             createRendaProjetivaChart(data.renda_projetiva_data);
             createRendaProjetivaTable(data.renda_projetiva_data);
             console.log('✅ Gráfico e tabela de renda projetiva criados');
         } catch (error) {
             console.error('❌ Erro ao criar gráfico e tabela de renda projetiva:', error);
         }
     } else {
         console.log('⚠️ Dados de renda projetiva não disponíveis');
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
        console.log('📥 Resposta recebida do upload:', data);  // Debug log
        if (data.success) {
            console.log('✅ Upload bem-sucedido, preparando refresh...');  // Debug log
            // Fazer refresh da página para carregar os novos dados
            console.log('🔄 Fazendo refresh da página após upload...');
            // Mostrar mensagem de sucesso (comentado temporariamente para debug)
            if (data.message) {
                console.log('📢 Mensagem de sucesso:', data.message);  // Debug log
                // alert(data.message); // Comentado para debug
            }
            // Aguardar um pouco mais para garantir que o alert foi fechado
            setTimeout(() => {
                console.log('🔄 Executando refresh via href...');  // Debug log
                
                // Método 1: Usar href para forçar o refresh - mais confiável
                try {
                    console.log('🔄 Método 1: Redirecionando via href...');  // Debug log
                    const currentUrl = window.location.href;
                    console.log('🔄 URL atual:', currentUrl);  // Debug log
                    window.location.href = currentUrl;
                    return; // Se funcionar, sair da função
                } catch (error) {
                    console.error('❌ Método 1 falhou:', error);
                }
                
                // Método 2: Fallback com window.location.reload()
                try {
                    console.log('🔄 Método 2: Tentando window.location.reload()...');  // Debug log
                    window.location.reload();
                    return; // Se funcionar, sair da função
                } catch (error) {
                    console.error('❌ Método 2 falhou:', error);
                }
                
                // Método 3: Fallback com document.location.reload()
                try {
                    console.log('🔄 Método 3: Tentando document.location.reload()...');  // Debug log
                    document.location.reload();
                    return; // Se funcionar, sair da função
                } catch (error) {
                    console.error('❌ Método 3 falhou:', error);
                }
                
                // Método 4: Fallback com location.assign()
                try {
                    console.log('🔄 Método 4: Tentando location.assign()...');  // Debug log
                    location.assign(location.href);
                    return; // Se funcionar, sair da função
                } catch (error) {
                    console.error('❌ Método 4 falhou:', error);
                }
                
                console.error('❌ Todos os métodos de refresh falharam!');
            }, 2000); // Aguardar 2 segundos para garantir que o alert foi fechado
        } else {
            console.log('❌ Upload falhou:', data.error);  // Debug log
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
