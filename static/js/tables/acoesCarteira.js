/* ========================================
   SISTEMA DE GESTÃO FINANCEIRA PESSOAL
   ========================================
   Arquivo: tables/acoesCarteira.js
   Descrição: Módulo da tabela de ações da carteira
   ======================================== */

import { validateElement, logDebug, logError } from '../utils/index.js';

// ========================================
// FUNÇÕES DE TABELAS DE AÇÕES
// ========================================

/**
 * Cria a tabela de ações da carteira
 * @param {Array} acoesCarteiraData - Dados das ações da carteira
 * @param {Array} proventosRecebidosData - Dados dos proventos recebidos
 */
export function createAcoesCarteiraTable(acoesCarteiraData, proventosRecebidosData) {
    console.log('🚀 createAcoesCarteiraTable INICIADA');
    logDebug('🔍 Dados da carteira:', acoesCarteiraData);
    logDebug('🔍 Dados dos proventos recebidos:', proventosRecebidosData);
    
    const acoesCarteiraTableBody = validateElement('acoesCarteiraTableBody', 'createAcoesCarteiraTable');
    const proventosRecebidosTableBody = validateElement('proventosRecebidosTableBody', 'createAcoesCarteiraTable');
    
    if (!acoesCarteiraTableBody || !proventosRecebidosTableBody) {
        logError('❌ Elementos da tabela de ações não encontrados');
        return;
    }

    // Calcular totais do quadro resumo
    updateQuadroResumo(acoesCarteiraData, proventosRecebidosData);

    // Processar dados da carteira
    if (!acoesCarteiraData || acoesCarteiraData.length === 0) {
        acoesCarteiraTableBody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-muted">
                    <i class="fas fa-info-circle me-2"></i>
                    Nenhuma ação encontrada na carteira.
                </td>
            </tr>
        `;
        return;
    }

    // Calcular proventos recebidos por ticker no ano atual
    const proventosRecebidosPorTicker = calcularProventosRecebidosPorTicker(proventosRecebidosData);
    
    // Criar tabela da carteira
    acoesCarteiraTableBody.innerHTML = acoesCarteiraData.map(acao => {
        const valorInvestido = acao.amount * acao.average_price;
        const proventosRecebidosAno = proventosRecebidosPorTicker[acao.ticker] || 0;
        const proventosPendentes = Math.max(0, acao.div_proj - proventosRecebidosAno);
        
        return `
            <tr>
                <td><strong>${acao.ticker}</strong></td>
                <td class="text-end">${acao.amount.toLocaleString('pt-BR')}</td>
                <td class="text-end">R$ ${acao.average_price.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td class="text-end">R$ ${valorInvestido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td class="text-end">R$ ${(acao.div_proj || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td class="text-end text-info">R$ ${proventosRecebidosAno.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td class="text-end ${proventosPendentes > 0 ? 'text-warning' : 'text-success'}">R$ ${proventosPendentes.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td class="text-end">${(acao.pct_div_proj || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}%</td>
                <td class="text-end">${(acao.nota || 0).toLocaleString('pt-BR', {minimumFractionDigits: 1})}</td>
                <td class="text-center">${acao.ultima_atualizacao || '-'}</td>
            </tr>
        `;
    }).join('');

    // Criar tabela de proventos recebidos
    createProventosRecebidosTable(proventosRecebidosData);
    
    logDebug('✅ Tabela de ações da carteira criada com sucesso');
}

/**
 * Cria a tabela de proventos recebidos
 * @param {Array} proventosRecebidosData - Dados dos proventos recebidos
 */
function createProventosRecebidosTable(proventosRecebidosData) {
    console.log('🚀 createProventosRecebidosTable INICIADA');
    logDebug('🔍 Dados dos proventos recebidos:', proventosRecebidosData);
    
    const proventosRecebidosTableBody = validateElement('proventosRecebidosTableBody', 'createProventosRecebidosTable');
    
    if (!proventosRecebidosTableBody) {
        logError('❌ Elemento da tabela de proventos recebidos não encontrado');
        return;
    }

    if (!proventosRecebidosData || proventosRecebidosData.length === 0) {
        proventosRecebidosTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    <i class="fas fa-info-circle me-2"></i>
                    Nenhum provento recebido encontrado.
                </td>
            </tr>
        `;
        return;
    }

    // Ordenar por data de pagamento (mais recente primeiro)
    const proventosOrdenados = [...proventosRecebidosData].sort((a, b) => {
        const dataA = new Date(a.pagamento.split('/').reverse().join('-'));
        const dataB = new Date(b.pagamento.split('/').reverse().join('-'));
        return dataB - dataA;
    });

    proventosRecebidosTableBody.innerHTML = proventosOrdenados.map(provento => {
        return `
            <tr>
                <td><strong>${provento.ticker}</strong></td>
                <td class="text-center">${provento.pagamento}</td>
                <td class="text-center">${provento.mes}</td>
                <td class="text-center">${provento.referencia}</td>
                <td class="text-end">R$ ${provento.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td class="text-end">R$ ${provento.valor_total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
            </tr>
        `;
    }).join('');
    
    logDebug('✅ Tabela de proventos recebidos criada com sucesso');
}

/**
 * Calcula os proventos recebidos por ticker no ano atual
 * @param {Array} proventosRecebidosData - Dados dos proventos recebidos
 * @returns {Object} Objeto com proventos por ticker
 */
function calcularProventosRecebidosPorTicker(proventosRecebidosData) {
    console.log('🚀 calcularProventosRecebidosPorTicker INICIADA');
    
    const anoAtual = new Date().getFullYear();
    const proventosPorTicker = {};
    
    if (!proventosRecebidosData || proventosRecebidosData.length === 0) {
        logDebug('⚠️ Nenhum dado de proventos recebidos disponível');
        return proventosPorTicker;
    }
    
    proventosRecebidosData.forEach(provento => {
        if (provento.referencia === anoAtual) {
            if (!proventosPorTicker[provento.ticker]) {
                proventosPorTicker[provento.ticker] = 0;
            }
            proventosPorTicker[provento.ticker] += provento.valor_total;
        }
    });
    
    logDebug('🔍 Proventos recebidos por ticker no ano atual:', proventosPorTicker);
    return proventosPorTicker;
}

/**
 * Atualiza o quadro resumo da carteira
 * @param {Array} acoesCarteiraData - Dados das ações da carteira
 * @param {Array} proventosRecebidosData - Dados dos proventos recebidos
 */
function updateQuadroResumo(acoesCarteiraData, proventosRecebidosData) {
    console.log('🚀 updateQuadroResumo INICIADA');
    
    const totalInvestidoEl = validateElement('totalInvestido', 'updateQuadroResumo');
    const proventosProjetadosEl = validateElement('proventosProjetados', 'updateQuadroResumo');
    const proventosRecebidosEl = validateElement('proventosRecebidos', 'updateQuadroResumo');
    const proventosPendentesEl = validateElement('proventosPendentes', 'updateQuadroResumo');
    
    if (!totalInvestidoEl || !proventosProjetadosEl || !proventosRecebidosEl || !proventosPendentesEl) {
        logError('❌ Elementos do quadro resumo não encontrados');
        return;
    }

    if (!acoesCarteiraData || acoesCarteiraData.length === 0) {
        totalInvestidoEl.textContent = 'R$ 0,00';
        proventosProjetadosEl.textContent = 'R$ 0,00';
        proventosRecebidosEl.textContent = 'R$ 0,00';
        proventosPendentesEl.textContent = 'R$ 0,00';
        return;
    }

    // Calcular totais
    let totalInvestido = 0;
    let totalProventosProjetados = 0;
    
    acoesCarteiraData.forEach(acao => {
        totalInvestido += acao.amount * acao.average_price;
        totalProventosProjetados += acao.div_proj || 0;
    });

    // Calcular proventos recebidos no ano atual
    const proventosRecebidosPorTicker = calcularProventosRecebidosPorTicker(proventosRecebidosData);
    const totalProventosRecebidos = Object.values(proventosRecebidosPorTicker).reduce((sum, valor) => sum + valor, 0);
    
    const totalProventosPendentes = Math.max(0, totalProventosProjetados - totalProventosRecebidos);

    // Atualizar elementos
    totalInvestidoEl.textContent = `R$ ${totalInvestido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    proventosProjetadosEl.textContent = `R$ ${totalProventosProjetados.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    proventosRecebidosEl.textContent = `R$ ${totalProventosRecebidos.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    proventosPendentesEl.textContent = `R$ ${totalProventosPendentes.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    
    logDebug('✅ Quadro resumo atualizado:', {
        totalInvestido,
        totalProventosProjetados,
        totalProventosRecebidos,
        totalProventosPendentes
    });
}

// ========================================
// EXPORTAÇÕES
// ========================================
