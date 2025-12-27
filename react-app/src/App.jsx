import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { UploadArea } from './components/UploadArea.jsx';
import { SummaryCards } from './components/SummaryCards.jsx';
import { DataTable } from './components/DataTable.jsx';
import { StatusBanner } from './components/StatusBanner.jsx';
import { InvestmentChart } from './components/InvestmentChart.jsx';
import { FinancialChart } from './components/FinancialChart.jsx';
import { ActionsTable } from './components/ActionsTable.jsx';
import { ProventosChart } from './components/ProventosChart.jsx';
import { CartaoChart } from './components/CartaoChart.jsx';
import { parseWorkbook } from './utils/parsing.js';
import { logDebug, logError, logSuccess } from './utils/logging.js';
import { fetchConsolidado, fetchProventos, fetchCartaoDetalhe, fetchAcoesCarteira } from './services/api.js';
import { transformConsolidado, transformProventos, transformCartaoDetalhe, transformAcoesCarteira } from './services/transformers.js';

const DEFAULT_DATA_URL = `${import.meta.env.BASE_URL}dados.xlsx`;

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
            // Tentar carregar da API primeiro
            console.log('📡 Tentando carregar dados da API...');
            
            // Carregar todas as abas em paralelo
            const [consolidadoData, proventosData, cartaoDetalheData, acoesCarteiraData] = await Promise.all([
                fetchConsolidado(),
                fetchProventos(),
                fetchCartaoDetalhe(),
                fetchAcoesCarteira(),
            ]);

            const parsedConsolidado = transformConsolidado(consolidadoData);
            const parsedProventos = transformProventos(proventosData);
            const parsedCartaoDetalhe = transformCartaoDetalhe(cartaoDetalheData);
            const parsedAcoesCarteira = transformAcoesCarteira(acoesCarteiraData);

            // Combinar dados
            const parsed = {
                ...parsedConsolidado,
                proventos: parsedProventos,
                cartaoDetalhe: parsedCartaoDetalhe,
                stocks: parsedAcoesCarteira,
            };

            handleParsedData(parsed, 'API Azure Function');
            setStatus({
                type: 'success',
                message: 'Dados carregados da API. Conectado ao Google Sheets em tempo real.',
            });
            logSuccess('✅ Dados carregados da API');
        } catch (apiError) {
            console.warn('⚠️ API indisponível, tentando arquivo local:', apiError.message);
            
            // Fallback para arquivo Excel local
            try {
                const response = await fetch(DEFAULT_DATA_URL);
                if (!response.ok) {
                    throw new Error(`Falha ao baixar dados padrão (HTTP ${response.status})`);
                }

                const buffer = await response.arrayBuffer();
                const parsed = parseWorkbook(buffer);

                handleParsedData(parsed, 'dados.xlsx (offline)');
                setStatus({
                    type: 'warning',
                    message: 'API indisponível. Dados carregados do arquivo local.',
                });
                logSuccess('✅ Dados padrão carregados (fallback)');
            } catch (error) {
                logError('❌ Erro ao carregar dados', error);
                setStatus({
                    type: 'error',
                    message: 'Não foi possível carregar os dados. Verifique se a API está rodando.',
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFile = async (file) => {
        console.log('🚀 handleFile INICIADA');
        setStatus({
            type: 'info',
            message: `Processando ${file.name}...`,
        });
        setLoading(true);

        try {
            const buffer = await file.arrayBuffer();
            const parsed = parseWorkbook(buffer);
            handleParsedData(parsed, file.name);
            setStatus({
                type: 'success',
                message: `Arquivo ${file.name} processado com sucesso.`,
            });
            logSuccess('✅ Upload concluído', { name: file.name });
        } catch (error) {
            logError('❌ Erro ao processar arquivo', error);
            setStatus({
                type: 'error',
                message: 'Não foi possível processar o arquivo. Confirme se é um Excel válido.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleParsedData = (parsed, sourceLabel) => {
        logDebug('🔍 Atualizando estado com dados da planilha', parsed);
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
                        className={`nav-item ${activeMenu === 'demais' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('demais')}
                    >
                        Demais
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
                        className={`nav-item ${activeMenu === 'cartao' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('cartao')}
                    >
                        Cartão
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
                                        <p className="muted small">Carregando planilha padrão...</p>
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
                                        <p className="muted small">Aguardando planilha...</p>
                                    )}
                                </div>
                            </div>
                        </header>

                        <ActionsTable headers={stocks.headers} rows={stocks.rows} />
                        <ProventosChart
                            years={proventos.years}
                            months={proventos.months}
                            valuesByYear={proventos.valuesByYear}
                        />
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
                                        <p className="muted small">Aguardando planilha...</p>
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
                                <h1>Nova interface React para a sua planilha</h1>
                                <p className="muted">
                                    Faça upload do Excel (dados.xlsx) para interpretar os dados e visualizá-los
                                    rapidamente. Os valores são calculados no navegador, sem depender do backend.
                                </p>
                                <div className="hero-badges">
                                    <span className="pill">Upload Excel</span>
                                    <span className="pill secondary">Processamento local</span>
                                    <span className="pill neutral">
                                        {lastUpdate ? 'Dados prontos' : 'Aguardando planilha'}
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
                                        <p className="muted small">Carregando planilha padrão...</p>
                                    )}
                                </div>
                            </div>
                        </header>

                        <StatusBanner status={status} loading={loading} lastUpdate={lastUpdate} />

                        <UploadArea onFileSelected={handleFile} loading={loading} />

                        <SummaryCards totals={totals} months={months} rowCount={rows.length} />

                        <DataTable rows={rows} months={months} />
                    </div>
                )}
            </main>
        </div>
    );
}

export { App };
