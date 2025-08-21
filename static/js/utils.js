/* ========================================
   SISTEMA DE GESTÃO FINANCEIRA PESSOAL
   ========================================
   Arquivo: utils.js
   Descrição: Funções utilitárias e auxiliares
   ======================================== */

// ========================================
// FUNÇÕES DE VALIDAÇÃO
// ========================================

/**
 * Valida se um elemento HTML existe
 * @param {string} elementId - ID do elemento
 * @param {string} context - Contexto da validação
 * @returns {HTMLElement|null} Elemento encontrado ou null
 */
export function validateElement(elementId, context = '') {
    const element = document.getElementById(elementId);
    if (!element) {

        return null;
    }
    return element;
}

/**
 * Valida se os dados são válidos
 * @param {*} data - Dados a serem validados
 * @param {string} context - Contexto da validação
 * @returns {boolean} True se os dados são válidos
 */
export function validateData(data, context = '') {
    if (!data || (Array.isArray(data) && data.length === 0)) {

        return false;
    }
    return true;
}

// ========================================
// FUNÇÕES DE FORMATAÇÃO
// ========================================

/**
 * Formata valor monetário para exibição
 * @param {number} value - Valor a ser formatado
 * @param {number} decimals - Número de casas decimais
 * @returns {string} Valor formatado
 */
export function formatCurrency(value, decimals = 2) {
    if (typeof value !== 'number' || isNaN(value)) {
        return 'R$ 0,00';
    }
    return `R$ ${value.toLocaleString('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    })}`;
}

/**
 * Formata valor percentual para exibição
 * @param {number} value - Valor a ser formatado (0-1)
 * @param {number} decimals - Número de casas decimais
 * @returns {string} Valor formatado
 */
export function formatPercentage(value, decimals = 2) {
    if (typeof value !== 'number' || isNaN(value)) {
        return '0,00%';
    }
    const percentage = value * 100;
    return `${percentage.toLocaleString('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    })}%`;
}

/**
 * Formata número para exibição
 * @param {number} value - Valor a ser formatado
 * @param {number} decimals - Número de casas decimais
 * @returns {string} Valor formatado
 */
export function formatNumber(value, decimals = 2) {
    if (typeof value !== 'number' || isNaN(value)) {
        return '0,00';
    }
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

// ========================================
// FUNÇÕES DE LOG
// ========================================

/**
 * Log estruturado para debug
 * @param {string} message - Mensagem de log
 * @param {*} data - Dados para log
 * @param {string} context - Contexto do log
 */
export function logDebug(message, data = null, context = '') {
    const prefix = context ? `[${context}] ` : '';
    if (data) {
    
    } else {

    }
}

/**
 * Log de erro estruturado
 * @param {string} message - Mensagem de erro
 * @param {Error} error - Objeto de erro
 * @param {string} context - Contexto do erro
 */
export function logError(message, error = null, context = '') {
    const prefix = context ? `[${context}] ` : '';
    if (error) {

    } else {

    }
}

/**
 * Log de aviso estruturado
 * @param {string} message - Mensagem de aviso
 * @param {*} data - Dados para log
 * @param {string} context - Contexto do aviso
 */
export function logWarning(message, data = null, context = '') {
    const prefix = context ? `[${context}] ` : '';
    if (data) {

    } else {

    }
}

// ========================================
// FUNÇÕES DE DOM
// ========================================

/**
 * Cria elemento HTML com classes e atributos
 * @param {string} tag - Tag HTML
 * @param {string} className - Classes CSS
 * @param {Object} attributes - Atributos HTML
 * @returns {HTMLElement} Elemento criado
 */
export function createElement(tag, className = '', attributes = {}) {
    const element = document.createElement(tag);
    
    if (className) {
        element.className = className;
    }
    
    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
    
    return element;
}

/**
 * Limpa conteúdo de um elemento
 * @param {string} elementId - ID do elemento
 */
export function clearElement(elementId) {
    const element = validateElement(elementId);
    if (element) {
        element.innerHTML = '';
    }
}

// ========================================
// FUNÇÕES DE DATA
// ========================================

/**
 * Obtém o mês atual no formato "25-MM"
 * @returns {string} Mês atual
 */
export function getCurrentMonth() {
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `25-${month}`;
}

/**
 * Verifica se o mês é futuro
 * @param {string} monthStr - String do mês no formato "25-MM"
 * @returns {boolean} True se o mês for futuro
 */
export function isFutureMonth(monthStr) {
    const currentMonth = getCurrentMonth();
    return monthStr > currentMonth;
}

/**
 * Converte string de data para objeto Date
 * @param {string} dateString - String de data
 * @returns {Date|null} Objeto Date ou null se inválido
 */
export function parseDate(dateString) {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
}

// ========================================
// FUNÇÕES DE ARRAY
// ========================================

/**
 * Remove duplicatas de um array
 * @param {Array} array - Array original
 * @returns {Array} Array sem duplicatas
 */
export function removeDuplicates(array) {
    if (!Array.isArray(array)) return [];
    return [...new Set(array)];
}

/**
 * Agrupa array por uma propriedade
 * @param {Array} array - Array a ser agrupado
 * @param {string} key - Propriedade para agrupamento
 * @returns {Object} Objeto com grupos
 */
export function groupBy(array, key) {
    if (!Array.isArray(array) || !key) return {};
    
    return array.reduce((groups, item) => {
        const group = item[key];
        if (!groups[group]) {
            groups[group] = [];
        }
        groups[group].push(item);
        return groups;
    }, {});
}

// ========================================
// FUNÇÕES DE VALIDAÇÃO DE FORMULÁRIO
// ========================================

/**
 * Valida se um campo está preenchido
 * @param {string} value - Valor do campo
 * @returns {boolean} True se válido
 */
export function validateRequired(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
}

/**
 * Valida formato de email
 * @param {string} email - Email a ser validado
 * @returns {boolean} True se válido
 */
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida formato de CPF
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} True se válido
 */
export function validateCPF(cpf) {
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    return cpfRegex.test(cpf);
}
