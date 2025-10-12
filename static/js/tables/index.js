/* ========================================
   SISTEMA DE GESTÃO FINANCEIRA PESSOAL
   ========================================
   Arquivo: tables/index.js
   Descrição: Exportador central dos módulos de tabelas
   ======================================== */

// Importar todos os módulos de tabelas
export { createFinancialTable } from './financial.js';
export { createProventosTable } from './proventos.js';
export { createCartaoDetalheTable, displayFilteredCartaoDetalhe } from './cartao.js';
export { createAcoesCarteiraTable } from './acoesCarteira.js';
