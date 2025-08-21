/* ========================================
   SISTEMA DE GESTÃO FINANCEIRA PESSOAL
   ========================================
   Arquivo: tables/financial.js
   Descrição: Módulo da tabela financeira principal
   ======================================== */

import { validateElement, logDebug, logError } from '../utils/index.js';

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
 * @returns {boolean} True se o mês for futuro
 */
function isFutureMonth(monthStr) {
    const currentMonth = getCurrentMonth();
    return monthStr > currentMonth; // Maior que o mês atual (não igual)
}

// ========================================
// FUNÇÕES DE TABELAS
// ========================================

/**
 * Cria a tabela financeira principal
 * @param {Object} tableData - Dados da tabela
 * @param {Array} months - Lista de meses
 */
export function createFinancialTable(tableData, months) {
    logDebug('createFinancialTable chamada com:', tableData, months);
    
    const tableBody = validateElement('tableBody', 'createFinancialTable');
    const thead = document.querySelector('#financialTable thead tr');
    
    if (!tableBody || !thead) {
        logError('Elementos da tabela financeira não encontrados');
        return;
    }
    
    // Limpar cabeçalhos existentes (exceto Categoria e ID)
    const existingHeaders = thead.querySelectorAll('th');
    for (let i = 2; i < existingHeaders.length; i++) {
        existingHeaders[i].remove();
    }
    
    // Adicionar cabeçalhos dos meses
    months.forEach(month => {
        const th = document.createElement('th');
        th.setAttribute('scope', 'col');
        th.className = 'text-center';
        th.style.minWidth = '100px';
        
        if (isFutureMonth(month)) {
            th.classList.add('month-future');
        }
        
        th.textContent = month;
        thead.appendChild(th);
    });
    
    // Limpar o corpo da tabela
    tableBody.innerHTML = '';
    
    // Criar linhas da tabela
    tableData.forEach(row => {
        const tr = document.createElement('tr');
        
        // Célula da categoria
        const tdCategory = document.createElement('td');
        tdCategory.innerHTML = `<span class="badge bg-secondary">${row.alias}</span>`;
        tr.appendChild(tdCategory);
        
        // Célula do ID
        const tdId = document.createElement('td');
        tdId.innerHTML = `<small class="text-muted">${row.id}</small>`;
        tr.appendChild(tdId);
        
        // Células dos meses
        months.forEach(month => {
            const td = document.createElement('td');
            td.className = 'text-end';
            
            const value = row.months[month];
            let valueClass = '';
            if (value > 0) valueClass = 'text-success fw-bold';
            else if (value < 0) valueClass = 'text-danger fw-bold';
            else valueClass = 'text-muted';
            
            if (isFutureMonth(month)) {
                td.classList.add('month-future');
                // Remover classes de cor para meses futuros para manter consistência
                td.className = 'text-end month-future';
            } else {
                if (valueClass) td.className += ' ' + valueClass;
            }
            
            td.textContent = `R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
            tr.appendChild(td);
        });
        
        tableBody.appendChild(tr);
    });
}

// ========================================
// EXPORTAÇÕES
// ========================================
