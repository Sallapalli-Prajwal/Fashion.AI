# Quick Update - All Environment Variables at Once
# This will set everything you need

$SERVICE_URL = "https://outfit-vision-4018057728.us-central1.run.app"

Write-Host "`n🚀 Quick Environment Variables Update`n" -ForegroundColor Cyan
Write-Host "Service URL: $SERVICE_URL`n" -ForegroundColor Green

# Generate session secret
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$SESSION_SECRET = [Convert]::ToBase64String($bytes)

Write-Host "Enter your credentials (find in Google Cloud Console > Credentials):`n" -ForegroundColor Yellow

$CLIENT_ID = Read-Host "GOOGLE_CLIENT_ID"
$CLIENT_SECRET = Read-Host "GOOGLE_CLIENT_SECRET" -AsSecureString
$CLIENT_SECRET_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($CLIENT_SECRET))

Write-Host ""
$VISION_KEY = Read-Host "GOOGLE_VISION_API_KEY"
$GEMINI_KEY = Read-Host "GOOGLE_GEMINI_API_KEY"

# Build complete environment variables
$envVars = "NODE_ENV=production,CLIENT_URL=$SERVICE_URL,GOOGLE_REDIRECT_URI=$SERVICE_URL/api/auth/google/callback,GOOGLE_CLIENT_ID=$CLIENT_ID,GOOGLE_CLIENT_SECRET=$CLIENT_SECRET_PLAIN,GOOGLE_VISION_API_KEY=$VISION_KEY,GOOGLE_GEMINI_API_KEY=$GEMINI_KEY,GOOGLE_PROJECT_ID=outfit-vision,FIRESTORE_DATABASE_ID=(default),SESSION_SECRET=$SESSION_SECRET"

Write-Host "`n☁️  Updating Cloud Run service with all environment variables...`n" -ForegroundColor Yellow

gcloud run services update outfit-vision `
    --region us-central1 `
    --update-env-vars $envVars

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅✅✅ SUCCESS! All environment variables updated! ✅✅✅`n" -ForegroundColor Green
    Write-Host "🌐 Your app URL: $SERVICE_URL" -ForegroundColor Cyan
    Write-Host "`n🎉 Your app is now fully configured and ready to use!`n" -ForegroundColor Green
    Write-Host "Test it at: $SERVICE_URL" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Update failed. Check errors above.`n" -ForegroundColor Red
}


