# 🏗️ Arquitetura Técnica

## 📊 **Arquitetura Atual (Monolítica)**

### **Estrutura de Arquivos**
```
FinancasPessoais/
├── app.py                    # Backend Flask (200+ linhas)
├── dados.xlsx               # Planilha de dados
├── templates/
│   └── index.html           # Frontend monolítico (800+ linhas)
├── requirements.txt          # Dependências Python
└── Docs/                    # Documentação
```

### **Tecnologias Utilizadas**
- **Backend**: Flask (Python 3.x)
- **Frontend**: HTML5 + CSS3 + JavaScript ES6+
- **Gráficos**: Chart.js 3.x
- **UI Framework**: Bootstrap 5.3
- **Processamento**: Pandas, OpenPyXL

### **Fluxo de Dados Atual**
```
Excel → Pandas → Flask → JSON → JavaScript → Chart.js
```

## 🎯 **Arquitetura Alvo (Modular)**

### **Estrutura de Arquivos Proposta**
```
FinancasPessoais/
├── app.py                    # Backend Flask (API)
├── dados.xlsx               # Planilha de dados
├── static/
│   ├── css/
│   │   ├── main.css         # Estilos principais
│   │   ├── charts.css       # Estilos de gráficos
│   │   ├── tables.css       # Estilos de tabelas
│   │   └── components.css   # Estilos de componentes
│   ├── js/
│   │   ├── app.js           # Módulo principal
│   │   ├── charts/          # Módulos de gráficos
│   │   ├── tables/          # Módulos de tabelas
│   │   ├── filters/         # Módulos de filtros
│   │   └── utils/           # Utilitários
│   └── assets/              # Imagens, fontes, etc.
├── templates/
│   ├── base.html            # Template base
│   ├── dashboard.html       # Dashboard principal
│   ├── proventos.html       # Aba de proventos
│   ├── cartao.html          # Aba de cartão
│   └── table.html           # Aba de tabela
├── tests/                   # Testes unitários
├── docs/                    # Documentação técnica
└── requirements.txt          # Dependências
```

### **Padrões Arquiteturais**

#### **1. Separação de Responsabilidades**
- **HTML**: Estrutura e semântica
- **CSS**: Apresentação e estilos
- **JavaScript**: Comportamento e lógica
- **Python**: Processamento de dados e API

#### **2. Modularização JavaScript**
- **Módulos ES6** para cada funcionalidade
- **Sistema de eventos** para comunicação
- **Injeção de dependências** para testes

#### **3. Padrão MVC no Frontend**
- **Model**: Dados e estado da aplicação
- **View**: Templates HTML
- **Controller**: Módulos JavaScript

## 🔄 **Fluxo de Dados Proposto**

### **Backend (Flask)**
```
Excel → Pandas → Processamento → JSON API → Frontend
```

### **Frontend (JavaScript Modular)**
```
API JSON → Data Processor → State Manager → UI Components
```

## 📱 **Componentes da Interface**

### **1. Dashboard Principal**
- Gráfico Consolidado
- Gráfico de Investimentos
- Tabela de Ações

### **2. Aba Proventos**
- Filtros de período
- Gráfico de evolução
- Tabela detalhada

### **3. Aba Cartão**
- Gráfico por instituição
- Filtros (mês/categoria)
- Gráfico por categoria
- Tabela de faturas

### **4. Aba Tabela**
- Dados financeiros consolidados

## 🎨 **Sistema de Estilos**

### **Variáveis CSS**
```css
:root {
  --primary-color: #007bff;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  --dark-color: #343a40;
  --light-color: #f8f9fa;
}
```

### **Classes Utilitárias**
- `.chart-container` - Container para gráficos
- `.table-responsive` - Tabelas responsivas
- `.sticky-column` - Colunas fixas
- `.loading` - Estados de carregamento

## ⚙️ **Sistema de Eventos**

### **Eventos Principais**
```javascript
// Carregamento de dados
document.dispatchEvent(new CustomEvent('dataLoaded', { detail: data }));

// Filtros aplicados
document.dispatchEvent(new CustomEvent('filterApplied', { detail: filters }));

// Gráfico atualizado
document.dispatchEvent(new CustomEvent('chartUpdated', { detail: chartData }));
```

### **Listeners de Eventos**
```javascript
document.addEventListener('dataLoaded', (event) => {
  // Atualizar todos os componentes
});

document.addEventListener('filterApplied', (event) => {
  // Aplicar filtros aos gráficos e tabelas
});
```

## 🧪 **Estratégia de Testes**

### **Testes Unitários**
- **Módulos JavaScript**: Jest ou Mocha
- **Utilitários**: Testes de funções puras
- **Componentes**: Testes de renderização

### **Testes de Integração**
- **Fluxo completo**: Upload → Processamento → Exibição
- **Filtros**: Validação de funcionalidade
- **Gráficos**: Verificação de dados

### **Testes de Performance**
- **Tempo de carregamento**: < 3 segundos
- **Renderização de gráficos**: < 1 segundo
- **Filtros**: < 500ms

## 🔧 **Configuração e Deploy**

### **Ambiente de Desenvolvimento**
- **Python**: 3.8+
- **Node.js**: 16+ (para testes)
- **Navegador**: Chrome 90+, Firefox 88+

### **Scripts de Build**
```bash
# Instalar dependências
pip install -r requirements.txt
npm install

# Executar testes
npm test

# Executar aplicação
python app.py
```

### **Variáveis de Ambiente**
```bash
FLASK_ENV=development
FLASK_DEBUG=1
EXCEL_FILE_PATH=./dados.xlsx
```

## 📈 **Métricas de Qualidade**

### **Código**
- **Complexidade ciclomática**: < 10 por função
- **Cobertura de testes**: > 80%
- **Duplicação de código**: < 5%

### **Performance**
- **Tempo de carregamento inicial**: < 3s
- **Tempo de resposta dos filtros**: < 500ms
- **Uso de memória**: < 100MB

### **Manutenibilidade**
- **Arquivos**: < 200 linhas cada
- **Funções**: < 50 linhas cada
- **Módulos**: Responsabilidade única

## 🚀 **Roadmap de Evolução**

### **Fase 1: Refatoração (Atual)**
- Modularização do código existente
- Separação de responsabilidades
- Implementação de testes

### **Fase 2: Melhorias (Futuro)**
- Implementação de cache
- Lazy loading de componentes
- Otimização de performance

### **Fase 3: Expansão (Longo prazo)**
- PWA (Progressive Web App)
- API REST completa
- Sistema de usuários
