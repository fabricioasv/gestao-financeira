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
        console.log(`🔧 Nível de logging alterado para: ${level}`);
    } else {
        console.warn(`⚠️ Nível de logging inválido: ${level}. Usando padrão: ${currentLogLevel}`);
    }
}

/**
 * Habilita ou desabilita o logging
 * @param {boolean} enable - True para habilitar, false para desabilitar
 */
export function setLoggingEnabled(enable) {
    enableLogging = enable;
    console.log(`🔧 Logging ${enable ? 'habilitado' : 'desabilitado'}`);
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
        console.log(`🔍 ${prefix}${message}`, data);
    } else {
        console.log(`🔍 ${prefix}${message}`);
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
        console.log(`ℹ️ ${prefix}${message}`, data);
    } else {
        console.log(`ℹ️ ${prefix}${message}`);
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
        console.warn(`⚠️ ${prefix}${message}`, data);
    } else {
        console.warn(`⚠️ ${prefix}${message}`);
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
        console.error(`❌ ${prefix}${message}`, data);
    } else {
        console.error(`❌ ${prefix}${message}`);
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
        console.log(`✅ ${prefix}${message}`, data);
    } else {
        console.log(`✅ ${prefix}${message}`);
    }
}

// ========================================
// EXPORTAÇÕES
// ========================================
