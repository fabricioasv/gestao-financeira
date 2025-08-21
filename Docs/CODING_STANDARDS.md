# 📋 Padrões de Código

## 🎯 **Objetivo**
Estabelecer padrões consistentes para garantir qualidade, legibilidade e manutenibilidade do código.

## 🐍 **Python (Backend Flask)**

### **Nomenclatura**
```python
# ✅ Bom
def process_excel_data(file_path):
    """Processa dados do arquivo Excel."""
    pass

class ExcelProcessor:
    def __init__(self):
        self.data = None

# ❌ Ruim
def processExcel(file):
    pass

class excel_processor:
    def __init__(self):
        self.Data = None
```

### **Estrutura de Funções**
```python
# ✅ Bom
def create_chart_data(consolidated_data, months):
    """
    Cria dados para gráficos consolidados.
    
    Args:
        consolidated_data (dict): Dados consolidados
        months (list): Lista de meses
        
    Returns:
        dict: Dados formatados para gráficos
    """
    try:
        chart_data = {
            'months': months,
            'consolidated': consolidated_data
        }
        return chart_data
    except Exception as e:
        logger.error(f"Erro ao criar dados do gráfico: {e}")
        return None

# ❌ Ruim
def createChartData(data,months):
    chart_data={'months':months,'consolidated':data}
    return chart_data
```

### **Tratamento de Erros**
```python
# ✅ Bom
try:
    df = pd.read_excel(file_path, sheet_name=sheet_name)
    if df.empty:
        raise ValueError(f"Planilha {sheet_name} está vazia")
    return df
except FileNotFoundError:
    logger.error(f"Arquivo não encontrado: {file_path}")
    return None
except Exception as e:
    logger.error(f"Erro inesperado: {e}")
    return None

# ❌ Ruim
df = pd.read_excel(file_path)
return df
```

## ⚙️ **JavaScript (Frontend)**

### **Nomenclatura**
```javascript
// ✅ Bom
function createConsolidatedChart(chartData) {
    const canvas = document.getElementById('consolidatedChart');
    if (!canvas) {
        console.error('Elemento consolidatedChart não encontrado');
        return;
    }
    // Implementação
}

class ChartManager {
    constructor() {
        this.charts = new Map();
        this.currentData = null;
    }
}

// ❌ Ruim
function createChart(data) {
    var canvas = document.getElementById('chart');
    // Implementação
}

class chartmanager {
    constructor() {
        this.Charts = new Map();
    }
}
```

### **Estrutura de Funções**
```javascript
// ✅ Bom
function createProventosChart(proventosData) {
    // Validação de entrada
    if (!proventosData || !Array.isArray(proventosData)) {
        console.error('Dados de proventos inválidos');
        return;
    }
    
    // Busca de elementos
    const canvas = document.getElementById('proventosChart');
    if (!canvas) {
        console.error('Elemento proventosChart não encontrado');
        return;
    }
    
    // Lógica principal
    try {
        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, createChartConfig(proventosData));
        return chart;
    } catch (error) {
        console.error('Erro ao criar gráfico:', error);
        return null;
    }
}

// ❌ Ruim
function createChart(data) {
    var canvas = document.getElementById('chart');
    var ctx = canvas.getContext('2d');
    var chart = new Chart(ctx, data);
    return chart;
}
```

### **Tratamento de Erros**
```javascript
// ✅ Bom
try {
    const result = await fetch('/api/data');
    if (!result.ok) {
        throw new Error(`HTTP error! status: ${result.status}`);
    }
    const data = await result.json();
    return data;
} catch (error) {
    console.error('Erro ao buscar dados:', error);
    showErrorMessage('Falha ao carregar dados');
    return null;
}

// ❌ Ruim
const result = await fetch('/api/data');
const data = await result.json();
return data;
```

## 🎨 **CSS**

### **Nomenclatura**
```css
/* ✅ Bom */
.chart-container {
    position: relative;
    height: 400px;
    margin: 20px 0;
}

.table-responsive {
    overflow-x: auto;
    border: 1px solid #dee2e6;
    border-radius: 0.375rem;
}

/* ❌ Ruim */
.chartContainer {
    position: relative;
    height: 400px;
    margin: 20px 0;
}

.tableResponsive {
    overflow-x: auto;
}
```

### **Organização de Propriedades**
```css
/* ✅ Bom - Ordem lógica */
.element {
    /* 1. Posicionamento */
    position: relative;
    top: 0;
    left: 0;
    z-index: 1;
    
    /* 2. Box model */
    display: block;
    width: 100%;
    height: 400px;
    margin: 20px 0;
    padding: 10px;
    
    /* 3. Tipografia */
    font-size: 16px;
    font-weight: bold;
    line-height: 1.5;
    text-align: center;
    
    /* 4. Visual */
    background-color: #ffffff;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    
    /* 5. Outros */
    cursor: pointer;
    transition: all 0.3s ease;
}

/* ❌ Ruim - Ordem aleatória */
.element {
    background-color: #ffffff;
    position: relative;
    font-size: 16px;
    margin: 20px 0;
    border: 1px solid #dee2e6;
}
```

### **Variáveis CSS**
```css
/* ✅ Bom */
:root {
    /* Cores primárias */
    --primary-color: #007bff;
    --primary-dark: #0056b3;
    --primary-light: #e7f3ff;
    
    /* Cores de estado */
    --success-color: #28a745;
    --warning-color: #ffc107;
    --danger-color: #dc3545;
    
    /* Espaçamentos */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    
    /* Sombras */
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}

/* Uso */
.button {
    background-color: var(--primary-color);
    padding: var(--spacing-md);
    box-shadow: var(--shadow-sm);
}

/* ❌ Ruim */
.button {
    background-color: #007bff;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}
```

## 📝 **HTML**

### **Estrutura e Semântica**
```html
<!-- ✅ Bom -->
<main class="container-fluid">
    <header class="row bg-primary text-white py-3 mb-3">
        <div class="col-12">
            <h1 class="text-center mb-0">
                <i class="fas fa-chart-line me-3" aria-hidden="true"></i>
                Sistema de Gestão Financeira Pessoal
            </h1>
        </div>
    </header>
    
    <section class="row" id="dataSection">
        <div class="col-12">
            <nav class="nav nav-tabs" role="tablist">
                <button class="nav-link active" role="tab">
                    Dashboard
                </button>
            </nav>
        </div>
    </section>
</main>

<!-- ❌ Ruim -->
<div class="container">
    <div class="row">
        <div class="col-12">
            <h1>Sistema</h1>
        </div>
    </div>
</div>
```

### **Atributos e Acessibilidade**
```html
<!-- ✅ Bom -->
<button 
    class="btn btn-primary" 
    type="button"
    aria-label="Filtrar por este ano"
    onclick="filterProventos('este-ano')"
>
    <i class="fas fa-calendar-day me-2" aria-hidden="true"></i>
    Este Ano
</button>

<table class="table" role="table" aria-label="Dados financeiros">
    <thead>
        <tr>
            <th scope="col">Categoria</th>
            <th scope="col">Valor</th>
        </tr>
    </thead>
</table>

<!-- ❌ Ruim -->
<button onclick="filter()">Filtrar</button>
<table>
    <tr>
        <td>Categoria</td>
        <td>Valor</td>
    </tr>
</table>
```

## 🔧 **Configuração e Imports**

### **Python - Requirements**
```txt
# ✅ Bom - Versões específicas
Flask==2.3.3
pandas==2.1.1
openpyxl==3.1.2

# ❌ Ruim - Versões genéricas
Flask
pandas
openpyxl
```

### **JavaScript - Imports**
```javascript
// ✅ Bom - Imports específicos
import { Chart } from 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/+esm';

// ❌ Ruim - Imports genéricos
import { Chart } from 'chart.js';
```

## 📊 **Métricas de Qualidade**

### **Python**
- **Linhas por função**: < 50
- **Complexidade ciclomática**: < 10
- **Parâmetros por função**: < 5
- **Linhas por arquivo**: < 300

### **JavaScript**
- **Linhas por função**: < 40
- **Complexidade ciclomática**: < 8
- **Parâmetros por função**: < 4
- **Linhas por arquivo**: < 200

### **CSS**
- **Seletores por regra**: < 3
- **Linhas por regra**: < 20
- **Profundidade de aninhamento**: < 4

## 🚨 **Anti-patterns a Evitar**

### **Python**
```python
# ❌ Evitar
def process_data(data):
    global processed_data
    processed_data = []
    for item in data:
        if item > 0:
            processed_data.append(item)
    return processed_data

# ✅ Preferir
def process_data(data):
    return [item for item in data if item > 0]
```

### **JavaScript**
```javascript
// ❌ Evitar
function createChart() {
    var chart = null;
    if (data) {
        chart = new Chart(ctx, config);
    }
    return chart;
}

// ✅ Preferir
function createChart(data) {
    if (!data) return null;
    return new Chart(ctx, config);
}
```

### **CSS**
```css
/* ❌ Evitar */
.element {
    margin: 10px 10px 10px 10px;
    padding: 5px 5px 5px 5px;
}

/* ✅ Preferir */
.element {
    margin: 10px;
    padding: 5px;
}
```

## 📚 **Recursos de Referência**

### **Python**
- [PEP 8 - Style Guide](https://www.python.org/dev/peps/pep-0008/)
- [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html)

### **JavaScript**
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)

### **CSS**
- [Google CSS Style Guide](https://google.github.io/styleguide/htmlcssguide.html)
- [CSS Guidelines](https://cssguidelin.es/)

### **HTML**
- [HTML Living Standard](https://html.spec.whatwg.org/)
- [MDN HTML Reference](https://developer.mozilla.org/en-US/docs/Web/HTML)
