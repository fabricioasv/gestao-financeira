# Roadmap: Azure Function HTTP Trigger com Swagger (.NET)

## 📋 Visão Geral

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   React App     │ ───► │  Azure Function │ ───► │  Google Apps    │
│   (Frontend)    │      │   (.NET 8)      │      │  Script (JSON)  │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

**URL do Google Apps Script:**
```
https://script.google.com/macros/s/AKfycbxORyepLXzHsosNCN5KK8LedK70_VZQkwlAtPbNxGCHyzYihfRjWMRpcburWU7PBEkm/exec
```

---

## 🗺️ Etapas do Roadmap

### **Etapa 1: Setup Inicial do Projeto** ✅
- [x] Criar projeto Azure Functions com .NET 8 (Isolated Worker)
- [x] Configurar estrutura de pastas
- [x] Adicionar pacotes NuGet necessários
- [x] Configurar `local.settings.json` com URL do Apps Script

### **Etapa 2: Criar HTTP Trigger Principal** ✅
- [x] Criar função `GetFinancialData` - endpoint GET
- [x] Implementar `HttpClient` para buscar dados do Google Apps Script
- [x] Criar models/DTOs para os dados financeiros
- [x] Configurar CORS para permitir requisições do frontend
- [x] Adicionar tratamento de erros

### **Etapa 3: Configurar Swagger/OpenAPI** ✅
- [x] Instalar pacote `Microsoft.Azure.Functions.Worker.Extensions.OpenApi`
- [x] Configurar OpenAPI no `Program.cs`
- [x] Adicionar atributos de documentação nos endpoints
- [x] Testar Swagger UI em `/api/swagger/ui`

### **Etapa 4: Endpoints Adicionais** ✅
- [x] `GET /api/health` - Health check da API
- [x] `GET /api/sheets` - Retorna todas as abas
- [x] `GET /api/sheets-list` - Lista abas disponíveis
- [x] `GET /api/sheets/consolidado` - Aba Consolidado
- [x] `GET /api/sheets/proventos` - Aba Proventos
- [x] `GET /api/sheets/cartao-previsao` - Aba Cartão-Previsão
- [x] `GET /api/sheets/cartao-detalhe` - Aba Cartão-Detalhe
- [x] `GET /api/sheets/cartao-forecast` - Aba Cartão-Forecast
- [x] `GET /api/sheets/acoes-carteira` - Aba Ações-Carteira
- [x] `GET /api/sheets/renda-projetiva` - Aba Renda-Projetiva
- [x] `GET /api/sheets/proventos-recebidos` - Aba Proventos-Recebidos
- [x] `GET /api/sheets/proventos-a-receber` - Aba Proventos-A-Receber
- [x] `GET /api/sheets/{sheetName}` - Endpoint genérico por nome

### **Etapa 5: Testes Locais** ⬜
- [x] Executar com `func start` ou F5 no Visual Studio
- [x] Validar integração com o Google Apps Script
- [x] Testar Swagger UI
- [ ] Testar chamada do frontend

### **Etapa 6: Implementar Cache** ⬜
- [ ] Adicionar `IMemoryCache` para cache em memória
- [ ] Configurar tempo de expiração do cache
- [ ] Evitar chamadas excessivas ao Google Apps Script

### **Etapa 7: Integração com Frontend** 🔄
- [x] Criar serviço de API no frontend (`src/services/api.js`)
- [x] Criar transformadores de dados (`src/services/transformers.js`)
- [x] Integrar aba **Consolidado** (Dashboard + Investimentos + Financeiro)
- [x] Integrar aba **Proventos** (Gráfico de proventos)
- [ ] Integrar aba **Cartão-Detalhe** (Gráfico de cartão)
- [ ] Integrar aba **Ações-Carteira** (Tabela de ações)
- [ ] Integrar abas restantes (Cartão-Previsão, Cartão-Forecast, etc.)
- [ ] Remover dependência do arquivo Excel local
- [ ] Testar fluxo completo

---

## 📁 Estrutura de Pastas

```
gestao-financeira/
├── react-app/                    # Frontend existente
└── azure-functions/              # Backend .NET
    ├── GestaoFinanceira.Functions/
    │   ├── Functions/
    │   │   ├── GetFinancialData.cs
    │   │   └── HealthCheck.cs
    │   ├── Models/
    │   │   └── FinancialData.cs
    │   ├── Services/
    │   │   └── GoogleAppsScriptService.cs
    │   ├── Program.cs
    │   ├── host.json
    │   ├── local.settings.json
    │   └── GestaoFinanceira.Functions.csproj
    └── roadmap.md
```

---

## 🛠️ Tecnologias

| Componente | Tecnologia |
|------------|------------|
| Runtime | .NET 8 |
| Modelo | Azure Functions Isolated Worker |
| Documentação | OpenAPI 3.0 / Swagger UI |
| HTTP Client | HttpClientFactory |
| Cache | IMemoryCache |

---

## 📦 Pacotes NuGet

```xml
<PackageReference Include="Microsoft.Azure.Functions.Worker" Version="1.21.0" />
<PackageReference Include="Microsoft.Azure.Functions.Worker.Sdk" Version="1.17.2" />
<PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.Http" Version="3.1.0" />
<PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.OpenApi" Version="1.5.1" />
<PackageReference Include="Microsoft.Extensions.Caching.Memory" Version="8.0.0" />
```

---

## ✅ Progresso

| Etapa | Status | Data |
|-------|--------|------|
| Etapa 1: Setup Inicial | ✅ Concluído | 26/12/2024 |
| Etapa 2: HTTP Trigger | ✅ Concluído | 26/12/2024 |
| Etapa 3: Swagger | ✅ Concluído | 26/12/2024 |
| Etapa 4: Endpoints | ✅ Concluído | 26/12/2024 |
| Etapa 5: Testes | ⬜ Pendente | - |
| Etapa 6: Cache | ⬜ Pendente | - |
| Etapa 7: Integração | ⬜ Pendente | - |

---

## 📝 Notas

- O deploy será feito manualmente pelo desenvolvedor
- Cache será implementado na etapa final
- CORS deve permitir `http://localhost:5173` (Vite dev server)

