[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSAvoidUsingPlainTextForPassword', '', Justification='Value will be stored unencrypted in .env,
# and used only for transient local development environments', Scope='Function')]

[CmdletBinding(DefaultParameterSetName = "no-arguments")]
Param (
    [Parameter(HelpMessage = "Enables initialization of values in the .env file, which may be placed in source control.",
        ParameterSetName = "env-init")]
    [switch]$InitEnv,

    [Parameter(Mandatory = $true,
        HelpMessage = "The path to a valid Sitecore license.xml file.",
        ParameterSetName = "env-init")]
    [string]$LicenseXmlPath,

    # We do not need to use [SecureString] here since the value will be stored unencrypted in .env,
    # and used only for transient local development environments.
    [Parameter(Mandatory = $true,
        HelpMessage = "Sets the sitecore\\admin password for this environment via environment variable.",
        ParameterSetName = "env-init")]
    [string]$AdminPassword,

    [Parameter(Mandatory = $false,
        HelpMessage = "Sets the instance topology.",
        ParameterSetName = "env-init")]
    [ValidateSet("xmcloud")]
    [string]$Topology = "xmcloud",

    [Parameter(Mandatory = $true,
    HelpMessage = "Sets connection string to ExperienceEdge tenant that will be used for publishing.",
    ParameterSetName = "env-init")]
    [string]$ExpEdgeConnectionString,

    [Parameter(Mandatory = $true,
    HelpMessage = "Sets XmCloud tenant id.",
    ParameterSetName = "env-init")]
    [string]$XmCloudTenantId,

    [Parameter(Mandatory = $true,
    HelpMessage = "Sets XmCloud organization id.",
    ParameterSetName = "env-init")]
    [string]$XmCloudOrganizationId,

    [Parameter(Mandatory = $true,
    HelpMessage = "Sets Federated authentication client id.",
    ParameterSetName = "env-init")]
    [string]$FedAuthClientId,

    [Parameter(Mandatory = $true,
    HelpMessage = "Sets Federated authentication client secret.",
    ParameterSetName = "env-init")]
    [string]$FedAuthClientSecret,

    [Parameter(Mandatory = $true,
    HelpMessage = "Sets Federated authentication domain urls.",
    ParameterSetName = "env-init")]
    [string]$FedAuthDomain,

    [Parameter(Mandatory = $true,
    HelpMessage = "Sets Federated authentication audince urls.",
    ParameterSetName = "env-init")]
    [string]$FedAuthAudience,

    [Parameter(Mandatory = $false,
    HelpMessage = "Sets Federated authentication logout redirect.",
    ParameterSetName = "env-init")]
    [string]$FedAuthLogoutRedirect = "/sitecore",

    [Parameter(Mandatory = $false,
    HelpMessage = "Enables Federated authentication for local login.",
    ParameterSetName = "env-init")]
    [bool]$FedAuthIsLocal = $true
)

$topologyArray = "xmcloud";
if (!$topologyArray.Contains($Topology)) {
  throw "The topology $Topology is not valid. Please choose one from existed $($topologyArray -join ', ')"
}
$ErrorActionPreference = "Stop";
$workingDirectoryPath = ".\run\sitecore-$Topology"
$encodedCompressedFileData = ""

if ($InitEnv) {
    if (-not $LicenseXmlPath.EndsWith("license.xml")) {
        Write-Error "Sitecore license file must be named 'license.xml'."
    }
    if (-not (Test-Path $LicenseXmlPath)) {
        Write-Error "Could not find Sitecore license file at path '$LicenseXmlPath'."
    }

    $fileBytes = [System.IO.File]::ReadAllBytes($LicenseXmlPath)

    try {
        [System.IO.MemoryStream] $memoryStream = New-Object System.IO.MemoryStream

        $gzipStream = New-Object System.IO.Compression.GzipStream $memoryStream, ([IO.Compression.CompressionMode]::Compress)
        $gzipStream.Write( $fileBytes, 0, $fileBytes.Length )

        $gzipStream.Close()
        $memoryStream.Close()

        $compressedFileBytes = $memoryStream.ToArray()
        $encodedCompressedFileData = [Convert]::ToBase64String($compressedFileBytes)
    }
    catch [System.SystemException] {
        Write-Output "Unable to compress and encode file $fullPath"
        Write-Output $_
    }
    finally {
        $gzipStream.Dispose()
        $memoryStream.Dispose()
    }

    # We actually want the folder that it's in for mounting
    $LicenseXmlPath = (Get-Item $LicenseXmlPath).Directory.FullName
}

Write-Host "Preparing your Sitecore Containers environment!" -ForegroundColor Green

############################
# Check for Sitecore Gallery
############################
Import-Module PowerShellGet
$SitecoreGallery = Get-PSRepository | Where-Object { $_.SourceLocation -eq "http://nuget1ca2.dk.sitecore.net/nuget/Sitecore_Gallery" }
if (-not $SitecoreGallery) {
    Write-Host "Adding Sitecore PowerShell Gallery..." -ForegroundColor Green
    Register-PSRepository -Name SitecoreGallery -SourceLocation http://nuget1ca2.dk.sitecore.net/nuget/Sitecore_Gallery -InstallationPolicy Trusted
    $SitecoreGallery = Get-PSRepository -Name SitecoreGallery
}

########################################
# Install and Import SitecoreDockerTools
########################################
$dockerToolsVersion = "10.2.3"
Remove-Module SitecoreDockerTools -ErrorAction SilentlyContinue
if (-not (Get-InstalledModule -Name SitecoreDockerTools -RequiredVersion $dockerToolsVersion -ErrorAction SilentlyContinue)) {
    Write-Host "Installing SitecoreDockerTools..." -ForegroundColor Green
    Install-Module SitecoreDockerTools -RequiredVersion $dockerToolsVersion -Scope CurrentUser -Repository $SitecoreGallery.Name
}
Write-Host "Importing SitecoreDockerTools..." -ForegroundColor Green
Import-Module SitecoreDockerTools -RequiredVersion $dockerToolsVersion
Write-SitecoreDockerWelcome

##################################
# Configure TLS/HTTPS certificates
##################################
Push-Location docker\traefik\certs
try {
    $mkcert = ".\mkcert.exe"

    if ($null -ne (Get-Command mkcert.exe -ErrorAction SilentlyContinue)) {
        # mkcert installed in PATH
        $mkcert = "mkcert"
    } elseif (-not (Test-Path $mkcert)) {
        Write-Host "Downloading and installing mkcert certificate tool..." -ForegroundColor Green
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest "https://github.com/FiloSottile/mkcert/releases/download/v1.4.1/mkcert-v1.4.1-windows-amd64.exe" -UseBasicParsing -OutFile mkcert.exe
        if ((Get-FileHash mkcert.exe).Hash -ne "1BE92F598145F61CA67DD9F5C687DFEC17953548D013715FF54067B34D7C3246") {
            Remove-Item mkcert.exe -Force
            throw "Invalid mkcert.exe file"
        }
    }

    Write-Host "Generating Traefik TLS certificate..." -ForegroundColor Green
    & $mkcert -install
    $rootCertPath = "$(& $mkcert -CAROOT)\rootCA.pem"
    # Make sure the certificate was sucessfully added to the system store using certutil
    # since 'mkcert -install' requires elevated privileges and may fail on CI agents (https://github.com/FiloSottile/mkcert/issues/176)
    ($result = & certutil -addStore -f Root $rootCertPath) | Out-Null
    if ($result) {
        $result | ForEach-Object { Write-Host $_ }
    }
    & $mkcert -key-file xmcloud-key.pem -cert-file xmcloud.pem "xmcloudcm.localhost"
    & $mkcert "*.testxmcloud.localhost"
}
catch {
    Write-Error "An error occurred while attempting to generate TLS certificate: $_"
}
finally {
    Pop-Location
}

################################
# Add Windows hosts file entries
################################
Write-Host "Adding Windows hosts file entries..." -ForegroundColor Green
Add-HostsEntry "xmcloudcm.localhost"
Add-HostsEntry "www.testxmcloud.localhost"


###############################
# Populate the environment file
###############################
if ($InitEnv) {
    Push-Location $workingDirectoryPath

    Write-Host "Populating required .env file values..." -ForegroundColor Green

    # SITECORE_LICENSE
    Set-EnvFileVariable "SITECORE_LICENSE" -Value $encodedCompressedFileData

    # RENDERING_HOST
    Set-EnvFileVariable "RENDERING_HOST" -Value "www.testxmcloud.localhost"

    # TELERIK_ENCRYPTION_KEY = random 64-128 chars
    Set-EnvFileVariable "TELERIK_ENCRYPTION_KEY" -Value (Get-SitecoreRandomString 128 -DisallowSpecial)

    # MEDIA_REQUEST_PROTECTION_SHARED_SECRET
    Set-EnvFileVariable "MEDIA_REQUEST_PROTECTION_SHARED_SECRET" -Value (Get-SitecoreRandomString 64 -DisallowSpecial)

    # SQL_SA_PASSWORD
    # Need to ensure it meets SQL complexity requirements
    Set-EnvFileVariable "SQL_SA_PASSWORD" -Value (Get-SitecoreRandomString 19 -DisallowSpecial -EnforceComplexity)

    # SQL_SERVER
    Set-EnvFileVariable "SQL_SERVER" -Value "mssql"

    # SQL_SA_LOGIN
    Set-EnvFileVariable "SQL_SA_LOGIN" -Value "sa"

    # SITECORE_ADMIN_PASSWORD
    Set-EnvFileVariable "SITECORE_ADMIN_PASSWORD" -Value $AdminPassword

    # Set the instance topology
    Set-EnvFileVariable "TOPOLOGY" -Value $Topology
    Write-Host "The instance topology: $Topology" -ForegroundColor Green

    # EXPEDGE_CONNECTION
    Set-EnvFileVariable "EXPEDGE_CONNECTION" -Value $ExpEdgeConnectionString

    # SITECORE_XmCloud_dot_TenantId
    Set-EnvFileVariable "SITECORE_XmCloud_dot_TenantId" -Value $XmCloudTenantId

    # SITECORE_XmCloud_dot_OrganizationId
    Set-EnvFileVariable "SITECORE_XmCloud_dot_OrganizationId" -Value $XmCloudOrganizationId

    # SITECORE_FedAuth_dot_Auth0_dot_IsLocal
    Set-EnvFileVariable "SITECORE_FedAuth_dot_Auth0_dot_IsLocal" -Value $FedAuthIsLocal

    # SITECORE_FedAuth_dot_Auth0_dot_ClientId
    Set-EnvFileVariable "SITECORE_FedAuth_dot_Auth0_dot_ClientId" -Value $FedAuthClientId

    # SITECORE_FedAuth_dot_Auth0_dot_ClientSecret
    Set-EnvFileVariable "SITECORE_FedAuth_dot_Auth0_dot_ClientSecret" -Value $FedAuthClientSecret

    # SITECORE_FedAuth_dot_Auth0_dot_Domain
    Set-EnvFileVariable "SITECORE_FedAuth_dot_Auth0_dot_Domain" -Value $FedAuthDomain

    # SITECORE_FedAuth_dot_Auth0_dot_Audience
    Set-EnvFileVariable "SITECORE_FedAuth_dot_Auth0_dot_Audience" -Value $FedAuthAudience

    # SITECORE_FedAuth_dot_Auth0_dot_LogoutRedirect
    Set-EnvFileVariable "SITECORE_FedAuth_dot_Auth0_dot_LogoutRedirect" -Value $FedAuthLogoutRedirect

    Pop-Location
}

Write-Host "Done!" -ForegroundColor Green
