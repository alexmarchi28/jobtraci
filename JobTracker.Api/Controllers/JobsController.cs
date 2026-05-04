using JobTracker.Api.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace JobTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class JobsController : ControllerBase
{
    private static readonly IReadOnlyList<JobApplicationDto> Jobs =
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
        return Ok(Jobs);
    }

    [HttpGet("{id:int}")]
    public ActionResult<JobApplicationDto> GetById(int id)
    {
        var job = Jobs.FirstOrDefault(candidate => candidate.Id == id);

        return job is null ? NotFound() : Ok(job);
    }
}
