namespace JobTracker.Api.DTOs;

public sealed record JobApplicationDto(
    int Id,
    string Company,
    string Role,
    string Location,
    decimal? SalaryMin,
    decimal? SalaryMax,
    string ContractType,
    string Status,
    DateOnly ApplicationDate,
    string? ContactName,
    string? PostingUrl,
    string? Notes);
