using JobTracker.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<JobApplication> JobApplications => Set<JobApplication>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<JobApplication>(entity =>
        {
            entity.ToTable("job_applications");

            entity.HasKey(job => job.Id);

            entity.Property(job => job.Company).IsRequired().HasMaxLength(120);
            entity.Property(job => job.Role).IsRequired().HasMaxLength(120);
            entity.Property(job => job.Location).IsRequired().HasMaxLength(120);
            entity.Property(job => job.ContractType).IsRequired().HasMaxLength(60);
            entity.Property(job => job.Status).IsRequired().HasMaxLength(60);
            entity.Property(job => job.ContactName).HasMaxLength(120);
            entity.Property(job => job.PostingUrl).HasMaxLength(500);
            entity.Property(job => job.Notes).HasMaxLength(2000);

            entity.Property(job => job.SalaryMin).HasPrecision(12, 2);
            entity.Property(job => job.SalaryMax).HasPrecision(12, 2);

            entity.HasData(
                new JobApplication
                {
                    Id = 1,
                    Company = "Acme Consulting",
                    Role = "Junior .NET Developer",
                    Location = "Milano / Ibrido",
                    SalaryMin = 26000,
                    SalaryMax = 30000,
                    ContractType = "Apprendistato",
                    Status = "Candidatura inviata",
                    ApplicationDate = new DateOnly(2026, 5, 4),
                    ContactName = "HR Team",
                    PostingUrl = "https://example.com/jobs/dotnet-junior",
                    Notes = "Prima candidatura demo per verificare frontend e backend.",
                    CreatedAtUtc = new DateTime(2026, 5, 4, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAtUtc = new DateTime(2026, 5, 4, 0, 0, 0, DateTimeKind.Utc)
                },
                new JobApplication
                {
                    Id = 2,
                    Company = "Northwind Tech",
                    Role = "Full Stack Developer",
                    Location = "Remoto",
                    SalaryMin = 32000,
                    SalaryMax = 38000,
                    ContractType = "Indeterminato",
                    Status = "Da valutare",
                    ApplicationDate = new DateOnly(2026, 5, 2),
                    ContactName = null,
                    PostingUrl = "https://example.com/jobs/full-stack",
                    Notes = "Offerta demo con Angular e ASP.NET Core.",
                    CreatedAtUtc = new DateTime(2026, 5, 4, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAtUtc = new DateTime(2026, 5, 4, 0, 0, 0, DateTimeKind.Utc)
                });
        });
    }
}
