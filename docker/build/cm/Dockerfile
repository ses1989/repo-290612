# escape=`

ARG BASE_IMAGE
ARG TOOLS_ASSETS_IMAGE
ARG SOLUTION_IMAGE

FROM ${SOLUTION_IMAGE} as solution
FROM ${TOOLS_ASSETS_IMAGE} as tools
FROM ${BASE_IMAGE}

SHELL ["powershell", "-Command", "$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';"]

# Copy development tools and entrypoint
COPY --from=tools \tools\ \tools\

WORKDIR C:\inetpub\wwwroot

# Copy solution platform files
COPY --from=solution C:\artifacts\platform\ .\

# Copy local platform files
COPY .\platform .\
