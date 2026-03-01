import { useMemo } from 'react';

export function MesAtualView({ data }) {
    // Separar os dados por TIPO
    const { consolidado, credito, debito } = useMemo(() => {
        if (!data || data.length === 0) {
            return { consolidado: [], credito: [], debito: [] };
        }

        const consolidado = [];
        const credito = [];
        const debito = [];

        data.forEach((row) => {
            const tipo = row['Tipo']?.trim().toLowerCase();
            
            if (tipo === 'consolidado') {
                consolidado.push(row);
            } else if (tipo === 'crédito') {
                credito.push(row);
            } else if (tipo === 'débito') {
                debito.push(row);
            }
        });

        return { consolidado, credito, debito };
    }, [data]);

    // Função para formatar valores monetários
    const formatCurrency = (value) => {
        if (value === null || value === undefined || value === '') return '-';
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue)) return '-';
        return numValue.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    };

    // Função para renderizar uma tabela
    const renderTable = (rows, title, showMesAnt = false) => {
        if (rows.length === 0) return null;

        const headers = Object.keys(rows[0]);

        return (
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>{title}</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                                {headers.map((header) => (
                                    <th
                                        key={header}
                                        style={{
                                            padding: '0.75rem',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            fontSize: '0.875rem',
                                            color: '#475569',
                                        }}
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => {
                                const isQuitado = row['Quitado'] && row['Quitado'] !== '' && row['Quitado'] !== '-';
                                const isMesAnt = showMesAnt && row['Descrição']?.includes('Mês Ant.');
                                
                                return (
                                    <tr
                                        key={idx}
                                        style={{
                                            borderBottom: '1px solid #e2e8f0',
                                            backgroundColor: isMesAnt
                                                ? 'rgba(251, 191, 36, 0.1)'
                                                : isQuitado
                                                ? 'rgba(34, 197, 94, 0.1)'
                                                : 'transparent',
                                            borderLeft: isMesAnt
                                                ? '3px solid #f59e0b'
                                                : isQuitado
                                                ? '3px solid #22c55e'
                                                : 'none',
                                        }}
                                    >
                                        {headers.map((header) => {
                                            const value = row[header];
                                            const isMoneyColumn =
                                                header === 'Valor' || header === 'Quitado';
                                            
                                            return (
                                                <td
                                                    key={header}
                                                    style={{
                                                        padding: '0.75rem',
                                                        fontSize: '0.875rem',
                                                        color: '#1e293b',
                                                    }}
                                                >
                                                    {isMoneyColumn ? formatCurrency(value) : value || '-'}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div>
            {renderTable(consolidado, 'Consolidado')}
            {renderTable(credito, 'Crédito', true)}
            {renderTable(debito, 'Débito')}
        </div>
    );
}
