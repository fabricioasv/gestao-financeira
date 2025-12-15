function StatusBanner({ status, loading, lastUpdate }) {
    const type = loading ? 'info' : status?.type || 'info';
    const message =
        loading && status?.message
            ? status.message
            : status?.message || 'Pronto para receber uma planilha Excel.';

    return (
        <div className={`status-banner ${type}`}>
            <div>
                <p className="eyebrow">Status</p>
                <p className="status-message">{message}</p>
                {lastUpdate && (
                    <p className="muted small">
                        Última atualização: {lastUpdate.source} em{' '}
                        {lastUpdate.at.toLocaleString('pt-BR')}
                    </p>
                )}
            </div>
            {loading && <span className="pill neutral">Processando...</span>}
            {!loading && lastUpdate && <span className="pill secondary">Dados prontos</span>}
        </div>
    );
}

export { StatusBanner };

