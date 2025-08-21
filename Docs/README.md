# 📊 Sistema de Gestão Financeira Pessoal

## 🎯 **Visão Geral**
Sistema web para análise e visualização de dados financeiros pessoais, incluindo proventos, investimentos, gastos com cartão de crédito e carteira de ações.

## 🏗️ **Arquitetura Atual**
- **Backend**: Flask (Python)
- **Frontend**: HTML + CSS + JavaScript vanilla
- **Gráficos**: Chart.js
- **UI**: Bootstrap 5

## 📁 **Estrutura do Projeto**
```
FinancasPessoais/
├── app.py                 # Backend Flask
├── dados.xlsx            # Planilha de dados
├── templates/
│   └── index.html        # Frontend monolítico (800+ linhas)
├── static/               # Arquivos estáticos (será criado)
└── Docs/                 # Documentação
```

## 🚨 **Problemas Identificados**
1. **Arquivo monolítico**: 800+ linhas em um único arquivo HTML
2. **Acoplamento alto**: JavaScript, CSS e HTML misturados
3. **Manutenibilidade baixa**: Mudanças afetam todo o sistema
4. **Testabilidade difícil**: Funções interdependentes
5. **Reutilização zero**: Código duplicado

## 🎯 **Objetivos da Refatoração**
- [ ] Separar responsabilidades (HTML, CSS, JS)
- [ ] Modularizar funcionalidades
- [ ] Melhorar manutenibilidade
- [ ] Preparar para futuras expansões
- [ ] Implementar testes unitários

## 📚 **Documentação Relacionada**
- [Roadmap de Refatoração](./ROADMAP.md)
- [Arquitetura Técnica](./ARCHITECTURE.md)
- [Guia de Desenvolvimento](./DEVELOPMENT.md)
- [Padrões de Código](./CODING_STANDARDS.md)

## 🚀 **Como Executar**
1. Instalar dependências: `pip install -r requirements.txt`
2. Executar aplicação: `python app.py`
3. Acessar: `http://localhost:5000`

## 📝 **Status do Projeto**
- ✅ **Funcionalidades implementadas**
- ✅ **Dados sendo carregados corretamente**
- ✅ **Gráficos funcionando**
- 🔄 **Em processo de refatoração**
- ⏳ **Testes unitários (pendente)**
- ⏳ **Documentação técnica (pendente)**
