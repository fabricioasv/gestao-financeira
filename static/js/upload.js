/* ========================================
   SISTEMA DE GESTÃO FINANCEIRA PESSOAL
   ========================================
   Arquivo: upload.js
   Descrição: Funcionalidades de upload e drag & drop
   ======================================== */

import { logDebug, logError } from './utils.js';

// ========================================
// VARIÁVEIS GLOBAIS
// ========================================
let uploadArea = null;
let fileInput = null;

// ========================================
// INICIALIZAÇÃO
// ========================================

/**
 * Inicializa as funcionalidades de upload
 */
export function initUpload() {
    logDebug('Inicializando funcionalidades de upload');
    
    uploadArea = document.getElementById('uploadArea');
    fileInput = document.getElementById('fileInput');
    
    if (!uploadArea || !fileInput) {
        logError('Elementos de upload não encontrados', null, 'upload.js');
        return;
    }
    
    setupDragAndDrop();
    setupFileInput();
    
    logDebug('Funcionalidades de upload inicializadas com sucesso');
}

// ========================================
// CONFIGURAÇÃO DE DRAG AND DROP
// ========================================

/**
 * Configura as funcionalidades de drag and drop
 */
function setupDragAndDrop() {
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    logDebug('Eventos de drag and drop configurados');
}

/**
 * Manipula o evento dragover
 * @param {DragEvent} e - Evento de drag
 */
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
    logDebug('Arquivo sendo arrastado sobre a área de upload');
}

/**
 * Manipula o evento dragleave
 * @param {DragEvent} e - Evento de drag
 */
function handleDragLeave(e) {
    uploadArea.classList.remove('dragover');
    logDebug('Arquivo saiu da área de upload');
}

/**
 * Manipula o evento drop
 * @param {DragEvent} e - Evento de drop
 */
function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    logDebug(`Arquivo(s) solto(s): ${files.length} arquivo(s)`);
    
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

// ========================================
// CONFIGURAÇÃO DO INPUT DE ARQUIVO
// ========================================

/**
 * Configura o input de arquivo
 */
function setupFileInput() {
    fileInput.addEventListener('change', handleFileInputChange);
    logDebug('Input de arquivo configurado');
}

/**
 * Manipula a mudança no input de arquivo
 * @param {Event} e - Evento de change
 */
function handleFileInputChange(e) {
    if (e.target.files.length > 0) {
        logDebug('Arquivo selecionado via input');
        handleFile(e.target.files[0]);
    }
}

// ========================================
// MANIPULAÇÃO DE ARQUIVOS
// ========================================

/**
 * Manipula o arquivo selecionado
 * @param {File} file - Arquivo selecionado
 */
function handleFile(file) {
    logDebug('Processando arquivo', { name: file.name, size: file.size, type: file.type });
    
    if (!validateFile(file)) {
        return;
    }
    
    uploadFile(file);
}

/**
 * Valida o arquivo selecionado
 * @param {File} file - Arquivo a ser validado
 * @returns {boolean} True se válido
 */
function validateFile(file) {
    // Validar extensão
    if (!file.name.match(/\.(xlsx|xls)$/)) {
        logError('Tipo de arquivo inválido', { name: file.name, type: file.type }, 'upload.js');
        alert('Por favor, selecione um arquivo Excel válido (.xlsx ou .xls)');
        return false;
    }
    
    // Validar tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        logError('Arquivo muito grande', { size: file.size, maxSize }, 'upload.js');
        alert('O arquivo é muito grande. Tamanho máximo: 10MB');
        return false;
    }
    
    logDebug('Arquivo validado com sucesso');
    return true;
}

/**
 * Faz upload do arquivo para o servidor
 * @param {File} file - Arquivo a ser enviado
 */
function uploadFile(file) {
    logDebug('Iniciando upload do arquivo');
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Mostrar indicador de carregamento
    showUploadProgress(true);
    
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        showUploadProgress(false);
        logDebug('Upload concluído com sucesso', data);
        
        if (data.success) {
            handleUploadSuccess(data);
        } else {
            handleUploadError(data.error);
        }
    })
    .catch(error => {
        showUploadProgress(false);
        logError('Erro durante upload', error, 'upload.js');
        handleUploadError(error.message);
    });
}

// ========================================
// MANIPULAÇÃO DE RESPOSTAS
// ========================================

/**
 * Manipula sucesso no upload
 * @param {Object} data - Dados retornados pelo servidor
 */
function handleUploadSuccess(data) {
    logDebug('Upload bem-sucedido, processando dados');
    
    // Disparar evento customizado para notificar outros módulos
    const event = new CustomEvent('uploadSuccess', { detail: data });
    document.dispatchEvent(event);
    
    // Mostrar mensagem de sucesso
    showMessage('Arquivo processado com sucesso!', 'success');
}

/**
 * Manipula erro no upload
 * @param {string} error - Mensagem de erro
 */
function handleUploadError(error) {
    logError('Erro no upload', { error }, 'upload.js');
    
    // Disparar evento customizado para notificar outros módulos
    const event = new CustomEvent('uploadError', { detail: { error } });
    document.dispatchEvent(event);
    
    // Mostrar mensagem de erro
    showMessage(`Erro ao processar arquivo: ${error}`, 'error');
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Mostra/esconde indicador de progresso
 * @param {boolean} show - True para mostrar
 */
function showUploadProgress(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        if (show) {
            loadingIndicator.classList.add('show');
        } else {
            loadingIndicator.classList.remove('show');
        }
    }
}

/**
 * Mostra mensagem para o usuário
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo da mensagem (success, error, warning, info)
 */
function showMessage(message, type = 'info') {
    // Criar elemento de mensagem
    const messageElement = document.createElement('div');
    messageElement.className = `alert alert-${type} alert-dismissible fade show`;
    messageElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Inserir no início da página
    const container = document.querySelector('.container-fluid');
    if (container) {
        container.insertBefore(messageElement, container.firstChild);
        
        // Remover automaticamente após 5 segundos
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 5000);
    }
}

// ========================================
// FUNÇÕES PÚBLICAS
// ========================================

/**
 * Abre o seletor de arquivo
 */
export function openFileSelector() {
    if (fileInput) {
        fileInput.click();
    }
}

/**
 * Limpa a área de upload
 */
export function clearUploadArea() {
    if (uploadArea) {
        uploadArea.classList.remove('dragover');
    }
    if (fileInput) {
        fileInput.value = '';
    }
}

/**
 * Verifica se há arquivo sendo processado
 * @returns {boolean} True se há upload em andamento
 */
export function isUploading() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    return loadingIndicator && loadingIndicator.classList.contains('show');
}
