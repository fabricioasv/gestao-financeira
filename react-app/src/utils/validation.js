const ACCEPTED_EXTENSIONS = /\.(xlsx|xls)$/i;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function validateFile(file) {
    console.log('🚀 validateFile INICIADA');

    if (!file) {
        throw new Error('Nenhum arquivo informado.');
    }

    if (!ACCEPTED_EXTENSIONS.test(file.name)) {
        throw new Error('Formato inválido. Envie um arquivo .xlsx ou .xls.');
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new Error('Arquivo maior que 10MB. Escolha um arquivo menor.');
    }

    return true;
}

function validateArray(value) {
    return Array.isArray(value) && value.length > 0;
}

export { validateFile, validateArray };

