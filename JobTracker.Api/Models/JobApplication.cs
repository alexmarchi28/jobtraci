using System.ComponentModel.DataAnnotations;

namespace JobTracker.Api.Models;

public sealed class JobApplication
{
    public int Id { get; set; }

    [MaxLength(120)]
    public string Company { get; set; } = string.Empty;

    [MaxLength(120)]
    public string Role { get; set; } = string.Empty;

    [MaxLength(120)]
    public string Location { get; set; } = string.Empty;

    public decimal? SalaryMin { get; set; }

    public decimal? SalaryMax { get; set; }

    [MaxLength(60)]
    public string ContractType { get; set; } = string.Empty;

    [MaxLength(60)]
    public string Status { get; set; } = string.Empty;

    public DateOnly ApplicationDate { get; set; }

    [MaxLength(120)]
    public string? ContactName { get; set; }

    [MaxLength(500)]
    public string? PostingUrl { get; set; }

    [MaxLength(2000)]
    public string? Notes { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }
}
