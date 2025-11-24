# Download and install Node.js LTS (v18.17.1) using zip
$nodeUrl = "https://nodejs.org/dist/v18.17.1/node-v18.17.1-win-x64.zip"
$zipPath = "$env:TEMP\node.zip"
$extractPath = "C:\nodejs"

# Create extract directory if not exists
if (!(Test-Path $extractPath)) {
    New-Item -ItemType Directory -Path $extractPath
}

# Download the zip
Invoke-WebRequest -Uri $nodeUrl -OutFile $zipPath

# Extract the zip
Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force

# Add to PATH
$env:PATH += ";$extractPath\node-v18.17.1-win-x64"
[Environment]::SetEnvironmentVariable("PATH", $env:PATH, [EnvironmentVariableTarget]::User)

# Clean up
Remove-Item $zipPath

Write-Host "Node.js installation completed."
