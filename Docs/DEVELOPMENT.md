# 👨‍💻 Guia de Desenvolvimento

## 🚀 **Começando a Desenvolver**

### **Pré-requisitos**
- Python 3.8+
- Node.js 16+ (para testes)
- Git
- Editor de código (VS Code recomendado)

### **Configuração Inicial**
```bash
# Clone o repositório
git clone <repository-url>
cd FinancasPessoais

# Instale dependências Python
pip install -r requirements.txt

# Instale dependências Node.js (para testes)
npm install

# Execute a aplicação
python app.py
```

## 📁 **Estrutura de Pastas**

### **Organização de Arquivos**
```
FinancasPessoais/
├── app.py                    # Backend Flask
├── static/                   # Arquivos estáticos
│   ├── css/                 # Estilos CSS
│   ├── js/                  # JavaScript modular
│   └── assets/              # Imagens, fontes, etc.
├── templates/                # Templates HTML
├── tests/                    # Testes unitários
└── Docs/                     # Documentação
```

### **Convenções de Nomenclatura**
- **Arquivos**: `camelCase.js`, `kebab-case.css`
- **Funções**: `camelCase()`
- **Classes**: `PascalCase`
- **Constantes**: `UPPER_SNAKE_CASE`
- **Variáveis**: `camelCase`

## 🎨 **Padrões CSS**

### **Estrutura de Arquivos CSS**
```css
/* 1. Variáveis globais */
:root {
  --primary-color: #007bff;
  --success-color: #28a745;
}

/* 2. Reset e base */
* { margin: 0; padding: 0; }

/* 3. Layout */
.container { /* ... */ }

/* 4. Componentes */
.chart-container { /* ... */ }

/* 5. Utilitários */
.text-center { /* ... */ }

/* 6. Media queries */
@media (max-width: 768px) { /* ... */ }
```

### **Classes Utilitárias**
```css
/* Espaçamento */
.m-0, .m-1, .m-2, .m-3, .m-4, .m-5
.p-0, .p-1, .p-2, .p-3, .p-4, .p-5

/* Cores */
.text-primary, .text-success, .text-warning, .text-danger
.bg-primary, .bg-success, .bg-warning, .bg-danger

/* Layout */
.d-flex, .d-block, .d-none
.justify-center, .align-center
```

## ⚙️ **Padrões JavaScript**

### **Estrutura de Módulos**
```javascript
// Módulo ES6
export class ChartManager {
  constructor() {
    this.charts = new Map();
  }
  
  createChart(id, config) {
    // Implementação
  }
  
  destroyChart(id) {
    // Implementação
  }
}

// Importação
import { ChartManager } from './ChartManager.js';
```

### **Padrões de Eventos**
```javascript
// Disparar evento customizado
document.dispatchEvent(new CustomEvent('chartCreated', {
  detail: { chartId: 'chart1', config: chartConfig }
}));

// Escutar evento
document.addEventListener('chartCreated', (event) => {
  const { chartId, config } = event.detail;
  // Processar evento
});
```

### **Tratamento de Erros**
```javascript
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  console.error('Erro na operação:', error);
  // Log estruturado
  logger.error('riskyOperation failed', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  throw new Error('Operação falhou');
}
```

## 🧪 **Testes**

### **Estrutura de Testes**
```javascript
// tests/charts/ConsolidatedChart.test.js
import { ConsolidatedChart } from '../../static/js/charts/ConsolidatedChart.js';

describe('ConsolidatedChart', () => {
  let chart;
  
  beforeEach(() => {
    chart = new ConsolidatedChart();
  });
  
  afterEach(() => {
    chart.destroy();
  });
  
  test('deve criar gráfico com dados válidos', () => {
    const data = { /* dados de teste */ };
    const result = chart.create(data);
    expect(result).toBeTruthy();
  });
});
```

### **Executando Testes**
```bash
# Testes unitários
npm test

# Testes com coverage
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

## 📝 **Padrões de Código**

### **JavaScript**
```javascript
// ✅ Bom
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Ruim
function calc(items) {
  let sum = 0;
  for (let i = 0; i < items.length; i++) {
    sum += items[i].price;
  }
  return sum;
}
```

### **CSS**
```css
/* ✅ Bom */
.chart-container {
  position: relative;
  height: 400px;
  margin: 20px 0;
}

/* ❌ Ruim */
.chart-container {
  position: relative; height: 400px; margin: 20px 0;
}
```

### **HTML**
```html
<!-- ✅ Bom -->
<div class="chart-container">
  <canvas id="consolidatedChart"></canvas>
</div>

<!-- ❌ Ruim -->
<div class="chart-container"><canvas id="consolidatedChart"></canvas></div>
```

## 🔄 **Fluxo de Desenvolvimento**

### **1. Feature Branch**
```bash
# Criar branch para nova funcionalidade
git checkout -b feature/nova-funcionalidade

# Desenvolver funcionalidade
# Fazer commits frequentes
git add .
git commit -m "feat: implementa nova funcionalidade"

# Push para repositório remoto
git push origin feature/nova-funcionalidade
```

### **2. Pull Request**
- Criar PR no GitHub/GitLab
- Adicionar descrição detalhada
- Solicitar review de outro desenvolvedor
- Resolver comentários e sugestões

### **3. Merge e Deploy**
- Aprovar PR após review
- Fazer merge para branch principal
- Deploy automático (se configurado)

## 📊 **Métricas de Qualidade**

### **Cobertura de Código**
- **Mínimo**: 80%
- **Alvo**: 90%
- **Excelente**: 95%+

### **Complexidade Ciclomática**
- **Funções**: < 10
- **Métodos**: < 8
- **Classes**: < 15

### **Duplicação de Código**
- **Máximo**: 5%
- **Alvo**: < 3%

## 🐛 **Debugging**

### **Console Logging**
```javascript
// Log estruturado
console.log('🔍 Dados carregados:', {
  totalItems: data.length,
  timestamp: new Date().toISOString(),
  data: data
});

// Log de erro
console.error('❌ Erro ao carregar dados:', error);
```

### **Debug no Navegador**
```javascript
// Breakpoint condicional
if (data.length === 0) {
  debugger; // Para execução aqui
}

// Log de performance
console.time('renderChart');
renderChart(data);
console.timeEnd('renderChart');
```

## 📚 **Recursos Úteis**

### **Documentação**
- [MDN Web Docs](https://developer.mozilla.org/)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [Bootstrap Documentation](https://getbootstrap.com/docs/)

### **Ferramentas**
- **Linting**: ESLint, Prettier
- **Testing**: Jest, Mocha
- **Build**: Webpack, Vite
- **Debug**: Chrome DevTools, VS Code Debugger

### **Padrões de Código**
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google CSS Style Guide](https://google.github.io/styleguide/htmlcssguide.html)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🚨 **Checklist de Qualidade**

### **Antes do Commit**
- [ ] Código segue padrões estabelecidos
- [ ] Testes passando
- [ ] Linting sem erros
- [ ] Documentação atualizada
- [ ] Funcionalidade testada manualmente

### **Antes do Merge**
- [ ] Todos os testes passando
- [ ] Code review aprovado
- [ ] Cobertura de testes adequada
- [ ] Performance aceitável
- [ ] Documentação completa
