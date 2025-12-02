#!/bin/bash

# OutfitVision - Cloud Run Deployment Script

set -e  # Exit on error

echo "🚀 Starting deployment to Google Cloud Run..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Error: gcloud CLI not found. Please install Google Cloud SDK.${NC}"
    echo "Download from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${YELLOW}⚠️  Not logged in to gcloud.${NC}"
    echo "Please run: gcloud auth login"
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Error: No project set.${NC}"
    echo "Please run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo -e "${GREEN}📦 Project ID: $PROJECT_ID${NC}"

# Check if required APIs are enabled
echo "🔍 Checking required APIs..."
REQUIRED_APIS=(
    "run.googleapis.com"
    "cloudbuild.googleapis.com"
    "vision.googleapis.com"
    "generativelanguage.googleapis.com"
    "firestore.googleapis.com"
)

for API in "${REQUIRED_APIS[@]}"; do
    if ! gcloud services list --enabled --filter="name:$API" --format="value(name)" | grep -q "$API"; then
        echo -e "${YELLOW}⚠️  Enabling $API...${NC}"
        gcloud services enable "$API" --quiet
    fi
done

# Check if Dockerfile exists
if [ ! -f "Dockerfile" ]; then
    echo -e "${RED}❌ Error: Dockerfile not found!${NC}"
    exit 1
fi

# Ask for environment variables
echo ""
echo -e "${YELLOW}📝 Environment Variables Setup${NC}"
echo "You can either:"
echo "1. Enter them now (will be prompted)"
echo "2. Skip and set them manually after deployment"
echo ""
read -p "Enter environment variables now? (y/n): " SET_ENV

ENV_VARS="NODE_ENV=production,PORT=8080"

if [ "$SET_ENV" = "y" ] || [ "$SET_ENV" = "Y" ]; then
    read -p "GOOGLE_CLIENT_ID: " CLIENT_ID
    read -sp "GOOGLE_CLIENT_SECRET: " CLIENT_SECRET
    echo ""
    read -p "GOOGLE_VISION_API_KEY: " VISION_KEY
    read -p "GOOGLE_GEMINI_API_KEY: " GEMINI_KEY
    read -p "GOOGLE_PROJECT_ID (default: $PROJECT_ID): " PROJ_ID
    PROJ_ID=${PROJ_ID:-$PROJECT_ID}
    read -p "FIRESTORE_DATABASE_ID (default: (default)): " DB_ID
    DB_ID=${DB_ID:-"(default)"}
    read -sp "SESSION_SECRET (press enter to generate): " SESSION_SECRET
    echo ""
    
    if [ -z "$SESSION_SECRET" ]; then
        SESSION_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "change-me-in-production")
        echo -e "${GREEN}✅ Generated SESSION_SECRET${NC}"
    fi
    
    ENV_VARS="$ENV_VARS,GOOGLE_CLIENT_ID=$CLIENT_ID,GOOGLE_CLIENT_SECRET=$CLIENT_SECRET,GOOGLE_VISION_API_KEY=$VISION_KEY,GOOGLE_GEMINI_API_KEY=$GEMINI_KEY,GOOGLE_PROJECT_ID=$PROJ_ID,FIRESTORE_DATABASE_ID=$DB_ID,SESSION_SECRET=$SESSION_SECRET"
fi

# Deploy to Cloud Run
echo ""
echo -e "${GREEN}☁️  Deploying to Cloud Run...${NC}"
echo "This may take a few minutes..."

if [ "$SET_ENV" = "y" ] || [ "$SET_ENV" = "Y" ]; then
    gcloud run deploy outfit-vision \
        --source . \
        --platform managed \
        --region us-central1 \
        --allow-unauthenticated \
        --memory 2Gi \
        --cpu 2 \
        --timeout 300 \
        --max-instances 10 \
        --set-env-vars "$ENV_VARS"
else
    gcloud run deploy outfit-vision \
        --source . \
        --platform managed \
        --region us-central1 \
        --allow-unauthenticated \
        --memory 2Gi \
        --cpu 2 \
        --timeout 300 \
        --max-instances 10
fi

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    
    # Get service URL
    SERVICE_URL=$(gcloud run services describe outfit-vision --region us-central1 --format 'value(status.url)' 2>/dev/null)
    
    if [ -n "$SERVICE_URL" ]; then
        echo ""
        echo -e "${GREEN}🌐 Your app URL: $SERVICE_URL${NC}"
        echo ""
        echo -e "${YELLOW}📝 Next steps:${NC}"
        echo "1. Update OAuth redirect URI to: $SERVICE_URL/api/auth/google/callback"
        echo "2. Update CLIENT_URL and GOOGLE_REDIRECT_URI environment variables:"
        echo ""
        echo "   gcloud run services update outfit-vision \\"
        echo "     --region us-central1 \\"
        echo "     --update-env-vars \"CLIENT_URL=$SERVICE_URL,GOOGLE_REDIRECT_URI=$SERVICE_URL/api/auth/google/callback\""
        echo ""
        echo "3. Test your deployment: $SERVICE_URL"
        echo ""
        echo "4. View logs: gcloud run services logs tail outfit-vision --region us-central1"
    else
        echo -e "${YELLOW}⚠️  Could not retrieve service URL. Check Cloud Run console.${NC}"
    fi
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    echo "Check the logs above for errors."
    exit 1
fi

