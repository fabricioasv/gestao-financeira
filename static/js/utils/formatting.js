/* ========================================
   SISTEMA DE GESTÃO FINANCEIRA PESSOAL
   ========================================
   Arquivo: utils/formatting.js
   Descrição: Módulo de funções de formatação
   ======================================== */

// ========================================
// FUNÇÕES DE FORMATAÇÃO
// ========================================

/**
 * Formata um valor monetário para o padrão brasileiro
 * @param {number} value - Valor a ser formatado
 * @param {number} decimals - Número de casas decimais (padrão: 2)
 * @returns {string} Valor formatado como "R$ X,XX"
 */
export function formatCurrency(value, decimals = 2) {
    if (typeof value !== 'number' || isNaN(value)) {
        return 'R$ 0,00';
    }
    
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Formata um valor percentual para o padrão brasileiro
 * @param {number} value - Valor a ser formatado (0.15 = 15%)
 * @param {number} decimals - Número de casas decimais (padrão: 2)
 * @returns {string} Valor formatado como "X,XX%"
 */
export function formatPercentage(value, decimals = 2) {
    if (typeof value !== 'number' || isNaN(value)) {
        return '0,00%';
    }
    
    return (value * 100).toLocaleString('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }) + '%';
}

/**
 * Formata um número para o padrão brasileiro
 * @param {number} value - Valor a ser formatado
 * @param {number} decimals - Número de casas decimais (padrão: 0)
 * @returns {string} Valor formatado como "X,XX"
 */
export function formatNumber(value, decimals = 0) {
    if (typeof value !== 'number' || isNaN(value)) {
        return '0';
    }
    
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Formata uma data para o padrão brasileiro
 * @param {string|Date} date - Data a ser formatada
 * @param {string} format - Formato desejado ('short', 'long', 'month')
 * @returns {string} Data formatada
 */
export function formatDate(date, format = 'short') {
    if (!date) return '';
    
    let dateObj;
    if (typeof date === 'string') {
        dateObj = new Date(date);
    } else if (date instanceof Date) {
        dateObj = date;
    } else {
        return '';
    }
    
    if (isNaN(dateObj.getTime())) {
        return '';
    }
    
    switch (format) {
        case 'long':
            return dateObj.toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        
        case 'month':
            return dateObj.toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric'
            });
        
        case 'short':
        default:
            return dateObj.toLocaleDateString('pt-BR');
    }
}

/**
 * Formata um nome de mês para português
 * @param {number} month - Número do mês (1-12)
 * @param {string} format - Formato desejado ('full', 'short')
 * @returns {string} Nome do mês formatado
 */
export function formatMonth(month, format = 'full') {
    const monthNames = {
        full: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
               'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
        short: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    };
    
    if (month < 1 || month > 12) {
        return '';
    }
    
    return monthNames[format][month - 1] || '';
}

// ========================================
// EXPORTAÇÕES
// ========================================
