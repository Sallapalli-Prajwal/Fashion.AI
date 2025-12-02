# Quick script to update environment variables
# This will prompt you for the sensitive values

$SERVICE_URL = "https://outfit-vision-4018057728.us-central1.run.app"

Write-Host "🔧 Updating Cloud Run Environment Variables..." -ForegroundColor Cyan
Write-Host "Service URL: $SERVICE_URL" -ForegroundColor Green
Write-Host ""

# Generate session secret
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$SESSION_SECRET = [Convert]::ToBase64String($bytes)
Write-Host "✅ Generated SESSION_SECRET" -ForegroundColor Green

# Prompt for required values
Write-Host ""
Write-Host "Please provide the following:" -ForegroundColor Yellow

$CLIENT_ID = Read-Host "GOOGLE_CLIENT_ID"
$CLIENT_SECRET = Read-Host "GOOGLE_CLIENT_SECRET" -AsSecureString
$CLIENT_SECRET_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($CLIENT_SECRET))

$VISION_KEY = Read-Host "GOOGLE_VISION_API_KEY"
$GEMINI_KEY = Read-Host "GOOGLE_GEMINI_API_KEY"

# Build environment variables
$envVars = @(
    "NODE_ENV=production",
    "PORT=8080",
    "CLIENT_URL=$SERVICE_URL",
    "GOOGLE_REDIRECT_URI=$SERVICE_URL/api/auth/google/callback",
    "GOOGLE_CLIENT_ID=$CLIENT_ID",
    "GOOGLE_CLIENT_SECRET=$CLIENT_SECRET_PLAIN",
    "GOOGLE_VISION_API_KEY=$VISION_KEY",
    "GOOGLE_GEMINI_API_KEY=$GEMINI_KEY",
    "GOOGLE_PROJECT_ID=outfit-vision",
    "FIRESTORE_DATABASE_ID=(default)",
    "SESSION_SECRET=$SESSION_SECRET"
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
    Write-Host "🌐 Your app: $SERVICE_URL" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✅ Setup complete! Test your app now." -ForegroundColor Green
} else {
    Write-Host "❌ Failed to update environment variables" -ForegroundColor Red
    exit 1
}


