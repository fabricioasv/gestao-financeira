/* ========================================
   SISTEMA DE GESTÃO FINANCEIRA PESSOAL
   ========================================
   Arquivo: tables/proventos.js
   Descrição: Módulo da tabela de proventos
   ======================================== */

import { validateElement, logDebug, logError } from '../utils/index.js';

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
    logDebug('filterProventosData chamada com:', { proventosData, filterType });
    
    if (!proventosData || proventosData.length === 0) {
        logDebug('⚠️ Dados de proventos vazios ou inválidos');
        return [];
    }
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    logDebug('Ano e mês atuais:', { currentYear, currentMonth });
    
    let filteredData = [];
    
    switch (filterType) {
        case 'este-ano':
            filteredData = proventosData.filter(item => item.year === currentYear);
            logDebug('Filtro "este-ano" aplicado:', filteredData.length, 'anos encontrados');
            break;
        
        case 'ultimos-12-meses':
            // Para os últimos 12 meses, vamos mostrar os últimos 2 anos
            filteredData = proventosData.filter(item => 
                item.year >= currentYear - 1
            );
            logDebug('Filtro "ultimos-12-meses" aplicado:', filteredData.length, 'anos encontrados');
            break;
        
        case 'desde-inicio':
        default:
            filteredData = proventosData;
            logDebug('Filtro "desde-inicio" aplicado:', filteredData.length, 'anos encontrados');
            break;
    }
    
    logDebug('Resultado final do filtro:', filteredData);
    return filteredData;
}

// ========================================
// FUNÇÕES DE TABELAS
// ========================================

/**
 * Cria a tabela de proventos
 * @param {Array} proventosData - Dados de proventos
 * @param {string} filterType - Tipo de filtro aplicado
 */
export function createProventosTable(proventosData, filterType = 'desde-inicio') {
    logDebug('createProventosTable chamada com:', proventosData, filterType);
    
    const tableBody = validateElement('proventosTableBody', 'createProventosTable');
    
    if (!tableBody) {
        logError('Elemento proventosTableBody não encontrado');
        return;
    }
    
    // Aplicar filtro atual
    const filteredData = filterProventosData(proventosData, filterType);
    logDebug('Dados filtrados de proventos:', filteredData);
    logDebug('Quantidade de anos após filtro:', filteredData.length);
    
    tableBody.innerHTML = '';
    
    filteredData.forEach(yearData => {
        
        const tr = document.createElement('tr');
        
        // Célula do ano
        const tdYear = document.createElement('td');
        tdYear.innerHTML = `<strong>${yearData.year}</strong>`;
        tr.appendChild(tdYear);
        
        // Células dos meses
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                           'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        
        monthNames.forEach(monthName => {
            const td = document.createElement('td');
            td.className = 'text-end';
            
            // Encontrar o valor do mês correspondente
            let monthValue = yearData.months[monthName] || 0;
            
            if (monthValue > 0) {
                td.className += ' text-success fw-bold';
            } else if (monthValue < 0) {
                td.className += ' text-danger fw-bold';
            } else {
                td.className += ' text-muted';
            }
            
            td.textContent = `R$ ${monthValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
            tr.appendChild(td);
        });
        
        // Célula do total
        const tdTotal = document.createElement('td');
        tdTotal.className = 'text-end fw-bold';
        if (yearData.total > 0) {
            tdTotal.className += ' text-success';
        } else if (yearData.total < 0) {
            tdTotal.className += ' text-danger';
        }
        tdTotal.textContent = `R$ ${yearData.total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        tr.appendChild(tdTotal);
        
        // Célula da variação
        const tdVariacao = document.createElement('td');
        tdVariacao.className = 'text-end fw-bold';
        
        const variacao = yearData.variacao || 0;
        if (variacao > 0) {
            tdVariacao.className += ' text-success';
            tdVariacao.innerHTML = `<i class="fas fa-arrow-up me-1"></i>+${variacao.toFixed(1)}%`;
        } else if (variacao < 0) {
            tdVariacao.className += ' text-danger';
            tdVariacao.innerHTML = `<i class="fas fa-arrow-down me-1"></i>${variacao.toFixed(1)}%`;
        } else {
            tdVariacao.className += ' text-muted';
            tdVariacao.innerHTML = `<i class="fas fa-minus me-1"></i>0.0%`;
        }
        tr.appendChild(tdVariacao);
        
        tableBody.appendChild(tr);
    });
}

// ========================================
// EXPORTAÇÕES
// ========================================
