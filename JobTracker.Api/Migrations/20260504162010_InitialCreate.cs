using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace JobTracker.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "job_applications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Company = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Role = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Location = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    SalaryMin = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: true),
                    SalaryMax = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: true),
                    ContractType = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    Status = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    ApplicationDate = table.Column<DateOnly>(type: "date", nullable: false),
                    ContactName = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    PostingUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_job_applications", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "job_applications",
                columns: new[] { "Id", "ApplicationDate", "Company", "ContactName", "ContractType", "CreatedAtUtc", "Location", "Notes", "PostingUrl", "Role", "SalaryMax", "SalaryMin", "Status", "UpdatedAtUtc" },
                values: new object[,]
                {
                    { 1, new DateOnly(2026, 5, 4), "Acme Consulting", "HR Team", "Apprendistato", new DateTime(2026, 5, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Milano / Ibrido", "Prima candidatura demo per verificare frontend e backend.", "https://example.com/jobs/dotnet-junior", "Junior .NET Developer", 30000m, 26000m, "Candidatura inviata", new DateTime(2026, 5, 4, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, new DateOnly(2026, 5, 2), "Northwind Tech", null, "Indeterminato", new DateTime(2026, 5, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Remoto", "Offerta demo con Angular e ASP.NET Core.", "https://example.com/jobs/full-stack", "Full Stack Developer", 38000m, 32000m, "Da valutare", new DateTime(2026, 5, 4, 0, 0, 0, 0, DateTimeKind.Utc) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "job_applications");
        }
    }
}
