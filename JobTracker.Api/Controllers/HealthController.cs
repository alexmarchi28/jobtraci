using JobTracker.Api.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace JobTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class HealthController : ControllerBase
{
    [HttpGet]
    public ActionResult<HealthResponseDto> Get()
    {
        return Ok(new HealthResponseDto(
            Status: "ok",
            Application: "JobTracker.Api",
            ServerTimeUtc: DateTime.UtcNow));
    }
}
