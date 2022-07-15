# escape=`

ARG BASE_IMAGE
FROM ${BASE_IMAGE}

ARG NODEJS_VERSION

SHELL ["pwsh.exe", "-Command", "$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';"]

USER ContainerAdministrator
# Install Node.js
RUN [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 ; `
    Invoke-WebRequest -OutFile C:\nodejs.zip -UseBasicParsing "https://nodejs.org/dist/v$env:NODEJS_VERSION/node-v$env:NODEJS_VERSION-win-x64.zip"; `
    Expand-Archive C:\nodejs.zip -DestinationPath C:\; `
    Rename-Item "C:\\node-v$env:NODEJS_VERSION-win-x64" C:\nodejs; `
    Remove-Item C:\nodejs.zip;

RUN setx /M PATH $($Env:PATH + ';C:\nodejs')
RUN npm config set registry https://registry.npmjs.org/
