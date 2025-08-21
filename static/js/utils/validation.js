/* ========================================
   SISTEMA DE GESTÃO FINANCEIRA PESSOAL
   ========================================
   Arquivo: utils/validation.js
   Descrição: Módulo de funções de validação
   ======================================== */

// ========================================
// FUNÇÕES DE VALIDAÇÃO
// ========================================

/**
 * Valida se um elemento DOM existe
 * @param {string} elementId - ID do elemento
 * @param {string} context - Contexto da função chamadora
 * @returns {HTMLElement|null} Elemento DOM ou null se não encontrado
 */
export function validateElement(elementId, context) {
    const element = document.getElementById(elementId);
    
    if (!element) {
        console.error(`❌ Elemento com ID '${elementId}' não encontrado no contexto: ${context}`);
        return null;
    }
    
    return element;
}

/**
 * Valida se um valor é um array válido
 * @param {*} value - Valor a ser validado
 * @param {string} context - Contexto da validação
 * @returns {boolean} True se for um array válido
 */
export function validateArray(value, context) {
    if (!Array.isArray(value)) {
        console.error(`❌ Valor não é um array no contexto: ${context}`, value);
        return false;
    }
    
    if (value.length === 0) {
        console.warn(`⚠️ Array vazio no contexto: ${context}`);
        return false;
    }
    
    return true;
}

/**
 * Valida se um valor é um objeto válido
 * @param {*} value - Valor a ser validado
 * @param {string} context - Contexto da validação
 * @returns {boolean} True se for um objeto válido
 */
export function validateObject(value, context) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        console.error(`❌ Valor não é um objeto válido no contexto: ${context}`, value);
        return false;
    }
    
    return true;
}

/**
 * Valida se uma string não está vazia
 * @param {string} value - String a ser validada
 * @param {string} context - Contexto da validação
 * @returns {boolean} True se a string for válida
 */
export function validateString(value, context) {
    if (!value || typeof value !== 'string' || value.trim() === '') {
        console.error(`❌ String inválida ou vazia no contexto: ${context}`, value);
        return false;
    }
    
    return true;
}

// ========================================
// EXPORTAÇÕES
// ========================================
