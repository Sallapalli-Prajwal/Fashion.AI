# Set Environment Variables for Cloud Run
# Run this and provide your credentials when prompted

$SERVICE_URL = "https://outfit-vision-4018057728.us-central1.run.app"

Write-Host "`n🔧 Setting Environment Variables for Cloud Run`n" -ForegroundColor Cyan
Write-Host "Service URL: $SERVICE_URL`n" -ForegroundColor Green

# Generate session secret
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$SESSION_SECRET = [Convert]::ToBase64String($bytes)

Write-Host "Please provide your credentials:" -ForegroundColor Yellow
Write-Host "(You can find these in Google Cloud Console > APIs & Services > Credentials)`n" -ForegroundColor Gray

$CLIENT_ID = Read-Host "GOOGLE_CLIENT_ID (OAuth Client ID)"
$CLIENT_SECRET = Read-Host "GOOGLE_CLIENT_SECRET (OAuth Client Secret)" -AsSecureString
$CLIENT_SECRET_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($CLIENT_SECRET))

Write-Host "`nAPI Keys:" -ForegroundColor Yellow
$VISION_KEY = Read-Host "GOOGLE_VISION_API_KEY"
$GEMINI_KEY = Read-Host "GOOGLE_GEMINI_API_KEY"

# Build environment variables string
$envVars = "NODE_ENV=production,PORT=8080,CLIENT_URL=$SERVICE_URL,GOOGLE_REDIRECT_URI=$SERVICE_URL/api/auth/google/callback,GOOGLE_CLIENT_ID=$CLIENT_ID,GOOGLE_CLIENT_SECRET=$CLIENT_SECRET_PLAIN,GOOGLE_VISION_API_KEY=$VISION_KEY,GOOGLE_GEMINI_API_KEY=$GEMINI_KEY,GOOGLE_PROJECT_ID=outfit-vision,FIRESTORE_DATABASE_ID=(default),SESSION_SECRET=$SESSION_SECRET"

Write-Host "`n☁️  Updating Cloud Run service..." -ForegroundColor Yellow

gcloud run services update outfit-vision `
    --region us-central1 `
    --update-env-vars $envVars

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ SUCCESS! Environment variables updated!`n" -ForegroundColor Green
    Write-Host "🌐 Your app: $SERVICE_URL" -ForegroundColor Cyan
    Write-Host "`n✅ Setup complete! Your app should be working now.`n" -ForegroundColor Green
} else {
    Write-Host "`n❌ Failed to update. Check the error above.`n" -ForegroundColor Red
}


