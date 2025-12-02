# Add Missing Credentials to Cloud Run
# Run this and paste your credentials when prompted

$SERVICE_URL = "https://outfit-vision-4018057728.us-central1.run.app"

Write-Host "`nAdding API Keys and OAuth Credentials`n" -ForegroundColor Cyan
Write-Host "Service URL: $SERVICE_URL`n" -ForegroundColor Green

Write-Host "Please paste your credentials:`n" -ForegroundColor Yellow

$CLIENT_ID = Read-Host "GOOGLE_CLIENT_ID"
$CLIENT_SECRET = Read-Host "GOOGLE_CLIENT_SECRET" -AsSecureString
$CLIENT_SECRET_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($CLIENT_SECRET))

Write-Host ""
$VISION_KEY = Read-Host "GOOGLE_VISION_API_KEY"
$GEMINI_KEY = Read-Host "GOOGLE_GEMINI_API_KEY"

Write-Host "`nUpdating Cloud Run service...`n" -ForegroundColor Yellow

gcloud run services update outfit-vision `
    --region us-central1 `
    --update-env-vars "GOOGLE_CLIENT_ID=$CLIENT_ID,GOOGLE_CLIENT_SECRET=$CLIENT_SECRET_PLAIN,GOOGLE_VISION_API_KEY=$VISION_KEY,GOOGLE_GEMINI_API_KEY=$GEMINI_KEY"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSUCCESS! All credentials added!`n" -ForegroundColor Green
    Write-Host "Your app: $SERVICE_URL" -ForegroundColor Cyan
    Write-Host "`nYour app is now fully configured!`n" -ForegroundColor Green
    Write-Host "Test it now: $SERVICE_URL" -ForegroundColor Cyan
} else {
    Write-Host "`nUpdate failed. Check errors above.`n" -ForegroundColor Red
}

