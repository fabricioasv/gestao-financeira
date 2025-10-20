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
 * @param {Array} proventosAReceberData - Dados dos proventos a receber
 */
export function createAcoesCarteiraTable(acoesCarteiraData, proventosRecebidosData, proventosAReceberData) {
    console.log('🚀 createAcoesCarteiraTable INICIADA');
    logDebug('🔍 Dados da carteira:', acoesCarteiraData);
    logDebug('🔍 Dados dos proventos recebidos:', proventosRecebidosData);
    logDebug('🔍 Dados dos proventos a receber:', proventosAReceberData);
    
    const acoesCarteiraTableBody = validateElement('acoesCarteiraTableBody', 'createAcoesCarteiraTable');
    const proventosRecebidosTableBody = validateElement('proventosRecebidosTableBody', 'createAcoesCarteiraTable');
    
    if (!acoesCarteiraTableBody || !proventosRecebidosTableBody) {
        logError('❌ Elementos da tabela de ações não encontrados');
        return;
    }

    // Calcular totais do quadro resumo
    updateQuadroResumo(acoesCarteiraData, proventosRecebidosData, proventosAReceberData);

    // Processar dados da carteira
    // Calcular proventos recebidos por ticker no ano atual
    const proventosRecebidosPorTicker = calcularProventosRecebidosPorTicker(proventosRecebidosData);
    
    // Calcular proventos a receber por ticker
    const proventosAReceberPorTicker = calcularProventosAReceberPorTicker(proventosAReceberData);
    
    // Criar lista combinada de ações (carteira + ações com proventos a receber)
    const acoesCompletas = criarListaAcoesCombinada(acoesCarteiraData, proventosAReceberPorTicker);
    
    if (!acoesCompletas || acoesCompletas.length === 0) {
        acoesCarteiraTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted">
                    <i class="fas fa-info-circle me-2"></i>
                    Nenhuma ação encontrada na carteira.
                </td>
            </tr>
        `;
        return;
    }

    // Criar tabela da carteira com nova estrutura
    acoesCarteiraTableBody.innerHTML = acoesCompletas.map(acao => {
        const valorInvestido = (acao.amount || 0) * (acao.average_price || 0);
        const proventosRecebidosAno = proventosRecebidosPorTicker[acao.ticker] || 0;
        const proventosAReceber = proventosAReceberPorTicker[acao.ticker] || 0;
        
        // Formatação condicional para ações que não estão na carteira
        const isAcaoNaCarteira = acao.amount > 0;
        const quantidade = isAcaoNaCarteira ? acao.amount.toLocaleString('pt-BR') : '-';
        const precoMedio = isAcaoNaCarteira ? `R$ ${acao.average_price.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '-';
        const valorInvestidoFormatted = isAcaoNaCarteira ? `R$ ${valorInvestido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : '-';
        const pctDivProj = isAcaoNaCarteira ? `${(acao.pct_div_proj || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}%` : '-';
        const divProj = isAcaoNaCarteira ? `R$ ${(acao.div_proj || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : '-';
        
        return `
            <tr>
                <td><strong>${acao.ticker}</strong></td>
                <td class="text-end">${quantidade}</td>
                <td class="text-end">${precoMedio}</td>
                <td class="text-end">${valorInvestidoFormatted}</td>
                <td class="text-end text-info">R$ ${proventosRecebidosAno.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td class="text-end ${proventosAReceber > 0 ? 'text-warning' : 'text-success'}">R$ ${proventosAReceber.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td class="text-end">${pctDivProj}</td>
                <td class="text-end">${divProj}</td>
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
 * Calcula os proventos a receber por ticker
 * @param {Array} proventosAReceberData - Dados dos proventos a receber
 * @returns {Object} Objeto com proventos a receber por ticker
 */
function calcularProventosAReceberPorTicker(proventosAReceberData) {
    console.log('🚀 calcularProventosAReceberPorTicker INICIADA');
    
    const proventosAReceberPorTicker = {};
    
    if (!proventosAReceberData || proventosAReceberData.length === 0) {
        logDebug('⚠️ Nenhum dado de proventos a receber disponível');
        return proventosAReceberPorTicker;
    }
    
    proventosAReceberData.forEach(provento => {
        if (!proventosAReceberPorTicker[provento.ticker]) {
            proventosAReceberPorTicker[provento.ticker] = 0;
        }
        proventosAReceberPorTicker[provento.ticker] += provento.valor_total;
    });
    
    logDebug('🔍 Proventos a receber por ticker:', proventosAReceberPorTicker);
    return proventosAReceberPorTicker;
}

/**
 * Cria lista combinada de ações (carteira + ações com proventos a receber)
 * @param {Array} acoesCarteiraData - Dados das ações da carteira
 * @param {Object} proventosAReceberPorTicker - Proventos a receber por ticker
 * @returns {Array} Lista combinada de ações
 */
function criarListaAcoesCombinada(acoesCarteiraData, proventosAReceberPorTicker) {
    console.log('🚀 criarListaAcoesCombinada INICIADA');
    
    const acoesCompletas = [];
    const tickersNaCarteira = new Set();
    
    // Adicionar ações da carteira
    if (acoesCarteiraData && acoesCarteiraData.length > 0) {
        acoesCarteiraData.forEach(acao => {
            acoesCompletas.push(acao);
            tickersNaCarteira.add(acao.ticker);
        });
    }
    
    // Adicionar ações que têm proventos a receber mas não estão na carteira
    Object.keys(proventosAReceberPorTicker).forEach(ticker => {
        if (!tickersNaCarteira.has(ticker)) {
            acoesCompletas.push({
                ticker: ticker,
                amount: 0,
                average_price: 0,
                nota: 0,
                r_alvo: 0,
                r_base_pt: 0,
                ultima_atualizacao: '-',
                desvio_pl_proj: 0,
                cagr_lcr_5a: 0,
                div_l_ebitda: 0,
                div_proj: 0,
                pct_div_proj: 0
            });
        }
    });
    
    logDebug('🔍 Lista combinada de ações:', acoesCompletas);
    return acoesCompletas;
}

/**
 * Atualiza o quadro resumo da carteira
 * @param {Array} acoesCarteiraData - Dados das ações da carteira
 * @param {Array} proventosRecebidosData - Dados dos proventos recebidos
 * @param {Array} proventosAReceberData - Dados dos proventos a receber
 */
function updateQuadroResumo(acoesCarteiraData, proventosRecebidosData, proventosAReceberData) {
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

    // Calcular proventos a receber (soma direta dos valores pendentes)
    const totalProventosPendentes = proventosAReceberData ?
        proventosAReceberData.reduce((sum, provento) => sum + (provento.valor_total || 0), 0) : 0;

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
