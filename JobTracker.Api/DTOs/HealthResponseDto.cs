namespace JobTracker.Api.DTOs;

public sealed record HealthResponseDto(
    string Status,
    string Application,
    DateTime ServerTimeUtc);
