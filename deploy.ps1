# deploy.ps1
# Uzycie:
#   .\deploy.ps1
# albo:
#   .\deploy.ps1 "Opis zmian"

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== ArenaTracker deploy ===" -ForegroundColor Cyan

# Sprawdz czy Git istnieje
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Nie znaleziono Git. Zainstaluj Git albo uruchom terminal z obsluga Git." -ForegroundColor Red
    exit 1
}

# Sprawdz czy jestes w repo Git
git rev-parse --is-inside-work-tree *> $null

if ($LASTEXITCODE -ne 0) {
    Write-Host "To nie jest folder repozytorium Git." -ForegroundColor Red
    exit 1
}

# Sprawdz branch
$branch = git branch --show-current
Write-Host "Branch: $branch"

if ($branch -ne "main") {
    Write-Host "Uwaga: nie jestes na branchu main." -ForegroundColor Yellow
    $continue = Read-Host "Kontynuowac mimo to? wpisz TAK"

    if ($continue -ne "TAK") {
        Write-Host "Przerwano." -ForegroundColor Yellow
        exit 0
    }
}

# Lista prawdziwych plikow env, ktorych NIE wolno wysylac
# .env.example jest dozwolony
$blockedEnvFiles = @(
    ".env",
    ".env.local",
    ".env.production",
    ".env.development",
    ".env.test"
)

# Sprawdz czy Git juz sledzi prawdziwy plik env
$trackedFiles = git ls-files
$trackedEnv = $trackedFiles | Where-Object { $blockedEnvFiles -contains $_ }

if ($trackedEnv) {
    Write-Host ""
    Write-Host "UWAGA: Git sledzi plik z sekretami:" -ForegroundColor Red
    $trackedEnv | ForEach-Object {
        Write-Host " - $_" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "Najpierw usun go z Gita, ale zostaw lokalnie:" -ForegroundColor Yellow
    Write-Host "git rm --cached .env" -ForegroundColor Yellow
    Write-Host "git commit -m `"Remove env from git`"" -ForegroundColor Yellow
    Write-Host "git push origin main" -ForegroundColor Yellow
    exit 1
}

# Upewnij sie, ze .gitignore blokuje prawdziwy .env
$gitignorePath = ".gitignore"

if (-not (Test-Path $gitignorePath)) {
    New-Item -ItemType File -Path $gitignorePath | Out-Null
}

$gitignoreContent = Get-Content $gitignorePath -ErrorAction SilentlyContinue

if ($gitignoreContent -notcontains ".env") {
    Write-Host ""
    Write-Host "Dodaje .env do .gitignore..." -ForegroundColor Yellow
    Add-Content $gitignorePath ""
    Add-Content $gitignorePath "# Local environment secrets"
    Add-Content $gitignorePath ".env"
}

# Pokaz status
Write-Host ""
Write-Host "Status zmian:" -ForegroundColor Cyan
git status --short

$changes = git status --porcelain

if (-not $changes) {
    Write-Host ""
    Write-Host "Brak zmian do wyslania. Robie tylko git push..." -ForegroundColor Yellow
    git push origin $branch

    Write-Host ""
    Write-Host "Gotowe. Jesli Railway ma auto-deploy, powinien ruszyc sam." -ForegroundColor Green
    exit 0
}

# Pobierz opis commita
$commitMessage = $args[0]

if (-not $commitMessage) {
    $commitMessage = Read-Host "Podaj opis commita"
}

if (-not $commitMessage) {
    $commitMessage = "Update ArenaTracker"
}

Write-Host ""
Write-Host "Dodaje pliki..." -ForegroundColor Cyan
git add -A

# Sprawdz staged files po git add
$stagedFiles = git diff --cached --name-only
$stagedEnv = $stagedFiles | Where-Object { $blockedEnvFiles -contains $_ }

if ($stagedEnv) {
    Write-Host ""
    Write-Host "Zatrzymano: probujesz wyslac plik z sekretami:" -ForegroundColor Red
    $stagedEnv | ForEach-Object {
        Write-Host " - $_" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "Cofam staged files..." -ForegroundColor Yellow
    git reset

    Write-Host ""
    Write-Host "Dodaj ten plik do .gitignore albo usun go ze staged." -ForegroundColor Yellow
    exit 1
}

# Sprawdz czy po git add jest co commitowac
$stagedChanges = git diff --cached --name-only

if (-not $stagedChanges) {
    Write-Host ""
    Write-Host "Nie ma nic do commitowania po git add." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Commituje: $commitMessage" -ForegroundColor Cyan
git commit -m "$commitMessage"

Write-Host ""
Write-Host "Wysylam na GitHub..." -ForegroundColor Cyan
git push origin $branch

Write-Host ""
Write-Host "Gotowe!" -ForegroundColor Green
Write-Host "Railway powinien teraz automatycznie zrobic nowy deploy." -ForegroundColor Green
Write-Host "Sprawdz: Railway -> Project -> Service -> Deployments" -ForegroundColor Green