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
        });
    }
}
