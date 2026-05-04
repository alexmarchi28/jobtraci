using JobTracker.Api.Data;
using JobTracker.Api.DTOs;
using JobTracker.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

namespace JobTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class JobsController : ControllerBase
{
    private readonly AppDbContext dbContext;

    public JobsController(AppDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<JobApplicationDto>>> GetAll()
    {
        var jobs = await dbContext.JobApplications
            .AsNoTracking()
            .OrderByDescending(job => job.ApplicationDate)
            .ThenBy(job => job.Company)
            .Select(job => ToDto(job))
            .ToListAsync();

        return Ok(jobs);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<JobApplicationDto>> GetById(int id)
    {
        var job = await dbContext.JobApplications
            .AsNoTracking()
            .FirstOrDefaultAsync(candidate => candidate.Id == id);

        return job is null ? NotFound() : Ok(ToDto(job));
    }

    [HttpPost]
    public async Task<ActionResult<JobApplicationDto>> Create(CreateJobApplicationDto request)
    {
        if (HasInvalidSalaryRange(request.SalaryMin, request.SalaryMax))
        {
            ModelState.AddModelError(nameof(request.SalaryMax), "La RAL massima deve essere maggiore o uguale alla RAL minima.");
            return ValidationProblem(ModelState);
        }

        var now = DateTime.UtcNow;
        var job = new JobApplication
        {
            Company = request.Company.Trim(),
            Role = request.Role.Trim(),
            Location = request.Location.Trim(),
            SalaryMin = request.SalaryMin,
            SalaryMax = request.SalaryMax,
            ContractType = request.ContractType.Trim(),
            Status = request.Status.Trim(),
            ApplicationDate = request.ApplicationDate!.Value,
            ContactName = NormalizeOptionalText(request.ContactName),
            PostingUrl = NormalizeOptionalText(request.PostingUrl),
            Notes = NormalizeOptionalText(request.Notes),
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        dbContext.JobApplications.Add(job);
        await dbContext.SaveChangesAsync();

        var created = ToDto(job);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<JobApplicationDto>> Update(int id, UpdateJobApplicationDto request)
    {
        if (HasInvalidSalaryRange(request.SalaryMin, request.SalaryMax))
        {
            ModelState.AddModelError(nameof(request.SalaryMax), "La RAL massima deve essere maggiore o uguale alla RAL minima.");
            return ValidationProblem(ModelState);
        }

        var job = await dbContext.JobApplications.FirstOrDefaultAsync(candidate => candidate.Id == id);

        if (job is null)
        {
            return NotFound();
        }

        job.Company = request.Company.Trim();
        job.Role = request.Role.Trim();
        job.Location = request.Location.Trim();
        job.SalaryMin = request.SalaryMin;
        job.SalaryMax = request.SalaryMax;
        job.ContractType = request.ContractType.Trim();
        job.Status = request.Status.Trim();
        job.ApplicationDate = request.ApplicationDate!.Value;
        job.ContactName = NormalizeOptionalText(request.ContactName);
        job.PostingUrl = NormalizeOptionalText(request.PostingUrl);
        job.Notes = NormalizeOptionalText(request.Notes);
        job.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();

        return Ok(ToDto(job));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var job = await dbContext.JobApplications.FirstOrDefaultAsync(candidate => candidate.Id == id);

        if (job is null)
        {
            return NotFound();
        }

        dbContext.JobApplications.Remove(job);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    private static bool HasInvalidSalaryRange(decimal? salaryMin, decimal? salaryMax)
    {
        return salaryMin.HasValue &&
            salaryMax.HasValue &&
            salaryMin.Value > salaryMax.Value;
    }

    private static string? NormalizeOptionalText(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static JobApplicationDto ToDto(JobApplication job)
    {
        return new JobApplicationDto(
            Id: job.Id,
            Company: job.Company,
            Role: job.Role,
            Location: job.Location,
            SalaryMin: job.SalaryMin,
            SalaryMax: job.SalaryMax,
            ContractType: job.ContractType,
            Status: job.Status,
            ApplicationDate: job.ApplicationDate,
            ContactName: job.ContactName,
            PostingUrl: job.PostingUrl,
            Notes: job.Notes);
    }
}
