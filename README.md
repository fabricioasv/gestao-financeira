# Sistema de Gestão Financeira Pessoal

Sistema web simples para visualização e análise de dados financeiros pessoais baseado em planilhas Excel com múltiplas abas.

## 🚀 Funcionalidades

- **Upload de Planilhas Excel**: Suporte para arquivos .xlsx e .xls com múltiplas abas
- **Interface com Abas**: Dashboard e Tabela de Dados separados
- **Gráfico Consolidado**: Crédito vs Débitos Realizado/Previsto vs Consolidado mensal
- **Gráfico Cartão**: Gastos com cartão por instituição + [C] Cartão para meses futuros
- **Gráfico Investimento**: Evolução dos investimentos por tipo (stacked) + Previdência Privada
- **Painel de Ações**: Visualização detalhada da carteira de ações com métricas de rendimento
- **Interface Responsiva**: Design moderno com Bootstrap
- **Drag & Drop**: Upload intuitivo de arquivos
- **Diferenciação Temporal**: Meses futuros em cinza (dados previstos)

## 📋 Requisitos

- Python 3.7+
- pip (gerenciador de pacotes Python)

## 🛠️ Instalação

1. **Clone ou baixe o projeto**
2. **Instale as dependências**:
   ```bash
   pip install -r requirements.txt
   ```

## 🚀 Como Executar

1. **Inicie a aplicação**:
   ```bash
   python app.py
   ```

2. **Acesse no navegador**:
   ```
   http://localhost:5000
   ```

## 📊 Estrutura dos Dados

O sistema espera planilhas Excel com **duas abas**:

### Aba "Consolidado" (anteriormente "Sheet1")
| Alias | Id | 25-01 | 25-02 | 25-03 | ... | 25-12 |
|-------|----|-------|-------|-------|-----|-------|
| Créditos Realizado | Créditos | 0.00 | 0.01 | 0.00 | ... | 0.00 |
| Débitos Realizado | Débitos | -0.02 | 0.00 | 0.00 | ... | 0.00 |
| Débitos Previsto | Débitos | 0.00 | 0.00 | 0.00 | ... | 0.00 |
| Investimento Ações | Investimento | 0.00 | 0.00 | 0.00 | ... | 0.00 |
| Investimento Renda Fixa | Investimento | 0.00 | 0.00 | 0.00 | ... | 0.00 |
| Previdência Privada | Investimento | 0.00 | 0.00 | 0.00 | ... | 0.00 |
| [C] Cartão | Cartão | 0.00 | 0.00 | 0.00 | ... | 0.00 |
| Salário Fabrício Previsto | Salário | 17051.99 | 17020.99 | ... | ... |

### Aba "Ações"
| Ticker | Qtd | Renda Esperada | Dividend Yield Pago |
|--------|-----|----------------|---------------------|
| PETR4 | 100 | 150.00 | 120.00 |
| VALE3 | 200 | 300.00 | 280.00 |
| ITUB4 | 150 | 225.00 | 200.00 |

### Colunas Esperadas:
- **Aba Consolidado**:
  - **Alias**: Nome da categoria financeira
  - **Id**: Identificador da categoria
  - **25-XX**: Valores mensais (onde XX = 01 a 12)

- **Aba Ações**:
  - **Ticker**: Código da ação
  - **Qtd**: Quantidade de ações
  - **Renda Esperada**: Renda esperada da ação
  - **Dividend Yield Pago**: Dividend yield efetivamente pago

## 🎯 Categorias Suportadas

### Receitas (Crédito Realizado):
- Créditos Realizado
- Salários Realizado
- Investimentos Realizado

### Despesas:
- **Débitos Realizado**: Para meses passados
- **Débitos Previsto**: Para meses futuros (maior que o mês atual)
- Cartão dti Realizado
- Porto Bank Realizado
- Sicredi Realizado
- BTG Realizado

### Investimentos:
- **Investimento Ações**: Categorias que contêm "Investimento" e "Ações"
- **Investimento Renda Fixa**: Categorias que contêm "Investimento" e "Renda Fixa"
- **Investimento Cripto**: Categorias que contêm "Investimento" e "Cripto"
- **Previdência Privada**: Categorias que contêm "Previdência Privada"

### Cartão:
- **Cartão dti Realizado**: Para meses passados e atual
- **Sicredi Realizado**: Para meses passados e atual
- **Porto Bank Realizado**: Para meses passados e atual
- **BTG Realizado**: Para meses passados e atual
- **[C] Cartão**: Para meses futuros (em cinza)

### Ativos:
- Apto. 7L AJS

## 📈 Gráficos e Painéis Disponíveis

### 1. Consolidado
- **Crédito Realizado**: Valores de receitas por mês (barras verdes)
- **Débitos Realizado**: Valores de despesas para meses passados (barras vermelhas)
- **Débitos Previsto**: Valores previstos para meses futuros (barras cinzas)
- **[C] Consolidado**: Saldo mensal (linha azul)

### 2. Cartão
- **Meses passados e atual**: Dados realizados por instituição (stacked)
  - Cartão dti Realizado
  - Sicredi Realizado
  - Porto Bank Realizado
  - BTG Realizado
- **Meses futuros**: [C] Cartão consolidado (barra cinza)

### 3. Investimento
- **Investimento Ações**: Evolução dos investimentos em ações (stacked)
- **Investimento Renda Fixa**: Evolução dos investimentos em renda fixa (stacked)
- **Previdência Privada**: Evolução dos investimentos em previdência (stacked)
- **Barras Stacked (100%)**: Visualização comparativa por tipo de investimento

### 4. Carteira de Ações (Novo!)
- **Tabela detalhada** com:
  - Ticker da ação
  - Quantidade de ações
  - Renda Esperada (em verde)
  - Dividend Yield Pago (em azul)
  - **Resultado** = Renda Esperada - Dividend Yield Pago (verde se positivo, vermelho se negativo)
- **Resumo consolidado**:
  - Total de ações
  - Renda total esperada
  - Resultado total

## 🕒 Lógica Temporal

### Meses Passados e Atual:
- Usa dados **"Realizado"**
- Exibidos em cores normais (verde para receitas, vermelho para despesas)

### Meses Futuros (maior que o mês atual):
- **Consolidado**: Usa dados **"Previsto"** (barras cinzas)
- **Cartão**: Usa **[C] Cartão** consolidado (barra cinza)
- **Investimento**: Mantém dados realizados (se disponíveis)
- **Tabela**: Valores em cinza e itálico para diferenciação visual

## 🔧 Personalização

### Modificar Categorias
Edite a função `process_excel_data()` em `app.py` para ajustar:
- Categorias de crédito (receitas)
- Categorias de débito (despesas)  
- Categorias de cartão
- Categorias de investimento
- Estrutura da aba "Ações"

### Adicionar Novos Gráficos
1. Crie nova função de gráfico em `templates/index.html`
2. Adicione elemento canvas HTML
3. Integre com os dados processados

### Adicionar Novas Abas
1. Atualize `process_excel_data()` para ler a nova aba
2. Crie função de visualização correspondente
3. Integre na interface

## 📁 Estrutura do Projeto

```
FinancasPessoais/
├── app.py                 # Aplicação Flask com suporte a múltiplas abas
├── templates/
│   └── index.html        # Interface principal com abas e painel de ações
├── uploads/              # Pasta para arquivos enviados
├── dados.xlsx            # Arquivo de exemplo com abas "Consolidado" e "Ações"
├── requirements.txt      # Dependências Python
└── README.md            # Esta documentação
```

## 🐛 Solução de Problemas

### Erro de Upload
- Verifique se o arquivo é Excel (.xlsx ou .xls)
- Confirme se as abas "Consolidado" e "Ações" existem
- Verifique se a estrutura das colunas está correta
- Verifique se o arquivo não está aberto em outro programa

### Gráficos Não Aparecem
- Verifique se o JavaScript está habilitado
- Confirme se Chart.js está carregando
- Verifique o console do navegador para erros

### Dados Não Carregam
- Verifique se o arquivo `dados.xlsx` existe
- Confirme se as abas têm os nomes corretos ("Consolidado" e "Ações")
- Verifique se há dados válidos nas células

### Painel de Ações Vazio
- Confirme se a aba "Ações" existe no arquivo
- Verifique se as colunas "Ticker", "Qtd", "Renda Esperada" e "Dividend Yield Pago" estão presentes
- Confirme se há dados válidos nas células

### Problemas na Tabela
- A tabela agora tem colunas fixas (Categoria e ID) para melhor navegação
- Use a barra de rolagem horizontal para ver todos os meses
- Colunas fixas permanecem visíveis durante a rolagem

## 🔒 Segurança

- Apenas arquivos Excel são aceitos
- Nomes de arquivo são sanitizados
- Uploads são limitados à pasta `uploads/`

## 📝 Licença

Este projeto é de uso pessoal e educacional.

## 🤝 Contribuições

Sugestões e melhorias são bem-vindas!

---

**Desenvolvido para gestão financeira pessoal eficiente e visual.**
