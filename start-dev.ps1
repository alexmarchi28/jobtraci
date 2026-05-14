param(
    [string]$PostgresPassword = "devpassword",
    [string]$PostgresAdminUser = "postgres",
    [switch]$SkipInstall,
    [switch]$SkipMigrations,
    [switch]$NoStart
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendDir = Join-Path $Root "frontend"
$SolutionPath = Join-Path $Root "JobTracker.slnx"
$ApiProject = Join-Path $Root "JobTracker.Api\JobTracker.Api.csproj"

$DotnetUserDir = Join-Path $env:USERPROFILE ".dotnet"
$DotnetToolsDir = Join-Path $DotnetUserDir "tools"
$NodeDir = "C:\Program Files\nodejs"
$PostgresBinDir = "C:\Program Files\PostgreSQL\18\bin"

$env:Path = @(
    "C:\Program Files\dotnet",
    $NodeDir,
    $PostgresBinDir,
    $DotnetToolsDir,
    $env:Path
) -join ";"

function Resolve-Executable {
    param(
        [string]$Name,
        [string[]]$Candidates
    )

    foreach ($Candidate in $Candidates) {
        if ($Candidate -and (Test-Path $Candidate)) {
            return $Candidate
        }
    }

    $Command = Get-Command $Name -ErrorAction SilentlyContinue
    if ($Command) {
        return $Command.Source
    }

    throw "Executable not found: $Name"
}

$Dotnet = Resolve-Executable "dotnet" @(
    "C:\Program Files\dotnet\dotnet.exe",
    (Join-Path $DotnetUserDir "dotnet.exe")
)

$Npm = Resolve-Executable "npm.cmd" @(
    (Join-Path $NodeDir "npm.cmd")
)

$PsqlCommand = Get-Command "psql.exe" -ErrorAction SilentlyContinue
$PsqlPath = $null
if ($PsqlCommand) {
    $PsqlPath = $PsqlCommand.Source
} elseif (Test-Path (Join-Path $PostgresBinDir "psql.exe")) {
    $PsqlPath = Join-Path $PostgresBinDir "psql.exe"
}

Write-Host "Using dotnet: $Dotnet"
Write-Host "Using npm:    $Npm"

if (-not $SkipInstall) {
    Write-Host "Restoring backend packages..."
    & $Dotnet restore $SolutionPath

    if (-not (Test-Path (Join-Path $FrontendDir "node_modules"))) {
        Write-Host "Installing frontend packages..."
        Push-Location $FrontendDir
        & $Npm install
        Pop-Location
    }
}

if (-not $SkipMigrations) {
    if ($PsqlPath) {
        Write-Host "Ensuring PostgreSQL database and user exist..."
        $env:PGPASSWORD = $PostgresPassword
        $EscapedPostgresPassword = $PostgresPassword.Replace("'", "''")
        $DatabaseSql = @"
DO `$`$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'jobtracker_user') THEN
        CREATE ROLE jobtracker_user LOGIN PASSWORD '$EscapedPostgresPassword';
    ELSE
        ALTER ROLE jobtracker_user WITH LOGIN PASSWORD '$EscapedPostgresPassword';
    END IF;
END
`$`$;
SELECT 'CREATE DATABASE jobtracker_dev OWNER jobtracker_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'jobtracker_dev')\gexec
ALTER DATABASE jobtracker_dev OWNER TO jobtracker_user;
"@
        $DatabaseSql | & $PsqlPath -h localhost -p 5432 -U $PostgresAdminUser -d postgres
    }

    Write-Host "Applying Entity Framework migrations..."
    & $Dotnet ef database update --project $ApiProject --startup-project $ApiProject
}

if ($NoStart) {
    Write-Host "Setup checks completed. No services started because -NoStart was provided."
    exit 0
}

$RunnerDir = Join-Path $env:TEMP "jobtracker-dev"
New-Item -ItemType Directory -Force -Path $RunnerDir | Out-Null

$BackendRunner = Join-Path $RunnerDir "run-backend.ps1"
$FrontendRunner = Join-Path $RunnerDir "run-frontend.ps1"

$BackendCommand = @"
`$ErrorActionPreference = 'Stop'
Set-Location '$Root'
`$env:ASPNETCORE_ENVIRONMENT = 'Development'
`$env:Path = '$($env:Path)'
& '$Dotnet' run --project '$ApiProject' --launch-profile http
"@

$FrontendCommand = @"
`$ErrorActionPreference = 'Stop'
Set-Location '$FrontendDir'
`$env:Path = '$($env:Path)'
& '$Npm' start
"@

Set-Content -Path $BackendRunner -Value $BackendCommand -Encoding UTF8
Set-Content -Path $FrontendRunner -Value $FrontendCommand -Encoding UTF8

Write-Host "Starting backend at http://localhost:5000 ..."
Start-Process powershell.exe -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-File", $BackendRunner
) -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host "Starting frontend at http://localhost:4200 ..."
Start-Process powershell.exe -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-File", $FrontendRunner
) -WindowStyle Normal

Write-Host ""
Write-Host "Backend:  http://localhost:5000"
Write-Host "Frontend: http://localhost:4200"
