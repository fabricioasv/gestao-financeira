using System.Net;
using System.Text.Json;
using System.Globalization;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using GestaoFinanceira.Functions.Services;

namespace GestaoFinanceira.Functions.Functions;

public class SheetsEndpoints
{
    private readonly ILogger<SheetsEndpoints> _logger;
    private readonly IGoogleAppsScriptService _googleAppsScriptService;

    public SheetsEndpoints(
        ILogger<SheetsEndpoints> logger,
        IGoogleAppsScriptService googleAppsScriptService)
    {
        _logger = logger;
        _googleAppsScriptService = googleAppsScriptService;
    }

    #region Endpoints Individuais

    [Function("GetConsolidado")]
    [OpenApiOperation(operationId: "GetConsolidado", tags: new[] { "Sheets" },
        Summary = "Obtém dados do Consolidado",
        Description = "Retorna os dados da aba Consolidado")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json",
        bodyType: typeof(object), Description = "Dados obtidos com sucesso")]
    public Task<HttpResponseData> GetConsolidado(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "sheets/consolidado")] HttpRequestData req)
        => GetSheetData(req, "Consolidado");

    [Function("GetProventos")]
    [OpenApiOperation(operationId: "GetProventos", tags: new[] { "Sheets" },
        Summary = "Obtém dados dos Proventos",
        Description = "Retorna os dados da aba Proventos")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json",
        bodyType: typeof(object), Description = "Dados obtidos com sucesso")]
    public Task<HttpResponseData> GetProventos(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "sheets/proventos")] HttpRequestData req)
        => GetSheetData(req, "Proventos");

    [Function("GetCartaoPrevisao")]
    [OpenApiOperation(operationId: "GetCartaoPrevisao", tags: new[] { "Sheets" },
        Summary = "Obtém dados do Cartão-Previsão",
        Description = "Retorna os dados da aba Cartão-Previsão")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json",
        bodyType: typeof(object), Description = "Dados obtidos com sucesso")]
    public Task<HttpResponseData> GetCartaoPrevisao(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "sheets/cartao-previsao")] HttpRequestData req)
        => GetSheetData(req, "Cartão-Previsão");

    [Function("GetCartaoDetalhe")]
    [OpenApiOperation(operationId: "GetCartaoDetalhe", tags: new[] { "Sheets" },
        Summary = "Obtém dados do Cartão-Detalhe",
        Description = "Retorna os dados da aba Cartão-Detalhe")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json",
        bodyType: typeof(object), Description = "Dados obtidos com sucesso")]
    public Task<HttpResponseData> GetCartaoDetalhe(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "sheets/cartao-detalhe")] HttpRequestData req)
        => GetSheetData(req, "Cartão-Detalhe");

    [Function("GetCartaoForecast")]
    [OpenApiOperation(operationId: "GetCartaoForecast", tags: new[] { "Sheets" },
        Summary = "Obtém dados do Cartão-Forecast",
        Description = "Retorna os dados da aba Cartão-Forecast")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json",
        bodyType: typeof(object), Description = "Dados obtidos com sucesso")]
    public Task<HttpResponseData> GetCartaoForecast(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "sheets/cartao-forecast")] HttpRequestData req)
        => GetSheetData(req, "Cartão-Forecast");

    [Function("GetAcoesCarteira")]
    [OpenApiOperation(operationId: "GetAcoesCarteira", tags: new[] { "Sheets" },
        Summary = "Obtém dados das Ações-Carteira",
        Description = "Retorna os dados da aba Ações-Carteira com formatação aplicada")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json",
        bodyType: typeof(object), Description = "Dados obtidos com sucesso")]
    public async Task<HttpResponseData> GetAcoesCarteira(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "sheets/acoes-carteira")] HttpRequestData req)
    {
        _logger.LogInformation("Requisição recebida para aba: Ações-Carteira (com formatação)");

        try
        {
            var jsonData = await _googleAppsScriptService.GetSheetDataAsync("Ações-Carteira");
            var formattedData = FormatAcoesCarteiraData(jsonData);

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json; charset=utf-8");
            response.Headers.Add("Access-Control-Allow-Origin", "*");
            await response.WriteStringAsync(formattedData);

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar dados da aba 'Ações-Carteira'");
            return await CreateErrorResponse(req, ex.Message);
        }
    }

    [Function("GetRendaProjetiva")]
    [OpenApiOperation(operationId: "GetRendaProjetiva", tags: new[] { "Sheets" },
        Summary = "Obtém dados da Renda-Projetiva",
        Description = "Retorna os dados da aba Renda-Projetiva")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json",
        bodyType: typeof(object), Description = "Dados obtidos com sucesso")]
    public Task<HttpResponseData> GetRendaProjetiva(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "sheets/renda-projetiva")] HttpRequestData req)
        => GetSheetData(req, "Renda-Projetiva");

    [Function("GetProventosRecebidos")]
    [OpenApiOperation(operationId: "GetProventosRecebidos", tags: new[] { "Sheets" },
        Summary = "Obtém dados dos Proventos-Recebidos",
        Description = "Retorna os dados da aba Proventos-Recebidos")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json",
        bodyType: typeof(object), Description = "Dados obtidos com sucesso")]
    public Task<HttpResponseData> GetProventosRecebidos(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "sheets/proventos-recebidos")] HttpRequestData req)
        => GetSheetData(req, "Proventos-Recebidos");

    [Function("GetProventosAReceber")]
    [OpenApiOperation(operationId: "GetProventosAReceber", tags: new[] { "Sheets" },
        Summary = "Obtém dados dos Proventos-A-Receber",
        Description = "Retorna os dados da aba Proventos-A-Receber")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json",
        bodyType: typeof(object), Description = "Dados obtidos com sucesso")]
    public Task<HttpResponseData> GetProventosAReceber(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "sheets/proventos-a-receber")] HttpRequestData req)
        => GetSheetData(req, "Proventos-A-Receber");

    [Function("GetNetoInvest")]
    [OpenApiOperation(operationId: "GetNetoInvest", tags: new[] { "Sheets" },
        Summary = "Obtém dados do Neto-Invest",
        Description = "Retorna os dados da aba Neto-Invest")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json",
        bodyType: typeof(object), Description = "Dados obtidos com sucesso")]
    public Task<HttpResponseData> GetNetoInvest(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "sheets/neto-invest")] HttpRequestData req)
        => GetSheetData(req, "Neto-Invest");

    #endregion

    #region Endpoint Genérico

    [Function("GetSheetByName")]
    [OpenApiOperation(operationId: "GetSheetByName", tags: new[] { "Sheets" },
        Summary = "Obtém dados de uma aba específica",
        Description = "Retorna os dados de uma aba pelo nome")]
    [OpenApiParameter(name: "sheetName", In = Microsoft.OpenApi.Models.ParameterLocation.Path,
        Required = true, Type = typeof(string), Description = "Nome da aba")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json",
        bodyType: typeof(object), Description = "Dados obtidos com sucesso")]
    public Task<HttpResponseData> GetSheetByName(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "sheets/{sheetName}")] HttpRequestData req,
        string sheetName)
        => GetSheetData(req, sheetName);

    #endregion

    #region Endpoint Todas as Abas

    [Function("GetAllSheets")]
    [OpenApiOperation(operationId: "GetAllSheets", tags: new[] { "Sheets" },
        Summary = "Obtém dados de todas as abas",
        Description = "Retorna os dados de todas as abas disponíveis")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json",
        bodyType: typeof(object), Description = "Dados obtidos com sucesso")]
    public async Task<HttpResponseData> GetAllSheets(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "sheets")] HttpRequestData req)
    {
        _logger.LogInformation("Requisição recebida para obter todas as abas");

        try
        {
            var allData = await _googleAppsScriptService.GetAllSheetsDataAsync();

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Access-Control-Allow-Origin", "*");
            await response.WriteAsJsonAsync(allData);

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar todas as abas");
            return await CreateErrorResponse(req, ex.Message);
        }
    }

    #endregion

    #region Lista de Abas Disponíveis

    [Function("GetAvailableSheets")]
    [OpenApiOperation(operationId: "GetAvailableSheets", tags: new[] { "Sheets" },
        Summary = "Lista abas disponíveis",
        Description = "Retorna a lista de nomes das abas disponíveis")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json",
        bodyType: typeof(string[]), Description = "Lista de abas")]
    public async Task<HttpResponseData> GetAvailableSheets(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "sheets-list")] HttpRequestData req)
    {
        var response = req.CreateResponse(HttpStatusCode.OK);
        response.Headers.Add("Access-Control-Allow-Origin", "*");
        await response.WriteAsJsonAsync(GoogleAppsScriptService.AvailableSheets);
        return response;
    }

    #endregion

    #region Helpers

    private async Task<HttpResponseData> GetSheetData(HttpRequestData req, string sheetName)
    {
        _logger.LogInformation("Requisição recebida para aba: {SheetName}", sheetName);

        try
        {
            var jsonData = await _googleAppsScriptService.GetSheetDataAsync(sheetName);

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json; charset=utf-8");
            response.Headers.Add("Access-Control-Allow-Origin", "*");
            await response.WriteStringAsync(jsonData);

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar dados da aba '{SheetName}'", sheetName);
            return await CreateErrorResponse(req, ex.Message);
        }
    }

    private async Task<HttpResponseData> CreateErrorResponse(HttpRequestData req, string message)
    {
        var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
        errorResponse.Headers.Add("Access-Control-Allow-Origin", "*");
        await errorResponse.WriteAsJsonAsync(new
        {
            error = true,
            message
        });
        return errorResponse;
    }

    /// <summary>
    /// Formata os dados de Ações-Carteira:
    /// - R$ Alvo Neto, R$ Alvo 12%, R$ Base p/ PT, Desvio PL Proj., Div. Proj. -> 2 casas decimais
    /// - Última Atual. -> formato dd/mm/yy
    /// </summary>
    private string FormatAcoesCarteiraData(string jsonData)
    {
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var data = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(jsonData, options);

        if (data == null || data.Count == 0)
            return jsonData;

        // Colunas que devem ter 2 casas decimais
        var decimalColumns = new HashSet<string>
        {
            "R$ Alvo Neto",
            "R$ Alvo 12%",
            "R$ Base p/ PT",
            "Desvio PL Proj.",
            "Div. Proj."
        };

        // Colunas de data que devem mostrar apenas dd/mm/yy
        var dateColumns = new HashSet<string> { "Última Atual." };

        var formattedData = new List<Dictionary<string, object>>();

        foreach (var row in data)
        {
            var formattedRow = new Dictionary<string, object>();

            foreach (var kvp in row)
            {
                var key = kvp.Key;
                var value = kvp.Value;

                if (decimalColumns.Contains(key))
                {
                    formattedRow[key] = FormatDecimalValue(value);
                }
                else if (dateColumns.Contains(key))
                {
                    formattedRow[key] = FormatDateValue(value);
                }
                else
                {
                    formattedRow[key] = GetJsonElementValue(value);
                }
            }

            formattedData.Add(formattedRow);
        }

        return JsonSerializer.Serialize(formattedData);
    }

    /// <summary>
    /// Formata valor numérico para 2 casas decimais
    /// </summary>
    private object FormatDecimalValue(JsonElement element)
    {
        try
        {
            if (element.ValueKind == JsonValueKind.Number)
            {
                var number = element.GetDouble();
                return Math.Round(number, 2);
            }
            else if (element.ValueKind == JsonValueKind.String)
            {
                var str = element.GetString();
                if (!string.IsNullOrEmpty(str) && double.TryParse(str.Replace(",", "."), NumberStyles.Any, CultureInfo.InvariantCulture, out var number))
                {
                    return Math.Round(number, 2);
                }
                return str ?? "";
            }
        }
        catch
        {
            // Em caso de erro, retorna o valor original
        }
        return GetJsonElementValue(element);
    }

    /// <summary>
    /// Formata valor de data para dd/mm/yy
    /// </summary>
    private object FormatDateValue(JsonElement element)
    {
        try
        {
            if (element.ValueKind == JsonValueKind.Number)
            {
                // Serial date do Excel (dias desde 1900-01-01, ajustando para bug do Excel)
                var serialDate = element.GetDouble();
                var date = DateTime.FromOADate(serialDate);
                return date.ToString("dd/MM/yy");
            }
            else if (element.ValueKind == JsonValueKind.String)
            {
                var str = element.GetString();
                if (!string.IsNullOrEmpty(str))
                {
                    // Tenta fazer parse da data em vários formatos
                    if (DateTime.TryParse(str, out var date))
                    {
                        return date.ToString("dd/MM/yy");
                    }
                    // Se já estiver no formato dd/mm/yyyy ou similar, extrai só dd/mm/yy
                    var match = System.Text.RegularExpressions.Regex.Match(str, @"(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})");
                    if (match.Success)
                    {
                        var day = match.Groups[1].Value.PadLeft(2, '0');
                        var month = match.Groups[2].Value.PadLeft(2, '0');
                        var year = match.Groups[3].Value;
                        if (year.Length == 4) year = year.Substring(2);
                        return $"{day}/{month}/{year}";
                    }
                    return str;
                }
            }
        }
        catch
        {
            // Em caso de erro, retorna o valor original
        }
        return GetJsonElementValue(element);
    }

    /// <summary>
    /// Extrai o valor do JsonElement de forma genérica
    /// </summary>
    private object GetJsonElementValue(JsonElement element)
    {
        return element.ValueKind switch
        {
            JsonValueKind.String => element.GetString() ?? "",
            JsonValueKind.Number => element.TryGetInt64(out var l) ? l : element.GetDouble(),
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            JsonValueKind.Null => null!,
            _ => element.ToString()
        };
    }

    #endregion
}

