# Add API Keys and OAuth Credentials to Cloud Run
# Run this after the base environment variables are set

$SERVICE_URL = "https://outfit-vision-4018057728.us-central1.run.app"

Write-Host "`n🔐 Adding API Keys and OAuth Credentials`n" -ForegroundColor Cyan

Write-Host "Please provide your credentials:" -ForegroundColor Yellow
Write-Host "(Find these in: Google Cloud Console > APIs & Services > Credentials)`n" -ForegroundColor Gray

$CLIENT_ID = Read-Host "GOOGLE_CLIENT_ID"
$CLIENT_SECRET = Read-Host "GOOGLE_CLIENT_SECRET" -AsSecureString
$CLIENT_SECRET_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($CLIENT_SECRET))

$VISION_KEY = Read-Host "GOOGLE_VISION_API_KEY"
$GEMINI_KEY = Read-Host "GOOGLE_GEMINI_API_KEY"

Write-Host "`n☁️  Updating Cloud Run with API keys..." -ForegroundColor Yellow

# Get current env vars and add new ones
gcloud run services update outfit-vision `
    --region us-central1 `
    --update-env-vars "GOOGLE_CLIENT_ID=$CLIENT_ID,GOOGLE_CLIENT_SECRET=$CLIENT_SECRET_PLAIN,GOOGLE_VISION_API_KEY=$VISION_KEY,GOOGLE_GEMINI_API_KEY=$GEMINI_KEY"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ API keys and OAuth credentials added successfully!`n" -ForegroundColor Green
    Write-Host "🌐 Your app: $SERVICE_URL" -ForegroundColor Cyan
    Write-Host "`n✅ All environment variables are now set!`n" -ForegroundColor Green
} else {
    Write-Host "`n❌ Failed to update. Check the error above.`n" -ForegroundColor Red
}


