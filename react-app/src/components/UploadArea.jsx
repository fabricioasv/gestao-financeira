import { useCallback, useRef, useState } from 'react';
import { logDebug, logError } from '../utils/logging.js';
import { validateFile } from '../utils/validation.js';

function UploadArea({ onFileSelected, loading }) {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState('');

    const processFile = useCallback(
        (file) => {
            logDebug('🔍 processFile INICIADA', file ? { name: file.name, size: file.size } : {});
            if (!file) return;

            try {
                validateFile(file);
                setError('');
                onFileSelected(file);
            } catch (err) {
                setError(err.message);
                logError('❌ Arquivo inválido', err);
            }
        },
        [onFileSelected],
    );

    const handleInputChange = (event) => {
        const file = event.target.files?.[0];
        processFile(file);
        event.target.value = '';
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer.files?.[0];
        processFile(file);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    return (
        <div
            className={`upload-area ${dragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="upload-body">
                <p className="eyebrow">Upload da planilha</p>
                <h2>Arraste o Excel ou clique para selecionar</h2>
                <p className="muted">
                    Formatos aceitos: .xlsx e .xls. Tamanho máximo: 10MB. Os dados são lidos no
                    próprio navegador.
                </p>
                <div className="upload-actions">
                    <button
                        type="button"
                        className="btn primary"
                        onClick={() => inputRef.current?.click()}
                        disabled={loading}
                    >
                        {loading ? 'Processando...' : 'Selecionar arquivo'}
                    </button>
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleInputChange}
                        className="hidden-input"
                        aria-label="Selecione o arquivo Excel"
                    />
                    <span className="pill neutral">Ou solte o arquivo aqui</span>
                </div>
                {error && <p className="error-text">{error}</p>}
            </div>
        </div>
    );
}

export { UploadArea };

