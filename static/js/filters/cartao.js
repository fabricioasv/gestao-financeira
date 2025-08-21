/* ========================================
   SISTEMA DE GESTÃO FINANCEIRA PESSOAL
   ========================================
   Arquivo: filters/cartao.js
   Descrição: Módulo dos filtros de cartão
   ======================================== */

import { validateElement, logDebug, logError } from '../utils/index.js';

// ========================================
// FUNÇÕES DE FILTROS
// ========================================

/**
 * Popula os filtros de cartão com dados dinâmicos
 * @param {Array} cartaoData - Dados do cartão
 * @param {Array} cartaoDetalheData - Dados detalhados do cartão
 */
export function populateCartaoFilters(cartaoData, cartaoDetalheData) {

    logDebug('populateCartaoFilters chamada com:', cartaoData, cartaoDetalheData);
    
    const filtroMes = document.getElementById('filtroMes');
    const filtroGrupo = document.getElementById('filtroGrupo');
    
    if (!filtroMes || !filtroGrupo) {
        logError('Elementos de filtro de cartão não encontrados');
        return;
    }
    
    // Limpar opções existentes
    filtroMes.innerHTML = '<option value="">Todos os meses</option>';
    filtroGrupo.innerHTML = '<option value="">Todas as categorias</option>';
    
    if (!cartaoDetalheData || cartaoDetalheData.length === 0) {
        logDebug('⚠️ Nenhum dado de cartão para popular filtros');
        return;
    }
    
    // Extrair meses únicos
    logDebug('🔍 Dados de cartão detalhado para extrair meses:', cartaoDetalheData);
    
    // Verificar formato da data
    if (cartaoDetalheData.length > 0) {
        logDebug('🔍 Exemplo de data do primeiro item:', cartaoDetalheData[0].data);
        logDebug('🔍 Formato da data:', typeof cartaoDetalheData[0].data);
    }
    
    const meses = [...new Set(cartaoDetalheData.map(item => {
        let mesExtraido = null;
        
        // Tentar diferentes formatos de data
        if (item.data && typeof item.data === 'string') {
            if (item.data.includes('/')) {
                // Formato DD/MM/YYYY
                mesExtraido = item.data.split('/')[1];
            } else if (item.data.includes('-')) {
                // Formato YYYY-MM-DD ou DD-MM-YYYY
                const parts = item.data.split('-');
                if (parts.length === 3) {
                    if (parts[0].length === 4) {
                        // YYYY-MM-DD
                        mesExtraido = parts[1];
                    } else {
                        // DD-MM-YYYY
                        mesExtraido = parts[1];
                    }
                }
            } else if (item.data.length === 8) {
                // Formato DDMMYYYY
                mesExtraido = item.data.substring(2, 4);
            } else if (item.data.length === 6) {
                // Formato MMYYYY
                mesExtraido = item.data.substring(0, 2);
            }
        }
        
        logDebug('🔍 Item:', item.data, 'Mês extraído:', mesExtraido);
        return mesExtraido;
    }))].filter(mes => mes !== null).sort();
    
    logDebug('🔍 Meses únicos extraídos:', meses);
    
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    meses.forEach(mes => {
        // Validar se o mês é um número válido entre 1 e 12
        const mesNum = parseInt(mes);
        if (mesNum >= 1 && mesNum <= 12) {
            const option = document.createElement('option');
            option.value = mes;
            option.textContent = monthNames[mesNum - 1];
            filtroMes.appendChild(option);
            logDebug('🔍 Opção de mês criada:', mes, monthNames[mesNum - 1]);
        } else {
            logDebug('⚠️ Mês inválido ignorado:', mes, 'Valor:', mes, 'Tipo:', typeof mes);
        }
    });
    
    // Extrair grupos únicos
    const grupos = [...new Set(cartaoDetalheData.map(item => item.grupo))].sort();
    
    grupos.forEach(grupo => {
        const option = document.createElement('option');
        option.value = grupo;
        option.textContent = grupo;
        filtroGrupo.appendChild(option);
    });
    
    logDebug('✅ Filtros de cartão populados com sucesso');
}

/**
 * Filtra a tabela de cartão detalhado baseado nos filtros selecionados
 */
export function filtrarCartaoDetalhe() {
    logDebug('filtrarCartaoDetalhe chamada');
    
    const filtroMes = document.getElementById('filtroMes');
    const filtroGrupo = document.getElementById('filtroGrupo');
    
    if (!filtroMes || !filtroGrupo) {
        logError('Elementos de filtro de cartão não encontrados');
        return;
    }
    
    const mesSelecionado = filtroMes.value;
    const grupoSelecionado = filtroGrupo.value;
    
    logDebug('Filtros selecionados:', { mes: mesSelecionado, grupo: grupoSelecionado });
    
    // Obter dados originais
    const dadosOriginais = window.originalCartaoDetalheData || [];
    
    if (!dadosOriginais || dadosOriginais.length === 0) {
        logDebug('⚠️ Nenhum dado original para filtrar');
        return;
    }
    
    // Aplicar filtros
    let dadosFiltrados = dadosOriginais;
    
    logDebug('🔍 Aplicando filtros. Dados originais:', dadosOriginais.length);
    
    if (mesSelecionado) {
        logDebug('🔍 Aplicando filtro de mês:', mesSelecionado);
        dadosFiltrados = dadosFiltrados.filter(item => {
            let mesItem = null;
            
            // Usar a mesma lógica de extração de mês da função populateCartaoFilters
            if (item.data && typeof item.data === 'string') {
                if (item.data.includes('/')) {
                    // Formato DD/MM/YYYY
                    mesItem = item.data.split('/')[1];
                } else if (item.data.includes('-')) {
                    // Formato YYYY-MM-DD ou DD-MM-YYYY
                    const parts = item.data.split('-');
                    if (parts.length === 3) {
                        if (parts[0].length === 4) {
                            // YYYY-MM-DD
                            mesItem = parts[1];
                        } else {
                            // DD-MM-YYYY
                            mesItem = parts[1];
                        }
                    }
                } else if (item.data.length === 8) {
                    // Formato DDMMYYYY
                    mesItem = item.data.substring(2, 4);
                } else if (item.data.length === 6) {
                    // Formato MMYYYY
                    mesItem = item.data.substring(0, 2);
                }
            }
            
            logDebug('🔍 Filtrando item:', item.data, 'Mês extraído:', mesItem, 'Mês selecionado:', mesSelecionado);
            return mesItem === mesSelecionado;
        });
        logDebug('🔍 Após filtro de mês:', dadosFiltrados.length, 'itens');
    }
    
    if (grupoSelecionado) {
        dadosFiltrados = dadosFiltrados.filter(item => item.grupo === grupoSelecionado);
    }
    
    logDebug('Dados filtrados:', dadosFiltrados.length, 'de', dadosOriginais.length);
    
    // Exibir dados filtrados
    if (window.displayFilteredCartaoDetalhe) {
        window.displayFilteredCartaoDetalhe(dadosFiltrados);
    }
    
    // Atualizar gráfico se disponível
    if (dadosFiltrados.length > 0) {
        logDebug('🔍 Atualizando gráfico de cartão com dados filtrados');
        
        // Chamar função de atualização do gráfico (se existir)
        if (window.createCartaoCategoriaChart) {
            // Passar os dados originais do cartão para manter a estrutura esperada
            // mas filtrar apenas os grupos que estão nos dados filtrados
            const gruposFiltrados = [...new Set(dadosFiltrados.map(item => item.grupo))];
            
            // Obter dados originais do cartão (estrutura esperada pelo gráfico)
            const dadosOriginaisCartao = window.originalCartaoData || [];
            
            if (dadosOriginaisCartao.length > 0) {
                // Filtrar apenas os grupos que estão nos dados filtrados
                const dadosFiltradosParaGrafico = dadosOriginaisCartao.filter(item => 
                    gruposFiltrados.includes(item.grupo)
                );
                
                logDebug('🔍 Dados originais do cartão:', dadosOriginaisCartao);
                logDebug('🔍 Grupos filtrados:', gruposFiltrados);
                logDebug('🔍 Dados filtrados para gráfico:', dadosFiltradosParaGrafico);
                
                if (dadosFiltradosParaGrafico.length > 0) {
                    window.createCartaoCategoriaChart(dadosFiltradosParaGrafico);
                } else {
                    logDebug('⚠️ Nenhum grupo encontrado para atualizar gráfico');
                }
            } else {
                logDebug('⚠️ Dados originais do cartão não encontrados para atualizar gráfico');
            }
        } else {
            logDebug('⚠️ Função createCartaoCategoriaChart não encontrada globalmente');
        }
    }
}

// ========================================
// EXPORTAÇÕES
// ========================================
