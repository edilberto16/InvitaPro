$ErrorActionPreference = "Stop"

$files = @(
  "CAMBIOS-v2.17.1.1.md",
  "CAMBIOS-v2.17.1.md",
  "CAMBIOS-v2.17.2.md",
  "CAMBIOS-v2.18.0.1.md",
  "CAMBIOS-v2.18.0.md",
  "CAMBIOS-v2.19.0.md"
)

foreach ($file in $files) {
  if (Test-Path $file) {
    Remove-Item $file -Force
    Write-Host "Eliminado: $file"
  }
}

Write-Host "Listo. El historial quedó consolidado en CHANGELOG.md."
