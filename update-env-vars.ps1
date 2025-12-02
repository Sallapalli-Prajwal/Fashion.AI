# Update Cloud Run Environment Variables
# Run this after deployment to set all required environment variables

param(
    [string]$ServiceUrl = "",
    [string]$ClientId = "",
    [string]$ClientSecret = "",
    [string]$VisionKey = "",
    [string]$GeminiKey = "",
    [string]$SessionSecret = ""
)

Write-Host "🔧 Updating Cloud Run Environment Variables..." -ForegroundColor Cyan

# Get service URL if not provided
if (-not $ServiceUrl) {
    Write-Host "📡 Getting service URL..." -ForegroundColor Yellow
    $ServiceUrl = gcloud run services describe outfit-vision --region us-central1 --format 'value(status.url)' 2>&1
    if ($ServiceUrl -match "ERROR" -or -not $ServiceUrl) {
        Write-Host "❌ Could not get service URL. Please provide it manually." -ForegroundColor Red
        exit 1
    }
}

Write-Host "🌐 Service URL: $ServiceUrl" -ForegroundColor Green

# Prompt for missing values
if (-not $ClientId) {
    $ClientId = Read-Host "GOOGLE_CLIENT_ID"
}

if (-not $ClientSecret) {
    $ClientSecret = Read-Host "GOOGLE_CLIENT_SECRET" -AsSecureString
    $ClientSecretPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($ClientSecret))
} else {
    $ClientSecretPlain = $ClientSecret
}

if (-not $VisionKey) {
    $VisionKey = Read-Host "GOOGLE_VISION_API_KEY"
}

if (-not $GeminiKey) {
    $GeminiKey = Read-Host "GOOGLE_GEMINI_API_KEY"
}

if (-not $SessionSecret) {
    $SessionSecret = Read-Host "SESSION_SECRET (press enter to generate)"
    if (-not $SessionSecret) {
        $bytes = New-Object byte[] 32
        $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
        $rng.GetBytes($bytes)
        $SessionSecret = [Convert]::ToBase64String($bytes)
        Write-Host "✅ Generated SESSION_SECRET" -ForegroundColor Green
    }
}

# Build environment variables string
$envVars = @(
    "NODE_ENV=production",
    "PORT=8080",
    "GOOGLE_CLIENT_ID=$ClientId",
    "GOOGLE_CLIENT_SECRET=$ClientSecretPlain",
    "GOOGLE_REDIRECT_URI=$ServiceUrl/api/auth/google/callback",
    "GOOGLE_VISION_API_KEY=$VisionKey",
    "GOOGLE_GEMINI_API_KEY=$GeminiKey",
    "GOOGLE_PROJECT_ID=outfit-vision",
    "FIRESTORE_DATABASE_ID=(default)",
    "SESSION_SECRET=$SessionSecret",
    "CLIENT_URL=$ServiceUrl"
) -join ","

Write-Host ""
Write-Host "☁️  Updating Cloud Run service..." -ForegroundColor Yellow

gcloud run services update outfit-vision `
    --region us-central1 `
    --update-env-vars $envVars

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Environment variables updated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Update OAuth redirect URI in Google Cloud Console:"
    Write-Host "   $ServiceUrl/api/auth/google/callback" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Test your app: $ServiceUrl" -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to update environment variables" -ForegroundColor Red
    exit 1
}

