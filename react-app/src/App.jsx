import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { SummaryCards } from './components/SummaryCards.jsx';
import { DataTable } from './components/DataTable.jsx';
import { StatusBanner } from './components/StatusBanner.jsx';
import { InvestmentChart } from './components/InvestmentChart.jsx';
import { FinancialChart } from './components/FinancialChart.jsx';
import { ActionsTable } from './components/ActionsTable.jsx';
import { ProventosChart } from './components/ProventosChart.jsx';
import { CartaoChart } from './components/CartaoChart.jsx';
import { FollowUpChart } from './components/FollowUpChart.jsx';
import { MesAtualView } from './components/MesAtualView.jsx';
import { AllocationChart } from './components/AllocationChart.jsx';
import { RendaProjetivaView } from './components/RendaProjetivaView.jsx';
import { logDebug, logError, logSuccess } from './utils/logging.js';
import { fetchConsolidado, fetchProventos, fetchCartaoDetalhe, fetchAcoesCarteira, fetchRendaProjetiva, fetchNetoInvest, fetchFollowUp, fetchAtual } from './services/api.js';
import { transformConsolidado, transformProventos, transformCartaoDetalhe, transformAcoesCarteira } from './services/transformers.js';

function App() {
    const [rows, setRows] = useState([]);
    const [months, setMonths] = useState([]);
    const [totals, setTotals] = useState({});
    const [investments, setInvestments] = useState({ labels: [], series: [] });
    const [financial, setFinancial] = useState({
        labels: [],
        credits: [],
        debits: [],
        consolidated: [],
    });
    const [stocks, setStocks] = useState({ headers: [], rows: [] });
    const [proventos, setProventos] = useState({ years: [], months: [], valuesByYear: {} });
    const [cartaoDetalhe, setCartaoDetalhe] = useState({ entries: [] });
    const [rendaAnualEsperada, setRendaAnualEsperada] = useState(null);
    const [rendaProjetiva, setRendaProjetiva] = useState([]);
    const [netoInvest, setNetoInvest] = useState({ headers: [], rows: [] });
    const [followUp, setFollowUp] = useState([]);
    const [atual, setAtual] = useState([]);
    const [status, setStatus] = useState({
        type: 'info',
        message: 'Carregando dados padrão...',
    });
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [activeMenu, setActiveMenu] = useState('dashboard');

    useEffect(() => {
        loadDefaultData();
    }, []);

    const totalGeral = useMemo(() => {
        return months.reduce((acc, month) => acc + (totals[month] ?? 0), 0);
    }, [months, totals]);

    const loadDefaultData = async () => {
        console.log('🚀 loadDefaultData INICIADA');
        setLoading(true);
        try {
            console.log('📡 Carregando dados da API...');
            
            // Carregar todas as abas em paralelo
            const [consolidadoData, proventosData, cartaoDetalheData, acoesCarteiraData, rendaProjetivaData, netoInvestData, followUpData, atualData] = await Promise.all([
                fetchConsolidado(),
                fetchProventos(),
                fetchCartaoDetalhe(),
                fetchAcoesCarteira(),
                fetchRendaProjetiva(),
                fetchNetoInvest(),
                fetchFollowUp(),
                fetchAtual(),
            ]);

            const parsedConsolidado = transformConsolidado(consolidadoData);
            const parsedProventos = transformProventos(proventosData);
            const parsedCartaoDetalhe = transformCartaoDetalhe(cartaoDetalheData);
            const parsedAcoesCarteira = transformAcoesCarteira(acoesCarteiraData);

            // Extrair renda anual esperada da renda projetiva
            const rendaAnualRow = rendaProjetivaData?.find(
                (row) => row['Dividendo por ação'] === 'Renda anual esperada'
            );
            const rendaAnual = rendaAnualRow?.['Renda anual esperada'] ?? null;
            
            // Guardar todos os dados de renda projetiva
            const parsedRendaProjetiva = rendaProjetivaData || [];

            // Transformar Neto-Invest (similar ao Ações-Carteira)
            const parsedNetoInvest = {
                headers: netoInvestData?.length > 0 ? Object.keys(netoInvestData[0]) : [],
                rows: netoInvestData || [],
            };

            // Combinar dados
            const parsed = {
                ...parsedConsolidado,
                proventos: parsedProventos,
                cartaoDetalhe: parsedCartaoDetalhe,
                stocks: parsedAcoesCarteira,
                rendaAnualEsperada: rendaAnual,
                rendaProjetiva: parsedRendaProjetiva,
                netoInvest: parsedNetoInvest,
                followUp: followUpData || [],
                atual: atualData || [],
            };

            handleParsedData(parsed, 'API Azure Function');
            setStatus({
                type: 'success',
                message: 'Dados carregados da API. Conectado ao Google Sheets em tempo real.',
            });
            logSuccess('✅ Dados carregados da API');
        } catch (error) {
            logError('❌ Erro ao carregar dados da API', error);
            setStatus({
                type: 'error',
                message: `Erro ao carregar dados: ${error.message}. Verifique se a API está rodando.`,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleParsedData = (parsed, sourceLabel) => {
        logDebug('🔍 Atualizando estado com dados da API', parsed);
        setRows(parsed.rows);
        setMonths(parsed.months);
        setTotals(parsed.totals);
        setInvestments(parsed.investments || { labels: [], series: [] });
        setFinancial(
            parsed.financial || {
                labels: [],
                credits: [],
                debits: [],
                consolidated: [],
            },
        );
        setStocks(parsed.stocks || { headers: [], rows: [] });
        setProventos(parsed.proventos || { years: [], months: [], valuesByYear: {} });
        setCartaoDetalhe(parsed.cartaoDetalhe || { entries: [] });
        setRendaAnualEsperada(parsed.rendaAnualEsperada ?? null);
        setRendaProjetiva(parsed.rendaProjetiva || []);
        setNetoInvest(parsed.netoInvest || { headers: [], rows: [] });
        setFollowUp(parsed.followUp || []);
        setAtual(parsed.atual || []);
        setLastUpdate({
            source: sourceLabel,
            at: new Date(),
        });
    };

    return (
        <div className="layout">
            <aside className="sidebar">
                <div className="brand">
                    <div className="logo-dot" />
                    <div>
                        <p className="eyebrow">Gestão</p>
                        <strong>Financeira</strong>
                    </div>
                </div>
                <nav className="nav">
                    <button
                        type="button"
                        className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('dashboard')}
                    >
                        Dashboard
                    </button>
                    <button
                        type="button"
                        className={`nav-item ${activeMenu === 'mes-atual' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('mes-atual')}
                    >
                        Mês atual
                    </button>
                    <button
                        type="button"
                        className={`nav-item ${activeMenu === 'cartao' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('cartao')}
                    >
                        Cartão
                    </button>
                    <button
                        type="button"
                        className={`nav-item ${activeMenu === 'investimentos' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('investimentos')}
                    >
                        Investimentos
                    </button>
                    <button
                        type="button"
                        className={`nav-item ${activeMenu === 'neto-invest' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('neto-invest')}
                    >
                        Neto Invest
                    </button>
                    <button
                        type="button"
                        className={`nav-item ${activeMenu === 'follow-up' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('follow-up')}
                    >
                        Follow Up
                    </button>
                    <button
                        type="button"
                        className={`nav-item ${activeMenu === 'demais' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('demais')}
                    >
                        Demais
                    </button>
                </nav>
            </aside>

            <main className="content">
                {activeMenu === 'dashboard' ? (
                    <div className="page">
                        <header className="hero">
                            <div className="hero-text">
                                <p className="eyebrow">Dashboard</p>
                                <h1>Investimentos (barras empilhadas)</h1>
                                <p className="muted">
                                    Linhas 27 a 32 da aba Consolidado: Ações, Renda Fixa, Previdência,
                                    Cripto, TD IPCA+7.91% e Apartamento, por mês.
                                </p>
                            </div>
                            <div className="hero-meta">
                                <div className="meta-card">
                                    <p className="eyebrow">Total geral</p>
                                    <p className="meta-value">
                                        {totalGeral.toLocaleString('pt-BR', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </p>
                                    {lastUpdate ? (
                                        <p className="muted small">
                                            Atualizado por {lastUpdate.source} em{' '}
                                            {lastUpdate.at.toLocaleString('pt-BR')}
                                        </p>
                                    ) : (
                                        <p className="muted small">Carregando dados...</p>
                                    )}
                                </div>
                </div>
                        </header>
                        <InvestmentChart labels={investments.labels} series={investments.series} />
                        <FinancialChart
                            labels={financial.labels}
                            credits={financial.credits}
                            debits={financial.debits}
                            consolidated={financial.consolidated}
                        />
                    </div>
                ) : activeMenu === 'investimentos' ? (
                    <div className="page">
                        <header className="hero">
                            <div className="hero-text">
                                <p className="eyebrow">Investimentos</p>
                                <h1>Ações e Proventos</h1>
                                <p className="muted">
                                    Consulte a tabela da aba Ações-Carteira e o gráfico filtrável da aba
                                    Proventos.
                                </p>
                            </div>
                            <div className="hero-meta">
                                <div className="meta-card">
                                    <p className="eyebrow">Atualização</p>
                                    {lastUpdate ? (
                                        <p className="muted small">
                                            {lastUpdate.source} em {lastUpdate.at.toLocaleString('pt-BR')}
                                        </p>
                                    ) : (
                                        <p className="muted small">Aguardando dados...</p>
                                    )}
                                </div>
                            </div>
                        </header>

                        <AllocationChart labels={investments.labels} series={investments.series} />
                        <ActionsTable headers={stocks.headers} rows={stocks.rows} />
                        <ProventosChart
                            years={proventos.years}
                            months={proventos.months}
                            valuesByYear={proventos.valuesByYear}
                            rendaAnualEsperada={rendaAnualEsperada}
                        />
                        <RendaProjetivaView data={rendaProjetiva} />
                    </div>
                ) : activeMenu === 'neto-invest' ? (
                    <div className="page">
                        <header className="hero">
                            <div className="hero-text">
                                <p className="eyebrow">Neto Invest</p>
                                <h1>Dados de Investimento Líquido</h1>
                                <p className="muted">
                                    Dados da aba Neto-Invest do Google Sheets.
                                </p>
                            </div>
                            <div className="hero-meta">
                                <div className="meta-card">
                                    <p className="eyebrow">Atualização</p>
                                    {lastUpdate ? (
                                        <p className="muted small">
                                            {lastUpdate.source} em {lastUpdate.at.toLocaleString('pt-BR')}
                                        </p>
                                    ) : (
                                        <p className="muted small">Aguardando dados...</p>
                                    )}
                                </div>
                            </div>
                        </header>

                        <div className="panel">
                            <div className="panel-header">
                                <div>
                                    <p className="eyebrow">Neto Invest</p>
                                    <h3>Tabela de Dados</h3>
                                    <p className="muted small">Dados da aba Neto-Invest.</p>
                                </div>
                                <span className="pill">{netoInvest.rows.length} registros</span>
                            </div>
                            {netoInvest.rows.length > 0 ? (
                                (() => {
                                    // Tickers em carteira
                                    const tickersEmCarteira = new Set(stocks.rows.map(r => r['Ticker']));
                                    
                                    // Ordenar por "Margem de segurança" (maior para menor)
                                    const sortedRows = [...netoInvest.rows].sort((a, b) => {
                                        const margemA = parseFloat(a['Margem de segurança']) || 0;
                                        const margemB = parseFloat(b['Margem de segurança']) || 0;
                                        return margemB - margemA; // Decrescente
                                    });

                                    return (
                                        <div className="table-wrapper">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        {netoInvest.headers.map((h) => (
                                                            <th key={h || 'col'}>{h || '-'}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sortedRows.map((row, idx) => {
                                                        // Na Neto-Invest a coluna é "Código", na carteira é "Ticker"
                                                        const codigo = row['Código'];
                                                        const emCarteira = tickersEmCarteira.has(codigo);
                                                        return (
                                                            <tr 
                                                                key={idx}
                                                                style={emCarteira ? { 
                                                                    backgroundColor: 'rgba(29, 78, 216, 0.15)',
                                                                    borderLeft: '3px solid #1d4ed8'
                                                                } : {}}
                                                            >
                                                                {netoInvest.headers.map((h, colIdx) => (
                                                                    <td key={`${idx}-${colIdx}`}>
                                                                        {row[h] !== undefined ? String(row[h]) : '-'}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    );
                                })()
                            ) : (
                                <p className="muted small" style={{ padding: '1rem' }}>
                                    Nenhum dado encontrado. Verifique a aba Neto-Invest na planilha.
                                </p>
                            )}
                        </div>
                    </div>
                ) : activeMenu === 'follow-up' ? (
                    <div className="page">
                        <header className="hero">
                            <div className="hero-text">
                                <p className="eyebrow">Follow Up</p>
                                <h1>Acompanhamento Financeiro</h1>
                                <p className="muted">
                                    Acompanhamento dos valores acumulados, base e valores reais ao longo do tempo.
                                </p>
                            </div>
                            <div className="hero-meta">
                                <div className="meta-card">
                                    <p className="eyebrow">Atualização</p>
                                    {lastUpdate ? (
                                        <p className="muted small">
                                            {lastUpdate.source} em {lastUpdate.at.toLocaleString('pt-BR')}
                                        </p>
                                    ) : (
                                        <p className="muted small">Aguardando dados...</p>
                                    )}
                                </div>
                            </div>
                        </header>

                        <FollowUpChart data={followUp} />
                    </div>
                ) : activeMenu === 'mes-atual' ? (
                    <div className="page">
                        <header className="hero">
                            <div className="hero-text">
                                <p className="eyebrow">Mês Atual</p>
                                <h1>Controle do mês</h1>
                                <p className="muted">
                                    Informações consolidadas, créditos e débitos do mês atual.
                                </p>
                            </div>
                            <div className="hero-meta">
                                <div className="meta-card">
                                    <p className="eyebrow">Atualização</p>
                                    {lastUpdate ? (
                                        <p className="muted small">
                                            {lastUpdate.source} em {lastUpdate.at.toLocaleString('pt-BR')}
                                        </p>
                                    ) : (
                                        <p className="muted small">Aguardando dados...</p>
                                    )}
                                </div>
                            </div>
                        </header>

                        <MesAtualView data={atual} />
                    </div>
                ) : activeMenu === 'cartao' ? (
                    <div className="page">
                        <header className="hero">
                            <div className="hero-text">
                                <p className="eyebrow">Cartão</p>
                                <h1>Detalhe por fatura</h1>
                                <p className="muted">
                                    Gráfico de barras empilhadas por grupo com linha de total, usando a aba
                                    Cartão-Detalhe.
                                </p>
                            </div>
                            <div className="hero-meta">
                                <div className="meta-card">
                                    <p className="eyebrow">Atualização</p>
                                    {lastUpdate ? (
                                        <p className="muted small">
                                            {lastUpdate.source} em {lastUpdate.at.toLocaleString('pt-BR')}
                                        </p>
                                    ) : (
                                        <p className="muted small">Aguardando dados...</p>
                                    )}
                                </div>
                            </div>
                        </header>
                        <CartaoChart entries={cartaoDetalhe.entries} />
                    </div>
                ) : (
                    <div className="page">
                        <header className="hero">
                            <div className="hero-text">
                                <p className="eyebrow">Gestão Financeira</p>
                                <h1>Dashboard Financeiro</h1>
                                <p className="muted">
                                    Dados carregados em tempo real do Google Sheets via API Azure Function.
                                </p>
                                <div className="hero-badges">
                                    <span className="pill">Google Sheets</span>
                                    <span className="pill secondary">API em tempo real</span>
                                    <span className="pill neutral">
                                        {lastUpdate ? 'Dados prontos' : 'Carregando...'}
                                    </span>
                                </div>
                            </div>
                            <div className="hero-meta">
                                <div className="meta-card">
                                    <p className="eyebrow">Total geral</p>
                                    <p className="meta-value">
                                        {totalGeral.toLocaleString('pt-BR', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </p>
                                    {lastUpdate ? (
                                        <p className="muted small">
                                            Atualizado por {lastUpdate.source} em{' '}
                                            {lastUpdate.at.toLocaleString('pt-BR')}
                                        </p>
                                    ) : (
                                        <p className="muted small">Carregando dados...</p>
                                    )}
                                </div>
                            </div>
                        </header>

                        <StatusBanner status={status} loading={loading} lastUpdate={lastUpdate} />

                        <SummaryCards totals={totals} months={months} rowCount={rows.length} />

                        <DataTable rows={rows} months={months} />
                    </div>
                )}
            </main>
        </div>
    );
}

export { App };
