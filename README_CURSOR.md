# 🚀 GUIA DO CURSOR - Sistema de Gestão Financeira Pessoal

## 🎯 **COMO USAR AS REGRAS DO CURSOR**

### **1. 📋 Configuração Inicial**
O arquivo `.cursorrules` já está configurado na raiz do projeto. O Cursor deve reconhecê-lo automaticamente e aplicar as regras durante o desenvolvimento.

### **2. 🔍 Comandos Úteis do Cursor**

#### **Para Criar Nova Função**
```
/criar funcao filtrarDadosPorAno
```
O Cursor criará automaticamente seguindo o padrão estabelecido:
- Log de início com emoji 🚀
- Validação de parâmetros
- Estrutura de logs
- Validações de dados

#### **Para Implementar Filtros**
```
/implementar filtro por categoria com validação
```
O Cursor seguirá o padrão dos filtros existentes:
- Validação de dados
- Logs detalhados
- Atualização de gráficos
- Compartilhamento global

#### **Para Criar Gráficos**
```
/criar grafico de barras para dados financeiros
```
O Cursor implementará seguindo o padrão Chart.js:
- Validação de dados
- Destruição de gráficos existentes
- Configuração responsiva
- Tooltips em português

### **3. 🎨 Padrões Automáticos**

#### **Estrutura de Função**
```javascript
// O Cursor criará automaticamente:
function novaFuncao(parametros) {
    console.log('🚀 novaFuncao INICIADA');
    logDebug('🔍 Parâmetros:', parametros);
    
    // Validação automática
    if (!parametros) {
        logError('❌ Parâmetros inválidos');
        return;
    }
    
    // Lógica principal
    const resultado = processarDados(parametros);
    
    logDebug('✅ Resultado:', resultado);
    return resultado;
}
```

#### **Validação de Dados**
```javascript
// O Cursor sugerirá automaticamente:
if (!Array.isArray(dados)) {
    logError('❌ Dados não são um array:', dados);
    return;
}

if (dados.length === 0) {
    logDebug('⚠️ Dados vazios');
    return;
}
```

#### **Compartilhamento Global**
```javascript
// O Cursor implementará automaticamente:
window.novaFuncao = novaFuncao;
window.originalData = data;

// Com verificação de disponibilidade:
if (window.novaFuncao) {
    window.novaFuncao();
}
```

### **4. 🔧 Comandos Específicos do Projeto**

#### **Para Filtros de Proventos**
```
/implementar filtro proventos com opções desde-inicio, este-ano, ultimos-12-meses
```

#### **Para Filtros de Cartão**
```
/implementar filtro cartao por mes e grupo com atualizacao de grafico
```

#### **Para Gráficos Interativos**
```
/criar grafico de barras responsivo com Chart.js e tooltips em portugues
```

#### **Para Validação de Dados**
```
/validar dados com verificacao de tipo, array e propriedades
```

### **5. 📊 Exemplos de Uso**

#### **Criando Nova Funcionalidade de Filtro**
```
Prompt: "Criar função para filtrar dados por período personalizado"
```

O Cursor criará:
```javascript
function filtrarPorPeriodoPersonalizado(dados, dataInicio, dataFim) {
    console.log('🚀 filtrarPorPeriodoPersonalizado INICIADA');
    logDebug('🔍 Filtro:', { dataInicio, dataFim, dados });
    
    // Validação automática
    if (!Array.isArray(dados) || dados.length === 0) {
        logError('❌ Dados inválidos para filtro');
        return [];
    }
    
    if (!dataInicio || !dataFim) {
        logError('❌ Período inválido');
        return [];
    }
    
    // Lógica de filtro
    const dadosFiltrados = dados.filter(item => {
        const dataItem = new Date(item.data);
        return dataItem >= dataInicio && dataItem <= dataFim;
    });
    
    logDebug('✅ Filtro aplicado:', dadosFiltrados.length, 'itens');
    return dadosFiltrados;
}
```

#### **Criando Novo Gráfico**
```
Prompt: "Criar gráfico de pizza para distribuição de gastos por categoria"
```

O Cursor implementará:
```javascript
function createGraficoPizzaGastos(dados) {
    console.log('🚀 createGraficoPizzaGastos INICIADA');
    logDebug('🔍 Dados recebidos:', dados);
    
    // Validação automática
    if (!Array.isArray(dados) || dados.length === 0) {
        logError('❌ Dados inválidos para gráfico');
        return;
    }
    
    // Obter canvas
    const canvas = validateElement('graficoPizza', 'createGraficoPizzaGastos');
    if (!canvas) return;
    
    // Destruir gráfico existente
    if (graficoPizza) {
        graficoPizza.destroy();
    }
    
    // Preparar dados
    const categorias = [...new Set(dados.map(item => item.categoria))];
    const valores = categorias.map(cat => 
        dados.filter(item => item.categoria === cat)
             .reduce((sum, item) => sum + Math.abs(item.valor), 0)
    );
    
    // Criar gráfico
    graficoPizza = new Chart(canvas.getContext('2d'), {
        type: 'pie',
        data: {
            labels: categorias,
            datasets: [{
                data: valores,
                backgroundColor: coresPadrao
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: { text: 'Distribuição de Gastos por Categoria' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': R$ ' + 
                                   context.parsed.toLocaleString('pt-BR');
                        }
                    }
                }
            }
        }
    });
    
    logDebug('✅ Gráfico de pizza criado com sucesso');
}
```

### **6. 🚫 O que o Cursor NÃO deve fazer**

#### **Imports/Exports Incorretos**
```javascript
// ❌ O Cursor deve evitar:
export function minhaFuncao() { /* ... */ }
export { minhaFuncao }; // Duplicação!

// ✅ O Cursor deve implementar:
function minhaFuncao() { /* ... */ }
export { minhaFuncao };
```

#### **Acesso Direto a Elementos DOM**
```javascript
// ❌ O Cursor deve evitar:
document.getElementById('id').innerHTML = '';

// ✅ O Cursor deve implementar:
const elemento = validateElement('id', 'nomeFuncao');
if (elemento) {
    elemento.innerHTML = '';
}
```

#### **Dados Globais sem Validação**
```javascript
// ❌ O Cursor deve evitar:
window.dados = novosDados;

// ✅ O Cursor deve implementar:
if (window.dados) {
    window.dados = novosDados;
}
```

### **7. 🎯 Dicas de Uso**

#### **Para Debugging**
- Use `/debug` para implementar logs automáticos
- Use `/validar` para adicionar validações
- Use `/log` para implementar sistema de logs

#### **Para Performance**
- Use `/otimizar` para melhorar performance
- Use `/cache` para implementar cache
- Use `/lazy` para lazy loading

#### **Para UX/UI**
- Use `/responsivo` para melhorar responsividade
- Use `/animacao` para adicionar animações
- Use `/tema` para implementar temas

### **8. 📝 Checklist Automático**

O Cursor implementará automaticamente:
- [ ] Logs obrigatórios com emojis
- [ ] Validação de dados e parâmetros
- [ ] Tratamento de erros robusto
- [ ] Compartilhamento global quando necessário
- [ ] Estrutura de função padronizada
- [ ] Validação de elementos DOM
- [ ] Destruição de gráficos existentes
- [ ] Logs de resultado e sucesso

### **9. 🔍 Comandos de Debugging**

#### **Para Verificar Logs**
```
/verificar logs da funcao filtrarDados
```

#### **Para Adicionar Validações**
```
/adicionar validacao para dados de entrada
```

#### **Para Implementar Tratamento de Erros**
```
/implementar try-catch com logs detalhados
```

### **10. 🚀 Exemplo Completo**

#### **Prompt Completo**
```
Criar função completa para filtrar dados de investimentos por tipo e período, 
com atualização automática de gráfico e tabela, seguindo todos os padrões 
do projeto
```

#### **Resultado do Cursor**
O Cursor criará automaticamente:
- Função com estrutura completa
- Logs obrigatórios
- Validações robustas
- Atualização de gráficos
- Atualização de tabelas
- Compartilhamento global
- Tratamento de erros
- Documentação inline

---

## 🎯 **RESUMO**

Com o arquivo `.cursorrules` configurado, o Cursor agora:

✅ **Reconhece automaticamente** a arquitetura do projeto
✅ **Implementa padrões** estabelecidos automaticamente
✅ **Sugere validações** e logs obrigatórios
✅ **Mantém consistência** com código existente
✅ **Aplica regras de segurança** automaticamente
✅ **Implementa tratamento de erros** robusto
✅ **Segue nomenclatura** padronizada
✅ **Mantém compatibilidade** com sistema existente

**Use comandos específicos e o Cursor implementará tudo seguindo as melhores práticas do projeto!** 🚀
