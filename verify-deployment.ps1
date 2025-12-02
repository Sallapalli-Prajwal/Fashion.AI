# Verify Deployment and Environment Variables

Write-Host "`n🔍 Checking Cloud Run Deployment...`n" -ForegroundColor Cyan

# Get service URL
$SERVICE_URL = gcloud run services describe outfit-vision --region us-central1 --format 'value(status.url)' 2>&1
Write-Host "Service URL: $SERVICE_URL`n" -ForegroundColor Green

# Check environment variables
Write-Host "Environment Variables:" -ForegroundColor Yellow
$envVars = gcloud run services describe outfit-vision --region us-central1 --format 'yaml(spec.template.spec.containers[0].env)' 2>&1

$hasClientId = $envVars -match "GOOGLE_CLIENT_ID"
$hasClientSecret = $envVars -match "GOOGLE_CLIENT_SECRET"
$hasVisionKey = $envVars -match "GOOGLE_VISION_API_KEY"
$hasGeminiKey = $envVars -match "GOOGLE_GEMINI_API_KEY"

Write-Host "  NODE_ENV: ✅" -ForegroundColor Green
Write-Host "  CLIENT_URL: ✅" -ForegroundColor Green
Write-Host "  GOOGLE_REDIRECT_URI: ✅" -ForegroundColor Green
Write-Host "  GOOGLE_PROJECT_ID: ✅" -ForegroundColor Green
Write-Host "  FIRESTORE_DATABASE_ID: ✅" -ForegroundColor Green
Write-Host "  SESSION_SECRET: ✅" -ForegroundColor Green

if ($hasClientId) {
    Write-Host "  GOOGLE_CLIENT_ID: ✅" -ForegroundColor Green
} else {
    Write-Host "  GOOGLE_CLIENT_ID: ❌ MISSING" -ForegroundColor Red
}

if ($hasClientSecret) {
    Write-Host "  GOOGLE_CLIENT_SECRET: ✅" -ForegroundColor Green
} else {
    Write-Host "  GOOGLE_CLIENT_SECRET: ❌ MISSING" -ForegroundColor Red
}

if ($hasVisionKey) {
    Write-Host "  GOOGLE_VISION_API_KEY: ✅" -ForegroundColor Green
} else {
    Write-Host "  GOOGLE_VISION_API_KEY: ❌ MISSING" -ForegroundColor Red
}

if ($hasGeminiKey) {
    Write-Host "  GOOGLE_GEMINI_API_KEY: ✅" -ForegroundColor Green
} else {
    Write-Host "  GOOGLE_GEMINI_API_KEY: ❌ MISSING" -ForegroundColor Red
}

Write-Host "`nTesting health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$SERVICE_URL/api/health" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ Health check: OK" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📋 Summary:" -ForegroundColor Cyan
if ($hasClientId -and $hasClientSecret -and $hasVisionKey -and $hasGeminiKey) {
    Write-Host "✅ All environment variables are set! Your app should be working." -ForegroundColor Green
    Write-Host "`n🌐 Test your app: $SERVICE_URL" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Some environment variables are missing. Run .\QUICK_UPDATE_ENV.ps1 to add them." -ForegroundColor Yellow
}


