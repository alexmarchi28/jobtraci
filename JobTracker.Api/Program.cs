using JobTracker.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

const string angularDevPolicy = "AngularDev";
var connectionString = builder.Configuration.GetConnectionString("JobTrackerDb")
    ?? throw new InvalidOperationException("Connection string 'JobTrackerDb' was not found.");

builder.Services.AddCors(options =>
{
    options.AddPolicy(angularDevPolicy, policy =>
    {
        policy
            .WithOrigins("http://localhost:4200", "http://127.0.0.1:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});
builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors(angularDevPolicy);
app.UseAuthorization();

app.MapGet("/", () => Results.Ok(new
{
    application = "JobTracker.Api",
    message = "Backend running"
}));

app.MapControllers();

app.Run();
