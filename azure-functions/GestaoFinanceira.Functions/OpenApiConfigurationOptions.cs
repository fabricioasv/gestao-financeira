using System;
using System.Collections.Generic;
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

    public override List<OpenApiServer> Servers
    {
        get
        {
            var hostname = Environment.GetEnvironmentVariable("WEBSITE_HOSTNAME");
            if (!string.IsNullOrWhiteSpace(hostname))
            {
                return new List<OpenApiServer>
                {
                    new OpenApiServer { Url = $"https://{hostname}", Description = "Servidor (Azure)" }
                };
            }

            return new List<OpenApiServer>
            {
                new OpenApiServer { Url = "http://localhost:7071", Description = "Servidor Local" }
            };
        }
        set { }
    }

    public override OpenApiVersionType OpenApiVersion { get; set; } = OpenApiVersionType.V3;
}

