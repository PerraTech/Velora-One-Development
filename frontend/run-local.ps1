param(
    [ValidateSet('dev', 'build', 'start', 'typecheck')]
    [string]$Mode = 'dev'
)
$ErrorActionPreference = 'Stop'
# Google Drive kan geen betrouwbare node_modules- of .next-map bieden.
# Alleen applicatiebestanden worden naar een vaste lokale werkmap gekopieerd.
$source = $PSScriptRoot
$localPath = Join-Path $env:LOCALAPPDATA 'VELORA/portal-local'
New-Item -ItemType Directory -Force -Path $localPath | Out-Null
& robocopy $source $localPath /E /XD node_modules .next .git /XF '*.tsbuildinfo' /NFL /NDL /NJH /NJS /NP
if ($LASTEXITCODE -ge 8) { throw "Kopiëren naar de lokale werkmap is mislukt." }
Push-Location $localPath
try {
    if (!(Test-Path -LiteralPath 'package-lock.json')) { throw "package-lock.json ontbreekt; gebruik eerst npm install in frontend." }
    $fingerprint = (Get-FileHash -LiteralPath 'package-lock.json' -Algorithm SHA256).Hash
    $stamp = '.velora-install-hash'
    if (!(Test-Path -LiteralPath 'node_modules/next/package.json') -or !(Test-Path -LiteralPath $stamp) -or (Get-Content -LiteralPath $stamp -Raw).Trim() -ne $fingerprint) {
        & npm.cmd ci --no-fund --no-audit
        if ($LASTEXITCODE -ne 0) { throw "Installatie mislukt." }
        Set-Content -LiteralPath $stamp -Value $fingerprint
    }
    Write-Host "VELORA lokale werkmap: $localPath"
    Write-Host "Na bronwijzigingen in Google Drive: stop met Ctrl+C en start dit script opnieuw."
    & npm.cmd run $Mode
    if ($LASTEXITCODE -ne 0) { throw "npm run $Mode is mislukt." }
} finally { Pop-Location }

