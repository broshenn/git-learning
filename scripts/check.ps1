$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $projectRoot

try {
    $env:PYTHONPATH = Join-Path $projectRoot "src"
    python -m compileall -q src tests
    python -m unittest discover -s tests -v
    git diff --check
}
finally {
    Pop-Location
}

