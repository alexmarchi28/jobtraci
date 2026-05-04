using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace JobTracker.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveDemoJobApplications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "job_applications",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "job_applications",
                keyColumn: "Id",
                keyValue: 2);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "job_applications",
                columns: new[] { "Id", "ApplicationDate", "Company", "ContactName", "ContractType", "CreatedAtUtc", "Location", "Notes", "PostingUrl", "Role", "SalaryMax", "SalaryMin", "Status", "UpdatedAtUtc" },
                values: new object[,]
                {
                    { 1, new DateOnly(2026, 5, 4), "Acme Consulting", "HR Team", "Apprendistato", new DateTime(2026, 5, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Milano / Ibrido", "Prima candidatura demo per verificare frontend e backend.", "https://example.com/jobs/dotnet-junior", "Junior .NET Developer", 30000m, 26000m, "Candidatura inviata", new DateTime(2026, 5, 4, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, new DateOnly(2026, 5, 2), "Northwind Tech", null, "Indeterminato", new DateTime(2026, 5, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Remoto", "Offerta demo con Angular e ASP.NET Core.", "https://example.com/jobs/full-stack", "Full Stack Developer", 38000m, 32000m, "Da valutare", new DateTime(2026, 5, 4, 0, 0, 0, 0, DateTimeKind.Utc) }
                });
        }
    }
}
