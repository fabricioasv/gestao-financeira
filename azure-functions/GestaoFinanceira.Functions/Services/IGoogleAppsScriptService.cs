namespace GestaoFinanceira.Functions.Services;

public interface IGoogleAppsScriptService
{
    Task<string> GetFinancialDataAsync();
}

