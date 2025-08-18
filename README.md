# Sistema de Gestão Financeira Pessoal

Sistema web simples para visualização e análise de dados financeiros pessoais baseado em planilhas Excel.

## 🚀 Funcionalidades

- **Upload de Planilhas Excel**: Suporte para arquivos .xlsx e .xls
- **Interface com Abas**: Dashboard e Tabela de Dados separados
- **Gráfico Consolidado**: Crédito vs Débitos Realizado/Previsto vs Consolidado mensal
- **Gráfico Cartão**: Gastos com cartão por instituição + [C] Cartão para meses futuros
- **Gráfico Investimento**: Evolução dos investimentos por tipo (stacked) + Previdência Privada
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

O sistema espera planilhas Excel com a seguinte estrutura:

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

### Colunas Esperadas:
- **Alias**: Nome da categoria financeira
- **Id**: Identificador da categoria
- **25-XX**: Valores mensais (onde XX = 01 a 12)

## 🎯 Categorias Suportadas

### Receitas (Crédito Realizado):
- Créditos Realizado
- Salários Realizado
- Investimentos Realizado

### Despesas:
- **Débitos Realizado**: Para meses passados
- **Débitos Previsto**: Para meses futuros (mês atual ou maior)
- Cartão dti Realizado
- Porto Bank Realizado
- Sicredi Realizado
- BTG Realizado

### Investimentos:
- **Investimento Ações**: Categorias que contêm "Investimento" e "Ações"
- **Investimento Renda Fixa**: Categorias que contêm "Investimento" e "Renda Fixa"
- **Previdência Privada**: Categorias que contêm "Previdência Privada"

### Cartão:
- **Cartão dti Realizado**: Para meses passados e atual
- **Sicredi Realizado**: Para meses passados e atual
- **Porto Bank Realizado**: Para meses passados e atual
- **BTG Realizado**: Para meses passados e atual
- **[C] Cartão**: Para meses futuros (em cinza)

### Ativos:
- Apto. 7L AJS

## 📈 Gráficos Disponíveis

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

### Adicionar Novos Gráficos
1. Crie nova função de gráfico em `templates/index.html`
2. Adicione elemento canvas HTML
3. Integre com os dados processados

## 📁 Estrutura do Projeto

```
FinancasPessoais/
├── app.py                 # Aplicação Flask
├── templates/
│   └── index.html        # Interface principal com abas
├── uploads/              # Pasta para arquivos enviados
├── dados.xlsx            # Arquivo de exemplo
├── requirements.txt      # Dependências Python
└── README.md            # Esta documentação
```

## 🐛 Solução de Problemas

### Erro de Upload
- Verifique se o arquivo é Excel (.xlsx ou .xls)
- Confirme se a estrutura das colunas está correta
- Verifique se o arquivo não está aberto em outro programa

### Gráficos Não Aparecem
- Verifique se o JavaScript está habilitado
- Confirme se Chart.js está carregando
- Verifique o console do navegador para erros

### Dados Não Carregam
- Verifique se o arquivo `dados.xlsx` existe
- Confirme se as colunas começam com "25-"
- Verifique se há dados válidos nas células

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
