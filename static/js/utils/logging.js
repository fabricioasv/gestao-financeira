/* ========================================
   SISTEMA DE GESTÃO FINANCEIRA PESSOAL
   ========================================
   Arquivo: utils/logging.js
   Descrição: Módulo de funções de logging
   ======================================== */

// ========================================
// CONFIGURAÇÕES DE LOGGING
// ========================================
const LOG_LEVELS = {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error'
};

// Configuração padrão (pode ser alterada em runtime)
let currentLogLevel = LOG_LEVELS.DEBUG;
let enableLogging = true;

// ========================================
// FUNÇÕES DE LOGGING
// ========================================

/**
 * Define o nível de logging atual
 * @param {string} level - Nível de logging ('debug', 'info', 'warn', 'error')
 */
export function setLogLevel(level) {
    if (Object.values(LOG_LEVELS).includes(level)) {
        currentLogLevel = level;
    }
}

/**
 * Habilita ou desabilita o logging
 * @param {boolean} enable - True para habilitar, false para desabilitar
 */
export function setLoggingEnabled(enable) {
    enableLogging = enable;
}

/**
 * Função de debug com contexto opcional
 * @param {string} message - Mensagem de debug
 * @param {*} data - Dados opcionais para exibir
 * @param {string} context - Contexto opcional da função
 */
export function logDebug(message, data, context) {
    if (!enableLogging || currentLogLevel !== LOG_LEVELS.DEBUG) return;
    
    const prefix = context ? `[${context}] ` : '';
    if (data) {
        // Log silencioso para produção
    } else {
        // Log silencioso para produção
    }
}

/**
 * Função de informação com contexto opcional
 * @param {string} message - Mensagem de informação
 * @param {*} data - Dados opcionais para exibir
 * @param {string} context - Contexto opcional da função
 */
export function logInfo(message, data, context) {
    if (!enableLogging || !['info', 'warn', 'error'].includes(currentLogLevel)) return;
    
    const prefix = context ? `[${context}] ` : '';
    if (data) {
        // Log silencioso para produção
    } else {
        // Log silencioso para produção
    }
}

/**
 * Função de aviso com contexto opcional
 * @param {string} message - Mensagem de aviso
 * @param {*} data - Dados opcionais para exibir
 * @param {string} context - Contexto opcional da função
 */
export function logWarn(message, data, context) {
    if (!enableLogging || !['warn', 'error'].includes(currentLogLevel)) return;
    
    const prefix = context ? `[${context}] ` : '';
    if (data) {
        // Log silencioso para produção
    } else {
        // Log silencioso para produção
    }
}

/**
 * Função de erro com contexto opcional
 * @param {string} message - Mensagem de erro
 * @param {*} data - Dados opcionais para exibir
 * @param {string} context - Contexto opcional da função
 */
export function logError(message, data, context) {
    if (!enableLogging || currentLogLevel !== LOG_LEVELS.ERROR) return;
    
    const prefix = context ? `[${context}] ` : '';
    if (data) {
        // Log silencioso para produção
    } else {
        // Log silencioso para produção
    }
}

/**
 * Função de sucesso com contexto opcional
 * @param {string} message - Mensagem de sucesso
 * @param {*} data - Dados opcionais para exibir
 * @param {string} context - Contexto opcional da função
 */
export function logSuccess(message, data, context) {
    if (!enableLogging || !['info', 'warn', 'error'].includes(currentLogLevel)) return;
    
    const prefix = context ? `[${context}] ` : '';
    if (data) {
        // Log silencioso para produção
    } else {
        // Log silencioso para produção
    }
}

// ========================================
// EXPORTAÇÕES
// ========================================
