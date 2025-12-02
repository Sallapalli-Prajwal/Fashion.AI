# OutfitVision - Cloud Run Deployment Script (Windows PowerShell)

Write-Host "🚀 Starting deployment to Google Cloud Run..." -ForegroundColor Cyan

# Check if gcloud is installed
try {
    $gcloudVersion = gcloud --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "gcloud not found"
    }
} catch {
    Write-Host "❌ Error: gcloud CLI not found. Please install Google Cloud SDK." -ForegroundColor Red
    Write-Host "Download from: https://cloud.google.com/sdk/docs/install"
    exit 1
}

# Check if logged in
$activeAccount = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>&1
if (-not $activeAccount) {
    Write-Host "⚠️  Not logged in to gcloud." -ForegroundColor Yellow
    Write-Host "Please run: gcloud auth login"
    exit 1
}

# Get project ID
$projectId = gcloud config get-value project 2>&1
if (-not $projectId -or $projectId -match "ERROR") {
    Write-Host "❌ Error: No project set." -ForegroundColor Red
    Write-Host "Please run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
}

Write-Host "📦 Project ID: $projectId" -ForegroundColor Green

# Check if Dockerfile exists
if (-not (Test-Path "Dockerfile")) {
    Write-Host "❌ Error: Dockerfile not found!" -ForegroundColor Red
    exit 1
}

# Ask for environment variables
Write-Host ""
Write-Host "📝 Environment Variables Setup" -ForegroundColor Yellow
Write-Host "You can either:"
Write-Host "1. Enter them now (will be prompted)"
Write-Host "2. Skip and set them manually after deployment"
Write-Host ""
$setEnv = Read-Host "Enter environment variables now? (y/n)"

$envVars = "NODE_ENV=production,PORT=8080"

if ($setEnv -eq "y" -or $setEnv -eq "Y") {
    $clientId = Read-Host "GOOGLE_CLIENT_ID"
    $clientSecret = Read-Host "GOOGLE_CLIENT_SECRET" -AsSecureString
    $clientSecretPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($clientSecret))
    
    $visionKey = Read-Host "GOOGLE_VISION_API_KEY"
    $geminiKey = Read-Host "GOOGLE_GEMINI_API_KEY"
    $projId = Read-Host "GOOGLE_PROJECT_ID (default: $projectId)"
    if (-not $projId) { $projId = $projectId }
    
    $dbId = Read-Host "FIRESTORE_DATABASE_ID (default: (default))"
    if (-not $dbId) { $dbId = "(default)" }
    
    $sessionSecret = Read-Host "SESSION_SECRET (press enter to generate)" -AsSecureString
    if ($sessionSecret.Length -eq 0) {
        # Generate random session secret
        $bytes = New-Object byte[] 32
        $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
        $rng.GetBytes($bytes)
        $sessionSecretPlain = [Convert]::ToBase64String($bytes)
        Write-Host "✅ Generated SESSION_SECRET" -ForegroundColor Green
    } else {
        $sessionSecretPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sessionSecret))
    }
    
    $envVars = "$envVars,GOOGLE_CLIENT_ID=$clientId,GOOGLE_CLIENT_SECRET=$clientSecretPlain,GOOGLE_VISION_API_KEY=$visionKey,GOOGLE_GEMINI_API_KEY=$geminiKey,GOOGLE_PROJECT_ID=$projId,FIRESTORE_DATABASE_ID=$dbId,SESSION_SECRET=$sessionSecretPlain"
}

# Deploy to Cloud Run
Write-Host ""
Write-Host "☁️  Deploying to Cloud Run..." -ForegroundColor Green
Write-Host "This may take a few minutes..."

if ($setEnv -eq "y" -or $setEnv -eq "Y") {
    gcloud run deploy outfit-vision `
        --source . `
        --platform managed `
        --region us-central1 `
        --allow-unauthenticated `
        --memory 2Gi `
        --cpu 2 `
        --timeout 300 `
        --max-instances 10 `
        --set-env-vars $envVars
} else {
    gcloud run deploy outfit-vision `
        --source . `
        --platform managed `
        --region us-central1 `
        --allow-unauthenticated `
        --memory 2Gi `
        --cpu 2 `
        --timeout 300 `
        --max-instances 10
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    
    # Get service URL
    $serviceUrl = gcloud run services describe outfit-vision --region us-central1 --format 'value(status.url)' 2>&1
    
    if ($serviceUrl -and -not ($serviceUrl -match "ERROR")) {
        Write-Host ""
        Write-Host "🌐 Your app URL: $serviceUrl" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Next steps:" -ForegroundColor Yellow
        Write-Host "1. Update OAuth redirect URI to: $serviceUrl/api/auth/google/callback"
        Write-Host "2. Update CLIENT_URL and GOOGLE_REDIRECT_URI environment variables:"
        Write-Host ""
        Write-Host "   gcloud run services update outfit-vision \"
        Write-Host "     --region us-central1 \"
        Write-Host "     --update-env-vars `"CLIENT_URL=$serviceUrl,GOOGLE_REDIRECT_URI=$serviceUrl/api/auth/google/callback`""
        Write-Host ""
        Write-Host "3. Test your deployment: $serviceUrl"
        Write-Host ""
        Write-Host "4. View logs: gcloud run services logs tail outfit-vision --region us-central1"
    } else {
        Write-Host "⚠️  Could not retrieve service URL. Check Cloud Run console." -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Check the logs above for errors."
    exit 1
}

