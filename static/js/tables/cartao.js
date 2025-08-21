/* ========================================
   SISTEMA DE GESTÃO FINANCEIRA PESSOAL
   ========================================
   Arquivo: tables/cartao.js
   Descrição: Módulo da tabela de cartão detalhado
   ======================================== */

import { validateElement, logDebug, logError } from '../utils/index.js';

// ========================================
// FUNÇÕES DE TABELAS
// ========================================

/**
 * Cria a tabela de cartão detalhado
 * @param {Array} cartaoDetalheData - Dados detalhados do cartão
 */
export function createCartaoDetalheTable(cartaoDetalheData) {
    logDebug('createCartaoDetalheTable chamada com:', cartaoDetalheData);
    
    const tableBody = validateElement('cartaoDetalheTableBody', 'createCartaoDetalheTable');
    if (!tableBody) {
        logError('Elemento cartaoDetalheTableBody não encontrado');
        return;
    }
    
    // Armazenar dados originais para filtros
    window.originalCartaoDetalheData = cartaoDetalheData;
    
    // Exibir todos os dados inicialmente
    displayFilteredCartaoDetalhe(cartaoDetalheData);
}

/**
 * Exibe dados filtrados do cartão detalhado
 * @param {Array} filteredData - Dados filtrados
 */
export function displayFilteredCartaoDetalhe(filteredData) {
    const tableBody = validateElement('cartaoDetalheTableBody', 'displayFilteredCartaoDetalhe');
    if (!tableBody) {
        logError('Elemento cartaoDetalheTableBody não encontrado');
        return;
    }
    
    if (!filteredData || filteredData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    <i class="fas fa-info-circle me-2"></i>
                    Nenhum registro encontrado com os filtros aplicados.
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = filteredData.map(item => {
        const valorClass = item.valor > 0 ? 'text-danger' : 'text-success';
        return `
            <tr>
                <td><strong>${item.fatura}</strong></td>
                <td>${item.data}</td>
                <td>${item.estabelecimento_fmt || item.estabelecimento}</td>
                <td class="text-end ${valorClass}">R$ ${item.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td>${item.cartao}</td>
                <td><span class="badge bg-secondary">${item.grupo}</span></td>
            </tr>
        `;
    }).join('');
}

// ========================================
// EXPORTAÇÕES
// ========================================
