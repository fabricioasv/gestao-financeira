using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace GestaoFinanceira.Functions.Services;

public class GoogleAppsScriptService : IGoogleAppsScriptService
{
    private readonly HttpClient _httpClient;
    private readonly string _googleAppsScriptUrl;
    private readonly ILogger<GoogleAppsScriptService> _logger;

    // Lista de abas disponíveis
    public static readonly string[] AvailableSheets = new[]
    {
        "Consolidado",
        "Proventos",
        "Cartão-Previsão",
        "Cartão-Detalhe",
        "Cartão-Forecast",
        "Ações-Carteira",
        "Renda-Projetiva",
        "Proventos-Recebidos",
        "Proventos-A-Receber",
        "Neto-Invest"
    };

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

    public async Task<string> GetSheetDataAsync(string sheetName)
    {
        try
        {
            var url = $"{_googleAppsScriptUrl}?sheet={Uri.EscapeDataString(sheetName)}";
            _logger.LogInformation("Buscando dados da aba '{SheetName}': {Url}", sheetName, url);
            
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            
            var content = await response.Content.ReadAsStringAsync();
            
            // Verificar se a resposta é HTML (página de login do Google)
            if (content.TrimStart().StartsWith("<!DOCTYPE", StringComparison.OrdinalIgnoreCase) ||
                content.TrimStart().StartsWith("<html", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogError("Google Apps Script retornou HTML em vez de JSON. Verifique as permissões do deployment.");
                throw new InvalidOperationException(
                    "O Google Apps Script retornou uma página HTML (provavelmente login). " +
                    "Verifique se o deployment está configurado com 'Who has access: Anyone'.");
            }

            // Validar se é JSON válido
            try
            {
                JsonDocument.Parse(content);
            }
            catch (JsonException)
            {
                _logger.LogError("Resposta não é JSON válido: {Content}", content.Substring(0, Math.Min(200, content.Length)));
                throw new InvalidOperationException($"Resposta inválida do Google Apps Script: {content.Substring(0, Math.Min(200, content.Length))}");
            }
            
            _logger.LogInformation("Dados da aba '{SheetName}' obtidos com sucesso", sheetName);
            
            return content;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Erro HTTP ao buscar dados da aba '{SheetName}'", sheetName);
            throw;
        }
    }

    public async Task<Dictionary<string, object>> GetAllSheetsDataAsync()
    {
        var result = new Dictionary<string, object>();
        
        foreach (var sheetName in AvailableSheets)
        {
            try
            {
                var jsonData = await GetSheetDataAsync(sheetName);
                var data = JsonSerializer.Deserialize<object>(jsonData);
                result[sheetName] = data!;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Erro ao buscar dados da aba '{SheetName}'", sheetName);
                result[sheetName] = new { error = true, message = ex.Message };
            }
        }
        
        return result;
    }
}

