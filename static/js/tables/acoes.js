/* ========================================
   SISTEMA DE GESTÃO FINANCEIRA PESSOAL
   ========================================
   Arquivo: tables/acoes.js
   Descrição: Módulo da tabela de ações
   ======================================== */

import { validateElement, logDebug, logError } from '../utils/index.js';

// ========================================
// FUNÇÕES DE TABELAS
// ========================================

/**
 * Cria a tabela de ações no dashboard
 * @param {Array} acoesData - Dados das ações
 */
export function createAcoesTableDashboard(acoesData) {
    logDebug('createAcoesTableDashboard chamada com:', acoesData);
    
    const acoesTableBody = validateElement('acoesTableDashboardBody', 'createAcoesTableDashboard');
    const rendaTotal = validateElement('rendaTotalDashboard', 'createAcoesTableDashboard');
    
    if (!acoesTableBody || !rendaTotal) {
        logError('Elementos da tabela de ações não encontrados');
        return;
    }

    if (!acoesData || acoesData.length === 0) {
        acoesTableBody.innerHTML = `
            <tr>
                <td colspan="12" class="text-center text-muted">
                    <i class="fas fa-info-circle me-2"></i>
                    Nenhuma ação encontrada. Adicione dados na aba "Ações" do Excel.
                </td>
            </tr>
        `;
        rendaTotal.textContent = 'R$ 0,00';
        return;
    }

    let totalRenda = 0;

    acoesData.forEach(acao => {
        totalRenda += acao.renda_esperada;
    });

    rendaTotal.textContent = `R$ ${totalRenda.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;

    acoesTableBody.innerHTML = acoesData.map(acao => {
        return `
            <tr>
                <td><strong>${acao.ticker}</strong></td>
                <td class="text-end">${acao.qtd.toLocaleString('pt-BR')}</td>
                <td class="text-end">R$ ${(acao.div_esperado_2025 || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td class="text-end">R$ ${acao.renda_esperada.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td class="text-end">R$ ${(acao.capital_atual || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td class="text-end">${(acao.dividend_yield_esperado || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}%</td>
                <td class="text-end">R$ ${(acao.dividend_yield_pago || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td class="text-end">${(acao.dividend_yield_restante || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}%</td>
                <td class="text-end">${((acao.proporcao_hoje || 0) * 100).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}%</td>
                <td class="text-end">${(acao.meta_28k || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td class="text-end">${(acao.meta_1_ano || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td class="text-end">${(acao.meta_qtd_2033 || 0).toLocaleString('pt-BR')}</td>
            </tr>
        `;
    }).join('');
}

// ========================================
// EXPORTAÇÕES
// ========================================
