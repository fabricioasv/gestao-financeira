using System.Net;
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
        Description = "Retorna os dados da aba Ações-Carteira")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json",
        bodyType: typeof(object), Description = "Dados obtidos com sucesso")]
    public Task<HttpResponseData> GetAcoesCarteira(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "sheets/acoes-carteira")] HttpRequestData req)
        => GetSheetData(req, "Ações-Carteira");

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

    #endregion
}

