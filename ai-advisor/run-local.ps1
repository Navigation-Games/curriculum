# Runs the backend on this computer (http://localhost:8080), to try course
# and advisor changes before a Cloud Run deploy. Settings come from
# ai-advisor/.env (gitignored; copy .env.example). Restarts by itself when
# app.py, training-units.json or the tutor prompts change.
# See "Local development" in README.md.

$envFile = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $envFile)) {
    Write-Error "No ai-advisor/.env yet. Copy .env.example to .env and add your Anthropic API key."
    exit 1
}
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
        $name, $value = $line.Split("=", 2)
        [Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim(), "Process")
    }
}
Set-Location $PSScriptRoot
python -m flask --app app run --port 8080 --debug --extra-files "training-units.json;tutor-prompt.md;tutor-style.md;system-prompt.md"
