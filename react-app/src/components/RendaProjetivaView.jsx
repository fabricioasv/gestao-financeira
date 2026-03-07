import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

/**
 * Componente para exibir dados de renda projetiva
 * @param {Object} props
 * @param {Array} props.data - Dados da renda projetiva
 */
export function RendaProjetivaView({ data }) {
    console.log('🎯 RendaProjetivaView renderizado! data:', data);
    
    const { acoes, consolidado, evolucao } = useMemo(() => {
        console.log('🎯 useMemo executado! data.length:', data?.length);
        
        if (!data || data.length === 0) {
            console.log('⚠️ Sem dados!');
            return { acoes: [], consolidado: null, evolucao: [] };
        }


        // Separar ações dos dados consolidados e evolução
        const consolidadoKeys = [
            'Renda anual esperada',
            'Renda média mensal',
            'Patrimônio',
            'Dividend Yield esperado'
        ];

        const acoesData = [];
        const consolidadoData = {};
        const evolucaoData = [];

        data.forEach((row, idx) => {
            // PRIORIDADE 1: Verificar se tem Ticker (campo correto para ações)
            const ticker = row['Ticker'];
            const tickerStr = ticker != null ? String(ticker) : '';
            
            // Se tem ticker válido, é uma ação
            if (tickerStr.trim() !== '') {
                acoesData.push(row);
                return;
            }
            
            // PRIORIDADE 2: Verificar se é um consolidado pelo campo "Dividendo por ação"
            const dividendoField = row['Dividendo por ação'];
            const dividendoStr = dividendoField != null ? String(dividendoField) : '';
            
            if (consolidadoKeys.includes(dividendoStr)) {
                consolidadoData[dividendoStr] = row;
                return;
            }
            
            // PRIORIDADE 3: Verificar se é uma linha de evolução (tem campo "Ano")
            if (row['Ano'] != null && row['Ano'] !== '') {
                const ano = String(row['Ano']);
                // Ignorar se for um dos consolidados
                if (!consolidadoKeys.includes(ano)) {
                    evolucaoData.push(row);
                }
                return;
            }
        });

        console.log('✅ Resultado do useMemo:', {
            acoes: acoesData.length,
            consolidado: Object.keys(consolidadoData).length,
            evolucao: evolucaoData.length
        });
        
        return { acoes: acoesData, consolidado: consolidadoData, evolucao: evolucaoData };
    }, [data]);

    if (!data || data.length === 0) {
        return (
            <div className="panel">
                <div className="panel-header">
                    <div>
                        <p className="eyebrow">Renda Projetiva</p>
                        <h3>Projeção de Proventos</h3>
                        <p className="muted small">Renda esperada com base nas ações em carteira</p>
                    </div>
                </div>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p className="muted">Não há dados de renda projetiva disponíveis.</p>
                </div>
            </div>
        );
    }

    console.log('🎨 Renderizando componente final');
    console.log('   - acoes.length:', acoes.length);
    console.log('   - consolidado:', consolidado);
    console.log('   - Object.keys(consolidado).length:', consolidado ? Object.keys(consolidado).length : 0);

    return (
        <div className="panel">
            <div className="panel-header">
                <div>
                    <p className="eyebrow">Renda Projetiva</p>
                    <h3>Projeção de Proventos</h3>
                    <p className="muted small">Renda esperada com base nas ações em carteira</p>
                </div>
                <span className="pill">{acoes.length} ações</span>
            </div>

            {consolidado && Object.keys(consolidado).length > 0 ? (
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #1e293b' }}>
                    {console.log('✅ Renderizando DIV dos cards!')}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {consolidado['Renda anual esperada'] ? (
                            <>
                                {console.log('✅ Renderizando card Renda anual esperada')}
                                <div
                                    style={{
                                        padding: '1.25rem',
                                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                        borderLeft: '4px solid rgba(16, 185, 129, 0.8)',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                                    }}
                                >
                                    <p className="eyebrow" style={{ marginBottom: '0.5rem', color: '#6ee7b7' }}>
                                        Renda Anual Esperada
                                    </p>
                                    <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#10b981', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
                                        R${' '}
                                        {parseFloat(consolidado['Renda anual esperada']['Renda anual esperada'] || 0).toLocaleString('pt-BR', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </p>
                                </div>
                            </>
                        ) : null}

                        {consolidado['Renda média mensal'] ? (
                            <>
                            <div
                                style={{
                                    padding: '1.25rem',
                                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                    borderLeft: '4px solid rgba(59, 130, 246, 0.8)',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                                }}
                            >
                                <p className="eyebrow" style={{ marginBottom: '0.5rem', color: '#93c5fd' }}>
                                    Renda Média Mensal
                                </p>
                                <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#3b82f6', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
                                    R${' '}
                                    {parseFloat(consolidado['Renda média mensal']['Renda anual esperada'] || 0).toLocaleString('pt-BR', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </p>
                            </div>
                            </>
                        ) : null}

                        {consolidado['Patrimônio'] ? (
                            <>
                            <div
                                style={{
                                    padding: '1.25rem',
                                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(245, 158, 11, 0.3)',
                                    borderLeft: '4px solid rgba(245, 158, 11, 0.8)',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                                }}
                            >
                                <p className="eyebrow" style={{ marginBottom: '0.5rem', color: '#fcd34d' }}>
                                    Patrimônio
                                </p>
                                <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#f59e0b', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
                                    R${' '}
                                    {parseFloat(consolidado['Patrimônio']['Renda anual esperada'] || 0).toLocaleString('pt-BR', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </p>
                            </div>
                            </>
                        ) : null}

                        {consolidado['Dividend Yield esperado'] ? (
                            <>
                            <div
                                style={{
                                    padding: '1.25rem',
                                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(147, 51, 234, 0.1) 100%)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(168, 85, 247, 0.3)',
                                    borderLeft: '4px solid rgba(168, 85, 247, 0.8)',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                                }}
                            >
                                <p className="eyebrow" style={{ marginBottom: '0.5rem', color: '#c4b5fd' }}>
                                    Dividend Yield Esperado
                                </p>
                                <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#a855f7', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
                                    {parseFloat(consolidado['Dividend Yield esperado']['Renda anual esperada'] || 0).toFixed(2)}%
                                </p>
                            </div>
                            </>
                        ) : null}
                    </div>
                </div>
            ) : (
                <>
                    {console.log('⚠️ Condição dos cards é FALSE - não renderizando')}
                </>
            )}


            {acoes.length > 0 && (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Ticker</th>
                                <th style={{ textAlign: 'right' }}>Quantidade</th>
                                <th style={{ textAlign: 'right' }}>Dividendo por Ação</th>
                                <th style={{ textAlign: 'right' }}>Renda Anual Esperada</th>
                                <th style={{ textAlign: 'right' }}>Capital Alocado</th>
                                <th style={{ textAlign: 'right' }}>Dividend Yield</th>
                            </tr>
                        </thead>
                        <tbody>
                            {acoes.map((row, idx) => {
                                const ticker = row['Ticker'] || '';
                                const quantidade = parseFloat(row['Qtd. de ações'] || 0);
                                const dividendoPorAcao = parseFloat(row['Dividendo por ação'] || 0);
                                const rendaAnual = parseFloat(row['Renda anual esperada'] || 0);
                                const capitalAlocado = parseFloat(row['Capital alocado'] || 0);
                                const dividendYield = row['Dividend Yield'] || '';

                                return (
                                    <tr key={idx}>
                                        <td style={{ fontWeight: '600' }}>{ticker}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            {quantidade.toLocaleString('pt-BR', {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0,
                                            })}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            R${' '}
                                            {dividendoPorAcao.toLocaleString('pt-BR', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: '600', color: '#10b981' }}>
                                            R${' '}
                                            {rendaAnual.toLocaleString('pt-BR', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            R${' '}
                                            {capitalAlocado.toLocaleString('pt-BR', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>{dividendYield}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
