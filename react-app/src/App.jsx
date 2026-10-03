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
import { InvestmentPlanChart } from './components/InvestmentPlanChart.jsx';
import { InvestmentBenchmarkChart } from './components/InvestmentBenchmarkChart.jsx';
import { RendaProjetivaView } from './components/RendaProjetivaView.jsx';
import { logError } from './utils/logging.js';
import { fetchConsolidado, fetchProventos, fetchCartaoDetalhe, fetchAcoesCarteira, fetchRendaProjetiva, fetchNetoInvest, fetchFollowUp, fetchAtual } from './services/api.js';
import { transformConsolidado, transformProventos, transformCartaoDetalhe, transformAcoesCarteira } from './services/transformers.js';

const WALLET_TABS = [
    { id: 'resumo', label: 'Resumo' },
    { id: 'posicoes', label: 'Posições' },
    { id: 'proventos', label: 'Proventos' },
    { id: 'patrimonio', label: 'Patrimônio' },
    { id: 'rentabilidade', label: 'Rentabilidade' },
    { id: 'lancamentos', label: 'Lançamentos' },
];

function getCell(row, keys) {
    const foundKey = keys.find((key) => Object.prototype.hasOwnProperty.call(row, key));
    return foundKey ? row[foundKey] : undefined;
}

function App() {
    const [rows, setRows] = useState([]);
    const [months, setMonths] = useState([]);
    const [totals, setTotals] = useState({});
    const [investments, setInvestments] = useState({ labels: [], series: [], cashFlows: null });
    const [financial, setFinancial] = useState({
        labels: [],
        credits: [],
        redemptionPlanned: [],
        redemptionRealized: [],
        debits: [],
        investmentRealized: [],
        investmentPlanned: [],
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
    const [activeMenu, setActiveMenu] = useState('resumo');

    useEffect(() => {
        loadDefaultData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const totalGeral = useMemo(() => {
        const now = new Date();
        const currentMonth = `${String(now.getFullYear()).slice(-2)}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const currentMonthIndex = investments.labels.indexOf(currentMonth);

        if (currentMonthIndex === -1) return 0;

        return investments.series.reduce(
            (sum, item) => sum + (item.values[currentMonthIndex] ?? 0),
            0,
        );
    }, [investments]);

    const carteiraStats = useMemo(() => {
        const ultimoMes = investments.labels.at(-1) || months.at(-1) || '-';
        const ativos = stocks.rows.length;
        const classes = investments.series.filter((item) => !item.label?.toLowerCase().includes('apartamento')).length;
        const anosProventos = proventos.years.length;

        return [
            { label: 'Patrimônio total', value: totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
            { label: 'Ativos em carteira', value: String(ativos) },
            { label: 'Classes acompanhadas', value: String(classes) },
            { label: 'Último período', value: ultimoMes },
            { label: 'Histórico de proventos', value: anosProventos ? `${anosProventos} anos` : '-' },
        ];
    }, [investments, months, proventos.years.length, stocks.rows.length, totalGeral]);

    const loadDefaultData = async () => {
        setLoading(true);
        try {
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

            const rendaAnualRow = rendaProjetivaData?.find(
                (row) => row['Dividendo por ação'] === 'Renda anual esperada' || row['Dividendo por aÃ§Ã£o'] === 'Renda anual esperada',
            );
            const rendaAnual = rendaAnualRow?.['Renda anual esperada'] ?? null;

            const parsedNetoInvest = {
                headers: netoInvestData?.length > 0 ? Object.keys(netoInvestData[0]) : [],
                rows: netoInvestData || [],
            };

            const parsed = {
                ...parsedConsolidado,
                proventos: parsedProventos,
                cartaoDetalhe: parsedCartaoDetalhe,
                stocks: parsedAcoesCarteira,
                rendaAnualEsperada: rendaAnual,
                rendaProjetiva: rendaProjetivaData || [],
                netoInvest: parsedNetoInvest,
                followUp: followUpData || [],
                atual: atualData || [],
            };

            handleParsedData(parsed, 'API Azure Function');
            setStatus({
                type: 'success',
                message: 'Dados carregados da API. Conectado ao Google Sheets em tempo real.',
            });
        } catch (error) {
            logError('Erro ao carregar dados da API', error);
            setStatus({
                type: 'error',
                message: `Erro ao carregar dados: ${error.message}. Verifique se a API está rodando.`,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleParsedData = (parsed, sourceLabel) => {
        setRows(parsed.rows);
        setMonths(parsed.months);
        setTotals(parsed.totals);
        setInvestments(parsed.investments || { labels: [], series: [], cashFlows: null });
        setFinancial(
            parsed.financial || {
                labels: [],
                credits: [],
                redemptionPlanned: [],
                redemptionRealized: [],
                debits: [],
                investmentRealized: [],
                investmentPlanned: [],
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

    const renderNetoInvest = () => {
        const tickersEmCarteira = new Set(stocks.rows.map((row) => getCell(row, ['Ticker', 'Código', 'CÃ³digo'])));
        const sortedRows = [...netoInvest.rows].sort((a, b) => {
            const margemA = parseFloat(getCell(a, ['Margem de segurança', 'Margem de seguranÃ§a'])) || 0;
            const margemB = parseFloat(getCell(b, ['Margem de segurança', 'Margem de seguranÃ§a'])) || 0;
            return margemB - margemA;
        });

        return (
            <div className="panel">
                <div className="panel-header">
                    <div>
                        <p className="eyebrow">Radar</p>
                        <h3>Neto Invest</h3>
                        <p className="muted small">Lista de acompanhamento e comparação com ativos da carteira.</p>
                    </div>
                    <span className="pill">{netoInvest.rows.length} registros</span>
                </div>
                {netoInvest.rows.length > 0 ? (
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
                                    const codigo = getCell(row, ['Código', 'CÃ³digo']);
                                    const emCarteira = tickersEmCarteira.has(codigo);
                                    return (
                                        <tr key={idx} className={emCarteira ? 'highlight-row' : ''}>
                                            {netoInvest.headers.map((h, colIdx) => (
                                                <td key={`${idx}-${colIdx}`}>{row[h] !== undefined ? String(row[h]) : '-'}</td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="muted small table-empty">Nenhum dado encontrado. Verifique a aba Neto-Invest na planilha.</p>
                )}
            </div>
        );
    };

    return (
        <div className="wallet-layout">
            <header className="site-header">
                <div className="site-header-inner">
                    <div className="brand">
                        <div className="logo-mark">10</div>
                        <div>
                            <p className="eyebrow">Carteira pública</p>
                            <strong>Gestão Financeira</strong>
                        </div>
                    </div>
                    <div className="header-actions">
                        <span className="sync-pill">{lastUpdate ? 'Atualizado' : 'Carregando'}</span>
                        <button type="button" className="btn primary" onClick={loadDefaultData}>
                            Recarregar
                        </button>
                    </div>
                </div>
            </header>

            <main className="content">
                <section className="wallet-hero">
                    <div>
                        <p className="eyebrow">Minha carteira</p>
                        <h1>Gestão Financeira</h1>
                        <p className="muted">
                            Acompanhamento visual da carteira, posições, proventos, patrimônio,
                            rentabilidade e lançamentos com dados do Google Sheets.
                        </p>
                    </div>
                    <div className="wallet-total">
                        <span>Patrimônio total</span>
                        <strong>{totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                        <small>
                            {lastUpdate
                                ? `${lastUpdate.source} em ${lastUpdate.at.toLocaleString('pt-BR')}`
                                : 'Aguardando dados'}
                        </small>
                    </div>
                </section>

                <nav className="wallet-tabs" aria-label="Seções da carteira">
                    {WALLET_TABS.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className={`wallet-tab ${activeMenu === item.id ? 'active' : ''}`}
                            onClick={() => setActiveMenu(item.id)}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                <section className="page">
                    {activeMenu === 'resumo' ? (
                        <>
                            <StatusBanner status={status} loading={loading} lastUpdate={lastUpdate} />
                            <div className="metric-grid">
                                {carteiraStats.map((item) => (
                                    <div className="metric-card" key={item.label}>
                                        <span>{item.label}</span>
                                        <strong>{item.value}</strong>
                                    </div>
                                ))}
                            </div>
                            <InvestmentChart labels={investments.labels} series={investments.series} title="Evolução da carteira" />
                            <FinancialChart
                                labels={financial.labels}
                                credits={financial.credits}
                                redemptionRealized={financial.redemptionRealized}
                                debits={financial.debits}
                                investmentRealized={financial.investmentRealized}
                                consolidated={financial.consolidated}
                            />
                        </>
                    ) : activeMenu === 'posicoes' ? (
                        <>
                            <AllocationChart labels={investments.labels} series={investments.series} excludeLabels={['Apartamento']} />
                            <ActionsTable headers={stocks.headers} rows={stocks.rows} />
                            {renderNetoInvest()}
                        </>
                    ) : activeMenu === 'proventos' ? (
                        <>
                            <ProventosChart
                                years={proventos.years}
                                months={proventos.months}
                                valuesByYear={proventos.valuesByYear}
                                rendaAnualEsperada={rendaAnualEsperada}
                            />
                            <RendaProjetivaView data={rendaProjetiva} acoesCarteira={stocks.rows} />
                        </>
                    ) : activeMenu === 'patrimonio' ? (
                        <>
                            <InvestmentChart labels={investments.labels} series={investments.series} title="Patrimônio consolidado" />
                            <SummaryCards totals={totals} months={months} rowCount={rows.length} />
                            <DataTable rows={rows} months={months} />
                        </>
                    ) : activeMenu === 'rentabilidade' ? (
                        <>
                            <InvestmentBenchmarkChart labels={investments.labels} series={investments.series} cashFlows={investments.cashFlows} />
                            <InvestmentPlanChart
                                labels={financial.labels}
                                investmentPlanned={financial.investmentPlanned}
                                investmentRealized={financial.investmentRealized}
                                redemptionPlanned={financial.redemptionPlanned}
                                redemptionRealized={financial.redemptionRealized}
                            />
                            <FollowUpChart data={followUp} />
                        </>
                    ) : (
                        <>
                            <MesAtualView data={atual} />
                            <CartaoChart entries={cartaoDetalhe.entries} />
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}

export { App };
