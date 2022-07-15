$topologyArray = "xmcloud";

$startDirectory = ".\run\sitecore-";
$workingDirectoryPath;
$envCheck;

foreach ($topology in $topologyArray) {
  $envCheck = Get-Content (Join-Path -Path ($startDirectory + $topology) -ChildPath .env) -Encoding UTF8
  if ($envCheck) {
    $workingDirectoryPath = $startDirectory + $topology;
    break
  }
}

Push-Location $workingDirectoryPath

Write-Host "Down containers..." -ForegroundColor Green
try {
  docker-compose down
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Container down failed, see errors above."
  }
}
finally {
  Pop-Location
}
