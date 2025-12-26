using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Configurations;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.OpenApi.Models;

namespace GestaoFinanceira.Functions;

public class OpenApiConfigurationOptions : DefaultOpenApiConfigurationOptions
{
    public override OpenApiInfo Info { get; set; } = new OpenApiInfo
    {
        Version = "1.0.0",
        Title = "Gestão Financeira API",
        Description = "API para gerenciamento de dados financeiros. Integra com Google Sheets via Apps Script para fornecer dados em tempo real.",
        Contact = new OpenApiContact
        {
            Name = "DTI Digital",
            Email = "contato@dtidigital.com.br"
        },
        License = new OpenApiLicense
        {
            Name = "MIT"
        }
    };

    public override List<OpenApiServer> Servers { get; set; } = new List<OpenApiServer>
    {
        new OpenApiServer { Url = "http://localhost:7071", Description = "Servidor Local" }
    };

    public override OpenApiVersionType OpenApiVersion { get; set; } = OpenApiVersionType.V3;
}

