using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace GestaoFinanceira.Functions.Services;

public class GoogleAppsScriptService : IGoogleAppsScriptService
{
    private readonly HttpClient _httpClient;
    private readonly string _googleAppsScriptUrl;
    private readonly ILogger<GoogleAppsScriptService> _logger;

    public GoogleAppsScriptService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<GoogleAppsScriptService> logger)
    {
        _httpClient = httpClient;
        _googleAppsScriptUrl = configuration["GoogleAppsScriptUrl"] 
            ?? throw new InvalidOperationException("GoogleAppsScriptUrl não configurada");
        _logger = logger;
    }

    public async Task<string> GetFinancialDataAsync()
    {
        try
        {
            _logger.LogInformation("Buscando dados do Google Apps Script...");
            
            var response = await _httpClient.GetAsync(_googleAppsScriptUrl);
            response.EnsureSuccessStatusCode();
            
            var content = await response.Content.ReadAsStringAsync();
            
            _logger.LogInformation("Dados obtidos com sucesso do Google Apps Script");
            
            return content;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Erro ao buscar dados do Google Apps Script");
            throw;
        }
    }
}

