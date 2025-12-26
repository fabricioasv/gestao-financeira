using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Azure.Functions.Worker.Extensions.OpenApi.Extensions;
using GestaoFinanceira.Functions.Services;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureOpenApi()
    .ConfigureServices(services =>
    {
        // Observação: chamadas relacionadas ao Application Insights foram
        // removidas temporariamente. Adicione os pacotes apropriados
        // (por exemplo, Microsoft.ApplicationInsights.WorkerService ou
        // o pacote específico do Functions) antes de reabilitá-las.

        // Registrar HttpClient para chamadas ao Google Apps Script
        services.AddHttpClient<IGoogleAppsScriptService, GoogleAppsScriptService>();

        // Registrar Memory Cache para uso futuro
        services.AddMemoryCache();
    })
    .Build();

host.Run();

