namespace GestaoFinanceira.Functions.Services;

public interface IGoogleAppsScriptService
{
    Task<string> GetSheetDataAsync(string sheetName);
    Task<Dictionary<string, object>> GetAllSheetsDataAsync();
}

