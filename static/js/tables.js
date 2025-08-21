/* ========================================
   SISTEMA DE GESTÃO FINANCEIRA PESSOAL
   ========================================
   Arquivo: tables.js
   Descrição: Módulo de funcionalidades de tabelas
   ======================================== */

import { validateElement, logDebug, logError } from './utils.js';

// ========================================
// FUNÇÕES DE TABELAS
// ========================================

/**
 * Cria a tabela financeira principal
 * @param {Object} tableData - Dados da tabela
 * @param {Array} months - Lista de meses
 */
function createFinancialTable(tableData, months) {
    logDebug('createFinancialTable chamada com:', tableData, months);
    
    const tableBody = validateElement('tableBody', 'createFinancialTable');
    const thead = document.querySelector('#financialTable thead tr');
    
    if (!tableBody || !thead) {
        logError('Elementos da tabela financeira não encontrados');
        return;
    }
    
    // Limpar cabeçalhos existentes (exceto Categoria e ID)
    const existingHeaders = thead.querySelectorAll('th');
    for (let i = 2; i < existingHeaders.length; i++) {
        existingHeaders[i].remove();
    }
    
    // Adicionar cabeçalhos dos meses
    months.forEach(month => {
        const th = document.createElement('th');
        th.setAttribute('scope', 'col');
        th.className = 'text-center';
        th.style.minWidth = '100px';
        
        if (isFutureMonth(month)) {
            th.classList.add('month-future');
        }
        
        th.textContent = month;
        thead.appendChild(th);
    });
    
    // Limpar o corpo da tabela
    tableBody.innerHTML = '';
    
    // Criar linhas da tabela
    tableData.forEach(row => {
        const tr = document.createElement('tr');
        
        // Célula da categoria
        const tdCategory = document.createElement('td');
        tdCategory.innerHTML = `<span class="badge bg-secondary">${row.alias}</span>`;
        tr.appendChild(tdCategory);
        
        // Célula do ID
        const tdId = document.createElement('td');
        tdId.innerHTML = `<small class="text-muted">${row.id}</small>`;
        tr.appendChild(tdId);
        
        // Células dos meses
        months.forEach(month => {
            const td = document.createElement('td');
            td.className = 'text-end';
            
            const value = row.months[month];
            let valueClass = '';
            if (value > 0) valueClass = 'text-success fw-bold';
            else if (value < 0) valueClass = 'text-danger fw-bold';
            else valueClass = 'text-muted';
            
            if (isFutureMonth(month)) {
                td.classList.add('month-future');
                // Remover classes de cor para meses futuros para manter consistência
                td.className = 'text-end month-future';
            } else {
                if (valueClass) td.className += ' ' + valueClass;
            }
            
            td.textContent = `R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
            tr.appendChild(td);
        });
        
        tableBody.appendChild(tr);
    });
}

/**
 * Cria a tabela de ações no dashboard
 * @param {Array} acoesData - Dados das ações
 */
function createAcoesTableDashboard(acoesData) {
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
                <td colspan="11" class="text-center text-muted">
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
                <td class="text-end text-success">R$ ${(acao.div_esperado_2025 || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td class="text-end text-success">R$ ${acao.renda_esperada.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td class="text-end text-primary">R$ ${(acao.capital_atual || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td class="text-end text-info">${(acao.dividend_yield_esperado || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}%</td>
                <td class="text-end text-warning">R$ ${(acao.dividend_yield_pago || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td class="text-end text-secondary">${((acao.proporcao_hoje || 0) * 100).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}%</td>
                <td class="text-end text-dark">${(acao.meta_28k || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td class="text-end text-dark">${(acao.meta_1_ano || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td class="text-end text-dark">${(acao.meta_qtd_2033 || 0).toLocaleString('pt-BR')}</td>
            </tr>
        `;
    }).join('');
}

/**
 * Cria a tabela de proventos
 * @param {Array} proventosData - Dados de proventos
 * @param {string} filterType - Tipo de filtro aplicado
 */
function createProventosTable(proventosData, filterType = 'desde-inicio') {
    logDebug('createProventosTable chamada com:', proventosData, filterType);
    
    const tableBody = validateElement('proventosTableBody', 'createProventosTable');
    
    if (!tableBody) {
        logError('Elemento proventosTableBody não encontrado');
        return;
    }
    
    // Aplicar filtro atual
    const filteredData = filterProventosData(proventosData, filterType);
    logDebug('Dados filtrados de proventos:', filteredData);
    logDebug('Quantidade de anos após filtro:', filteredData.length);
    
    tableBody.innerHTML = '';
    
    filteredData.forEach(yearData => {
        
        const tr = document.createElement('tr');
        
        // Célula do ano
        const tdYear = document.createElement('td');
        tdYear.innerHTML = `<strong>${yearData.year}</strong>`;
        tr.appendChild(tdYear);
        
        // Células dos meses
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                           'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        
        monthNames.forEach(monthName => {
            const td = document.createElement('td');
            td.className = 'text-end';
            
            // Encontrar o valor do mês correspondente
            let monthValue = yearData.months[monthName] || 0;
            
            if (monthValue > 0) {
                td.className += ' text-success fw-bold';
            } else if (monthValue < 0) {
                td.className += ' text-danger fw-bold';
            } else {
                td.className += ' text-muted';
            }
            
            td.textContent = `R$ ${monthValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
            tr.appendChild(td);
        });
        
        // Célula do total
        const tdTotal = document.createElement('td');
        tdTotal.className = 'text-end fw-bold';
        if (yearData.total > 0) {
            tdTotal.className += ' text-success';
        } else if (yearData.total < 0) {
            tdTotal.className += ' text-danger';
        }
        tdTotal.textContent = `R$ ${yearData.total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        tr.appendChild(tdTotal);
        
        tableBody.appendChild(tr);
    });
}

/**
 * Cria a tabela de cartão detalhado
 * @param {Array} cartaoDetalheData - Dados detalhados do cartão
 */
function createCartaoDetalheTable(cartaoDetalheData) {
    logDebug('createCartaoDetalheTable chamada com:', cartaoDetalheData);
    
    const tableBody = validateElement('cartaoDetalheTableBody', 'createCartaoDetalheTable');
    if (!tableBody) {
        logError('Elemento cartaoDetalheTableBody não encontrado');
        return;
    }
    
    // Armazenar dados originais para filtros
    window.originalCartaoDetalheData = cartaoDetalheData;
    
    // Exibir todos os dados inicialmente
    displayFilteredCartaoDetalhe(cartaoDetalheData);
}

/**
 * Exibe dados filtrados do cartão detalhado
 * @param {Array} filteredData - Dados filtrados
 */
function displayFilteredCartaoDetalhe(filteredData) {
    const tableBody = validateElement('cartaoDetalheTableBody', 'displayFilteredCartaoDetalhe');
    if (!tableBody) {
        logError('Elemento cartaoDetalheTableBody não encontrado');
        return;
    }
    
    if (!filteredData || filteredData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    <i class="fas fa-info-circle me-2"></i>
                    Nenhum registro encontrado com os filtros aplicados.
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = filteredData.map(item => {
        const valorClass = item.valor > 0 ? 'text-danger' : 'text-success';
        return `
            <tr>
                <td><strong>${item.fatura}</strong></td>
                <td>${item.data}</td>
                <td>${item.estabelecimento_fmt || item.estabelecimento}</td>
                <td class="text-end ${valorClass}">R$ ${item.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td>${item.cartao}</td>
                <td><span class="badge bg-secondary">${item.grupo}</span></td>
            </tr>
        `;
    }).join('');
}

/**
 * Popula os filtros de cartão com dados dinâmicos
 * @param {Array} cartaoData - Dados do cartão
 * @param {Array} cartaoDetalheData - Dados detalhados do cartão
 */
function populateCartaoFilters(cartaoData, cartaoDetalheData) {
    console.log('🚀 populateCartaoFilters INICIADA');
    logDebug('populateCartaoFilters chamada com:', cartaoData, cartaoDetalheData);
    
    const filtroMes = document.getElementById('filtroMes');
    const filtroGrupo = document.getElementById('filtroGrupo');
    
    if (!filtroMes || !filtroGrupo) {
        logError('Elementos de filtro de cartão não encontrados');
        return;
    }
    
    // Limpar opções existentes
    filtroMes.innerHTML = '<option value="">Todos os meses</option>';
    filtroGrupo.innerHTML = '<option value="">Todas as categorias</option>';
    
    if (!cartaoDetalheData || cartaoDetalheData.length === 0) {
        logDebug('⚠️ Nenhum dado de cartão para popular filtros');
        return;
    }
    
    // Extrair meses únicos
    logDebug('🔍 Dados de cartão detalhado para extrair meses:', cartaoDetalheData);
    
    // Verificar formato da data
    if (cartaoDetalheData.length > 0) {
        logDebug('🔍 Exemplo de data do primeiro item:', cartaoDetalheData[0].data);
        logDebug('🔍 Formato da data:', typeof cartaoDetalheData[0].data);
    }
    
    const meses = [...new Set(cartaoDetalheData.map(item => {
        let mesExtraido = null;
        
        // Tentar diferentes formatos de data
        if (item.data && typeof item.data === 'string') {
            if (item.data.includes('/')) {
                // Formato DD/MM/YYYY
                mesExtraido = item.data.split('/')[1];
            } else if (item.data.includes('-')) {
                // Formato YYYY-MM-DD ou DD-MM-YYYY
                const parts = item.data.split('-');
                if (parts.length === 3) {
                    if (parts[0].length === 4) {
                        // YYYY-MM-DD
                        mesExtraido = parts[1];
                    } else {
                        // DD-MM-YYYY
                        mesExtraido = parts[1];
                    }
                }
            } else if (item.data.length === 8) {
                // Formato DDMMYYYY
                mesExtraido = item.data.substring(2, 4);
            } else if (item.data.length === 6) {
                // Formato MMYYYY
                mesExtraido = item.data.substring(0, 2);
            }
        }
        
        logDebug('🔍 Item:', item.data, 'Mês extraído:', mesExtraido);
        return mesExtraido;
    }))].filter(mes => mes !== null).sort();
    
    logDebug('🔍 Meses únicos extraídos:', meses);
    
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    meses.forEach(mes => {
        // Validar se o mês é um número válido entre 1 e 12
        const mesNum = parseInt(mes);
        if (mesNum >= 1 && mesNum <= 12) {
            const option = document.createElement('option');
            option.value = mes;
            option.textContent = monthNames[mesNum - 1];
            filtroMes.appendChild(option);
            logDebug('🔍 Opção de mês criada:', mes, monthNames[mesNum - 1]);
        } else {
            logDebug('⚠️ Mês inválido ignorado:', mes, 'Valor:', mes, 'Tipo:', typeof mes);
        }
    });
    
    // Extrair grupos únicos
    const grupos = [...new Set(cartaoDetalheData.map(item => item.grupo))].sort();
    
    grupos.forEach(grupo => {
        const option = document.createElement('option');
        option.value = grupo;
        option.textContent = grupo;
        filtroGrupo.appendChild(option);
    });
    
    logDebug('✅ Filtros de cartão populados com sucesso');
    
    // Log final para debug
    console.log('🔍 Filtro de mês populado com opções:', filtroMes.options.length - 1, 'meses');
    console.log('🔍 Filtro de grupo populado com opções:', filtroGrupo.options.length - 1, 'grupos');
}

/**
 * Filtra a tabela de cartão detalhado baseado nos filtros selecionados
 */
function filtrarCartaoDetalhe() {
    logDebug('filtrarCartaoDetalhe chamada');
    
    const filtroMes = document.getElementById('filtroMes');
    const filtroGrupo = document.getElementById('filtroGrupo');
    
    if (!filtroMes || !filtroGrupo) {
        logError('Elementos de filtro de cartão não encontrados');
        return;
    }
    
    const mesSelecionado = filtroMes.value;
    const grupoSelecionado = filtroGrupo.value;
    
    logDebug('Filtros selecionados:', { mes: mesSelecionado, grupo: grupoSelecionado });
    
    // Obter dados originais
    const dadosOriginais = window.originalCartaoDetalheData || [];
    
    if (!dadosOriginais || dadosOriginais.length === 0) {
        logDebug('⚠️ Nenhum dado original para filtrar');
        return;
    }
    
    // Aplicar filtros
    let dadosFiltrados = dadosOriginais;
    
    logDebug('🔍 Aplicando filtros. Dados originais:', dadosOriginais.length);
    
    if (mesSelecionado) {
        logDebug('🔍 Aplicando filtro de mês:', mesSelecionado);
        dadosFiltrados = dadosFiltrados.filter(item => {
            let mesItem = null;
            
            // Usar a mesma lógica de extração de mês da função populateCartaoFilters
            if (item.data && typeof item.data === 'string') {
                if (item.data.includes('/')) {
                    // Formato DD/MM/YYYY
                    mesItem = item.data.split('/')[1];
                } else if (item.data.includes('-')) {
                    // Formato YYYY-MM-DD ou DD-MM-YYYY
                    const parts = item.data.split('-');
                    if (parts.length === 3) {
                        if (parts[0].length === 4) {
                            // YYYY-MM-DD
                            mesItem = parts[1];
                        } else {
                            // DD-MM-YYYY
                            mesItem = parts[1];
                        }
                    }
                } else if (item.data.length === 8) {
                    // Formato DDMMYYYY
                    mesItem = item.data.substring(2, 4);
                } else if (item.data.length === 6) {
                    // Formato MMYYYY
                    mesItem = item.data.substring(0, 2);
                }
            }
            
            logDebug('🔍 Filtrando item:', item.data, 'Mês extraído:', mesItem, 'Mês selecionado:', mesSelecionado);
            return mesItem === mesSelecionado;
        });
        logDebug('🔍 Após filtro de mês:', dadosFiltrados.length, 'itens');
    }
    
    if (grupoSelecionado) {
        dadosFiltrados = dadosFiltrados.filter(item => item.grupo === grupoSelecionado);
    }
    
    logDebug('Dados filtrados:', dadosFiltrados.length, 'de', dadosOriginais.length);
    
    // Exibir dados filtrados
    displayFilteredCartaoDetalhe(dadosFiltrados);
    
    // Atualizar gráfico se disponível
    if (dadosFiltrados.length > 0) {
        logDebug('🔍 Atualizando gráfico de cartão com dados filtrados');
        
        // Chamar função de atualização do gráfico (se existir)
        if (window.createCartaoCategoriaChart) {
            // Passar os dados originais do cartão para manter a estrutura esperada
            // mas filtrar apenas os grupos que estão nos dados filtrados
            const gruposFiltrados = [...new Set(dadosFiltrados.map(item => item.grupo))];
            
            // Obter dados originais do cartão (estrutura esperada pelo gráfico)
            const dadosOriginaisCartao = window.originalCartaoData || [];
            
            if (dadosOriginaisCartao.length > 0) {
                // Filtrar apenas os grupos que estão nos dados filtrados
                const dadosFiltradosParaGrafico = dadosOriginaisCartao.filter(item => 
                    gruposFiltrados.includes(item.grupo)
                );
                
                logDebug('🔍 Dados originais do cartão:', dadosOriginaisCartao);
                logDebug('🔍 Grupos filtrados:', gruposFiltrados);
                logDebug('🔍 Dados filtrados para gráfico:', dadosFiltradosParaGrafico);
                
                if (dadosFiltradosParaGrafico.length > 0) {
                    window.createCartaoCategoriaChart(dadosFiltradosParaGrafico);
                } else {
                    logDebug('⚠️ Nenhum grupo encontrado para atualizar gráfico');
                }
            } else {
                logDebug('⚠️ Dados originais do cartão não encontrados para atualizar gráfico');
            }
        } else {
            logDebug('⚠️ Função createCartaoCategoriaChart não encontrada globalmente');
        }
    }
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Função para obter o mês atual
 * @returns {string} Mês atual no formato "25-MM"
 */
function getCurrentMonth() {
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `25-${month}`;
}

/**
 * Função para verificar se o mês é futuro
 * @param {string} monthStr - String do mês no formato "25-MM"
 * @returns {boolean} True se o mês é futuro
 */
function isFutureMonth(monthStr) {
    const currentMonth = getCurrentMonth();
    return monthStr > currentMonth; // Maior que o mês atual (não igual)
}

/**
 * Filtra dados de proventos baseado no tipo de filtro
 * @param {Array} proventosData - Dados de proventos
 * @param {string} filterType - Tipo de filtro
 * @returns {Array} Dados filtrados
 */
function filterProventosData(proventosData, filterType) {
    logDebug('filterProventosData chamada com:', { proventosData, filterType });
    
    if (!proventosData || proventosData.length === 0) {
        logDebug('⚠️ Dados de proventos vazios ou inválidos');
        return [];
    }
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    logDebug('Ano e mês atuais:', { currentYear, currentMonth });
    
    let filteredData = [];
    
    switch (filterType) {
        case 'este-ano':
            filteredData = proventosData.filter(item => item.year === currentYear);
            logDebug('Filtro "este-ano" aplicado:', filteredData.length, 'anos encontrados');
            break;
        
        case 'ultimos-12-meses':
            // Para os últimos 12 meses, vamos mostrar os últimos 2 anos
            filteredData = proventosData.filter(item => 
                item.year >= currentYear - 1
            );
            logDebug('Filtro "ultimos-12-meses" aplicado:', filteredData.length, 'anos encontrados');
            break;
        
        case 'desde-inicio':
        default:
            filteredData = proventosData;
            logDebug('Filtro "desde-inicio" aplicado:', filteredData.length, 'anos encontrados');
            break;
    }
    
    logDebug('Resultado final do filtro:', filteredData);
    return filteredData;
}

// ========================================
// EXPORTAÇÕES
// ========================================
export {
    createFinancialTable,
    createAcoesTableDashboard,
    createProventosTable,
    createCartaoDetalheTable,
    displayFilteredCartaoDetalhe,
    populateCartaoFilters,
    filtrarCartaoDetalhe
};
