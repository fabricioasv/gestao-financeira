using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Azure.Functions.Worker.Extensions.OpenApi.Extensions;
using GestaoFinanceira.Functions.Services;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureOpenApi()
    .ConfigureServices(services =>
    {
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();
        
        // Registrar HttpClient para chamadas ao Google Apps Script
        services.AddHttpClient<IGoogleAppsScriptService, GoogleAppsScriptService>();
        
        // Registrar Memory Cache para uso futuro
        services.AddMemoryCache();
    })
    .Build();

host.Run();

