using JobTracker.Api.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace JobTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class JobsController : ControllerBase
{
    private static readonly object JobsLock = new();

    private static readonly List<JobApplicationDto> Jobs =
    [
        new(
            Id: 1,
            Company: "Acme Consulting",
            Role: "Junior .NET Developer",
            Location: "Milano / Ibrido",
            SalaryMin: 26000,
            SalaryMax: 30000,
            ContractType: "Apprendistato",
            Status: "Candidatura inviata",
            ApplicationDate: new DateOnly(2026, 5, 4),
            ContactName: "HR Team",
            PostingUrl: "https://example.com/jobs/dotnet-junior",
            Notes: "Prima candidatura demo per verificare frontend e backend."),
        new(
            Id: 2,
            Company: "Northwind Tech",
            Role: "Full Stack Developer",
            Location: "Remoto",
            SalaryMin: 32000,
            SalaryMax: 38000,
            ContractType: "Indeterminato",
            Status: "Da valutare",
            ApplicationDate: new DateOnly(2026, 5, 2),
            ContactName: null,
            PostingUrl: "https://example.com/jobs/full-stack",
            Notes: "Offerta demo con Angular e ASP.NET Core.")
    ];

    [HttpGet]
    public ActionResult<IReadOnlyList<JobApplicationDto>> GetAll()
    {
        lock (JobsLock)
        {
            return Ok(Jobs
                .OrderByDescending(job => job.ApplicationDate)
                .ThenBy(job => job.Company)
                .ToList());
        }
    }

    [HttpGet("{id:int}")]
    public ActionResult<JobApplicationDto> GetById(int id)
    {
        JobApplicationDto? job;

        lock (JobsLock)
        {
            job = Jobs.FirstOrDefault(candidate => candidate.Id == id);
        }

        return job is null ? NotFound() : Ok(job);
    }

    [HttpPost]
    public ActionResult<JobApplicationDto> Create(CreateJobApplicationDto request)
    {
        if (request.SalaryMin.HasValue &&
            request.SalaryMax.HasValue &&
            request.SalaryMin.Value > request.SalaryMax.Value)
        {
            ModelState.AddModelError(nameof(request.SalaryMax), "La RAL massima deve essere maggiore o uguale alla RAL minima.");
            return ValidationProblem(ModelState);
        }

        JobApplicationDto created;

        lock (JobsLock)
        {
            var nextId = Jobs.Count == 0 ? 1 : Jobs.Max(job => job.Id) + 1;

            created = new JobApplicationDto(
                Id: nextId,
                Company: request.Company.Trim(),
                Role: request.Role.Trim(),
                Location: request.Location.Trim(),
                SalaryMin: request.SalaryMin,
                SalaryMax: request.SalaryMax,
                ContractType: request.ContractType.Trim(),
                Status: request.Status.Trim(),
                ApplicationDate: request.ApplicationDate!.Value,
                ContactName: NormalizeOptionalText(request.ContactName),
                PostingUrl: NormalizeOptionalText(request.PostingUrl),
                Notes: NormalizeOptionalText(request.Notes));

            Jobs.Add(created);
        }

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    private static string? NormalizeOptionalText(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
