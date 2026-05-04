using System.ComponentModel.DataAnnotations;

namespace JobTracker.Api.DTOs;

public sealed class CreateJobApplicationDto
{
    [Required]
    [StringLength(120)]
    public string Company { get; init; } = string.Empty;

    [Required]
    [StringLength(120)]
    public string Role { get; init; } = string.Empty;

    [Required]
    [StringLength(120)]
    public string Location { get; init; } = string.Empty;

    [Range(0, 1_000_000)]
    public decimal? SalaryMin { get; init; }

    [Range(0, 1_000_000)]
    public decimal? SalaryMax { get; init; }

    [Required]
    [StringLength(60)]
    public string ContractType { get; init; } = string.Empty;

    [Required]
    [StringLength(60)]
    public string Status { get; init; } = string.Empty;

    [Required]
    public DateOnly? ApplicationDate { get; init; }

    [StringLength(120)]
    public string? ContactName { get; init; }

    [StringLength(500)]
    [Url]
    public string? PostingUrl { get; init; }

    [StringLength(2000)]
    public string? Notes { get; init; }
}
