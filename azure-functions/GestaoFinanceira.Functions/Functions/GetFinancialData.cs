using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using GestaoFinanceira.Functions.Services;

namespace GestaoFinanceira.Functions.Functions;

public class GetFinancialData
{
    private readonly ILogger<GetFinancialData> _logger;
    private readonly IGoogleAppsScriptService _googleAppsScriptService;

    public GetFinancialData(
        ILogger<GetFinancialData> logger,
        IGoogleAppsScriptService googleAppsScriptService)
    {
        _logger = logger;
        _googleAppsScriptService = googleAppsScriptService;
    }

    [Function("GetFinancialData")]
    [OpenApiOperation(operationId: "GetFinancialData", tags: new[] { "Dados Financeiros" },
        Summary = "Obtém dados financeiros",
        Description = "Retorna todos os dados financeiros da planilha do Google Sheets")]
    [OpenApiSecurity("function_key", SecuritySchemeType.ApiKey, Name = "code", In = OpenApiSecurityLocationType.Query)]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", 
        bodyType: typeof(object), Description = "Dados financeiros obtidos com sucesso")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.InternalServerError, 
        Description = "Erro ao buscar dados do Google Apps Script")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "dados")] HttpRequestData req)
    {
        _logger.LogInformation("Requisição recebida para obter dados financeiros");

        try
        {
            var jsonData = await _googleAppsScriptService.GetFinancialDataAsync();

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json; charset=utf-8");
            
            // Adicionar headers CORS
            response.Headers.Add("Access-Control-Allow-Origin", "*");
            response.Headers.Add("Access-Control-Allow-Methods", "GET, OPTIONS");
            response.Headers.Add("Access-Control-Allow-Headers", "Content-Type");

            await response.WriteStringAsync(jsonData);

            return response;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Erro ao buscar dados do Google Apps Script");

            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            errorResponse.Headers.Add("Content-Type", "application/json; charset=utf-8");
            
            await errorResponse.WriteAsJsonAsync(new 
            { 
                error = true, 
                message = "Erro ao buscar dados do Google Apps Script",
                details = ex.Message 
            });

            return errorResponse;
        }
    }

    [Function("GetFinancialDataOptions")]
    public HttpResponseData Options(
        [HttpTrigger(AuthorizationLevel.Anonymous, "options", Route = "dados")] HttpRequestData req)
    {
        var response = req.CreateResponse(HttpStatusCode.OK);
        response.Headers.Add("Access-Control-Allow-Origin", "*");
        response.Headers.Add("Access-Control-Allow-Methods", "GET, OPTIONS");
        response.Headers.Add("Access-Control-Allow-Headers", "Content-Type");
        return response;
    }
}

