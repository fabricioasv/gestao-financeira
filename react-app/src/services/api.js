/**
 * Serviço para comunicação com a Azure Function API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7071/api';

/**
 * Busca dados de uma aba específica
 * @param {string} sheetName - Nome da aba (ex: 'consolidado', 'proventos')
 * @returns {Promise<any>} Dados da aba em formato JSON
 */
export async function fetchSheet(sheetName) {
    const url = `${API_BASE_URL}/sheets/${sheetName}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`Erro ao buscar ${sheetName}: HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    return data;
}

/**
 * Busca dados de todas as abas
 * @returns {Promise<Record<string, any>>} Objeto com dados de todas as abas
 */
export async function fetchAllSheets() {
    const url = `${API_BASE_URL}/sheets`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`Erro ao buscar todas as abas: HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    return data;
}

/**
 * Lista as abas disponíveis
 * @returns {Promise<string[]>} Array com nomes das abas
 */
export async function fetchSheetsList() {
    const url = `${API_BASE_URL}/sheets-list`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`Erro ao listar abas: HTTP ${response.status}`);
    }
    
    return response.json();
}

/**
 * Verifica saúde da API
 * @returns {Promise<{status: string, timestamp: string, version: string}>}
 */
export async function checkHealth() {
    const url = `${API_BASE_URL}/health`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`API indisponível: HTTP ${response.status}`);
    }
    
    return response.json();
}

// Exportar funções específicas para cada aba
export const fetchConsolidado = () => fetchSheet('consolidado');
export const fetchProventos = () => fetchSheet('proventos');
export const fetchCartaoPrevisao = () => fetchSheet('cartao-previsao');
export const fetchCartaoDetalhe = () => fetchSheet('cartao-detalhe');
export const fetchCartaoForecast = () => fetchSheet('cartao-forecast');
export const fetchAcoesCarteira = () => fetchSheet('acoes-carteira');
export const fetchRendaProjetiva = () => fetchSheet('renda-projetiva');
export const fetchProventosRecebidos = () => fetchSheet('proventos-recebidos');
export const fetchProventosAReceber = () => fetchSheet('proventos-a-receber');
export const fetchNetoInvest = () => fetchSheet('neto-invest');
export const fetchFollowUp = () => fetchSheet('follow-up');
export const fetchAtual = () => fetchSheet('atual');

