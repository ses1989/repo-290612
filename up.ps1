[CmdletBinding(DefaultParameterSetName = "no-arguments")]
Param (
    [Parameter(Mandatory = $true, HelpMessage = "XMCloud client id to be used for login.",
      ParameterSetName = "xmCloud-login")]
    [string]$xmCloudClientId,
    [Parameter(Mandatory = $true, HelpMessage = "XMCloud client secret to be used for login.",
      ParameterSetName = "xmCloud-login")]
    [string]$xmCloudClientSecret
)

$topologyArray = "xmcloud";
$startDirectory = ".\run\sitecore-";
$workingDirectoryPath;
$envCheck;
$composePath;

$ErrorActionPreference = "Stop";

foreach ($topology in $topologyArray)
{
  $composePath = $startDirectory + $topology;
  $envCheck = Get-Content (Join-Path -Path ($startDirectory + $topology) -ChildPath .env) -Encoding UTF8
  if ($envCheck) {
    $workingDirectoryPath = $startDirectory + $topology;
    break
  }
}

Write-Host ""
Write-Host "Restoring npm packages..." -ForegroundColor Green
Push-Location src\rendering
try {
  npm i
}
finally {
  Pop-Location
}

Push-Location $workingDirectoryPath

# Build all containers in the Sitecore instance, forcing a pull of latest base containers
Write-Host "Building containers..." -ForegroundColor Green
try {
  docker-compose build
  if ($LASTEXITCODE -ne 0) {
      Write-Error "Container build failed, see errors above."
  }

  # Start the Sitecore instance
  Write-Host "Starting Sitecore environment..." -ForegroundColor Green
  docker-compose up -d
}
catch {
  throw $_
}
finally {
  Pop-Location
}

# Wait for Traefik to expose CM route
Write-Host ""
Write-Host "Waiting for CM to become available..." -ForegroundColor Green
$vars
$envFile = Join-Path $composePath ".env"

if (Test-Path $envFile) {
    $vars = ConvertFrom-StringData (Get-Content "$envFile" -Raw)
    $vars.GetEnumerator() | % {
        Set-Variable $_.Key $_.Value -Scope Global
    }
}
else {
    Write-Host "Get-ComposeEnvironmentVariables : Docker environment variable file does not exist: <$envFile>"
}

$cmHost = $vars.CM_HOST
$retries = 5
$currentRetry = 1
$awaitSeconds = 3

do {
    Start-Sleep -Seconds $awaitSeconds
    try {
        Write-Host "Attempt #$currentRetry" -ForegroundColor Yellow
        $status = Invoke-RestMethod "https://$cmHost/healthz/live"
    } catch {
        Write-Host "An exception was caught (waiting for another $intervalSec sec.): $($_.Exception.Message)" -ForegroundColor Red
    } finally {
      $currentRetry++
    }
} while ($status -ne "Healthy" -and $retries -ge $currentRetry)

if (-not $status -eq "Healthy") {
    $status
    Write-Error "Timeout waiting for Sitecore CM to become available via Traefik proxy. Check CM container logs."
}

# Initialize serialization resource packages
Write-Host ""
Write-Host "Installing Sitecore CLI..." -ForegroundColor Green
dotnet new tool-manifest --force
dotnet tool install sitecore.cli --prerelease

dotnet sitecore login --cm $vars.SITECORE_FedAuth_dot_Auth0_dot_RedirectBaseUrl `
                      --auth $vars.SITECORE_FedAuth_dot_Auth0_dot_Domain `
                      --allow-write true `
                      --client-id $xmCloudClientId `
                      --audience $vars.SITECORE_FedAuth_dot_Auth0_dot_Audience `
                      --client-secret $xmCloudClientSecret `
                      --client-credentials true

dotnet sitecore plugin add -n "Sitecore.DevEx.Extensibility.Serialization"
dotnet sitecore plugin add -n "Sitecore.DevEx.Extensibility.Indexing"

dotnet sitecore ser push
dotnet sitecore index schema-populate
dotnet sitecore index rebuild

Write-Host ""
Write-Host "Opening site..." -ForegroundColor Green

Start-Process https://xmcloudcm.localhost/sitecore/
Start-Process https://www.testxmcloud.localhost

Write-Host ""
Write-Host "Use the following command to monitor your Rendering Host:" -ForegroundColor Green
Write-Host "docker-compose logs -f rendering"
Write-Host ""
