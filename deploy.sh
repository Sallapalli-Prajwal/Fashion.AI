#!/bin/bash

# OutfitVision - App Engine Deployment Script

echo "🚀 Starting deployment to Google App Engine..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI not found. Please install Google Cloud SDK."
    exit 1
fi

# Check if logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "⚠️  Not logged in to gcloud. Please run: gcloud auth login"
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: No project set. Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "📦 Project ID: $PROJECT_ID"

# Build frontend
echo "🔨 Building frontend..."
cd client
if ! npm run build; then
    echo "❌ Frontend build failed!"
    exit 1
fi
cd ..

# Check if app.yaml exists
if [ ! -f "app.yaml" ]; then
    echo "❌ Error: app.yaml not found!"
    exit 1
fi

# Deploy to App Engine
echo "☁️  Deploying to App Engine..."
gcloud app deploy app.yaml --quiet

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your app URL: https://$PROJECT_ID.appspot.com"
    echo ""
    echo "📝 Next steps:"
    echo "1. Update OAuth redirect URI to: https://$PROJECT_ID.appspot.com/api/auth/google/callback"
    echo "2. Set environment variables in app.yaml or use Secret Manager"
    echo "3. Test your deployment"
else
    echo "❌ Deployment failed!"
    exit 1
fi

